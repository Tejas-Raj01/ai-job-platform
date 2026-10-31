import json
import logging
import math
import os
import re
import sqlite3
import uuid
from contextlib import closing
from pathlib import Path
from typing import Any

import httpx
from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pypdf import PdfReader

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATABASE_PATH = os.getenv('DATABASE_PATH', 'data/job_platform.db')
Path(DATABASE_PATH).parent.mkdir(parents=True, exist_ok=True)

app = FastAPI(title='AI Job Platform API', version='1.0.0')
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])


class CustomJobRequest(BaseModel):
    title: str = Field(default='Custom Target Job', max_length=100)
    company: str = Field(default='Target Company', max_length=100)
    jd_text: str = Field(min_length=1)


def connection() -> sqlite3.Connection:
    db = sqlite3.connect(DATABASE_PATH)
    db.row_factory = sqlite3.Row
    return db


def initialize_database() -> None:
    with closing(connection()) as db:
        db.executescript('''
            CREATE TABLE IF NOT EXISTS resumes (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, file_path TEXT NOT NULL, parsed_text TEXT NOT NULL, skills TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
            CREATE TABLE IF NOT EXISTS job_postings (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, company TEXT NOT NULL, description TEXT, url TEXT UNIQUE NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
            CREATE TABLE IF NOT EXISTS analysis_results (id INTEGER PRIMARY KEY AUTOINCREMENT, resume_id INTEGER NOT NULL, job_id INTEGER NOT NULL, match_score REAL NOT NULL, missing_skills TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
        ''')
        db.commit()


@app.on_event('startup')
def startup() -> None:
    initialize_database()


def extract_pdf_text(contents: bytes) -> str:
    temporary_file = Path('/tmp') / f'{uuid.uuid4()}.pdf'
    temporary_file.write_bytes(contents)
    try:
        reader = PdfReader(str(temporary_file))
        return re.sub(r'\s+', ' ', ''.join(page.extract_text() or '' for page in reader.pages)).strip()
    finally:
        temporary_file.unlink(missing_ok=True)


def word_frequencies(text: str) -> dict[str, int]:
    words = re.findall(r'[a-zA-Z0-9]+', text.lower())
    stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
    frequencies: dict[str, int] = {}
    for word in words:
        if word not in stop_words:
            frequencies[word] = frequencies.get(word, 0) + 1
    return frequencies


def similarity(first: str, second: str) -> float:
    left, right = word_frequencies(first), word_frequencies(second)
    keys = set(left) | set(right)
    numerator = sum(left.get(key, 0) * right.get(key, 0) for key in keys)
    denominator = math.sqrt(sum(value * value for value in left.values())) * math.sqrt(sum(value * value for value in right.values()))
    return round(max(0.0, min(1.0, numerator / denominator if denominator else 0.0)) * 100, 2)


def fallback_analysis(resume_text: str, job_text: str) -> dict[str, Any]:
    skills = ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Django', 'FastAPI', 'Java', 'Spring', 'PHP', 'Laravel', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'GraphQL', 'REST API', 'Tailwind', 'Git', 'Linux', 'Unit Testing', 'Machine Learning', 'AI', 'PyTorch', 'TensorFlow', 'NLP', 'LLM']
    missing = [skill for skill in skills if re.search(rf'\b{re.escape(skill)}\b', job_text, re.I) and not re.search(rf'\b{re.escape(skill)}\b', resume_text, re.I)]
    matched = [skill for skill in skills if re.search(rf'\b{re.escape(skill)}\b', job_text, re.I) and re.search(rf'\b{re.escape(skill)}\b', resume_text, re.I)]
    if missing:
        summary = f'Candidate demonstrates technical capability but lacks explicit experience with key requirements: {", ".join(missing[:3])}.'
        recommendations = [f'Add targeted project or experience bullets showcasing {", ".join(missing[:2])}.', f'Include {missing[0]} in the skills summary if you have relevant experience.', 'Quantify achievements with measurable results to highlight technical impact.']
    elif matched:
        summary = 'Strong technical match. The resume covers the core skills and tools specified in this job description.'
        recommendations = ['Highlight recent achievements with specific metrics.', 'Tailor project descriptions to the target role’s business domain.']
    else:
        summary = 'General profile alignment detected. Tailor experience bullets to mirror the job description’s key phrases.'
        recommendations = ['Add measurable outcomes to relevant experience bullets.']
    return {'summary': summary, 'missing_skills': missing[:8], 'recommendations': recommendations}


def groq_analysis(resume_text: str, job_text: str) -> dict[str, Any]:
    api_key = os.getenv('GROQ_API_KEY')
    if not api_key:
        return fallback_analysis(resume_text, job_text)
    prompt = {'model': os.getenv('GROQ_MODEL', 'llama-3.3-70b-versatile'), 'temperature': 0.1, 'response_format': {'type': 'json_object'}, 'messages': [{'role': 'system', 'content': 'Compare the resume and job description. Return only JSON with summary, missing_skills as an array, and recommendations as an array.'}, {'role': 'user', 'content': f'Resume:\n{resume_text[:5000]}\n\nJob description:\n{job_text[:5000]}'}]}
    try:
        response = httpx.post('https://api.groq.com/openai/v1/chat/completions', headers={'Authorization': f'Bearer {api_key}'}, json=prompt, timeout=30)
        response.raise_for_status()
        content = response.json()['choices'][0]['message']['content']
        parsed = json.loads(re.search(r'\{.*\}', content, re.S).group(0))
        return {'summary': str(parsed.get('summary', '')), 'missing_skills': list(parsed.get('missing_skills', [])), 'recommendations': list(parsed.get('recommendations', []))}
    except (httpx.HTTPError, KeyError, AttributeError, json.JSONDecodeError) as error:
        logger.warning('Groq analysis failed: %s', error)
        return fallback_analysis(resume_text, job_text)


def job_match(job: sqlite3.Row, resume_text: str) -> dict[str, Any]:
    description = job['description'] or ''
    return {'job_id': job['id'], 'title': job['title'], 'company': job['company'], 'match_score': similarity(resume_text, description), 'url': job['url'], 'short_description': f'{description[:150]}...' if len(description) > 150 else description}


def seed_jobs(keywords: str) -> list[dict[str, str]]:
    jobs: list[dict[str, str]] = []
    api_key = os.getenv('JSEARCH_API_KEY')
    if api_key:
        try:
            response = httpx.get('https://jsearch.p.rapidapi.com/search', headers={'x-rapidapi-host': 'jsearch.p.rapidapi.com', 'x-rapidapi-key': api_key}, params={'query': keywords, 'page': '1', 'num_pages': '1'}, timeout=15)
            response.raise_for_status()
            for item in response.json().get('data', [])[:15]:
                if item.get('job_description'):
                    jobs.append({'title': item.get('job_title', 'Job Posting')[:100], 'company': item.get('employer_name', 'Unknown Company')[:100], 'description': item['job_description'][:10000], 'url': item.get('job_apply_link', '')})
        except httpx.HTTPError as error:
            logger.warning('JSearch request failed: %s', error)
    if not jobs:
        jobs.append({'title': f'Lead {keywords} Developer', 'company': 'Fallback Startup Inc', 'description': f'Seeking a lead developer with {keywords} experience to build scalable applications. Strong problem-solving skills required.', 'url': 'https://wellfound.com'})
    return jobs


def get_resume(resume_id: int) -> sqlite3.Row:
    with closing(connection()) as db:
        resume = db.execute('SELECT * FROM resumes WHERE id = ?', (resume_id,)).fetchone()
    if not resume:
        raise HTTPException(status_code=404, detail='Resume not found')
    return resume


@app.get('/health')
def health() -> dict[str, str]:
    return {'status': 'ok'}


@app.post('/api/resumes/upload')
def upload_resume(file: UploadFile = File(...), user_id: int = Query(1)) -> dict[str, Any]:
    if file.content_type != 'application/pdf':
        raise HTTPException(status_code=422, detail='Please upload a PDF file.')
    text = extract_pdf_text(file.file.read())
    with closing(connection()) as db:
        cursor = db.execute('INSERT INTO resumes (user_id, file_path, parsed_text, skills) VALUES (?, ?, ?, ?)', (user_id, file.filename or 'resume.pdf', text, 'Parsed from PDF'))
        db.commit()
        resume_id = cursor.lastrowid
    return {'resume_id': resume_id, 'filename': file.filename, 'message': 'Resume uploaded successfully'}


@app.post('/api/resumes/{resume_id}/analyze-and-fetch')
def analyze_and_fetch(resume_id: int) -> dict[str, list[dict[str, Any]]]:
    resume = get_resume(resume_id)
    keywords = 'Software Engineer'
    jobs = seed_jobs(keywords)
    with closing(connection()) as db:
        for job in jobs:
            db.execute('INSERT OR IGNORE INTO job_postings (title, company, description, url) VALUES (?, ?, ?, ?)', (job['title'], job['company'], job['description'], job['url']))
        db.commit()
        rows = db.execute('SELECT * FROM job_postings ORDER BY id DESC LIMIT 50').fetchall()
    return {'matches': sorted([job_match(row, resume['parsed_text']) for row in rows], key=lambda item: item['match_score'], reverse=True)[:10]}


@app.post('/api/resumes/match')
def match_resume(resume_id: int = Query(...), job_id: int = Query(...)) -> dict[str, Any]:
    resume = get_resume(resume_id)
    with closing(connection()) as db:
        job = db.execute('SELECT * FROM job_postings WHERE id = ?', (job_id,)).fetchone()
    if not job:
        raise HTTPException(status_code=404, detail='Job not found')
    score = similarity(resume['parsed_text'], job['description'] or '')
    gaps = groq_analysis(resume['parsed_text'], job['description'] or '')
    with closing(connection()) as db:
        cursor = db.execute('INSERT INTO analysis_results (resume_id, job_id, match_score, missing_skills) VALUES (?, ?, ?, ?)', (resume_id, job_id, score, json.dumps(gaps['missing_skills'])))
        db.commit()
    return {'analysis_id': cursor.lastrowid, 'match_score': score, **gaps}


@app.post('/api/resumes/{resume_id}/match_custom')
def match_custom(resume_id: int, request: CustomJobRequest) -> dict[str, list[dict[str, Any]]]:
    resume = get_resume(resume_id)
    url = f'custom-paste-{uuid.uuid4()}'
    with closing(connection()) as db:
        cursor = db.execute('INSERT INTO job_postings (title, company, description, url) VALUES (?, ?, ?, ?)', (request.title, request.company, request.jd_text, url))
        db.commit()
        job_id = cursor.lastrowid
    return {'matches': [{'job_id': job_id, 'title': request.title, 'company': request.company, 'match_score': similarity(resume['parsed_text'], request.jd_text), 'url': url, 'short_description': f'{request.jd_text[:150]}...'}]}


@app.get('/api/jobs')
def list_jobs() -> list[dict[str, Any]]:
    with closing(connection()) as db:
        return [dict(row) for row in db.execute('SELECT * FROM job_postings ORDER BY id DESC').fetchall()]

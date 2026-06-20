import requests
from bs4 import BeautifulSoup
from app.worker.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.domain import JobPosting

@celery_app.task(bind=True, name="scrape_jobs")
def scrape_jobs_task(self):
    """
    Scrapes 'Software Engineering Intern' or related jobs and saves them to DB.
    We use a public sandbox job board for demonstration.
    """
    url = "https://realpython.github.io/fake-jobs/"
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")
        
        job_cards = soup.find_all("div", class_="card-content")
        jobs_saved = 0
        
        db = SessionLocal()
        try:
            for card in job_cards:
                title_elem = card.find("h2", class_="title")
                company_elem = card.find("h3", class_="company")
                link_elem = card.find_all("a")[1] if len(card.find_all("a")) > 1 else None
                
                if title_elem and company_elem and link_elem:
                    title = title_elem.text.strip()
                    company = company_elem.text.strip()
                    job_url = link_elem["href"]
                    
                    # Optional: Fetch description from job_url
                    # For performance in this demo, we'll assign a dummy description
                    # or just fetch it.
                    desc = f"Software Engineering Role at {company}."
                    
                    # Check if already exists
                    exists = db.query(JobPosting).filter(JobPosting.url == job_url).first()
                    if not exists:
                        new_job = JobPosting(
                            title=title,
                            company=company,
                            description=desc,
                            url=job_url
                        )
                        db.add(new_job)
                        jobs_saved += 1
            db.commit()
            return {"status": "success", "jobs_saved": jobs_saved}
        finally:
            db.close()
    except Exception as e:
        return {"status": "error", "message": str(e)}

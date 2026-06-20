from app.models.domain import User, Resume, JobPosting, AnalysisResult

def test_crud_user(db_session):
    new_user = User(email="test@example.com", name="Test User")
    db_session.add(new_user)
    db_session.commit()
    db_session.refresh(new_user)
    assert new_user.id is not None
    assert new_user.email == "test@example.com"

def test_crud_resume(db_session):
    user = db_session.query(User).first()
    new_resume = Resume(user_id=user.id, file_path="/fake/path.pdf", parsed_text="Python, React", skills="Python,React")
    db_session.add(new_resume)
    db_session.commit()
    db_session.refresh(new_resume)
    assert new_resume.id is not None
    assert new_resume.parsed_text == "Python, React"

def test_crud_job_posting(db_session):
    new_job = JobPosting(title="Software Engineer", company="Tech Corp", description="Need Python dev", url="http://example.com/job1")
    db_session.add(new_job)
    db_session.commit()
    db_session.refresh(new_job)
    assert new_job.id is not None
    assert new_job.title == "Software Engineer"

def test_crud_analysis_result(db_session):
    resume = db_session.query(Resume).first()
    job = db_session.query(JobPosting).first()
    analysis = AnalysisResult(resume_id=resume.id, job_id=job.id, match_score=85.5, missing_skills="Docker")
    db_session.add(analysis)
    db_session.commit()
    db_session.refresh(analysis)
    assert analysis.id is not None
    assert analysis.match_score == 85.5

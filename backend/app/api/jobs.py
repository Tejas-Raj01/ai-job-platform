from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.domain import JobPosting
from app.worker.tasks import scrape_jobs_task
from celery.result import AsyncResult

router = APIRouter()

@router.post("/scrape")
def trigger_scraping():
    """Trigger the async job scraping task."""
    task = scrape_jobs_task.delay()
    return {"task_id": task.id, "message": "Scraping started"}

@router.get("/scrape/{task_id}")
def get_scraping_status(task_id: str):
    """Check the status of a scraping task."""
    task_result = AsyncResult(task_id)
    result = {
        "task_id": task_id,
        "task_status": task_result.status,
        "task_result": task_result.result if task_result.ready() else None
    }
    return result

@router.get("/")
def get_jobs(db: Session = Depends(get_db)):
    """List all available jobs."""
    jobs = db.query(JobPosting).all()
    return jobs

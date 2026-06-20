from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI Job Platform API (V2)",
    description="Backend with PostgreSQL, Celery, and Vector DB"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev, adjust in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "2.0"}

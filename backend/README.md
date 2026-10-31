# Python Backend

The API uses FastAPI and SQLite by default for local development. Set `DATABASE_PATH` to choose another SQLite location. `GROQ_API_KEY` and `JSEARCH_API_KEY` enable the optional AI analysis and live job providers.

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Run the backend tests with:

```bash
python -m pytest
```

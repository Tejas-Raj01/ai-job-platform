# AI-Powered Job Matching & Web Scraping Platform

An end-to-end, high-performance platform designed to parse PDF resumes, match candidates with scraped job postings using hybrid AI vector search & LLM analytics, and provide detailed resume gap analysis.

---

## 🏗️ System Architecture

- **Frontend**: React 19 (Vite), Tailwind CSS v3, Framer Motion, Lucide Icons
- **Backend API**: FastAPI (Python 3.12), SQLite, RESTful JSON endpoints
- **Database**: SQLite by default, configurable with `DATABASE_PATH`
- **AI / NLP Engine**: 
  - **LLM Provider**: Integration with Groq LLM APIs utilizing dynamic model discovery and multi-model auto-fallback chains for structured JSON resume gap analysis.
  - **Semantic Vector Scoring**: Term Frequency (TF) Cosine Similarity vector matching engine
- **Parsing & Scraping**: HTTPX for job search and pypdf for resume extraction.

---

## ✨ Key Features

1. **PDF Resume Parsing**: Seamless drag-and-drop PDF upload with pypdf for resume extraction.
2. **Hybrid AI Matchmaking**: Combines Term Frequency (TF) Cosine Similarity vector matching engine with LLM evaluation to provide precise percentage match scores.
3. **AI Gap Analysis & Resume Recommendations**: Integration with Groq LLM APIs utilizing dynamic model discovery and multi-model auto-fallback chains for structured JSON resume gap analysis.
4. **Custom Job Description Comparison**: Compare uploaded resumes directly against arbitrary user-provided job descriptions.
5. **Provider Fallbacks**: Local matching and fallback job data keep the workflow usable without optional provider keys.
6. **Modern Immersive Dashboard**: Modern bento-grid layout featuring responsive design, dark mode aesthetics, dynamic progress rings, and smooth micro-animations.

---

## 🛠️ Project Structure

```text
ai-job-platform/
├── backend/                  # FastAPI Python application
│   ├── main.py               # API routes, matching, parsing, and provider clients
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile
├── frontend/                 # React + TypeScript (Vite) application
│   ├── src/
│   │   ├── components/       # Typed dashboard and upload components
│   │   ├── types.ts          # Shared API models
│   │   └── App.tsx           # Main UI container
│   └── tailwind.config.js    # Styling design system
├── docker-compose.yml        # Orchestration for FastAPI and Vite
└── features.md               # Technical blueprint & feature targets
```

---

## 🚀 Getting Started

### Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose
- Groq API Key (from [Groq Console](https://console.groq.com/))

### Running with Docker Compose (Recommended)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Tejas-Raj01/ai-job-platform.git
   cd ai-job-platform
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` (or set environment variables):
   ```bash
   cp .env.example .env
   ```
   Add your `GROQ_API_KEY` to the `.env` file:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

3. **Launch all services**:
   ```bash
   docker-compose up -d --build
   ```

4. **Access the application**:
   - **Frontend UI**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:8000/api](http://localhost:8000/api)

---

## 💻 Local Development Setup

### Backend (Python)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port=8000
```

### Frontend (React / TypeScript / Vite)
```bash
cd frontend
npm install
npm run dev
```


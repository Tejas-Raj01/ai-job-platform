# AI-Powered Job Matching & Web Scraping Platform

An end-to-end, high-performance platform designed to parse PDF resumes, match candidates with scraped job postings using hybrid AI vector search & LLM analytics, and provide detailed resume gap analysis.

---

## 🏗️ System Architecture

- **Frontend**: React 19 (Vite), Tailwind CSS v3, Framer Motion, Lucide Icons
- **Backend API**: Laravel 11/13 (PHP 8.3+), Eloquent ORM, RESTful JSON Endpoints
- **Database**: PostgreSQL 15
- **Async Processing & Queues**: Laravel Queues with Redis 7 driver
- **AI / NLP Engine**: 
  - **LLM Provider**: Groq API (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, Mixtral) with automatic model fallback chains
  - **Semantic Vector Scoring**: Hybrid TF-IDF keyword extraction & Cosine Similarity vector matching
- **PDF Extraction**: `smalot/pdfparser`
- **Web Scraping**: Symfony DomCrawler & Guzzle HTTP background worker jobs

---

## ✨ Key Features

1. **PDF Resume Parsing**: Seamless drag-and-drop PDF upload with robust text extraction (supports files up to 64MB).
2. **Hybrid AI Matchmaking**: Combines TF-IDF vector space model with LLM evaluation to provide precise percentage match scores.
3. **AI Gap Analysis & Resume Recommendations**: Generates actionable feedback identifying missing skills, experience gaps, and bullet point enhancements.
4. **Custom Job Description Comparison**: Compare uploaded resumes directly against arbitrary user-provided job descriptions.
5. **Asynchronous Web Scraping**: Background worker queues that scrape and ingest job listings without blocking main thread execution.
6. **Modern Immersive Dashboard**: Modern bento-grid layout featuring responsive design, dark mode aesthetics, dynamic progress rings, and smooth micro-animations.

---

## 🛠️ Project Structure

```text
ai-job-platform/
├── backend/                  # Laravel REST API application
│   ├── app/
│   │   ├── Http/Controllers/ # Resume & Job endpoints
│   │   ├── Jobs/             # Background web scraping jobs
│   │   ├── Models/           # Eloquent Models (User, Resume, JobPosting)
│   │   └── Services/         # AiMatcherService, JobSearcherService, PdfParserService
│   ├── database/             # Migrations & schema definitions
│   └── routes/api.php        # API Route definitions
├── frontend/                 # React (Vite) application
│   ├── src/
│   │   ├── components/       # Bento grid dashboard, dropzone, match rings
│   │   └── App.jsx           # Main UI container
│   └── tailwind.config.js    # Styling design system
├── docker-compose.yml        # Orchestration for PostgreSQL, Redis, Laravel, Queue Worker & Vite
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

### Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve --port=8000
```

### Frontend (React / Vite)
```bash
cd frontend
npm install
npm run dev
```


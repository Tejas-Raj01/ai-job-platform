# AI-Powered Job Matching & Web Scraping Platform

An end-to-end, high-performance platform designed to parse PDF resumes, match candidates with scraped job postings using hybrid AI vector search & LLM analytics, and provide detailed resume gap analysis.

---

## 🏗️ System Architecture

- **Frontend**: React 19 (Vite), Tailwind CSS v3, Framer Motion, Lucide Icons
- **Backend API**: Laravel 13 (PHP 8.3), Eloquent ORM, RESTful JSON Endpoints
- **Database**: PostgreSQL 15
- **Async Processing & Queues**: Asynchronous background job processing utilizing Laravel Queues and Redis 7 to ensure non-blocking REST API responses.
- **AI / NLP Engine**: 
  - **LLM Provider**: Integration with Groq LLM APIs utilizing dynamic model discovery and multi-model auto-fallback chains for structured JSON resume gap analysis.
  - **Semantic Vector Scoring**: Term Frequency (TF) Cosine Similarity vector matching engine
- **Parsing & Scraping**: Symfony DomCrawler for job scraping and Smalot PDF parser for resume extraction.

---

## ✨ Key Features

1. **PDF Resume Parsing**: Seamless drag-and-drop PDF upload with Smalot PDF parser for resume extraction.
2. **Hybrid AI Matchmaking**: Combines Term Frequency (TF) Cosine Similarity vector matching engine with LLM evaluation to provide precise percentage match scores.
3. **AI Gap Analysis & Resume Recommendations**: Integration with Groq LLM APIs utilizing dynamic model discovery and multi-model auto-fallback chains for structured JSON resume gap analysis.
4. **Custom Job Description Comparison**: Compare uploaded resumes directly against arbitrary user-provided job descriptions.
5. **Asynchronous Background Job Processing**: Asynchronous background job processing utilizing Laravel Queues and Redis to ensure non-blocking REST API responses.
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


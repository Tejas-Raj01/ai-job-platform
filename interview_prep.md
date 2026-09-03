# Interview Preparation Guide - AI Job Platform (NexusMatch)

This document contains the complete technical walkthrough and Q&A notes for interview preparation.

---

## 🏗️ 1. End-to-End System Walkthrough

```
[ PDF Resume ] ──> (1) Smalot Parser ──> [ Text Extraction ]
                                                │
                                                ▼
[ Groq LLM ] <── (2) Keyword Extraction <── [ Parsed Resume ]
      │                                         │
      ▼                                         ▼
[ DomCrawler Scraper ]                  (3) Vector Matcher (TF Cosine)
      │                                         │
      └───> [ Job Postings ] <──────────────────┘
                                │
                                ▼
                     (4) Groq LLM Gap Analysis
                      (Fallback: Rule Taxonomy)
                                │
                                ▼
                     (5) React Bento Dashboard
```

### Step 1: Resume Upload & Text Extraction Pipeline
- **Frontend**: `FileUpload.jsx` sends `FormData` (PDF file + `user_id`) via `POST` to `/api/resumes/upload`.
- **Backend Controller**: `ResumeController::upload()` validates the upload.
- **Service**: `PdfParserService` utilizes `Smalot\PdfParser\Parser` to parse binary PDF stream and extract raw text (`parsed_text`).
- **Storage & State**: Saves to PostgreSQL `resumes` table. Returns `resume_id` which the frontend persists in `localStorage`.
- **Key Pitch**: Separates parsing from AI processing to return response in <200ms without blocking.

### Step 2: Dynamic Keyword Extraction & Web Mining
- **Backend Flow**: `ResumeController::analyzeAndFetch()` triggers `AiMatcherService::extractSearchKeywords()`.
- **LLM Search Compression**: Prompts Groq LLM (`llama-3.3-70b-versatile`) to compress unstructured resume text into a 4-5 word target search query (e.g., `"Senior React Developer"`).
- **Web Scraping**: `JobSearcherService` uses `Symfony DomCrawler` to mine online job boards asynchronously.
- **Deduplication**: Saves jobs in `job_postings` using `firstOrCreate(['url' => $url])`.

### Step 3: Hybrid AI Vector Scoring Engine
- **Algorithm**: Term Frequency (TF) Cosine Similarity Vector Matching.
- **Processing**:
  1. Strips stop words (`the`, `and`, `in`, etc.) and normalizes text.
  2. Builds term frequency vectors $\mathbf{v_1}$ (resume) and $\mathbf{v_2}$ (job description).
  3. Calculates Cosine Similarity:
     $$\text{Similarity} = \frac{\mathbf{v_1} \cdot \mathbf{v_2}}{\|\mathbf{v_1}\| \|\mathbf{v_2}\|} \times 100$$
- **Key Pitch**: Two-tier architecture: $O(N)$ local vector filtering ranks candidate jobs instantly before calling heavy LLM APIs.

### Step 4: Multi-Model LLM Gap Analysis & Resilient Fallback Engine
- **Dynamic Model Discovery**: `getActiveGroqModels()` queries Groq `/models` to auto-discover active text models (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `llama-3.1-70b-versatile`, `gemma2-9b-it`).
- **Structured JSON Schema**: Prompts LLM for JSON matching `{ summary, missing_skills, recommendations }`.
- **Cascading Fallback Chain**: If primary LLM model fails/rate-limits, `executeWithFallback()` cascades down the model list.
- **Rule-Based Fallback Engine**: If all LLM APIs fail, `fallbackGapAnalysis()` uses regex technical taxonomy matching (60+ tools/frameworks) to guarantee 100% service uptime.

### Step 5: Interactive Bento-Grid Dashboard
- **Frontend Stack**: React 19, Framer Motion, Tailwind CSS, Lucide Icons.
- **Visual Features**: Dynamic SVG Match Ring (color-coded by fit percentage), Executive Summary Card, Missing Skills Pill Tags, and Step-by-Step Actionable Recommendations.

---

## 💬 2. Interview Q&A Repository

*(New questions and answers will be continuously appended below)*

### Q1: Why did you choose Laravel + React instead of a unified framework like Next.js?
**Answer**:
We separated the high-concurrency backend API handling from the client UI for modularity and scalability:
- **Backend (Laravel 13)**: Provides robust Eloquent ORM, built-in queue system for asynchronous web scraping jobs, and efficient integration with PHP PDF parsing libraries.
- **Frontend (React 19 + Vite)**: Delivers an ultra-responsive single-page app (SPA) experience with custom Framer Motion micro-animations, background glassmorphism, and instant state updates.

---

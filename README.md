# ASX Announcement Analysis

This project provides a full-stack solution for scraping, analyzing, and presenting ASX (Australian Securities Exchange) announcements using FastAPI for the backend and Vite/React with Material-UI for the frontend. It leverages the OpenAI API for natural language processing and analysis.

---

## Features

* **Web Scraper**: Automatically fetches ASX announcements via Selenium and saves them as PDFs.
* **Analyzer**: Uses OpenAI API to generate structured summaries, impact types, durations, and investment advice.
* **Data Merge**: Combines raw scraped data and analysis results into a unified CSV (`announcements.csv`).
* **API Endpoints**:

  * `GET /healthz` – Health check endpoint.
  * `GET /announcements` – Retrieve raw announcement data.
  * `POST /api/analyze` – Run analysis on announcements via OpenAI.
* **Frontend**: Interactive React application with:

  * Announcement listing and details.
  * Filters by category and sentiment.
  * Material-UI DataGrid for rich data display.

---

## Tech Stack

* **Backend**: FastAPI, Uvicorn, Selenium, Python-dotenv, OpenAI Python SDK
* **Frontend**: Vite, React, TypeScript, Material-UI (MUI), React Router
* **Infrastructure**: Vercel for deployment (frontend & backend separated), GitHub for source control

---

## Prerequisites

* Python 3.9+
* Node.js 16+
* Git
* OpenAI account and API key

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Hang52z/ASX_Analysis.git
cd ASX_Analysis
```

### 2. Setup environment variables

Create a `.env` file in the project root with:

```bash
OPENAI_API_KEY=sk-...  # Your OpenAI API key
VITE_API_BASE_URL=http://localhost:8000  # Backend URL for frontend
```

### 3. Backend Setup

```bash
cd backend
python -m venv .venv
# Windows: .\.venv\Scripts\activate
# Linux/Mac: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend will start on `http://127.0.0.1:8000`.

### 4. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

Frontend will run at `http://localhost:5173`.

---

## Usage

1. Access the frontend at `http://localhost:5173`.
2. Browse the list of ASX announcements, filter by category or sentiment.
3. Trigger analysis to get summaries and investment advice powered by OpenAI.

---

## Deployment

### Vercel Configuration

1. **Backend**: Create a Vercel project with `Root Directory` set to `backend`. Add `OPENAI_API_KEY` as an environment variable.
2. **Frontend**: Create another Vercel project with `Root Directory` set to `frontend`. Add `VITE_API_BASE_URL` pointing to your backend URL.

---

## License

This project is open-source and available under the MIT License.

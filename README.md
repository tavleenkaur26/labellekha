# LabelLekha

Legal Metrology compliance scanner built for **Smart India Hackathon 2026 (PS26034)**, sponsored by the **Department of Consumer Affairs, Ministry of Consumer Affairs, Food & Public Distribution**.

**Live App:** [labellekha.vercel.app](https://labellekha.vercel.app)  

## Problem

Packaged commodities sold in India must carry mandatory declarations under the Legal Metrology (Packaged Commodities) Rules, 2011, including manufacturer details, net quantity, MRP, date of manufacture, and consumer-care information.

Compliance checking is currently manual, slow, and inconsistent, with no systematic way to identify recurring violations across brands, categories, or regions.

## What LabelLekha Does

LabelLekha scans a product-label image, extracts its text using OCR, and checks it against specific clauses of the Legal Metrology Rules:

- **Rule 6(1)(a):** Manufacturer, packer, or importer details
- **Rule 6(1)(b):** Common or generic name of the commodity
- **Rule 6(1)(c):** Net quantity
- **Rule 6(1)(d):** Month and year of manufacture or packing
- **Rule 6(1)(e):** Retail sale price (MRP)
- **Rule 6(2):** Consumer-complaint contact
- **Rule 7:** Letter-height and font-size requirements *(approximate, uncalibrated estimate only)*

Each result is tied to the relevant clause and the extracted text supporting it. Low-confidence extractions are flagged for human review instead of being treated as a pass or failure.

With the user's consent, scans contribute to a dashboard that surfaces recurring violations by brand, category, and region.

> LabelLekha produces preliminary findings to support inspection and review. It does not make final legal or enforcement decisions. Those remain with authorized Legal Metrology officers.

Both inspectors and consumers can submit scans. The dashboard is role-aware:

- **Inspectors** can view aggregate analytics, violation trends, priority queues, and category, brand, and region breakdowns.
- **Consumers** can view only their own scan history and results.

## Project Structure

```text
app/                    Backend (FastAPI)
├── routes/             API route handlers
├── models.py           Database models
├── schemas.py          Request/response schemas
├── auth.py             Authentication and session handling
├── database.py         Database connection setup
├── report_adapter.py   Converts a Scan row into report input
├── report_generator.py PDF/CSV report rendering
└── main.py             Application entry point and CORS configuration

frontend/               Frontend (React + Vite + TypeScript)
└── src/
    ├── components/     Shared UI components
    ├── pages/          Dashboard, scan, results, and report pages
    ├── utils/          API client and helper functions
    └── types.ts        Shared TypeScript types

ocr/                    OCR extraction module
└── extract.py          Image preprocessing and text extraction

rule-engine/            Compliance rule engine
└── rule_engine.py      Clause-by-clause compliance checks

Dockerfile              Backend container definition for Render
```

## Tech Stack

- **Backend:** FastAPI, SQLAlchemy
- **Frontend:** React, Vite, TypeScript, Tailwind CSS
- **OCR:** Tesseract via `pytesseract`, OpenCV
- **Reports:** WeasyPrint, CSV export
- **Database:** SQLite *(prototype)*
- **Deployment:** Render (backend), Vercel (frontend)

## Running Locally

### Backend

Install the Python dependencies:

```bash
pip install fastapi uvicorn "bcrypt==4.0.1" sqlalchemy python-jose passlib python-multipart weasyprint pytesseract opencv-python-headless python-dotenv
```

Start the backend from the repository root:

```bash
uvicorn app.main:app --reload --port 8000
```

> Run the command from the repository root, not from inside `app/`, because the rule engine is loaded using a relative path.

Tesseract must also be installed as a system binary. On macOS:

```bash
brew install tesseract
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Create a `.env` file based on `.env.example` and set the backend URL:

```env
VITE_API_BASE_URL=http://localhost:8000
```

[Legal Metrology (Packaged Commodities) Rules, 2011](https://consumeraffairs.gov.in/) — Department of Consumer Affairs, Ministry of Consumer Affairs, Food & Public Distribution, Government of India.

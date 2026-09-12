# Labellekha — Legal Metrology Compliance Platform

A hackathon project that checks product label photos against India's Legal
Metrology (Packaged Commodities) Rules, 2011, using OCR + rule-based
compliance checking. Built for both consumers (quick label checks) and
inspectors (search, audit, and reporting).

## How it works

```
Package photo upload
      │
      ▼
  OCR (Tesseract)  ──────────►  extracted text + font-size metadata
      │
      ▼
Rule Engine (regex-based)  ──►  pass/fail per clause + overall verdict
      │
      ▼
  Database (SQLite)  ─────────► Scan + ScanResult rows saved
      │
      ├──► Search / History (consumer's own scans, inspector cross-search)
      ├──► Dashboard (aggregate stats, most-violated clauses)
      └──► Reports (PDF / CSV, with the original photo embedded)
```

## Project structure

```
labellekha/
├── OCR/                        Role 2 — OCR & text extraction
│   ├── extract.py              extract_text(image) -> text + font metadata
│   └── *.jpg/.jpeg/.JPG        real product photos used for testing
├── rule-engine/                Role 1 — compliance rule checking
│   └── rule_engine.py          check_compliance(text) -> pass/fail per clause
├── app/                        Role 4 — backend, database, auth
│   ├── main.py                 FastAPI app entrypoint
│   ├── models.py                SQLAlchemy models: User, Scan, ScanResult
│   ├── database.py              SQLite connection setup
│   ├── auth.py                  JWT auth, get_current_user/get_current_inspector
│   ├── schemas.py                Pydantic request/response models
│   ├── queries.py                shared query helpers (e.g. get_consented_scans)
│   ├── report_adapter.py        Role 6 — converts a Scan row into report input
│   ├── report_generator.py      Role 6 — PDF/CSV report rendering
│   └── routes/
│       ├── auth_routes.py       Role 4 — register/login
│       ├── scan_routes.py       Role 4 — POST /scans (upload + pipeline)
│       ├── dashboard_routes.py  Role 5 — aggregate stats for inspectors
│       ├── search_routes.py     Role 6 — /scans/my, /scans/search, /scans/{id}
│       └── report_routes.py     Role 6 — /scans/{id}/report (PDF/CSV)
├── seed_real_scans.py           Role 6 — seeds a handful of real test scans
├── batch_generate_all.py        Role 6 — processes every photo in OCR/ automatically
├── add_synthetic_compliant_case.py  Role 6 — adds one labeled synthetic compliant test
├── test_assets/                  synthetic test image for the script above
└── requirements.txt
```

## Setup

### 1. Clone and create a virtual environment
```bash
git clone https://github.com/tavleenkaur26/labellekha.git
cd labellekha
python -m venv venv
```
Activate it:
- Windows (PowerShell): `venv\Scripts\Activate.ps1`
- Mac/Linux: `source venv/bin/activate`

### 2. Install dependencies

> **Known issue:** `requirements.txt` is currently saved in UTF-16 encoding and
> will not install correctly with a plain `pip install -r requirements.txt`.
> Install manually until this is fixed:

```bash
pip install fastapi uvicorn "bcrypt==4.0.1" sqlalchemy python-jose passlib python-multipart weasyprint pytesseract opencv-python-headless
```

The `bcrypt==4.0.1` pin is required — newer `bcrypt` versions break
`passlib`'s password hashing and cause every register/login call to fail
with a 500 error.

### 3. Install system-level dependencies (not Python packages)

- **Tesseract OCR** (the actual program, not just the Python wrapper):
  - Windows: install from https://github.com/UB-Mannheim/tesseract/wiki
  - Mac: `brew install tesseract`
  - Linux: `sudo apt install tesseract-ocr`
  - Verify with `tesseract --version`. If it's not found after installing,
    fully restart your terminal/IDE — PATH changes need a fresh session.

- **GTK3 runtime** (required for WeasyPrint to render PDFs, Windows only):
  - Download from https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer/releases
  - Install, then fully restart your terminal/IDE.

- If you're not on Windows, or installed Tesseract to a non-default path,
  update the hardcoded path in `app/routes/scan_routes.py`
  (`pytesseract.pytesseract.tesseract_cmd`).

### 4. Run it
```bash
uvicorn app.main:app --reload --port 8000
```
Open `http://127.0.0.1:8000/docs` for interactive API testing.

## Getting test data

Real scans require an uploaded photo run through the full pipeline. Three
options, from quickest to most manual:

```bash
python batch_generate_all.py           # processes every photo in OCR/ automatically
python add_synthetic_compliant_case.py # adds one labeled synthetic compliant scan
python seed_real_scans.py              # seeds 4 hand-picked real scans
```

Or upload manually via `POST /scans` in `/docs`.

## API overview

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/auth/register` | POST | none | Create a user |
| `/auth/login` | POST | none | Get a JWT access token |
| `/scans` | POST | user | Upload a photo, runs the full OCR → rule engine pipeline |
| `/scans/my` | GET | user | Caller's own scan history, filterable |
| `/scans/search` | GET | inspector | Cross-user search (consented scans only) |
| `/scans/{id}` | GET | owner or inspector+consent | Full scan detail with all clause results |
| `/scans/{id}/report` | GET | owner or inspector+consent | PDF or CSV report (`?format=pdf\|csv`) |
| `/dashboard/stats` | GET | inspector | Aggregate compliance stats across consented scans |

## Data model notes

- `Scan.overall_status` is `"compliant"` or `"non-compliant"` (not an enum)
- `Scan.needs_human_review` is a separate boolean — expect it to be `true` on
  most scans, since the generic-name check is permanently low-confidence
- `ScanResult.pass_fail` is 3-state: `true` / `false` / `null` (`null` means
  "not evaluated", currently only the font-size check when OCR metadata
  lacks font data)
- `Scan.product_name`, `Scan.brand`, `Scan.category` exist for
  product-level filtering/reporting (recently added — some existing
  Role 6 code predates these fields and may not use them yet)

## Known issues / open items

- `requirements.txt` is UTF-16 encoded and needs regenerating
- Real product photos in `OCR/` currently all come back `non-compliant` when
  run through the pipeline — worth checking whether the rule engine's
  matching is too strict, or the sample photos just don't have every field
  cleanly visible
- Hardcoded Windows Tesseract path in `scan_routes.py` breaks on Mac/Linux
  unless changed locally

## Team

| Role | Area |
|---|---|
| Tavleen | Rule engine (`rule-engine/`) |
| Tanisha | OCR & detection (`OCR/`) |
| Yashi | Frontend scan flow |
| Yashika | Backend, database, auth (`app/main.py`, `models.py`, `auth.py`, `scan_routes.py`) |
| Sharvi | Dashboard & analytics (`dashboard_routes.py`) |
| Trisha | Search, reports & retrieval (`search_routes.py`, `report_routes.py`, `report_generator.py`) |

FROM python:3.11-slim

# System dependencies:
# - tesseract-ocr: the actual OCR engine used by pytesseract
# - libpango/cairo/gdk-pixbuf/etc: required by WeasyPrint to render PDFs
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libcairo2 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    shared-mime-info \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# uploaded_images/ (photos) and compliance.db (SQLite) both live here.
# Mount your host's persistent disk/volume at /app so this survives restarts.
RUN mkdir -p /app/uploaded_images /app/generated_reports

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

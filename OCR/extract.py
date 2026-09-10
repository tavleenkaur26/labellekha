"""
PS26034 — Legal Metrology Compliance Scanner
Role 2: OCR & Detection

extract_text(image) -> str
  Takes an image file path, returns cleaned-up raw OCR text.
  This is the ONLY thing Role 1's check_compliance() needs right now —
  it's a plain string, nothing fancier. Font metadata is a placeholder
  on their end until we build check_font_size() for real, so don't
  worry about returning anything but text yet.

Run this file directly against a test image to see OCR text +
Role 1's compliance result together:
    python extract.py path/to/photo.jpg
"""

import re
import sys
import os
import io

import pytesseract
from PIL import Image

# So this file can import Role 1's rule_engine.py sitting in ../rule-engine
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "rule-engine"))
from rule_engine import check_compliance  # noqa: E402


# ---------------------------------------------------------------------------
# STEP 1: raw OCR call
# ---------------------------------------------------------------------------

def _run_ocr(image_path: str) -> str:
    """Bare Tesseract call, no cleanup. Kept separate so we can swap the
    OCR engine later (e.g. PaddleOCR) without touching extract_text()."""
    img = Image.open(image_path)

    # iPhone photos sometimes save as MPO (multi-picture, used for depth
    # data / portrait mode) even with a .JPG extension. pytesseract only
    # accepts a known format whitelist and MPO isn't on it, so re-encode
    # through an in-memory PNG buffer to guarantee a supported format.
    img = img.convert("RGB")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    img = Image.open(buf)

    return pytesseract.image_to_string(img)


# ---------------------------------------------------------------------------
# STEP 2: cleanup — strip garbage chars, normalize whitespace, fix common
# misreads. Keep this list growing as real photos reveal new patterns.
# ---------------------------------------------------------------------------

def _clean_text(raw: str) -> str:
    text = raw

    # Common OCR misreads worth normalizing (add more as you see them in real data)
    # NOTE: keep these targeted — don't blindly replace 0/O everywhere,
    # it'll break legitimate zeros in prices/quantities.

    # Collapse multiple blank lines / excess whitespace, but keep line breaks
    # (Role 1's regexes generally work fine with them; check with Role 1 if
    # they'd prefer everything flattened to one line).
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = text.strip()

    # Strip stray non-printable / junk characters Tesseract sometimes emits
    text = re.sub(r"[^\x20-\x7E\n₹]", "", text)

    return text


# ---------------------------------------------------------------------------
# MAIN ENTRY POINT — this is what Role 4 (backend) calls
# ---------------------------------------------------------------------------

def extract_text(image_path: str) -> str:
    """Takes an image file path, returns cleaned OCR text as a plain string.
    This return value is passed directly into Role 1's check_compliance()."""
    raw = _run_ocr(image_path)
    return _clean_text(raw)


# ---------------------------------------------------------------------------
# Quick manual test: run `python extract.py path/to/photo.jpg`
# Prints OCR text AND runs it straight through Role 1's check_compliance()
# so you can see the full pipeline working end to end.
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import json

    if len(sys.argv) < 2:
        print("Usage: python extract.py path/to/photo.jpg")
        sys.exit(1)

    path = sys.argv[1]
    text = extract_text(path)

    print("\n--- OCR TEXT ---")
    print(text if text else "(nothing detected — bad photo? blur/glare?)")

    print("\n--- COMPLIANCE RESULT (via Role 1's check_compliance) ---")
    result = check_compliance(text)
    print(json.dumps(result, indent=2))
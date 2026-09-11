"""
Batch-processes EVERY image in OCR/ through the real pipeline (extract_text ->
check_compliance -> save as Scan/ScanResult), then generates a PDF + CSV report
for every scan that completes successfully.

Run this once to get a full, realistic test set with zero manual picking of
which photos to use — whatever's sitting in OCR/ gets processed.

Usage:  python batch_generate_all.py
Output: compliance.db (all scans) + generated_reports/scan_<id>_report.pdf/.csv
"""

import os
import sys
import glob
import importlib.util
import pytesseract

pytesseract.pytesseract.tesseract_cmd = os.environ.get(
    "TESSERACT_CMD", r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)

sys.path.insert(0, ".")

from app.database import Base, engine, SessionLocal
from app.models import User, Scan, ScanResult
from app.auth import hash_password
from app.report_adapter import scan_to_report_dict
from app.report_generator import generate_pdf_report, generate_csv_report
from OCR.extract import extract_text

spec = importlib.util.spec_from_file_location("rule_engine_module", "rule-engine/rule_engine.py")
rule_engine_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rule_engine_module)
check_compliance = rule_engine_module.check_compliance

IMAGE_EXTENSIONS = ("*.jpg", "*.jpeg", "*.JPG", "*.JPEG", "*.png", "*.PNG")
OUTPUT_DIR = "generated_reports"

os.makedirs(OUTPUT_DIR, exist_ok=True)
Base.metadata.create_all(bind=engine)
db = SessionLocal()

# --- one test user for all scans (consent given, so everything is reportable/searchable) ---
user = db.query(User).filter(User.email == "batchtest@test.com").first()
if not user:
    user = User(name="Batch Test User", email="batchtest@test.com",
                hashed_password=hash_password("test1234"), role="user")
    db.add(user)
    db.commit()
    db.refresh(user)

# --- discover every image in OCR/ automatically ---
image_paths = []
for pattern in IMAGE_EXTENSIONS:
    image_paths.extend(glob.glob(os.path.join("OCR", pattern)))
image_paths = sorted(set(image_paths))

print(f"Found {len(image_paths)} real images in OCR/:")
for p in image_paths:
    print(f"  - {p}")
print()

results_summary = []

for image_path in image_paths:
    print(f"Processing {image_path} ...")
    scan = Scan(
        user_id=user.id,
        image_path=image_path,
        status="processing",
        consent_given=True,
        coarse_location="Test Region",
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)

    try:
        ocr_result = extract_text(image_path, return_dict=True)
    except Exception as e:
        scan.status = "error"
        db.commit()
        print(f"  -> OCR crashed: {e}")
        results_summary.append((scan.id, image_path, "OCR_ERROR", None))
        continue

    if ocr_result.get("recapture_needed"):
        scan.status = "recapture_needed"
        db.commit()
        print(f"  -> recapture needed, skipped (report not generated for this one)")
        results_summary.append((scan.id, image_path, "RECAPTURE_NEEDED", None))
        continue

    compliance_result = check_compliance(ocr_result["text"], ocr_metadata=ocr_result)

    for check in compliance_result["checks"]:
        db.add(ScanResult(
            scan_id=scan.id,
            clause=check["clause"],
            title=check.get("title"),
            extracted_text=check.get("evidence"),
            pass_fail=check["pass"],
            confidence=check.get("confidence"),
            note=check.get("note"),
            needs_review=(check.get("confidence") == "low"),
        ))

    scan.status = "done"
    scan.overall_status = compliance_result["overall_status"]
    scan.needs_human_review = compliance_result["needs_human_review"]
    db.commit()
    db.refresh(scan)

    # Reload with results relationship populated, then generate reports immediately
    from sqlalchemy.orm import joinedload
    scan_full = db.query(Scan).options(joinedload(Scan.results)).filter(Scan.id == scan.id).first()
    report_data = scan_to_report_dict(scan_full)

    pdf_path = os.path.join(OUTPUT_DIR, f"scan_{scan.id}_report.pdf")
    csv_path = os.path.join(OUTPUT_DIR, f"scan_{scan.id}_report.csv")
    generate_pdf_report(report_data, pdf_path, base_dir=".")
    generate_csv_report(report_data, csv_path)

    status = compliance_result["overall_status"]
    print(f"  -> scan {scan.id}: {status}, {compliance_result['passed_count']}/{compliance_result['total_checks']} passed -> reports saved")
    results_summary.append((scan.id, image_path, status, f"{compliance_result['passed_count']}/{compliance_result['total_checks']}"))

db.close()

print("\n" + "=" * 70)
print("SUMMARY")
print("=" * 70)
for scan_id, path, status, score in results_summary:
    score_str = f" ({score} passed)" if score else ""
    print(f"  Scan {scan_id}: {os.path.basename(path):20s} -> {status}{score_str}")

done_count = sum(1 for r in results_summary if r[2] not in ("RECAPTURE_NEEDED", "OCR_ERROR"))
print(f"\n{done_count} of {len(results_summary)} images produced a full report.")
print(f"Reports saved in ./{OUTPUT_DIR}/")

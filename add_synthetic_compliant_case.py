"""
Adds ONE clearly-labeled SYNTHETIC scan to compliance.db, using hand-typed
clean label text (bypassing OCR entirely) run through the REAL check_compliance().

Why this exists: real photos in OCR/ all came back non-compliant when run
through batch_generate_all.py (real labels rarely have every field cleanly
readable). This script exists purely to prove the fully-compliant report
path renders correctly -- it is NOT a real scan and is marked as such
everywhere (coarse_location, filename) so it's never confused with real data.

Run this AFTER batch_generate_all.py.
"""

import os
import sys
import importlib.util

sys.path.insert(0, ".")

from app.database import SessionLocal
from app.models import User, Scan, ScanResult
from app.auth import hash_password
from app.report_adapter import scan_to_report_dict
from app.report_generator import generate_pdf_report, generate_csv_report

spec = importlib.util.spec_from_file_location("rule_engine_module", "rule-engine/rule_engine.py")
rule_engine_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rule_engine_module)
check_compliance = rule_engine_module.check_compliance

OUTPUT_DIR = "generated_reports"
os.makedirs(OUTPUT_DIR, exist_ok=True)

db = SessionLocal()

user = db.query(User).filter(User.email == "batchtest@test.com").first()
if not user:
    user = User(name="Batch Test User", email="batchtest@test.com",
                hashed_password=hash_password("test1234"), role="user")
    db.add(user)
    db.commit()
    db.refresh(user)

# Clean, hand-typed label text -- NOT from a real photo, NOT from OCR
CLEAN_TEXT = (
    "Marketed by: ABC Foods Pvt Ltd, Sector 5, Gurugram\n"
    "Net Wt. 200g\n"
    "MRP Rs.85 incl. of all taxes\n"
    "Mfg Date: 03/2026\n"
    "Customer Care: 1800-123-4567, care@abcfoods.com"
)

compliance_result = check_compliance(CLEAN_TEXT)  # no ocr_metadata -- this is not real OCR output

scan = Scan(
    user_id=user.id,
    image_path="test_assets/synthetic_compliant_label.jpg",
    status="done",
    consent_given=True,
    coarse_location="SYNTHETIC TEST DATA -- not a real scan",
    overall_status=compliance_result["overall_status"],
    needs_human_review=compliance_result["needs_human_review"],
)
db.add(scan)
db.commit()
db.refresh(scan)

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
db.commit()

from sqlalchemy.orm import joinedload
scan_full = db.query(Scan).options(joinedload(Scan.results)).filter(Scan.id == scan.id).first()
report_data = scan_to_report_dict(scan_full)

pdf_path = os.path.join(OUTPUT_DIR, f"scan_{scan.id}_SYNTHETIC_report.pdf")
csv_path = os.path.join(OUTPUT_DIR, f"scan_{scan.id}_SYNTHETIC_report.csv")
generate_pdf_report(report_data, pdf_path, base_dir=".")
generate_csv_report(report_data, csv_path)

db.close()

print(f"Synthetic scan {scan.id}: {compliance_result['overall_status']}, "
      f"{compliance_result['passed_count']}/{compliance_result['total_checks']} passed")
print(f"Reports saved as {pdf_path} and {csv_path}")
print("This scan is clearly marked SYNTHETIC in the filename and coarse_location field.")

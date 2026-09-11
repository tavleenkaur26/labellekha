"""
Seeds compliance.db with REAL scans, processed through the actual pipeline:
real product photo -> Role 2's extract_text() -> Role 1's check_compliance()
-> saved as real Scan + ScanResult rows via Role 4's models.py.

This mimics exactly what routes/scan_routes.py does, minus the HTTP layer,
so we have genuine end-to-end test data for Role 6's search/report endpoints.
"""
import sys
import importlib.util
import pytesseract

pytesseract.pytesseract.tesseract_cmd = "/usr/bin/tesseract"

sys.path.insert(0, ".")

from app.database import Base, engine, SessionLocal
from app.models import User, Scan, ScanResult
from app.auth import hash_password
from OCR.extract import extract_text

# Load rule_engine.py the same way scan_routes.py does
spec = importlib.util.spec_from_file_location("rule_engine_module", "rule-engine/rule_engine.py")
rule_engine_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rule_engine_module)
check_compliance = rule_engine_module.check_compliance

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# --- Create test users (consumer + inspector) ---
consumer = db.query(User).filter(User.email == "consumer@test.com").first()
if not consumer:
    consumer = User(name="Test Consumer", email="consumer@test.com",
                     hashed_password=hash_password("test1234"), role="user")
    db.add(consumer)
    db.commit()
    db.refresh(consumer)

inspector = db.query(User).filter(User.email == "inspector@test.com").first()
if not inspector:
    inspector = User(name="Test Inspector", email="inspector@test.com",
                      hashed_password=hash_password("test1234"), role="inspector")
    db.add(inspector)
    db.commit()
    db.refresh(inspector)

# --- Real photos to process through the REAL pipeline ---
REAL_PHOTOS = [
    ("OCR/maggi.jpg", consumer, "Gurugram, Haryana", True),
    ("OCR/thumsup.jpg", consumer, "Pune, Maharashtra", True),
    ("OCR/vaseline.jpg", inspector, "Delhi", True),
    ("OCR/veet.jpeg", consumer, None, False),  # no consent -> should be excluded from get_consented_scans()
]

for image_path, user, location, consent in REAL_PHOTOS:
    print(f"Processing {image_path} ...")
    new_scan = Scan(
        user_id=user.id,
        image_path=image_path,
        status="processing",
        consent_given=consent,
        coarse_location=location,
    )
    db.add(new_scan)
    db.commit()
    db.refresh(new_scan)

    ocr_result = extract_text(image_path, return_dict=True)

    if ocr_result["recapture_needed"]:
        new_scan.status = "recapture_needed"
        db.commit()
        print(f"  -> recapture needed, skipped compliance check")
        continue

    compliance_result = check_compliance(ocr_result["text"], ocr_metadata=ocr_result)

    for check in compliance_result["checks"]:
        db.add(ScanResult(
            scan_id=new_scan.id,
            clause=check["clause"],
            title=check.get("title"),
            extracted_text=check.get("evidence"),
            pass_fail=check["pass"],
            confidence=check.get("confidence"),
            note=check.get("note"),
            needs_review=(check.get("confidence") == "low"),
        ))

    new_scan.status = "done"
    new_scan.overall_status = compliance_result["overall_status"]
    new_scan.needs_human_review = compliance_result["needs_human_review"]
    db.commit()
    print(f"  -> scan {new_scan.id}: {compliance_result['overall_status']}, "
          f"{compliance_result['passed_count']}/{compliance_result['total_checks']} passed, "
          f"consent={consent}")

db.close()
print("\nSeeding complete.")

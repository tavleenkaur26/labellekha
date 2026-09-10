import shutil
import os
from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Scan
from app.schemas import ScanCreateResponse
from app.models import Scan, ScanResult

router = APIRouter()

UPLOAD_DIR = "uploaded_images"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/scans", response_model=ScanCreateResponse)
def create_scan(
    image: UploadFile = File(...),
    consent_given: bool = Form(...),
    coarse_location: str = Form(None),
    db: Session = Depends(get_db),
):
    # Save the uploaded image to disk
    image_path = os.path.join(UPLOAD_DIR, image.filename)
    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    # Create the scan row first, so we have an ID even if OCR fails
    new_scan = Scan(
        user_id=1,  # TODO: replace with real logged-in user once auth (Step 4) is wired in
        image_path=image_path,
        status="processing",
        consent_given=consent_given,
        coarse_location=coarse_location,
    )
    db.add(new_scan)
    db.commit()
    db.refresh(new_scan)

        # --- Role 2's OCR pipeline ---
    from OCR.extract import extract_text

    ocr_result = extract_text(image_path, return_dict=True)

    if ocr_result["recapture_needed"]:
        new_scan.status = "recapture_needed"
        db.commit()
        return ScanCreateResponse(
            scan_id=new_scan.id,
            status="recapture_needed",
            message=ocr_result["message"],
        )

    # --- Role 1's rule engine ---
    from rule_engine.rule_engine import check_compliance

    compliance_result = check_compliance(ocr_result["text"], ocr_metadata=ocr_result)

    # Save each clause check as a ScanResult row
    for check in compliance_result["checks"]:
        scan_result = ScanResult(
            scan_id=new_scan.id,
            clause=check["clause"],
            title=check.get("title"),
            extracted_text=check.get("evidence"),
            pass_fail=check["pass"],
            confidence=check.get("confidence"),
            note=check.get("note"),
            needs_review=(check.get("confidence") == "low"),
        )
        db.add(scan_result)

    # Save overall scan-level result
    new_scan.status = "done"
    new_scan.overall_status = compliance_result["overall_status"]
    new_scan.needs_human_review = compliance_result["needs_human_review"]
    db.commit()

    return ScanCreateResponse(
        scan_id=new_scan.id,
        status=new_scan.status,
        message=f"Compliance check complete: {compliance_result['overall_status']}",
    )
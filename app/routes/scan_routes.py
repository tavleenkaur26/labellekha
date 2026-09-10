import shutil
import os
from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session

from app.auth import get_db, get_current_user
from app.models import User, Scan, ScanResult
from app.schemas import ScanCreateResponse
import importlib.util
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

router = APIRouter()

UPLOAD_DIR = "uploaded_images"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/scans", response_model=ScanCreateResponse)
def create_scan(
    image: UploadFile = File(...),
    consent_given: bool = Form(...),
    coarse_location: str = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),  # requires a logged-in user (Step 4)
):
    # 1. Save the uploaded image to disk
    image_path = os.path.join(UPLOAD_DIR, image.filename)
    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    # 2. Create the scan row first, so we have an ID even if OCR fails
    new_scan = Scan(
        user_id=current_user.id,  # real logged-in user, no longer hardcoded
        image_path=image_path,
        status="processing",
        consent_given=consent_given,
        coarse_location=coarse_location,
    )
    db.add(new_scan)
    db.commit()
    db.refresh(new_scan)

    # 3. --- Role 2's OCR pipeline ---
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

    # 4. --- Role 1's rule engine ---
    
    spec = importlib.util.spec_from_file_location(
        "rule_engine_module", "rule-engine/rule_engine.py"
    )
    rule_engine_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(rule_engine_module)
    check_compliance = rule_engine_module.check_compliance

    compliance_result = check_compliance(ocr_result["text"], ocr_metadata=ocr_result)

    # 5. Save each clause check as a ScanResult row
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

    # 6. Save overall scan-level result
    new_scan.status = "done"
    new_scan.overall_status = compliance_result["overall_status"]
    new_scan.needs_human_review = compliance_result["needs_human_review"]
    db.commit()

    return ScanCreateResponse(
        scan_id=new_scan.id,
        status=new_scan.status,
        message=f"Compliance check complete: {compliance_result['overall_status']}",
    )
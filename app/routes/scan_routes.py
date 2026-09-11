import shutil
import os
import re
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.auth import get_db, get_current_user
from app.models import User, Scan, ScanResult
from app.schemas import ScanCreateResponse, ScanDetailResponse, ScanListItem
import importlib.util
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

from typing import List


router = APIRouter()

UPLOAD_DIR = "uploaded_images"
os.makedirs(UPLOAD_DIR, exist_ok=True)

GPS_PATTERN = re.compile(r"^-?\d{1,3}\.\d+\s*,\s*-?\d{1,3}\.\d+$")


@router.post("/scans", response_model=ScanCreateResponse)
def create_scan(
    image: UploadFile = File(...),
    consent_given: bool = Form(...),
    coarse_location: str = Form(None),
    brand: str = Form(None),
    category: str = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 0. Reject raw GPS coordinates before doing anything else (Step 5)
    if coarse_location and GPS_PATTERN.match(coarse_location.strip()):
        raise HTTPException(
            status_code=400,
            detail="coarse_location must be a locality/city/pincode, not precise GPS coordinates",
        )

    # 1. Save the uploaded image to disk
    image_path = os.path.join(UPLOAD_DIR, image.filename)
    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    # 2. Create the scan row first, so we have an ID even if OCR fails
    new_scan = Scan(
        user_id=current_user.id,
        image_path=image_path,
        status="processing",
        consent_given=consent_given,
        coarse_location=coarse_location,
        brand=brand,
        category=category,
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
    new_scan.passed_count = compliance_result["passed_count"]
    new_scan.total_checks = compliance_result["total_checks"]
    db.commit()

    return ScanCreateResponse(
        scan_id=new_scan.id,
        status=new_scan.status,
        message=f"Compliance check complete: {compliance_result['overall_status']}",
    )


@router.get("/scans/{scan_id}", response_model=ScanDetailResponse)
def get_scan(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()

    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    if scan.user_id != current_user.id and current_user.role != "inspector":
        raise HTTPException(status_code=403, detail="Not authorized to view this scan")

    return ScanDetailResponse(
        scan_id=scan.id,
        status=scan.status,
        overall_status=scan.overall_status,
        needs_human_review=scan.needs_human_review,
        coarse_location=scan.coarse_location,
        brand=scan.brand,
        category=scan.category,
        consent_given=scan.consent_given,
        passed_count=scan.passed_count,
        total_checks=scan.total_checks,
        created_at=scan.created_at,
        results=scan.results,
    )


@router.get("/scans/{scan_id}/image")
def get_scan_image(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Serves the original uploaded label image for a scan.
    Used by Role 6 to embed the scanned image in the PDF report.
    """
    scan = db.query(Scan).filter(Scan.id == scan_id).first()

    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    if scan.user_id != current_user.id and current_user.role != "inspector":
        raise HTTPException(status_code=403, detail="Not authorized to view this scan")

    if not os.path.exists(scan.image_path):
        raise HTTPException(status_code=404, detail="Image file not found on server")

    return FileResponse(scan.image_path)


@router.get("/scans", response_model=List[ScanListItem])
def list_scans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "inspector":
        scans = db.query(Scan).order_by(Scan.created_at.desc()).all()
    else:
        scans = (
            db.query(Scan)
            .filter(Scan.user_id == current_user.id)
            .order_by(Scan.created_at.desc())
            .all()
        )

    return [
        ScanListItem(
            scan_id=scan.id,
            status=scan.status,
            overall_status=scan.overall_status,
            coarse_location=scan.coarse_location,
            brand=scan.brand,
            category=scan.category,
            created_at=scan.created_at,
        )
        for scan in scans
    ]
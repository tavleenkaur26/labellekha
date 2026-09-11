import shutil
import os
import re

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    Depends,
    HTTPException
)

from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.auth import get_db, get_current_user
from app.models import User, Scan, ScanResult
from app.schemas import (
    ScanCreateResponse,
    ScanDetailResponse,
    ScanListItem
)

import importlib.util
import pytesseract
from typing import List


pytesseract.pytesseract.tesseract_cmd = (
    r'C:\Program Files\Tesseract-OCR\tesseract.exe'
)


router = APIRouter()

UPLOAD_DIR = "uploaded_images"
os.makedirs(UPLOAD_DIR, exist_ok=True)

GPS_PATTERN = re.compile(
    r"^-?\d{1,3}\.\d+\s*,\s*-?\d{1,3}\.\d+$"
)


def get_scan_confidence(scan):
    """
    Creates one aggregate confidence value for the dashboard.

    Rules:
    - low -> at least one check has low confidence
    - high -> all evaluated checks have high confidence
    - not_evaluated -> no checks have an evaluated confidence
    """

    confidences = [
        result.confidence
        for result in scan.results
        if result.confidence
    ]

    if not confidences:
        return "not_evaluated"

    if "low" in confidences:
        return "low"

    if all(confidence == "high" for confidence in confidences):
        return "high"

    return "not_evaluated"


def get_scan_violations(scan):
    """
    Number of failed compliance checks for this scan.
    """

    return sum(
        1
        for result in scan.results
        if result.pass_fail is False
    )


@router.post("/scans", response_model=ScanCreateResponse)
def create_scan(
    image: UploadFile = File(...),
    consent_given: bool = Form(...),
    coarse_location: str = Form(None),
    product_name: str = Form(None),
    brand: str = Form(None),
    category: str = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Reject raw GPS coordinates
    if coarse_location and GPS_PATTERN.match(
        coarse_location.strip()
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "coarse_location must be a locality/city/pincode, "
                "not precise GPS coordinates"
            ),
        )

    # Save uploaded image
    image_path = os.path.join(
        UPLOAD_DIR,
        image.filename
    )

    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    # Create scan
    new_scan = Scan(
        user_id=current_user.id,
        image_path=image_path,
        status="processing",
        consent_given=consent_given,
        coarse_location=coarse_location,
        product_name=product_name,
        brand=brand,
        category=category,
    )

    db.add(new_scan)
    db.commit()
    db.refresh(new_scan)

    # OCR
    from OCR.extract import extract_text

    ocr_result = extract_text(
        image_path,
        return_dict=True
    )

    if ocr_result["recapture_needed"]:
        new_scan.status = "recapture_needed"
        db.commit()

        return ScanCreateResponse(
            scan_id=new_scan.id,
            status="recapture_needed",
            message=ocr_result["message"],
        )

    # Rule engine
    spec = importlib.util.spec_from_file_location(
        "rule_engine_module",
        "rule-engine/rule_engine.py"
    )

    rule_engine_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(rule_engine_module)

    check_compliance = rule_engine_module.check_compliance

    compliance_result = check_compliance(
        ocr_result["text"],
        ocr_metadata=ocr_result
    )

    # Save individual clause checks
    for check in compliance_result["checks"]:

        scan_result = ScanResult(
            scan_id=new_scan.id,
            clause=check["clause"],
            title=check.get("title"),
            extracted_text=check.get("evidence"),
            pass_fail=check["pass"],
            confidence=check.get("confidence"),
            note=check.get("note"),
            needs_review=(
                check.get("confidence") == "low"
            ),
        )

        db.add(scan_result)

    # Save overall result
    new_scan.status = "done"

    new_scan.overall_status = (
        compliance_result["overall_status"]
    )

    new_scan.needs_human_review = (
        compliance_result["needs_human_review"]
    )

    new_scan.passed_count = (
        compliance_result["passed_count"]
    )

    new_scan.total_checks = (
        compliance_result["total_checks"]
    )

    db.commit()

    return ScanCreateResponse(
        scan_id=new_scan.id,
        status=new_scan.status,
        message=(
            "Compliance check complete: "
            f"{compliance_result['overall_status']}"
        ),
    )


@router.get(
    "/scans/{scan_id}",
    response_model=ScanDetailResponse
)
def get_scan(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scan = (
        db.query(Scan)
        .filter(Scan.id == scan_id)
        .first()
    )

    if not scan:
        raise HTTPException(
            status_code=404,
            detail="Scan not found"
        )

    if (
        scan.user_id != current_user.id
        and current_user.role != "inspector"
    ):
        raise HTTPException(
            status_code=403,
            detail="Not authorized to view this scan"
        )

    return ScanDetailResponse(
        scan_id=scan.id,
        status=scan.status,
        product_name=scan.product_name,
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
    scan = (
        db.query(Scan)
        .filter(Scan.id == scan_id)
        .first()
    )

    if not scan:
        raise HTTPException(
            status_code=404,
            detail="Scan not found"
        )

    if (
        scan.user_id != current_user.id
        and current_user.role != "inspector"
    ):
        raise HTTPException(
            status_code=403,
            detail="Not authorized to view this scan"
        )

    if not os.path.exists(scan.image_path):
        raise HTTPException(
            status_code=404,
            detail="Image file not found on server"
        )

    return FileResponse(scan.image_path)


@router.get(
    "/scans",
    response_model=List[ScanListItem]
)
def list_scans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    if current_user.role == "inspector":
        scans = (
            db.query(Scan)
            .order_by(Scan.created_at.desc())
            .all()
        )

    else:
        scans = (
            db.query(Scan)
            .filter(Scan.user_id == current_user.id)
            .order_by(Scan.created_at.desc())
            .all()
        )

    response = []

    for scan in scans:

        response.append(
            ScanListItem(
                scan_id=scan.id,
                product_name=scan.product_name,
                brand=scan.brand,
                category=scan.category,
                region=scan.coarse_location,
                overall_status=scan.overall_status,
                violations=get_scan_violations(scan),
                confidence=get_scan_confidence(scan),
                needs_human_review=(
                    scan.needs_human_review or False
                ),
                created_at=scan.created_at,
            )
        )

    return response
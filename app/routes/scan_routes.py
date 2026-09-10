import shutil
import os
from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Scan
from app.schemas import ScanCreateResponse

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
    
    result = extract_text(image_path, return_dict=True)

    if result["recapture_needed"]:
        new_scan.status = "recapture_needed"
        db.commit()
        return ScanCreateResponse(
            scan_id=new_scan.id,
            status="recapture_needed",
            message=result["message"],
        )

    # --- Role 1's rule engine (placeholder until they confirm function signature) ---
    extracted_text = result["text"]

    # TODO: replace this stub once Role 1 shares their check_compliance() signature
    # from rules import check_compliance
    # clause_results = check_compliance(extracted_text)
    # for each result in clause_results: create a ScanResult row here

    new_scan.status = "done"  # TEMP: will become "done" only after Role 1's step actually runs
    db.commit()

    return ScanCreateResponse(
        scan_id=new_scan.id,
        status=new_scan.status,
        message="OCR complete, awaiting rule engine integration",
    )
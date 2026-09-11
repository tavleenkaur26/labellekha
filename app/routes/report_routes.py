import os
import tempfile

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session, joinedload

from app.auth import get_db, get_current_user
from app.models import User, Scan
from app.report_adapter import scan_to_report_dict
from app.report_generator import generate_pdf_report, generate_csv_bytes

router = APIRouter()

# __file__ is app/routes/report_routes.py -- go up 3 levels (routes -> app -> project root)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@router.get("/scans/{scan_id}/report")
def get_scan_report(
    scan_id: int,
    format: str = Query("pdf", pattern="^(pdf|csv)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scan = db.query(Scan).options(joinedload(Scan.results)).filter(Scan.id == scan_id).first()
    if scan is None:
        raise HTTPException(status_code=404, detail=f"Scan {scan_id} not found")

    is_owner = scan.user_id == current_user.id
    is_inspector = current_user.role == "inspector"
    if not is_owner and not (is_inspector and scan.consent_given):
        raise HTTPException(status_code=403, detail="Not authorized to view this scan's report")

    if scan.status not in ("done",):
        raise HTTPException(
            status_code=409,
            detail=f"Scan {scan_id} has no completed compliance result yet (status: {scan.status})",
        )

    report_data = scan_to_report_dict(scan)

    if format == "csv":
        csv_bytes = generate_csv_bytes(report_data)
        return StreamingResponse(
            iter([csv_bytes]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=scan_{scan_id}_report.csv"},
        )

    tmp_path = os.path.join(tempfile.gettempdir(), f"scan_{scan_id}_report.pdf")
    generate_pdf_report(report_data, tmp_path, base_dir=BASE_DIR)
    return FileResponse(tmp_path, media_type="application/pdf", filename=f"scan_{scan_id}_report.pdf")

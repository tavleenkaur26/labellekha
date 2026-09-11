from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from app.auth import get_db, get_current_user
from app.models import User, Scan
from app.queries import get_consented_scans

router = APIRouter()


@router.get("/search/scans")
def search_scans(
    status: Optional[str] = Query(None),
    coarse_location: Optional[str] = Query(None),
    overall_status: Optional[str] = Query(None),   # NEW — "compliant" / "non-compliant"
    date_from: Optional[datetime] = Query(None),    # NEW — e.g. 2026-09-01T00:00:00
    date_to: Optional[datetime] = Query(None),       # NEW — e.g. 2026-09-11T23:59:59
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Search scans by status, location, overall compliance result, and date range.
    Regular users only see their own scans; inspectors see everyone's.
    Clause-level search (e.g. by specific Rule 6 clause) not yet implemented —
    add if Role 6 confirms it's needed.
    """
    query = get_consented_scans(db)

    # Visibility rule — same pattern as GET /scans
    if current_user.role != "inspector":
        query = query.filter(Scan.user_id == current_user.id)

    if status:
        query = query.filter(Scan.status == status)
    if coarse_location:
        query = query.filter(Scan.coarse_location == coarse_location)
    if overall_status:
        query = query.filter(Scan.overall_status == overall_status)
    if date_from:
        query = query.filter(Scan.created_at >= date_from)
    if date_to:
        query = query.filter(Scan.created_at <= date_to)

    results = query.order_by(Scan.created_at.desc()).all()

    return [
        {
            "scan_id": scan.id,
            "status": scan.status,
            "overall_status": scan.overall_status,
            "coarse_location": scan.coarse_location,
            "brand": scan.brand,          # will be None until brand/category is wired in
            "category": scan.category,    # will be None until brand/category is wired in
            "created_at": scan.created_at,
        }
        for scan in results
    ]
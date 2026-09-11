from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.auth import get_db, get_current_user
from app.models import User
from app.queries import get_consented_scans

router = APIRouter()


@router.get("/search/scans")
def search_scans(
    status: Optional[str] = Query(None),
    coarse_location: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    STUB — basic filtering on real fields (status, location) works now.
    Brand/category filtering and clause-level search will be added once
    Role 6 confirms exact requirements.
    """
    query = get_consented_scans(db)

    if status:
        query = query.filter_by(status=status)
    if coarse_location:
        query = query.filter_by(coarse_location=coarse_location)

    results = query.all()

    return [
        {
            "scan_id": scan.id,
            "status": scan.status,
            "overall_status": scan.overall_status,
            "coarse_location": scan.coarse_location,
            "created_at": scan.created_at,
        }
        for scan in results
    ]
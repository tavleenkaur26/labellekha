"""
Role 6 — Search & Retrieval routes, built against Role 4's REAL models.py.

Design notes:
- No `category`/`product_name` field exists anywhere in the real schema
  (Scan has no such column, and nothing in the pipeline extracts a product
  name). Filtering by product category is NOT possible with the schema as
  it stands today — filters below are limited to what actually exists:
  status, needs_review, date range, and coarse_location.
  --> Flag this to the team; product name/category would need to come from
      somewhere (OCR? a manual field on upload?) before that part of the
      original task spec can be built.
- Reuses Role 4's get_consented_scans() for any cross-user listing, per
  their own instruction in queries.py.
- Personal history (a user's own scans) does NOT require consent_given,
  since it's the same user viewing their own data, not aggregate/cross-user.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.auth import get_db, get_current_user, get_current_inspector
from app.models import User, Scan
from app.queries import get_consented_scans

router = APIRouter()


def _serialize_scan(scan: Scan, include_results: bool = False) -> dict:
    data = {
        "id": scan.id,
        "user_id": scan.user_id,
        "image_path": scan.image_path,
        "status": scan.status,
        "consent_given": scan.consent_given,
        "coarse_location": scan.coarse_location,
        "created_at": scan.created_at.isoformat() if scan.created_at else None,
        "overall_status": scan.overall_status,
        "needs_human_review": scan.needs_human_review,
    }

    if include_results:
        data["results"] = [
            {
                "clause": r.clause,
                "title": r.title,
                "evidence": r.extracted_text,
                "pass": r.pass_fail,
                "confidence": r.confidence,
                "note": r.note,
                "needs_review": r.needs_review,
            }
            for r in scan.results
        ]

    return data


@router.get("/scans/my")
def my_scans(
    status: Optional[str] = Query(
        None,
        description="compliant | non-compliant | pending | recapture_needed"
    ),
    needs_review: Optional[bool] = Query(None),
    date_from: Optional[str] = Query(None, alias="from"),
    date_to: Optional[str] = Query(None, alias="to"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """A user's own scan history — no consent filter needed, it's their own data."""
    q = db.query(Scan).filter(Scan.user_id == current_user.id)

    if status:
        q = q.filter(Scan.overall_status == status)

    if needs_review is not None:
        q = q.filter(Scan.needs_human_review == needs_review)

    if date_from:
        q = q.filter(Scan.created_at >= date_from)

    if date_to:
        q = q.filter(Scan.created_at <= date_to)

    scans = q.order_by(Scan.created_at.desc()).all()

    return {
        "count": len(scans),
        "results": [_serialize_scan(s) for s in scans]
    }


@router.get("/scans/search")
def search_scans(
    status: Optional[str] = Query(
        None,
        description="compliant | non-compliant | pending | recapture_needed"
    ),
    needs_review: Optional[bool] = Query(None),
    coarse_location: Optional[str] = Query(
        None,
        description="substring match, e.g. 'Delhi'"
    ),
    date_from: Optional[str] = Query(None, alias="from"),
    date_to: Optional[str] = Query(None, alias="to"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_inspector),
):
    """
    Cross-user search — inspector access only. Built on get_consented_scans()
    per Role 4's instruction in queries.py: never query Scan directly for any
    cross-user view.
    """
    q = get_consented_scans(db)

    if status:
        q = q.filter(Scan.overall_status == status)

    if needs_review is not None:
        q = q.filter(Scan.needs_human_review == needs_review)

    if coarse_location:
        q = q.filter(Scan.coarse_location.ilike(f"%{coarse_location}%"))

    if date_from:
        q = q.filter(Scan.created_at >= date_from)

    if date_to:
        q = q.filter(Scan.created_at <= date_to)

    scans = q.order_by(Scan.created_at.desc()).all()

    return {
        "count": len(scans),
        "results": [_serialize_scan(s) for s in scans]
    }


@router.get("/scans/{scan_id}")
def get_scan_detail(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scan = (
        db.query(Scan)
        .options(joinedload(Scan.results))
        .filter(Scan.id == scan_id)
        .first()
    )

    if scan is None:
        raise HTTPException(
            status_code=404,
            detail=f"Scan {scan_id} not found"
        )

    # Access rule: owners can always see their own scan; otherwise must be an
    # inspector AND the scan must have consent_given (matches get_consented_scans()).
    is_owner = scan.user_id == current_user.id
    is_inspector = current_user.role == "inspector"

    if not is_owner and not (is_inspector and scan.consent_given):
        raise HTTPException(
            status_code=403,
            detail="Not authorized to view this scan"
        )

    return _serialize_scan(scan, include_results=True)
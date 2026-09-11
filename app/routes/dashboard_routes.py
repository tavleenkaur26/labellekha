from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from collections import Counter

from app.auth import get_db, get_current_inspector
from app.models import User
from app.queries import get_consented_scans

router = APIRouter()


@router.get("/dashboard/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_inspector),
):
    scans = get_consented_scans(db).all()

    total_scans = len(scans)
    compliant_count = sum(1 for s in scans if s.overall_status == "compliant")
    non_compliant_count = sum(1 for s in scans if s.overall_status == "non-compliant")

    # Only count violations (non-compliant scans) toward brand/category/area breakdowns
    violating_scans = [s for s in scans if s.overall_status == "non-compliant"]

    violations_by_brand = Counter(
        s.brand for s in violating_scans if s.brand
    )
    violations_by_category = Counter(
        s.category for s in violating_scans if s.category
    )
    violations_by_area = Counter(
        s.coarse_location for s in violating_scans if s.coarse_location
    )

    return {
        "total_scans": total_scans,
        "compliant_count": compliant_count,
        "non_compliant_count": non_compliant_count,
        "violations_by_brand": dict(violations_by_brand),
        "violations_by_category": dict(violations_by_category),
        "violations_by_area": dict(violations_by_area),
    }
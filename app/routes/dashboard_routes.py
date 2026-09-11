from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_db, get_current_inspector
from app.models import User
from app.queries import get_consented_scans

router = APIRouter()


@router.get("/dashboard/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_inspector),  # inspector-only
):
    """
    STUB — returns dummy aggregate data in the expected shape.
    Real logic will aggregate get_consented_scans(db) once brand/category
    fields are added to the schema.
    """
    consented_scans = get_consented_scans(db).all()

    return {
        "total_scans": len(consented_scans),
        "compliant_count": 0,
        "non_compliant_count": 0,
        "violations_by_brand": {
            "BrandA": 4,
            "BrandB": 2,
        },
        "violations_by_category": {
            "Food": 5,
            "Cosmetics": 1,
        },
        "violations_by_area": {
            "Delhi": 6,
        },
    }
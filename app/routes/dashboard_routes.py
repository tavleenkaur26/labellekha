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

    # Only consented scans are used for dashboard analytics
    scans = get_consented_scans(db).all()

    total_scans = len(scans)

    compliant_count = sum(
        1
        for scan in scans
        if scan.overall_status == "compliant"
    )

    non_compliant_count = sum(
        1
        for scan in scans
        if scan.overall_status == "non-compliant"
    )

    human_review_count = sum(
        1
        for scan in scans
        if scan.needs_human_review
    )

    # Non-compliant scans
    violating_scans = [
        scan
        for scan in scans
        if scan.overall_status == "non-compliant"
    ]

    # Brand violations
    violations_by_brand = Counter(
        scan.brand
        for scan in violating_scans
        if scan.brand
    )

    # Category violations
    violations_by_category = Counter(
        scan.category
        for scan in violating_scans
        if scan.category
    )

    # Area violations
    violations_by_area = Counter(
        scan.coarse_location
        for scan in violating_scans
        if scan.coarse_location
    )

    # Individual rule/clause violations
    violations_by_clause = Counter()

    for scan in scans:
        for result in scan.results:

            if result.pass_fail is False:
                clause_name = (
                    result.title
                    or result.clause
                )

                violations_by_clause[clause_name] += 1

    # Total individual violations
    total_violations = sum(
        violations_by_clause.values()
    )

    # Most violated rule
    most_violated_rule = None

    if violations_by_clause:
        most_violated_rule = (
            violations_by_clause.most_common(1)[0][0]
        )

    return {
        "total_scans": total_scans,

        "compliant_count": compliant_count,
        "non_compliant_count": non_compliant_count,

        "human_review_count": human_review_count,

        "total_violations": total_violations,
        "most_violated_rule": most_violated_rule,

        "violations_by_brand": dict(
            violations_by_brand
        ),

        "violations_by_category": dict(
            violations_by_category
        ),

        "violations_by_area": dict(
            violations_by_area
        ),

        "violations_by_clause": dict(
            violations_by_clause
        ),
    }
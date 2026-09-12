from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from collections import Counter
from typing import Optional
from datetime import datetime

from app.auth import get_db, get_current_inspector
from app.models import User, Scan
from app.queries import get_consented_scans

router = APIRouter()


def apply_dashboard_filters(
    query,
    date_from: Optional[datetime],
    date_to: Optional[datetime],
    region: Optional[str],
    brand: Optional[str],
    category: Optional[str],
    compliance_status: Optional[str],
):
    """Shared filter logic for dashboard endpoints."""
    if date_from:
        query = query.filter(Scan.created_at >= date_from)
    if date_to:
        query = query.filter(Scan.created_at <= date_to)
    if region:
        query = query.filter(Scan.coarse_location == region)
    if brand:
        query = query.filter(Scan.brand == brand)
    if category:
        query = query.filter(Scan.category == category)
    if compliance_status:
        query = query.filter(Scan.overall_status == compliance_status)
    return query


@router.get("/dashboard/stats")
def get_dashboard_stats(
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    region: Optional[str] = Query(None),
    brand: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    compliance_status: Optional[str] = Query(None),
    rule: Optional[str] = Query(None),  # e.g. "Rule 6(1)(a)" - filters to scans where this clause failed
    review_status: Optional[str] = Query(None),  # "needs_review" or "clear"
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_inspector),
):
    query = get_consented_scans(db)
    query = apply_dashboard_filters(
        query, date_from, date_to, region, brand, category, compliance_status
    )

    if review_status == "needs_review":
        query = query.filter(Scan.needs_human_review == True)
    elif review_status == "clear":
        query = query.filter(Scan.needs_human_review == False)

    scans = query.all()

    # Optional: filter further to only scans where a specific rule failed
    if rule:
        scans = [
            s for s in scans
            if any(r.clause == rule and r.pass_fail is False for r in s.results)
        ]

    total_scans = len(scans)
    compliant_count = sum(1 for s in scans if s.overall_status == "compliant")
    non_compliant_count = sum(1 for s in scans if s.overall_status == "non-compliant")
    recapture_needed_count = sum(1 for s in scans if s.status == "recapture_needed")
    human_review_count = sum(1 for s in scans if s.needs_human_review)

    compliance_rate = (
        round((compliant_count / total_scans) * 100, 1) if total_scans else 0.0
    )

    violating_scans = [s for s in scans if s.overall_status == "non-compliant"]

    violations_by_brand = Counter(s.brand for s in violating_scans if s.brand)
    violations_by_category = Counter(s.category for s in violating_scans if s.category)
    violations_by_area = Counter(s.coarse_location for s in violating_scans if s.coarse_location)

    # NEW — total scans (not just violations) per region, for "scans by region" chart
    scans_by_area = Counter(s.coarse_location for s in scans if s.coarse_location)

    violations_by_clause = Counter()
    for s in scans:
        for result in s.results:
            if result.pass_fail is False:
                violations_by_clause[result.clause] += 1

    total_violations = sum(violations_by_clause.values())
    most_violated_rule = (
        violations_by_clause.most_common(1)[0][0] if violations_by_clause else None
    )

    return {
        "total_scans": total_scans,
        "compliant_count": compliant_count,
        "non_compliant_count": non_compliant_count,
        "compliance_rate": compliance_rate,
        "recapture_needed_count": recapture_needed_count,
        "human_review_count": human_review_count,
        "total_violations": total_violations,
        "most_violated_rule": most_violated_rule,
        "violations_by_brand": dict(violations_by_brand),
        "violations_by_category": dict(violations_by_category),
        "violations_by_area": dict(violations_by_area),
        "scans_by_area": dict(scans_by_area),
        "violations_by_clause": dict(violations_by_clause),
    }


@router.get("/dashboard/review-queue")
def get_review_queue(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_inspector),
):
    """
    Returns scans flagged for human review, with the reason.
    """
    scans = get_consented_scans(db).filter(Scan.needs_human_review == True).all()

    queue = []
    for s in scans:
        low_confidence_clauses = [
            r.title or r.clause for r in s.results if r.confidence == "low"
        ]
        reason = (
            f"Low confidence on: {', '.join(low_confidence_clauses)}"
            if low_confidence_clauses
            else "Flagged for review"
        )
        queue.append({
            "scan_id": s.id,
            "product_name": s.product_name,
            "brand": s.brand,
            "reason": reason,
            "confidence": "low",  # aggregate — could reuse get_scan_confidence() if imported
            "status": s.overall_status,
            "created_at": s.created_at,
        })

    return queue


@router.get("/dashboard/priority-queue")
def get_priority_queue(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_inspector),
):
    """
    STUB — simple heuristic priority scoring, not officially confirmed.
    Score = (number of failed checks * 10) + (20 if needs_human_review else 0).
    Higher score = higher inspection priority.
    Adjust the formula once the team agrees on real prioritization criteria.
    """
    scans = get_consented_scans(db).filter(Scan.overall_status == "non-compliant").all()

    priority_list = []
    for s in scans:
        failed_count = sum(1 for r in s.results if r.pass_fail is False)
        score = failed_count * 10 + (20 if s.needs_human_review else 0)
        reasons = []
        if failed_count > 0:
            reasons.append(f"{failed_count} clause(s) failed")
        if s.needs_human_review:
            reasons.append("flagged for human review")

        priority_list.append({
            "scan_id": s.id,
            "product_name": s.product_name,
            "brand": s.brand,
            "priority_score": score,
            "reason": "; ".join(reasons) if reasons else "Non-compliant",
        })

    priority_list.sort(key=lambda x: x["priority_score"], reverse=True)
    return priority_list
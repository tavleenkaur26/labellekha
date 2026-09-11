from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

from app.auth import get_db, get_current_inspector
from app.models import User, Scan, ScanResult
from app.queries import get_consented_scans
from app.schemas import (
    DashboardStatsResponse,
    HumanReviewItem,
    PriorityQueueItem,
    FilterOptionsResponse,
    ScanResultOut,
)
from app.dashboard_analytics import (
    compute_dashboard_stats,
    apply_dashboard_filters,
    extract_review_reasons,
    compute_priority_for_scan,
    RULE_DEFINITIONS,
)

router = APIRouter()


@router.get("/dashboard/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    coarse_location: Optional[str] = Query(None),
    brand: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    overall_status: Optional[str] = Query(None),
    rule: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_inspector),
):
    """
    Returns comprehensive Legal Metrology compliance metrics,
    including 6 Rule 6 clauses, Rule 7 separation, region and brand analytics.
    Strictly restricted to consented scans and authenticated inspectors.
    """
    return compute_dashboard_stats(
        db,
        date_from=date_from,
        date_to=date_to,
        coarse_location=coarse_location,
        brand=brand,
        category=category,
        overall_status=overall_status,
        rule=rule,
    )


@router.get("/dashboard/reviews", response_model=List[HumanReviewItem])
def get_human_reviews(
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    coarse_location: Optional[str] = Query(None),
    brand: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_inspector),
):
    """
    Returns inspections flagged for human review under Adaptive Evidence-Driven Inspection.
    Identifies low-confidence declarations, OCR uncertainties, and uncalibrated Rule 7 checks.
    """
    base_query = get_consented_scans(db)
    filtered = apply_dashboard_filters(
        base_query,
        date_from=date_from,
        date_to=date_to,
        coarse_location=coarse_location,
        brand=brand,
        category=category,
    )

    scans = filtered.order_by(Scan.created_at.desc()).all()
    review_items = []

    for scan in scans:
        results = scan.results
        has_low_conf = any(r.confidence == "low" for r in results)
        has_flag = bool(scan.needs_human_review) or scan.status == "recapture_needed"
        has_uncalibrated_rule7 = any(
            r.clause == "Rule 7" and (r.confidence == "not_evaluated" or r.pass_fail is None)
            for r in results
        )

        if has_flag or has_low_conf or has_uncalibrated_rule7:
            reasons = extract_review_reasons(scan, results)
            review_items.append(
                HumanReviewItem(
                    scan_id=scan.id,
                    brand=scan.brand,
                    category=scan.category,
                    coarse_location=scan.coarse_location,
                    overall_status=scan.overall_status,
                    status=scan.status,
                    needs_human_review=bool(scan.needs_human_review),
                    created_at=scan.created_at,
                    review_reasons=reasons,
                    passed_count=scan.passed_count,
                    total_checks=scan.total_checks,
                    results=[ScanResultOut.model_validate(r) for r in results],
                )
            )

    return review_items


@router.get("/dashboard/priority-queue", response_model=List[PriorityQueueItem])
def get_priority_queue(
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    coarse_location: Optional[str] = Query(None),
    brand: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    priority_level: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_inspector),
):
    """
    Returns an explainable inspection-priority queue for enforcement officers.
    Factors transparently include non-compliance, violation count, OCR quality,
    low confidence, and repeat offender patterns.
    """
    base_query = get_consented_scans(db)
    filtered = apply_dashboard_filters(
        base_query,
        date_from=date_from,
        date_to=date_to,
        coarse_location=coarse_location,
        brand=brand,
        category=category,
    )

    all_scans = filtered.order_by(Scan.created_at.desc()).all()

    # Identify repeat offenders (brand or region with >=2 scans and >=50% non-compliance)
    counts = {}
    for s in all_scans:
        for ident in [s.brand, s.coarse_location]:
            if ident:
                counts.setdefault(ident, {"total": 0, "non_compliant": 0})
                counts[ident]["total"] += 1
                if s.overall_status == "non-compliant":
                    counts[ident]["non_compliant"] += 1

    repeat_offenders = {
        k for k, v in counts.items()
        if v["total"] >= 2 and (v["non_compliant"] / v["total"]) >= 0.5
    }

    queue_items = []
    for scan in all_scans:
        results = scan.results
        p_info = compute_priority_for_scan(scan, results, repeat_offenders)

        if priority_level and priority_level.upper() != "ALL":
            if p_info["priority_level"] != priority_level.upper():
                continue

        queue_items.append(
            PriorityQueueItem(
                scan_id=scan.id,
                brand=scan.brand,
                category=scan.category,
                coarse_location=scan.coarse_location,
                overall_status=scan.overall_status,
                created_at=scan.created_at,
                priority_level=p_info["priority_level"],
                priority_score=p_info["priority_score"],
                priority_reasons=p_info["priority_reasons"],
                violation_count=p_info["violation_count"],
                has_low_confidence=p_info["has_low_confidence"],
                needs_human_review=bool(scan.needs_human_review),
                results=[ScanResultOut.model_validate(r) for r in results],
            )
        )

    # Sort queue by priority score descending
    queue_items.sort(key=lambda x: x.priority_score, reverse=True)
    return queue_items


@router.get("/dashboard/filter-options", response_model=FilterOptionsResponse)
def get_filter_options(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_inspector),
):
    """Returns available filter dropdown values dynamically based on consented data."""
    scans = get_consented_scans(db).all()
    regions = sorted(list({s.coarse_location for s in scans if s.coarse_location}))
    brands = sorted(list({s.brand for s in scans if s.brand}))
    categories = sorted(list({s.category for s in scans if s.category}))
    rules = [r["clause"] for r in RULE_DEFINITIONS]
    statuses = ["compliant", "non-compliant", "recapture_needed"]

    return FilterOptionsResponse(
        regions=regions,
        brands=brands,
        categories=categories,
        rules=rules,
        statuses=statuses,
    )
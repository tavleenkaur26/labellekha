from collections import Counter
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models import Scan, ScanResult
from app.queries import get_consented_scans


RULE_DEFINITIONS = [
    {"clause": "Rule 6(1)(a)", "title": "Manufacturer / Packer / Importer Details", "is_rule_6": True},
    {"clause": "Rule 6(1)(b)", "title": "Common / Generic Name of Commodity", "is_rule_6": True},
    {"clause": "Rule 6(1)(c)", "title": "Net Quantity Declaration", "is_rule_6": True},
    {"clause": "Rule 6(1)(d)", "title": "Month & Year of Manufacture / Packing", "is_rule_6": True},
    {"clause": "Rule 6(1)(e)", "title": "Retail Sale Price (MRP)", "is_rule_6": True},
    {"clause": "Rule 6(2)", "title": "Consumer Complaint Contact", "is_rule_6": True},
    {"clause": "Rule 7", "title": "Letter Height / Font Size Requirement", "is_rule_6": False},
]

RULE_TITLES = {r["clause"]: r["title"] for r in RULE_DEFINITIONS}
RULE_IS_RULE_6 = {r["clause"]: r["is_rule_6"] for r in RULE_DEFINITIONS}


def apply_dashboard_filters(
    query,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    coarse_location: Optional[str] = None,
    brand: Optional[str] = None,
    category: Optional[str] = None,
    overall_status: Optional[str] = None,
    rule: Optional[str] = None,
):
    """Applies standard dashboard filters to a consented scan query."""
    if date_from:
        query = query.filter(Scan.created_at >= date_from)
    if date_to:
        query = query.filter(Scan.created_at <= date_to)
    if coarse_location and coarse_location.strip() and coarse_location.lower() != "all":
        query = query.filter(Scan.coarse_location == coarse_location.strip())
    if brand and brand.strip() and brand.lower() != "all":
        query = query.filter(Scan.brand == brand.strip())
    if category and category.strip() and category.lower() != "all":
        query = query.filter(Scan.category == category.strip())
    if overall_status and overall_status.strip() and overall_status.lower() != "all":
        query = query.filter(Scan.overall_status == overall_status.strip())
    if rule and rule.strip() and rule.lower() != "all":
        # Scans that have a violation for this rule
        query = query.join(Scan.results).filter(
            ScanResult.clause == rule.strip(),
            ScanResult.pass_fail == False,
        )
    return query


def compute_dashboard_stats(
    db: Session,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    coarse_location: Optional[str] = None,
    brand: Optional[str] = None,
    category: Optional[str] = None,
    overall_status: Optional[str] = None,
    rule: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Computes complete dashboard analytics dynamically from consented scans.
    Rule 7 is separated from the compliance rate calculation.
    """
    base_query = get_consented_scans(db)
    filtered_query = apply_dashboard_filters(
        base_query,
        date_from=date_from,
        date_to=date_to,
        coarse_location=coarse_location,
        brand=brand,
        category=category,
        overall_status=overall_status,
        rule=rule,
    )

    scans = filtered_query.order_by(Scan.created_at.desc()).all()

    total_scans = len(scans)
    compliant_count = sum(1 for s in scans if s.overall_status == "compliant")
    non_compliant_count = sum(1 for s in scans if s.overall_status == "non-compliant")
    recapture_needed_count = sum(1 for s in scans if s.status == "recapture_needed")
    needs_human_review_count = sum(
        1 for s in scans if s.needs_human_review or s.status == "recapture_needed"
    )

    # Compliance rate calculation: Rule 7 does NOT affect overall_status
    eligible_scans = compliant_count + non_compliant_count
    compliance_rate = (
        round((compliant_count / eligible_scans) * 100.0, 1)
        if eligible_scans > 0
        else 0.0
    )

    # Fetch scan results for all filtered scans
    scan_ids = [s.id for s in scans]
    all_results = (
        db.query(ScanResult).filter(ScanResult.scan_id.in_(scan_ids)).all()
        if scan_ids
        else []
    )

    # Group results by scan_id
    results_by_scan: Dict[int, List[ScanResult]] = {}
    for r in all_results:
        results_by_scan.setdefault(r.scan_id, []).append(r)

    # Initialize 7-rule trackers
    rule_counts = {
        r_def["clause"]: {
            "clause": r_def["clause"],
            "title": r_def["title"],
            "is_rule_6": r_def["is_rule_6"],
            "violations_count": 0,
            "pass_count": 0,
            "not_evaluated_count": 0,
            "low_confidence_count": 0,
            "percentage_of_total_violations": 0.0,
        }
        for r_def in RULE_DEFINITIONS
    }

    total_violations = 0
    for r in all_results:
        clause = r.clause
        if clause in rule_counts:
            if r.pass_fail is False:
                rule_counts[clause]["violations_count"] += 1
                total_violations += 1
            elif r.pass_fail is True:
                rule_counts[clause]["pass_count"] += 1
            else:
                rule_counts[clause]["not_evaluated_count"] += 1

            if r.confidence == "low":
                rule_counts[clause]["low_confidence_count"] += 1

    # Calculate percentage of total violations per rule
    rule_analytics = []
    violations_by_rule = {}
    for r_def in RULE_DEFINITIONS:
        clause = r_def["clause"]
        item = rule_counts[clause]
        if total_violations > 0:
            item["percentage_of_total_violations"] = round(
                (item["violations_count"] / total_violations) * 100.0, 1
            )
        rule_analytics.append(item)
        violations_by_rule[clause] = item["violations_count"]

    # Most violated rule (Rule 6 and Rule 7)
    most_violated_rule = None
    if total_violations > 0:
        sorted_rules = sorted(
            rule_analytics, key=lambda x: x["violations_count"], reverse=True
        )
        if sorted_rules[0]["violations_count"] > 0:
            top = sorted_rules[0]
            most_violated_rule = {
                "clause": top["clause"],
                "title": top["title"],
                "violations_count": top["violations_count"],
                "percentage": top["percentage_of_total_violations"],
                "is_rule_6": top["is_rule_6"],
            }

    # Region Analytics (aggregated by coarse_location, no GPS)
    region_data: Dict[str, Dict[str, Any]] = {}
    for scan in scans:
        region = (scan.coarse_location or "Unspecified").strip()
        if region not in region_data:
            region_data[region] = {
                "region": region,
                "total_scans": 0,
                "compliant_count": 0,
                "non_compliant_count": 0,
                "total_violations": 0,
                "violations_by_clause": Counter(),
            }
        rd = region_data[region]
        rd["total_scans"] += 1
        if scan.overall_status == "compliant":
            rd["compliant_count"] += 1
        elif scan.overall_status == "non-compliant":
            rd["non_compliant_count"] += 1

        for r in results_by_scan.get(scan.id, []):
            if r.pass_fail is False:
                rd["total_violations"] += 1
                rd["violations_by_clause"][r.clause] += 1

    region_analytics = []
    for reg, data in region_data.items():
        eligible = data["compliant_count"] + data["non_compliant_count"]
        rate = round((data["compliant_count"] / eligible) * 100.0, 1) if eligible > 0 else 0.0
        top_violation = (
            data["violations_by_clause"].most_common(1)[0][0]
            if data["violations_by_clause"]
            else None
        )
        region_analytics.append({
            "region": reg,
            "total_scans": data["total_scans"],
            "compliant_count": data["compliant_count"],
            "non_compliant_count": data["non_compliant_count"],
            "compliance_rate": rate,
            "total_violations": data["total_violations"],
            "top_violation": top_violation,
        })
    region_analytics.sort(key=lambda x: x["total_scans"], reverse=True)

    # Brand Analytics
    brand_data: Dict[str, Dict[str, Any]] = {}
    for scan in scans:
        b_name = (scan.brand or "Unspecified Brand").strip()
        if b_name not in brand_data:
            brand_data[b_name] = {
                "brand": b_name,
                "total_scans": 0,
                "compliant_count": 0,
                "non_compliant_count": 0,
                "total_violations": 0,
            }
        bd = brand_data[b_name]
        bd["total_scans"] += 1
        if scan.overall_status == "compliant":
            bd["compliant_count"] += 1
        elif scan.overall_status == "non-compliant":
            bd["non_compliant_count"] += 1

        for r in results_by_scan.get(scan.id, []):
            if r.pass_fail is False:
                bd["total_violations"] += 1

    brand_analytics = []
    for b_name, data in brand_data.items():
        eligible = data["compliant_count"] + data["non_compliant_count"]
        rate = round((data["compliant_count"] / eligible) * 100.0, 1) if eligible > 0 else 0.0
        brand_analytics.append({
            "brand": b_name,
            "total_scans": data["total_scans"],
            "compliant_count": data["compliant_count"],
            "non_compliant_count": data["non_compliant_count"],
            "compliance_rate": rate,
            "total_violations": data["total_violations"],
        })
    brand_analytics.sort(key=lambda x: x["total_violations"], reverse=True)

    # Category Analytics
    cat_data: Dict[str, Dict[str, Any]] = {}
    for scan in scans:
        c_name = (scan.category or "General Packaged Goods").strip()
        if c_name not in cat_data:
            cat_data[c_name] = {
                "category": c_name,
                "total_scans": 0,
                "compliant_count": 0,
                "non_compliant_count": 0,
                "total_violations": 0,
            }
        cd = cat_data[c_name]
        cd["total_scans"] += 1
        if scan.overall_status == "compliant":
            cd["compliant_count"] += 1
        elif scan.overall_status == "non-compliant":
            cd["non_compliant_count"] += 1

        for r in results_by_scan.get(scan.id, []):
            if r.pass_fail is False:
                cd["total_violations"] += 1

    category_analytics = []
    for c_name, data in cat_data.items():
        eligible = data["compliant_count"] + data["non_compliant_count"]
        rate = round((data["compliant_count"] / eligible) * 100.0, 1) if eligible > 0 else 0.0
        category_analytics.append({
            "category": c_name,
            "total_scans": data["total_scans"],
            "compliant_count": data["compliant_count"],
            "non_compliant_count": data["non_compliant_count"],
            "compliance_rate": rate,
            "total_violations": data["total_violations"],
        })
    category_analytics.sort(key=lambda x: x["total_violations"], reverse=True)

    # Backward-compatible breakdown structures
    violating_scans = [s for s in scans if s.overall_status == "non-compliant"]
    violations_by_brand = Counter(s.brand for s in violating_scans if s.brand)
    violations_by_category = Counter(s.category for s in violating_scans if s.category)
    violations_by_area = Counter(s.coarse_location for s in violating_scans if s.coarse_location)

    # Available filters (calculated from all consented scans)
    all_consented = get_consented_scans(db).all()
    available_filters = {
        "regions": sorted(list({s.coarse_location for s in all_consented if s.coarse_location})),
        "brands": sorted(list({s.brand for s in all_consented if s.brand})),
        "categories": sorted(list({s.category for s in all_consented if s.category})),
        "rules": [r["clause"] for r in RULE_DEFINITIONS],
        "statuses": ["compliant", "non-compliant", "recapture_needed"],
    }

    return {
        "total_scans": total_scans,
        "compliant_count": compliant_count,
        "non_compliant_count": non_compliant_count,
        "recapture_needed_count": recapture_needed_count,
        "compliance_rate": compliance_rate,
        "needs_human_review_count": needs_human_review_count,
        "total_violations": total_violations,
        "violations_by_rule": violations_by_rule,
        "rule_analytics": rule_analytics,
        "most_violated_rule": most_violated_rule,
        "region_analytics": region_analytics,
        "brand_analytics": brand_analytics,
        "category_analytics": category_analytics,
        "violations_by_brand": dict(violations_by_brand),
        "violations_by_category": dict(violations_by_category),
        "violations_by_area": dict(violations_by_area),
        "available_filters": available_filters,
    }


def extract_review_reasons(scan: Scan, results: List[ScanResult]) -> List[str]:
    """Generates explainable reasons why a scan was flagged for human review."""
    reasons = []
    if scan.status == "recapture_needed":
        reasons.append("Image capture quality gate triggered (recapture recommended)")

    for r in results:
        if r.confidence == "low":
            reasons.append(f"Low confidence on {r.clause}: {r.title or 'Declaration'}")
        if r.clause == "Rule 7" and (r.confidence == "not_evaluated" or r.pass_fail is None):
            reasons.append("Rule 7 letter height not evaluated (uncalibrated font)")
        if r.note:
            reasons.append(f"{r.clause}: {r.note}")

    if not reasons and scan.needs_human_review:
        reasons.append("Flagged by rule engine for manual inspector verification")

    return list(dict.fromkeys(reasons))  # Deduplicate preserving order


def compute_priority_for_scan(
    scan: Scan,
    results: List[ScanResult],
    repeat_offenders: set,
) -> Dict[str, Any]:
    """
    Computes an explainable inspection priority score and reasons for a scan.
    Transparent, non-black-box factors.
    """
    score = 0
    reasons = []

    # 1. Non-compliance factor
    if scan.overall_status == "non-compliant":
        score += 30
        reasons.append("Non-compliant overall status (+30)")

    # 2. Recapture needed
    if scan.status == "recapture_needed":
        score += 25
        reasons.append("Severe OCR image degradation / recapture needed (+25)")

    # 3. Violation count factor
    violations = [r for r in results if r.pass_fail is False]
    v_count = len(violations)
    if v_count > 0:
        added = min(v_count * 10, 30)
        score += added
        reasons.append(f"{v_count} rule declaration violation(s) detected (+{added})")

    # 4. Human review / Uncertainty factor
    if scan.needs_human_review:
        score += 15
        reasons.append("Flagged for human review (+15)")

    low_conf = [r for r in results if r.confidence == "low"]
    if low_conf:
        score += 10
        clauses = ", ".join(r.clause for r in low_conf[:2])
        reasons.append(f"Low-confidence extraction on {clauses} (+10)")

    # 5. Repeat offender factor (brand or region)
    identifier = scan.brand or scan.coarse_location
    if identifier and identifier in repeat_offenders:
        score += 15
        reasons.append(f"Repeat non-compliance pattern detected for '{identifier}' (+15)")

    # Priority level categorization
    if score >= 50:
        level = "CRITICAL"
    elif score >= 35:
        level = "HIGH"
    elif score >= 20:
        level = "MEDIUM"
    else:
        level = "LOW"

    return {
        "priority_level": level,
        "priority_score": score,
        "priority_reasons": reasons,
        "violation_count": v_count,
        "has_low_confidence": len(low_conf) > 0,
    }

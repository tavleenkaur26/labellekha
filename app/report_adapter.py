"""
Converts a real Scan (+ its ScanResult rows) into the plain-dict shape that
report_generator.py already expects and has been tested against. This keeps
report_generator.py itself completely unchanged — it doesn't know or care
whether its input came from fake_data.py or a real database.
"""

from app.models import Scan


def scan_to_report_dict(scan: Scan) -> dict:
    """
    Convert a Scan SQLAlchemy object into the dictionary format
    expected by the report generator.
    """

    checks = []

    for r in scan.results:
        check = {
            "clause": r.clause,
            "title": r.title or r.clause,
            "pass": r.pass_fail,
            "evidence": r.extracted_text,
            "confidence": r.confidence,
        }

        if r.note:
            check["note"] = r.note

        checks.append(check)

    # Count only checks that were actually evaluated.
    scored = [c for c in checks if c["pass"] is not None]

    passed_count = sum(
        1 for c in scored if c["pass"]
    )

    total_checks = len(scored)

    return {
        "id": scan.id,
        "image_url": scan.image_path,
        "extracted_text": None,

        "compliance_result": {
            "overall_status": scan.overall_status or "pending",
            "passed_count": passed_count,
            "total_checks": total_checks,
            "needs_human_review": bool(scan.needs_human_review),
            "checks": checks,
        },

        "category": scan.category,
        "region": scan.coarse_location,
        "consent_flag": scan.consent_given,
        "timestamp": (
            scan.created_at.isoformat()
            if scan.created_at
            else None
        ),
        "user_role": None,
    }
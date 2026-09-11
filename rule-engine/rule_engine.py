"""
PS26034 — Legal Metrology Compliance Scanner
Role 1: Rule Engine

Checks OCR-extracted label text against Rule 6(1)(a)-(e) and Rule 6(2)
of the Legal Metrology (Packaged Commodities) Rules, 2011.

This file has ZERO dependency on OCR — test it with plain text strings
you type yourself. Once Role 2's OCR pipeline is ready, their output
(a string of extracted text) just gets passed into check_compliance().
"""

import re


# ---------------------------------------------------------------------------
# INDIVIDUAL CLAUSE CHECKS
# Each function takes the full extracted label text and returns a result dict.
# This shape is your CONTRACT with the rest of the team — don't change field
# names without telling everyone.
# ---------------------------------------------------------------------------

def check_manufacturer(text: str) -> dict:
    """Rule 6(1)(a) — name & address of manufacturer/packer/importer."""
    pattern = r"(Mfd?\.?\s?by|Manufactured\s?by|Marketed\s?by|Packed\s?by|Manufacturer|Marketer|Importer)[:\ \t]+[^\n]{5,80}"
    match = re.search(pattern, text, re.IGNORECASE)
    return {
        "clause": "Rule 6(1)(a)",
        "title": "Manufacturer / Packer / Importer Details",
        "pass": bool(match),
        "evidence": match.group(0).strip() if match else None,
        "confidence": "high" if match else "low",
    }


def check_generic_name(text: str) -> dict:
    """Rule 6(1)(b) — common/generic name of the commodity.
    Heuristic only — real accuracy would need a product-category dictionary.
    Marked lower confidence deliberately; don't overclaim this one."""
    has_substantial_text = len(text.strip()) > 15
    return {
        "clause": "Rule 6(1)(b)",
        "title": "Common / Generic Name of Commodity",
        "pass": has_substantial_text,
        "evidence": "Label text present (not verified against a product-name dictionary)" if has_substantial_text else None,
        "confidence": "low",  # always low — be honest, this check is weak
    }


def check_net_quantity(text: str) -> dict:
    """Rule 6(1)(c) — net quantity in standard units."""
    pattern = r"(\d+(?:\.\d+)?)\s?(g|gm|gms|kg|ml|mL|l|L|litre|litres|N|no\.?s?|pieces|pcs)\b"
    match = re.search(pattern, text, re.IGNORECASE)
    return {
        "clause": "Rule 6(1)(c)",
        "title": "Net Quantity Declaration",
        "pass": bool(match),
        "evidence": match.group(0).strip() if match else None,
        "confidence": "high" if match else "low",
    }


def check_mfg_date(text: str) -> dict:
    """Rule 6(1)(d) — month & year of manufacture/packing/import."""
    patterns = [
        r"\b(0?[1-9]|1[0-2])\s?[\/\-.]\s?(20\d{2})\b",
        r"\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s?(20\d{2})\b",
        r"(Mfg\.?\s?Date|Pkd\.?\s?Date|Packed\s?on|Manufactured\s?on)[:\s]+[A-Za-z0-9\/\-.\s]{4,15}",
    ]
    for p in patterns:
        match = re.search(p, text, re.IGNORECASE)
        if match:
            return {
                "clause": "Rule 6(1)(d)",
                "title": "Month & Year of Manufacture / Packing",
                "pass": True,
                "evidence": match.group(0).strip(),
                "confidence": "high",
            }
    return {
        "clause": "Rule 6(1)(d)",
        "title": "Month & Year of Manufacture / Packing",
        "pass": False,
        "evidence": None,
        "confidence": "low",
    }


def check_mrp(text: str) -> dict:
    """Rule 6(1)(e) — retail sale price (MRP), inclusive of all taxes.
    Includes a fallback for the M/W OCR misread (MRP -> WRP) flagged by
    Role 2's real-photo testing — common OCR confusion given visual
    similarity. Primary pattern still requires MRP; fallback is lower
    confidence and requires a nearby Rs/₹ price to avoid false matches."""
    primary_pattern = r"(?:MRP|M\.?R\.?P\.?|Maximum Retail Price|Retail Sale Price)[^\d₹]{0,15}[₹Rs.]*\s?(\d+[.,]?\d*)"
    match = re.search(primary_pattern, text, re.IGNORECASE)
    confidence = "high"

    if not match:
        # Fallback: catches OCR misreading MRP as WRP (or similar single-char
        # confusion) — only accepted if a real price follows, to avoid
        # matching unrelated text
        fallback_pattern = r"(?:WRP|MPP|MRR)[^\d₹]{0,15}[₹Rs.]*\s?(\d+[.,]?\d*)"
        match = re.search(fallback_pattern, text, re.IGNORECASE)
        confidence = "low"  # always low-confidence, needs human review

    has_tax_note = bool(re.search(r"incl(?:usive|\.)?\s?of\s?(?:all\s?)?tax", text, re.IGNORECASE))

    note = None
    if match and confidence == "low":
        note = "Matched via OCR-misread fallback (e.g. MRP read as WRP) — needs human verification"
    elif match and not has_tax_note:
        note = "MRP found but 'inclusive of all taxes' phrasing not detected — flag for review"

    return {
        "clause": "Rule 6(1)(e)",
        "title": "Retail Sale Price (MRP)",
        "pass": bool(match),
        "evidence": match.group(0).strip() if match else None,
        "confidence": confidence if match else "low",
        "note": note,
    }


def check_consumer_care(text: str) -> dict:
    """Rule 6(2) — consumer complaint contact (name/address/phone/email).
    Requires a real phone number OR email pattern nearby a care-related
    keyword — NOT just the word 'contact' appearing anywhere (this was
    matching unrelated safety/caution text on real labels, e.g. 'accidental
    contact with eyes' — flagged by Role 2's real-photo testing)."""
    care_keyword = r"(Customer\s?Care|Consumer\s?Care|Toll[\s-]?Free|Helpline|Care\s?Line|For\s?Complaints?|Tel\.?)"
    phone_pattern = r"(?:\+?91[\s-]?)?\d{10}|\d{4}[\s-]\d{3}[\s-]\d{4}"
    email_pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"

    # Look for a care keyword followed within ~60 chars by a real phone or email
    keyword_match = re.search(care_keyword, text, re.IGNORECASE)
    phone_match = re.search(phone_pattern, text)
    email_match = re.search(email_pattern, text)

    evidence = None
    passed = False

    if keyword_match:
        window = text[keyword_match.start():keyword_match.start() + 80]
        window_phone = re.search(phone_pattern, window)
        window_email = re.search(email_pattern, window)
        if window_phone or window_email:
            # Trim evidence to end right after the matched phone/email,
            # not the full 80-char window (avoids trailing unrelated text)
            end_pos = max(
                window_phone.end() if window_phone else 0,
                window_email.end() if window_email else 0,
            )
            evidence = window[:end_pos].strip().replace("\n", " ")
            passed = True

    # Fallback: even without the keyword, a standalone email/phone near
    # words like "care"/"complaint" still counts, but flagged lower confidence
    if not passed and (phone_match or email_match):
        evidence = (email_match.group(0) if email_match else phone_match.group(0))
        passed = True
        confidence = "low"
    else:
        confidence = "high" if passed else "low"

    return {
        "clause": "Rule 6(2)",
        "title": "Consumer Complaint Contact",
        "pass": passed,
        "evidence": evidence,
        "confidence": confidence,
    }


def check_font_size(font_stats: dict | None = None) -> dict:
    """Rule 7 — letter height requirements (Table I/II).
    Uses Role 2's font_stats (from extract_text with return_dict=True),
    specifically estimated_mm — an approximate, UNCALIBRATED estimate,
    not a certified physical measurement. Always flagged low-confidence
    and never presented as legally definitive."""
    if not font_stats or font_stats.get("estimated_mm", 0) <= 0:
        return {
            "clause": "Rule 7",
            "title": "Letter Height / Font Size Requirement",
            "pass": None,
            "evidence": None,
            "confidence": "not_evaluated",
            "note": "No font data available from OCR pipeline.",
        }

    estimated_mm = font_stats["estimated_mm"]
    # Rule 7 Table I minimum for the most common case (up to 200g/ml): 1mm normal print
    # This is a simplified threshold — real implementation should select the
    # correct table row based on declared net quantity, not a flat 1mm minimum
    MIN_MM_THRESHOLD = 1.0
    likely_pass = estimated_mm >= MIN_MM_THRESHOLD

    return {
        "clause": "Rule 7",
        "title": "Letter Height / Font Size Requirement",
        "pass": likely_pass,
        "evidence": f"Estimated letter height: {estimated_mm}mm (uncalibrated approximation)",
        "confidence": "low",  # ALWAYS low — this is never a certified measurement
        "note": "Approximate estimate only, not calibrated against a reference object. Needs human verification before any enforcement action.",
    }


# ---------------------------------------------------------------------------
# MAIN ENTRY POINT — this is what Role 2 (OCR) and Role 4 (backend) call
# ---------------------------------------------------------------------------

def check_compliance(extracted_text: str, font_stats: dict | None = None, ocr_metadata: dict | None = None, **kwargs) -> dict:
    """
    Takes raw OCR-extracted text, runs it through all clause checks,
    returns a full compliance result.

    Contract with Person 4's backend: check_compliance(text, font_stats=font_stats)
    font_stats: pass Role 2's font_stats dict directly (from extract_text's
                return_dict=True output) — this is the primary supported path.
    ocr_metadata: legacy/alternate path — pass the FULL extract_text dict here
                  instead, and font_stats + recapture_needed will be pulled
                  from it automatically. Kept for backward compatibility.
    **kwargs: absorbs any extra fields other integrations might pass, so
              this function doesn't break if the contract grows.
    """
    # Resolve font_stats from whichever path was used
    resolved_font_stats = font_stats
    recapture_needed = False
    ocr_status = None

    if ocr_metadata:
        resolved_font_stats = resolved_font_stats or ocr_metadata.get("font_stats")
        recapture_needed = ocr_metadata.get("recapture_needed", False)
        ocr_status = ocr_metadata.get("status")

    checks = [
        check_manufacturer(extracted_text),
        check_generic_name(extracted_text),
        check_net_quantity(extracted_text),
        check_mfg_date(extracted_text),
        check_mrp(extracted_text),
        check_consumer_care(extracted_text),
        check_font_size(resolved_font_stats),
    ]

    scored_checks = [c for c in checks if c["pass"] is not None]
    passed = sum(1 for c in scored_checks if c["pass"])
    total = len(scored_checks)

    needs_review = any(c["confidence"] == "low" for c in scored_checks)
    if recapture_needed:
        needs_review = True

    overall_status = "compliant" if passed == total else "non-compliant"

    return {
        "overall_status": overall_status,
        "passed_count": passed,
        "total_checks": total,
        "needs_human_review": needs_review,
        "ocr_quality_flag": ocr_status,
        "checks": checks,
    }


# ---------------------------------------------------------------------------
# STEP 3 FROM THE GUIDE: test with fake text you type yourself
# Run this file directly: python rule_engine.py
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import json

    # Sample 1 — fully compliant
    sample_text_1 = """
    Marketed by: ABC Foods Pvt Ltd, Sector 5, Gurugram
    Net Wt. 200g
    MRP Rs.85 incl. of all taxes
    Mfg Date: 03/2026
    Customer Care: 1800-123-4567, care@abcfoods.com
    """

    # Sample 2 — missing MRP and consumer care
    sample_text_2 = """
    Packed by: XYZ Industries, Mumbai
    Net Quantity: 500 ml
    Pkd Date: Jan 2026
    """

    # Sample 3 — missing ONLY the mfg date
    sample_text_3 = """
    Manufactured by: PureGlow Cosmetics Ltd, Andheri, Mumbai
    Net Qty: 100 ml
    MRP Rs.199 incl. of all taxes
    Consumer Care: support@pureglow.in
    """

    # Sample 4 — MRP present but WITHOUT the "incl. of all taxes" note
    # (checks whether your code correctly flags this as a weaker/low-confidence pass)
    sample_text_4 = """
    Mfd by: Sunrise Detergents, Pune
    Net Wt. 1kg
    MRP Rs 150/-
    Mfg Date: 06/2026
    Helpline: 9876543210
    """

    # Sample 5 — almost empty text, simulates a bad/blurry OCR read
    sample_text_5 = """
    ABC
    """

    # Sample 6 — everything present but worded unusually / different order
    sample_text_6 = """
    This product is packed by Nature's Basket Foods, located at Plot 12, MIDC, Nashik.
    Contents: 750g approx. Price MRP Rs.310 (incl. of all taxes).
    Packed on 09/2026. For queries call 1800-999-8888 or email hello@naturesbasket.in
    """

    samples = [
        sample_text_1, sample_text_2, sample_text_3,
        sample_text_4, sample_text_5, sample_text_6
    ]

    for i, sample in enumerate(samples, start=1):
        print(f"\n--- Sample {i} ---")
        result = check_compliance(sample)
        print(json.dumps(result, indent=2))
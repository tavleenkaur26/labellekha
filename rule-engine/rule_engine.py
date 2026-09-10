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
    """Rule 6(1)(e) — retail sale price (MRP), inclusive of all taxes."""
    pattern = r"(?:MRP|M\.?R\.?P\.?|Maximum Retail Price|Retail Sale Price)[^\d₹]{0,15}[₹Rs.]*\s?(\d+[.,]?\d*)"
    match = re.search(pattern, text, re.IGNORECASE)
    has_tax_note = bool(re.search(r"incl(?:usive|\.)?\s?of\s?(?:all\s?)?tax", text, re.IGNORECASE))
    return {
        "clause": "Rule 6(1)(e)",
        "title": "Retail Sale Price (MRP)",
        "pass": bool(match),
        "evidence": match.group(0).strip() if match else None,
        "confidence": "high" if (match and has_tax_note) else ("low" if match else "low"),
        "note": None if has_tax_note or not match else "MRP found but 'inclusive of all taxes' phrasing not detected — flag for review",
    }


def check_consumer_care(text: str) -> dict:
    """Rule 6(2) — consumer complaint contact (name/address/phone/email)."""
    pattern = r"(Customer\s?Care|Consumer\s?Care|Toll[\s-]?Free|Helpline|Email|Contact)[:\s]+[A-Za-z0-9@.,\s\-]{4,60}"
    match = re.search(pattern, text, re.IGNORECASE)
    return {
        "clause": "Rule 6(2)",
        "title": "Consumer Complaint Contact",
        "pass": bool(match),
        "evidence": match.group(0).strip() if match else None,
        "confidence": "high" if match else "low",
    }


def check_font_size_placeholder(image_metadata: dict | None = None) -> dict:
    """Rule 7 — placeholder only. Real implementation needs pixel-height
    measurement from Role 2, which needs a reference object or calibration.
    Always returns 'not evaluated' honestly rather than faking a result."""
    return {
        "clause": "Rule 7",
        "title": "Letter Height / Font Size Requirement",
        "pass": None,  # None = "not evaluated", NOT a pass or fail
        "evidence": None,
        "confidence": "not_evaluated",
        "note": "Approximate/heuristic check pending Role 2 — not faked as pass/fail.",
    }


# ---------------------------------------------------------------------------
# MAIN ENTRY POINT — this is what Role 2 (OCR) and Role 4 (backend) call
# ---------------------------------------------------------------------------

def check_compliance(extracted_text: str) -> dict:
    """
    Takes raw OCR-extracted text, runs it through all clause checks,
    returns a full compliance result. This is your CONTRACT with the team.
    """
    checks = [
        check_manufacturer(extracted_text),
        check_generic_name(extracted_text),
        check_net_quantity(extracted_text),
        check_mfg_date(extracted_text),
        check_mrp(extracted_text),
        check_consumer_care(extracted_text),
        check_font_size_placeholder(),
    ]

    # Only count checks that were actually evaluated (skip font-size placeholder)
    scored_checks = [c for c in checks if c["pass"] is not None]
    passed = sum(1 for c in scored_checks if c["pass"])
    total = len(scored_checks)

    # Flag for human review if any check has low confidence, even if it "passed"
    needs_review = any(c["confidence"] == "low" for c in scored_checks)

    overall_status = "compliant" if passed == total else "non-compliant"

    return {
        "overall_status": overall_status,
        "passed_count": passed,
        "total_checks": total,
        "needs_human_review": needs_review,
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
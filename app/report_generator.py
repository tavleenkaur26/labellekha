"""
Report generation for a single scan — redesigned structure:
verdict-first summary, product photo + metadata panel, card-based clause
results with colored left borders and visually distinct evidence snippets.
"""

import csv
import io
import os
from datetime import datetime
from weasyprint import HTML

STATUS_COLORS = {
    "compliant": "#2e7d32",
    "non-compliant": "#c62828",
}

PASS_BORDER_COLORS = {
    True: "#2e7d32",
    False: "#c62828",
    None: "#9e9e9e",
}

PASS_BADGE_COLORS = {
    True: "#2e7d32",
    False: "#c62828",
    None: "#757575",
}

PASS_LABELS = {
    True: "PASS",
    False: "FAIL",
    None: "NOT EVALUATED",
}


def _format_timestamp(ts: str) -> str:
    try:
        dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        return dt.strftime("%d %b %Y, %I:%M %p UTC")
    except Exception:
        return ts


def _clause_cards_html(checks):
    cards = []
    for c in checks:
        border_color = PASS_BORDER_COLORS.get(c["pass"], "#9e9e9e")
        badge_color = PASS_BADGE_COLORS.get(c["pass"], "#757575")
        label = PASS_LABELS.get(c["pass"], "N/A")
        muted_class = " muted-card" if c["pass"] is None else ""

        if c.get("evidence"):
            evidence_html = f'<div class="evidence-snippet">&ldquo;{c["evidence"]}&rdquo;</div>'
        elif c["pass"] is None:
            evidence_html = '<div class="evidence-snippet placeholder">Check not yet implemented / awaiting calibration data</div>'
        else:
            evidence_html = '<div class="evidence-snippet placeholder">Not detected on label</div>'

        secondary_bits = []
        confidence = c.get("confidence")
        if confidence and confidence != "not_evaluated":
            conf_class = " low" if confidence == "low" else ""
            secondary_bits.append(f'<span class="conf{conf_class}">Confidence: {confidence}</span>')
        if c.get("note"):
            secondary_bits.append(f'<span class="note-text">Note: {c["note"]}</span>')
        secondary_html = "".join(f"<div>{b}</div>" for b in secondary_bits)

        cards.append(f"""
        <div class="clause-card{muted_class}" style="border-left-color:{border_color}">
            <div class="clause-card-header">
                <div class="clause-title-block">
                    <div class="clause-title">{c['title']}</div>
                    <div class="clause-ref">{c['clause']}</div>
                </div>
                <span class="badge" style="background:{badge_color}">{label}</span>
            </div>
            {evidence_html}
            {secondary_html}
        </div>
        """)
    return "\n".join(cards)


def _build_html(scan: dict, base_dir: str) -> str:
    result = scan["compliance_result"]
    status = result["overall_status"]
    status_color = STATUS_COLORS.get(status, "#555")
    status_label = status.upper().replace("-", " ")

    passed = result["passed_count"]
    total = result["total_checks"]
    pass_ratio = (passed / total * 100) if total else 0

    image_url = scan.get("image_url")
    if image_url:
        image_path = os.path.join(base_dir, image_url)
        image_html = f'<img src="{image_path}" class="product-photo" /><div class="photo-caption">Scanned label image</div>'
    else:
        image_html = '<div class="no-photo">No product photo available for this scan</div>'

    review_html = ""
    if result.get("needs_human_review"):
        review_html = '<div class="review-strip">⚠ Flagged for human review — one or more checks below have low confidence</div>'

    clause_cards = _clause_cards_html(result["checks"])

    return f"""
    <html>
    <head>
    <style>
        @page {{ margin: 36px 40px; }}
        body {{ font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; margin: 0; font-size: 13px; }}

        .header-band {{ display: flex; justify-content: space-between; align-items: flex-start;
                         border-bottom: 2px solid #222; padding-bottom: 12px; margin-bottom: 16px; }}
        .header-title {{ font-size: 19px; font-weight: 700; margin: 0; }}
        .header-subtitle {{ font-size: 11px; color: #666; margin-top: 2px; }}
        .header-meta {{ text-align: right; font-size: 10px; color: #888; }}

        .verdict-card {{ border: 1px solid #ddd; border-radius: 6px; padding: 14px 18px; margin-bottom: 16px; }}
        .verdict-top {{ display: flex; justify-content: space-between; align-items: center; }}
        .verdict-badge {{ display: inline-block; background: {status_color}; color: white;
                           padding: 6px 16px; border-radius: 4px; font-weight: bold; font-size: 15px; }}
        .verdict-ratio {{ font-size: 12px; color: #444; text-align: right; }}
        .ratio-bar {{ width: 160px; height: 8px; border-radius: 4px; background: #e74c3c;
                      overflow: hidden; margin-top: 4px; margin-left: auto; }}
        .ratio-fill {{ height: 100%; background: #2e7d32; width: {pass_ratio:.0f}%; }}
        .review-strip {{ margin-top: 10px; font-size: 11px; color: #8a6100; background: #fff8e1;
                          border: 1px solid #ffe082; padding: 6px 10px; border-radius: 4px; }}

        .evidence-panel {{ display: flex; gap: 20px; margin-bottom: 18px; }}
        .photo-block {{ width: 38%; }}
        .product-photo {{ width: 100%; max-height: 260px; object-fit: cover; border: 1px solid #ccc; border-radius: 4px; }}
        .photo-caption {{ font-size: 10px; color: #999; margin-top: 4px; text-align: center; }}
        .no-photo {{ width: 100%; height: 160px; border: 1px dashed #aaa; border-radius: 4px;
                     display: flex; align-items: center; justify-content: center; color: #888;
                     font-size: 11px; text-align: center; padding: 10px; }}
        .meta-block {{ width: 62%; }}
        .meta-block table {{ width: 100%; border-collapse: collapse; }}
        .meta-block td {{ padding: 5px 0; font-size: 12px; border-bottom: 1px solid #eee; }}
        .meta-key {{ color: #777; width: 40%; }}

        .section-label {{ font-size: 12px; font-weight: 700; text-transform: uppercase;
                           letter-spacing: 0.04em; color: #444; margin: 4px 0 10px 0; }}

        .clause-card {{ border: 1px solid #e5e5e5; border-left-width: 4px; border-left-style: solid;
                         border-radius: 4px; padding: 10px 14px; margin-bottom: 8px; }}
        .clause-card.muted-card {{ background: #fafafa; }}
        .clause-card-header {{ display: flex; justify-content: space-between; align-items: flex-start; }}
        .clause-title {{ font-size: 12.5px; font-weight: 600; }}
        .clause-ref {{ font-size: 10px; color: #999; margin-top: 1px; }}
        .badge {{ color: white; padding: 2px 10px; border-radius: 10px; font-size: 10.5px;
                   font-weight: bold; white-space: nowrap; height: fit-content; }}
        .evidence-snippet {{ font-size: 12px; font-style: italic; color: #333; margin-top: 6px;
                              padding-left: 10px; border-left: 2px solid #ddd; }}
        .evidence-snippet.placeholder {{ color: #999; }}
        .conf {{ font-size: 10px; color: #666; }}
        .conf.low {{ color: #b26a00; }}
        .note-text {{ font-size: 10px; color: #8a6100; }}

        .summary-line {{ font-size: 11px; color: #555; margin: 10px 0 4px 0; }}
        .footer {{ margin-top: 24px; font-size: 9px; color: #999; border-top: 1px solid #eee; padding-top: 8px; }}
    </style>
    </head>
    <body>
        <div class="header-band">
            <div>
                <p class="header-title">Legal Metrology Compliance Report</p>
                <div class="header-subtitle">Legal Metrology (Packaged Commodities) Rules, 2011</div>
            </div>
            <div class="header-meta">
                Product ID: {scan['id']}<br/>
                Generated: {_format_timestamp(scan['timestamp'])}
            </div>
        </div>

        <div class="verdict-card">
            <div class="verdict-top">
                <span class="verdict-badge">{status_label}</span>
                <div class="verdict-ratio">
                    {passed} of {total} scored clauses passed
                    <div class="ratio-bar"><div class="ratio-fill"></div></div>
                </div>
            </div>
            {review_html}
        </div>

        <div class="evidence-panel">
            <div class="photo-block">
                {image_html}
            </div>
            <div class="meta-block">
                <table>
                    <tr><td class="meta-key">Product ID</td><td>{scan['id']}</td></tr>
                    <tr><td class="meta-key">Product Category</td><td>{scan.get('category') or 'N/A'}</td></tr>
                    <tr><td class="meta-key">Region</td><td>{scan.get('region') or 'N/A'}</td></tr>
                    <tr><td class="meta-key">Scanned By</td><td>{scan.get('user_role') or 'N/A'}</td></tr>
                    <tr><td class="meta-key">Consent Given</td><td>{scan.get('consent_flag')}</td></tr>
                </table>
            </div>
        </div>

        <div class="section-label">Clause-by-Clause Results</div>
        {clause_cards}
        <div class="summary-line">Font-size check excluded from the passed-count above when not evaluated.</div>

        <div class="footer">
            This is a system-generated preliminary compliance check produced by an AI-based
            OCR and rule-matching pipeline. It is intended to assist review and prioritization,
            not to serve as a final legal determination.
        </div>
    </body>
    </html>
    """


def generate_pdf_report(scan: dict, output_path: str, base_dir: str = "."):
    html_str = _build_html(scan, base_dir)
    HTML(string=html_str, base_url=base_dir).write_pdf(output_path)
    return output_path


def _csv_rows(scan):
    result = scan["compliance_result"]
    rows = [
        ["Product ID", scan["id"]],
        ["Timestamp", scan["timestamp"]],
        ["Category", scan.get("category") or ""],
        ["Region", scan.get("region") or ""],
        ["Overall Status", result["overall_status"]],
        ["Needs Human Review", result["needs_human_review"]],
        ["Passed", f"{result['passed_count']}/{result['total_checks']}"],
        ["Image URL", scan.get("image_url") or "N/A"],
        [],
        ["Clause", "Title", "Result", "Evidence / Notes", "Confidence", "Note"],
    ]
    for c in result["checks"]:
        if c.get("evidence"):
            evidence_text = c["evidence"]
        elif c["pass"] is None:
            evidence_text = "Check not yet implemented / awaiting calibration data"
        else:
            evidence_text = "Not detected on label"
        rows.append([
            c["clause"],
            c["title"],
            PASS_LABELS.get(c["pass"], "N/A"),
            evidence_text,
            c.get("confidence", ""),
            c.get("note") or "",
        ])
    return rows


def generate_csv_report(scan: dict, output_path: str):
    with open(output_path, "w", newline="") as f:
        writer = csv.writer(f)
        for row in _csv_rows(scan):
            writer.writerow(row)
    return output_path


def generate_csv_bytes(scan: dict) -> bytes:
    buf = io.StringIO()
    writer = csv.writer(buf)
    for row in _csv_rows(scan):
        writer.writerow(row)
    return buf.getvalue().encode("utf-8")

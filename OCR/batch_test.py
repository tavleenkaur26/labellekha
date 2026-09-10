"""
Quick batch runner — tests every image in this folder through extract_text()
and check_compliance(), prints a summary table + full details.

Run: python3 batch_test.py
"""

import os
import sys
import glob
import json

from extract import extract_text
from rule_engine import check_compliance

IMAGE_EXTENSIONS = (".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG")

def main():
    folder = os.path.dirname(os.path.abspath(__file__))
    images = []
    for ext in IMAGE_EXTENSIONS:
        images.extend(glob.glob(os.path.join(folder, f"*{ext}")))
    images = sorted(set(images))

    if not images:
        print("No images found in this folder.")
        return

    print(f"Found {len(images)} image(s): {[os.path.basename(i) for i in images]}\n")
    print("=" * 70)

    summary = []

    for path in images:
        name = os.path.basename(path)
        print(f"\n### {name} ###")
        try:
            text = extract_text(path)
            result = check_compliance(text)
            print("--- OCR TEXT ---")
            print(text if text.strip() else "(nothing detected)")
            print("\n--- COMPLIANCE RESULT ---")
            print(json.dumps(result, indent=2))
            summary.append({
                "file": name,
                "status": result["overall_status"],
                "passed": f"{result['passed_count']}/{result['total_checks']}",
                "needs_review": result["needs_human_review"],
                "ocr_char_count": len(text.strip()),
            })
        except Exception as e:
            print(f"ERROR: {e}")
            summary.append({"file": name, "status": "ERROR", "error": str(e)})
        print("=" * 70)

    print("\n\n########## SUMMARY ##########")
    for row in summary:
        print(row)


if __name__ == "__main__":
    main()
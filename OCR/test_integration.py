import sys
sys.path.append('../rule-engine')

from extract import extract_text
from rule_engine import check_compliance
import json

# Test with a real image, using return_dict=True to get font_stats too
output = extract_text("lakme.JPG", return_dict=True)

print("--- OCR Status ---")
print(f"Status: {output['status']}")
print(f"Confidence: {output['confidence']}%")
print(f"Recapture needed: {output['recapture_needed']}")
print(f"Font stats: {output['font_stats']}")
print()
print("--- Cleaned Text ---")
print(output['text'])
print()

result = check_compliance(output['text'], ocr_metadata=output)
print("--- Compliance Result ---")
print(json.dumps(result, indent=2))
import os
import glob
from extract import extract_text

# Gracefully mock rule_engine if Role 1's code isn't present
try:
    from rule_engine import check_compliance
except ImportError:
    def check_compliance(text):
        return {"status": "mocked", "message": "Rule engine not integrated"}

IMAGE_EXTENSIONS = ('*.jpg', '*.jpeg', '*.JPG', '*.JPEG', '*.png', '*.PNG')

def run_batch_test():
    image_files = []
    for ext in IMAGE_EXTENSIONS:
        image_files.extend(glob.glob(ext))
    
    image_files = sorted(list(set(image_files)))
    print(f"Found {len(image_files)} image(s): {image_files}\n")

    summary = []

    for img_path in image_files:
        print("=" * 70)
        print(f"### {img_path} ###")
        
        # Call with return_dict=True to access diagnostics
        res = extract_text(img_path, return_dict=True)
        
        # Handle backward compatibility if plain string was returned
        if isinstance(res, dict):
            text = res.get("text", "")
            status = res.get("status", "unknown")
            conf = res.get("confidence", 0.0)
            chars = res.get("char_count", len(text))
        else:
            text = str(res)
            chars = len(text)
            status = "recapture_needed" if chars < 30 else "success"
            conf = 0.0

        summary.append({
            "file": img_path,
            "chars": chars,
            "status": status,
            "conf": conf
        })

        print("--- OCR OUTPUT PREVIEW ---")
        preview = text[:250].replace('\n', ' ')
        print(preview if preview else "[NO READABLE TEXT FOUND]")
        print(f"\n[Status: {status} | Chars: {chars} | Conf: {conf}%]")

    # Print Final Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"{'Filename':<22} | {'Chars':<7} | {'Status':<18} | {'Conf'}")
    print("-" * 70)
    for item in summary:
        print(f"{item['file']:<22} | {item['chars']:<7} | {item['status']:<18} | {item['conf']}%")

if __name__ == "__main__":
    run_batch_test()
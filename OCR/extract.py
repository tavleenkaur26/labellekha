import cv2
import pytesseract
import numpy as np
import re
from typing import Dict, Any, Union

def auto_rotate(img: np.ndarray) -> np.ndarray:
    """Detect text orientation using Tesseract OSD and rotate upright."""
    try:
        osd_output = pytesseract.image_to_osd(img)
        match_angle = re.search(r'(?<=Rotate: )\d+', osd_output)
        match_conf = re.search(r'(?<=Orientation confidence: )\d+\.?\d*', osd_output)
        if match_angle:
            angle = int(match_angle.group(0))
            conf = float(match_conf.group(0)) if match_conf else 0.0
            if conf > 1.5:
                if angle == 90:
                    return cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
                elif angle == 180:
                    return cv2.rotate(img, cv2.ROTATE_180)
                elif angle == 270:
                    return cv2.rotate(img, cv2.ROTATE_90_COUNTERCLOCKWISE)
    except Exception:
        pass
    return img

def clean_ocr_text(raw_text: str) -> str:
    """
    Cleans OCR artifacts, normalizes currencies/units, and strips garbage lines
    specifically for Legal Metrology Packaged Commodities (Rule 6) clauses.
    """
    if not raw_text:
        return ""

    text = raw_text

    # 1. Standardize MRP & fix OCR misreads of 'Rs.' / rupee symbols
    text = re.sub(r'\bM[\.\s]*A[\.\s]*P\b', 'MRP', text, flags=re.IGNORECASE)
    text = re.sub(r'\bM\s*R\s*P\b', 'MRP', text, flags=re.IGNORECASE)
    # Convert 'MRP <', 'MRP :', 'MRP =' to standard 'MRP Rs.'
    text = re.sub(r'\bMRP\s*[:<=]\s*', 'MRP Rs. ', text, flags=re.IGNORECASE)
    text = re.sub(r'\bRs\s*[\.:]\s*', 'Rs. ', text, flags=re.IGNORECASE)
    # Fix dot-matrix decimal slips (e.g., '50. D.00' -> '50.00')
    text = re.sub(r'(\d+)\.\s*[A-Za-z]\.(\d+)', r'\1.\2', text)

    # 2. Normalize Net Quantity & Units
    text = re.sub(r'\bN\s*e\s*t\b', 'Net', text, flags=re.IGNORECASE)
    text = re.sub(r'\bQ\s*t\s*y\b', 'Qty', text, flags=re.IGNORECASE)
    text = re.sub(r'(\d+)\s*g\s*m\b', r'\1 gm', text, flags=re.IGNORECASE)
    text = re.sub(r'(\d+)\s*m\s*l\b', r'\1 ml', text, flags=re.IGNORECASE)
    text = re.sub(r'(\d+)\s*k\s*g\b', r'\1 kg', text, flags=re.IGNORECASE)

    # 3. Clean Consumer Care, Phone, and Email headers
    # Strips misread garbage prefixes like 'tee.' or stray punctuation after 'PHONE NO:'
    text = re.sub(r'\bPHONE\s*(?:NO|NUMBER)?\s*[:\.-]?\s*(?:[a-zA-Z]{1,3}\.?)?\s*', 'PHONE NO: ', text, flags=re.IGNORECASE)
    text = re.sub(r'\bE[-\s]?mail\s*[:\.-]?\s*', 'Email: ', text, flags=re.IGNORECASE)

    # 4. Clean dot-matrix and stray OCR lines
    lines = text.split('\n')
    cleaned_lines = []
    for line in lines:
        stripped = line.strip()
        # Drop lines shorter than 3 chars
        if len(stripped) < 3:
            continue
        # Drop lines with mostly punctuation or random stray fragments (e.g., '8 lJ 17 1\'', 'ws ow aci T')
        alpha_count = sum(c.isalnum() for c in stripped)
        if alpha_count / len(stripped) < 0.5:
            continue
        # Drop short non-alphanumeric lowercase noise
        if len(stripped.split()) <= 4 and all(len(w) <= 2 for w in stripped.split()):
            continue
        cleaned_lines.append(stripped)

    normalized = '\n'.join(cleaned_lines)
    return re.sub(r'[ \t]+', ' ', normalized)

def compute_font_heuristics(font_metadata: list, img_height: int) -> Dict[str, Any]:
    """Computes approximate font-size metrics relative to package dimensions."""
    if not font_metadata or img_height <= 0:
        return {
            "avg_font_px": 0.0,
            "min_font_px": 0,
            "max_font_px": 0,
            "relative_height_ratio": 0.0,
            "estimated_mm": 0.0,
            "note": "Approximate uncalibrated heuristic"
        }

    clean_words = [item for item in font_metadata if len(item["word"]) > 1]
    if not clean_words:
        clean_words = font_metadata

    heights = [item["box"]["height"] for item in clean_words]
    avg_h = float(np.mean(heights))
    min_h = int(np.min(heights))
    max_h = int(np.max(heights))

    relative_ratio = round(avg_h / img_height, 4)
    estimated_mm = round(relative_ratio * 150.0, 2)

    return {
        "avg_font_px": round(avg_h, 2),
        "min_font_px": min_h,
        "max_font_px": max_h,
        "relative_height_ratio": relative_ratio,
        "estimated_mm": estimated_mm,
        "note": "Approximate uncalibrated font size heuristic"
    }

def extract_text(image_input: Union[str, np.ndarray], return_dict: bool = False) -> Union[str, Dict[str, Any]]:
    if isinstance(image_input, str):
        img = cv2.imread(image_input)
    else:
        img = image_input

    if img is None:
        result = {
            "status": "error",
            "text": "",
            "message": "Invalid or unreadable image file.",
            "char_count": 0,
            "confidence": 0.0,
            "recapture_needed": True,
            "font_metadata": [],
            "font_stats": compute_font_heuristics([], 0)
        }
        return result if return_dict else ""

    img_h, img_w = img.shape[:2]

    # 1. Orientation correction
    img = auto_rotate(img)

    # 2. OCR configuration
    custom_config = r'--oem 3 --psm 3'
    raw_extracted_text = pytesseract.image_to_string(img, config=custom_config)
    
    # 3. Clean and normalize text
    cleaned_text = clean_ocr_text(raw_extracted_text)

    # 4. Bounding box & confidence data
    data = pytesseract.image_to_data(img, config=custom_config, output_type=pytesseract.Output.DICT)
    
    font_metadata = []
    valid_confidences = []

    for i in range(len(data['text'])):
        word = data['text'][i].strip()
        conf = int(data['conf'][i])
        h = int(data['height'][i])
        w = int(data['width'][i])

        if word and conf > 0 and h > 2:
            valid_confidences.append(conf)
            font_metadata.append({
                "word": word,
                "confidence": conf,
                "box": {
                    "left": int(data['left'][i]),
                    "top": int(data['top'][i]),
                    "width": w,
                    "height": h
                }
            })

    avg_confidence = round(float(np.mean(valid_confidences)), 2) if valid_confidences else 0.0
    char_count = len(cleaned_text)

    # 5. Check quality threshold
    recapture = char_count < 30 or avg_confidence < 30.0
    status = "recapture_needed" if recapture else "success"
    message = "Recapture needed: blurry or sparse text." if recapture else "Text extracted and normalized successfully."

    # 6. Compute font size statistics
    font_stats = compute_font_heuristics(font_metadata, img_h)

    result = {
        "status": status,
        "text": cleaned_text,
        "message": message,
        "char_count": char_count,
        "confidence": avg_confidence,
        "recapture_needed": recapture,
        "font_stats": font_stats,
        "font_metadata": font_metadata
    }

    if return_dict:
        return result
    return cleaned_text

if __name__ == "__main__":
    import sys
    test_img = sys.argv[1] if len(sys.argv) > 1 else "melody.JPG"
    output = extract_text(test_img, return_dict=True)
    print(f"Status: {output['status']}")
    print(f"Confidence: {output['confidence']}%")
    print(f"Font Stats: {output['font_stats']}")
    print("-" * 50)
    print(output['text'])
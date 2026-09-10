import cv2
import pytesseract
import numpy as np
import re
from typing import Dict, Any, Union

COMMON_METROLOGY_WORDS = {
    "mrp", "rs", "net", "qty", "quantity", "mfd", "batch", "pkd", "use",
    "before", "date", "exp", "expiry", "care", "consumer", "customer", "email",
    "phone", "tel", "ltd", "pvt", "limited", "products", "road", "street",
    "mumbai", "delhi", "india", "regd", "office", "lic", "fssai", "weight",
    "ingredients", "nutrition", "energy", "fat", "sugar", "protein", "carbohydrate",
    "free", "gm", "ml", "kg", "grams", "milliliters", "inclusive", "taxes",
    "parle", "nestle", "haldiram", "cell", "crossing", "vile"
}

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

def preprocess_image(img: np.ndarray) -> np.ndarray:
    """Converts to grayscale, resizes if overly large, and applies CLAHE for contrast."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    h, w = gray.shape
    if max(h, w) > 2200:
        scale = 2200 / max(h, w)
        gray = cv2.resize(gray, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)
    return enhanced

def clean_ocr_text(raw_text: str) -> str:
    """Normalizes common Legal Metrology OCR misreads and cleans non-text artifacts."""
    if not raw_text:
        return ""

    text = raw_text

    # Standardize metrology keywords
    text = re.sub(r'\bM[\.\s]*A[\.\s]*P\b', 'MRP', text, flags=re.IGNORECASE)
    text = re.sub(r'\bM\s*R\s*P\b', 'MRP', text, flags=re.IGNORECASE)
    text = re.sub(r'\bMRP\s*[:<=]\s*', 'MRP Rs. ', text, flags=re.IGNORECASE)
    text = re.sub(r'\bRs\s*[\.:]\s*', 'Rs. ', text, flags=re.IGNORECASE)

    # Unit normalizations
    text = re.sub(r'\bN\s*e\s*t\b', 'Net', text, flags=re.IGNORECASE)
    text = re.sub(r'\bQ\s*t\s*y\b', 'Qty', text, flags=re.IGNORECASE)
    text = re.sub(r'(\d+)\s*g\s*m\b', r'\1 gm', text, flags=re.IGNORECASE)
    text = re.sub(r'(\d+)\s*m\s*l\b', r'\1 ml', text, flags=re.IGNORECASE)
    text = re.sub(r'(\d+)\s*k\s*g\b', r'\1 kg', text, flags=re.IGNORECASE)

    # Consumer care & contact prefixes
    text = re.sub(r'\bPHONE\s*(?:NO|NUMBER)?\s*[:\.-]?\s*(?:[a-zA-Z]{1,3}\.?)?\s*', 'PHONE NO: ', text, flags=re.IGNORECASE)
    text = re.sub(r'\bE[-\s]?mail\s*[:\.-]?\s*', 'Email: ', text, flags=re.IGNORECASE)

    # Line-level filtering
    lines = text.split('\n')
    cleaned_lines = []
    for line in lines:
        stripped = line.strip()
        if len(stripped) < 3:
            continue
        alpha_count = sum(c.isalnum() for c in stripped)
        if alpha_count / len(stripped) < 0.4:
            continue
        cleaned_lines.append(stripped)

    normalized = '\n'.join(cleaned_lines)
    return re.sub(r'[ \t]+', ' ', normalized)

def compute_font_heuristics(font_metadata: list, img_height: int) -> Dict[str, Any]:
    """Calculates approximate font height metrics relative to image dimensions."""
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

def evaluate_quality(text: str, avg_conf: float, words_list: list) -> tuple:
    """
    Checks if extracted text contains sufficient genuine language data.
    Returns (is_recapture_needed, reason, word_ratio).
    """
    if len(text.strip()) < 30:
        return True, "Sparse text detected (< 30 characters).", 0.0

    if not words_list:
        return True, "No recognizable words detected.", 0.0

    valid_word_count = 0
    clean_tokens = [re.sub(r'[^a-zA-Z]', '', w.lower()) for w in words_list]
    clean_tokens = [w for w in clean_tokens if len(w) >= 2]

    if not clean_tokens:
        return True, "No alphabetic word tokens found.", 0.0

    for token in clean_tokens:
        if token in COMMON_METROLOGY_WORDS or len(token) >= 4:
            valid_word_count += 1

    word_ratio = round(valid_word_count / len(clean_tokens), 2)

    # Floor for unreadable noisy captures
    if avg_conf < 35.0:
        return True, f"Low OCR confidence ({avg_conf}%).", word_ratio

    # Catch borderline scans with high proportion of garbage tokens
    if avg_conf < 50.0 and word_ratio < 0.30:
        return True, f"Low quality text: {int(word_ratio*100)}% valid words at {avg_conf}% confidence.", word_ratio

    return False, "Quality acceptable.", word_ratio

def extract_text(image_input: Union[str, np.ndarray], return_dict: bool = False) -> Union[str, Dict[str, Any]]:
    """
    Main extraction interface.
    Returns plain string if return_dict=False (compatible with standard rule engine calls).
    Returns structured dictionary if return_dict=True.
    """
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
    img_upright = auto_rotate(img)

    # 2. Glare reduction & edge contrast
    processed_gray = preprocess_image(img_upright)

    # 3. OCR extraction
    custom_config = r'--oem 3 --psm 3'
    raw_extracted_text = pytesseract.image_to_string(processed_gray, config=custom_config)

    # 4. Clean text
    cleaned_text = clean_ocr_text(raw_extracted_text)

    # 5. Extract bounding boxes and confidences
    data = pytesseract.image_to_data(processed_gray, config=custom_config, output_type=pytesseract.Output.DICT)

    font_metadata = []
    valid_confidences = []
    detected_words = []

    for i in range(len(data['text'])):
        word = data['text'][i].strip()
        conf = int(data['conf'][i])
        h = int(data['height'][i])
        w = int(data['width'][i])

        if word and conf > 0 and h > 2:
            valid_confidences.append(conf)
            detected_words.append(word)
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

    # 6. Quality assessment
    recapture, reason, word_ratio = evaluate_quality(cleaned_text, avg_confidence, detected_words)
    status = "recapture_needed" if recapture else "success"

    # 7. Font size heuristic computation
    font_stats = compute_font_heuristics(font_metadata, img_h)

    result = {
        "status": status,
        "text": cleaned_text,
        "message": reason if recapture else "Text extracted and normalized successfully.",
        "char_count": char_count,
        "confidence": avg_confidence,
        "valid_word_ratio": word_ratio,
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
    print(f"Confidence: {output['confidence']}% | Word Ratio: {output.get('valid_word_ratio', 0)}")
    print(f"Message: {output['message']}")
    print(f"Font Stats: {output['font_stats']}")
    print("-" * 50)
    print(output['text'][:300])
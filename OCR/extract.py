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
            
            # Apply rotation if OSD has reasonable confidence (> 1.5)
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
    

def extract_text(image_input: Union[str, np.ndarray], return_dict: bool = False) -> Union[str, Dict[str, Any]]:
    """
    Main extraction interface.
    Returns plain string if return_dict=False (default for simple scripts).
    Returns full metadata dictionary if return_dict=True.
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
            "font_metadata": []
        }
        return result if return_dict else ""

    # 1. Orientation correction
    img = auto_rotate(img)

    # 2. OCR configuration
    custom_config = r'--oem 3 --psm 3'
    extracted_text = pytesseract.image_to_string(img, config=custom_config).strip()
    
    # 3. Bounding box & confidence data
    data = pytesseract.image_to_data(img, config=custom_config, output_type=pytesseract.Output.DICT)
    
    font_metadata = []
    valid_confidences = []

    for i in range(len(data['text'])):
        word = data['text'][i].strip()
        conf = int(data['conf'][i])
        if word and conf > 0:
            valid_confidences.append(conf)
            font_metadata.append({
                "word": word,
                "confidence": conf,
                "box": {
                    "left": data['left'][i],
                    "top": data['top'][i],
                    "width": data['width'][i],
                    "height": data['height'][i]
                }
            })

    avg_confidence = round(float(np.mean(valid_confidences)), 2) if valid_confidences else 0.0
    char_count = len(extracted_text)

    # 4. Check quality threshold
    recapture = char_count < 30 or avg_confidence < 30.0
    status = "recapture_needed" if recapture else "success"
    message = "Recapture needed: blurry or sparse text." if recapture else "Text extracted successfully."

    result = {
        "status": status,
        "text": extracted_text,
        "message": message,
        "char_count": char_count,
        "confidence": avg_confidence,
        "recapture_needed": recapture,
        "font_metadata": font_metadata
    }

    if return_dict:
        return result
    return extracted_text

if __name__ == "__main__":
    import sys
    test_img = sys.argv[1] if len(sys.argv) > 1 else "biscuit.JPG"
    output = extract_text(test_img, return_dict=True)
    print(f"Status: {output['status']}")
    print(f"Confidence: {output['confidence']}% | Characters: {output['char_count']}")
    print("-" * 40)
    print(output['text'][:300])
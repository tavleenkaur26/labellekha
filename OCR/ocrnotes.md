# OCR Engine Characterization & Failure Patterns (Role 2)

### 1. Orientation & Rotation (Fixed)
* **Symptom:** Inverted or sideways captures (e.g., `ferrerorocher.jpg`, `lakme.JPG`, `maggi.jpg`) resulted in garbled/mirrored text when scanned unrotated.
* **Resolution:** Integrated Tesseract OSD (`image_to_osd`) to detect 90°, 180°, and 270° orientations and apply OpenCV rotations prior to decoding.
* **Limitation:** OSD requires at least 3–4 uniform lines of text. On extremely sparse labels, orientation detection may fail silently.

### 2. High Reflections & Transparency (Handled via Recapture Gate)
* **Symptom:** Clear cosmetic bottles (`serum.jpg`) and glossy metallic foils scatter light, yielding fewer than 30 characters and low confidence (< 35%).
* **Resolution:** Added a strict quality gate. When character count or confidence falls below the threshold, the system flags `status: "recapture_needed"` rather than sending incomplete text to the Rule Engine (preventing false "missing declaration" penalties).

### 3. Curved & Cylindrical Packaging
* **Symptom:** Cans and bottles (`thumsup.jpg`) cause radial distortion where text curves away from the focal plane, reducing character confidence near edges (~49%).
* **Mitigation:** Best results occur when capturing the mandatory declaration panel flat-on in a single centered crop.

### 4. Dot-Matrix / Inkjet Stamped Fields
* **Symptom:** Batch numbers, dates, and MRPs printed via dot-matrix inkjet on foil often produce broken characters (e.g., `50. D.00` instead of `50.00`).
* **Mitigation:** Applied domain-specific regex normalizers in `clean_ocr_text` to repair common currency (`MAP` -> `MRP`, `Rs .` -> `Rs.`) and unit spacing (`g m` -> `gm`).

### 5. Font-Size Heuristic (Rule 6 Compliance)
* **Status:** Approximate & uncalibrated.
* **Method:** Computes bounding box pixel heights relative to image frame height (`avg_font_px / img_height`), estimating physical millimeters based on an average 20–25 cm mobile capture distance (~150 mm frame).
* **Note:** Serves as a screening tool. Definitive enforcement requires calibrated hardware or reference markers.
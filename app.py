import io
import logging
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from ultralytics import YOLO
from PIL import Image, UnidentifiedImageError
import torch
import json
from werkzeug.datastructures import FileStorage

# --- Basic Setup ---
app = Flask(__name__)
CORS(app, expose_headers=["Content-Type", "X-Json-Data"])  # Expose custom header

# ... (logging, device, and model loading code remains the same) ...
device = 'cuda' if torch.cuda.is_available() else 'cpu'
model = YOLO("model/best.pt").to(device)


# --- API Endpoint ---
@app.route("/predict", methods=["POST"])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided."}), 400

    file = request.files['image']

    try:
        image = Image.open(file.stream).convert("RGB")
    except UnidentifiedImageError:
        return jsonify({"error": "Invalid image file."}), 400

    try:
        results = model.predict(source=image, conf=0.25)
        
        # --- 1. Get Detection Data (JSON) ---
        detections = []
        if results and results[0].boxes:
            for box in results[0].boxes:
                detections.append({
                    "label": model.names[int(box.cls)],
                    "confidence": float(box.conf)
                })
        
        # --- 2. Get Annotated Image ---
        annotated_image_array = results[0].plot()
        result_pil = Image.fromarray(annotated_image_array)
        img_io = io.BytesIO()
        result_pil.save(img_io, 'JPEG')
        img_io.seek(0)
        
        # --- 3. Create a multipart response ---
        # We send the image as the main body and the JSON data in a custom header
        response = Response(img_io.read(), mimetype='image/jpeg')
        response.headers['X-Json-Data'] = json.dumps({"detections": detections})
        
        logging.info(f"Prediction successful. Found {len(detections)} objects.")
        return response

    except Exception as e:
        logging.error(f"An error occurred during prediction: {e}", exc_info=True)
        return jsonify({"error": "An internal server error occurred."}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
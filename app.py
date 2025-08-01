import io
import logging
import json
import os
import uuid
from datetime import datetime
import csv
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from ultralytics import YOLO
from PIL import Image, UnidentifiedImageError
import torch

# --- Basic Setup ---
app = Flask(__name__)
# Expose the custom header so the frontend can read it
CORS(app, expose_headers=["Content-Type", "X-Json-Data"])  

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- Model & Device Configuration ---
device = 'cuda' if torch.cuda.is_available() else 'cpu'
try:
    model = YOLO("model/best.pt").to(device)
    logging.info(f"Model loaded successfully on {device}")
except Exception as e:
    logging.error(f"Fatal error loading model: {e}")
    exit()

# --- Prediction Endpoint ---
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
        
        detections = []
        if results and results[0].boxes:
            for box in results[0].boxes:
                detections.append({
                    "label": model.names[int(box.cls)],
                    "confidence": float(box.conf),
                    "bbox": box.xyxyn.tolist()[0]
                })
        
        annotated_image_array = results[0].plot()
        result_pil = Image.fromarray(annotated_image_array)
        img_io = io.BytesIO()
        result_pil.save(img_io, 'JPEG')
        img_io.seek(0)
        
        response = Response(img_io.read(), mimetype='image/jpeg')
        response.headers['X-Json-Data'] = json.dumps({"detections": detections})
        
        logging.info(f"Prediction successful. Found {len(detections)} objects.")
        return response

    except Exception as e:
        logging.error(f"An error occurred during prediction: {e}", exc_info=True)
        return jsonify({"error": "An internal server error occurred."}), 500

# --- NEW: Feedback Endpoint ---
@app.route("/feedback", methods=["POST"])
def feedback():
    """
    Receives detailed user feedback from the form and logs it to a CSV file.
    """
    required_fields = ['image', 'incorrectLabel', 'correctLabel']
    if not all(field in request.form or field in request.files for field in required_fields):
        logging.warning(f"Feedback request missing required fields. Got: {request.form}")
        return jsonify({"error": "Missing required feedback data."}), 400

    file = request.files['image']
    
    # Create a unique filename for the image
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{uuid.uuid4().hex[:6]}.jpg"
    
    # Define directories for storing feedback
    feedback_image_dir = "feedback_data/images"
    feedback_log_file = "feedback_data/feedback_log.csv"
    
    # Create directories if they don't exist
    os.makedirs(feedback_image_dir, exist_ok=True)
    
    # Save the image
    image_path = os.path.join(feedback_image_dir, filename)
    file.save(image_path)

    # Prepare data for the CSV log
    log_data = {
        "timestamp": datetime.now().isoformat(),
        "image_filename": filename,
        "incorrect_label": request.form.get('incorrectLabel'),
        "correct_label": request.form.get('correctLabel'),
        "comments": request.form.get('comments', '')
    }

    # Write to the CSV file
    file_exists = os.path.isfile(feedback_log_file)
    with open(feedback_log_file, 'a', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=log_data.keys())
        if not file_exists:
            writer.writeheader()  # Write header only if file is new
        writer.writerow(log_data)

    logging.info(f"Received detailed feedback for '{filename}'.")
    return jsonify({"message": "Feedback received successfully."}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
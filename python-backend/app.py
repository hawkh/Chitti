from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
from PIL import Image
import io
import base64

app = Flask(__name__)
CORS(app)

model = None

def load_model():
    global model
    model = YOLO('best.pt')
    model.conf = 0.5
    model.iou = 0.45

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model_loaded': model is not None})

@app.route('/detect', methods=['POST'])
def detect():
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    data = request.json
    image_data = data.get('image')
    
    if not image_data:
        return jsonify({'error': 'No image provided'}), 400
    
    image_bytes = base64.b64decode(image_data.split(',')[1] if ',' in image_data else image_data)
    image = Image.open(io.BytesIO(image_bytes))
    
    results = model(image)[0]
    detections = []
    
    for box in results.boxes:
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        detections.append({
            'bbox': [float(x1), float(y1), float(x2 - x1), float(y2 - y1)],
            'confidence': float(box.conf[0]),
            'classId': int(box.cls[0]),
            'className': results.names[int(box.cls[0])]
        })
    
    return jsonify({'detections': detections})

load_model()

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)

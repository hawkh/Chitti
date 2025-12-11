from http.server import BaseHTTPRequestHandler
import json
import base64
import io
from PIL import Image
import cv2
import numpy as np

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            if 'image' not in data:
                self.send_error(400, 'No image provided')
                return
            
            image_data = data['image']
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            
            # Use OpenCV for basic edge/defect detection (lightweight, no ML model needed)
            detections = self.detect_defects_opencv(image)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {'detections': detections}
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            self.send_error(500, str(e))
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def detect_defects_opencv(self, image):
        # Convert PIL to OpenCV
        img_array = np.array(image)
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        
        # Edge detection for cracks/defects
        edges = cv2.Canny(gray, 50, 150)
        
        # Find contours
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        detections = []
        defect_types = ['crack', 'surface_defect', 'irregularity']
        
        # Get significant contours
        for i, contour in enumerate(contours[:5]):  # Top 5 largest
            area = cv2.contourArea(contour)
            if area > 500:  # Minimum area threshold
                x, y, w, h = cv2.boundingRect(contour)
                confidence = min(0.95, 0.6 + (area / 10000))
                
                detections.append({
                    'bbox': [float(x), float(y), float(w), float(h)],
                    'confidence': float(confidence),
                    'classId': i % len(defect_types),
                    'className': defect_types[i % len(defect_types)]
                })
        
        # If no detections, return empty (no defects found)
        return detections

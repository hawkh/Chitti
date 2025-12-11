from http.server import BaseHTTPRequestHandler
import json
import base64
import io
from PIL import Image

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
            
            detections = self.generate_mock_detections(image.width, image.height)
            
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
    
    def generate_mock_detections(self, width, height):
        import random
        
        num_defects = random.randint(1, 3)
        detections = []
        
        defect_types = ['crack', 'corrosion', 'deformation', 'surface_defect']
        
        for i in range(num_defects):
            x = random.randint(50, width - 150)
            y = random.randint(50, height - 150)
            w = random.randint(80, 150)
            h = random.randint(60, 120)
            
            detections.append({
                'bbox': [float(x), float(y), float(w), float(h)],
                'confidence': random.uniform(0.65, 0.95),
                'classId': i % len(defect_types),
                'className': defect_types[i % len(defect_types)]
            })
        
        return detections

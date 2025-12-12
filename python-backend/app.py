from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO
from PIL import Image
from contextlib import asynccontextmanager
import io
import base64
import uvicorn
import os

model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model
    try:
        # Try best-model.pt first
        if os.path.exists('best-model.pt'):
            model = YOLO('best-model.pt')
            print('✅ Model loaded successfully: best-model.pt')
        elif os.path.exists('best (5).pt'):
            model = YOLO('best (5).pt')
            print('✅ Model loaded successfully: best (5).pt')
        elif os.path.exists('best.pt'):
            model = YOLO('best.pt')
            print('✅ Model loaded successfully: best.pt')
        else:
            print('⚠️ No model file found, will use mock detections')
            model = None
        
        if model:
            model.conf = 0.5
            model.iou = 0.45
    except Exception as e:
        print(f'❌ Error loading model: {e}')
        model = None
    yield

is_vercel = os.environ.get('VERCEL') == '1'
app = FastAPI(title="Chitti AI NDT API", lifespan=lifespan, root_path="/api/py-detect" if is_vercel else "")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DetectRequest(BaseModel):
    image: str

@app.get('/health')
async def health():
    return {'status': 'ok', 'model_loaded': model is not None}

@app.post('/detect')
async def detect(request: DetectRequest):
    if not request.image:
        raise HTTPException(status_code=400, detail='No image provided')
    
    image_bytes = base64.b64decode(request.image.split(',')[1] if ',' in request.image else request.image)
    image = Image.open(io.BytesIO(image_bytes))
    
    # If model not loaded, return mock detections
    if model is None:
        print('Model not loaded, returning mock detections')
        import random
        detections = []
        for i in range(random.randint(1, 3)):
            x = random.randint(50, image.width - 150)
            y = random.randint(50, image.height - 150)
            w = random.randint(80, 150)
            h = random.randint(60, 120)
            detections.append({
                'bbox': [float(x), float(y), float(w), float(h)],
                'confidence': random.uniform(0.65, 0.95),
                'classId': i,
                'className': ['crack', 'corrosion', 'deformation'][i % 3]
            })
        return {'detections': detections, 'demo_mode': True}
    
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
    
    print(f'Detection complete: {len(detections)} defects found')
    return {'detections': detections}

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f'Starting server on port {port}')
    uvicorn.run(app, host='0.0.0.0', port=port)

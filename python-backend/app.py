from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO
from PIL import Image
from contextlib import asynccontextmanager
import io
import base64
import uvicorn

model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model
    try:
        model = YOLO('best (5).pt')
        model.conf = 0.5
        model.iou = 0.45
        print('Model loaded successfully: best (5).pt')
    except Exception as e:
        print(f'Error loading model: {e}')
        try:
            model = YOLO('best.pt')
            print('Fallback: loaded best.pt')
        except:
            print('Failed to load any model')
    yield

app = FastAPI(title="Chitti AI NDT API", lifespan=lifespan)

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
    if model is None:
        raise HTTPException(status_code=500, detail='Model not loaded')
    
    if not request.image:
        raise HTTPException(status_code=400, detail='No image provided')
    
    image_bytes = base64.b64decode(request.image.split(',')[1] if ',' in request.image else request.image)
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
    
    print(f'Detection complete: {len(detections)} defects found')
    return {'detections': detections}

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5001))
    print(f'Starting server on port {port}')
    uvicorn.run(app, host='0.0.0.0', port=port)

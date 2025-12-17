"""
Modal.com deployment for YOLO defect detection
FREE tier, perfect for ML models, no size limits
"""

import modal
import io
import base64
from PIL import Image

# Create Modal app
app = modal.App("yolo-defect-detector")

# Create image with dependencies
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "ultralytics==8.3.224",
        "pillow",
        "numpy",
        "opencv-python-headless",
        "torch",
        "torchvision"
    )
)

# Mount the model file
model_volume = modal.Volume.from_name("yolo-models", create_if_missing=True)

@app.function(
    image=image,
    gpu="T4",  # Free GPU on Modal!
    timeout=300,
    volumes={"/models": model_volume},
    secrets=[modal.Secret.from_name("my-secret")]  # Optional
)
@modal.web_endpoint(method="POST")
def detect(request_data: dict):
    """
    Detect defects in image using YOLO model
    
    Request format:
    {
        "image": "base64_encoded_image_data"
    }
    """
    from ultralytics import YOLO
    import numpy as np
    
    try:
        # Get image from request
        image_data = request_data.get("image", "")
        if not image_data:
            return {"success": False, "error": "No image provided"}
        
        # Decode base64 image
        if "," in image_data:
            image_data = image_data.split(",")[1]
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB
        if image.mode != "RGB":
            image = image.convert("RGB")
        
        # Load model (cached after first run)
        model_path = "/models/best.pt"
        
        # Check if model exists, if not, download from your repo
        import os
        if not os.path.exists(model_path):
            print("Downloading model...")
            # You'll upload the model once using: modal volume put yolo-models best.pt /best.pt
            return {"success": False, "error": "Model not found. Please upload model first."}
        
        print(f"Loading YOLO model from {model_path}")
        model = YOLO(model_path)
        
        # Run inference
        print(f"Running inference on image: {image.size}")
        results = model(image, conf=0.20, iou=0.45, verbose=False)
        
        # Process results
        detections = []
        for result in results:
            boxes = result.boxes
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                conf = float(box.conf[0])
                cls = int(box.cls[0])
                
                class_names = ["Bad Weld", "Good Weld", "Defect"]
                class_name = class_names[cls] if cls < len(class_names) else f"Class {cls}"
                
                detections.append({
                    "bbox": [float(x1), float(y1), float(x2 - x1), float(y2 - y1)],
                    "confidence": conf,
                    "class_id": cls,
                    "class_name": class_name
                })
        
        print(f"✅ Found {len(detections)} detections")
        
        return {
            "success": True,
            "detections": detections,
            "model_loaded": True,
            "num_detections": len(detections)
        }
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e)}


@app.function(image=image)
@modal.web_endpoint(method="GET")
def health():
    """Health check endpoint"""
    return {"status": "healthy", "service": "yolo-defect-detector"}


# Local entrypoint for testing
@app.local_entrypoint()
def main():
    print("🚀 YOLO Defect Detector deployed to Modal.com")
    print("📝 To upload your model:")
    print('   modal volume put yolo-models "best (5).pt" /best.pt')
    print("\n🌐 Your API will be available at:")
    print("   https://your-username--yolo-defect-detector-detect.modal.run")

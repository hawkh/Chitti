"""
Hugging Face Spaces deployment for YOLO defect detection
FREE, GPU-enabled, perfect for ML models
"""

import gradio as gr
from ultralytics import YOLO
import numpy as np
from PIL import Image
import json

# Load model
print("Loading YOLO model...")
model = YOLO("best.pt")  # Upload best (5).pt as best.pt to HF Spaces
print("✅ Model loaded!")

def detect_defects(image):
    """
    Detect defects in image using YOLO
    
    Args:
        image: PIL Image or numpy array
    
    Returns:
        Annotated image with detections
    """
    try:
        # Run inference
        results = model(image, conf=0.20, iou=0.45)
        
        # Get annotated image
        annotated_image = results[0].plot()
        
        # Get detections as JSON
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
                    "class": class_name,
                    "confidence": f"{conf:.2%}",
                    "bbox": [int(x1), int(y1), int(x2), int(y2)]
                })
        
        # Format results
        results_text = f"**Found {len(detections)} defects:**\n\n"
        for i, det in enumerate(detections, 1):
            results_text += f"{i}. **{det['class']}** - Confidence: {det['confidence']}\n"
        
        return annotated_image, results_text, json.dumps(detections, indent=2)
        
    except Exception as e:
        return None, f"❌ Error: {str(e)}", str(e)


# Create Gradio interface
with gr.Blocks(title="Chitti AI - Weld Defect Detection") as demo:
    gr.Markdown("""
    # 🔍 Chitti AI - Weld Defect Detection
    
    Upload an image of a weld to detect defects using YOLOv12l AI model.
    
    **Detects 3 classes:**
    - 🔴 Bad Weld
    - 🟢 Good Weld
    - 🟡 Defect
    """)
    
    with gr.Row():
        with gr.Column():
            input_image = gr.Image(type="pil", label="Upload Weld Image")
            detect_btn = gr.Button("🔍 Detect Defects", variant="primary")
        
        with gr.Column():
            output_image = gr.Image(label="Detection Results")
            results_text = gr.Markdown(label="Detections")
    
    with gr.Accordion("📊 JSON Output (for API integration)", open=False):
        json_output = gr.Code(language="json", label="Detection Data")
    
    detect_btn.click(
        fn=detect_defects,
        inputs=[input_image],
        outputs=[output_image, results_text, json_output]
    )
    
    gr.Markdown("""
    ---
    ### 🚀 API Usage
    
    Use this endpoint in your Next.js app:
    ```
    https://your-username-yolo-defect-detector.hf.space/api/predict
    ```
    
    **Request:**
    ```python
    import requests
    import base64
    
    with open("image.jpg", "rb") as f:
        image_b64 = base64.b64encode(f.read()).decode()
    
    response = requests.post(
        "https://your-username-yolo-defect-detector.hf.space/api/predict",
        json={"data": [image_b64]}
    )
    
    detections = response.json()["data"]
    ```
    """)

# Launch app
if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)

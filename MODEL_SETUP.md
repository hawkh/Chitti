# Model Setup Guide

## YOLO Model Setup

To use the AI defect detection system, you need to set up the YOLO model files:

### 1. Create Model Directory
Create the following directory structure:
```
public/
└── models/
    └── yolo-defect-detector/
        ├── model.json
        └── weights.bin
```

### 2. Model Files
You need to provide:
- `model.json`: TensorFlow.js model architecture
- `weights.bin`: Model weights file

### 3. For Development/Testing
If you don't have actual model files, you can create mock files:

**model.json** (minimal structure):
```json
{
  "format": "graph-model",
  "generatedBy": "2.8.0",
  "convertedBy": "TensorFlow.js Converter v3.18.0",
  "modelTopology": {
    "node": [
      {
        "name": "input",
        "op": "Placeholder"
      }
    ]
  },
  "weightsManifest": [
    {
      "paths": ["weights.bin"],
      "weights": []
    }
  ]
}
```

**weights.bin**: Create an empty binary file

### 4. Configuration
The model configuration is already set in `public/models/config.json` with:
- Input size: 640x640
- 6 defect classes
- Confidence threshold: 0.5

### 5. Training Your Own Model
To train a custom YOLO model for defect detection:
1. Collect and label defect images
2. Train using YOLOv5/v8 framework
3. Convert to TensorFlow.js format
4. Place files in the model directory

### 6. Alternative: Use Pre-trained Model
You can use a general object detection model and adapt the class mappings in the code.
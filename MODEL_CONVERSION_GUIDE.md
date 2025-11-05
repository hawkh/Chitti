# YOLO to TensorFlow.js Conversion Guide

This guide explains how to convert your `best (5).pt` YOLO model to TensorFlow.js format for client-side inference in the web browser.

## Prerequisites

1. **Python Environment** with the following packages:
   ```bash
   pip install ultralytics tensorflowjs tensorflow onnx onnx-tf
   ```

2. **Your YOLO Model**: `best (5).pt` file in the `python-backend/` directory

## Method 1: Direct Conversion (Recommended)

### Step 1: Export YOLO to ONNX
```python
from ultralytics import YOLO

# Load your model
model = YOLO('python-backend/best (5).pt')

# Export to ONNX format
model.export(format='onnx', imgsz=640, simplify=True)
```

### Step 2: Convert ONNX to TensorFlow.js
```bash
# Install onnx-tf if not already installed
pip install onnx-tf

# Convert ONNX to TensorFlow SavedModel
python -c "
import onnx
import onnx_tf
import tensorflow as tf

# Load ONNX model
onnx_model = onnx.load('python-backend/best.onnx')

# Convert to TensorFlow
tf_rep = onnx_tf.backend.prepare(onnx_model)

# Export as SavedModel
tf_rep.export_graph('temp_saved_model')
"

# Convert SavedModel to TensorFlow.js
tensorflowjs_converter \
    --input_format=tf_saved_model \
    --output_format=tfjs_graph_model \
    --signature_name=serving_default \
    --saved_model_tags=serve \
    temp_saved_model \
    public/models/yolo-defect-detector/tfjs_model
```

## Method 2: Using the Conversion Script

Run the provided conversion script:

```bash
cd scripts
python convert-model-to-tfjs.py
```

Or on Windows:
```cmd
cd scripts
convert-model.bat
```

## Method 3: Manual TensorFlow.js Export

If the above methods don't work, try this alternative approach:

```python
import tensorflow as tf
import tensorflowjs as tfjs
from ultralytics import YOLO
import numpy as np

# Load YOLO model
model = YOLO('python-backend/best (5).pt')

# Create a dummy input to trace the model
dummy_input = np.random.randn(1, 3, 640, 640).astype(np.float32)

# Export to TorchScript first
torch_model = model.model
torch_model.eval()

# Convert to ONNX
import torch
torch.onnx.export(
    torch_model,
    torch.from_numpy(dummy_input),
    'temp_model.onnx',
    input_names=['input'],
    output_names=['output'],
    dynamic_axes={
        'input': {0: 'batch_size'},
        'output': {0: 'batch_size'}
    }
)

# Then follow Method 1 Step 2
```

## Expected Output Structure

After successful conversion, you should have:

```
public/models/yolo-defect-detector/
├── tfjs_model/
│   ├── model.json              # Model architecture
│   ├── group1-shard1of1.bin    # Model weights (may be multiple shards)
│   └── ...                     # Additional weight files if large model
└── config.json                 # Model configuration (already exists)
```

## Verification

Test your converted model:

```javascript
// In browser console or Node.js
import * as tf from '@tensorflow/tfjs';

async function testModel() {
    // Load the model
    const model = await tf.loadGraphModel('/models/yolo-defect-detector/tfjs_model/model.json');
    
    // Create test input
    const testInput = tf.zeros([1, 640, 640, 3]);
    
    // Run inference
    const prediction = model.predict(testInput);
    
    console.log('Model loaded successfully!');
    console.log('Input shape:', testInput.shape);
    console.log('Output shape:', prediction.shape);
    
    // Clean up
    testInput.dispose();
    prediction.dispose();
}

testModel();
```

## Troubleshooting

### Common Issues:

1. **ONNX Conversion Fails**
   - Try updating ultralytics: `pip install --upgrade ultralytics`
   - Use `simplify=True` in the export command
   - Check ONNX version compatibility

2. **TensorFlow.js Conversion Fails**
   - Ensure TensorFlow and TensorFlow.js versions are compatible
   - Try quantization: `--quantization_bytes=2`
   - Use `--skip_op_check=True` for unsupported operations

3. **Model Too Large**
   - Use quantization to reduce size
   - Split into multiple shards automatically
   - Consider model pruning before conversion

4. **WebGL Errors in Browser**
   - Check browser WebGL support
   - Fallback to CPU backend if needed
   - Reduce batch size or input dimensions

### Performance Optimization:

1. **Quantization** (reduces model size):
   ```bash
   tensorflowjs_converter \
       --quantization_bytes=2 \
       --input_format=tf_saved_model \
       --output_format=tfjs_graph_model \
       temp_saved_model \
       public/models/yolo-defect-detector/tfjs_model
   ```

2. **Graph Optimization**:
   ```bash
   tensorflowjs_converter \
       --control_flow_v2=True \
       --experiments=True \
       temp_saved_model \
       public/models/yolo-defect-detector/tfjs_model
   ```

## Integration with Web App

Once converted, the model will be automatically loaded by the `ClientSideDetection` component:

1. **Navigate to**: `http://localhost:3000/client-detection`
2. **Upload images**: Drag and drop or select files
3. **Run detection**: Click "Run AI Detection"
4. **View results**: Interactive visualization with defect overlays

## Model Information

Update the `public/models/config.json` file with your model's specific information:

```json
{
  "models": {
    "yolo-defect-detector": {
      "name": "YOLO Welding Defect Detector",
      "modelUrl": "/models/yolo-defect-detector/tfjs_model/model.json",
      "inputSize": { "width": 640, "height": 640 },
      "numClasses": 7,
      "classNames": ["crack", "corrosion", "deformation", "surface_irregularity", "inclusion", "void", "dimensional_variance"],
      "confidenceThreshold": 0.5,
      "nmsThreshold": 0.4
    }
  }
}
```

## Next Steps

1. **Convert your model** using one of the methods above
2. **Test the conversion** using the verification script
3. **Update model config** with correct class names and parameters
4. **Test in browser** using the client-side detection page
5. **Optimize performance** if needed using quantization or other techniques

The client-side integration provides:
- ✅ Real-time inference in the browser
- ✅ No server uploads (privacy-first)
- ✅ WebGL acceleration for fast processing
- ✅ Interactive defect visualization
- ✅ Batch processing capabilities
# TensorFlow.js Client-Side AI Integration

This document explains the complete TensorFlow.js integration for client-side AI defect detection using your `best (5).pt` YOLO model.

## 🎯 Overview

The system now supports **client-side AI inference** directly in the web browser using TensorFlow.js. This provides:

- ✅ **Real-time processing** - No server round-trips
- ✅ **Privacy-first** - Images never leave the user's device  
- ✅ **Offline capability** - Works without internet connection
- ✅ **WebGL acceleration** - Fast GPU-powered inference
- ✅ **Interactive visualization** - Real-time defect overlays

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Browser   │    │  TensorFlow.js  │    │   YOLO Model    │
│                 │    │                 │    │                 │
│  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────────┐  │
│  │   Image   │──┼────┼─►│ Inference │──┼────┼─►│ best.pt → │  │
│  │  Upload   │  │    │  │  Engine   │  │    │  │  tfjs     │  │
│  └───────────┘  │    │  └───────────┘  │    │  └───────────┘  │
│                 │    │                 │    │                 │
│  ┌───────────┐  │    │  ┌───────────┐  │    │                 │
│  │  Defect   │◄─┼────┼──│  Results  │◄─┼────┼─────────────────┘
│  │Visualization│ │    │ Processing │  │    │
│  └───────────┘  │    │  └───────────┘  │    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 File Structure

```
public/models/yolo-defect-detector/
├── tfjs_model/
│   ├── model.json              # TensorFlow.js model architecture
│   ├── group1-shard1of1.bin    # Model weights (may be multiple shards)
│   └── ...                     # Additional weight files
├── config.json                 # Model configuration
└── README.md                   # Model documentation

components/detection/
├── ClientSideDetection.tsx     # Main client-side detection component
├── DefectVisualization.tsx     # Interactive defect visualization
└── ...

services/ai/
├── ModelManager.ts             # Model loading and management
├── YOLODefectDetector.ts       # TensorFlow.js YOLO implementation
├── ImageProcessor.ts           # Image preprocessing pipeline
└── ...

app/client-detection/
└── page.tsx                    # Client-side detection page

scripts/
├── convert-model-to-tfjs.py    # Full conversion script
├── simple-convert.py           # Simplified conversion
├── convert-model.bat           # Windows batch script
└── requirements-conversion.txt # Python dependencies
```

## 🚀 Quick Start

### Step 1: Convert Your Model

Choose one of these methods to convert `best (5).pt` to TensorFlow.js:

#### Option A: Simple Conversion (Recommended)
```bash
cd scripts
python simple-convert.py
```

#### Option B: Manual Conversion
```bash
# Install dependencies
pip install ultralytics tensorflowjs tensorflow

# Run conversion
cd scripts
python convert-model-to-tfjs.py
```

#### Option C: Windows Batch Script
```cmd
cd scripts
convert-model.bat
```

### Step 2: Verify Conversion

After conversion, you should have:
```
public/models/yolo-defect-detector/tfjs_model/
├── model.json
└── group1-shard1of1.bin (or multiple shards)
```

### Step 3: Test the Integration

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the client-side detection page:**
   ```
   http://localhost:3000/client-detection
   ```

3. **Upload images and test detection:**
   - Drag and drop images or click to select
   - Click "Run AI Detection"
   - View interactive results with defect overlays

## 🔧 Technical Implementation

### Model Loading (`ModelManager.ts`)

```typescript
// Initialize TensorFlow.js backend
await tf.setBackend('webgl'); // GPU acceleration
await tf.ready();

// Load the converted model
const model = await tf.loadGraphModel('/models/yolo-defect-detector/tfjs_model/model.json');
```

### Image Processing (`ImageProcessor.ts`)

```typescript
// Convert image to tensor
let tensor = tf.browser.fromPixels(imageData);

// Resize to model input size (640x640)
tensor = tf.image.resizeBilinear(tensor, [640, 640]);

// Normalize pixel values [0, 255] → [0, 1]
tensor = tensor.div(255.0);

// Add batch dimension [H, W, C] → [1, H, W, C]
tensor = tensor.expandDims(0);
```

### Inference (`YOLODefectDetector.ts`)

```typescript
// Run model prediction
const predictions = model.predict(preprocessedTensor) as tf.Tensor;

// Post-process YOLO outputs
const detections = await this.postProcessPredictions(
  predictions,
  originalWidth,
  originalHeight,
  config
);
```

### Visualization (`DefectVisualization.tsx`)

```typescript
// Interactive defect overlays with zoom/pan
<DefectVisualization
  detectionResult={result}
  showLabels={true}
  showConfidence={true}
  className="h-96"
/>
```

## ⚙️ Configuration

### Model Configuration (`public/models/config.json`)

```json
{
  "models": {
    "yolo-defect-detector": {
      "name": "YOLO Welding Defect Detector",
      "modelUrl": "/models/yolo-defect-detector/tfjs_model/model.json",
      "inputSize": { "width": 640, "height": 640 },
      "numClasses": 7,
      "classNames": [
        "crack", "corrosion", "deformation", 
        "surface_irregularity", "inclusion", 
        "void", "dimensional_variance"
      ],
      "confidenceThreshold": 0.5,
      "nmsThreshold": 0.4
    }
  }
}
```

### Performance Settings

```typescript
// WebGL backend for GPU acceleration
await tf.setBackend('webgl');

// Fallback to CPU if WebGL unavailable
if (tf.getBackend() !== 'webgl') {
  await tf.setBackend('cpu');
}

// Memory management
tf.engine().startScope(); // Start memory scope
// ... run inference ...
tf.engine().endScope();   // Clean up tensors
```

## 🎨 User Interface Features

### Client-Side Detection Page (`/client-detection`)

- **Model Status Indicator**: Shows loading/ready/error states
- **File Upload Interface**: Drag-and-drop with progress tracking
- **Batch Processing**: Process multiple images simultaneously
- **Real-time Results**: Interactive defect visualization
- **Performance Metrics**: Processing time and confidence scores

### Interactive Visualization

- **Zoom & Pan**: Navigate large images easily
- **Defect Overlays**: Color-coded severity levels
- **Click Details**: Detailed defect information panels
- **Export Options**: Save results and visualizations

## 🔍 Supported Defect Types

The model detects 7 types of welding defects:

1. **Cracks** - Linear fractures in the material
2. **Corrosion** - Chemical deterioration of surfaces  
3. **Deformation** - Physical distortion or warping
4. **Surface Irregularities** - Uneven textures or finishes
5. **Inclusions** - Foreign materials embedded in welds
6. **Voids** - Empty spaces or cavities
7. **Dimensional Variances** - Deviations from specifications

## 📊 Performance Optimization

### Model Optimization

```bash
# Quantization to reduce model size
tensorflowjs_converter \
  --quantization_bytes=2 \
  --input_format=tf_saved_model \
  --output_format=tfjs_graph_model \
  saved_model \
  tfjs_model
```

### Runtime Optimization

```typescript
// Batch processing for multiple images
const batchTensor = tf.stack(imageTensors);
const batchPredictions = model.predict(batchTensor);

// Memory management
tensor.dispose(); // Always dispose tensors
tf.disposeVariables(); // Clean up variables
```

### Browser Performance

- **WebGL Backend**: 5-10x faster than CPU
- **Model Caching**: Loaded once, used repeatedly  
- **Tensor Reuse**: Minimize memory allocations
- **Progressive Loading**: Show results as they complete

## 🛠️ Troubleshooting

### Common Issues

1. **Model Loading Fails**
   ```
   Error: Failed to load model from /models/...
   ```
   - Verify model files exist in `public/models/yolo-defect-detector/tfjs_model/`
   - Check browser console for network errors
   - Ensure model.json and weight files are accessible

2. **WebGL Backend Unavailable**
   ```
   Warning: WebGL backend not available, falling back to CPU
   ```
   - Check browser WebGL support: `chrome://gpu/`
   - Update graphics drivers
   - Try different browser (Chrome/Firefox recommended)

3. **Out of Memory Errors**
   ```
   Error: Cannot allocate tensor of size...
   ```
   - Reduce image size before processing
   - Process images one at a time instead of batches
   - Use quantized model (smaller memory footprint)

4. **Slow Performance**
   - Ensure WebGL backend is active
   - Check if GPU acceleration is working
   - Consider model quantization
   - Optimize image preprocessing

### Debug Tools

```typescript
// Check TensorFlow.js status
console.log('Backend:', tf.getBackend());
console.log('Memory:', tf.memory());

// Monitor tensor usage
tf.engine().startScope();
// ... your code ...
console.log('Tensors created:', tf.engine().endScope());
```

## 🔄 Migration from Server-Side

If migrating from Python backend to client-side:

1. **Update API calls**: Remove server detection endpoints
2. **Modify components**: Use `ClientSideDetection` instead of server calls
3. **Update routing**: Add `/client-detection` page
4. **Test thoroughly**: Verify all functionality works client-side

## 📈 Future Enhancements

Potential improvements for the TensorFlow.js integration:

- **Model Versioning**: Support multiple model versions
- **A/B Testing**: Compare different models
- **Progressive Web App**: Offline functionality
- **Web Workers**: Background processing
- **Model Streaming**: Load large models progressively
- **Custom Training**: Fine-tune models in the browser

## 🎯 Benefits Summary

### For Users
- ⚡ **Instant Results** - No upload delays
- 🔒 **Privacy Protected** - Data never leaves device
- 🌐 **Works Offline** - No internet required
- 📱 **Cross-Platform** - Works on any modern browser

### For Developers  
- 🚀 **Reduced Server Load** - No backend processing
- 💰 **Lower Costs** - No GPU server requirements
- 🔧 **Easy Deployment** - Static file hosting
- 📊 **Better UX** - Real-time feedback

The TensorFlow.js integration provides a modern, efficient, and user-friendly approach to AI-powered defect detection that runs entirely in the browser while maintaining the accuracy and capabilities of your trained YOLO model.
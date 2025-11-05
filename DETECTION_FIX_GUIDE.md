# Detection Fix Guide

## Issues Fixed

### 1. ✅ Image Not Visible
**Problem**: Canvas wasn't properly sized to match image  
**Fix**: Using `naturalWidth` and `naturalHeight` for proper canvas sizing

### 2. ✅ No Bounding Boxes
**Problem**: Detection results not being drawn on canvas  
**Fix**: Added timeout to ensure canvas is ready, improved drawing logic with console logs

### 3. ✅ Backend Connection
**Problem**: Python backend port mismatch  
**Fix**: Set default port to 5000 to match frontend expectation

## How to Test

### Step 1: Start Python Backend
```bash
cd python-backend
python app.py
```

**Expected Output:**
```
Model loaded successfully: best (5).pt
Starting server on port 5000
INFO:     Uvicorn running on http://0.0.0.0:5000
```

### Step 2: Start Frontend
```bash
npm run dev
```

### Step 3: Test Detection
1. Go to http://localhost:3000/detection
2. Upload an image
3. Click "Detect Defects"
4. You should see:
   - Original image on left
   - Image with bounding boxes on right
   - Defect list below

## Troubleshooting

### Image Not Showing
**Check**: Browser console for errors
**Fix**: Make sure image file is valid (JPG, PNG)

### No Bounding Boxes
**Check**: Console logs for "Drawing detections: X"
**Possible Issues**:
- Python backend not running
- Model not loaded
- No defects detected (try different image)

### Backend Connection Failed
**Check**: 
```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{"status":"ok","model_loaded":true}
```

**If fails**:
1. Check if Python backend is running
2. Check if port 5000 is available
3. Check if model file exists (`best (5).pt` or `best.pt`)

## Model Files

The system looks for these files in order:
1. `python-backend/best (5).pt` (primary)
2. `python-backend/best.pt` (fallback)

**If no model found**: Detection will fail with error message

## Console Debugging

Open browser console (F12) and look for:

### Successful Detection:
```
Drawing detections: 2
Drawing defect: crack {x: 100, y: 150, width: 50, height: 40}
Drawing defect: porosity {x: 300, y: 200, width: 60, height: 45}
```

### Failed Detection:
```
Detection failed: Error: Python backend detection failed
```

## Quick Fix Commands

### Restart Python Backend:
```bash
cd python-backend
taskkill /F /IM python.exe
python app.py
```

### Check Backend Health:
```bash
curl http://localhost:5000/health
```

### Test Detection API:
```bash
curl -X POST http://localhost:5000/detect \
  -H "Content-Type: application/json" \
  -d '{"image":"data:image/jpeg;base64,..."}'
```

## Expected Behavior

### With Python Backend Running:
1. Upload image → Image appears on left
2. Click "Detect Defects" → Processing...
3. Results appear:
   - Canvas with bounding boxes on right
   - Defect list with confidence scores
   - Compliance check button (if integrated)

### Without Python Backend:
1. Upload image → Image appears
2. Click "Detect Defects" → Error alert
3. Message: "Detection failed. Make sure Python backend is running on port 5000 or 8000"

## Model Training (If Needed)

If you need to train a new model:

1. Prepare dataset in YOLO format
2. Train using Ultralytics:
```python
from ultralytics import YOLO

model = YOLO('yolov8n.pt')
model.train(data='dataset.yaml', epochs=100)
```

3. Save as `best.pt` in `python-backend/`

## Performance Tips

### Slow Detection:
- Use smaller images (resize to 640x640)
- Reduce model confidence threshold
- Use GPU if available

### Memory Issues:
- Process images one at a time
- Clear canvas between detections
- Dispose TensorFlow.js models when done

## Integration Checklist

- [x] Python backend starts on port 5000
- [x] Model loads successfully
- [x] Frontend connects to backend
- [x] Images display correctly
- [x] Canvas draws bounding boxes
- [x] Defect list shows results
- [x] Error handling works
- [x] Console logs for debugging

## Next Steps

1. Test with real defect images
2. Adjust confidence threshold if needed
3. Add more defect classes to model
4. Integrate with compliance checker
5. Add batch processing support

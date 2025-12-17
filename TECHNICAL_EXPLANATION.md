# Technical Explanation: Why Predictions Were Wrong

## The Problem

Your YOLOv12l model was loading successfully (you saw the console message), but predictions were "so wrong" because we were **misinterpreting the output tensor format**.

## What Was Wrong

### Previous Code Assumption
```typescript
// WRONG: Assumed format [7, 8400]
// Where 7 = [x, y, w, h, confidence, class_id, extra]
for (let i = 0; i < 8400; i++) {
  const conf = outputData[4][i];      // Single confidence value
  const classId = Math.round(outputData[5][i]);  // Class as integer
}
```

### Actual Model Output
```typescript
// CORRECT: Format is [1, 8400, 7]
// Where 7 = [x, y, w, h, class0_conf, class1_conf, class2_conf]
for (let i = 0; i < 8400; i++) {
  const detection = batchData[i];
  const class0_conf = detection[4];  // Bad Weld confidence
  const class1_conf = detection[5];  // Good Weld confidence
  const class2_conf = detection[6];  // Defect confidence
  
  // Find which class has highest confidence
  const maxConf = Math.max(class0_conf, class1_conf, class2_conf);
  const classId = [class0_conf, class1_conf, class2_conf].indexOf(maxConf);
}
```

## Why This Matters

### Scenario 1: Bad Weld Detection
**Actual Model Output:**
```
detection[4] = 0.92  // Bad Weld: 92% confidence
detection[5] = 0.05  // Good Weld: 5% confidence
detection[6] = 0.03  // Defect: 3% confidence
```

**Old Code (WRONG):**
```typescript
conf = detection[4] = 0.92  // Used as single confidence
classId = Math.round(detection[5]) = 0  // Rounded 0.05 to 0
// Result: 92% confidence for class 0 (Bad Weld) ✅ Lucky!
```

**But for a Good Weld:**
```
detection[4] = 0.05  // Bad Weld: 5%
detection[5] = 0.91  // Good Weld: 91% confidence
detection[6] = 0.04  // Defect: 4%
```

**Old Code (WRONG):**
```typescript
conf = detection[4] = 0.05  // Used Bad Weld confidence!
classId = Math.round(detection[5]) = 1  // Rounded 0.91 to 1
// Result: 5% confidence for class 1 (Good Weld) ❌ WRONG!
// Should be: 91% confidence for class 1
```

## The Fix

### New Code (CORRECT)
```typescript
// Handle 3D tensor [batch, num_detections, features]
const batchData = outputData[0];  // Remove batch dimension

for (let i = 0; i < num_detections; i++) {
  const detection = batchData[i];
  const cx = detection[0];
  const cy = detection[1];
  const w = detection[2];
  const h = detection[3];
  
  // Find max class confidence
  let maxConf = 0;
  let maxClassId = 0;
  for (let j = 4; j < detection.length; j++) {
    if (detection[j] > maxConf) {
      maxConf = detection[j];
      maxClassId = j - 4;
    }
  }
  
  // Now we have correct confidence and class!
  if (maxConf > 0.20) {
    detections.push({ cx, cy, w, h, conf: maxConf, classId: maxClassId });
  }
}
```

## Model Architecture Details

### From metadata.yaml:
```yaml
description: Ultralytics YOLOv12l model trained on /content/weld.yaml
task: detect
batch: 1
imgsz: [640, 640]
names:
  0: Bad Weld
  1: Good Weld
  2: Defect
nms: false  # ⚠️ NMS disabled - we must apply it ourselves!
channels: 3
```

### Key Points:
1. **YOLOv12l** (not v11) - Latest Ultralytics architecture
2. **NMS disabled** - Model outputs raw predictions, we apply NMS in code
3. **3 classes** - Each detection has 3 confidence scores
4. **640x640 input** - Images resized to this before inference
5. **Normalized coordinates** - Output coords are [0-1], we scale to image size

## Output Tensor Formats

YOLO models can output in different formats depending on export settings:

### Format 1: [batch, num_detections, features] ✅ Your model
```
Shape: [1, 8400, 7]
- batch: Always 1 for single image
- num_detections: 8400 anchor boxes
- features: [x, y, w, h, class0, class1, class2]
```

### Format 2: [batch, features, num_detections]
```
Shape: [1, 7, 8400]
- Same data, just transposed
- We handle this too!
```

### Format 3: [features, num_detections]
```
Shape: [7, 8400]
- Batch dimension removed
- We handle this as fallback
```

## Why 8400 Detections?

YOLO uses anchor boxes at multiple scales:
- 80x80 grid = 6,400 boxes
- 40x40 grid = 1,600 boxes
- 20x20 grid = 400 boxes
- **Total: 8,400 anchor boxes**

Most will have low confidence and get filtered out.

## Confidence Threshold

```typescript
const confidenceThreshold = 0.20;  // 20%
```

- Lower threshold = more detections (including false positives)
- Higher threshold = fewer detections (might miss some defects)
- 0.20 is good balance for weld inspection

## NMS (Non-Maximum Suppression)

```typescript
const iouThreshold = 0.45;  // 45% overlap
```

Removes duplicate detections of same object:
1. Sort by confidence (highest first)
2. Keep highest confidence detection
3. Remove overlapping boxes (IoU > 0.45)
4. Repeat for remaining boxes

## Coordinate System

### Model Output (Normalized):
```
cx, cy, w, h in range [0, 1]
Relative to 640x640 input image
```

### Final Output (Pixels):
```typescript
const x = (cx - w/2) * imgWidth;   // Top-left X
const y = (cy - h/2) * imgHeight;  // Top-left Y
const width = w * imgWidth;        // Box width
const height = h * imgHeight;      // Box height
```

## Debug Logging

The new code logs everything:

```typescript
console.log('📦 YOLOv11 Raw prediction shape:', shape);
console.log('📊 First dimension length:', data.length);
console.log('📊 Second dimension length:', data[0].length);
console.log('📊 Third dimension length:', data[0][0].length);
console.log('📊 Sample values [0][0][0-5]:', data[0][0].slice(0, 6));
console.log('🎯 Format: [batch, num_detections, features]');
console.log('✅ Found X detections above threshold');
console.log('✅ After NMS: Y detections');
console.log('✅ Final: Y valid detections');
```

This helps diagnose any remaining issues.

## Summary

**Root Cause**: Misinterpreted tensor format and class confidence structure

**Fix**: 
1. Handle 3D tensor format `[1, 8400, 7]`
2. Extract max confidence across 3 classes
3. Properly identify which class has highest confidence
4. Apply NMS to remove duplicates
5. Scale coordinates to original image size

**Result**: Accurate weld defect detection with correct class labels and confidence scores!

---

**Technical Level**: This is a common issue when working with YOLO models - the output format varies based on export settings and framework (PyTorch, ONNX, TensorFlow.js). Always check the actual tensor shape and structure before parsing!

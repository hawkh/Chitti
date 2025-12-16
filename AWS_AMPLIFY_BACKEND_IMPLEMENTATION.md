# AWS Amplify Backend AI Implementation - Complete Guide

## 🎉 You're on AWS Amplify - No More Limits!

Unlike Vercel's 250MB serverless function limit, AWS Amplify gives you:
- ✅ **Lambda functions up to 10 GB** (with container images)
- ✅ **Longer execution times** (15 minutes vs 60 seconds)
- ✅ **More memory** (up to 10 GB vs 1 GB)
- ✅ **Larger deployments** - Perfect for AI models!

---

## 🚀 What I've Implemented

### 1. Backend Detection API
**Location:** `app/api/detect-lambda/route.ts`

This is a full server-side TensorFlow.js Node implementation:
- ✅ Loads YOLO model on AWS Lambda
- ✅ Model caching (loads once, reuses)
- ✅ proper tensor management
- ✅ Optimized for AWS environment
- ✅ Works with UnifiedDetectDetector

### 2. Dependencies Added
- ✅ `@tensorflow/tfjs-node` - Server-side TensorFlow

---

## 📋 Setup Steps

### Step 1: Install Dependencies

```bash
npm install
```

This installs `@tensorflow/tfjs-node` for server-side AI.

### Step 2: Host Your Model on S3 (Recommended)

Since your model files are in `/public/models/`, you have two options:

#### Option A: Use S3 (Recommended for Production)

1. **Create S3 Bucket:**
   ```bash
   aws s3 mb s3://chitti-ai-models
   ```

2. **Upload Model:**
   ```bash
   aws s3 cp public/models/yolo-defect-detector/tfjs_model/ \
            s3://chitti-ai-models/yolo-defect-detector/tfjs_model/ \
            --recursive \
            --acl public-read
   ```

3. **Get S3 URL:**
   ```
   https://chitti-ai-models.s3.amazonaws.com/yolo-defect-detector/tfjs_model/model.json
   ```

4. **Set Environment Variable in Amplify:**
   - Go to Amplify Console → Your App → Environment Variables
   - Add: `MODEL_URL` = `https://chitti-ai-models.s3.amazonaws.com/.../model.json`

#### Option B: Bundle with Deployment (Simple but slower)

Model will be included in deployment bundle. Works for smaller models.

No additional setup needed - model loads from `/public/models/`

### Step 3: Update UnifiedDetectDetector Backend URL

Edit `hooks/useUnifiedDetector.ts` or wherever you initialize:

```typescript
const detector = new UnifiedDetectDetector({
  mode: DetectionMode.BACKEND,
  backendUrl: '/api/detect-lambda',  // ← Use new Lambda endpoint
  modelUrl: '/models/yolo-defect-detector/tfjs_model/model.json'
});
```

### Step 4: Deploy to Amplify

Your `amplify.yml` is already configured. Just push:

```bash
git add .
git commit -m "Add AWS Lambda backend detection"
git push origin main
```

Amplify will auto-deploy!

---

## 🧪 Testing

### Test Backend Endpoint

```bash
curl -X GET https://your-app.amplifyapp.com/api/detect-lambda
```

Should return:
```json
{
  "status": "healthy",
  "modelLoaded": false,
  "backend": "tensorflow-node",
  "platform": "aws-lambda"
}
```

### Test Detection

Use the UnifiedDetectionPanel:
1. Navigate to `/unified-detection`
2. Select **BACKEND** mode
3. Upload an image
4. Check console logs!

---

## 📊 Console Output (Backend Mode)

When using backend mode, you'll see:

**Browser Console:**
```
%c🌐 BACKEND MODE - Using server-side API for predictions
📤 Uploading image to /api/detect-lambda
📥 Received response from backend
✅ Detection completed in 2345ms
📊 Found 3 defects
```

**Server Logs (CloudWatch):**
```
🚀 AWS Lambda Backend AI Detection - Starting...
💻 Running on AWS Amplify (No 250MB limit!)
📁 Image received: test.jpg (156234 bytes)
🔄 Loading YOLO model on AWS Lambda...
✅ Server model loaded from URL in 1234ms
📸 Preprocessing image on server...
📊 Input tensor shape: [1, 640, 640, 3]
🧠 Running server-side TensorFlow inference...
⚡ Inference completed in 234ms
📊 Output shape: [1, 25200, 85]
🔍 Post-processing detections on server...
✅ Found 3 detections
✅ Backend detection completed in 2345ms
```

---

## ⚙️ Configuration Options

### Environment Variables

Add these in Amplify Console → Environment Variables:

```bash
# Required: Model URL (S3 or CDN)
MODEL_URL=https://your-s3-bucket.s3.amazonaws.com/path/to/model.json

# Or use existing TFJS URL
NEXT_PUBLIC_TFJS_MODEL_URL=/models/yolo-defect-detector/tfjs_model/model.json

# Lambda function settings (optional)
AWS_LAMBDA_FUNCTION_MEMORY_SIZE=3008
AWS_LAMBDA_FUNCTION_TIMEOUT=300
```

### Lambda Function Size

Edit `amplify.yml` to increase Lambda memory:

```yaml
version: 1
backend:
  phases:
    build:
      commands:
        - npm run build
functions:
  detect-lambda:
    runtime: nodejs18.x
    memory: 3008  # ← 3 GB (adjust as needed)
    timeout: 300   # ← 5 minutes
```

---

## 🎯 When to Use Each Mode

| Mode | Use Case | Pros | Cons |
|------|----------|------|------|
| **TFJS** | Most users | Free, fast, private | Uses user's GPU/CPU |
| **Backend** | Consistency needed | Same performance for all | Costs money, slower |
| **Mock** | UI testing | Instant results | Fake data |

**Recommended:** Use TFJS by default, allow users to switch to Backend if needed.

---

## 💰 AWS Costs

### Lambda Pricing

**Free Tier:**
- 1M requests/month FREE
- 400,000 GB-seconds compute FREE

**After Free Tier:**
- $0.20 per 1M requests
- $0.0000166667 per GB-second

**Example:**
- 10,000 detections/month
- 3 GB RAM, 3 seconds each
- Cost: ~$1.50/month

**Way cheaper than Vercel Pro ($20/month)!**

---

## 🔥 Performance Optimization

### 1. Model Caching
Already implemented! Model loads once and stays in memory.

### 2. Provisioned Concurrency
For production, enable in Amplify:
- Eliminates cold starts
- Keeps Lambda warm
- Costs more but much faster

### 3. S3 Transfer Acceleration
Enable on your S3 bucket for faster model loading.

### 4. Larger Lambda Memory
More memory = more CPU power:
- 1 GB = 1 vCPU
- 3 GB = ~2 vCPUs
- 10 GB = ~6 vCPUs

Increase memory in `amplify.yml` for faster inference.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│           AWS Amplify Frontend              │
│  (Static files + API routes)                │
└─────────────┬───────────────────────────────┘
              │
              ├─ TFJS Mode: Client-side
              │  └─ Browser GPU/CPU
              │
              ├─ Backend Mode: Server-side
              │  └─ POST /api/detect-lambda
              │      ↓
              ├─────────────────────────────┐
              │   AWS Lambda Function       │
              │   • 3 GB RAM                │
              │   • TensorFlow.js Node      │
              │   • Model Cache             │
              │   • Max 15 min execution    │
              └─────────┬───────────────────┘
                        │
              ┌─────────┴───────────┐
              │     Amazon S3       │
              │  (Model Storage)    │
              │  • model.json       │
              │  • *.bin files      │
              └─────────────────────┘
```

---

## ✅ Checklist

- [x] Backend API created (`/api/detect-lambda`)
- [x] TensorFlow.js Node installed
- [x] Model caching implemented
- [ ] Upload model to S3 (optional)
- [ ] Set `MODEL_URL` environment variable
- [ ] Deploy to Amplify
- [ ] Test with UnifiedDetectionPanel
- [ ] Monitor CloudWatch logs

---

## 📚 Next Steps

1. **Test locally:**
   ```bash
   npm run dev
   # Visit http://localhost:3000/unified-detection
   # Select "Backend" mode
   ```

2. **Deploy:**
   ```bash
   git push origin main
   ```

3. **Monitor:**
   - AWS Console → CloudWatch → Log Groups
   - Look for `/aws/lambda/detect-lambda` logs

4. **Optimize:**
   - Increase Lambda memory if slow
   - Enable provisioned concurrency
   - Use S3 for model storage

---

## 🎉 You're Ready!

You now have full backend AI detection on AWS Amplify with:
- ✅ No 250MB size limits
- ✅ Server-side TensorFlow.js
- ✅ Model caching
- ✅ Scalable Lambda functions
- ✅ Integration with UnifiedDetector

Just deploy and start detecting! 🚀

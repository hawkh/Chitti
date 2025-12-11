# Vercel Serverless Python Setup

## ✅ What I Set Up

I've configured your app to use **Vercel's Python serverless functions** - no external deployment needed!

## How It Works

1. **Vercel Python Function**: `api/python/detect.py` - Runs on Vercel's infrastructure
2. **Auto-routing**: Your Next.js API automatically uses the Vercel function
3. **No extra deployment**: Everything deploys together with your Next.js app

## Important Limitation ⚠️

**YOLO model is too large for Vercel serverless functions (50MB limit)**

The Python function currently uses **mock detections** for demo purposes. For real YOLO detection, you need to:

### Option A: Use Vercel Serverless (Current Setup - Demo Mode)
✅ Already configured
✅ No extra deployment needed
✅ Works immediately
❌ Mock detections only (no real AI)

**To deploy:**
```bash
git add .
git commit -m "Add Vercel Python serverless function"
git push
```

Vercel will automatically deploy the Python function!

### Option B: Deploy Real YOLO Backend (Full AI)

For actual AI detection with your trained model, deploy to:

**1. Render.com (Recommended)**
```bash
# See python-backend/QUICK_DEPLOY.md for instructions
```

Then add to Vercel environment variables:
```
PYTHON_BACKEND_URL=https://your-backend.onrender.com
```

**2. Railway.app**
- Deploy `python-backend` folder
- Copy URL
- Add to Vercel env vars

**3. Google Cloud Run**
```bash
cd python-backend
gcloud run deploy yolo-backend --source . --region=us-central1
```

## Configuration

Add to Vercel environment variables (optional):

```
# Use Vercel Python serverless (demo mode)
USE_VERCEL_PYTHON=true

# OR use external backend (real AI)
PYTHON_BACKEND_URL=https://your-backend-url.com
```

If neither is set, it defaults to Vercel serverless.

## Testing Locally

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Run locally:**
```bash
vercel dev
```

3. **Test the Python function:**
```bash
curl -X POST http://localhost:3000/api/python/detect \
  -H "Content-Type: application/json" \
  -d '{"image":"data:image/jpeg;base64,..."}'
```

## Files Created

- ✅ `api/python/detect.py` - Vercel Python serverless function
- ✅ `api/python/requirements.txt` - Python dependencies
- ✅ `vercel.json` - Updated with Python runtime config
- ✅ `app/api/detect/route.ts` - Updated to use serverless function

## Deployment

Just push to GitHub:
```bash
git add .
git commit -m "Add Vercel serverless Python detection"
git push
```

Vercel will:
1. Build your Next.js app
2. Deploy the Python serverless function
3. Everything works together automatically!

## Recommendation

**For Demo/MVP**: Use Vercel serverless (current setup) ✅
**For Production**: Deploy real YOLO backend to Render/Railway 🚀

The app gracefully handles both scenarios and shows "Demo Mode" badge when using mock data.

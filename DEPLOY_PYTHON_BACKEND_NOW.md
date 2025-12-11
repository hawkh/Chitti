# Deploy Python Backend for Real AI Detection - 5 Minutes

## Quick Steps to Get Real YOLO Detection Working

### Option 1: Render.com (Recommended - FREE)

1. **Go to https://render.com** and sign up (use GitHub login)

2. **Click "New +" → "Web Service"**

3. **Connect your GitHub repository** `hawkh/Chitti`

4. **Configure the service:**
   - **Name**: `chitti-yolo-backend`
   - **Root Directory**: `python-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

5. **IMPORTANT: Add the model file**
   - Make sure `best (5).pt` is in the `python-backend` folder
   - Commit and push if needed:
     ```bash
     git add python-backend/best\ \(5\).pt
     git commit -m "Add YOLO model file"
     git push
     ```

6. **Click "Create Web Service"** - Wait 5-10 minutes for deployment

7. **Copy the URL** (e.g., `https://chitti-yolo-backend.onrender.com`)

8. **Add to Vercel:**
   - Go to https://vercel.com/dashboard
   - Select your project
   - Settings → Environment Variables
   - Add new variable:
     - **Name**: `PYTHON_BACKEND_URL`
     - **Value**: `https://chitti-yolo-backend.onrender.com`
   - Click "Save"

9. **Redeploy Vercel:**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

### Option 2: Railway.app (Also FREE)

1. Go to https://railway.app
2. Click "Start a New Project" → "Deploy from GitHub repo"
3. Select `hawkh/Chitti` repo
4. Set root directory to `python-backend`
5. Railway auto-detects Python and deploys
6. Copy the public URL
7. Add to Vercel as `PYTHON_BACKEND_URL`

### Option 3: Fly.io

```bash
cd python-backend
fly launch --name chitti-yolo-backend
fly deploy
fly open
```

Copy the URL and add to Vercel.

## Test Your Backend

Once deployed, test it:

```bash
curl https://your-backend-url.onrender.com/health
```

Should return:
```json
{"status":"ok","model_loaded":true}
```

## Update Frontend to Use Real Backend

The frontend is already configured! Once you add `PYTHON_BACKEND_URL` to Vercel and redeploy, it will automatically use real AI detection instead of demo mode.

## Current Status

- ✅ Python backend code ready
- ✅ FastAPI app configured
- ✅ YOLO model integration complete
- ⏳ Waiting for deployment
- ⏳ Waiting for Vercel environment variable

## Why Not Vercel for Python?

Vercel has a 250MB limit for serverless functions. Your YOLO model + TensorFlow files exceed this. Render.com has no such limit and is perfect for this use case.

## Cost

- **Render Free Tier**: 750 hours/month (enough for your pitch and testing)
- **Railway Free Tier**: $5 credit (lasts ~1 month)
- **Fly.io Free Tier**: 3 shared VMs

All options are FREE for your needs!

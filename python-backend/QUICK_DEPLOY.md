# Quick Python Backend Deployment Options

## Option 1: Render.com (Recommended - Free Tier)

1. Push your code to GitHub
2. Go to https://render.com and sign up
3. Click "New +" → "Web Service"
4. Connect your GitHub repo
5. Configure:
   - **Root Directory**: `python-backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
   - **Environment**: Python 3
6. Add the model file `best (5).pt` to the repo
7. Deploy!
8. Copy the URL (e.g., `https://chitti-backend.onrender.com`)
9. Add to Vercel environment variables:
   ```
   PYTHON_BACKEND_URL=https://chitti-backend.onrender.com
   ```

## Option 2: Railway.app (Free $5 credit)

1. Go to https://railway.app
2. Click "Start a New Project" → "Deploy from GitHub repo"
3. Select your repo and `python-backend` folder
4. Railway auto-detects Python and deploys
5. Copy the public URL
6. Add to Vercel:
   ```
   PYTHON_BACKEND_URL=https://your-app.railway.app
   ```

## Option 3: Fly.io (Free tier available)

```bash
cd python-backend
fly launch
fly deploy
fly open
```

Then add the URL to Vercel environment variables.

## Option 4: Use Demo Mode (Temporary)

The app now automatically falls back to demo mode if the Python backend is unavailable. This shows mock detections for demonstration purposes.

To enable full AI detection, deploy the backend using any option above and configure the environment variable in Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `PYTHON_BACKEND_URL` = `your-backend-url`
3. Redeploy your Vercel app

## Testing Backend

Once deployed, test your backend:

```bash
curl https://your-backend-url/health
```

Should return: `{"status":"ok","model_loaded":true}`

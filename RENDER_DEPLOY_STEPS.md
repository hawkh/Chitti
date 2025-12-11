# Deploy to Render.com - 5 Minutes ⚡

## Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Add Python YOLO backend for Render deployment"
git push
```

## Step 2: Deploy on Render.com

1. **Go to https://render.com** and sign up (use GitHub login)

2. **Click "New +" → "Web Service"**

3. **Connect GitHub repository**: `hawkh/Chitti`

4. **Configure:**
   - **Name**: `chitti-yolo-backend`
   - **Root Directory**: `python-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free (750 hours/month)

5. **Click "Create Web Service"**

6. **Wait 5-10 minutes** for deployment (it will install YOLO model)

7. **Copy the URL** (e.g., `https://chitti-yolo-backend.onrender.com`)

## Step 3: Configure Vercel

1. **Go to https://vercel.com/dashboard**

2. **Select your project** → **Settings** → **Environment Variables**

3. **Add new variable:**
   - **Name**: `PYTHON_BACKEND_URL`
   - **Value**: `https://chitti-yolo-backend.onrender.com` (your Render URL)
   - **Environment**: Production, Preview, Development

4. **Click "Save"**

## Step 4: Redeploy Vercel

1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Wait 2-3 minutes

## Step 5: Test

Visit your Vercel app and try the defect detection. You should see REAL AI detections now! 🎉

## Test Backend Health

```bash
curl https://your-backend-url.onrender.com/health
```

Should return:
```json
{"status":"ok","model_loaded":true}
```

## What You Get

✅ Real YOLO AI detection (not mock data)
✅ Free hosting on Render.com
✅ Automatic HTTPS
✅ Auto-restart on crashes
✅ Perfect for your pitch tomorrow!

## Troubleshooting

**If backend shows "model_loaded": false:**
- Check Render logs for model loading errors
- Ensure `best (5).pt` is in `python-backend` folder
- Redeploy on Render

**If Vercel still shows "Detection failed":**
- Check you added `PYTHON_BACKEND_URL` environment variable
- Ensure you redeployed after adding the variable
- Check Vercel function logs

## Free Tier Limits

- **Render Free**: 750 hours/month, sleeps after 15 min inactivity
- **First request after sleep**: Takes 30-60 seconds (cold start)
- **Subsequent requests**: Fast (~1-2 seconds)

Perfect for demos and pitches! 🚀

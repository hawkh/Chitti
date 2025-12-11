# Render Manual Configuration Required ⚠️

## The Issue

Render.com doesn't automatically switch from Python to Docker environment when you push changes. You need to manually update the service settings.

## Quick Fix (2 minutes)

### Option 1: Update Existing Service

1. Go to https://dashboard.render.com/
2. Click on your `chitti-yolo-backend` service
3. Click **Settings** (left sidebar)
4. Scroll to **Environment**
5. Change from `Python` to `Docker`
6. Scroll down and click **Save Changes**
7. Service will automatically redeploy with Docker

### Option 2: Delete and Recreate (Recommended if Option 1 doesn't work)

1. Go to https://dashboard.render.com/
2. Click on `chitti-yolo-backend`
3. Click **Settings** → Scroll to bottom → **Delete Service**
4. Click **New +** → **Web Service**
5. Connect your GitHub repo: `hawkh/Chitti`
6. Configure:
   - **Name**: `chitti-yolo-backend`
   - **Root Directory**: `python-backend`
   - **Environment**: **Docker** (important!)
   - **Plan**: Free
7. Click **Create Web Service**

## Why Docker?

- ✅ Uses Python 3.11 (no version conflicts)
- ✅ Pre-built wheels (no Rust compilation needed)
- ✅ More reliable and faster builds
- ✅ Consistent environment

## After Deployment

Wait 5-10 minutes, then test:

```bash
curl https://chitti-yolo-backend.onrender.com/health
```

Expected: `{"status":"ok","model_loaded":true}`

Then proceed with adding `PYTHON_BACKEND_URL` to Vercel as described in FINAL_DEPLOYMENT_STEPS.md

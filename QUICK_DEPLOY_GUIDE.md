# Quick Deploy Guide - AWS ECS Backend Integration

## 🎯 Goal
Update your Vercel and Amplify deployments to use the new AWS ECS backend.

## ⚡ Quick Start (5 minutes)

### Step 1: Test Locally (Optional but Recommended)
```bash
TEST_FRONTEND_INTEGRATION.bat
```
- Opens http://localhost:3000
- Go to `/demo` page
- Upload image and test detection
- Check console for "Real YOLO Backend" message

### Step 2: Deploy Everything
```bash
DEPLOY_UPDATED_FRONTEND.bat
```
This automatically:
- ✅ Commits changes
- ✅ Pushes to GitHub
- ✅ Deploys to Vercel
- ✅ Triggers Amplify deployment

### Step 3: Verify
Visit your deployed URL and test `/demo` page.

## 📋 What Changed

**Backend URL**: `https://chitti-yolo-backend-1.onrender.com` → `http://23.22.163.148:10000`

**Files Updated**:
- `.env.production` - Production environment
- `.env.local` - Local development
- `app/api/detect/route.ts` - Main API
- `app/api/detect-real/route.ts` - Real detection API

## 🧪 Testing

### Test Backend
```bash
curl http://23.22.163.148:10000/health
```
Expected: `{"status":"ok","model_loaded":true}`

### Test Frontend
1. Visit your deployed URL
2. Go to `/demo` page
3. Upload an image
4. Click "Detect Defects"
5. Open browser console (F12)
6. Look for: `✅ Real YOLO Backend: X defects in Yms`

## 🚀 Deployment Options

### Option A: Automated (Easiest)
```bash
DEPLOY_UPDATED_FRONTEND.bat
```

### Option B: Vercel Only
```bash
vercel --prod
```

### Option C: Manual
```bash
git add .
git commit -m "Update to AWS ECS backend"
git push origin main
vercel --prod
```

## 🔧 Manual Environment Variable Setup

### For Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Select your project → Settings → Environment Variables
3. Add: `NEXT_PUBLIC_WELD_API_URL` = `http://23.22.163.148:10000`
4. Redeploy

### For Amplify Console:
1. Go to AWS Amplify Console
2. Select your app → Environment variables
3. Add: `NEXT_PUBLIC_WELD_API_URL` = `http://23.22.163.148:10000`
4. Redeploy

## ✅ Verification Checklist

- [ ] Backend health check returns `model_loaded: true`
- [ ] Local dev server works with ECS backend
- [ ] Vercel deployment updated
- [ ] Amplify deployment updated
- [ ] Detection works on `/demo` page
- [ ] Browser console shows "Real YOLO Backend"
- [ ] No CORS errors

## 🆘 Troubleshooting

### Frontend shows mock detections
**Fix**: Redeploy frontend after setting environment variables

### Backend not responding
**Check**: 
```bash
curl http://23.22.163.148:10000/health
```
**Fix**: Restart ECS service with `MANAGE_DEPLOYMENT.bat`

### "Not Secure" browser warning
**Status**: Normal for HTTP, can be ignored for testing
**Fix**: See `SETUP_HTTPS_ALB.md` for HTTPS setup

## 📊 Backend Status

| Metric | Value |
|--------|-------|
| **URL** | http://23.22.163.148:10000 |
| **Status** | ✅ Running |
| **Model** | ✅ Loaded (weldmodel.pt) |
| **Platform** | AWS ECS Fargate |
| **Cost** | ~$22-32/month |

## 📚 Documentation

- **Complete Guide**: `AWS_ECS_INTEGRATION_COMPLETE.md`
- **Summary**: `ENDPOINT_UPDATE_SUMMARY.md`
- **HTTPS Setup**: `SETUP_HTTPS_ALB.md`

## 🎬 Next Steps

1. **Deploy Now**: Run `DEPLOY_UPDATED_FRONTEND.bat`
2. **Test**: Visit your URL and test `/demo` page
3. **Monitor**: Check CloudWatch logs if needed
4. **Optional**: Set up HTTPS (requires domain name)

---

**Ready to deploy?** Run: `DEPLOY_UPDATED_FRONTEND.bat`

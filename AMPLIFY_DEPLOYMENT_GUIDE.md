# AWS Amplify Deployment - Step-by-Step Guide

## Prerequisites

Before deploying, make sure you have:
- ✅ AWS Account (free tier works!)
- ✅ Git repository connected to GitHub/GitLab/Bitbucket
- ✅ Google OAuth credentials (Client ID + Secret)

---

## Deployment Method 1: Amplify Console (Recommended - Easiest)

### Step 1: Push Your Code to GitHub

```bash
# Make sure all changes are committed
git add .
git commit -m "Ready for AWS Amplify deployment"
git push origin main
```

### Step 2: Go to AWS Amplify Console

1. Visit: https://console.aws.amazon.com/amplify/
2. Click **"Get Started"** under **"Amplify Hosting"**
3. Click **"Host web app"**

### Step 3: Connect Your Repository

1. Select your Git provider (GitHub/GitLab/Bitbucket)
2. Authorize AWS Amplify
3. Select your repository: `Chitti`
4. Select branch: `main`
5. Click **"Next"**

### Step 4: Configure Build Settings

The `amplify.yml` file is already in your repo, so Amplify will detect it automatically!

**Review the build settings:**
- ✅ Build command: `npm run build`
- ✅ Output directory: `.next`
- ✅ Node version: 18+

Click **"Next"**

### Step 5: Add Environment Variables

**Critical - Add these in Amplify Console:**

Click **"Advanced settings"** → **"Environment variables"**

Add these (one by one):

```
NEXTAUTH_SECRET=<your-generated-secret>
NEXTAUTH_URL=https://main.<app-id>.amplifyapp.com
GOOGLE_CLIENT_ID=278114676907-8eqtrlda2voblimoq5ed676ogdl5nsic.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
MODEL_URL=<your-s3-model-url-or-leave-empty>
NEXT_PUBLIC_DETECTION_MODE=tfjs
NEXT_PUBLIC_TFJS_MODEL_URL=/models/yolo-defect-detector/tfjs_model/model.json
NEXT_PUBLIC_BACKEND_DETECTION_URL=/api/detect-lambda
```

**Note:** You'll get the actual Amplify URL after deployment. We'll update `NEXTAUTH_URL` later.

### Step 6: Deploy!

1. Click **"Save and deploy"**
2. Wait for deployment (5-10 minutes)
3. Watch the build logs in real-time

**Build stages:**
- ✅ Provision
- ✅ Build (npm install, npm run build)
- ✅ Deploy
- ✅ Verify

### Step 7: Get Your Amplify URL

After deployment completes:
- You'll see: `https://main.<app-id>.amplifyapp.com`
- This is your production URL! 🎉

### Step 8: Update Environment Variables

1. Go to **App settings** → **Environment variables**
2. Update `NEXTAUTH_URL` to your actual Amplify URL:
   ```
   NEXTAUTH_URL=https://main.<app-id>.amplifyapp.com
   ```
3. Click **"Save"**
4. Go to **Hosting** → **Redeploy this version**

### Step 9: Update Google OAuth Redirect URI

1. Go to Google Cloud Console: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Add **Authorized redirect URI**:
   ```
   https://main.<app-id>.amplifyapp.com/api/auth/callback/google
   ```
4. Click **"Save"**

### Step 10: Test Your Deployment! 🎉

Visit your Amplify URL and test:

1. **Sign-In:** `https://main.<app-id>.amplifyapp.com/auth/signin`
2. **Detection:** `https://main.<app-id>.amplifyapp.com/unified-detection`
3. **Dashboard:** `https://main.<app-id>.amplifyapp.com/dashboard`

---

## Deployment Method 2: Amplify CLI (Advanced)

### Step 1: Install Amplify CLI

```bash
npm install -g @aws-amplify/cli
```

### Step 2: Configure Amplify

```bash
amplify configure
```

Follow the prompts:
1. Sign in to AWS Console
2. Create IAM user
3. Enter access keys

### Step 3: Initialize Amplify

```bash
cd c:\Users\kommi\Downloads\newChitti\Chitti
amplify init
```

Answer the prompts:
- **Enter a name for the project:** `ChittiAINDT`
- **Enter a name for the environment:** `prod`
- **Choose your default editor:** (your choice)
- **App type:** `javascript`
- **Framework:** `react`
- **Source Directory Path:** `.`
- **Distribution Directory Path:** `.next`
- **Build Command:** `npm run build`
- **Start Command:** `npm start`

### Step 4: Add Hosting

```bash
amplify add hosting
```

Choose:
- **Select the plugin module:** `Hosting with Amplify Console`
- **Choose a type:** `Manual deployment`

### Step 5: Deploy

```bash
amplify publish
```

This will:
1. Build your app
2. Deploy to Amplify
3. Give you a URL

---

## Environment Variables Setup

### Generate NEXTAUTH_SECRET

```bash
# Windows (PowerShell)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Mac/Linux
openssl rand -base64 32
```

### Complete .env.local (for reference)

```bash
# Google OAuth
NEXTAUTH_SECRET=<paste-generated-secret>
NEXTAUTH_URL=https://main.<app-id>.amplifyapp.com
GOOGLE_CLIENT_ID=278114676907-8eqtrlda2voblimoq5ed676ogdl5nsic.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-secret>

# Detection
NEXT_PUBLIC_DETECTION_MODE=tfjs
NEXT_PUBLIC_TFJS_MODEL_URL=/models/yolo-defect-detector/tfjs_model/model.json
NEXT_PUBLIC_BACKEND_DETECTION_URL=/api/detect-lambda

# Backend (optional)
MODEL_URL=<s3-url-or-empty>
```

---

## Troubleshooting

### Build Fails with "Module not found"

**Fix:** Add to `amplify.yml`:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
        - npm install -g prisma  # Add this
    build:
      commands:
        - npx prisma generate    # Add this
        - npm run build
```

### "NEXTAUTH_URL Mismatch" Error

**Fix:** Make sure `NEXTAUTH_URL` in Amplify matches your actual URL exactly (no trailing slash).

### Google OAuth "redirect_uri_mismatch"

**Fix:** Add exact redirect URI to Google Console:
```
https://main.<app-id>.amplifyapp.com/api/auth/callback/google
```

### TFJS Model Not Loading

**Fix:** Check that model files are in `/public/models/` and committed to git.

### Backend API 500 Error

**Fix:** Check CloudWatch logs:
1. AWS Console → CloudWatch → Log Groups
2. Look for `/aws/lambda/detect-lambda`
3. Check error messages

---

## Post-Deployment Checklist

- [ ] App builds successfully
- [ ] Deployment completes
- [ ] Can access homepage
- [ ] Google sign-in works
- [ ] TFJS detection works
- [ ] Protected routes redirect to sign-in
- [ ] Console logs show correctly
- [ ] Backend API responds (if configured)

---

## Custom Domain (Optional)

### Step 1: Add Domain in Amplify

1. Go to **App settings** → **Domain management**
2. Click **"Add domain"**
3. Enter your domain (e.g., `chitti-ai.com`)
4. Amplify will provide DNS records

### Step 2: Update DNS

Add the provided CNAME records to your domain registrar.

### Step 3: Update Environment Variables

```
NEXTAUTH_URL=https://chitti-ai.com
```

And update Google OAuth redirect URI.

---

## Continuous Deployment

Every time you push to GitHub:
1. Amplify auto-detects changes
2. Builds your app
3. Deploys automatically
4. Takes ~5 minutes

**Disable auto-deploy:** App settings → Build settings → Auto-build: OFF

---

## Monitoring

### CloudWatch Logs

**Frontend Logs:**
- App settings → Monitoring → CloudWatch logs

**Lambda Logs:**
- AWS Console → CloudWatch → Log Groups → `/aws/lambda/detect-lambda`

### Metrics

- App settings → Monitoring
- See requests, errors, latency

---

## Costs

### Amplify Hosting
- **Free Tier:** 1000 build minutes/month, 15 GB storage
- **After:** ~$0.01/GB served, ~$0.01/build minute

### Lambda (Backend AI)
- **Free Tier:** 1M requests/month, 400k GB-seconds
- **After:** ~$0.20 per 1M requests

**Expected:** $0-5/month for typical usage 🎉

---

## Next Steps

1. **Deploy now** using Method 1 (Amplify Console)
2. Test all features
3. Monitor logs
4. Optimize performance
5. Add custom domain (optional)

**You're ready to deploy!** 🚀

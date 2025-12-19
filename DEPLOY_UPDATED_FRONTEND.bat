@echo off
REM Deploy Updated Frontend to Vercel and Amplify

echo ========================================
echo 🚀 Deploy Updated Frontend
echo ========================================
echo.

echo Backend Endpoint: http://23.22.163.148:10000
echo.

echo ========================================
echo Step 1: Commit Changes
echo ========================================
echo.

git add .env.production .env.local .env.example app/api/detect/route.ts app/api/detect-real/route.ts
git commit -m "Update backend endpoint to AWS ECS (http://23.22.163.148:10000)"

echo.
echo ========================================
echo Step 2: Push to GitHub
echo ========================================
echo.

git push origin main

echo.
echo ========================================
echo Step 3: Deploy to Vercel
echo ========================================
echo.

echo Deploying to Vercel...
call vercel --prod

echo.
echo ========================================
echo ✅ Deployment Complete!
echo ========================================
echo.

echo Your frontend is now using the AWS ECS backend:
echo - Backend: http://23.22.163.148:10000
echo - Health: http://23.22.163.148:10000/health
echo - Detect: http://23.22.163.148:10000/detect
echo.

echo 📋 Vercel Dashboard:
echo https://vercel.com/dashboard
echo.

echo 📋 AWS Amplify Console:
echo https://us-east-1.console.aws.amazon.com/amplify/home
echo.

echo 🧪 Test your deployment:
echo 1. Visit your Vercel URL
echo 2. Go to /demo page
echo 3. Upload an image and click "Detect Defects"
echo 4. Check browser console for backend logs
echo.

pause

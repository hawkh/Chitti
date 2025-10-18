@echo off
echo === Deploying Chitti AI to Cloud Run ===
echo.

set PROJECT_ID=green-plasma-475110-k7
set REGION=us-central1

echo 1. Deploying Next.js frontend...
gcloud run deploy chitti-nextjs --source . --region=%REGION% --platform=managed --allow-unauthenticated --project=%PROJECT_ID%

echo.
echo 2. Deploying Python backend...
cd python-backend
gcloud run deploy chitti-python --source . --region=%REGION% --platform=managed --allow-unauthenticated --project=%PROJECT_ID%
cd ..

echo.
echo === Deployment Complete ===
echo.
echo Get URLs:
gcloud run services describe chitti-nextjs --region=%REGION% --format="value(status.url)"
gcloud run services describe chitti-python --region=%REGION% --format="value(status.url)"
pause

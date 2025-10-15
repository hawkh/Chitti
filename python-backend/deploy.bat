@echo off
set PROJECT_ID=green-plasma-475110-k7
set SERVICE_NAME=chitti-yolo-backend
set REGION=asia-south1

echo Building and deploying Python YOLO backend to Cloud Run...

gcloud run deploy %SERVICE_NAME% ^
  --source . ^
  --platform managed ^
  --region %REGION% ^
  --project %PROJECT_ID% ^
  --allow-unauthenticated ^
  --memory 4Gi ^
  --cpu 2 ^
  --timeout 300 ^
  --max-instances 10 ^
  --min-instances 0

echo Deployment complete!
echo Get service URL with: gcloud run services describe %SERVICE_NAME% --region %REGION% --format "value(status.url)"

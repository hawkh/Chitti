@echo off
echo ========================================
echo Deploying Chitti AI to GCP Cloud Run
echo ========================================
echo.

echo [1/3] Deploying Next.js Frontend...
gcloud run deploy chitti-app ^
  --source . ^
  --region=us-central1 ^
  --allow-unauthenticated ^
  --set-env-vars DATABASE_URL="postgresql://postgres:pgadmin@/chitti_ndt?host=/cloudsql/green-plasma-475110-k7:us-central1:chitti-db" ^
  --set-env-vars REDIS_URL="redis://default:LZgjewGNa7Ti1h5IEw4UtHE2S7SCjLb4@redis-18971.c330.asia-south1-1.gce.redns.redis-cloud.com:18971" ^
  --add-cloudsql-instances green-plasma-475110-k7:us-central1:chitti-db

echo.
echo [2/3] Deploying Python YOLO Backend...
gcloud run deploy yolo-backend ^
  --source ./python-backend ^
  --region=us-central1 ^
  --allow-unauthenticated ^
  --port=5000

echo.
echo [3/3] Running Database Migrations...
gcloud run jobs create migrate-db ^
  --image=gcr.io/green-plasma-475110-k7/chitti-app ^
  --region=us-central1 ^
  --set-env-vars DATABASE_URL="postgresql://postgres:pgadmin@/chitti_ndt?host=/cloudsql/green-plasma-475110-k7:us-central1:chitti-db" ^
  --add-cloudsql-instances green-plasma-475110-k7:us-central1:chitti-db ^
  --command="npx" ^
  --args="prisma,migrate,deploy"

gcloud run jobs execute migrate-db --region=us-central1 --wait

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
pause

@echo off
cls
echo ╔════════════════════════════════════════════════════════════╗
echo ║              DEPLOY TO GCP - Automated Setup               ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

set /p PROJECT_ID="Enter your GCP Project ID: "
set /p REGION="Enter GCP Region (default: us-central1): "
if "%REGION%"=="" set REGION=us-central1
set /p ZONE="Enter GCP Zone (default: us-central1-a): "
if "%ZONE%"=="" set ZONE=us-central1-a

echo.
echo Configuration:
echo   Project ID: %PROJECT_ID%
echo   Region: %REGION%
echo   Zone: %ZONE%
echo.
pause

echo [1/10] Setting GCP Project...
gcloud config set project %PROJECT_ID%
echo ✓ Project set

echo.
echo [2/10] Enabling required APIs...
gcloud services enable compute.googleapis.com
gcloud services enable container.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable storage-api.googleapis.com
gcloud services enable redis.googleapis.com
echo ✓ APIs enabled

echo.
echo [3/10] Creating GKE Cluster...
gcloud container clusters create chitti-cluster --zone=%ZONE% --num-nodes=3 --machine-type=n1-standard-2 --enable-autoscaling --min-nodes=3 --max-nodes=10
echo ✓ GKE Cluster created

echo.
echo [4/10] Creating Cloud SQL Instance...
set /p DB_PASSWORD="Enter PostgreSQL password: "
gcloud sql instances create chitti-postgres --database-version=POSTGRES_15 --tier=db-n1-standard-2 --region=%REGION% --root-password=%DB_PASSWORD%
gcloud sql databases create chitti_ndt --instance=chitti-postgres
echo ✓ Cloud SQL created

echo.
echo [5/10] Creating Cloud Storage Bucket...
gcloud storage buckets create gs://chitti-ndt-storage-%PROJECT_ID% --location=%REGION%
echo ✓ Storage bucket created

echo.
echo [6/10] Creating Redis Instance...
gcloud redis instances create chitti-redis --size=1 --region=%REGION%
echo ✓ Redis created

echo.
echo [7/10] Getting credentials...
gcloud container clusters get-credentials chitti-cluster --zone=%ZONE%
echo ✓ kubectl configured

echo.
echo [8/10] Building Docker images...
docker build -t gcr.io/%PROJECT_ID%/auth-service:latest ./microservices/auth-service
docker build -t gcr.io/%PROJECT_ID%/file-service:latest ./microservices/file-service
docker build -t gcr.io/%PROJECT_ID%/report-service:latest ./microservices/report-service
docker build -t gcr.io/%PROJECT_ID%/detection-service:latest ./python-backend
echo ✓ Images built

echo.
echo [9/10] Pushing images to GCR...
gcloud auth configure-docker
docker push gcr.io/%PROJECT_ID%/auth-service:latest
docker push gcr.io/%PROJECT_ID%/file-service:latest
docker push gcr.io/%PROJECT_ID%/report-service:latest
docker push gcr.io/%PROJECT_ID%/detection-service:latest
echo ✓ Images pushed

echo.
echo [10/10] Deploying to GKE...
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/monitoring.yaml
echo ✓ Deployed

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                  DEPLOYMENT COMPLETE                       ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Getting service URLs...
kubectl get services
echo.
echo View logs: kubectl logs -f deployment/auth-service
echo Scale: kubectl scale deployment auth-service --replicas=10
echo.
pause

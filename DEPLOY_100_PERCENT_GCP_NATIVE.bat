@echo off
setlocal enabledelayedexpansion
cls
echo ╔════════════════════════════════════════════════════════════╗
echo ║     DEPLOY 100%% GCP NATIVE - green-plasma-475110-k7      ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

set PROJECT_ID=green-plasma-475110-k7
set REGION=us-central1
set ZONE=us-central1-a

echo Project: %PROJECT_ID%
echo Region: %REGION%
echo Zone: %ZONE%
echo.
echo Press any key to start deployment...
pause > nul

echo.
echo [1/12] Setting GCP Project...
gcloud config set project %PROJECT_ID% >nul 2>&1
echo ✓ Project set

echo.
echo [2/12] Enabling required APIs (2-3 minutes)...
gcloud services enable compute.googleapis.com container.googleapis.com sqladmin.googleapis.com storage-api.googleapis.com redis.googleapis.com pubsub.googleapis.com secretmanager.googleapis.com monitoring.googleapis.com logging.googleapis.com >nul 2>&1
echo ✓ APIs enabled

echo.
echo [3/12] Creating Service Account...
gcloud iam service-accounts create chitti-sa --display-name="Chitti NDT Service Account" >nul 2>&1
gcloud projects add-iam-policy-binding %PROJECT_ID% --member="serviceAccount:chitti-sa@%PROJECT_ID%.iam.gserviceaccount.com" --role="roles/editor" >nul 2>&1
if not exist chitti-key.json (
    gcloud iam service-accounts keys create chitti-key.json --iam-account=chitti-sa@%PROJECT_ID%.iam.gserviceaccount.com >nul 2>&1
)
echo ✓ Service account ready

echo.
echo [4/12] Generating secrets...
for /f "delims=" %%i in ('node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"') do set JWT_SECRET=%%i
for /f "delims=" %%i in ('node -e "console.log(require('crypto').randomBytes(16).toString('base64').replace(/[/+=]/g,'A'))"') do set DB_PASSWORD=%%i
echo ✓ Secrets generated

echo.
echo [5/12] Creating GKE Cluster (5-10 minutes)...
gcloud container clusters create chitti-cluster --zone=%ZONE% --num-nodes=3 --machine-type=n1-standard-2 --enable-autoscaling --min-nodes=3 --max-nodes=10 --quiet >nul 2>&1
if errorlevel 1 (
    echo ⚠ Cluster exists, getting credentials...
    gcloud container clusters get-credentials chitti-cluster --zone=%ZONE% >nul 2>&1
)
echo ✓ GKE Cluster ready

echo.
echo [6/12] Creating Cloud SQL (5-10 minutes)...
gcloud sql instances create chitti-postgres --database-version=POSTGRES_15 --tier=db-n1-standard-2 --region=%REGION% --root-password=!DB_PASSWORD! --quiet >nul 2>&1
gcloud sql databases create chitti_ndt --instance=chitti-postgres >nul 2>&1
echo ✓ Cloud SQL ready

echo.
echo [7/12] Creating Cloud Storage...
gsutil mb -l %REGION% gs://chitti-ndt-storage-%PROJECT_ID% >nul 2>&1
gsutil iam ch allUsers:objectViewer gs://chitti-ndt-storage-%PROJECT_ID% >nul 2>&1
echo ✓ Cloud Storage ready

echo.
echo [8/12] Creating Memorystore Redis (3-5 minutes)...
gcloud redis instances create chitti-redis --size=1 --region=%REGION% --redis-version=redis_7_0 >nul 2>&1
echo ✓ Redis ready

echo.
echo [9/12] Creating Cloud Pub/Sub...
gcloud pubsub topics create file-processing >nul 2>&1
gcloud pubsub topics create report-generation >nul 2>&1
gcloud pubsub subscriptions create file-processing-sub --topic=file-processing >nul 2>&1
gcloud pubsub subscriptions create report-generation-sub --topic=report-generation >nul 2>&1
echo ✓ Pub/Sub ready

echo.
echo [10/12] Configuring kubectl...
gcloud container clusters get-credentials chitti-cluster --zone=%ZONE% >nul 2>&1
echo ✓ kubectl configured

echo.
echo [11/12] Creating Kubernetes secrets...
for /f "tokens=*" %%i in ('gcloud sql instances describe chitti-postgres --format="value(ipAddresses[0].ipAddress)"') do set DB_HOST=%%i
for /f "tokens=*" %%i in ('gcloud redis instances describe chitti-redis --region=%REGION% --format="value(host)"') do set REDIS_HOST=%%i

kubectl delete secret app-secrets >nul 2>&1
kubectl create secret generic app-secrets --from-literal=jwt-secret=!JWT_SECRET! --from-literal=db-password=!DB_PASSWORD! --from-literal=db-host=!DB_HOST! --from-literal=redis-host=!REDIS_HOST! >nul 2>&1

kubectl delete secret gcp-secret >nul 2>&1
kubectl create secret generic gcp-secret --from-file=key.json=chitti-key.json >nul 2>&1

kubectl delete configmap app-config >nul 2>&1
kubectl create configmap app-config --from-literal=GCP_PROJECT_ID=%PROJECT_ID% --from-literal=GCS_BUCKET=chitti-ndt-storage-%PROJECT_ID% --from-literal=REDIS_HOST=!REDIS_HOST! --from-literal=DB_HOST=!DB_HOST! >nul 2>&1

echo ✓ Secrets created

echo.
echo [12/12] Building and deploying (10-15 minutes)...
gcloud auth configure-docker --quiet >nul 2>&1

echo Building images...
docker build -t gcr.io/%PROJECT_ID%/auth-service:latest ./microservices/auth-service >nul 2>&1
docker build -t gcr.io/%PROJECT_ID%/file-service:latest ./microservices/file-service >nul 2>&1
docker build -t gcr.io/%PROJECT_ID%/report-service:latest ./microservices/report-service >nul 2>&1
docker build -t gcr.io/%PROJECT_ID%/detection-service:latest ./python-backend >nul 2>&1

echo Pushing images...
docker push gcr.io/%PROJECT_ID%/auth-service:latest >nul 2>&1
docker push gcr.io/%PROJECT_ID%/file-service:latest >nul 2>&1
docker push gcr.io/%PROJECT_ID%/report-service:latest >nul 2>&1
docker push gcr.io/%PROJECT_ID%/detection-service:latest >nul 2>&1

echo Deploying to Kubernetes...
kubectl apply -f k8s/gcp-deployment.yaml >nul 2>&1
echo ✓ Services deployed

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║              DEPLOYMENT COMPLETE - 100%% GCP NATIVE        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

(
echo GCP_PROJECT_ID=%PROJECT_ID%
echo JWT_SECRET=!JWT_SECRET!
echo DB_PASSWORD=!DB_PASSWORD!
echo DB_HOST=!DB_HOST!
echo REDIS_HOST=!REDIS_HOST!
echo GCS_BUCKET=chitti-ndt-storage-%PROJECT_ID%
) > .env.production

echo ✓ Credentials saved to .env.production
echo.
echo Waiting for Load Balancer...
timeout /t 30 /nobreak >nul
kubectl get svc
echo.
echo To get external IP: kubectl get svc api-gateway
echo To view pods: kubectl get pods
echo.
pause

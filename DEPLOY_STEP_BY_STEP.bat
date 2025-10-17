@echo off
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

echo Run these commands one by one:
echo.
echo 1. Set project:
echo    gcloud config set project %PROJECT_ID%
echo.
echo 2. Enable APIs:
echo    gcloud services enable compute.googleapis.com container.googleapis.com sqladmin.googleapis.com storage-api.googleapis.com redis.googleapis.com pubsub.googleapis.com
echo.
echo 3. Create service account:
echo    gcloud iam service-accounts create chitti-sa
echo    gcloud projects add-iam-policy-binding %PROJECT_ID% --member="serviceAccount:chitti-sa@%PROJECT_ID%.iam.gserviceaccount.com" --role="roles/editor"
echo    gcloud iam service-accounts keys create chitti-key.json --iam-account=chitti-sa@%PROJECT_ID%.iam.gserviceaccount.com
echo.
echo 4. Create GKE cluster:
echo    gcloud container clusters create chitti-cluster --zone=%ZONE% --num-nodes=3 --machine-type=n1-standard-2 --enable-autoscaling --min-nodes=3 --max-nodes=10
echo.
echo 5. Create Cloud SQL:
echo    gcloud sql instances create chitti-postgres --database-version=POSTGRES_15 --tier=db-n1-standard-2 --region=%REGION% --root-password=YOUR_PASSWORD
echo    gcloud sql databases create chitti_ndt --instance=chitti-postgres
echo.
echo 6. Create Cloud Storage:
echo    gsutil mb -l %REGION% gs://chitti-ndt-storage-%PROJECT_ID%
echo.
echo 7. Create Redis:
echo    gcloud redis instances create chitti-redis --size=1 --region=%REGION% --redis-version=redis_7_0
echo.
echo 8. Create Pub/Sub:
echo    gcloud pubsub topics create file-processing
echo    gcloud pubsub subscriptions create file-processing-sub --topic=file-processing
echo.
echo 9. Get credentials:
echo    gcloud container clusters get-credentials chitti-cluster --zone=%ZONE%
echo.
echo 10. Build and push images:
echo     gcloud auth configure-docker
echo     docker build -t gcr.io/%PROJECT_ID%/auth-service:latest ./microservices/auth-service
echo     docker push gcr.io/%PROJECT_ID%/auth-service:latest
echo.
echo 11. Deploy:
echo     kubectl apply -f k8s/gcp-deployment.yaml
echo.
echo 12. Get external IP:
echo     kubectl get svc api-gateway
echo.
pause

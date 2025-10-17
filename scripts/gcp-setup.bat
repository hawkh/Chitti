@echo off
REM Chitti AI - GCP Setup Script (Windows)

set PROJECT_ID=green-plasma-475110-k7
set REGION=us-central1
set ZONE=us-central1-a

echo === Chitti AI GCP Setup ===
echo Project: %PROJECT_ID%
echo Region: %REGION%
echo.

echo 1. Getting Cloud SQL IP...
for /f %%i in ('gcloud sql instances describe chitti-postgres --format="get(ipAddresses[0].ipAddress)"') do set CLOUDSQL_IP=%%i
echo Cloud SQL IP: %CLOUDSQL_IP%

echo 2. Getting Redis IP...
for /f %%i in ('gcloud redis instances describe chitti-redis --region=%REGION% --format="get(host)"') do set REDIS_IP=%%i
echo Redis IP: %REDIS_IP%

echo 3. Creating service account...
gcloud iam service-accounts create chitti-gke-sa --display-name="Chitti GKE Service Account"

echo 4. Granting permissions...
gcloud projects add-iam-policy-binding %PROJECT_ID% --member="serviceAccount:chitti-gke-sa@%PROJECT_ID%.iam.gserviceaccount.com" --role="roles/storage.objectAdmin"
gcloud projects add-iam-policy-binding %PROJECT_ID% --member="serviceAccount:chitti-gke-sa@%PROJECT_ID%.iam.gserviceaccount.com" --role="roles/pubsub.editor"

echo 5. Creating service account key...
gcloud iam service-accounts keys create gcp-key.json --iam-account=chitti-gke-sa@%PROJECT_ID%.iam.gserviceaccount.com

echo 6. Getting GKE credentials...
gcloud container clusters get-credentials chitti-cluster --zone=%ZONE%

echo.
echo === Setup Complete ===
echo Cloud SQL IP: %CLOUDSQL_IP%
echo Redis IP: %REDIS_IP%
echo.
echo Next steps:
echo 1. Update .env.production with these IPs
echo 2. Create Kubernetes secrets
echo 3. Deploy application
pause

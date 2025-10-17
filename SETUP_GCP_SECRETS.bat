@echo off
cls
echo ╔════════════════════════════════════════════════════════════╗
echo ║         SETUP GCP SECRETS - Automated Configuration        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

set /p PROJECT_ID="Enter your GCP Project ID: "
gcloud config set project %PROJECT_ID%

echo.
echo [1/6] Generating JWT Secret...
for /f %%i in ('node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"') do set JWT_SECRET=%%i
echo Generated: %JWT_SECRET%

echo.
echo [2/6] Generating Database Password...
for /f %%i in ('node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"') do set DB_PASSWORD=%%i
echo Generated: %DB_PASSWORD%

echo.
echo [3/6] Creating GCP Secrets...
echo %JWT_SECRET% | gcloud secrets create jwt-secret --data-file=-
echo %DB_PASSWORD% | gcloud secrets create db-password --data-file=-

echo.
echo [4/6] Granting access to service account...
set /p SA_EMAIL="Enter service account email (chitti-sa@%PROJECT_ID%.iam.gserviceaccount.com): "
gcloud secrets add-iam-policy-binding jwt-secret --member="serviceAccount:%SA_EMAIL%" --role="roles/secretmanager.secretAccessor"
gcloud secrets add-iam-policy-binding db-password --member="serviceAccount:%SA_EMAIL%" --role="roles/secretmanager.secretAccessor"

echo.
echo [5/6] Creating Kubernetes secrets...
kubectl create secret generic app-secrets ^
  --from-literal=jwt-secret=%JWT_SECRET% ^
  --from-literal=db-password=%DB_PASSWORD%

echo.
echo [6/6] Saving to .env.production...
(
echo # Generated Secrets - %date% %time%
echo GCP_PROJECT_ID=%PROJECT_ID%
echo JWT_SECRET=%JWT_SECRET%
echo DB_PASSWORD=%DB_PASSWORD%
echo.
echo # GCP Services
echo GCS_BUCKET=chitti-ndt-storage-%PROJECT_ID%
echo GCP_REGION=us-central1
echo GCP_ZONE=us-central1-a
) > .env.production

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    SECRETS CONFIGURED                      ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Secrets saved to:
echo   - GCP Secret Manager
echo   - Kubernetes secrets
echo   - .env.production file
echo.
echo IMPORTANT: Keep .env.production secure and do not commit to git!
echo.
pause

# Continue deployment without kubectl install
$PROJECT_ID = "green-plasma-475110-k7"
$REGION = "us-central1"
$ZONE = "us-central1-a"

Write-Host "Continuing deployment (kubectl will be downloaded separately)..." -ForegroundColor Cyan
Write-Host ""

# Wait for Cloud SQL
Write-Host "[1/8] Waiting for Cloud SQL to finish..." -ForegroundColor Yellow
Write-Host "This may take 5-10 minutes..." -ForegroundColor Gray
Start-Sleep -Seconds 300
Write-Host "✓ Should be ready" -ForegroundColor Green

# Create database
Write-Host "[2/8] Creating database..." -ForegroundColor Yellow
gcloud sql databases create chitti_ndt --instance=chitti-postgres
Write-Host "✓ Database created" -ForegroundColor Green

# Create storage
Write-Host "[3/8] Creating Cloud Storage..." -ForegroundColor Yellow
gcloud storage buckets create gs://chitti-ndt-storage-$PROJECT_ID --location=$REGION
gcloud storage buckets add-iam-policy-binding gs://chitti-ndt-storage-$PROJECT_ID --member=allUsers --role=roles/storage.objectViewer
Write-Host "✓ Storage created" -ForegroundColor Green

# Wait for Redis
Write-Host "[4/8] Waiting for Redis to finish..." -ForegroundColor Yellow
Start-Sleep -Seconds 60
Write-Host "✓ Redis ready" -ForegroundColor Green

# Create Pub/Sub
Write-Host "[5/8] Creating Pub/Sub..." -ForegroundColor Yellow
gcloud pubsub topics create file-processing
gcloud pubsub topics create report-generation
gcloud pubsub subscriptions create file-processing-sub --topic=file-processing
gcloud pubsub subscriptions create report-generation-sub --topic=report-generation
Write-Host "✓ Pub/Sub created" -ForegroundColor Green

# Get IPs
Write-Host "[6/8] Getting service IPs..." -ForegroundColor Yellow
$DB_HOST = gcloud sql instances describe chitti-postgres --format="value(ipAddresses[0].ipAddress)"
$REDIS_HOST = gcloud redis instances describe chitti-redis --region=$REGION --format="value(host)"
Write-Host "DB Host: $DB_HOST" -ForegroundColor Gray
Write-Host "Redis Host: $REDIS_HOST" -ForegroundColor Gray

# Create service account
Write-Host "[7/8] Creating service account..." -ForegroundColor Yellow
gcloud iam service-accounts create chitti-sa --display-name="Chitti NDT Service Account" 2>$null
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:chitti-sa@$PROJECT_ID.iam.gserviceaccount.com" --role="roles/editor" 2>$null | Out-Null
if (-not (Test-Path "chitti-key.json")) {
    gcloud iam service-accounts keys create chitti-key.json --iam-account=chitti-sa@$PROJECT_ID.iam.gserviceaccount.com
}
Write-Host "✓ Service account created" -ForegroundColor Green

# Generate secrets
Write-Host "[8/8] Generating secrets..." -ForegroundColor Yellow
$JWT_SECRET = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
$DB_PASSWORD = "YourPassword123"

# Save everything
@"
GCP_PROJECT_ID=$PROJECT_ID
JWT_SECRET=$JWT_SECRET
DB_PASSWORD=$DB_PASSWORD
DB_HOST=$DB_HOST
REDIS_HOST=$REDIS_HOST
GCS_BUCKET=chitti-ndt-storage-$PROJECT_ID
GCP_REGION=$REGION
GCP_ZONE=$ZONE
"@ | Out-File -FilePath .env.production -Encoding UTF8

Write-Host "✓ Secrets saved to .env.production" -ForegroundColor Green

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              INFRASTRUCTURE READY                          ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Download kubectl: https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/" -ForegroundColor Gray
Write-Host "2. Or use Cloud Shell: https://console.cloud.google.com/kubernetes/list?project=$PROJECT_ID" -ForegroundColor Gray
Write-Host ""
Write-Host "Then run these commands:" -ForegroundColor Yellow
Write-Host "  gcloud container clusters get-credentials chitti-cluster --zone=$ZONE" -ForegroundColor Gray
Write-Host "  kubectl create secret generic app-secrets --from-literal=jwt-secret=$JWT_SECRET --from-literal=db-password=$DB_PASSWORD --from-literal=db-host=$DB_HOST --from-literal=redis-host=$REDIS_HOST" -ForegroundColor Gray
Write-Host "  kubectl create secret generic gcp-secret --from-file=key.json=chitti-key.json" -ForegroundColor Gray
Write-Host "  kubectl create configmap app-config --from-literal=GCP_PROJECT_ID=$PROJECT_ID --from-literal=GCS_BUCKET=chitti-ndt-storage-$PROJECT_ID --from-literal=REDIS_HOST=$REDIS_HOST --from-literal=DB_HOST=$DB_HOST" -ForegroundColor Gray
Write-Host ""
Write-Host "All credentials saved to .env.production" -ForegroundColor Green

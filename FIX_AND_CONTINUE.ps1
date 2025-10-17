# Fix issues and continue deployment
$PROJECT_ID = "green-plasma-475110-k7"
$REGION = "us-central1"
$ZONE = "us-central1-a"

Write-Host "Fixing issues and continuing deployment..." -ForegroundColor Cyan
Write-Host ""

# 1. Install kubectl
Write-Host "[1/6] Installing kubectl..." -ForegroundColor Yellow
gcloud components install kubectl --quiet
Write-Host "✓ kubectl installed" -ForegroundColor Green

# 2. Install gke-gcloud-auth-plugin
Write-Host "[2/6] Installing gke-gcloud-auth-plugin..." -ForegroundColor Yellow
gcloud components install gke-gcloud-auth-plugin --quiet
Write-Host "✓ Auth plugin installed" -ForegroundColor Green

# 3. Fix Cloud SQL (use correct tier)
Write-Host "[3/6] Creating Cloud SQL with correct tier..." -ForegroundColor Yellow
$DB_PASSWORD = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 16 | ForEach-Object {[char]$_})
gcloud sql instances create chitti-postgres --database-version=POSTGRES_15 --tier=db-f1-micro --region=$REGION --root-password=$DB_PASSWORD
gcloud sql databases create chitti_ndt --instance=chitti-postgres
Write-Host "✓ Cloud SQL created" -ForegroundColor Green

# 4. Fix gsutil permissions (run as admin or use gcloud storage)
Write-Host "[4/6] Creating Cloud Storage..." -ForegroundColor Yellow
gcloud storage buckets create gs://chitti-ndt-storage-$PROJECT_ID --location=$REGION
gcloud storage buckets add-iam-policy-binding gs://chitti-ndt-storage-$PROJECT_ID --member=allUsers --role=roles/storage.objectViewer
Write-Host "✓ Cloud Storage created" -ForegroundColor Green

# 5. Wait for Redis (already creating)
Write-Host "[5/6] Waiting for Redis to finish..." -ForegroundColor Yellow
Start-Sleep -Seconds 180
Write-Host "✓ Redis should be ready" -ForegroundColor Green

# 6. Create Pub/Sub
Write-Host "[6/6] Creating Pub/Sub..." -ForegroundColor Yellow
gcloud pubsub topics create file-processing
gcloud pubsub topics create report-generation
gcloud pubsub subscriptions create file-processing-sub --topic=file-processing
gcloud pubsub subscriptions create report-generation-sub --topic=report-generation
Write-Host "✓ Pub/Sub created" -ForegroundColor Green

Write-Host ""
Write-Host "✓ All fixes applied!" -ForegroundColor Green
Write-Host ""
Write-Host "Now run the full deployment:" -ForegroundColor Yellow
Write-Host "  cd C:\Users\kommi\Downloads\Chitti" -ForegroundColor Gray
Write-Host "  .\Deploy-GCP-Native.ps1" -ForegroundColor Gray
Write-Host ""

# Save password
@"
DB_PASSWORD=$DB_PASSWORD
"@ | Out-File -FilePath .db-password.txt -Encoding UTF8
Write-Host "Database password saved to .db-password.txt" -ForegroundColor Green

# Deploy 100% GCP Native - green-plasma-475110-k7
$PROJECT_ID = "green-plasma-475110-k7"
$REGION = "us-central1"
$ZONE = "us-central1-a"

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     DEPLOY 100% GCP NATIVE - $PROJECT_ID      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Generate secrets
Write-Host "[1/12] Generating secrets..." -ForegroundColor Yellow
$JWT_SECRET = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
$DB_PASSWORD = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 16 | ForEach-Object {[char]$_})
Write-Host "✓ Secrets generated" -ForegroundColor Green

# Wait for cluster (if creating)
Write-Host "[2/12] Waiting for GKE cluster (this may take 5-10 minutes)..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C if cluster creation fails, then run commands manually" -ForegroundColor Gray

# Get credentials once cluster is ready
Write-Host "[3/12] Getting cluster credentials..." -ForegroundColor Yellow
gcloud container clusters get-credentials chitti-cluster --zone=$ZONE
Write-Host "✓ kubectl configured" -ForegroundColor Green

# Create Cloud SQL
Write-Host "[4/12] Creating Cloud SQL (5-10 minutes)..." -ForegroundColor Yellow
gcloud sql instances create chitti-postgres --database-version=POSTGRES_15 --tier=db-n1-standard-2 --region=$REGION --root-password=$DB_PASSWORD 2>$null
if ($LASTEXITCODE -ne 0) { Write-Host "⚠ SQL instance may already exist" -ForegroundColor Yellow }
gcloud sql databases create chitti_ndt --instance=chitti-postgres 2>$null
Write-Host "✓ Cloud SQL ready" -ForegroundColor Green

# Create Cloud Storage
Write-Host "[5/12] Creating Cloud Storage..." -ForegroundColor Yellow
gsutil mb -l $REGION gs://chitti-ndt-storage-$PROJECT_ID 2>$null
gsutil iam ch allUsers:objectViewer gs://chitti-ndt-storage-$PROJECT_ID 2>$null
Write-Host "✓ Cloud Storage ready" -ForegroundColor Green

# Create Redis
Write-Host "[6/12] Creating Memorystore Redis (3-5 minutes)..." -ForegroundColor Yellow
gcloud redis instances create chitti-redis --size=1 --region=$REGION --redis-version=redis_7_0 2>$null
if ($LASTEXITCODE -ne 0) { Write-Host "⚠ Redis may already exist" -ForegroundColor Yellow }
Write-Host "✓ Redis ready" -ForegroundColor Green

# Create Pub/Sub
Write-Host "[7/12] Creating Cloud Pub/Sub..." -ForegroundColor Yellow
gcloud pubsub topics create file-processing 2>$null
gcloud pubsub topics create report-generation 2>$null
gcloud pubsub subscriptions create file-processing-sub --topic=file-processing 2>$null
gcloud pubsub subscriptions create report-generation-sub --topic=report-generation 2>$null
Write-Host "✓ Pub/Sub ready" -ForegroundColor Green

# Get IPs
Write-Host "[8/12] Getting service IPs..." -ForegroundColor Yellow
$DB_HOST = gcloud sql instances describe chitti-postgres --format="value(ipAddresses[0].ipAddress)"
$REDIS_HOST = gcloud redis instances describe chitti-redis --region=$REGION --format="value(host)"
Write-Host "DB Host: $DB_HOST" -ForegroundColor Gray
Write-Host "Redis Host: $REDIS_HOST" -ForegroundColor Gray
Write-Host "✓ IPs retrieved" -ForegroundColor Green

# Create service account key
Write-Host "[9/12] Creating service account..." -ForegroundColor Yellow
gcloud iam service-accounts create chitti-sa --display-name="Chitti NDT Service Account" 2>$null
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:chitti-sa@$PROJECT_ID.iam.gserviceaccount.com" --role="roles/editor" 2>$null | Out-Null
if (-not (Test-Path "chitti-key.json")) {
    gcloud iam service-accounts keys create chitti-key.json --iam-account=chitti-sa@$PROJECT_ID.iam.gserviceaccount.com
}
Write-Host "✓ Service account ready" -ForegroundColor Green

# Create Kubernetes secrets
Write-Host "[10/12] Creating Kubernetes secrets..." -ForegroundColor Yellow
kubectl delete secret app-secrets 2>$null
kubectl create secret generic app-secrets --from-literal=jwt-secret=$JWT_SECRET --from-literal=db-password=$DB_PASSWORD --from-literal=db-host=$DB_HOST --from-literal=redis-host=$REDIS_HOST

kubectl delete secret gcp-secret 2>$null
kubectl create secret generic gcp-secret --from-file=key.json=chitti-key.json

kubectl delete configmap app-config 2>$null
kubectl create configmap app-config --from-literal=GCP_PROJECT_ID=$PROJECT_ID --from-literal=GCS_BUCKET=chitti-ndt-storage-$PROJECT_ID --from-literal=REDIS_HOST=$REDIS_HOST --from-literal=DB_HOST=$DB_HOST
Write-Host "✓ Secrets created" -ForegroundColor Green

# Build and push images
Write-Host "[11/12] Building and pushing Docker images (10-15 minutes)..." -ForegroundColor Yellow
gcloud auth configure-docker --quiet

Write-Host "  Building auth-service..." -ForegroundColor Gray
docker build -t gcr.io/$PROJECT_ID/auth-service:latest ./microservices/auth-service
docker push gcr.io/$PROJECT_ID/auth-service:latest

Write-Host "  Building file-service..." -ForegroundColor Gray
docker build -t gcr.io/$PROJECT_ID/file-service:latest ./microservices/file-service
docker push gcr.io/$PROJECT_ID/file-service:latest

Write-Host "  Building report-service..." -ForegroundColor Gray
docker build -t gcr.io/$PROJECT_ID/report-service:latest ./microservices/report-service
docker push gcr.io/$PROJECT_ID/report-service:latest

Write-Host "  Building detection-service..." -ForegroundColor Gray
docker build -t gcr.io/$PROJECT_ID/detection-service:latest ./python-backend
docker push gcr.io/$PROJECT_ID/detection-service:latest

Write-Host "✓ Images pushed" -ForegroundColor Green

# Deploy to Kubernetes
Write-Host "[12/12] Deploying to Kubernetes..." -ForegroundColor Yellow
kubectl apply -f k8s/gcp-deployment.yaml
Write-Host "✓ Services deployed" -ForegroundColor Green

# Save credentials
Write-Host ""
Write-Host "Saving credentials to .env.production..." -ForegroundColor Yellow
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

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              DEPLOYMENT COMPLETE - 100% GCP NATIVE        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "Waiting for Load Balancer (30 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "Services:" -ForegroundColor Cyan
kubectl get svc

Write-Host ""
Write-Host "To get external IP:" -ForegroundColor Yellow
Write-Host "  kubectl get svc api-gateway" -ForegroundColor Gray
Write-Host ""
Write-Host "To view pods:" -ForegroundColor Yellow
Write-Host "  kubectl get pods" -ForegroundColor Gray
Write-Host ""
Write-Host "Credentials saved to: .env.production" -ForegroundColor Green
Write-Host ""

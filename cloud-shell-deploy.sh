#!/bin/bash
# Complete GCP Deployment in Cloud Shell
PROJECT_ID="green-plasma-475110-k7"
REGION="us-central1"
ZONE="us-central1-a"

echo "=========================================="
echo "  GCP DEPLOYMENT - CLOUD SHELL"
echo "=========================================="

# Get IPs
echo "[1/6] Getting service IPs..."
DB_HOST=$(gcloud sql instances describe chitti-postgres --format="get(ipAddresses[0].ipAddress)")
REDIS_HOST=$(gcloud redis instances describe chitti-redis --region=$REGION --format="get(host)")
echo "✓ DB Host: $DB_HOST"
echo "✓ Redis Host: $REDIS_HOST"

# Create service account
echo "[2/6] Creating service account..."
gcloud iam service-accounts create chitti-gke-sa --display-name="Chitti GKE Service Account" 2>/dev/null || echo "Service account exists"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:chitti-gke-sa@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin" --quiet

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:chitti-gke-sa@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/pubsub.editor" --quiet

gcloud iam service-accounts keys create ~/gcp-key.json \
  --iam-account=chitti-gke-sa@$PROJECT_ID.iam.gserviceaccount.com 2>/dev/null || echo "Key exists"

echo "✓ Service account ready"

# Get GKE credentials
echo "[3/6] Configuring kubectl..."
gcloud container clusters get-credentials chitti-cluster --zone=$ZONE
echo "✓ kubectl configured"

# Create Kubernetes secrets
echo "[4/6] Creating Kubernetes secrets..."
JWT_SECRET=$(openssl rand -base64 48)
DB_PASSWORD="YourPassword123"

kubectl delete secret app-secrets 2>/dev/null
kubectl create secret generic app-secrets \
  --from-literal=jwt-secret=$JWT_SECRET \
  --from-literal=db-password=$DB_PASSWORD \
  --from-literal=db-host=$DB_HOST \
  --from-literal=redis-host=$REDIS_HOST

kubectl delete secret gcp-secret 2>/dev/null
kubectl create secret generic gcp-secret --from-file=key.json=$HOME/gcp-key.json

kubectl delete configmap app-config 2>/dev/null
kubectl create configmap app-config \
  --from-literal=GCP_PROJECT_ID=$PROJECT_ID \
  --from-literal=GCS_BUCKET=chitti-ndt-storage-$PROJECT_ID \
  --from-literal=REDIS_HOST=$REDIS_HOST \
  --from-literal=DB_HOST=$DB_HOST

echo "✓ Secrets created"

# Build and push images with Cloud Build
echo "[5/6] Building Docker images with Cloud Build..."
cd ~/Chitti

gcloud builds submit --tag gcr.io/$PROJECT_ID/auth-service:latest ./microservices/auth-service &
gcloud builds submit --tag gcr.io/$PROJECT_ID/file-service:latest ./microservices/file-service &
gcloud builds submit --tag gcr.io/$PROJECT_ID/report-service:latest ./microservices/report-service &
gcloud builds submit --tag gcr.io/$PROJECT_ID/detection-service:latest ./python-backend &

wait
echo "✓ Images built and pushed"

# Deploy to Kubernetes
echo "[6/6] Deploying to Kubernetes..."
kubectl apply -f k8s/gcp-deployment.yaml
echo "✓ Deployed"

echo ""
echo "=========================================="
echo "  DEPLOYMENT COMPLETE"
echo "=========================================="
echo ""
echo "Waiting for pods to start (30s)..."
sleep 30

echo ""
echo "Pods:"
kubectl get pods

echo ""
echo "Services:"
kubectl get svc

echo ""
echo "To get external IP:"
echo "  kubectl get svc api-gateway -w"
echo ""
echo "Credentials:"
echo "  DB_HOST=$DB_HOST"
echo "  REDIS_HOST=$REDIS_HOST"
echo "  JWT_SECRET=$JWT_SECRET"
echo ""

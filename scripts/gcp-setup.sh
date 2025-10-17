#!/bin/bash

# Chitti AI - GCP Setup Script
# Run this script to set up GCP infrastructure

set -e

PROJECT_ID="green-plasma-475110-k7"
REGION="us-central1"
ZONE="us-central1-a"

echo "=== Chitti AI GCP Setup ==="
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Get Cloud SQL IP
echo "1. Getting Cloud SQL IP..."
CLOUDSQL_IP=$(gcloud sql instances describe chitti-postgres --format="get(ipAddresses[0].ipAddress)")
echo "Cloud SQL IP: $CLOUDSQL_IP"

# Get Redis IP
echo "2. Getting Redis IP..."
REDIS_IP=$(gcloud redis instances describe chitti-redis --region=$REGION --format="get(host)")
echo "Redis IP: $REDIS_IP"

# Create service account
echo "3. Creating service account..."
gcloud iam service-accounts create chitti-gke-sa --display-name="Chitti GKE Service Account" || echo "Service account already exists"

# Grant permissions
echo "4. Granting permissions..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:chitti-gke-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:chitti-gke-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/pubsub.editor"

# Create service account key
echo "5. Creating service account key..."
gcloud iam service-accounts keys create ./gcp-key.json \
  --iam-account=chitti-gke-sa@${PROJECT_ID}.iam.gserviceaccount.com

# Get GKE credentials
echo "6. Getting GKE credentials..."
gcloud container clusters get-credentials chitti-cluster --zone=$ZONE

# Create Kubernetes secrets
echo "7. Creating Kubernetes secrets..."
kubectl create secret generic chitti-db-secret \
  --from-literal=host=$CLOUDSQL_IP \
  --from-literal=database=chitti \
  --from-literal=username=chitti \
  --from-literal=password=YOUR_DB_PASSWORD \
  --dry-run=client -o yaml > k8s/secrets.yaml

kubectl create secret generic chitti-redis-secret \
  --from-literal=host=$REDIS_IP \
  --from-literal=port=6379 \
  --dry-run=client -o yaml >> k8s/secrets.yaml

kubectl create secret generic gcp-credentials \
  --from-file=key.json=./gcp-key.json \
  --dry-run=client -o yaml >> k8s/secrets.yaml

echo ""
echo "=== Setup Complete ==="
echo "Cloud SQL IP: $CLOUDSQL_IP"
echo "Redis IP: $REDIS_IP"
echo ""
echo "Next steps:"
echo "1. Update k8s/secrets.yaml with your actual database password"
echo "2. Apply secrets: kubectl apply -f k8s/secrets.yaml"
echo "3. Deploy application: kubectl apply -f k8s/"

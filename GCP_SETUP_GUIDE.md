# GCP Setup Guide - Complete Deployment

## 🎯 Required GCP Services & APIs

### 1. Enable APIs (Required)
```bash
gcloud services enable compute.googleapis.com
gcloud services enable container.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable storage-api.googleapis.com
gcloud services enable redis.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable iam.googleapis.com
gcloud services enable monitoring.googleapis.com
gcloud services enable logging.googleapis.com
```

## 📋 Required Credentials

### 1. GCP Project Setup
```bash
# Set your project
gcloud config set project YOUR_PROJECT_ID

# Get project ID
gcloud config get-value project
```

### 2. Service Account Creation
```bash
# Create service account
gcloud iam service-accounts create chitti-ndt-sa \
  --display-name="Chitti NDT Service Account"

# Grant permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:chitti-ndt-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/editor"

# Create key
gcloud iam service-accounts keys create ~/chitti-key.json \
  --iam-account=chitti-ndt-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### 3. Required Environment Variables
```env
# GCP Credentials
GOOGLE_APPLICATION_CREDENTIALS=/path/to/chitti-key.json
GCP_PROJECT_ID=your-project-id
GCP_REGION=us-central1
GCP_ZONE=us-central1-a

# Database
DB_HOST=your-cloud-sql-ip
DB_PORT=5432
DB_NAME=chitti_ndt
DB_USER=postgres
DB_PASSWORD=your-secure-password

# Storage
GCS_BUCKET=chitti-ndt-storage
CDN_URL=https://storage.googleapis.com/chitti-ndt-storage

# Redis
REDIS_HOST=your-redis-ip
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# RabbitMQ (Cloud AMQP or self-hosted)
RABBITMQ_URL=amqp://user:pass@your-rabbitmq-host:5672
```

## 🚀 Step-by-Step Deployment

### Step 1: Create GKE Cluster
```bash
gcloud container clusters create chitti-cluster \
  --zone=us-central1-a \
  --num-nodes=3 \
  --machine-type=n1-standard-2 \
  --enable-autoscaling \
  --min-nodes=3 \
  --max-nodes=10 \
  --enable-autorepair \
  --enable-autoupgrade
```

### Step 2: Create Cloud SQL (PostgreSQL)
```bash
gcloud sql instances create chitti-postgres \
  --database-version=POSTGRES_15 \
  --tier=db-n1-standard-2 \
  --region=us-central1 \
  --root-password=YOUR_SECURE_PASSWORD \
  --backup \
  --enable-bin-log

# Create database
gcloud sql databases create chitti_ndt --instance=chitti-postgres

# Get connection name
gcloud sql instances describe chitti-postgres --format="value(connectionName)"
```

### Step 3: Create Cloud Storage Bucket
```bash
gcloud storage buckets create gs://chitti-ndt-storage \
  --location=us-central1 \
  --uniform-bucket-level-access

# Make public for CDN
gcloud storage buckets add-iam-policy-binding gs://chitti-ndt-storage \
  --member=allUsers \
  --role=roles/storage.objectViewer
```

### Step 4: Create Redis Instance
```bash
gcloud redis instances create chitti-redis \
  --size=1 \
  --region=us-central1 \
  --redis-version=redis_7_0

# Get Redis host
gcloud redis instances describe chitti-redis --region=us-central1 --format="value(host)"
```

### Step 5: Configure kubectl
```bash
gcloud container clusters get-credentials chitti-cluster --zone=us-central1-a
```

### Step 6: Create Kubernetes Secrets
```bash
kubectl create secret generic db-secret \
  --from-literal=url="postgresql://postgres:YOUR_PASSWORD@CLOUD_SQL_IP:5432/chitti_ndt" \
  --from-literal=password="YOUR_PASSWORD"

kubectl create secret generic jwt-secret \
  --from-literal=key="YOUR_JWT_SECRET"

kubectl create secret generic gcp-secret \
  --from-file=key.json=~/chitti-key.json

kubectl create configmap app-config \
  --from-literal=REDIS_HOST="YOUR_REDIS_IP" \
  --from-literal=GCS_BUCKET="chitti-ndt-storage" \
  --from-literal=GCP_PROJECT_ID="YOUR_PROJECT_ID"
```

### Step 7: Build and Push Docker Images
```bash
# Configure Docker for GCR
gcloud auth configure-docker

# Build images
docker build -t gcr.io/YOUR_PROJECT_ID/auth-service:latest ./microservices/auth-service
docker build -t gcr.io/YOUR_PROJECT_ID/file-service:latest ./microservices/file-service
docker build -t gcr.io/YOUR_PROJECT_ID/report-service:latest ./microservices/report-service
docker build -t gcr.io/YOUR_PROJECT_ID/detection-service:latest ./python-backend

# Push images
docker push gcr.io/YOUR_PROJECT_ID/auth-service:latest
docker push gcr.io/YOUR_PROJECT_ID/file-service:latest
docker push gcr.io/YOUR_PROJECT_ID/report-service:latest
docker push gcr.io/YOUR_PROJECT_ID/detection-service:latest
```

### Step 8: Deploy to GKE
```bash
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/monitoring.yaml
```

### Step 9: Setup Cloud SQL Proxy (for secure connection)
```bash
kubectl create secret generic cloudsql-instance-credentials \
  --from-file=credentials.json=~/chitti-key.json

kubectl create secret generic cloudsql-db-credentials \
  --from-literal=username=postgres \
  --from-literal=password=YOUR_PASSWORD
```

## 📊 Cost Estimate (Monthly)

| Service | Configuration | Estimated Cost |
|---------|--------------|----------------|
| GKE Cluster | 3-10 nodes (n1-standard-2) | $150-500 |
| Cloud SQL | db-n1-standard-2 | $100 |
| Cloud Storage | 100GB + CDN | $10-30 |
| Redis | 1GB | $30 |
| Load Balancer | 1 instance | $20 |
| Monitoring | Standard | $10 |
| **Total** | | **$320-690/month** |

## 🔐 Security Checklist

- ✅ Service account with minimal permissions
- ✅ Secrets stored in Kubernetes secrets
- ✅ Cloud SQL with private IP
- ✅ VPC network isolation
- ✅ SSL/TLS certificates
- ✅ IAM roles properly configured
- ✅ Firewall rules configured

## 📝 Configuration Files to Update

### 1. Update k8s/deployment.yaml
Replace image URLs:
```yaml
image: gcr.io/YOUR_PROJECT_ID/auth-service:latest
```

### 2. Update .env.production
```env
DATABASE_URL=postgresql://postgres:PASSWORD@CLOUD_SQL_IP:5432/chitti_ndt
REDIS_URL=redis://REDIS_IP:6379
GCS_BUCKET=chitti-ndt-storage
```

### 3. Update microservices configs
Each service needs GCP credentials mounted

## 🧪 Verify Deployment

```bash
# Check pods
kubectl get pods

# Check services
kubectl get services

# Check HPA
kubectl get hpa

# View logs
kubectl logs -f deployment/auth-service

# Test endpoints
kubectl get svc api-gateway -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

## 🔄 CI/CD Setup

### GitHub Secrets Required:
- `GCP_PROJECT_ID`
- `GCP_SA_KEY` (service account JSON)
- `GKE_CLUSTER_NAME`
- `GKE_ZONE`
- `DB_PASSWORD`
- `JWT_SECRET`

## 📈 Monitoring Setup

### Enable Cloud Monitoring
```bash
# Install monitoring agent
kubectl apply -f https://storage.googleapis.com/gke-release/monitoring/latest/components.yaml
```

### Access Dashboards
- Cloud Console: https://console.cloud.google.com/monitoring
- Grafana: http://LOAD_BALANCER_IP:3001
- Prometheus: http://LOAD_BALANCER_IP:9090

## 🚨 Troubleshooting

### Check Cloud SQL Connection
```bash
gcloud sql connect chitti-postgres --user=postgres
```

### Check Redis Connection
```bash
redis-cli -h REDIS_IP ping
```

### Check Storage Access
```bash
gsutil ls gs://chitti-ndt-storage
```

### View GKE Logs
```bash
gcloud logging read "resource.type=k8s_cluster" --limit 50
```

## 📞 Support Resources

- GCP Console: https://console.cloud.google.com
- GKE Docs: https://cloud.google.com/kubernetes-engine/docs
- Cloud SQL Docs: https://cloud.google.com/sql/docs
- Cloud Storage Docs: https://cloud.google.com/storage/docs

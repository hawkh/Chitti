# Complete GCP Setup - From Zero to Production

## 🎯 Prerequisites

1. GCP Account with billing enabled
2. gcloud CLI installed
3. kubectl installed
4. Node.js installed
5. Docker installed

## 🚀 Complete Setup (15 Minutes)

### Step 1: Generate Secrets (1 minute)

```bash
GENERATE_SECRETS.bat
```

This generates:
- JWT_SECRET (64 chars hex)
- DB_PASSWORD (base64)
- SESSION_SECRET (64 chars hex)
- API_KEY (base64)

**Copy these values** - you'll need them!

### Step 2: Setup GCP Project (2 minutes)

```bash
# Login to GCP
gcloud auth login

# Create project (or use existing)
gcloud projects create chitti-ndt-prod --name="Chitti NDT Production"

# Set project
gcloud config set project chitti-ndt-prod

# Enable billing
gcloud billing accounts list
gcloud billing projects link chitti-ndt-prod --billing-account=BILLING_ACCOUNT_ID
```

### Step 3: Enable Required APIs (2 minutes)

```bash
gcloud services enable compute.googleapis.com
gcloud services enable container.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable storage-api.googleapis.com
gcloud services enable redis.googleapis.com
gcloud services enable pubsub.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable monitoring.googleapis.com
gcloud services enable logging.googleapis.com
```

### Step 4: Create Service Account (2 minutes)

```bash
# Create service account
gcloud iam service-accounts create chitti-sa \
  --display-name="Chitti NDT Service Account"

# Grant permissions
gcloud projects add-iam-policy-binding chitti-ndt-prod \
  --member="serviceAccount:chitti-sa@chitti-ndt-prod.iam.gserviceaccount.com" \
  --role="roles/editor"

# Create and download key
gcloud iam service-accounts keys create ~/chitti-key.json \
  --iam-account=chitti-sa@chitti-ndt-prod.iam.gserviceaccount.com

# Set environment variable
set GOOGLE_APPLICATION_CREDENTIALS=%USERPROFILE%\chitti-key.json
```

### Step 5: Setup GCP Secrets (1 minute)

```bash
SETUP_GCP_SECRETS.bat
```

This will:
- Store secrets in GCP Secret Manager
- Create Kubernetes secrets
- Generate .env.production file

### Step 6: Deploy Infrastructure (5 minutes)

```bash
DEPLOY_TO_GCP.bat
```

Enter when prompted:
- Project ID: `chitti-ndt-prod`
- Region: `us-central1`
- Zone: `us-central1-a`
- DB Password: (use generated password from Step 1)

This creates:
- ✅ GKE Cluster (3-10 nodes)
- ✅ Cloud SQL PostgreSQL
- ✅ Cloud Storage bucket
- ✅ Memorystore Redis
- ✅ Cloud Pub/Sub topics
- ✅ Load Balancer

### Step 7: Get Your URLs (2 minutes)

```bash
# Wait for load balancer (takes 2-3 minutes)
kubectl get svc api-gateway -w

# Once EXTERNAL-IP appears, test it
curl http://EXTERNAL-IP/health
```

## 📋 Complete Credentials Checklist

### Generated Secrets
- [x] JWT_SECRET
- [x] DB_PASSWORD
- [x] SESSION_SECRET
- [x] API_KEY

### GCP Resources
- [x] Project ID
- [x] Service Account Email
- [x] Service Account Key (JSON file)
- [x] Cloud SQL Instance Name
- [x] Cloud SQL IP Address
- [x] Redis Instance IP
- [x] GCS Bucket Name
- [x] Load Balancer IP

### Kubernetes Secrets
- [x] app-secrets (JWT, DB password)
- [x] gcp-secret (service account key)
- [x] db-secret (database URL)

## 🔐 Security Best Practices

### 1. Rotate Secrets Regularly

```bash
# Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update in Secret Manager
echo "NEW_SECRET" | gcloud secrets versions add jwt-secret --data-file=-

# Update Kubernetes
kubectl create secret generic app-secrets \
  --from-literal=jwt-secret=NEW_SECRET \
  --dry-run=client -o yaml | kubectl apply -f -
```

### 2. Use IAM Roles (Not Keys)

For production, use Workload Identity:

```bash
# Enable Workload Identity
gcloud container clusters update chitti-cluster \
  --workload-pool=chitti-ndt-prod.svc.id.goog

# Bind service account
kubectl annotate serviceaccount default \
  iam.gke.io/gcp-service-account=chitti-sa@chitti-ndt-prod.iam.gserviceaccount.com
```

### 3. Enable Secret Encryption

```bash
# Create KMS key
gcloud kms keyrings create chitti-keyring --location=us-central1
gcloud kms keys create chitti-key --location=us-central1 \
  --keyring=chitti-keyring --purpose=encryption

# Enable application-layer secrets encryption
gcloud container clusters update chitti-cluster \
  --database-encryption-key=projects/chitti-ndt-prod/locations/us-central1/keyRings/chitti-keyring/cryptoKeys/chitti-key
```

## 📊 Verify Deployment

### Check All Services

```bash
# Pods
kubectl get pods
# Should show: auth-service, file-service, report-service, detection-service

# Services
kubectl get services
# Should show: api-gateway with EXTERNAL-IP

# HPA
kubectl get hpa
# Should show: auto-scaling configured

# Secrets
kubectl get secrets
# Should show: app-secrets, gcp-secret, db-secret
```

### Test Endpoints

```bash
# Health check
curl http://EXTERNAL-IP/health

# Auth service
curl -X POST http://EXTERNAL-IP/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'

# File service
curl http://EXTERNAL-IP/api/files/health

# Detection service
curl http://EXTERNAL-IP/api/detect/health
```

### Check GCP Resources

```bash
# Cloud SQL
gcloud sql instances list

# Redis
gcloud redis instances list

# Storage
gsutil ls

# Pub/Sub
gcloud pubsub topics list

# Secrets
gcloud secrets list
```

## 💰 Cost Monitoring

### Set Budget Alert

```bash
# Create budget
gcloud billing budgets create \
  --billing-account=BILLING_ACCOUNT_ID \
  --display-name="Chitti NDT Budget" \
  --budget-amount=500 \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90
```

### View Current Costs

```bash
# Via CLI
gcloud billing accounts list

# Via Console
# https://console.cloud.google.com/billing
```

## 🔄 Update Deployment

### Update Service

```bash
# Build new image
docker build -t gcr.io/chitti-ndt-prod/auth-service:v2 ./microservices/auth-service

# Push
docker push gcr.io/chitti-ndt-prod/auth-service:v2

# Update deployment
kubectl set image deployment/auth-service auth-service=gcr.io/chitti-ndt-prod/auth-service:v2

# Check rollout
kubectl rollout status deployment/auth-service
```

### Rollback if Needed

```bash
kubectl rollout undo deployment/auth-service
```

## 🚨 Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl describe pod POD_NAME

# Check logs
kubectl logs POD_NAME

# Check events
kubectl get events --sort-by=.metadata.creationTimestamp
```

### Database Connection Issues

```bash
# Test connection
gcloud sql connect chitti-postgres --user=postgres

# Check Cloud SQL Proxy
kubectl logs -l app=cloudsql-proxy
```

### Secret Access Issues

```bash
# Verify secret exists
gcloud secrets describe jwt-secret

# Check IAM permissions
gcloud secrets get-iam-policy jwt-secret
```

## 📚 Next Steps

1. ✅ Setup custom domain
2. ✅ Configure SSL certificate
3. ✅ Setup Cloud CDN
4. ✅ Configure Cloud Armor (DDoS protection)
5. ✅ Setup monitoring alerts
6. ✅ Configure backup schedules
7. ✅ Setup CI/CD pipeline
8. ✅ Configure auto-scaling policies

## 🎓 Summary

You now have:
- ✅ Secure secrets generated and stored
- ✅ GCP project configured
- ✅ All services deployed to GKE
- ✅ Database, cache, storage ready
- ✅ Load balancer with external IP
- ✅ Auto-scaling configured
- ✅ Monitoring and logging enabled
- ✅ Production-ready architecture

**Your enterprise microservices platform is live on GCP!**

Access your application at: `http://EXTERNAL-IP`

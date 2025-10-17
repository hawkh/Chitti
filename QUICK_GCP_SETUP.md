# Quick GCP Setup - 5 Minutes

## Prerequisites
- GCP Account with billing enabled
- gcloud CLI installed
- kubectl installed
- Docker installed

## Step 1: Get Your Credentials (2 minutes)

### A. Create GCP Project
1. Go to https://console.cloud.google.com
2. Create new project: "chitti-ndt"
3. Note your PROJECT_ID

### B. Enable Billing
1. Go to Billing
2. Link billing account to project

### C. Create Service Account
```bash
# Login
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Create service account
gcloud iam service-accounts create chitti-sa

# Grant permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:chitti-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/editor"

# Download key
gcloud iam service-accounts keys create ~/chitti-key.json \
  --iam-account=chitti-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

## Step 2: Run Automated Deployment (3 minutes)

```bash
DEPLOY_TO_GCP.bat
```

Enter when prompted:
- Project ID: `your-project-id`
- Region: `us-central1` (or press Enter)
- Zone: `us-central1-a` (or press Enter)
- DB Password: `YourSecurePassword123!`

## Step 3: Get Your URLs

```bash
# Get Load Balancer IP
kubectl get svc api-gateway

# Wait for EXTERNAL-IP to appear (may take 2-3 minutes)
```

Your services will be at:
- API Gateway: `http://EXTERNAL-IP`
- Auth API: `http://EXTERNAL-IP/api/auth/`
- File API: `http://EXTERNAL-IP/api/files/`
- Detection API: `http://EXTERNAL-IP/api/detect/`

## Required Credentials Summary

### 1. GCP Project ID
```
YOUR_PROJECT_ID
```

### 2. Service Account Key
```
~/chitti-key.json
```

### 3. Database Password
```
YourSecurePassword123!
```

### 4. JWT Secret (generate)
```bash
openssl rand -base64 32
```

## Fill in .env File

Copy `GCP_CREDENTIALS_TEMPLATE.env` to `.env.production`:

```env
GCP_PROJECT_ID=your-actual-project-id
DB_PASSWORD=YourSecurePassword123!
JWT_SECRET=generated-secret-from-openssl
```

## Verify Deployment

```bash
# Check all pods running
kubectl get pods

# Check services
kubectl get services

# Test API
curl http://EXTERNAL-IP/health
```

## Cost Breakdown

**Estimated Monthly Cost: $320-690**

- GKE: $150-500 (3-10 nodes)
- Cloud SQL: $100
- Redis: $30
- Storage: $10-30
- Load Balancer: $20
- Monitoring: $10

## Free Tier Available

GCP offers $300 free credits for 90 days for new accounts.

## Troubleshooting

### If deployment fails:
```bash
# Check logs
kubectl logs -f deployment/auth-service

# Describe pod
kubectl describe pod POD_NAME

# Check events
kubectl get events
```

### If services don't start:
```bash
# Check quotas
gcloud compute project-info describe --project=YOUR_PROJECT_ID

# Check APIs enabled
gcloud services list --enabled
```

## Next Steps

1. Update DNS to point to EXTERNAL-IP
2. Setup SSL certificate
3. Configure monitoring alerts
4. Setup backup schedules
5. Configure auto-scaling policies

## Support

- GCP Console: https://console.cloud.google.com
- Documentation: See GCP_SETUP_GUIDE.md
- Issues: Check kubectl logs

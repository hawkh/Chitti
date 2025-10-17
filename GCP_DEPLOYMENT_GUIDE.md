# Chitti AI - GCP Deployment Guide

## Prerequisites
- Google Cloud SDK installed
- kubectl installed
- Docker installed
- GCP project: `green-plasma-475110-k7`

## Step 1: Run Setup Script

### Windows
```bash
cd scripts
gcp-setup.bat
```

### Linux/Mac
```bash
cd scripts
chmod +x gcp-setup.sh
./gcp-setup.sh
```

## Step 2: Manual Commands (if script fails)

### Get Cloud SQL IP
```bash
gcloud sql instances describe chitti-postgres --format="get(ipAddresses[0].ipAddress)"
```

### Get Redis IP
```bash
gcloud redis instances describe chitti-redis --region=us-central1 --format="get(host)"
```

### Create Service Account
```bash
gcloud iam service-accounts create chitti-gke-sa --display-name="Chitti GKE Service Account"
```

### Grant Permissions
```bash
gcloud projects add-iam-policy-binding green-plasma-475110-k7 \
  --member="serviceAccount:chitti-gke-sa@green-plasma-475110-k7.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

gcloud projects add-iam-policy-binding green-plasma-475110-k7 \
  --member="serviceAccount:chitti-gke-sa@green-plasma-475110-k7.iam.gserviceaccount.com" \
  --role="roles/pubsub.editor"
```

### Create Service Account Key
```bash
gcloud iam service-accounts keys create gcp-key.json \
  --iam-account=chitti-gke-sa@green-plasma-475110-k7.iam.gserviceaccount.com
```

### Get GKE Credentials
```bash
gcloud container clusters get-credentials chitti-cluster --zone=us-central1-a
```

## Step 3: Create Kubernetes Secrets

Replace `YOUR_DB_PASSWORD` with actual password:

```bash
kubectl create secret generic chitti-db-secret \
  --from-literal=host=CLOUDSQL_IP \
  --from-literal=database=chitti \
  --from-literal=username=chitti \
  --from-literal=password=YOUR_DB_PASSWORD

kubectl create secret generic chitti-redis-secret \
  --from-literal=host=REDIS_IP \
  --from-literal=port=6379

kubectl create secret generic gcp-credentials \
  --from-file=key.json=./gcp-key.json
```

## Step 4: Deploy Application

```bash
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/gcp-deployment.yaml
```

## Step 5: Verify Deployment

```bash
kubectl get pods
kubectl get services
kubectl logs -f deployment/chitti-nextjs
```

## Step 6: Access Application

Get external IP:
```bash
kubectl get service chitti-nextjs -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

## Troubleshooting

### Check pod status
```bash
kubectl describe pod <pod-name>
```

### View logs
```bash
kubectl logs <pod-name>
```

### Check secrets
```bash
kubectl get secrets
kubectl describe secret chitti-db-secret
```

### Restart deployment
```bash
kubectl rollout restart deployment/chitti-nextjs
```

## Environment Variables

Update `.env.production`:
```env
DATABASE_URL=postgresql://chitti:PASSWORD@CLOUDSQL_IP:5432/chitti
REDIS_HOST=REDIS_IP
REDIS_PORT=6379
PYTHON_BACKEND_URL=http://chitti-python:5000
```

## Monitoring

View logs:
```bash
kubectl logs -f deployment/chitti-nextjs
kubectl logs -f deployment/chitti-python
```

Check resource usage:
```bash
kubectl top pods
kubectl top nodes
```

## Scaling

Scale deployment:
```bash
kubectl scale deployment chitti-nextjs --replicas=3
kubectl scale deployment chitti-python --replicas=2
```

## Cleanup

Delete resources:
```bash
kubectl delete -f k8s/
gcloud container clusters delete chitti-cluster --zone=us-central1-a
```

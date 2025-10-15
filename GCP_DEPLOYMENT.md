# 🚀 GCP Deployment Guide - Chitti AI NDT

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Cloud Load Balancer                   │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
┌───────▼────────┐         ┌────────▼────────┐
│  Cloud Run     │         │  Cloud Storage  │
│  (Next.js App) │         │  (File Uploads) │
└───────┬────────┘         └─────────────────┘
        │
        ├──────────┬──────────┬──────────┐
        │          │          │          │
┌───────▼─────┐ ┌─▼──────┐ ┌─▼──────┐ ┌─▼──────┐
│ Cloud SQL   │ │ Redis  │ │ Pub/Sub│ │ Secret │
│ (PostgreSQL)│ │ (Cache)│ │ (Queue)│ │Manager │
└─────────────┘ └────────┘ └────────┘ └────────┘
```

## Step 1: Setup GCP Project

```bash
# Install gcloud CLI
# https://cloud.google.com/sdk/docs/install

# Login
gcloud auth login

# Create project
gcloud projects create chitti-ai-ndt --name="Chitti AI NDT"

# Set project
gcloud config set project chitti-ai-ndt

# Enable APIs
gcloud services enable \
  run.googleapis.com \
  sql-component.googleapis.com \
  sqladmin.googleapis.com \
  redis.googleapis.com \
  storage.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com
```

## Step 2: Create Cloud SQL (PostgreSQL)

```bash
# Create PostgreSQL instance





# Create database
gcloud sql databases create chitti_ndt --instance=chitti-db

# Get connection name
gcloud sql instances describe chitti-db --format="value(connectionName)"
# Save this: PROJECT_ID:REGION:chitti-db
```

## Step 3: Create Redis Instance

```bash
# Create Redis instance
gcloud redis instances create chitti-redis \
  --size=1 \
  --region=us-central1 \
  --redis-version=redis_7_0

# Get Redis host
gcloud redis instances describe chitti-redis \
  --region=us-central1 \
  --format="value(host)"
```

## Step 4: Create Cloud Storage Bucket

```bash
# Create bucket for file uploads
gsutil mb -l us-central1 gs://chitti-uploads

# Set CORS
cat > cors.json << EOF
[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set cors.json gs://chitti-uploads
```

## Step 5: Setup Secrets

```bash
# Create secrets
echo -n "postgresql://postgres:PASSWORD@/chitti_ndt?host=/cloudsql/PROJECT_ID:REGION:chitti-db" | \
  gcloud secrets create DATABASE_URL --data-file=-

echo -n "redis://REDIS_HOST:6379" | \
  gcloud secrets create REDIS_URL --data-file=-

# Grant access to Cloud Run
gcloud secrets add-iam-policy-binding DATABASE_URL \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding REDIS_URL \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## Step 6: Update Application Code

### Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
    ],
  },
};

module.exports = nextConfig;
```

### Update `app/api/upload/route.ts`:

Replace local file storage with Cloud Storage:

```typescript
import { Storage } from '@google-cloud/storage';

const storage = new Storage();
const bucket = storage.bucket('chitti-uploads');

// In upload handler:
const blob = bucket.file(uniqueFilename);
await blob.save(buffer);
const publicUrl = `https://storage.googleapis.com/chitti-uploads/${uniqueFilename}`;
```

## Step 7: Create Dockerfile

```dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs
EXPOSE 8080
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

## Step 8: Create `.dockerignore`

```
node_modules
.next
.git
.env*
uploads
README.md
*.md
.vscode
.idea
```

## Step 9: Deploy to Cloud Run

```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/chitti-ai-ndt/app

# Deploy to Cloud Run
gcloud run deploy chitti-app \
  --image gcr.io/chitti-ai-ndt/app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10 \
  --add-cloudsql-instances PROJECT_ID:REGION:chitti-db \
  --set-secrets DATABASE_URL=DATABASE_URL:latest,REDIS_URL=REDIS_URL:latest \
  --set-env-vars NEXT_PUBLIC_MODEL_BASE_URL=/models,NEXT_PUBLIC_API_BASE_URL=/api

# Get URL
gcloud run services describe chitti-app \
  --region us-central1 \
  --format="value(status.url)"
```

## Step 10: Run Database Migrations

```bash
# Connect to Cloud SQL
gcloud sql connect chitti-db --user=postgres

# Or use Cloud SQL Proxy
cloud_sql_proxy -instances=PROJECT_ID:REGION:chitti-db=tcp:5432

# In another terminal
export DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/chitti_ndt"
npx prisma db push
npx prisma db seed
```

## Step 11: Setup Custom Domain (Optional)

```bash
# Map domain
gcloud run domain-mappings create \
  --service chitti-app \
  --domain app.chitti.ai \
  --region us-central1

# Follow DNS instructions to add records
```

## Step 12: Setup Monitoring

```bash
# Enable Cloud Monitoring
gcloud services enable monitoring.googleapis.com

# Create uptime check
gcloud monitoring uptime create chitti-uptime \
  --display-name="Chitti App Health" \
  --resource-type=uptime-url \
  --monitored-resource=https://YOUR_CLOUD_RUN_URL/api/system/status
```

## Cost Estimate (Monthly)

| Service | Configuration | Cost |
|---------|--------------|------|
| Cloud Run | 2 vCPU, 2GB RAM, 1M requests | ~$50 |
| Cloud SQL | db-f1-micro (0.6GB RAM) | ~$10 |
| Redis | 1GB | ~$30 |
| Cloud Storage | 100GB + 1M operations | ~$5 |
| **Total** | | **~$95/month** |

## Environment Variables Summary

```env
# Production .env
DATABASE_URL=postgresql://postgres:PASSWORD@/chitti_ndt?host=/cloudsql/PROJECT_ID:REGION:chitti-db
REDIS_URL=redis://REDIS_HOST:6379
NEXT_PUBLIC_MODEL_BASE_URL=/models
NEXT_PUBLIC_API_BASE_URL=/api
UPLOAD_DIR=gs://chitti-uploads
```

## Deployment Commands

```bash
# Quick deploy script
#!/bin/bash
set -e

echo "Building application..."
gcloud builds submit --tag gcr.io/chitti-ai-ndt/app

echo "Deploying to Cloud Run..."
gcloud run deploy chitti-app \
  --image gcr.io/chitti-ai-ndt/app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

echo "Deployment complete!"
gcloud run services describe chitti-app --region us-central1 --format="value(status.url)"
```

## Troubleshooting

### Check logs:
```bash
gcloud run logs read chitti-app --region us-central1 --limit 50
```

### Test database connection:
```bash
gcloud sql connect chitti-db --user=postgres
```

### Check Redis:
```bash
gcloud redis instances describe chitti-redis --region us-central1
```

## Security Checklist

- ✅ Use Secret Manager for credentials
- ✅ Enable Cloud Armor for DDoS protection
- ✅ Setup VPC for private networking
- ✅ Enable Cloud SQL SSL
- ✅ Use IAM roles for service accounts
- ✅ Enable audit logging
- ✅ Setup backup policies

## Next Steps

1. Setup CI/CD with Cloud Build
2. Add Cloud CDN for static assets
3. Enable Cloud Armor WAF
4. Setup alerting policies
5. Configure auto-scaling rules
6. Add health checks
7. Setup staging environment

---

**Need help?** Check GCP documentation or contact support.

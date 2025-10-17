# Migrate to 100% GCP Native Services

## Current Status: 80% Compatible → Target: 100% Native

### What Needs to Change

1. **File Service**: AWS S3 → Google Cloud Storage
2. **Message Queue**: RabbitMQ → Cloud Pub/Sub
3. **Monitoring**: Prometheus → Cloud Monitoring (optional)

## Step-by-Step Migration

### Step 1: Update File Service (30 minutes)

#### A. Update package.json
```bash
cd microservices/file-service

# Remove AWS SDK
npm uninstall @aws-sdk/client-s3

# Install GCP SDKs
npm install @google-cloud/storage @google-cloud/pubsub
```

#### B. Replace index.ts
```bash
# Backup current
cp src/index.ts src/index-aws.ts

# Use GCP version
cp src/index-gcp.ts src/index.ts
```

#### C. Update environment variables
```env
# Remove
AWS_ACCESS_KEY=xxx
AWS_SECRET_KEY=xxx
S3_BUCKET=xxx

# Add
GCP_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
GCS_BUCKET=chitti-ndt-storage
```

### Step 2: Setup Cloud Pub/Sub (1 hour)

#### A. Create Topics
```bash
# Create topic for file processing
gcloud pubsub topics create file-processing

# Create subscription
gcloud pubsub subscriptions create file-processing-sub \
  --topic=file-processing

# Create topic for report generation
gcloud pubsub topics create report-generation

# Create subscription
gcloud pubsub subscriptions create report-generation-sub \
  --topic=report-generation
```

#### B. Update Services to Use Pub/Sub

**File Service** (already done in index-gcp.ts):
```typescript
import { PubSub } from '@google-cloud/pubsub';

const pubsub = new PubSub({ projectId: process.env.GCP_PROJECT_ID });
const topic = pubsub.topic('file-processing');

// Publish message
await topic.publishMessage({
  json: { filename, userId }
});
```

**Detection Service** (Python):
```python
from google.cloud import pubsub_v1

subscriber = pubsub_v1.SubscriberClient()
subscription_path = subscriber.subscription_path(PROJECT_ID, 'file-processing-sub')

def callback(message):
    data = json.loads(message.data)
    process_detection(data['filename'], data['userId'])
    message.ack()

subscriber.subscribe(subscription_path, callback=callback)
```

### Step 3: Setup Cloud Monitoring (1 hour)

#### A. Enable APIs
```bash
gcloud services enable monitoring.googleapis.com
gcloud services enable logging.googleapis.com
```

#### B. Install Monitoring Agent
```bash
kubectl apply -f https://storage.googleapis.com/gke-release/monitoring/latest/components.yaml
```

#### C. Create Custom Dashboards
```bash
# Use Cloud Console
# Navigate to: Monitoring > Dashboards > Create Dashboard
```

### Step 4: Update Docker Compose (for local dev)

Create `docker-compose.gcp.yml`:
```yaml
version: '3.8'

services:
  file-service:
    build: ./microservices/file-service
    environment:
      - GCP_PROJECT_ID=${GCP_PROJECT_ID}
      - GOOGLE_APPLICATION_CREDENTIALS=/app/gcp-key.json
      - GCS_BUCKET=${GCS_BUCKET}
    volumes:
      - ./gcp-key.json:/app/gcp-key.json:ro
```

### Step 5: Update Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: file-service
spec:
  template:
    spec:
      containers:
      - name: file-service
        image: gcr.io/PROJECT_ID/file-service:latest
        env:
        - name: GCP_PROJECT_ID
          value: "your-project-id"
        - name: GCS_BUCKET
          value: "chitti-ndt-storage"
        - name: GOOGLE_APPLICATION_CREDENTIALS
          value: /var/secrets/google/key.json
        volumeMounts:
        - name: gcp-key
          mountPath: /var/secrets/google
          readOnly: true
      volumes:
      - name: gcp-key
        secret:
          secretName: gcp-secret
```

## Testing Migration

### Test 1: File Upload to GCS
```bash
curl -X POST http://localhost:3002/upload \
  -F "file=@test.jpg" \
  -F "userId=1"
```

### Test 2: Pub/Sub Message
```bash
gcloud pubsub topics publish file-processing \
  --message='{"filename":"test.jpg","userId":"1"}'
```

### Test 3: Cloud Monitoring
```bash
# Check metrics
gcloud monitoring time-series list \
  --filter='metric.type="kubernetes.io/container/cpu/core_usage_time"'
```

## Rollback Plan

If issues occur:

```bash
# Revert file service
cd microservices/file-service
cp src/index-aws.ts src/index.ts
npm install @aws-sdk/client-s3

# Redeploy
docker-compose -f docker-compose.microservices.yml up -d --build file-service
```

## Cost Impact

### Before (AWS S3 + RabbitMQ)
- S3: $23/TB
- RabbitMQ compute: $50/month
- Total: $73/TB + $50/month

### After (GCS + Pub/Sub)
- GCS: $20/TB
- Pub/Sub: $40/million messages
- Total: $20/TB + $40/million msgs

**Savings**: ~$13/TB + better scaling

## Validation Checklist

- [ ] File upload works to GCS
- [ ] File download works from GCS
- [ ] Pub/Sub messages are published
- [ ] Pub/Sub messages are consumed
- [ ] Cloud Monitoring shows metrics
- [ ] Cloud Logging shows logs
- [ ] All services healthy
- [ ] Integration tests pass

## Timeline

| Task | Duration | Downtime |
|------|----------|----------|
| Update file service | 30 min | 0 |
| Setup Pub/Sub | 1 hour | 0 |
| Setup monitoring | 1 hour | 0 |
| Testing | 30 min | 0 |
| **Total** | **3 hours** | **0** |

## Support

If you encounter issues:

1. Check Cloud Console logs
2. Verify IAM permissions
3. Check service account has required roles
4. Verify APIs are enabled

## Next Steps After Migration

1. ✅ Enable Cloud CDN for GCS
2. ✅ Setup Cloud Armor for DDoS protection
3. ✅ Configure Cloud NAT for egress
4. ✅ Setup Cloud KMS for encryption
5. ✅ Enable VPC Service Controls

**You'll have a 100% GCP-native, production-ready architecture!**

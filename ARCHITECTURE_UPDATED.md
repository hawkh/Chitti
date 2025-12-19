# Updated Architecture - AWS ECS Backend Integration

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Vercel     │  │   Amplify    │  │    Local     │        │
│  │ (Production) │  │ (Production) │  │    (Dev)     │        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘        │
│         │                  │                  │                 │
│         └──────────────────┴──────────────────┘                 │
│                            │                                     │
│                    Next.js App                                  │
│                    /demo page                                   │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  /api/detect (Main Detection Route)                    │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  1. Try AWS ECS Backend (Primary)                │  │   │
│  │  │     http://23.22.163.148:10000/detect           │  │   │
│  │  │     ↓ (if fails)                                 │  │   │
│  │  │  2. Fallback to Mock Detections                  │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  /api/detect-real (Real Detection Route)              │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  1. Try AWS ECS Backend (Primary)                │  │   │
│  │  │     http://23.22.163.148:10000/detect           │  │   │
│  │  │     ↓ (if fails)                                 │  │   │
│  │  │  2. Try AWS Lambda (Fallback)                    │  │   │
│  │  │     https://...lambda-url.us-east-1.on.aws/     │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER (AWS)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  AWS ECS/Fargate (PRIMARY) ✅                          │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │  Cluster: chitti-ai-cluster                      │  │   │
│  │  │  Service: chitti-ai-backend-service              │  │   │
│  │  │  Task: chitti-ai-backend-task                    │  │   │
│  │  │  ┌────────────────────────────────────────────┐  │  │   │
│  │  │  │  Container: chitti-backend                 │  │  │   │
│  │  │  │  - Image: ECR (3.2 GB)                     │  │  │   │
│  │  │  │  - CPU: 1 vCPU                             │  │  │   │
│  │  │  │  - Memory: 2 GB                            │  │  │   │
│  │  │  │  - Port: 10000                             │  │  │   │
│  │  │  │  - Public IP: 23.22.163.148                │  │  │   │
│  │  │  │  ┌──────────────────────────────────────┐  │  │  │   │
│  │  │  │  │  FastAPI Application                 │  │  │  │   │
│  │  │  │  │  - /health endpoint                  │  │  │  │   │
│  │  │  │  │  - /detect endpoint                  │  │  │  │   │
│  │  │  │  │  - YOLO Model (weldmodel.pt)         │  │  │  │   │
│  │  │  │  │  - Ultralytics 8.3.0                 │  │  │  │   │
│  │  │  │  └──────────────────────────────────────┘  │  │  │   │
│  │  │  └────────────────────────────────────────────┘  │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  AWS Lambda (FALLBACK)                                 │   │
│  │  - Function URL: https://...lambda-url...              │   │
│  │  - Memory: 3008 MB                                     │   │
│  │  - Timeout: 300s                                       │   │
│  │  - YOLO Model                                          │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      STORAGE LAYER (AWS)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Amazon ECR (Container Registry)                       │   │
│  │  - Repository: chitti-ai-backend                       │   │
│  │  - Image: latest (3.2 GB)                              │   │
│  │  - Built by: AWS CodeBuild                             │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Amazon S3 (Model Storage)                             │   │
│  │  - Bucket: chitti-model-files-839690183659             │   │
│  │  - Model: weldmodel.pt (115 MB)                        │   │
│  │  - Access: Public (for container download)             │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Amazon S3 (Build Source)                              │   │
│  │  - Bucket: chitti-build-source-839690183659            │   │
│  │  - Content: source.zip (for CodeBuild)                 │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BUILD LAYER (AWS)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  AWS CodeBuild                                         │   │
│  │  - Project: chitti-backend-build                       │   │
│  │  - Compute: BUILD_GENERAL1_MEDIUM                      │   │
│  │  - Source: S3 (source.zip)                             │   │
│  │  - Output: ECR (container image)                       │   │
│  │  - Build Time: ~8-10 minutes                           │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MONITORING LAYER (AWS)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Amazon CloudWatch                                     │   │
│  │  - Log Group: /ecs/chitti-ai-backend-task              │   │
│  │  - Metrics: CPU, Memory, Network                       │   │
│  │  - Alarms: (optional)                                  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow

### Successful Detection Request

```
User uploads image on /demo page
    ↓
Next.js Frontend (Vercel/Amplify)
    ↓
POST /api/detect
    ↓
Try AWS ECS: http://23.22.163.148:10000/detect
    ↓
ECS Container receives request
    ↓
FastAPI loads image
    ↓
YOLO model processes image (weldmodel.pt from S3)
    ↓
Returns detections JSON
    ↓
Frontend draws bounding boxes
    ↓
User sees results
```

### Failover Scenario

```
User uploads image on /demo page
    ↓
Next.js Frontend (Vercel/Amplify)
    ↓
POST /api/detect-real
    ↓
Try AWS ECS: http://23.22.163.148:10000/detect
    ↓ (timeout/error)
Try AWS Lambda: https://...lambda-url.../
    ↓
Lambda processes with YOLO
    ↓
Returns detections JSON
    ↓
Frontend draws bounding boxes
    ↓
User sees results
```

## Environment Variables Flow

```
Development (.env.local)
    NEXT_PUBLIC_WELD_API_URL=http://23.22.163.148:10000
    ↓
    npm run dev
    ↓
    Local server uses ECS backend

Production (.env.production)
    NEXT_PUBLIC_WELD_API_URL=http://23.22.163.148:10000
    ↓
    Vercel/Amplify build
    ↓
    Production uses ECS backend
```

## Deployment Flow

```
Code Changes
    ↓
git commit & push
    ↓
    ├─→ Vercel
    │   ├─ Build Next.js app
    │   ├─ Inject env vars
    │   └─ Deploy to CDN
    │
    └─→ Amplify
        ├─ Build Next.js app
        ├─ Inject env vars
        └─ Deploy to CloudFront
```

## Cost Breakdown

```
┌─────────────────────────────────────────────────────┐
│  Monthly AWS Costs                                  │
├─────────────────────────────────────────────────────┤
│  ECS Fargate (1 task, 1 vCPU, 2GB)    $20-30       │
│  ECR Storage (3.2 GB)                  $1          │
│  S3 Model Storage (115 MB)             $0.03       │
│  S3 Build Source                       $0.01       │
│  CloudWatch Logs                       $0.50       │
│  Data Transfer (variable)              ~$1-2       │
├─────────────────────────────────────────────────────┤
│  TOTAL                                 ~$22-34/mo   │
└─────────────────────────────────────────────────────┘
```

## Performance Metrics

```
┌─────────────────────────────────────────────────────┐
│  Backend Performance                                │
├─────────────────────────────────────────────────────┤
│  Cold Start                            0s (always on)│
│  Model Load Time                       ~5s (startup) │
│  Detection Time                        ~1-3s        │
│  API Response Time                     ~1-3s        │
│  Concurrent Requests                   Limited by 1 │
│                                        task (scale  │
│                                        for more)    │
└─────────────────────────────────────────────────────┘
```

## Security

```
┌─────────────────────────────────────────────────────┐
│  Security Configuration                             │
├─────────────────────────────────────────────────────┤
│  Protocol                              HTTP         │
│  Encryption                            None (yet)   │
│  CORS                                  Enabled (*)  │
│  Authentication                        None         │
│  Network                               Public IP    │
│  Security Group                        Port 10000   │
│                                        open to all  │
└─────────────────────────────────────────────────────┘

Future: Add HTTPS with ALB + ACM certificate
```

## Scalability

```
Current: 1 ECS Task
    ↓
Scale Horizontally:
    aws ecs update-service \
      --cluster chitti-ai-cluster \
      --service chitti-ai-backend-service \
      --desired-count 3
    ↓
3 ECS Tasks + Application Load Balancer
    ↓
Auto-scaling based on CPU/Memory
```

## High Availability

```
Single AZ (Current)
    ↓
Multi-AZ (Recommended for Production)
    ↓
    ┌─────────────────────────────────┐
    │  Application Load Balancer      │
    └─────────────┬───────────────────┘
                  │
        ┌─────────┼─────────┐
        ↓         ↓         ↓
    ┌───────┐ ┌───────┐ ┌───────┐
    │ Task  │ │ Task  │ │ Task  │
    │ AZ-1  │ │ AZ-2  │ │ AZ-3  │
    └───────┘ └───────┘ └───────┘
```

## Monitoring

```
CloudWatch Logs
    ↓
/ecs/chitti-ai-backend-task
    ↓
    ├─ Application logs
    ├─ Model loading status
    ├─ Detection requests
    └─ Error messages

View with:
    aws logs tail /ecs/chitti-ai-backend-task --follow
```

---

**Status**: ✅ Architecture updated and deployed
**Backend**: AWS ECS Fargate
**Frontend**: Vercel + Amplify (pending deployment)
**Next**: Deploy frontend with `DEPLOY_UPDATED_FRONTEND.bat`

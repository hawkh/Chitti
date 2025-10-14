# Scalable System Architecture for Chitti AI NDT

## 1. Microservices Architecture

### Core Services
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │    │  Load Balancer  │    │   CDN/Cache     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
    ┌────────────────────────────┼────────────────────────────┐
    │                            │                            │
┌───▼────┐  ┌──────────┐  ┌─────▼─────┐  ┌──────────┐  ┌────────┐
│ Auth   │  │ File     │  │ Detection │  │ Report   │  │ Audit  │
│Service │  │ Service  │  │ Service   │  │ Service  │  │Service │
└────────┘  └──────────┘  └───────────┘  └──────────┘  └────────┘
     │           │              │              │            │
     └───────────┼──────────────┼──────────────┼────────────┘
                 │              │              │
         ┌───────▼──────────────▼──────────────▼───────┐
         │           Message Queue (Redis/RabbitMQ)    │
         └─────────────────────────────────────────────┘
                              │
         ┌────────────────────▼────────────────────┐
         │     Database Cluster (PostgreSQL)      │
         │  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
         │  │Primary  │ │Replica 1│ │Replica 2│   │
         │  └─────────┘ └─────────┘ └─────────┘   │
         └─────────────────────────────────────────┘
```

### Service Breakdown

#### Detection Service
- **Purpose**: AI model inference and defect detection
- **Scaling**: Horizontal scaling with GPU instances
- **Technology**: Python/FastAPI with TensorFlow Serving
- **Queue**: Async processing with Celery/Redis

#### File Service
- **Purpose**: File upload, storage, and preprocessing
- **Scaling**: Auto-scaling based on upload volume
- **Storage**: S3-compatible object storage
- **CDN**: CloudFront for global distribution

#### Report Service
- **Purpose**: Report generation and export
- **Scaling**: Serverless functions for report generation
- **Cache**: Redis for frequently accessed reports
- **Export**: Async job processing

## 2. Database Architecture

### Primary Database (PostgreSQL)
```sql
-- Optimized schema with partitioning
CREATE TABLE detection_results (
    id UUID PRIMARY KEY,
    file_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) NOT NULL,
    metadata JSONB,
    -- Partition by date for better performance
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE detection_results_2024_01 PARTITION OF detection_results
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

### Caching Strategy
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Redis Cache   │    │  Application    │    │   Database      │
│                 │    │                 │    │                 │
│ • Session Data  │◄──►│ • API Responses │◄──►│ • Persistent    │
│ • Model Cache   │    │ • File Metadata │    │   Data          │
│ • Job Queue     │    │ • User Prefs    │    │ • Audit Logs    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 3. AI/ML Pipeline Architecture

### Model Serving
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Model Store    │    │ Model Registry  │    │ Model Serving   │
│                 │    │                 │    │                 │
│ • YOLO Models   │◄──►│ • Version Mgmt  │◄──►│ • TF Serving    │
│ • Checkpoints   │    │ • A/B Testing   │    │ • GPU Scaling   │
│ • Metadata      │    │ • Rollback      │    │ • Load Balancer │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Processing Pipeline
```
File Upload → Preprocessing → Model Inference → Post-processing → Results
     │             │              │               │            │
     ▼             ▼              ▼               ▼            ▼
  Validation   Resize/Norm    GPU Cluster    Confidence     Database
  Queue        Queue          Queue          Filtering      Storage
```

## 4. Scalability Patterns

### Horizontal Scaling
- **API Gateway**: Multiple instances behind load balancer
- **Detection Service**: Auto-scaling GPU instances
- **Database**: Read replicas for query distribution
- **File Storage**: Distributed object storage

### Vertical Scaling
- **GPU Instances**: Scale up for model inference
- **Database**: Increase CPU/Memory for complex queries
- **Cache**: Increase memory for larger datasets

### Auto-scaling Triggers
```yaml
# Kubernetes HPA configuration
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: detection-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: detection-service
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## 5. Performance Optimization

### Caching Strategy
```typescript
// Multi-level caching
interface CacheStrategy {
  L1: 'Browser Cache (5min)',
  L2: 'CDN Cache (1hour)',
  L3: 'Redis Cache (24hours)',
  L4: 'Database Query Cache'
}
```

### Database Optimization
- **Indexing**: Composite indexes on frequently queried columns
- **Partitioning**: Time-based partitioning for large tables
- **Connection Pooling**: PgBouncer for connection management
- **Read Replicas**: Separate read/write workloads

### File Processing Optimization
- **Streaming**: Process large files without loading into memory
- **Compression**: Gzip compression for API responses
- **Lazy Loading**: Load images on demand
- **Batch Processing**: Group similar operations

## 6. Security Architecture

### Authentication & Authorization
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   OAuth 2.0     │    │      JWT        │    │     RBAC        │
│                 │    │                 │    │                 │
│ • SSO Support   │◄──►│ • Stateless     │◄──►│ • Role-based    │
│ • Multi-factor  │    │ • Short-lived   │    │ • Permissions   │
│ • Refresh Token │    │ • Signed        │    │ • Audit Trail   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Protection
- **Encryption**: AES-256 for data at rest
- **TLS 1.3**: All communications encrypted
- **Input Validation**: Comprehensive sanitization
- **Rate Limiting**: Prevent abuse and DoS

## 7. Monitoring & Observability

### Metrics Collection
```
Application Metrics → Prometheus → Grafana Dashboard
         │
         ▼
    Custom Metrics:
    • Detection Accuracy
    • Processing Time
    • Queue Length
    • Error Rates
```

### Logging Strategy
```
Application Logs → ELK Stack → Alerting
         │
         ▼
    Structured Logging:
    • Request/Response
    • Error Details
    • Performance Metrics
    • Security Events
```

### Health Checks
```typescript
// Comprehensive health monitoring
interface HealthCheck {
  database: 'Connection pool status',
  redis: 'Cache availability',
  models: 'AI model loading status',
  storage: 'File system health',
  queue: 'Message queue status'
}
```

## 8. Deployment Architecture

### Container Orchestration
```yaml
# Docker Compose for development
version: '3.8'
services:
  api-gateway:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
  
  detection-service:
    image: detection-service:latest
    deploy:
      replicas: 3
      resources:
        limits: {memory: 4G, cpus: '2.0'}
        reservations: {memory: 2G, cpus: '1.0'}
  
  database:
    image: postgres:15
    environment:
      POSTGRES_DB: chitti_ndt
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

### CI/CD Pipeline
```
Code Push → Tests → Build → Security Scan → Deploy → Monitor
     │        │      │         │           │        │
     ▼        ▼      ▼         ▼           ▼        ▼
   GitHub   Jest   Docker   Snyk/SAST   K8s     Grafana
   Actions  Tests  Build    Security    Deploy  Alerts
```

## 9. Cost Optimization

### Resource Management
- **Spot Instances**: Use for batch processing
- **Reserved Instances**: For predictable workloads
- **Auto-shutdown**: Development environments
- **Resource Tagging**: Cost allocation and tracking

### Storage Optimization
- **Lifecycle Policies**: Move old data to cheaper storage
- **Compression**: Reduce storage costs
- **Deduplication**: Eliminate duplicate files
- **CDN**: Reduce bandwidth costs

## 10. Disaster Recovery

### Backup Strategy
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Database      │    │   File Storage  │    │   Configuration │
│                 │    │                 │    │                 │
│ • Daily Backup  │    │ • Replication   │    │ • Git Repository│
│ • Point-in-time │    │ • Versioning    │    │ • Infrastructure│
│ • Cross-region  │    │ • Lifecycle     │    │ • as Code       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Recovery Procedures
- **RTO**: 4 hours for critical services
- **RPO**: 1 hour maximum data loss
- **Failover**: Automated with health checks
- **Testing**: Monthly disaster recovery drills

This architecture provides a robust, scalable foundation for the Chitti AI NDT system that can handle enterprise-level workloads while maintaining high availability and performance.
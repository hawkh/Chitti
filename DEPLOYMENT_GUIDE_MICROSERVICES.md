# Complete Enterprise Microservices Deployment Guide

## Prerequisites

- Docker & Docker Compose
- Kubernetes cluster (EKS, GKE, or local with minikube)
- kubectl configured
- AWS account (for S3, RDS, etc.)
- Terraform (optional, for infrastructure)

## Quick Start - Local Development

### 1. Start All Microservices with Docker Compose

```bash
# Windows
START_MICROSERVICES.bat

# Linux/Mac
docker-compose -f docker-compose.microservices.yml up -d
```

This starts:
- ✅ API Gateway (Nginx) - Port 80
- ✅ Auth Service (3 replicas) - JWT/OAuth
- ✅ File Service (2 replicas) - S3 + RabbitMQ
- ✅ Report Service (2 replicas) - PDF generation
- ✅ Detection Service (2 replicas) - YOLO AI
- ✅ Celery Workers (3 replicas) - Async processing
- ✅ PostgreSQL + Read Replica
- ✅ PgBouncer - Connection pooling
- ✅ Redis - Session storage
- ✅ RabbitMQ - Message queue
- ✅ Prometheus - Metrics
- ✅ Grafana - Dashboards
- ✅ ELK Stack - Logging

### 2. Verify Services

```bash
docker-compose -f docker-compose.microservices.yml ps
```

### 3. Access Services

- **API Gateway**: http://localhost:80
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)
- **Kibana**: http://localhost:5601
- **RabbitMQ**: http://localhost:15672 (admin/admin)

## Production Deployment - Kubernetes

### 1. Build and Push Images

```bash
# Build all services
docker-compose -f docker-compose.microservices.yml build

# Tag for your registry
docker tag chitti/auth-service:latest your-registry/auth-service:latest
docker tag chitti/file-service:latest your-registry/file-service:latest
docker tag chitti/report-service:latest your-registry/report-service:latest
docker tag chitti/detection-service:latest your-registry/detection-service:latest

# Push to registry
docker push your-registry/auth-service:latest
docker push your-registry/file-service:latest
docker push your-registry/report-service:latest
docker push your-registry/detection-service:latest
```

### 2. Configure Kubernetes Secrets

Edit `k8s/secrets.yaml` with your credentials:

```bash
kubectl apply -f k8s/secrets.yaml
```

### 3. Deploy Services

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/monitoring.yaml
```

### 4. Verify Deployment

```bash
kubectl get pods
kubectl get services
kubectl get hpa
```

### 5. Access Services

```bash
# Get load balancer URLs
kubectl get svc api-gateway
kubectl get svc prometheus
kubectl get svc grafana
```

## AWS Infrastructure with Terraform

### 1. Initialize Terraform

```bash
cd terraform
terraform init
```

### 2. Configure Variables

Create `terraform.tfvars`:

```hcl
aws_region = "us-east-1"
db_password = "your-secure-password"
rabbitmq_password = "your-secure-password"
```

### 3. Deploy Infrastructure

```bash
terraform plan
terraform apply
```

This creates:
- ✅ EKS Cluster with auto-scaling node groups
- ✅ S3 Bucket + CloudFront CDN
- ✅ RDS Aurora PostgreSQL (2 instances)
- ✅ ElastiCache Redis
- ✅ Amazon MQ RabbitMQ (Multi-AZ)

### 4. Configure kubectl for EKS

```bash
aws eks update-kubeconfig --name chitti-cluster --region us-east-1
```

## CI/CD Setup - GitHub Actions

### 1. Add Secrets to GitHub

Go to Settings > Secrets and add:
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

### 2. Push to Main Branch

```bash
git add .
git commit -m "Deploy microservices"
git push origin main
```

GitHub Actions will automatically:
1. Run tests
2. Build Docker images
3. Push to registry
4. Deploy to Kubernetes
5. Verify rollout

## Scaling Services

### Manual Scaling

```bash
# Docker Compose
docker-compose -f docker-compose.microservices.yml up -d --scale auth-service=5

# Kubernetes
kubectl scale deployment auth-service --replicas=5
```

### Auto-scaling (HPA)

Already configured in `k8s/deployment.yaml`:
- Auth Service: 3-10 replicas (CPU 70%)
- File Service: 2-8 replicas (CPU 75%)
- Detection Service: 2-6 replicas (CPU 80%)

## Monitoring

### Prometheus Metrics

Access: http://localhost:9090

Query examples:
```promql
# Request rate
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m])

# Response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

### Grafana Dashboards

Access: http://localhost:3001

Pre-configured dashboards for:
- Service metrics
- Database performance
- Queue lengths
- System resources

### Kibana Logs

Access: http://localhost:5601

Index pattern: `chitti-logs-*`

## Database Management

### Connection Pooling

PgBouncer is configured with:
- Max 1000 client connections
- Pool size: 25 per database
- Transaction pooling mode

Connect via: `localhost:6432`

### Read Replica

Read-only queries automatically routed to replica:
- Primary: Write operations
- Replica: Read operations

## Message Queue

### RabbitMQ Management

Access: http://localhost:15672 (admin/admin)

Queues:
- `file-processing`: File upload processing
- `report-generation`: Report creation

### Celery Workers

Monitor workers:
```bash
docker-compose -f docker-compose.microservices.yml logs celery-worker
```

## Troubleshooting

### Check Service Health

```bash
# Docker
docker-compose -f docker-compose.microservices.yml ps
docker-compose -f docker-compose.microservices.yml logs [service-name]

# Kubernetes
kubectl get pods
kubectl logs [pod-name]
kubectl describe pod [pod-name]
```

### Database Connection Issues

```bash
# Test PgBouncer
psql -h localhost -p 6432 -U postgres -d chitti_ndt

# Check connections
docker exec -it postgres psql -U postgres -c "SELECT * FROM pg_stat_activity;"
```

### Queue Issues

```bash
# Check RabbitMQ queues
docker exec -it rabbitmq rabbitmqctl list_queues
```

## Performance Tuning

### Database

Edit `postgres/postgresql.conf`:
- Increase `shared_buffers` for more memory
- Adjust `max_connections` based on load
- Tune `work_mem` for complex queries

### Redis

Configure in docker-compose:
- `maxmemory`: Set based on available RAM
- `maxmemory-policy`: allkeys-lru for caching

### Nginx

Edit `microservices/api-gateway/nginx.conf`:
- Adjust `worker_connections`
- Tune rate limiting
- Configure caching

## Security Checklist

- ✅ Change default passwords
- ✅ Use secrets management (Kubernetes secrets, AWS Secrets Manager)
- ✅ Enable SSL/TLS certificates
- ✅ Configure firewall rules
- ✅ Enable audit logging
- ✅ Regular security updates
- ✅ Rate limiting enabled
- ✅ JWT token expiration

## Backup Strategy

### Database Backups

```bash
# Manual backup
docker exec postgres pg_dump -U postgres chitti_ndt > backup.sql

# Restore
docker exec -i postgres psql -U postgres chitti_ndt < backup.sql
```

### Automated Backups (AWS)

RDS Aurora configured with:
- 7-day retention
- Daily backups at 3:00 AM
- Point-in-time recovery

## Cost Optimization

### AWS Resources

- Use Reserved Instances for EKS nodes
- Enable S3 lifecycle policies
- Use Aurora Serverless for variable workloads
- Configure auto-scaling to scale down during low traffic

### Monitoring Costs

- Set up billing alerts
- Use AWS Cost Explorer
- Monitor resource utilization in Grafana

## Support

For issues:
1. Check logs in Kibana
2. Review metrics in Grafana
3. Verify service health in Prometheus
4. Check RabbitMQ queue status

---

**You now have a complete enterprise-grade microservices architecture!**

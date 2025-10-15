#!/bin/bash

echo "========================================="
echo "Enterprise Microservices Deployment"
echo "========================================="

# Build all services
echo "Building Docker images..."
docker-compose -f docker-compose.microservices.yml build

# Push to registry
echo "Pushing images to registry..."
docker-compose -f docker-compose.microservices.yml push

# Apply Kubernetes configs
echo "Deploying to Kubernetes..."
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/monitoring.yaml

# Wait for deployments
echo "Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/auth-service
kubectl wait --for=condition=available --timeout=300s deployment/file-service
kubectl wait --for=condition=available --timeout=300s deployment/detection-service

# Get service URLs
echo "========================================="
echo "Deployment Complete!"
echo "========================================="
kubectl get services
kubectl get pods

echo ""
echo "Access your services:"
echo "API Gateway: $(kubectl get svc api-gateway -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')"
echo "Prometheus: $(kubectl get svc prometheus -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'):9090"
echo "Grafana: $(kubectl get svc grafana -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'):3000"

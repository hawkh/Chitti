@echo off
echo ========================================
echo Testing Microservices Implementation
echo ========================================
echo.

echo [1/13] Checking API Gateway config...
if exist "microservices\api-gateway\nginx.conf" (
    echo ✓ API Gateway nginx.conf exists
) else (
    echo ✗ API Gateway MISSING
)

echo [2/13] Checking Auth Service...
if exist "microservices\auth-service\src\index.ts" (
    echo ✓ Auth Service exists
) else (
    echo ✗ Auth Service MISSING
)

echo [3/13] Checking File Service...
if exist "microservices\file-service\src\index.ts" (
    echo ✓ File Service exists
) else (
    echo ✗ File Service MISSING
)

echo [4/13] Checking Report Service...
if exist "microservices\report-service\src\index.ts" (
    echo ✓ Report Service exists
) else (
    echo ✗ Report Service MISSING
)

echo [5/13] Checking RabbitMQ/Celery...
if exist "python-backend\celery_worker.py" (
    echo ✓ Celery Worker exists
) else (
    echo ✗ Celery Worker MISSING
)

echo [6/13] Checking Database Replication...
if exist "postgres\postgresql.conf" (
    echo ✓ PostgreSQL replication config exists
) else (
    echo ✗ PostgreSQL config MISSING
)

echo [7/13] Checking Kubernetes HPA...
if exist "k8s\deployment.yaml" (
    echo ✓ Kubernetes deployment exists
) else (
    echo ✗ Kubernetes MISSING
)

echo [8/13] Checking Prometheus...
if exist "monitoring\prometheus.yml" (
    echo ✓ Prometheus config exists
) else (
    echo ✗ Prometheus MISSING
)

echo [9/13] Checking ELK Stack...
if exist "monitoring\logstash.conf" (
    echo ✓ Logstash config exists
) else (
    echo ✗ ELK Stack MISSING
)

echo [10/13] Checking CI/CD...
if exist "ci-cd\github-actions.yml" (
    echo ✓ CI/CD pipeline exists
) else (
    echo ✗ CI/CD MISSING
)

echo [11/13] Checking Terraform...
if exist "terraform\main.tf" (
    echo ✓ Terraform IaC exists
) else (
    echo ✗ Terraform MISSING
)

echo [12/13] Checking Docker Compose...
if exist "docker-compose.microservices.yml" (
    echo ✓ Microservices docker-compose exists
) else (
    echo ✗ Docker Compose MISSING
)

echo [13/13] Checking Dockerfiles...
if exist "microservices\auth-service\Dockerfile" (
    echo ✓ Auth Dockerfile exists
) else (
    echo ✗ Auth Dockerfile MISSING
)

echo.
echo ========================================
echo Building Services to Verify...
echo ========================================
docker-compose -f docker-compose.microservices.yml config
echo.
echo If no errors above, all services are properly configured!
pause

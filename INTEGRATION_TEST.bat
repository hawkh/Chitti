@echo off
echo ========================================
echo Integration Testing - Starting Services
echo ========================================

echo [1/5] Building services...
docker-compose -f docker-compose.microservices.yml build 2>&1 | findstr /C:"ERROR" /C:"failed" /C:"Successfully"

if %errorlevel% neq 0 (
    echo ✗ Build failed - checking errors...
    docker-compose -f docker-compose.microservices.yml build
    pause
    exit /b 1
)

echo [2/5] Starting core services...
docker-compose -f docker-compose.microservices.yml up -d postgres redis rabbitmq
timeout /t 20

echo [3/5] Starting application services...
docker-compose -f docker-compose.microservices.yml up -d api-gateway auth-service file-service report-service detection-service
timeout /t 30

echo [4/5] Testing service health...
curl -s http://localhost:80/health
if %errorlevel% neq 0 (
    echo ✗ API Gateway not responding
    docker-compose -f docker-compose.microservices.yml logs api-gateway
)

echo [5/5] Checking all services...
docker-compose -f docker-compose.microservices.yml ps

echo.
echo ========================================
echo Integration Test Complete
echo ========================================
pause

@echo off
echo ========================================
echo Running Integration Tests
echo ========================================
echo.

echo Checking if services are running...
docker-compose -f docker-compose.microservices.yml ps | findstr "Up"
if %errorlevel% neq 0 (
    echo Services not running. Starting them...
    call BUILD_AND_TEST.bat
)

echo.
echo Testing API Gateway...
curl -s http://localhost:80/health
if %errorlevel% equ 0 (
    echo ✓ API Gateway responding
) else (
    echo ✗ API Gateway not responding
)

echo.
echo Testing Auth Service...
curl -s -X POST http://localhost:80/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"test%RANDOM%@test.com\",\"password\":\"test123\",\"name\":\"Test User\"}"
if %errorlevel% equ 0 (
    echo ✓ Auth Service working
) else (
    echo ✗ Auth Service failed
)

echo.
echo Testing Prometheus...
curl -s http://localhost:9090/-/healthy
if %errorlevel% equ 0 (
    echo ✓ Prometheus working
) else (
    echo ✗ Prometheus failed
)

echo.
echo Testing Grafana...
curl -s http://localhost:3001/api/health
if %errorlevel% equ 0 (
    echo ✓ Grafana working
) else (
    echo ✗ Grafana failed
)

echo.
echo Testing RabbitMQ...
curl -s -u admin:admin http://localhost:15672/api/overview
if %errorlevel% equ 0 (
    echo ✓ RabbitMQ working
) else (
    echo ✗ RabbitMQ failed
)

echo.
echo ========================================
echo Integration Tests Complete
echo ========================================
echo.
echo All services status:
docker-compose -f docker-compose.microservices.yml ps
echo.
pause

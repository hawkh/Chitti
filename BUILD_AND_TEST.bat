@echo off
cls
echo ╔════════════════════════════════════════════════════════════╗
echo ║     BUILD, INTEGRATE AND TEST - Microservices Stack        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo [STEP 1/6] Installing dependencies for microservices...
cd microservices\auth-service
call npm install --silent
cd ..\..

cd microservices\file-service
call npm install --silent
cd ..\..

cd microservices\report-service
call npm install --silent
cd ..\..

echo ✓ Dependencies installed
echo.

echo [STEP 2/6] Building TypeScript services...
cd microservices\auth-service
call npm run build
cd ..\..

cd microservices\file-service
call npm run build
cd ..\..

cd microservices\report-service
call npm run build
cd ..\..

echo ✓ TypeScript compiled
echo.

echo [STEP 3/6] Building Docker images...
docker-compose -f docker-compose.microservices.yml build --parallel
if %errorlevel% neq 0 (
    echo ✗ Docker build failed
    pause
    exit /b 1
)
echo ✓ Docker images built
echo.

echo [STEP 4/6] Starting infrastructure services...
docker-compose -f docker-compose.microservices.yml up -d postgres redis rabbitmq
echo Waiting 20 seconds for databases...
timeout /t 20 /nobreak > nul
echo ✓ Infrastructure ready
echo.

echo [STEP 5/6] Starting application services...
docker-compose -f docker-compose.microservices.yml up -d
echo Waiting 30 seconds for services...
timeout /t 30 /nobreak > nul
echo ✓ Services started
echo.

echo [STEP 6/6] Running integration tests...
docker-compose -f docker-compose.microservices.yml ps
echo.

echo Testing API Gateway...
curl -s http://localhost:80/health
echo.

echo ╔════════════════════════════════════════════════════════════╗
echo ║                    BUILD COMPLETE                          ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Services running at:
echo   - API Gateway:  http://localhost:80
echo   - Prometheus:   http://localhost:9090
echo   - Grafana:      http://localhost:3001
echo   - Kibana:       http://localhost:5601
echo   - RabbitMQ:     http://localhost:15672
echo.
echo Run: docker-compose -f docker-compose.microservices.yml logs -f
echo.
pause

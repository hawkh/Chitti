@echo off
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   CHITTI AI NDT - Enterprise Microservices Architecture   ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo This will start ALL enterprise components:
echo.
echo   ✓ API Gateway (Nginx Load Balancer)
echo   ✓ Auth Service (3 replicas) - JWT OAuth 2.0
echo   ✓ File Service (2 replicas) - S3 + RabbitMQ
echo   ✓ Report Service (2 replicas) - PDF Generation
echo   ✓ Detection Service (2 replicas) - YOLO AI
echo   ✓ Celery Workers (3 replicas) - Async Processing
echo   ✓ PostgreSQL + Read Replica
echo   ✓ PgBouncer - Connection Pooling
echo   ✓ Redis - Session Storage
echo   ✓ RabbitMQ - Message Queue
echo   ✓ Prometheus - Metrics
echo   ✓ Grafana - Dashboards
echo   ✓ ELK Stack - Logging
echo.
echo Total: 19 services
echo.
pause

echo.
echo [Step 1/3] Validating docker-compose configuration...
docker-compose -f docker-compose.microservices.yml config > nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Configuration error! Check docker-compose.microservices.yml
    pause
    exit /b 1
)
echo ✓ Configuration valid

echo.
echo [Step 2/3] Building services (this may take a few minutes)...
docker-compose -f docker-compose.microservices.yml build --parallel
if %errorlevel% neq 0 (
    echo ✗ Build failed!
    pause
    exit /b 1
)
echo ✓ Build complete

echo.
echo [Step 3/3] Starting all services...
docker-compose -f docker-compose.microservices.yml up -d
if %errorlevel% neq 0 (
    echo ✗ Failed to start services!
    pause
    exit /b 1
)

echo.
echo ✓ All services started!
echo.
echo Waiting 30 seconds for services to initialize...
timeout /t 30 /nobreak > nul

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    SERVICE STATUS                          ║
echo ╚════════════════════════════════════════════════════════════╝
docker-compose -f docker-compose.microservices.yml ps

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    ACCESS URLS                             ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo   API Gateway:     http://localhost:80
echo   Prometheus:      http://localhost:9090
echo   Grafana:         http://localhost:3001  (admin/admin)
echo   Kibana:          http://localhost:5601
echo   RabbitMQ:        http://localhost:15672 (admin/admin)
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    API ENDPOINTS                           ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo   Auth:            http://localhost:80/api/auth/
echo   Files:           http://localhost:80/api/files/
echo   Reports:         http://localhost:80/api/reports/
echo   Detection:       http://localhost:80/api/detect/
echo.
echo.
echo Press any key to view live logs (Ctrl+C to exit)...
pause > nul
docker-compose -f docker-compose.microservices.yml logs -f

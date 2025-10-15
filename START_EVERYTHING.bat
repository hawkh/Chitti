@echo off
cls
echo ╔════════════════════════════════════════════════════════════╗
echo ║     START EVERYTHING - Next.js + Microservices            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo [1/3] Starting Microservices Stack...
docker-compose -f docker-compose.microservices.yml up -d
echo ✓ Microservices started
echo.

echo Waiting 30 seconds for services to initialize...
timeout /t 30 /nobreak > nul

echo [2/3] Starting Next.js Application...
start "Next.js App" cmd /k "npm start"
echo ✓ Next.js starting in new window
echo.

echo [3/3] Service Status...
docker-compose -f docker-compose.microservices.yml ps
echo.

echo ╔════════════════════════════════════════════════════════════╗
echo ║                    ALL SERVICES RUNNING                    ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Next.js App:     http://localhost:3000
echo API Gateway:     http://localhost:80
echo Prometheus:      http://localhost:9090
echo Grafana:         http://localhost:3001
echo Kibana:          http://localhost:5601
echo RabbitMQ:        http://localhost:15672
echo.
pause

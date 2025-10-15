@echo off
echo ========================================
echo Starting Enterprise Microservices Stack
echo ========================================
echo.

echo Building services...
docker-compose -f docker-compose.microservices.yml build

echo.
echo Starting all services...
docker-compose -f docker-compose.microservices.yml up -d

echo.
echo Waiting for services to be healthy...
timeout /t 30

echo.
echo ========================================
echo Services Status:
echo ========================================
docker-compose -f docker-compose.microservices.yml ps

echo.
echo ========================================
echo Service URLs:
echo ========================================
echo API Gateway:        http://localhost:80
echo Prometheus:         http://localhost:9090
echo Grafana:            http://localhost:3001
echo Kibana:             http://localhost:5601
echo RabbitMQ:           http://localhost:15672
echo PgBouncer:          localhost:6432
echo ========================================
echo.
echo Press any key to view logs...
pause
docker-compose -f docker-compose.microservices.yml logs -f

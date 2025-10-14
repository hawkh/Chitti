@echo off
echo ========================================
echo Chitti AI NDT - Docker Deployment
echo ========================================
echo.

echo Checking Docker installation...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not in PATH
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo Docker found! Starting deployment...
echo.

echo Building and starting services...
docker-compose up --build -d

echo.
echo Waiting for services to start...
timeout /t 10 /nobreak >nul

echo.
echo Initializing database...
docker-compose exec app npm run setup

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Application URL: http://localhost:3000
echo Database Admin: http://localhost:5432
echo Redis Admin: http://localhost:6379
echo.
echo To stop services: docker-compose down
echo To view logs: docker-compose logs -f
echo.
pause
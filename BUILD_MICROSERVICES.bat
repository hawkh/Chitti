@echo off
echo ========================================
echo Building Microservices (Separate Build)
echo ========================================
echo.

echo [1/4] Building Auth Service...
cd microservices\auth-service
if not exist "node_modules" (
    call npm install
)
call npm run build
cd ..\..
echo ✓ Auth Service built
echo.

echo [2/4] Building File Service...
cd microservices\file-service
if not exist "node_modules" (
    call npm install
)
call npm run build
cd ..\..
echo ✓ File Service built
echo.

echo [3/4] Building Report Service...
cd microservices\report-service
if not exist "node_modules" (
    call npm install
)
call npm run build
cd ..\..
echo ✓ Report Service built
echo.

echo [4/4] Building Docker Images...
docker-compose -f docker-compose.microservices.yml build
echo ✓ Docker images built
echo.

echo ========================================
echo Microservices Build Complete!
echo ========================================
echo.
echo To start services: docker-compose -f docker-compose.microservices.yml up -d
pause

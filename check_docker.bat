@echo off
echo.
echo ========================================
echo Checking Docker Status
echo ========================================
echo.

docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not in PATH
    echo.
    echo 💡 Please start Docker Desktop:
    echo    1. Open Docker Desktop app
    echo    2. Wait for it to say "Docker Desktop is running"
    echo    3. Run this script again
    echo.
    pause
    exit /b 1
)

echo ✅ Docker is in PATH
echo.

docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Desktop is not running
    echo.
    echo 💡 Please start Docker Desktop:
    echo    1. Open Docker Desktop app
    echo    2. Wait for it to say "Docker Desktop is running"
    echo    3. Run this script again
    echo.
    pause
    exit /b 1
)

echo ✅ Docker Desktop is running!
echo.
echo 🚀 Ready to deploy YOUR model to Lambda!
echo.
echo Run: python deploy_docker_lambda.py
echo.
pause

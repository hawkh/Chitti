@echo off
REM Update AWS Amplify Environment Variables for ECS Backend

echo ========================================
echo 🚀 Update AWS Amplify Environment Variables
echo ========================================
echo.

set AWS_REGION=us-east-1
set AWS_ECS_URL=http://23.22.163.148:10000

REM Get Amplify App ID
for /f "tokens=*" %%i in ('aws amplify list-apps --region %AWS_REGION% --query "apps[?name=='chitti-ai'].appId" --output text 2^>nul') do set APP_ID=%%i

if "%APP_ID%"=="" (
    echo ❌ Error: Amplify app not found
    echo.
    echo Please create an Amplify app first or update APP_ID manually
    pause
    exit /b 1
)

echo Found Amplify App ID: %APP_ID%
echo.

echo Updating environment variables...
echo.

REM Update NEXT_PUBLIC_WELD_API_URL
aws amplify update-app ^
    --app-id %APP_ID% ^
    --region %AWS_REGION% ^
    --environment-variables NEXT_PUBLIC_WELD_API_URL=%AWS_ECS_URL%,NEXT_PUBLIC_PYTHON_BACKEND_URL=%AWS_ECS_URL% ^
    >nul 2>&1

if errorlevel 1 (
    echo ❌ Failed to update environment variables
    pause
    exit /b 1
)

echo ✅ Environment variables updated!
echo.

echo ========================================
echo 📋 Updated Variables:
echo ========================================
echo NEXT_PUBLIC_WELD_API_URL=%AWS_ECS_URL%
echo NEXT_PUBLIC_PYTHON_BACKEND_URL=%AWS_ECS_URL%
echo.

echo ========================================
echo 🚀 Trigger New Deployment
echo ========================================
echo.
echo Option 1: Push to Git (recommended)
echo    git add .
echo    git commit -m "Update backend endpoint to AWS ECS"
echo    git push origin main
echo.
echo Option 2: Manual deployment in Amplify Console
echo    https://%AWS_REGION%.console.aws.amazon.com/amplify/home?region=%AWS_REGION%#/%APP_ID%
echo.

pause

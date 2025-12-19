@echo off
REM Update Vercel Environment Variables for AWS ECS Backend

echo ========================================
echo 🚀 Update Vercel Environment Variables
echo ========================================
echo.

set AWS_ECS_URL=http://23.22.163.148:10000

echo Updating Vercel environment variables...
echo.

REM Update production environment
echo Setting NEXT_PUBLIC_WELD_API_URL for production...
call vercel env add NEXT_PUBLIC_WELD_API_URL production
echo %AWS_ECS_URL%

echo.
echo Setting NEXT_PUBLIC_PYTHON_BACKEND_URL for production...
call vercel env add NEXT_PUBLIC_PYTHON_BACKEND_URL production
echo %AWS_ECS_URL%

echo.
echo ========================================
echo ✅ Environment Variables Updated!
echo ========================================
echo.
echo Next steps:
echo 1. Redeploy your Vercel app:
echo    vercel --prod
echo.
echo 2. Or trigger deployment from Git:
echo    git push origin main
echo.

pause

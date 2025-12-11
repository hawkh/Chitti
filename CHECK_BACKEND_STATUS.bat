@echo off
echo Checking Render backend status...
echo.
curl https://chitti-yolo-backend.onrender.com/health
echo.
echo.
echo If you see "status":"ok" and "model_loaded":true, backend is ready!
echo.
echo Next step: Add this to Vercel environment variables:
echo   PYTHON_BACKEND_URL = https://chitti-yolo-backend.onrender.com
echo.
pause

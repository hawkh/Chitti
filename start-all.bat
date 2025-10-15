@echo off
echo Starting Chitti AI NDT - All Services
echo =====================================

echo.
echo [1/3] Starting Python YOLO Backend...
start "Python Backend" cmd /k "cd python-backend && python app.py"

timeout /t 3 /nobreak >nul

echo [2/3] Starting PostgreSQL (if not running)...
echo Make sure PostgreSQL is running on localhost:5432

echo.
echo [3/3] Starting Next.js Frontend...
start "Next.js Frontend" cmd /k "npm run dev"

echo.
echo =====================================
echo All services started!
echo.
echo Python Backend: http://localhost:5000
echo Next.js Frontend: http://localhost:3000
echo PostgreSQL: localhost:5432
echo Redis: redis-18971.c330.asia-south1-1.gce.redns.redis-cloud.com:18971
echo.
echo Press any key to exit this window...
pause >nul

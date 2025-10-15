@echo off
echo ========================================
echo Starting Chitti AI NDT Services
echo ========================================
echo.

echo [1/2] Starting Python YOLO Backend...
start "YOLO Backend" cmd /k "cd python-backend && python app.py"

timeout /t 5 /nobreak >nul

echo [2/2] Starting Next.js Frontend...
start "Next.js Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo Services Started!
echo ========================================
echo.
echo Python Backend: http://localhost:5000
echo Next.js Frontend: http://localhost:3000
echo.
echo Model: best.pt (YOLOv12)
echo Database: PostgreSQL (localhost:5432)
echo Redis: Cloud Instance
echo.
pause

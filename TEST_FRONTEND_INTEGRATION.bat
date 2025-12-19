@echo off
REM Test Frontend Integration with AWS ECS Backend

echo ========================================
echo 🧪 Test Frontend Integration
echo ========================================
echo.

set AWS_ECS_URL=http://23.22.163.148:10000

echo Testing AWS ECS Backend...
echo.

REM Test 1: Backend Health
echo [1/3] Testing backend health...
curl -s %AWS_ECS_URL%/health
echo.
echo.

REM Test 2: Check environment variables
echo [2/3] Checking environment variables...
echo.
echo .env.local:
findstr "NEXT_PUBLIC_WELD_API_URL" .env.local
echo.
echo .env.production:
findstr "NEXT_PUBLIC_WELD_API_URL" .env.production
echo.

REM Test 3: Start local dev server
echo [3/3] Starting local development server...
echo.
echo ========================================
echo 📋 Testing Instructions:
echo ========================================
echo.
echo 1. Server will start at http://localhost:3000
echo 2. Open browser and go to http://localhost:3000/demo
echo 3. Upload an image and click "Detect Defects"
echo 4. Open browser console (F12)
echo 5. Look for: "Real YOLO Backend" message
echo 6. Verify backend URL is: %AWS_ECS_URL%
echo.
echo Press Ctrl+C to stop the server when done testing
echo.
pause

npm run dev

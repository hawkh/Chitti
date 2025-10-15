@echo off
echo ========================================
echo Building Next.js Application
echo ========================================
echo.

echo Installing dependencies...
call npm install

echo.
echo Building Next.js...
call npm run build

echo.
echo ========================================
echo Next.js Build Complete!
echo ========================================
echo.
echo To start: npm start
pause

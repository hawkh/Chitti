@echo off
cls
echo ╔════════════════════════════════════════════════════════════╗
echo ║          BUILD ALL - Next.js + Microservices              ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo [PART 1] Building Next.js Application...
call BUILD_NEXTJS.bat

echo.
echo [PART 2] Building Microservices...
call BUILD_MICROSERVICES.bat

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                  BUILD COMPLETE                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Next.js: npm start
echo Microservices: docker-compose -f docker-compose.microservices.yml up -d
echo.
pause

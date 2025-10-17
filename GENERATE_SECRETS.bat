@echo off
cls
echo ╔════════════════════════════════════════════════════════════╗
echo ║           GENERATE SECURE SECRETS FOR DEPLOYMENT          ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo Generating JWT Secret...
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
echo.

echo Generating Database Password...
node -e "console.log('DB_PASSWORD=' + require('crypto').randomBytes(16).toString('base64'))"
echo.

echo Generating Session Secret...
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
echo.

echo Generating API Key...
node -e "console.log('API_KEY=' + require('crypto').randomBytes(24).toString('base64'))"
echo.

echo ╔════════════════════════════════════════════════════════════╗
echo ║                  COPY THESE TO YOUR .env                   ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Save these values to:
echo   - .env.production (for production)
echo   - .env.local (for local development)
echo   - GCP Secrets Manager (for cloud deployment)
echo.
pause

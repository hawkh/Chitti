@echo off
REM Chitti AI NDT - Environment Setup Script (Windows)
REM This script helps you set up your .env.local file with OAuth credentials

echo.
echo 🚀 Chitti AI NDT - Environment Setup
echo ====================================
echo.

REM Check if .env.local exists
if exist .env.local (
    echo ⚠️  .env.local already exists!
    set /p "overwrite=Do you want to overwrite it? (y/n): "
    if /i not "%overwrite%"=="y" (
        echo Aborting. Your existing .env.local was not modified.
        exit /b 0
    )
)

echo 📝 Setting up environment variables...
echo.

REM Generate NextAuth secret using Node.js
echo 🔐 Generating NEXTAUTH_SECRET...
for /f "delims=" %%i in ('node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"') do set NEXTAUTH_SECRET=%%i
echo ✅ Secret generated
echo.

REM Google OAuth Client ID (already provided)
set GOOGLE_CLIENT_ID=278114676907-8eqtrlda2voblimoq5ed676ogdl5nsic.apps.googleusercontent.com
echo ✅ Google Client ID: %GOOGLE_CLIENT_ID%
echo.

REM Ask for Google Client Secret
echo 🔑 Please enter your Google Client Secret
echo (You can find this in Google Cloud Console → Credentials)
set /p "GOOGLE_CLIENT_SECRET=Google Client Secret: "
echo.

REM Create .env.local
(
echo DATABASE_URL="postgresql://user:password@localhost:5432/chitti_ndt?schema=public"
echo REDIS_URL="redis://localhost:6379"
echo NEXT_PUBLIC_PYTHON_API_URL="http://localhost:5000"
echo.
echo # ========================================
echo # Google OAuth2 Configuration
echo # ========================================
echo.
echo # NextAuth Secret ^(Auto-generated^)
echo NEXTAUTH_SECRET=%NEXTAUTH_SECRET%
echo.
echo # NextAuth URL ^(Change for production^)
echo NEXTAUTH_URL=http://localhost:3000
echo.
echo # Google OAuth Credentials
echo GOOGLE_CLIENT_ID=%GOOGLE_CLIENT_ID%
echo GOOGLE_CLIENT_SECRET=%GOOGLE_CLIENT_SECRET%
echo.
echo # ========================================
echo # Unified Detection Configuration
echo # ========================================
echo.
echo # Detection Mode: tfjs ^(client-side^), backend ^(server API^), or mock ^(testing^)
echo NEXT_PUBLIC_DETECTION_MODE=tfjs
echo.
echo # TensorFlow.js Model URL ^(for client-side detection^)
echo NEXT_PUBLIC_TFJS_MODEL_URL=/models/yolo-defect-detector/tfjs_model/model.json
echo.
echo # Backend Detection API URL ^(for backend mode^)
echo NEXT_PUBLIC_BACKEND_DETECTION_URL=/api/detect
echo.
echo # Analytics ^(optional^)
echo NEXT_PUBLIC_ENABLE_ANALYTICS=false
) > .env.local

echo ✅ .env.local created successfully!
echo.
echo 📋 Summary:
echo   • NEXTAUTH_SECRET: ✅ Generated
echo   • NEXTAUTH_URL: http://localhost:3000
echo   • GOOGLE_CLIENT_ID: ✅ Set
echo   • GOOGLE_CLIENT_SECRET: ✅ Set
echo.
echo 🎉 Setup complete! You can now run:
echo    npm install
echo    npm run dev
echo.
echo 🌐 Visit http://localhost:3000/auth/signin to test Google Sign-In!
echo.
pause

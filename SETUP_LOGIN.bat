@echo off
echo ========================================
echo Chitti AI - Login Setup Script
echo ========================================
echo.

echo Step 1: Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Step 2: Generating Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo ERROR: Failed to generate Prisma client
    pause
    exit /b 1
)

echo.
echo Step 3: Running database migrations...
call npx prisma migrate dev --name init
if errorlevel 1 (
    echo WARNING: Migration failed - database might not be running
    echo.
    echo Please ensure PostgreSQL is running on localhost:5432
    echo Or switch to SQLite by editing prisma/schema.prisma
    pause
    exit /b 1
)

echo.
echo Step 4: Seeding database with default user...
call npx prisma db seed
if errorlevel 1 (
    echo ERROR: Failed to seed database
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Default Login Credentials:
echo Email: admin@chitti.ai
echo Password: admin123
echo.
echo Start the app with: npm run dev
echo Then go to: http://localhost:3000/login
echo.
pause

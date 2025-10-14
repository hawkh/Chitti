@echo off
echo Adding Node.js to PATH and running build...

set PATH=%PATH%;C:\Program Files\nodejs

echo Checking Node.js version...
node --version

echo Installing dependencies...
npm install

echo Generating Prisma client...
npx prisma generate

echo Building application...
npm run build

echo Build complete!
pause
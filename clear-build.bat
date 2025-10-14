@echo off
echo Clearing Next.js build cache...

rmdir /s /q .next 2>nul
rmdir /s /q node_modules\.cache 2>nul

echo Cache cleared. Running build...
npm run build

pause
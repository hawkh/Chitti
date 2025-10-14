# 🔧 Build Instructions - PATH Issue Fix

## Issue
Node.js is installed but not in PowerShell PATH.

## Quick Fix

### Option 1: Run the fix script
```cmd
fix-path.bat
```

### Option 2: Manual PATH fix
1. Open PowerShell as Administrator
2. Run:
```powershell
$env:PATH += ";C:\Program Files\nodejs"
npm install
npx prisma generate
npm run build
```

### Option 3: Permanent PATH fix
1. Press Win + R, type `sysdm.cpl`
2. Click "Environment Variables"
3. Add `C:\Program Files\nodejs` to PATH
4. Restart PowerShell
5. Run: `npm run build`

### Option 4: Use Command Prompt instead
```cmd
cd C:\Users\kommi\Downloads\Chitti
npm install
npx prisma generate
npm run build
```

## After Build Success
```cmd
npm start
```

Application will be available at: http://localhost:3000
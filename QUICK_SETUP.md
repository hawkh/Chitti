# 🚀 Quick Setup Guide - Node.js Installation Required

## ❌ Current Issue
Node.js is not installed or not in system PATH.

## ✅ Solution Options

### Option 1: Install Node.js (Recommended)
1. Download Node.js 18+ from: https://nodejs.org/
2. Install with default settings
3. Restart PowerShell/Command Prompt
4. Run: `node --version` to verify

### Option 2: Use Docker (No Node.js Required)
```bash
# Install Docker Desktop first
# Then run:
docker-compose up --build
```

### Option 3: Use Portable Node.js
1. Download portable Node.js
2. Extract to C:\nodejs
3. Add C:\nodejs to system PATH

## 🔧 After Node.js Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Build application
npm run build

# Start production server
npm start
```

## 🐳 Docker Alternative (Easiest)

```bash
# Build and start all services
docker-compose up --build -d

# Initialize database
docker-compose exec app npm run setup

# Access at http://localhost:3000
```

## 📋 System Requirements
- Node.js 18+
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)
- 4GB RAM minimum
- 10GB disk space
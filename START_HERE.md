# 🚀 Quick Start Guide

## Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL running on localhost:5432

## Option 1: Start Everything at Once (Windows)

```bash
start-all.bat
```

This will start:
1. Python YOLO Backend (port 5000)
2. Next.js Frontend (port 3000)

## Option 2: Start with npm

```bash
# Install dependencies first
npm install
cd python-backend && pip install -r requirements.txt && cd ..

# Start all services
npm run start:all
```

## Option 3: Start Services Manually

### Terminal 1 - Python Backend
```bash
cd python-backend
python app.py
```

### Terminal 2 - Next.js Frontend
```bash
npm run dev
```

## Access the Application

- **Frontend**: http://localhost:3000
- **Python API**: http://localhost:5000
- **Database**: localhost:5432

## Environment Setup

Make sure you have:
- `.env.local` with DATABASE_URL and REDIS_URL
- `best.pt` model file in `python-backend/`
- PostgreSQL running with `chitti_ndt` database

## First Time Setup

```bash
# Install Node dependencies
npm install

# Install Python dependencies
cd python-backend
pip install -r requirements.txt
cd ..

# Setup database
npx prisma migrate deploy
npm run db:seed

# Start everything
npm run start:all
```

# Database Setup Guide

## Quick Setup (Local PostgreSQL)

### 1. Install PostgreSQL

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql
```

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE chitti_ndt;

# Create user (optional)
CREATE USER chitti_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE chitti_ndt TO chitti_user;

# Exit
\q
```

### 3. Configure Environment

Create `.env.local` file:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/chitti_ndt"
REDIS_URL="redis://localhost:6379"
```

### 4. Run Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma db push

# Or use migrations
npx prisma migrate dev --name init
```

### 5. Seed Database (Optional)

```bash
npx prisma db seed
```

---

## Cloud Setup (Recommended for Production)

### Option 1: Supabase (Free Tier)

1. Go to https://supabase.com
2. Create new project
3. Copy connection string from Settings > Database
4. Update `.env.local`:

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

### Option 2: Railway (Free Tier)

1. Go to https://railway.app
2. Create new project > Add PostgreSQL
3. Copy DATABASE_URL from Variables tab
4. Update `.env.local`

### Option 3: Neon (Free Tier)

1. Go to https://neon.tech
2. Create new project
3. Copy connection string
4. Update `.env.local`

---

## Verify Setup

```bash
# Test connection
npx prisma db pull

# View database in browser
npx prisma studio
```

---

## Common Issues

**Connection refused:**
- Check PostgreSQL is running: `pg_isready`
- Verify port 5432 is open

**Authentication failed:**
- Check username/password in DATABASE_URL
- Verify user has database permissions

**SSL error:**
- Add `?sslmode=require` to DATABASE_URL for cloud databases
- Or `?sslmode=disable` for local development

---

## Quick Commands

```bash
# View database
npx prisma studio

# Reset database
npx prisma migrate reset

# Generate client after schema changes
npx prisma generate

# Push schema without migrations
npx prisma db push
```

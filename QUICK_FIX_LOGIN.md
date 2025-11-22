# Quick Fix: Login Not Working

## Issues Found

1. **Database not initialized** - Prisma migrations haven't been run
2. **No users in database** - Seed data hasn't been created
3. **Missing database connection** - PostgreSQL might not be running

## Quick Fix Steps

### Option 1: Use SQLite (Fastest - No PostgreSQL needed)

1. **Update database to SQLite**:
   ```bash
   # Edit prisma/schema.prisma - change datasource to:
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```

2. **Run migrations and seed**:
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

3. **Login credentials**:
   - Email: `admin@chitti.ai`
   - Password: `admin123`

### Option 2: Fix PostgreSQL (If you want to use it)

1. **Start PostgreSQL** (if not running):
   ```bash
   # Windows - check if PostgreSQL service is running
   # Or use Docker:
   docker run --name postgres -e POSTGRES_PASSWORD=pgadmin -p 5432:5432 -d postgres
   ```

2. **Create database**:
   ```bash
   # Connect to PostgreSQL and create database
   createdb chitti_ndt
   # Or use psql:
   psql -U postgres -c "CREATE DATABASE chitti_ndt;"
   ```

3. **Run migrations and seed**:
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

4. **Login credentials**:
   - Email: `admin@chitti.ai`
   - Password: `admin123`

### Option 3: Quick Demo Mode (No Database)

Create a demo login that bypasses database:

1. Update `app/api/auth/login/route.ts` to accept demo credentials
2. Use localStorage for session management

## Test Login

After setup, go to: `http://localhost:3000/login`

**Credentials**:
- Email: `admin@chitti.ai`
- Password: `admin123`

## Additional Test Users

You can create more users by running this seed script or using the signup page.

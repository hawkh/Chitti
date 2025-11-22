# Fix Next.js 15 Route Params

## Issue
Next.js 15 changed how dynamic route params work. They are now async.

## Old Pattern (Next.js 14)
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
}
```

## New Pattern (Next.js 15)
```typescript
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = params.id;
}
```

## Files That Need Fixing

1. app/api/audit/trends/site/[siteId]/route.ts
2. app/api/audit/recovery/[auditId]/route.ts
3. app/api/audit/notifications/[id]/route.ts
4. app/api/audit/manager/review/[id]/route.ts
5. app/api/audit/manager/review/[id]/approve/route.ts
6. app/api/audit/manager/review/[id]/reject/route.ts
7. app/api/audit/evidence/[id]/route.ts
8. app/api/audit/improvement/actions/[id]/route.ts
9. app/api/audit/sites/[id]/route.ts
10. app/api/audit/users/[id]/route.ts

## Quick Fix

Run this PowerShell script to fix all files:

```powershell
# This will be done manually for each file
```

## Status
- ✅ app/api/audit/alerts/[id]/route.ts - FIXED
- ⏳ Others - Need fixing

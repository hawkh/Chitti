# Simplified Welder/Fab-Tech System

## Overview
A parallel system designed for welders and fabrication technicians with super-easy 1-2 click workflows. Runs alongside the existing enterprise NDT system without interference.

## Access Points
- **Main Entry**: `/simple` - Landing page with Hindi/English toggle
- **Quick Link**: Orange "🔧 For Welders" button on main homepage (top-right)

## Pages (5 Total)

### 1. Landing Page (`/simple`)
- Big hero with 3 buttons: Weld Demo, Etching Demo, Sign Up Free
- Hindi/English language toggle
- No forms, instant access to demos

### 2. Login (`/simple/login`)
- Phone/Email input only
- Role selection: Worker or Boss (big buttons)
- 20-second max signup flow
- Stores user in localStorage for demo purposes

### 3. Dashboard (`/simple/dashboard`)
- One-screen interface
- Toggle: Weld / Etching
- Big camera button for instant upload
- Results show:
  - Score (92% Safe)
  - Benchmark (You vs Average)
  - Carbon saved (300kg CO₂)
  - Fix tips
- Share and Download buttons

### 4. Share Story (`/simple/share`)
- WhatsApp-style form
- Photo upload + description
- Anonymous checkbox
- Community contribution

### 5. Reports (`/simple/reports`)
- Boss-only access
- Monthly calendar picker
- Key metrics cards:
  - Pass rate (85%)
  - Material saved (₹15K)
  - CO₂ cut (2 tons)
- Performance chart
- PDF download button

## Database Schema

### New Models Added
```prisma
model QuickCheck {
  id          String    @id
  userId      String
  checkType   CheckType // WELD or ETCHING
  imageUrl    String
  score       Float
  status      String
  benchmark   Float?
  carbonSaved Float?
  tips        String?
  createdAt   DateTime
}

model Story {
  id          String   @id
  userId      String
  imageUrl    String
  description String
  isAnonymous Boolean
  isApproved  Boolean
  createdAt   DateTime
}

enum UserType {
  ENTERPRISE  // Existing users
  WORKER      // New: Welders/techs
  BOSS        // New: Shop managers
}

enum CheckType {
  WELD
  ETCHING
}
```

### User Model Extended
- Added `phone` field (optional, unique)
- Added `userType` field (defaults to ENTERPRISE)
- Added `language` field (en/hi, defaults to en)
- Added relations: `quickChecks[]`, `stories[]`

## API Routes

### `/api/simple/check` (POST)
- Accepts: file, checkType, userId
- Returns: score, status, benchmark, carbonSaved, tip
- Mock AI processing (replace with actual model)

### `/api/simple/story` (POST/GET)
- POST: Submit story with photo + description
- GET: Fetch approved community stories

### `/api/simple/report` (GET)
- Query params: userId, month
- Returns: Monthly statistics for boss users

## Features

### Language Support
- English and Hindi translations on all pages
- Toggle button in header
- Stored in localStorage with user preferences

### Role-Based Access
- **Worker**: See upload, results, share story
- **Boss**: All worker features + monthly reports + PDF downloads

### Mobile-First Design
- Big touch-friendly buttons (py-5, py-6)
- Camera capture support
- Responsive grid layouts
- Large text (text-2xl, text-3xl)

### Nature-Inspired Design
- Orange/Amber/Rose gradients (molten metal, forge)
- Emerald/Teal for success (industrial safety green)
- Zinc/Neutral backgrounds (steel, concrete)
- No blue/indigo colors
- Border radius: rounded-xl, rounded-2xl, rounded-3xl

## Integration with Existing System

### No Conflicts
- All routes under `/simple/*` namespace
- Separate database models (QuickCheck, Story)
- Existing User model extended (backward compatible)
- Existing routes unchanged: `/detection`, `/dashboard`, `/demo`, etc.

### Shared Resources
- Same Prisma database
- Same authentication patterns (can be enhanced)
- Same design system (nature-inspired gradients)

## Next Steps for Production

1. **Database Migration**
   ```bash
   npx prisma migrate dev --name add_simple_system
   npx prisma generate
   ```

2. **Replace Mock AI**
   - Update `/api/simple/check/route.ts`
   - Integrate actual YOLO model for weld/etching detection

3. **Add Real Authentication**
   - Implement OTP via SMS/Email
   - Replace localStorage with JWT tokens
   - Add session management

4. **File Upload**
   - Add cloud storage (S3, Cloudinary)
   - Update API routes to handle actual file uploads

5. **PDF Generation**
   - Implement actual PDF report generation
   - Add charts and detailed statistics

6. **Offline Support**
   - Add PWA manifest
   - Implement service worker
   - Cache uploads for later sync

## Testing

### Manual Testing Flow
1. Visit `/simple`
2. Click "Try Weld Demo"
3. Upload any image
4. See instant mock results
5. Click "Sign Up Free"
6. Select Worker or Boss
7. Enter phone number
8. Access dashboard
9. Upload photo, see results
10. Try Share Story
11. If Boss: Access Reports

### User Types to Test
- Anonymous visitor (demo only)
- Worker (basic features)
- Boss (all features + reports)

## Performance
- Minimal bundle size (no heavy dependencies)
- Fast page loads (< 2s)
- Instant UI feedback
- Mock AI response: 1.5-2s

## Accessibility
- Large touch targets (min 44x44px)
- High contrast text
- Clear visual hierarchy
- Simple language (no jargon)
- Bilingual support

## Success Metrics
- Time to first check: < 30 seconds
- Clicks per check: 1-2 maximum
- User retention: Track daily active users
- Story submissions: Community engagement
- Carbon savings: Environmental impact

# Google OAuth2 Setup Guide for Chitti AI NDT

## Quick Start (5 Minutes)

Follow these steps to enable Google Sign-In for your app:

---

## 1. Create Google OAuth Credentials

### Step 1: Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### Step 2: Create/Select a Project
1. Click on the project dropdown (top left)
2. Click **"New Project"**
3. Name it: **"Chitti AI NDT"**
4. Click **"Create"**

### Step 3: Enable Google+ API
1. Go to **"APIs & Services" → "Library"**
2. Search for **"Google+ API"**
3. Click **"Enable"**

### Step 4: Configure OAuth Consent Screen
1. Go to **"APIs & Services" → "OAuth consent screen"**
2. Select **"External"** (unless you have Google Workspace)
3. Click **"Create"**

**Fill in the required fields:**
- **App name**: `Chitti AI NDT`
- **User support email**: Your email
- **App logo**: (Optional) Upload your logo
- **Application home page**: `http://localhost:3000` (or your domain)
- **Authorized domains**: 
  - For local: Leave empty
  - For production: `your-domain.com`
- **Developer contact information**: Your email

4. Click **"Save and Continue"**
5. Skip "Scopes" → Click **"Save and Continue"**
6. Add test users (your Gmail) → Click **"Save and Continue"**
7. Review and click **"Back to Dashboard"**

### Step 5: Create OAuth 2.0 Credentials
1. Go to **"APIs & Services" → "Credentials"**
2. Click **"+ Create Credentials" → "OAuth client ID"**
3. Select **"Web application"**

**Configure:**
- **Name**: `Chitti Web App`
- **Authorized JavaScript origins**:
  ```
  http://localhost:3000
  ```
  (For production, add: `https://your-app.vercel.app`)

- **Authorized redirect URIs**:
  ```
  http://localhost:3000/api/auth/callback/google
  ```
  (For production, add: `https://your-app.vercel.app/api/auth/callback/google`)

4. Click **"Create"**
5. **COPY** your Client ID and Client Secret (you'll need these!)

---

## 2. Configure Environment Variables

### Step 1: Copy `.env.example` to `.env.local`
```bash
cp .env.example .env.local
```

### Step 2: Edit `.env.local`
```bash
# NextAuth Secret (Generate a random secret)
NEXTAUTH_SECRET=your-generated-secret-here

# NextAuth URL
NEXTAUTH_URL=http://localhost:3000

# Google OAuth Credentials (FROM GOOGLE CLOUD CONSOLE)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Generate NEXTAUTH_SECRET
Run this command:
```bash
openssl rand -base64 32
```

Or use Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and paste it as `NEXTAUTH_SECRET`

---

## 3. Install Dependencies

```bash
npm install next-auth
```

---

## 4. Update Your Layout (Wrap with AuthProvider)

Edit `app/layout.tsx`:

```tsx
import { AuthProvider } from '@/components/auth/AuthProvider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

---

## 5. Add User Profile to Your Navbar

Edit your navbar component to include the UserProfile:

```tsx
import { UserProfile } from '@/components/auth/UserProfile'

export function Navbar() {
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {/* Your logo and nav items */}
          </div>
          
          {/* Add this */}
          <UserProfile />
        </div>
      </div>
    </nav>
  )
}
```

---

## 6. Test It!

### Step 1: Start Development Server
```bash
npm run dev
```

### Step 2: Visit Sign-In Page
Navigate to: http://localhost:3000/auth/signin

### Step 3: Click "Continue with Google"
You should see the Google OAuth consent screen

### Step 4: Sign In
- Select your Google account
- Grant permissions
- You'll be redirected back to your app!

---

## 7. Protected Routes

The middleware is already configured to protect these routes:
- `/dashboard/*`
- `/detection/*`
- `/unified-detection/*`
- `/admin/*`

Unauthenticated users will be redirected to `/auth/signin`

---

## 8. Production Deployment (Vercel)

### Step 1: Add Production Redirect URI
In Google Cloud Console → Credentials → Your OAuth Client:

Add authorized redirect URI:
```
https://your-app.vercel.app/api/auth/callback/google
```

### Step 2: Add Environment Variables to Vercel
In Vercel Dashboard → Your Project → Settings → Environment Variables:

Add:
- `NEXTAUTH_SECRET` → (same secret from local)
- `NEXTAUTH_URL` → `https://your-app.vercel.app`
- `GOOGLE_CLIENT_ID` → (from Google Console)
- `GOOGLE_CLIENT_SECRET` → (from Google Console)

### Step 3: Deploy
```bash
vercel --prod
```

---

## Usage in Components

### Get Current User (Client Component)
```tsx
'use client'
import { useSession } from 'next-auth/react'

export function MyComponent() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <div>Loading...</div>
  if (!session) return <div>Please sign in</div>

  return (
    <div>
      <p>Welcome, {session.user?.name}!</p>
      <img src={session.user?.image} alt="Profile" />
    </div>
  )
}
```

### Get Current User (Server Component)
```tsx
import { auth } from '@/auth'

export default async function MyPage() {
  const session = await auth()

  if (!session) {
    return <div>Not authenticated</div>
  }

  return <div>Welcome, {session.user?.name}!</div>
}
```

### Sign Out
```tsx
'use client'
import { signOut } from 'next-auth/react'

export function SignOutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: '/' })}>
      Sign Out
    </button>
  )
}
```

---

## Troubleshooting

### Error: "redirect_uri_mismatch"
**Solution**: Make sure the redirect URI in Google Console exactly matches:
```
http://localhost:3000/api/auth/callback/google
```

### Error: "Access blocked: This app's request is invalid"
**Solution**: 
1. Check that Google+ API is enabled
2. Verify OAuth consent screen is configured
3. Make sure you're using a test user account

### Sign in works locally but not on Vercel
**Solution**:
1. Add production redirect URI to Google Console
2. Set environment variables in Vercel
3. Make sure `NEXTAUTH_URL` is set to your production URL

### Session is null even after signing in
**Solution**:
1. Check `NEXTAUTH_SECRET` is set
2. Clear browser cookies
3. Restart dev server

---

## Security Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore` by default
2. **Use different credentials** for development and production
3. **Rotate secrets periodically** 
4. **Limit OAuth scopes** to only what you need
5. **Enable 2FA** on your Google Cloud account

---

## Features Included

✅ **Google OAuth Sign-In** - One-click authentication  
✅ **Session Management** - JWT-based sessions  
✅ **Protected Routes** - Middleware-based protection  
✅ **User Profile** - Display user info and avatar  
✅ **Sign Out** - Clean session termination  
✅ **Responsive UI** - Beautiful sign-in page  
✅ **Production Ready** - Works on Vercel/Netlify/etc  

---

## Next Steps

1. **Customize the sign-in page** - Edit `app/auth/signin/page.tsx`
2. **Add more providers** - GitHub, Facebook, etc.
3. **Store user data** - Save to database on first sign-in
4. **Add role-based access** - Admin, inspector, manager roles
5. **Implement refresh tokens** - For long-lived sessions

---

## Support

- NextAuth Docs: https://next-auth.js.org/
- Google OAuth Guide: https://developers.google.com/identity/protocols/oauth2
- Issues: Check the troubleshooting section above

Happy authenticating! 🎉

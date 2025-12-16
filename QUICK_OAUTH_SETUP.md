# Quick OAuth Setup Guide

Your Google OAuth Client ID is already configured!

**Client ID:**
```
278114676907-8eqtrlda2voblimoq5ed676ogdl5nsic.apps.googleusercontent.com
```

---

## 🚀 Quick Setup (2 Minutes)

### Option 1: Automated Setup (Recommended)

**Windows:**
```bash
setup-env.bat
```

**Mac/Linux:**
```bash
chmod +x setup-env.sh
./setup-env.sh
```

This script will:
1. ✅ Auto-generate `NEXTAUTH_SECRET`
2. ✅ Set your Google Client ID
3. ✅ Ask for your Google Client Secret
4. ✅ Create `.env.local` file

---

### Option 2: Manual Setup

1. **Get your Google Client Secret** from Google Cloud Console:
   - Go to https://console.cloud.google.com/apis/credentials
   - Find your OAuth 2.0 Client ID
   - Click "Show secret" or download JSON

2. **Generate NextAuth Secret:**
   ```bash
   # Windows (PowerShell)
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   
   # Mac/Linux
   openssl rand -base64 32
   ```

3. **Create `.env.local`** file manually:
   ```bash
   # Copy from .env.example
   cp .env.example .env.local
   ```

4. **Edit `.env.local`** and update:
   ```bash
   NEXTAUTH_SECRET=<paste-generated-secret>
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=278114676907-8eqtrlda2voblimoq5ed676ogdl5nsic.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=<paste-your-secret>
   ```

---

## ⚙️ Add Authorized Redirect URI

In Google Cloud Console → Credentials → Your OAuth Client ID:

Add this redirect URI:
```
http://localhost:3000/api/auth/callback/google
```

For production (Vercel):
```
https://your-app.vercel.app/api/auth/callback/google
```

---

## 🧪 Test It

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start dev server:**
   ```bash
   npm run dev
   ```

3. **Visit sign-in page:**
   ```
   http://localhost:3000/auth/signin
   ```

4. **Click "Continue with Google"**
   - You'll see Google's consent screen
   - Sign in with your Google account
   - You'll be redirected back to your app!

---

## ✅ Checklist

- [x] Google Client ID configured
- [ ] Get Google Client Secret from console
- [ ] Run setup script OR create .env.local manually
- [ ] Add redirect URI in Google Console
- [ ] Install dependencies (`npm install`)
- [ ] Test sign-in

---

## 📚 Need Help?

See full guide: [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)

## 🎉 You're Almost There!

Just need to:
1. Get your Google Client Secret
2. Run `setup-env.bat` (Windows) or `./setup-env.sh` (Mac/Linux)
3. Add redirect URI in Google Console
4. Start testing! 🚀

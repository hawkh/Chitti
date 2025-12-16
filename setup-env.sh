#!/bin/bash

# Chitti AI NDT - Environment Setup Script
# This script helps you set up your .env.local file with OAuth credentials

echo "🚀 Chitti AI NDT - Environment Setup"
echo "===================================="
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "⚠️  .env.local already exists!"
    read -p "Do you want to overwrite it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborting. Your existing .env.local was not modified."
        exit 0
    fi
fi

echo "📝 Setting up environment variables..."
echo ""

# Generate NextAuth secret
echo "🔐 Generating NEXTAUTH_SECRET..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "✅ Secret generated"
echo ""

# Google OAuth Client ID (already provided)
GOOGLE_CLIENT_ID="278114676907-8eqtrlda2voblimoq5ed676ogdl5nsic.apps.googleusercontent.com"
echo "✅ Google Client ID: $GOOGLE_CLIENT_ID"
echo ""

# Ask for Google Client Secret
echo "🔑 Please enter your Google Client Secret"
echo "(You can find this in Google Cloud Console → Credentials)"
read -p "Google Client Secret: " GOOGLE_CLIENT_SECRET
echo ""

# Create .env.local
cat > .env.local << EOF
DATABASE_URL="postgresql://user:password@localhost:5432/chitti_ndt?schema=public"
REDIS_URL="redis://localhost:6379"
NEXT_PUBLIC_PYTHON_API_URL="http://localhost:5000"

# ========================================
# Google OAuth2 Configuration
# ========================================

# NextAuth Secret (Auto-generated)
NEXTAUTH_SECRET=$NEXTAUTH_SECRET

# NextAuth URL (Change for production)
NEXTAUTH_URL=http://localhost:3000

# Google OAuth Credentials
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET

# ========================================
# Unified Detection Configuration
# ========================================

# Detection Mode: tfjs (client-side), backend (server API), or mock (testing)
NEXT_PUBLIC_DETECTION_MODE=tfjs

# TensorFlow.js Model URL (for client-side detection)
NEXT_PUBLIC_TFJS_MODEL_URL=/models/yolo-defect-detector/tfjs_model/model.json

# Backend Detection API URL (for backend mode)
NEXT_PUBLIC_BACKEND_DETECTION_URL=/api/detect

# Analytics (optional)
NEXT_PUBLIC_ENABLE_ANALYTICS=false
EOF

echo "✅ .env.local created successfully!"
echo ""
echo "📋 Summary:"
echo "  • NEXTAUTH_SECRET: ✅ Generated"
echo "  • NEXTAUTH_URL: http://localhost:3000"
echo "  • GOOGLE_CLIENT_ID: ✅ Set"
echo "  • GOOGLE_CLIENT_SECRET: ✅ Set"
echo ""
echo "🎉 Setup complete! You can now run:"
echo "   npm install"
echo "   npm run dev"
echo ""
echo "🌐 Visit http://localhost:3000/auth/signin to test Google Sign-In!"

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/dashboard');
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      alert('Login failed');
    }
  };

  const handleGoogleLogin = () => {
    localStorage.setItem('user', JSON.stringify({ email: 'user@gmail.com', role: 'user' }));
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-neutral-900 to-stone-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-zinc-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-800 p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-gradient-to-br from-orange-600 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/50">
                <LogIn className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-amber-200 to-orange-100 bg-clip-text text-transparent mb-2">Welcome Back</h1>
            <p className="text-amber-300">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-amber-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-amber-100 placeholder-amber-700 focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-600" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-amber-100 placeholder-amber-700 focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-600 to-rose-600 text-white py-3 rounded-xl font-semibold hover:from-orange-500 hover:to-rose-500 transition-all shadow-lg hover:shadow-orange-600/50"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-zinc-900 text-amber-400">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="mt-4 w-full flex items-center justify-center gap-3 bg-white text-gray-900 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-center text-sm text-amber-400">
              Don't have an account?{' '}
              <Link href="/signup" className="text-orange-500 hover:text-orange-400 font-semibold">
                Sign up
              </Link>
            </p>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-zinc-900 text-amber-500">Quick Demo</span>
              </div>
            </div>

            <Link 
              href="/demo-login"
              className="block w-full text-center py-2 px-4 bg-blue-900/30 border border-blue-700 text-blue-300 rounded-xl hover:bg-blue-900/50 transition-all text-sm font-medium"
            >
              🚀 Try Demo Mode (No Database Required)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

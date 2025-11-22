'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

export default function DemoLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        localStorage.setItem('demo', 'true');
        router.push('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Login failed - please try again');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { email: 'admin@demo.com', password: 'admin123', role: 'Admin' },
    { email: 'inspector@demo.com', password: 'inspector123', role: 'Inspector' },
    { email: 'manager@demo.com', password: 'manager123', role: 'Manager' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-neutral-900 to-stone-950 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-zinc-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-800 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-gradient-to-br from-orange-600 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/50">
                <LogIn className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-amber-200 to-orange-100 bg-clip-text text-transparent mb-2">
              Demo Login
            </h1>
            <p className="text-amber-300">No database required - instant access</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Login Form */}
            <div>
              <h2 className="text-xl font-bold text-amber-200 mb-4">Sign In</h2>
              
              {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg flex items-center gap-2 text-red-300">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-amber-300 mb-2">Email</label>
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
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-600 to-rose-600 text-white py-3 rounded-xl font-semibold hover:from-orange-500 hover:to-rose-500 transition-all shadow-lg hover:shadow-orange-600/50 disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-amber-400">
                Need database login?{' '}
                <Link href="/login" className="text-orange-500 hover:text-orange-400 font-semibold">
                  Use regular login
                </Link>
              </p>
            </div>

            {/* Demo Accounts */}
            <div>
              <h2 className="text-xl font-bold text-amber-200 mb-4">Demo Accounts</h2>
              <div className="space-y-3">
                {demoAccounts.map((account) => (
                  <div
                    key={account.email}
                    className="p-4 bg-zinc-950/50 border border-zinc-700 rounded-xl hover:border-orange-600 transition-colors cursor-pointer"
                    onClick={() => {
                      setEmail(account.email);
                      setPassword(account.password);
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-amber-200">{account.role}</span>
                      <span className="text-xs text-amber-500 bg-amber-900/30 px-2 py-1 rounded">
                        Click to use
                      </span>
                    </div>
                    <div className="text-sm text-amber-400">
                      <div>Email: <span className="text-amber-300">{account.email}</span></div>
                      <div>Password: <span className="text-amber-300">{account.password}</span></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-xl">
                <h3 className="font-semibold text-blue-300 mb-2">ℹ️ Demo Mode</h3>
                <ul className="text-sm text-blue-200 space-y-1">
                  <li>• No database required</li>
                  <li>• Instant access</li>
                  <li>• Data not persisted</li>
                  <li>• Perfect for testing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, User, Shield, UserCheck } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: (user: any, token: string) => void;
  redirectTo?: string;
}

export default function LoginForm({ onSuccess, redirectTo = '/audit/dashboard' }: LoginFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Store token in localStorage
        localStorage.setItem('audit_token', data.token);
        localStorage.setItem('audit_user', JSON.stringify(data.user));

        if (onSuccess) {
          onSuccess(data.user, data.token);
        } else {
          // Redirect based on user type
          if (data.user.userType === 'INSPECTOR') {
            router.push('/audit/inspector');
          } else if (data.user.userType === 'MANAGER') {
            router.push('/audit/manager');
          } else if (data.user.userType === 'ADMIN') {
            router.push('/audit/admin');
          } else {
            router.push(redirectTo);
          }
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getRoleIcon = (userType: string) => {
    switch (userType) {
      case 'INSPECTOR':
        return <UserCheck className="h-5 w-5" />;
      case 'MANAGER':
        return <User className="h-5 w-5" />;
      case 'ADMIN':
        return <Shield className="h-5 w-5" />;
      default:
        return <LogIn className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/50">
                <LogIn className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">ISO Audit System</h1>
            <p className="text-blue-200">Sign in to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-300" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-300" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <LogIn className="h-5 w-5 mr-2" />
                  Sign In
                </div>
              )}
            </button>
          </form>

          {/* Role Information */}
          <div className="mt-8 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <h3 className="text-sm font-medium text-blue-200 mb-2">User Roles:</h3>
            <div className="space-y-1 text-xs text-blue-300">
              <div className="flex items-center">
                <UserCheck className="h-4 w-4 mr-2" />
                <span>Inspector - Create and submit audits</span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span>Manager - Review and approve audits</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                <span>Admin - Full system access</span>
              </div>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
            <p className="text-xs text-green-200 text-center">
              Demo: Use any email with password "demo123"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { 
  ClipboardCheck, 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Settings, 
  Users,
  Repeat,
  Target,
  Wifi,
  Shield
} from 'lucide-react';
import { pwaManager } from '@/lib/audit/pwa-register';

export default function AuditDashboard() {
  useEffect(() => {
    // Register service worker
    if (typeof window !== 'undefined') {
      pwaManager.register();
    }
  }, []);

  const inspectorFeatures = [
    {
      title: 'New Audit',
      description: 'Create ISO 9001:2015 audit with offline support',
      icon: ClipboardCheck,
      href: '/audit/inspector',
      color: 'blue',
      badge: 'Offline Ready'
    },
    {
      title: 'Form Demo',
      description: 'Interactive demo of audit form features',
      icon: FileText,
      href: '/audit/form-demo',
      color: 'indigo'
    },
    {
      title: 'My Profile',
      description: 'View and update your profile settings',
      icon: Users,
      href: '/audit/profile',
      color: 'purple'
    }
  ];

  const managerFeatures = [
    {
      title: 'Manager Dashboard',
      description: 'Review pending audits and team metrics',
      icon: BarChart3,
      href: '/audit/manager/dashboard',
      color: 'green'
    },
    {
      title: 'Compliance Analytics',
      description: 'Site comparison and benchmarking',
      icon: TrendingUp,
      href: '/audit/manager/analytics',
      color: 'emerald'
    },
    {
      title: 'Compliance Scores',
      description: 'View compliance trends and benchmarks',
      icon: Target,
      href: '/audit/compliance',
      color: 'teal'
    },
    {
      title: 'Trend Monitoring',
      description: 'Monitor performance trends and alerts',
      icon: TrendingUp,
      href: '/audit/trends',
      color: 'cyan'
    }
  ];

  const pdcaFeatures = [
    {
      title: 'PDCA Dashboard',
      description: 'Plan-Do-Check-Act methodology tracking',
      icon: Repeat,
      href: '/audit/pdca',
      color: 'orange'
    },
    {
      title: 'PDCA Analytics',
      description: 'Analyze PDCA cycle completion and trends',
      icon: BarChart3,
      href: '/audit/pdca/analytics',
      color: 'amber'
    },
    {
      title: 'Improvement Actions',
      description: 'Track continuous improvement initiatives',
      icon: Target,
      href: '/audit/improvement',
      color: 'yellow'
    }
  ];

  const adminFeatures = [
    {
      title: 'Admin Panel',
      description: 'Manage users, sites, and system settings',
      icon: Shield,
      href: '/audit/admin',
      color: 'red'
    },
    {
      title: 'Checklist Config',
      description: 'Configure ISO 9001 checklist items',
      icon: Settings,
      href: '/audit/checklist-config',
      color: 'pink'
    }
  ];

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    indigo: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    emerald: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
    teal: 'from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700',
    cyan: 'from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700',
    orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
    amber: 'from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700',
    yellow: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
    red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
    pink: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ISO Audit Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Digital compliance management system
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Wifi className="h-4 w-4 text-green-600" />
              <span className="text-gray-600">System Online</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Inspector Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <ClipboardCheck className="h-6 w-6 mr-2 text-blue-600" />
            Inspector Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inspectorFeatures.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[feature.color as keyof typeof colorClasses]} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[feature.color as keyof typeof colorClasses]} text-white`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    {feature.badge && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Manager Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-6 w-6 mr-2 text-green-600" />
            Manager Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {managerFeatures.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[feature.color as keyof typeof colorClasses]} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className="p-6">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[feature.color as keyof typeof colorClasses]} text-white mb-4 inline-block`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* PDCA Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Repeat className="h-6 w-6 mr-2 text-orange-600" />
            PDCA & Continuous Improvement
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pdcaFeatures.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[feature.color as keyof typeof colorClasses]} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className="p-6">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[feature.color as keyof typeof colorClasses]} text-white mb-4 inline-block`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Admin Features */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <Shield className="h-6 w-6 mr-2 text-red-600" />
            Administration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminFeatures.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[feature.color as keyof typeof colorClasses]} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className="p-6">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[feature.color as keyof typeof colorClasses]} text-white mb-4 inline-block`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="mt-12">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">System Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <Wifi className="h-5 w-5 mr-2" />
                  Offline Support
                </h3>
                <p className="text-blue-100 text-sm">
                  Work without internet. Automatic sync when online.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Compliance Tracking
                </h3>
                <p className="text-blue-100 text-sm">
                  Real-time scoring and benchmarking across sites.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <Repeat className="h-5 w-5 mr-2" />
                  PDCA Methodology
                </h3>
                <p className="text-blue-100 text-sm">
                  Systematic continuous improvement tracking.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

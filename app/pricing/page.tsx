import { Check } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-white mb-6 text-center">Pricing Plans</h1>
        <p className="text-xl text-gray-300 mb-12 text-center max-w-2xl mx-auto">
          Choose the plan that fits your quality control needs
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
            <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
            <p className="text-gray-400 mb-6">For small teams testing AI inspection</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">$499</span>
              <span className="text-gray-400">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                Up to 1,000 inspections/month
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                Standard detection models
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                PDF/CSV exports
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                Email support
              </li>
            </ul>
            <Link href="/contact" className="block text-center px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 font-semibold">
              Get Started
            </Link>
          </div>

          <div className="bg-gradient-to-b from-blue-600 to-blue-700 rounded-lg p-8 border-2 border-blue-400 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-400 text-blue-900 px-4 py-1 rounded-full text-sm font-bold">
              POPULAR
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
            <p className="text-blue-100 mb-6">For growing manufacturing operations</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">$1,499</span>
              <span className="text-blue-100">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2 text-white">
                <Check className="h-5 w-5 text-blue-200 flex-shrink-0 mt-0.5" />
                Up to 10,000 inspections/month
              </li>
              <li className="flex items-start gap-2 text-white">
                <Check className="h-5 w-5 text-blue-200 flex-shrink-0 mt-0.5" />
                Advanced detection models
              </li>
              <li className="flex items-start gap-2 text-white">
                <Check className="h-5 w-5 text-blue-200 flex-shrink-0 mt-0.5" />
                Custom component profiles
              </li>
              <li className="flex items-start gap-2 text-white">
                <Check className="h-5 w-5 text-blue-200 flex-shrink-0 mt-0.5" />
                API access
              </li>
              <li className="flex items-start gap-2 text-white">
                <Check className="h-5 w-5 text-blue-200 flex-shrink-0 mt-0.5" />
                Priority support
              </li>
            </ul>
            <Link href="/contact" className="block text-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold">
              Start Trial
            </Link>
          </div>

          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
            <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
            <p className="text-gray-400 mb-6">For large-scale production lines</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">Custom</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                Unlimited inspections
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                Custom model training
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                On-premise deployment
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                SSO/SAML integration
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                Dedicated support & SLA
              </li>
            </ul>
            <Link href="/contact" className="block text-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold">
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

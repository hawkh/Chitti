import { Check } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-neutral-900 to-stone-950">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-200 via-orange-100 to-amber-300 bg-clip-text text-transparent mb-6 text-center">Pricing</h1>
        <p className="text-xl text-amber-200 mb-12 text-center max-w-2xl mx-auto">
          Currently in R&D and pilot stage. Contact us for custom pricing and pilot programs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-amber-100 mb-2">Starter</h3>
            <p className="text-amber-300 mb-6">For small teams testing AI inspection</p>
            <div className="mb-6">
              <span className="text-2xl font-bold text-amber-100">Contact for Pricing</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2 text-amber-200">
                <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                Up to 1,000 inspections/month
              </li>
              <li className="flex items-start gap-2 text-amber-200">
                <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                Standard detection models
              </li>
              <li className="flex items-start gap-2 text-amber-200">
                <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                PDF/CSV exports
              </li>
              <li className="flex items-start gap-2 text-amber-200">
                <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                Email support
              </li>
            </ul>
            <Link href="/contact" className="block text-center px-6 py-3 bg-zinc-800 text-amber-100 rounded-xl hover:bg-zinc-700 font-semibold border border-zinc-700">
              Contact Us
            </Link>
          </div>

          <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 rounded-2xl p-8 border-2 border-amber-500 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold">
              POPULAR
            </div>
            <h3 className="text-2xl font-bold text-amber-100 mb-2">Professional</h3>
            <p className="text-amber-200 mb-6">For growing manufacturing operations</p>
            <div className="mb-6">
              <span className="text-2xl font-bold text-amber-100">Pilot Program</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2 text-amber-100">
                <Check className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                Up to 10,000 inspections/month
              </li>
              <li className="flex items-start gap-2 text-amber-100">
                <Check className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                Advanced detection models
              </li>
              <li className="flex items-start gap-2 text-amber-100">
                <Check className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                Custom component profiles
              </li>
              <li className="flex items-start gap-2 text-amber-100">
                <Check className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                API access
              </li>
              <li className="flex items-start gap-2 text-amber-100">
                <Check className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                Priority support
              </li>
            </ul>
            <Link href="/contact" className="block text-center px-6 py-3 bg-white text-orange-600 rounded-xl hover:bg-amber-50 font-semibold shadow-lg">
              Join Pilot
            </Link>
          </div>

          <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-amber-100 mb-2">Enterprise</h3>
            <p className="text-amber-300 mb-6">For large-scale production lines</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-amber-100">Custom</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2 text-amber-200">
                <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                Unlimited inspections
              </li>
              <li className="flex items-start gap-2 text-amber-200">
                <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                Custom model training
              </li>
              <li className="flex items-start gap-2 text-amber-200">
                <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                On-premise deployment
              </li>
              <li className="flex items-start gap-2 text-amber-200">
                <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                SSO/SAML integration
              </li>
              <li className="flex items-start gap-2 text-amber-200">
                <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                Dedicated support & SLA
              </li>
            </ul>
            <Link href="/contact" className="block text-center px-6 py-3 bg-gradient-to-r from-orange-600 to-rose-600 text-white rounded-xl hover:from-orange-500 hover:to-rose-500 font-semibold shadow-lg">
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

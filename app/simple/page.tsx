'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Camera, Zap, TrendingUp, Leaf } from 'lucide-react';

export default function SimpleLanding() {
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  const t = {
    en: {
      hero: 'Photo Your Weld or Wafer – Get Fix in Seconds',
      sub: 'Save ₹10K rework + 500kg CO₂ per check',
      weldDemo: 'Try Weld Demo',
      etchDemo: 'Try Etching Demo',
      signup: 'Sign Up Free',
      footer: 'For Small Shops, Big Wins'
    },
    hi: {
      hero: 'अपनी वेल्ड या वेफर की फोटो लें – सेकंड में सुधार पाएं',
      sub: '₹10K रीवर्क बचाएं + 500kg CO₂ प्रति जांच',
      weldDemo: 'वेल्ड डेमो आज़माएं',
      etchDemo: 'एचिंग डेमो आज़माएं',
      signup: 'मुफ्त साइन अप करें',
      footer: 'छोटी दुकानों के लिए, बड़ी जीत'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-neutral-900 to-stone-950">
      <header className="p-4 flex justify-between items-center border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Zap className="h-8 w-8 text-amber-500" />
          <span className="text-2xl font-bold text-amber-100">Chitti.Ai</span>
        </div>
        <button
          onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
          className="px-4 py-2 bg-zinc-800 text-amber-100 rounded-xl border border-zinc-700 hover:bg-zinc-700"
        >
          {lang === 'en' ? 'हिंदी' : 'English'}
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-black text-amber-100 mb-6">
            {t[lang].hero}
          </h1>
          <p className="text-2xl text-amber-300 mb-8">
            {t[lang].sub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Link
            href="/simple/demo?type=weld"
            className="group p-8 bg-gradient-to-br from-orange-600/20 to-rose-600/20 border-2 border-orange-500 rounded-3xl hover:scale-105 transition-all"
          >
            <Camera className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <span className="text-2xl font-bold text-amber-100">{t[lang].weldDemo}</span>
          </Link>

          <Link
            href="/simple/demo?type=etching"
            className="group p-8 bg-gradient-to-br from-amber-600/20 to-orange-600/20 border-2 border-amber-500 rounded-3xl hover:scale-105 transition-all"
          >
            <TrendingUp className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <span className="text-2xl font-bold text-amber-100">{t[lang].etchDemo}</span>
          </Link>

          <Link
            href="/simple/login"
            className="group p-8 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border-2 border-emerald-500 rounded-3xl hover:scale-105 transition-all"
          >
            <Leaf className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
            <span className="text-2xl font-bold text-amber-100">{t[lang].signup}</span>
          </Link>
        </div>

        <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8">
          <p className="text-amber-200 text-lg">{t[lang].footer}</p>
        </div>
      </main>
    </div>
  );
}

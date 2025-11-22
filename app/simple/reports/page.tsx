'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Calendar, TrendingUp, DollarSign, Leaf, BarChart3 } from 'lucide-react';

export default function Reports() {
  const router = useRouter();
  const [month, setMonth] = useState('2025-11');
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  useEffect(() => {
    const user = localStorage.getItem('simpleUser');
    if (!user) {
      router.push('/simple/login');
      return;
    }
    const parsed = JSON.parse(user);
    if (parsed.userType !== 'BOSS') {
      router.push('/simple/dashboard');
    }
    setLang(parsed.lang || 'en');
  }, [router]);

  const t = {
    en: {
      title: 'Monthly Audit',
      select: 'Select Month',
      passRate: 'Pass Rate',
      saved: 'Material Saved',
      carbon: 'CO₂ Cut',
      download: 'Download PDF – Ready for Tender',
      weldSafe: 'Welds Safe',
      etchVoids: 'Etching Voids',
      back: 'Back to Dashboard'
    },
    hi: {
      title: 'मासिक ऑडिट',
      select: 'महीना चुनें',
      passRate: 'पास दर',
      saved: 'सामग्री बचाई',
      carbon: 'CO₂ कटौती',
      download: 'PDF डाउनलोड करें – टेंडर के लिए तैयार',
      weldSafe: 'वेल्ड सुरक्षित',
      etchVoids: 'एचिंग वॉइड्स',
      back: 'डैशबोर्ड पर वापस'
    }
  };

  const stats = {
    passRate: 85,
    saved: 15000,
    carbon: 2000,
    weldSafe: 92,
    etchVoids: 8
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-neutral-900 to-stone-950 p-4">
      <div className="max-w-5xl mx-auto pt-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/simple/dashboard')}
            className="text-amber-400 hover:text-amber-300 font-semibold"
          >
            ← {t[lang].back}
          </button>
        </div>

        <div className="bg-zinc-900/60 backdrop-blur-xl rounded-3xl border border-zinc-800 p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-black text-amber-100">{t[lang].title} – Nov 2025</h1>
            <button
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="px-3 py-2 bg-zinc-800 text-amber-100 rounded-lg text-sm"
            >
              {lang === 'en' ? 'हिं' : 'En'}
            </button>
          </div>

          <div className="mb-8">
            <label className="block text-amber-300 mb-3 text-lg font-semibold">{t[lang].select}</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-amber-600" />
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full pl-14 pr-4 py-4 bg-zinc-950 border-2 border-zinc-700 rounded-2xl text-amber-100 text-lg focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border-2 border-emerald-500 rounded-2xl p-6">
              <TrendingUp className="h-12 w-12 text-emerald-500 mb-3" />
              <div className="text-sm text-emerald-400 mb-1">{t[lang].passRate}</div>
              <div className="text-5xl font-black text-amber-100">{stats.passRate}%</div>
            </div>

            <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 border-2 border-amber-500 rounded-2xl p-6">
              <DollarSign className="h-12 w-12 text-amber-500 mb-3" />
              <div className="text-sm text-amber-400 mb-1">{t[lang].saved}</div>
              <div className="text-5xl font-black text-amber-100">₹{stats.saved.toLocaleString()}</div>
            </div>

            <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border-2 border-emerald-500 rounded-2xl p-6">
              <Leaf className="h-12 w-12 text-emerald-500 mb-3" />
              <div className="text-sm text-emerald-400 mb-1">{t[lang].carbon}</div>
              <div className="text-5xl font-black text-amber-100">{stats.carbon}kg</div>
            </div>
          </div>

          <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="h-8 w-8 text-amber-500" />
              <h3 className="text-xl font-bold text-amber-100">Performance Chart</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-amber-300 font-semibold">{t[lang].weldSafe}</span>
                  <span className="text-amber-100 font-bold">{stats.weldSafe}%</span>
                </div>
                <div className="h-4 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-600" style={{ width: `${stats.weldSafe}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-amber-300 font-semibold">{t[lang].etchVoids}</span>
                  <span className="text-amber-100 font-bold">{stats.etchVoids}%</span>
                </div>
                <div className="h-4 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-rose-600 to-red-600" style={{ width: `${stats.etchVoids}%` }} />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => alert('PDF download started!')}
            className="w-full py-5 bg-gradient-to-r from-orange-600 to-rose-600 text-white rounded-2xl font-black text-xl hover:from-orange-500 hover:to-rose-500 transition-all shadow-lg"
          >
            <Download className="inline h-6 w-6 mr-2" />
            {t[lang].download}
          </button>
        </div>
      </div>
    </div>
  );
}

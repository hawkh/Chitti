'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Mail, Zap } from 'lucide-react';

export default function SimpleLogin() {
  const router = useRouter();
  const [contact, setContact] = useState('');
  const [userType, setUserType] = useState<'WORKER' | 'BOSS'>('WORKER');
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  const t = {
    en: {
      title: 'Start Free',
      phone: 'Phone or Email',
      worker: 'Worker',
      boss: 'Boss',
      start: 'Start Free',
      back: 'Back'
    },
    hi: {
      title: 'मुफ्त शुरू करें',
      phone: 'फोन या ईमेल',
      worker: 'कार्यकर्ता',
      boss: 'बॉस',
      start: 'मुफ्त शुरू करें',
      back: 'वापस'
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate contact
    if (!contact || contact.trim().length === 0) {
      alert(lang === 'en' ? 'Please enter phone or email' : 'कृपया फोन या ईमेल दर्ज करें');
      return;
    }

    const cleaned = contact.replace(/\D/g, '');
    const isPhone = cleaned.length >= 10;
    const isEmail = contact.includes('@');

    if (!isPhone && !isEmail) {
      alert(lang === 'en' ? 'Invalid phone or email' : 'अमान्य फोन या ईमेल');
      return;
    }

    if (isPhone && (cleaned.length < 10 || cleaned.length > 15)) {
      alert(lang === 'en' ? 'Phone number must be 10-15 digits' : 'फोन नंबर 10-15 अंकों का होना चाहिए');
      return;
    }

    try {
      localStorage.setItem('simpleUser', JSON.stringify({ contact, userType, lang }));
      router.push('/simple/dashboard');
    } catch (error) {
      alert(lang === 'en' ? 'Storage error. Please enable cookies.' : 'स्टोरेज त्रुटि। कृपया कुकीज़ सक्षम करें।');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-neutral-900 to-stone-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-zinc-900/60 backdrop-blur-xl rounded-3xl border border-zinc-800 p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <Zap className="h-10 w-10 text-amber-500" />
              <h1 className="text-3xl font-black text-amber-100">{t[lang].title}</h1>
            </div>
            <button
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="px-3 py-1 bg-zinc-800 text-amber-100 rounded-lg text-sm"
            >
              {lang === 'en' ? 'हिं' : 'En'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-amber-300 mb-2 text-lg font-semibold">{t[lang].phone}</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-amber-600" />
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 bg-zinc-950 border-2 border-zinc-700 rounded-2xl text-amber-100 text-lg placeholder-amber-700 focus:outline-none focus:border-orange-500"
                  placeholder="9876543210"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-amber-300 mb-3 text-lg font-semibold">Role</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setUserType('WORKER')}
                  className={`p-6 rounded-2xl border-2 font-bold text-lg transition-all ${
                    userType === 'WORKER'
                      ? 'bg-orange-600 border-orange-500 text-white'
                      : 'bg-zinc-800 border-zinc-700 text-amber-300'
                  }`}
                >
                  {t[lang].worker}
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('BOSS')}
                  className={`p-6 rounded-2xl border-2 font-bold text-lg transition-all ${
                    userType === 'BOSS'
                      ? 'bg-orange-600 border-orange-500 text-white'
                      : 'bg-zinc-800 border-zinc-700 text-amber-300'
                  }`}
                >
                  {t[lang].boss}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-5 bg-gradient-to-r from-orange-600 to-rose-600 text-white rounded-2xl font-black text-xl hover:from-orange-500 hover:to-rose-500 transition-all shadow-lg"
            >
              {t[lang].start}
            </button>
          </form>

          <a href="/simple" className="block text-center mt-6 text-amber-400 hover:text-amber-300">
            ← {t[lang].back}
          </a>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Zap, TrendingUp, Leaf, Share2, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SimpleDashboard() {
  const router = useRouter();
  const [checkType, setCheckType] = useState<'WELD' | 'ETCHING'>('WELD');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [userType, setUserType] = useState<'WORKER' | 'BOSS'>('WORKER');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const user = localStorage.getItem('simpleUser');
    if (!user) {
      router.push('/simple/login');
    } else {
      const parsed = JSON.parse(user);
      setLang(parsed.lang || 'en');
      setUserType(parsed.userType || 'WORKER');
    }
  }, [router]);

  const t = {
    en: {
      upload: 'Snap Photo Now',
      gallery: 'From Gallery',
      weld: 'Weld',
      etching: 'Etching',
      score: 'Score',
      safe: 'Safe',
      benchmark: 'You vs Avg',
      carbon: 'CO₂ Saved',
      tip: 'Fix Tip',
      share: 'Share Story',
      download: 'Download Report',
      logout: 'Logout'
    },
    hi: {
      upload: 'अभी फोटो लें',
      gallery: 'गैलरी से',
      weld: 'वेल्ड',
      etching: 'एचिंग',
      score: 'स्कोर',
      safe: 'सुरक्षित',
      benchmark: 'आप बनाम औसत',
      carbon: 'CO₂ बचाया',
      tip: 'सुधार टिप',
      share: 'कहानी साझा करें',
      download: 'रिपोर्ट डाउनलोड करें',
      logout: 'लॉगआउट'
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size === 0) {
      alert('File is empty');
      return;
    }
    if (file.size > maxSize) {
      alert('File too large (max 50MB)');
      return;
    }
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Invalid file type. Use JPEG, PNG, or WebP');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 30000)
      );
      
      const resultPromise = new Promise((resolve) => 
        setTimeout(() => {
          resolve({
            score: Math.min(100, Math.max(0, 92)),
            status: 'safe',
            benchmark: { user: 2, avg: 5 },
            carbonSaved: Math.max(0, 300),
            tip: checkType === 'WELD' ? 'Add 10V voltage' : 'Reduce etch time by 5s'
          });
        }, 2000)
      );

      const data = await Promise.race([resultPromise, timeoutPromise]);
      setResult(data);
    } catch (error) {
      alert('Upload failed. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-neutral-900 to-stone-950">
      <header className="p-4 flex justify-between items-center border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
            userType === 'WORKER' ? 'bg-orange-600' : 'bg-emerald-600'
          }`}>
            <span className="text-white font-bold">{userType === 'WORKER' ? 'W' : 'B'}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCheckType('WELD')}
              className={`px-4 py-2 rounded-xl font-semibold ${
                checkType === 'WELD'
                  ? 'bg-orange-600 text-white'
                  : 'bg-zinc-800 text-amber-300'
              }`}
            >
              {t[lang].weld}
            </button>
            <button
              onClick={() => setCheckType('ETCHING')}
              className={`px-4 py-2 rounded-xl font-semibold ${
                checkType === 'ETCHING'
                  ? 'bg-amber-600 text-white'
                  : 'bg-zinc-800 text-amber-300'
              }`}
            >
              {t[lang].etching}
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="px-3 py-2 bg-zinc-800 text-amber-100 rounded-lg text-sm"
          >
            {lang === 'en' ? 'हिं' : 'En'}
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('simpleUser');
              router.push('/simple');
            }}
            className="px-3 py-2 bg-zinc-800 text-amber-100 rounded-lg text-sm"
          >
            {t[lang].logout}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="bg-gradient-to-br from-zinc-900/60 to-neutral-900/60 backdrop-blur-sm border-2 border-zinc-800 rounded-3xl p-8">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleUpload}
            className="hidden"
          />
          
          <div className="text-center space-y-6">
            <Camera className="h-24 w-24 text-amber-500 mx-auto" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-6 bg-gradient-to-r from-orange-600 to-rose-600 text-white rounded-2xl font-black text-2xl hover:from-orange-500 hover:to-rose-500 transition-all shadow-lg"
            >
              {loading ? 'AI Thinking...' : t[lang].upload}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 bg-zinc-800 text-amber-100 rounded-2xl font-semibold text-lg border border-zinc-700 hover:bg-zinc-700"
            >
              <Upload className="inline h-5 w-5 mr-2" />
              {t[lang].gallery}
            </button>
          </div>
        </div>

        {result && (
          <div className="space-y-4">
            <div className={`p-8 rounded-3xl border-4 ${
              result.status === 'safe' ? 'bg-emerald-600/20 border-emerald-500' : 'bg-rose-600/20 border-rose-500'
            }`}>
              <div className="text-center">
                <div className="text-6xl font-black text-amber-100 mb-2">{result.score}%</div>
                <div className="text-2xl font-bold text-emerald-400">{t[lang].safe}!</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6">
                <TrendingUp className="h-10 w-10 text-amber-500 mb-3" />
                <div className="text-sm text-amber-400 mb-1">{t[lang].benchmark}</div>
                <div className="text-3xl font-black text-amber-100">{result.benchmark.user}% vs {result.benchmark.avg}%</div>
              </div>

              <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6">
                <Leaf className="h-10 w-10 text-emerald-500 mb-3" />
                <div className="text-sm text-emerald-400 mb-1">{t[lang].carbon}</div>
                <div className="text-3xl font-black text-amber-100">{result.carbonSaved}kg</div>
              </div>

              <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6">
                <Zap className="h-10 w-10 text-orange-500 mb-3" />
                <div className="text-sm text-orange-400 mb-1">{t[lang].tip}</div>
                <div className="text-lg font-bold text-amber-100">{result.tip}</div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.push('/simple/share')}
                className="flex-1 py-4 bg-zinc-800 text-amber-100 rounded-2xl font-semibold border border-zinc-700 hover:bg-zinc-700"
              >
                <Share2 className="inline h-5 w-5 mr-2" />
                {t[lang].share}
              </button>
              {userType === 'BOSS' && (
                <button
                  onClick={() => router.push('/simple/reports')}
                  className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-semibold hover:from-emerald-500 hover:to-teal-500"
                >
                  <Download className="inline h-5 w-5 mr-2" />
                  {t[lang].download}
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

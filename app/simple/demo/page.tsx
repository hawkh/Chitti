'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Zap } from 'lucide-react';

export default function SimpleDemo({
  searchParams
}: {
  searchParams: { type?: string }
}) {
  const router = useRouter();
  const type = searchParams?.type;
  const [checkType] = useState<'weld' | 'etching'>(
    type === 'weld' || type === 'etching' ? type : 'weld'
  );
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setTimeout(() => {
      setResult({
        score: 94,
        status: 'safe',
        tip: checkType === 'weld' ? 'Great work! Consistent arc.' : 'Perfect etch depth.'
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-neutral-900 to-stone-950">
      <header className="p-4 flex justify-between items-center border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Zap className="h-8 w-8 text-amber-500" />
          <span className="text-2xl font-bold text-amber-100">Chitti.Ai Demo</span>
        </div>
        <button
          onClick={() => router.push('/simple')}
          className="px-4 py-2 bg-zinc-800 text-amber-100 rounded-xl hover:bg-zinc-700"
        >
          Back
        </button>
      </header>

      <main className="max-w-3xl mx-auto p-4 pt-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-amber-100 mb-3">
            Try {checkType === 'weld' ? 'Weld' : 'Etching'} Check
          </h1>
          <p className="text-xl text-amber-300">No sign-up needed – instant results</p>
        </div>

        <div className="bg-zinc-900/60 backdrop-blur-sm border-2 border-zinc-800 rounded-3xl p-8">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          
          <div className="text-center space-y-6">
            <Camera className="h-20 w-20 text-amber-500 mx-auto" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-6 bg-gradient-to-r from-orange-600 to-rose-600 text-white rounded-2xl font-black text-2xl hover:from-orange-500 hover:to-rose-500 transition-all shadow-lg"
            >
              {loading ? 'AI Checking...' : 'Upload Photo'}
            </button>
          </div>
        </div>

        {result && (
          <div className="mt-6 p-8 bg-emerald-600/20 border-4 border-emerald-500 rounded-3xl text-center">
            <div className="text-6xl font-black text-amber-100 mb-3">{result.score}%</div>
            <div className="text-2xl font-bold text-emerald-400 mb-4">Safe!</div>
            <div className="text-lg text-amber-200">{result.tip}</div>
            <button
              onClick={() => router.push('/simple/login')}
              className="mt-6 px-8 py-4 bg-gradient-to-r from-orange-600 to-rose-600 text-white rounded-2xl font-bold text-lg hover:from-orange-500 hover:to-rose-500"
            >
              Sign Up to Save Results
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

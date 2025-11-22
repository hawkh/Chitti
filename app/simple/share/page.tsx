'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Send, X } from 'lucide-react';

export default function ShareStory() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = {
    en: {
      title: 'Share Your Story – Help Others Save',
      photo: 'Upload Photo',
      what: 'What went wrong?',
      placeholder: "e.g., 'Crack after test'",
      anon: 'OK to use for AI tips? (Anonymous)',
      send: 'Share & Get Free Unlock',
      thanks: 'Thanks—your tip helps 100 welders!',
      back: 'Back to Dashboard'
    },
    hi: {
      title: 'अपनी कहानी साझा करें – दूसरों को बचाने में मदद करें',
      photo: 'फोटो अपलोड करें',
      what: 'क्या गलत हुआ?',
      placeholder: "उदा., 'परीक्षण के बाद दरार'",
      anon: 'AI टिप्स के लिए उपयोग ठीक है? (गुमनाम)',
      send: 'साझा करें और मुफ्त अनलॉक पाएं',
      thanks: 'धन्यवाद—आपकी टिप 100 वेल्डरों की मदद करती है!',
      back: 'डैशबोर्ड पर वापस'
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate description
    if (!description || description.trim().length === 0) {
      alert(lang === 'en' ? 'Please enter a description' : 'कृपया विवरण दर्ज करें');
      return;
    }

    if (description.length > 5000) {
      alert(lang === 'en' ? 'Description too long (max 5000 characters)' : 'विवरण बहुत लंबा है (अधिकतम 5000 वर्ण)');
      return;
    }

    setSubmitted(true);
    setTimeout(() => router.push('/simple/dashboard'), 2000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-neutral-900 to-stone-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-emerald-600/20 border-2 border-emerald-500 rounded-3xl p-12 text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-black text-amber-100 mb-4">{t[lang].thanks}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-neutral-900 to-stone-950 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="bg-zinc-900/60 backdrop-blur-xl rounded-3xl border border-zinc-800 p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-black text-amber-100">{t[lang].title}</h1>
            <button
              onClick={() => router.push('/simple/dashboard')}
              className="p-2 bg-zinc-800 text-amber-100 rounded-xl hover:bg-zinc-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-amber-300 mb-3 text-lg font-semibold">{t[lang].photo}</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-12 border-2 border-dashed border-amber-700 rounded-2xl bg-amber-950/20 hover:bg-amber-950/30 transition-all"
              >
                <Camera className="h-16 w-16 text-amber-500 mx-auto mb-3" />
                <span className="text-amber-300 font-semibold">{t[lang].photo}</span>
              </button>
            </div>

            <div>
              <label className="block text-amber-300 mb-3 text-lg font-semibold">{t[lang].what}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full p-4 bg-zinc-950 border-2 border-zinc-700 rounded-2xl text-amber-100 text-lg placeholder-amber-700 focus:outline-none focus:border-orange-500"
                placeholder={t[lang].placeholder}
                required
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-zinc-800 rounded-2xl">
              <input
                type="checkbox"
                id="anon"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="h-6 w-6 rounded accent-orange-600"
              />
              <label htmlFor="anon" className="text-amber-200 font-medium">
                {t[lang].anon}
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-5 bg-gradient-to-r from-orange-600 to-rose-600 text-white rounded-2xl font-black text-xl hover:from-orange-500 hover:to-rose-500 transition-all shadow-lg"
            >
              <Send className="inline h-6 w-6 mr-2" />
              {t[lang].send}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

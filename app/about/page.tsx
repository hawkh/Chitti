import Image from 'next/image';
import { Shield, Award, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-neutral-900 to-stone-950">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-200 via-orange-100 to-amber-300 bg-clip-text text-transparent mb-6">About Chitti AI</h1>
        <p className="text-xl text-amber-200 mb-12 max-w-3xl">
          Developing intelligent, affordable, and sustainable non-destructive testing (NDT) solutions that combine low-cost sensors and AI to make industrial quality inspection faster, more accurate, and accessible for all manufacturing sectors.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6">
            <Shield className="h-12 w-12 text-emerald-500 mb-4" />
            <h3 className="text-xl font-bold text-amber-100 mb-2">AI-Assisted Inspection</h3>
            <p className="text-amber-300">Human-in-the-loop inspection for optimal accuracy</p>
          </div>
          <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6">
            <Award className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-xl font-bold text-amber-100 mb-2">Affordable NDT</h3>
            <p className="text-amber-300">Scalable industrial adoption with low-cost sensors</p>
          </div>
          <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6">
            <Users className="h-12 w-12 text-orange-500 mb-4" />
            <h3 className="text-xl font-bold text-amber-100 mb-2">Expert Team</h3>
            <p className="text-amber-300">Built by AI and manufacturing experts</p>
          </div>
        </div>

        <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-200 to-orange-100 bg-clip-text text-transparent mb-8">Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 text-center">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-zinc-800 border-2 border-amber-700">
              <Image src="/profilepic.jpg" alt="Founder" width={128} height={128} className="object-cover w-full h-full" />
            </div>
            <h3 className="text-xl font-bold text-amber-100 mb-2">Sai Ruthvik Bommakanti</h3>
            <p className="text-amber-300">Co-Founder</p>
            <a href="https://www.linkedin.com/in/sai-ruthvik/" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-400 text-sm mt-2 inline-block">LinkedIn →</a>
          </div>
          <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 text-center">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-zinc-800 border-2 border-amber-700">
              <Image src="/prashanthanna.jpg" alt="Prashant" width={128} height={128} className="object-cover w-full h-full" />
            </div>
            <h3 className="text-xl font-bold text-amber-100 mb-2">Prashanth Eerekar</h3>
            <p className="text-amber-300">Co-Founder</p>
            <p className="text-sm text-amber-600 mt-2">State-level Public Speaking Winner, National Youth Climate Champion Fellow (YuWaah–UNICEF, BBG)</p>
            <a href="https://www.linkedin.com/in/prashanth-eerekar-91666a204/" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-400 text-sm mt-2 inline-block">LinkedIn →</a>
          </div>
          <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 text-center">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-zinc-800 border-2 border-amber-700">
              <Image src="/spandhananna.avif" alt="Spandhan" width={128} height={128} className="object-cover w-full h-full" />
            </div>
            <h3 className="text-xl font-bold text-amber-100 mb-2">Spandan Ananthula</h3>
            <p className="text-amber-300">Co-Founder</p>
            <p className="text-sm text-amber-600 mt-2">Big 4 digital transformation expert, led international teams through complex projects</p>
            <a href="https://www.linkedin.com/in/spandan-ananthula/" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-400 text-sm mt-2 inline-block">LinkedIn →</a>
          </div>
        </div>
      </div>
    </div>
  );
}

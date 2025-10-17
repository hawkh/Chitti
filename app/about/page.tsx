import Image from 'next/image';
import { Shield, Award, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-white mb-6">About Chitti AI</h1>
        <p className="text-xl text-gray-300 mb-12 max-w-3xl">
          Developing intelligent, affordable, and sustainable non-destructive testing (NDT) solutions that combine low-cost sensors and AI to make industrial quality inspection faster, more accurate, and accessible for all manufacturing sectors.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-slate-800 rounded-lg p-6">
            <Shield className="h-12 w-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">AI-Assisted Inspection</h3>
            <p className="text-gray-400">Human-in-the-loop inspection for optimal accuracy</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6">
            <Award className="h-12 w-12 text-green-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Affordable NDT</h3>
            <p className="text-gray-400">Scalable industrial adoption with low-cost sensors</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6">
            <Users className="h-12 w-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Expert Team</h3>
            <p className="text-gray-400">Built by AI and manufacturing experts</p>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-white mb-8">Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-800 rounded-lg p-6 text-center">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-slate-700">
              <Image src="/profilepic.jpg" alt="Founder" width={128} height={128} className="object-cover w-full h-full" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Sai Ruthvik Bommakanti</h3>
            <p className="text-gray-400">Co-Founder</p>
            <a href="https://www.linkedin.com/in/sai-ruthvik/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block">LinkedIn →</a>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 text-center">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-slate-700">
              <Image src="/prashanthanna.jpg" alt="Prashant" width={128} height={128} className="object-cover w-full h-full" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Prashanth Eerekar</h3>
            <p className="text-gray-400">Co-Founder</p>
            <p className="text-sm text-gray-500 mt-2">State-level Public Speaking Winner, National Youth Climate Champion Fellow (YuWaah–UNICEF, BBG)</p>
            <a href="https://www.linkedin.com/in/prashanth-eerekar-91666a204/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block">LinkedIn →</a>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 text-center">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-slate-700">
              <Image src="/spandhananna.avif" alt="Spandhan" width={128} height={128} className="object-cover w-full h-full" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Spandan Ananthula</h3>
            <p className="text-gray-400">Co-Founder</p>
            <p className="text-sm text-gray-500 mt-2">Big 4 digital transformation expert, led international teams through complex projects</p>
            <a href="https://www.linkedin.com/in/spandan-ananthula/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block">LinkedIn →</a>
          </div>
        </div>
      </div>
    </div>
  );
}

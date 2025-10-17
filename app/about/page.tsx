import Image from 'next/image';
import { Shield, Award, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-white mb-6">About Chitti AI</h1>
        <p className="text-xl text-gray-300 mb-12 max-w-3xl">
          Detect micro-defects in real time — sub-second inference, enterprise accuracy.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-slate-800 rounded-lg p-6">
            <Shield className="h-12 w-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Enterprise Grade</h3>
            <p className="text-gray-400">SOC/ISO compliant with enterprise-ready security</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6">
            <Award className="h-12 w-12 text-green-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Proven Accuracy</h3>
            <p className="text-gray-400">Reduce manual inspection time by up to 40%</p>
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
            <h3 className="text-xl font-bold text-white mb-2">Founder</h3>
            <p className="text-gray-400">CEO & Lead Engineer</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 text-center">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-slate-700">
              <Image src="/prashanthanna.jpg" alt="Prashant" width={128} height={128} className="object-cover w-full h-full" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Prashant</h3>
            <p className="text-gray-400">AI Research Lead</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 text-center">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-slate-700">
              <Image src="/spandhananna.avif" alt="Spandhan" width={128} height={128} className="object-cover w-full h-full" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Spandhan</h3>
            <p className="text-gray-400">Product Architect</p>
          </div>
        </div>
      </div>
    </div>
  );
}

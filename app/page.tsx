import dynamic from 'next/dynamic';
import Hero from "@/components/home/Hero";
import Header from "@/components/layout/Header";
import Features from '@/components/home/Features';
import UseCases from '@/components/home/UseCases';
import CaseStudies from '@/components/home/CaseStudies';

const CTASection = dynamic(() => import('@/components/home/CTASection'));
const Footer = dynamic(() => import('@/src/components/layout/Footer'));
const Stats = dynamic(() => import('@/components/home/Stats'));

export default function Home() {
  return (
    <div className="bg-black min-h-screen">
      <div className="fixed top-20 right-4 z-50 space-y-3">
        <a
          href="/executive"
          className="block px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:from-blue-500 hover:to-indigo-500 transition-all"
        >
          👔 Executive Dashboard
        </a>
        <a
          href="/simple"
          className="block px-6 py-3 bg-gradient-to-r from-orange-600 to-rose-600 text-white rounded-2xl font-bold shadow-lg hover:from-orange-500 hover:to-rose-500 transition-all"
        >
          🔧 For Welders
        </a>
      </div>
      <Header />
      <Hero />
      <Stats />
      <Features />
      <UseCases />
      <CaseStudies />
      <CTASection />
      <Footer />
    </div>
  );
}

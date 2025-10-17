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

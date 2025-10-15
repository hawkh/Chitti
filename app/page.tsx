import dynamic from 'next/dynamic';
import Hero from "@/components/home/Hero";
import Header from "@/components/layout/Header";

const Features = dynamic(() => import('@/components/home/Features'));
const CTASection = dynamic(() => import('@/components/home/CTASection'));
const Footer = dynamic(() => import('@/src/components/layout/Footer'));
const LiveDetectionDemo = dynamic(() => import('@/components/demo/LiveDetectionDemo'));
const RealTimeStats = dynamic(() => import('@/components/RealTimeStats'));

export default function Home() {
  return (
    <div className="bg-black min-h-screen">
      <Header />
      <Hero />
      <Features />
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-12 bg-gradient-to-b from-black via-gray-900 to-black">
        <LiveDetectionDemo />
        <RealTimeStats />
      </div>
      <CTASection />
      <Footer />
    </div>
  );
}

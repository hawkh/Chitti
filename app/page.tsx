import React from "react";
import Link from "next/link";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import CTASection from "@/components/home/CTASection";
import Stats from "@/components/home/Stats";
import Header from "@/components/layout/Header";
import Footer from "@/src/components/layout/Footer";
import LiveDemo from "@/components/LiveDemo";
import RealTimeStats from "@/components/RealTimeStats";
export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <Stats />
      <Features />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <LiveDemo />
        <RealTimeStats />
      </div>
      <CTASection />
      <Footer />
    </>
  );
}

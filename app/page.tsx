import React from "react";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
// import Testimonials from "@/components/home/Testimonials";
import CTASection from "@/components/home/CTASection";
// import Industries from "@/components/home/Industries";
import Stats from "@/components/home/Stats";
import "@/styles/globals.css";
export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <Features />
      {/* <Industries /> */}
      {/* <Testimonials /> */}
      <CTASection />
    </>
  );
}

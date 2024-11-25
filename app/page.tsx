import React from "react";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
// import Testimonials from "@/components/home/Testimonials";
import CTASection from "@/components/home/CTASection";
// import Industries from "@/components/home/Industries";
import Stats from "@/components/home/Stats";
import "@/styles/globals.css";
import Header from "@/components/layout/Header";
import Footer from "src/components/layout/Footer";
export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <Stats />
      <Features />
      {/* <Industries /> */}
      {/* <Testimonials /> */}
      <CTASection />
      <Footer />
    </>
  );
}

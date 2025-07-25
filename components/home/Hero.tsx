import Image from "next/image";
import Link from "next/link";
import React from "react";
import bg from "../../app/assets/images/hero_bg.svg";
export default function Hero(): JSX.Element {
  return (
    <div className="relative bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              Live AI Defect Detection System
            </h1>
            <p className="text-xl text-gray-600">
              Experience real-time YOLO AI detection with live camera feed.
              Try it instantly below - no setup required.
            </p>
            <div className="space-x-4">
              <Link
                href="/integrated-detection"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Live Demo
              </Link>
              <Link
                href="/detection"
                className="inline-block border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Quick Start
              </Link>
            </div>
          </div>
          <div className="relative h-[400px] md:h-[500px] ">
            <Image
              src={bg}
              alt="AI Detection Demo"
              className="object-cover rounded-xl shadow-2xl"
              fill={true}
              priority={true}
            />
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-600 mb-8">
            Trusted by industry leaders
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-70">
            {/* Add partner logos here */}
          </div>
        </div>
      </div>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Sparkles, Zap, Shield } from "lucide-react";
import bg from "../../app/assets/images/hero_bg.svg";
export default function Hero(): JSX.Element {
  return (
    <div className="relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 opacity-90" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 text-white animate-fade-in">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30 shadow-lg">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span className="text-sm font-semibold">AI-Powered NDT Solution</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black leading-tight tracking-tight">
              Defect Detection
              <span className="block bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent animate-shimmer">
                Reimagined
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed font-light">
              Enterprise-grade AI that detects manufacturing defects in real-time. 
              Transform your quality control process today.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/integrated-detection"
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-10 py-5 rounded-2xl font-black text-lg hover:from-yellow-300 hover:to-orange-400 transition-all shadow-2xl hover:shadow-yellow-400/50 hover:scale-110 transform animate-pulse"
              >
                <Zap className="h-6 w-6 group-hover:animate-spin" />
                🎥 Live Camera Detection
              </Link>
              <Link
                href="/detection"
                className="inline-flex items-center gap-3 bg-white text-blue-600 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all shadow-2xl hover:scale-110 transform"
              >
                <Shield className="h-6 w-6" />
                Upload Files
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-5xl font-black bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">AI</div>
                <div className="text-sm text-blue-200 font-semibold mt-2">Powered</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-black bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">Fast</div>
                <div className="text-sm text-blue-200 font-semibold mt-2">Detection</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-black bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">24/7</div>
                <div className="text-sm text-blue-200 font-semibold mt-2">Monitoring</div>
              </div>
            </div>
          </div>
          
          <div className="relative animate-float">
            <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 rounded-3xl blur-2xl opacity-30 animate-pulse-slow"></div>
            <div className="relative h-[400px] md:h-[600px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/30 backdrop-blur-sm transform hover:scale-105 transition-transform duration-500">
              <Image
                src={bg}
                alt="AI Detection Demo"
                className="object-cover"
                fill={true}
                priority={true}
              />
              {/* Floating card overlay */}
              <div className="absolute bottom-8 left-8 right-8 bg-gradient-to-r from-white/95 to-blue-50/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 font-semibold uppercase tracking-wide">Live Detection</div>
                    <div className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Active</div>
                  </div>
                  <div className="h-16 w-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center animate-pulse shadow-lg shadow-green-500/50">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

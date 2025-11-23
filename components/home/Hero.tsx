import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Sparkles, Zap, Shield, ArrowRight } from "lucide-react";
import bg from "../../app/assets/images/hero_bg.svg";

export default function Hero(): JSX.Element {
  return (
    <div className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-zinc-950">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-zinc-900/50 to-purple-900/20" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
      </div>

      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-[0.15]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 text-white animate-fade-in z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 backdrop-blur-md rounded-full border border-blue-500/20">
              <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
              <span className="text-sm font-medium text-blue-200">Next-Gen Quality Control</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
              Precision Defect <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Detection AI
              </span>
            </h1>

            <p className="text-xl text-zinc-400 leading-relaxed max-w-xl">
              Automate your quality assurance with enterprise-grade computer vision. Detect micro-defects in real-time with 99.9% accuracy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/demo"
                className="group inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-zinc-200 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                <Zap className="h-5 w-5 fill-black" />
                Live Demo
              </Link>
              <Link
                href="/contact"
                className="group inline-flex items-center justify-center gap-2 bg-zinc-800/50 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-zinc-800 transition-all border border-zinc-700 hover:border-zinc-600 backdrop-blur-sm"
              >
                <Shield className="h-5 w-5" />
                Request Pilot
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="pt-8 border-t border-zinc-800/50 flex items-center gap-8 text-zinc-500 text-sm font-medium">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                System Operational
              </div>
              <div>Trusted by Industry Leaders</div>
            </div>
          </div>

          <div className="relative lg:h-[600px] flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />

            <div className="relative w-full aspect-square max-w-[500px] lg:max-w-none">
              <div className="absolute inset-0 bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden">
                <Image
                  src={bg}
                  alt="AI Detection Interface"
                  className="object-cover opacity-80 hover:opacity-100 transition-opacity duration-700"
                  fill={true}
                  priority={true}
                />

                {/* Overlay UI Elements */}
                <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                  <div className="bg-black/60 backdrop-blur-md rounded-lg px-4 py-2 border border-white/10">
                    <div className="text-xs text-zinc-400 uppercase tracking-wider">Status</div>
                    <div className="text-green-400 font-mono font-bold flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      MONITORING
                    </div>
                  </div>
                  <div className="bg-black/60 backdrop-blur-md rounded-lg px-4 py-2 border border-white/10">
                    <div className="text-xs text-zinc-400 uppercase tracking-wider">Confidence</div>
                    <div className="text-blue-400 font-mono font-bold">99.8%</div>
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-zinc-900/90 backdrop-blur-xl rounded-xl p-4 border border-zinc-700 shadow-2xl">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-red-500/20 rounded-lg flex items-center justify-center border border-red-500/30">
                        <Zap className="h-6 w-6 text-red-500" />
                      </div>
                      <div>
                        <div className="text-white font-bold">Defect Detected</div>
                        <div className="text-zinc-400 text-sm">Micro-fracture on weld joint</div>
                      </div>
                      <div className="ml-auto">
                        <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full border border-red-500/20">
                          CRITICAL
                        </span>
                      </div>
                    </div>
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


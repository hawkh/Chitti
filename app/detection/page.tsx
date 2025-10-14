'use client';

import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/src/components/layout/Footer';
import RealTimeDetection from '@/components/detection/RealTimeDetection';
import { Zap, Shield, Target } from 'lucide-react';

export default function DetectionPage() {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      <Header />
      <main className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-600">AI-Powered Analysis</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Defect Detection
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Upload your manufacturing components for instant AI analysis. 
              Our advanced YOLO-based system identifies defects in real-time.
            </p>
            
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-gray-700 font-medium">Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span className="text-gray-700 font-medium">Precision Detection</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                <span className="text-gray-700 font-medium">Real-time Results</span>
              </div>
            </div>
          </div>
          
          <RealTimeDetection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Zap, Target, TrendingUp, AlertCircle } from 'lucide-react';

export default function RealTimeStats() {
  const [stats, setStats] = useState({
    totalProcessed: 1247,
    currentThroughput: 0,
    accuracy: 92.4,
    activeUsers: 3,
    defectsFound: 89,
    systemLoad: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalProcessed: prev.totalProcessed + Math.floor(Math.random() * 3),
        currentThroughput: 0.8 + Math.random() * 0.4,
        systemLoad: 20 + Math.random() * 30,
        activeUsers: 2 + Math.floor(Math.random() * 4)
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">System Performance</h2>
        <div className="flex items-center gap-2 text-green-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="bg-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
            <Activity className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {stats.totalProcessed.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">Images Processed</div>
        </div>

        <div className="text-center">
          <div className="bg-green-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
            <Zap className="w-6 h-6 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {stats.currentThroughput.toFixed(1)}/s
          </div>
          <div className="text-sm text-gray-400">Throughput</div>
        </div>

        <div className="text-center">
          <div className="bg-purple-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
            <Target className="w-6 h-6 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {stats.accuracy}%
          </div>
          <div className="text-sm text-gray-400">Accuracy</div>
        </div>

        <div className="text-center">
          <div className="bg-orange-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-6 h-6 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {stats.activeUsers}
          </div>
          <div className="text-sm text-gray-400">Active Users</div>
        </div>

        <div className="text-center">
          <div className="bg-red-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {stats.defectsFound}
          </div>
          <div className="text-sm text-gray-400">Defects Found</div>
        </div>

        <div className="text-center">
          <div className="bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
            <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {Math.round(stats.systemLoad)}%
          </div>
          <div className="text-sm text-gray-400">System Load</div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-800">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>Last updated: Live</span>
          <span>Uptime: 99.8%</span>
        </div>
      </div>
    </div>
  );
}

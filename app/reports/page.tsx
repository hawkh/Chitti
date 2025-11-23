'use client';

import { useState } from 'react';
import {
    BarChart3,
    FileText,
    Download,
    Filter,
    Calendar,
    ChevronDown,
    PieChart,
    TrendingUp,
    AlertCircle
} from 'lucide-react';
import ReportGenerator from '@/components/audit/ReportGenerator';
import AnalyticsDashboard from '@/components/audit/AnalyticsDashboard';
import { useQualityContext } from '@/context/QualityContext';

export default function ReportsPage() {
    const { audits, defects } = useQualityContext();
    const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'exports'>('overview');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                Enterprise
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="p-2 text-gray-400 hover:text-gray-600">
                                <Calendar className="h-5 w-5" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600">
                                <Filter className="h-5 w-5" />
                            </button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                                <Download className="h-4 w-4" />
                                <span>Export All</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-200 p-1 rounded-xl mb-8 w-fit">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'overview'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'analytics'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Deep Analytics
                    </button>
                    <button
                        onClick={() => setActiveTab('exports')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'exports'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Export Center
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Quick Stats */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Performance Snapshot</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp className="h-4 w-4 text-green-600" />
                                            <span className="text-sm font-medium text-green-800">Pass Rate</span>
                                        </div>
                                        <p className="text-2xl font-bold text-green-900">
                                            {audits.length > 0
                                                ? Math.round((audits.filter(a => !defects.some(d => d.id === a.id && d.defects.some(sub => sub.severity === 'critical'))).length / audits.length) * 100)
                                                : 0}%
                                        </p>
                                    </div>
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileText className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-medium text-blue-800">Total Audits</span>
                                        </div>
                                        <p className="text-2xl font-bold text-blue-900">{audits.length}</p>
                                    </div>
                                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertCircle className="h-4 w-4 text-purple-600" />
                                            <span className="text-sm font-medium text-purple-800">Defects Found</span>
                                        </div>
                                        <p className="text-2xl font-bold text-purple-900">{defects.length}</p>
                                    </div>
                                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <BarChart3 className="h-4 w-4 text-orange-600" />
                                            <span className="text-sm font-medium text-orange-800">Avg Score</span>
                                        </div>
                                        <p className="text-2xl font-bold text-orange-900">88%</p>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity Placeholder */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="bg-gray-100 p-4 rounded-full inline-block mb-4">
                                        <PieChart className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">Activity Feed</h3>
                                    <p className="text-gray-500 mt-1">Real-time audit logs will appear here</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <AnalyticsDashboard
                            auditData={audits.map(a => ({
                                id: a.id || 'unknown',
                                timestamp: a.auditDate,
                                ...a
                            }))}
                            detectionResults={defects.map(d => ({
                                id: d.id,
                                timestamp: d.timestamp,
                                defects: d.defects.map(def => ({
                                    type: def.type,
                                    confidence: def.confidence,
                                    bbox: [def.location.x, def.location.y, def.location.width, def.location.height],
                                    severity: def.severity,
                                    description: def.description
                                })),
                                processingTime: d.processingTime,
                                imageWidth: d.metadata?.imageSize.width || 1920,
                                imageHeight: d.metadata?.imageSize.height || 1080
                            }))}
                        />
                    )}

                    {activeTab === 'exports' && (
                        <ReportGenerator
                            auditId="all"
                            auditData={audits}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}

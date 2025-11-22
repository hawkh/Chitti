'use client';

import React from 'react';
import { Brain, Zap, Shield, Clock } from 'lucide-react';
import ClientSideDetection from '@/components/detection/ClientSideDetection';
import Header from '@/components/layout/Header';

export default function ClientDetectionPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Brain className="w-6 h-6 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Client-Side AI Detection
                        </h1>
                    </div>

                    <p className="text-lg text-gray-600 mb-6">
                        Real-time defect detection powered by TensorFlow.js running directly in your browser.
                        No server uploads required - your data stays private and secure.
                    </p>

                    {/* Features */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            <div>
                                <h3 className="font-medium text-gray-900">Real-Time Processing</h3>
                                <p className="text-sm text-gray-600">Instant results with no server delays</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border">
                            <Shield className="w-5 h-5 text-green-500" />
                            <div>
                                <h3 className="font-medium text-gray-900">Privacy First</h3>
                                <p className="text-sm text-gray-600">Images never leave your device</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border">
                            <Clock className="w-5 h-5 text-blue-500" />
                            <div>
                                <h3 className="font-medium text-gray-900">Offline Capable</h3>
                                <p className="text-sm text-gray-600">Works without internet connection</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detection Interface */}
                <ClientSideDetection />

                {/* Technical Information */}
                <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Technical Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">Model Information</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• <strong>Architecture:</strong> YOLOv8 converted to TensorFlow.js</li>
                                <li>• <strong>Input Size:</strong> 640×640 pixels</li>
                                <li>• <strong>Classes:</strong> 7 defect types</li>
                                <li>• <strong>Backend:</strong> WebGL acceleration (fallback to CPU)</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">Supported Defects</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Cracks and fractures</li>
                                <li>• Corrosion and oxidation</li>
                                <li>• Deformation and warping</li>
                                <li>• Surface irregularities</li>
                                <li>• Inclusions and foreign materials</li>
                                <li>• Voids and cavities</li>
                                <li>• Dimensional variances</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Performance Tips</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Use images with good lighting and contrast for best results</li>
                            <li>• Optimal image size is around 640×640 pixels</li>
                            <li>• WebGL acceleration provides 5-10x faster inference than CPU</li>
                            <li>• First inference may be slower due to model initialization</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
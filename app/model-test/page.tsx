'use client';

import React from 'react';
import { TestTube, Brain, Zap } from 'lucide-react';
import ModelTest from '@/components/testing/ModelTest';
import Header from '@/components/layout/Header';

export default function ModelTestPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <TestTube className="w-6 h-6 text-purple-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Model Integration Testing
                        </h1>
                    </div>

                    <p className="text-lg text-gray-600 mb-6">
                        Comprehensive testing suite for validating TensorFlow.js model integration, 
                        performance, and functionality in the browser environment.
                    </p>

                    {/* Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border">
                            <Brain className="w-5 h-5 text-blue-500" />
                            <div>
                                <h3 className="font-medium text-gray-900">Model Validation</h3>
                                <p className="text-sm text-gray-600">Tests model loading, initialization, and inference</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            <div>
                                <h3 className="font-medium text-gray-900">Performance Testing</h3>
                                <p className="text-sm text-gray-600">Measures loading times and inference speed</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Test Interface */}
                <ModelTest />

                {/* Instructions */}
                <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Testing Instructions</h2>

                    <div className="space-y-4 text-sm text-gray-600">
                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">What This Test Does</h3>
                            <ul className="space-y-1 ml-4">
                                <li>• Initializes the Model Manager and loads configuration</li>
                                <li>• Validates that all model files are accessible</li>
                                <li>• Loads the TensorFlow.js YOLO model into memory</li>
                                <li>• Runs a test inference with synthetic image data</li>
                                <li>• Verifies the output format and structure</li>
                                <li>• Measures performance metrics for each step</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">Expected Results</h3>
                            <ul className="space-y-1 ml-4">
                                <li>• All tests should pass with green checkmarks</li>
                                <li>• Model loading should complete within 5-10 seconds</li>
                                <li>• Inference should complete within 1-2 seconds</li>
                                <li>• No JavaScript errors in the browser console</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">Troubleshooting</h3>
                            <ul className="space-y-1 ml-4">
                                <li>• If model loading fails, check that model files exist in /public/models/</li>
                                <li>• If inference is slow, ensure WebGL is enabled in your browser</li>
                                <li>• Check browser console for detailed error messages</li>
                                <li>• Try refreshing the page if tests get stuck</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
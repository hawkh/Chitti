'use client'

import { useState } from 'react'

interface SimulationResult {
    failureMode: string
    timeToFailure: number
    criticalStress: number
    safetyFactor: number
}

export default function DigitalTwinPage() {
    const [twinId, setTwinId] = useState('')
    const [loading, setLoading] = useState(false)
    const [simulation, setSimulation] = useState<SimulationResult | null>(null)

    const runSimulation = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/digital-twin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'simulate-failure',
                    twinId: twinId || 'twin_default',
                    loadConditions: {
                        temperature: 85,
                        pressure: 150,
                        cycleCount: 10000
                    }
                })
            })

            const result = await response.json()
            if (result.success) {
                setSimulation(result.data)
            }
        } catch (error) {
            console.error('Simulation failed:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        🔮 Digital Twin Engine
                    </h1>
                    <p className="text-cyan-200">
                        Virtual component modeling with predictive failure analysis
                    </p>
                </div>

                {/* Control Panel */}
                <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-2xl p-8 mb-8 border border-white/20">
                    <h2 className="text-2xl font-bold text-white mb-6">Failure Mode Simulation</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-cyan-200 mb-2">
                                Twin ID
                            </label>
                            <input
                                type="text"
                                value={twinId}
                                onChange={(e) => setTwinId(e.target.value)}
                                placeholder="twin_default"
                                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={runSimulation}
                                disabled={loading}
                                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                            >
                                {loading ? '🔄 Simulating...' : '🚀 Run Simulation'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Simulation Results */}
                {simulation && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-lg shadow-lg p-6 text-white">
                            <div className="text-4xl mb-2">⚠️</div>
                            <p className="text-sm opacity-80 mb-1">Failure Mode</p>
                            <p className="text-2xl font-bold">{simulation.failureMode.replace('_', ' ')}</p>
                        </div>

                        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
                            <div className="text-4xl mb-2">⏱️</div>
                            <p className="text-sm opacity-80 mb-1">Time to Failure</p>
                            <p className="text-2xl font-bold">{simulation.timeToFailure} days</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
                            <div className="text-4xl mb-2">💪</div>
                            <p className="text-sm opacity-80 mb-1">Critical Stress</p>
                            <p className="text-2xl font-bold">{simulation.criticalStress} MPa</p>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
                            <div className="text-4xl mb-2">🛡️</div>
                            <p className="text-sm opacity-80 mb-1">Safety Factor</p>
                            <p className="text-2xl font-bold">{simulation.safetyFactor.toFixed(2)}</p>
                        </div>
                    </div>
                )}

                {/* 3D Viewer Placeholder */}
                <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-2xl p-8 border border-white/20">
                    <h2 className="text-2xl font-bold text-white mb-6">3D Component Visualization</h2>
                    <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg flex items-center justify-center">
                        <div className="text-center text-white">
                            <div className="text-6xl mb-4">🔷</div>
                            <p className="text-xl font-semibold mb-2">3D Viewer</p>
                            <p className="text-sm opacity-70">Component geometry and stress analysis visualization</p>
                            <p className="text-xs opacity-50 mt-2">(Three.js integration coming soon)</p>
                        </div>
                    </div>
                </div>

                {/* Stress Analysis */}
                {simulation && (
                    <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-lg shadow-2xl p-8 border border-white/20">
                        <h2 className="text-2xl font-bold text-white mb-6">📊 Stress Impact Analysis</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white/5 rounded-lg p-6">
                                <p className="text-cyan-200 text-sm mb-2">Status</p>
                                <p className={`text-2xl font-bold ${simulation.safetyFactor > 2 ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    {simulation.safetyFactor > 2 ? '✅ SAFE' : '⚠️ AT RISK'}
                                </p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-6">
                                <p className="text-cyan-200 text-sm mb-2">Recommended Action</p>
                                <p className="text-lg font-semibold text-white">
                                    {simulation.safetyFactor > 2
                                        ? 'Continue Monitoring'
                                        : 'Immediate Inspection Required'}
                                </p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-6">
                                <p className="text-cyan-200 text-sm mb-2">Life Expectancy</p>
                                <p className="text-2xl font-bold text-white">
                                    {simulation.timeToFailure} days
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

'use client'

import { useState, useEffect } from 'react'

interface ComplianceData {
    compliant: boolean
    violations: string[]
    certificationLevel: string
    validUntil: Date
}

interface SupplyChainData {
    manufacturer: string
    materialSource: string
    productionDate: Date
    inspectionHistory: any[]
    currentLocation: string
}

export default function CompliancePage() {
    const [componentId, setComponentId] = useState('COMP-2024-001')
    const [loading, setLoading] = useState(false)
    const [fdaCompliance, setFdaCompliance] = useState<ComplianceData | null>(null)
    const [isoCompliance, setIsoCompliance] = useState<ComplianceData | null>(null)
    const [asmeCompliance, setAsmeCompliance] = useState<ComplianceData | null>(null)
    const [supplyChain, setSupplyChain] = useState<SupplyChainData | null>(null)

    const fetchCompliance = async () => {
        setLoading(true)
        try {
            // Fetch all compliance standards
            const response = await fetch(`/api/compliance?componentId=${componentId}`)
            const result = await response.json()

            if (result.success) {
                setFdaCompliance(result.data.fda)
                setIsoCompliance(result.data.iso)
                setAsmeCompliance(result.data.asme)
            }

            // Fetch supply chain data
            const supplyResponse = await fetch(`/api/compliance?componentId=${componentId}&action=supply-chain`)
            const supplyResult = await supplyResponse.json()

            if (supplyResult.success) {
                setSupplyChain(supplyResult.data)
            }
        } catch (error) {
            console.error('Failed to fetch compliance data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCompliance()
    }, [])

    const ComplianceCard = ({ title, data, color }: { title: string, data: ComplianceData | null, color: string }) => (
        <div className={`bg-white rounded-lg shadow-lg p-6 border-l-4 ${color}`}>
            <h3 className="text-xl font-bold mb-4">{title}</h3>
            {data ? (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">Status:</span>
                        <span className={`px-3 py-1 rounded-full text-sm ${data.compliant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {data.compliant ? '✅ Compliant' : '❌ Non-Compliant'}
                        </span>
                    </div>
                    <div>
                        <span className="font-semibold">Certification Level:</span>
                        <span className="ml-2 text-gray-700">{data.certificationLevel}</span>
                    </div>
                    <div>
                        <span className="font-semibold">Valid Until:</span>
                        <span className="ml-2 text-gray-700">{new Date(data.validUntil).toLocaleDateString()}</span>
                    </div>
                    {data.violations.length > 0 && (
                        <div>
                            <span className="font-semibold text-red-600">Violations:</span>
                            <ul className="ml-4 mt-2 space-y-1">
                                {data.violations.map((v, i) => (
                                    <li key={i} className="text-sm text-red-600">• {v}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-gray-400">Loading...</div>
            )}
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        🔐 Compliance & Blockchain Dashboard
                    </h1>
                    <p className="text-gray-600">
                        FDA, ISO, and ASME certification status with blockchain audit trails
                    </p>
                </div>

                {/* Component ID Input */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Component ID
                            </label>
                            <input
                                type="text"
                                value={componentId}
                                onChange={(e) => setComponentId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter component ID..."
                            />
                        </div>
                        <button
                            onClick={fetchCompliance}
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Loading...' : 'Check Compliance'}
                        </button>
                    </div>
                </div>

                {/* Compliance Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <ComplianceCard title="FDA Compliance" data={fdaCompliance} color="border-blue-500" />
                    <ComplianceCard title="ISO Compliance" data={isoCompliance} color="border-green-500" />
                    <ComplianceCard title="ASME Compliance" data={asmeCompliance} color="border-purple-500" />
                </div>

                {/* Supply Chain Tracking */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <span>📦</span>
                        Supply Chain Tracking
                    </h2>
                    {supplyChain ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="border-l-4 border-blue-500 pl-4">
                                    <p className="text-sm text-gray-600">Manufacturer</p>
                                    <p className="font-semibold text-lg">{supplyChain.manufacturer}</p>
                                </div>
                                <div className="border-l-4 border-green-500 pl-4">
                                    <p className="text-sm text-gray-600">Material Source</p>
                                    <p className="font-semibold text-lg">{supplyChain.materialSource}</p>
                                </div>
                                <div className="border-l-4 border-purple-500 pl-4">
                                    <p className="text-sm text-gray-600">Current Location</p>
                                    <p className="font-semibold text-lg">{supplyChain.currentLocation}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="border-l-4 border-orange-500 pl-4">
                                    <p className="text-sm text-gray-600">Production Date</p>
                                    <p className="font-semibold text-lg">
                                        {new Date(supplyChain.productionDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="border-l-4 border-red-500 pl-4">
                                    <p className="text-sm text-gray-600">Inspection History</p>
                                    <p className="font-semibold text-lg">
                                        {supplyChain.inspectionHistory.length} inspections
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-400">Loading supply chain data...</div>
                    )}
                </div>

                {/* Blockchain Info */}
                <div className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                    <h3 className="text-xl font-bold mb-2">🔗 Blockchain Audit Trail</h3>
                    <p className="text-indigo-100">
                        All compliance checks and inspections are recorded on an immutable blockchain ledger,
                        ensuring complete traceability and tamper-proof audit trails for regulatory compliance.
                    </p>
                </div>
            </div>
        </div>
    )
}

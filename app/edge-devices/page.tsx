'use client'

import { useState, useEffect } from 'react'

interface EdgeDevice {
    id: string
    processingPower: number
    memoryGB: number
    storageGB: number
    sensors: string[]
    status: string
    lastHeartbeat: Date
    jobsProcessed: number
}

export default function EdgeDevicesPage() {
    const [devices, setDevices] = useState<EdgeDevice[]>([])
    const [loading, setLoading] = useState(true)
    const [showRegisterForm, setShowRegisterForm] = useState(false)
    const [newDevice, setNewDevice] = useState({
        id: '',
        processingPower: 4,
        memoryGB: 8,
        storageGB: 128,
        sensors: [] as string[]
    })

    useEffect(() => {
        fetchDevices()
    }, [])

    const fetchDevices = async () => {
        try {
            const response = await fetch('/api/edge')
            const result = await response.json()
            if (result.success) {
                setDevices(result.data)
            }
        } catch (error) {
            console.error('Failed to fetch devices:', error)
        } finally {
            setLoading(false)
        }
    }

    const registerDevice = async () => {
        try {
            const response = await fetch('/api/edge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'register',
                    deviceId: newDevice.id,
                    capabilities: {
                        processingPower: newDevice.processingPower,
                        memoryGB: newDevice.memoryGB,
                        storageGB: newDevice.storageGB,
                        sensors: ['temperature', 'vibration', 'acoustic']
                    }
                })
            })

            if (response.ok) {
                setShowRegisterForm(false)
                fetchDevices()
                setNewDevice({ id: '', processingPower: 4, memoryGB: 8, storageGB: 128, sensors: [] })
            }
        } catch (error) {
            console.error('Failed to register device:', error)
        }
    }

    const deployModel = async (deviceId: string) => {
        try {
            await fetch('/api/edge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'deploy-model',
                    deviceId: deviceId,
                    modelId: 'yolo-defect-v1'
                })
            })
            alert('Model deployed successfully!')
        } catch (error) {
            console.error('Failed to deploy model:', error)
        }
    }

    const DeviceCard = ({ device }: { device: EdgeDevice }) => (
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">{device.id}</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm mt-2 ${device.status === 'ONLINE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {device.status}
                    </span>
                </div>
                <div className="text-4xl">🖥️</div>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Processing Power:</span>
                    <span className="font-semibold">{device.processingPower} cores</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Memory:</span>
                    <span className="font-semibold">{device.memoryGB} GB</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Storage:</span>
                    <span className="font-semibold">{device.storageGB} GB</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Jobs Processed:</span>
                    <span className="font-semibold">{device.jobsProcessed}</span>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => deployModel(device.id)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
                >
                    Deploy Model
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-semibold">
                    Details
                </button>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">
                            🌐 Edge AI Devices
                        </h1>
                        <p className="text-gray-300">
                            Manage distributed AI processing on edge devices
                        </p>
                    </div>
                    <button
                        onClick={() => setShowRegisterForm(!showRegisterForm)}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                        + Register Device
                    </button>
                </div>

                {/* Registration Form */}
                {showRegisterForm && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                        <h2 className="text-xl font-bold mb-4">Register New Edge Device</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Device ID
                                </label>
                                <input
                                    type="text"
                                    value={newDevice.id}
                                    onChange={(e) => setNewDevice({ ...newDevice, id: e.target.value })}
                                    placeholder="edge-device-001"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Processing Power (cores)
                                </label>
                                <input
                                    type="number"
                                    value={newDevice.processingPower}
                                    onChange={(e) => setNewDevice({ ...newDevice, processingPower: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Memory (GB)
                                </label>
                                <input
                                    type="number"
                                    value={newDevice.memoryGB}
                                    onChange={(e) => setNewDevice({ ...newDevice, memoryGB: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Storage (GB)
                                </label>
                                <input
                                    type="number"
                                    value={newDevice.storageGB}
                                    onChange={(e) => setNewDevice({ ...newDevice, storageGB: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={registerDevice}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                            >
                                Register
                            </button>
                            <button
                                onClick={() => setShowRegisterForm(false)}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Devices Grid */}
                {loading ? (
                    <div className="text-white text-center py-12">Loading devices...</div>
                ) : devices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {devices.map((device) => (
                            <DeviceCard key={device.id} device={device} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white/10 rounded-lg p-12 text-center backdrop-blur-lg">
                        <div className="text-6xl mb-4">📱</div>
                        <p className="text-white text-xl mb-2">No Edge Devices Registered</p>
                        <p className="text-gray-300">Click "Register Device" to add your first edge device</p>
                    </div>
                )}
            </div>
        </div>
    )
}

import { NextRequest, NextResponse } from 'next/server'
import { EdgeAIManager } from '@/services/edge/EdgeAIManager'

const edgeManager = new EdgeAIManager()

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const deviceId = searchParams.get('deviceId')

        if (deviceId) {
            const status = edgeManager.getDeviceStatus(deviceId)
            if (!status) {
                return NextResponse.json({
                    success: false,
                    error: 'Device not found'
                }, { status: 404 })
            }
            return NextResponse.json({ success: true, data: status })
        }

        // Get all devices
        const devices = edgeManager.getAllDevices()
        return NextResponse.json({ success: true, data: devices })

    } catch (error) {
        console.error('Edge AI API error:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch edge device data'
        }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { action, deviceId, capabilities, modelId, sensorData } = body

        switch (action) {
            case 'register':
                if (!deviceId || !capabilities) {
                    return NextResponse.json({
                        success: false,
                        error: 'Device ID and capabilities required'
                    }, { status: 400 })
                }
                await edgeManager.registerEdgeDevice(deviceId, capabilities)
                return NextResponse.json({
                    success: true,
                    message: 'Device registered successfully'
                })

            case 'deploy-model':
                if (!deviceId || !modelId) {
                    return NextResponse.json({
                        success: false,
                        error: 'Device ID and model ID required'
                    }, { status: 400 })
                }
                const deployed = await edgeManager.deployModelToEdge(deviceId, modelId)
                return NextResponse.json({
                    success: deployed,
                    message: deployed ? 'Model deployed' : 'Device not found'
                })

            case 'process':
                if (!deviceId || !sensorData) {
                    return NextResponse.json({
                        success: false,
                        error: 'Device ID and sensor data required'
                    }, { status: 400 })
                }
                const result = await edgeManager.processAtEdge(deviceId, sensorData)
                return NextResponse.json({ success: true, data: result })

            default:
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action. Use: register, deploy-model, or process'
                }, { status: 400 })
        }
    } catch (error) {
        console.error('Edge AI operation error:', error)
        return NextResponse.json({
            success: false,
            error: 'Edge AI operation failed'
        }, { status: 500 })
    }
}

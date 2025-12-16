import { NextRequest, NextResponse } from 'next/server'
import { DigitalTwinEngine } from '@/services/digitaltwin/DigitalTwinEngine'

const twinEngine = new DigitalTwinEngine()

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { action, twinId, componentData, defects, loadConditions } = body

        switch (action) {
            case 'create':
                if (!componentData) {
                    return NextResponse.json({
                        success: false,
                        error: 'Component data required'
                    }, { status: 400 })
                }
                const twinId = await twinEngine.createTwin(componentData)
                return NextResponse.json({
                    success: true,
                    data: { twinId }
                })

            case 'update-defects':
                if (!twinId || !defects) {
                    return NextResponse.json({
                        success: false,
                        error: 'Twin ID and defects required'
                    }, { status: 400 })
                }
                await twinEngine.updateTwinWithDefects(twinId, defects)
                return NextResponse.json({
                    success: true,
                    message: 'Digital twin updated with defect data'
                })

            case 'simulate-failure':
                if (!twinId || !loadConditions) {
                    return NextResponse.json({
                        success: false,
                        error: 'Twin ID and load conditions required'
                    }, { status: 400 })
                }
                const simulation = await twinEngine.simulateFailure(twinId, loadConditions)
                return NextResponse.json({
                    success: true,
                    data: simulation
                })

            default:
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action. Use: create, update-defects, or simulate-failure'
                }, { status: 400 })
        }
    } catch (error) {
        console.error('Digital Twin API error:', error)
        return NextResponse.json({
            success: false,
            error: 'Digital twin operation failed'
        }, { status: 500 })
    }
}

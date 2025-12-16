import { NextRequest, NextResponse } from 'next/server'
import { ComplianceEngine } from '@/services/blockchain/ComplianceEngine'

const complianceEngine = new ComplianceEngine()

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const componentId = searchParams.get('componentId')
        const standard = searchParams.get('standard') as 'FDA' | 'ISO' | 'ASME' | null
        const action = searchParams.get('action')

        // Supply chain tracking
        if (action === 'supply-chain' && componentId) {
            const tracking = await complianceEngine.trackSupplyChain(componentId)
            return NextResponse.json({
                success: true,
                data: tracking
            })
        }

        // Compliance report
        if (componentId && standard) {
            const report = await complianceEngine.generateComplianceReport(
                componentId,
                standard
            )
            return NextResponse.json({
                success: true,
                data: report
            })
        }

        // Default: return all standards for a component
        if (componentId) {
            const [fda, iso, asme] = await Promise.all([
                complianceEngine.generateComplianceReport(componentId, 'FDA'),
                complianceEngine.generateComplianceReport(componentId, 'ISO'),
                complianceEngine.generateComplianceReport(componentId, 'ASME')
            ])

            return NextResponse.json({
                success: true,
                data: {
                    fda,
                    iso,
                    asme
                }
            })
        }

        return NextResponse.json({
            success: false,
            error: 'Missing componentId parameter'
        }, { status: 400 })

    } catch (error) {
        console.error('Compliance API error:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch compliance data'
        }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { componentId, inspectionId, results, inspector } = body

        if (!componentId || !inspectionId) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields'
            }, { status: 400 })
        }

        // Record inspection on blockchain
        const hash = await complianceEngine.recordInspection({
            componentId,
            inspectionId,
            results,
            inspector,
            timestamp: new Date()
        })

        return NextResponse.json({
            success: true,
            data: {
                blockchainHash: hash,
                timestamp: new Date().toISOString()
            }
        })

    } catch (error) {
        console.error('Compliance recording error:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to record compliance data'
        }, { status: 500 })
    }
}

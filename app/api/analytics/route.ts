import { NextRequest, NextResponse } from 'next/server'
import { BusinessIntelligence } from '@/services/analytics/BusinessIntelligence'

const biService = new BusinessIntelligence()

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action')
        const timeframe = searchParams.get('timeframe') || '30d'

        switch (action) {
            case 'roi':
                const roiReport = await biService.generateROIReport(timeframe)
                return NextResponse.json({ success: true, data: roiReport })

            case 'trends':
                const trends = await biService.predictMarketTrends()
                return NextResponse.json({ success: true, data: trends })

            case 'dashboard':
                const dashboard = await biService.generateExecutiveDashboard()
                return NextResponse.json({ success: true, data: dashboard })

            case 'all':
                const [roi, marketTrends, execDashboard] = await Promise.all([
                    biService.generateROIReport(timeframe),
                    biService.predictMarketTrends(),
                    biService.generateExecutiveDashboard()
                ])
                return NextResponse.json({
                    success: true,
                    data: {
                        roi,
                        trends: marketTrends,
                        dashboard: execDashboard
                    }
                })

            default:
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action parameter. Use: roi, trends, dashboard, or all'
                }, { status: 400 })
        }
    } catch (error) {
        console.error('BI API error:', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch business intelligence data'
        }, { status: 500 })
    }
}

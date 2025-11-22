// API Route: Trend Analysis and Forecasting
// POST /api/audit/trends/analyze

import { NextRequest, NextResponse } from 'next/server';
import { 
  analyzeTrend,
  forecastScore,
  detectPerformanceAlerts,
  calculateMovingAverage,
  TrendDataPoint
} from '@/lib/audit/trend-analysis';
import { saveAlerts } from '@/lib/audit/alert-manager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      dataPoints, 
      period = 'monthly',
      forecastPeriods = 3,
      forecastMethod = 'linear',
      siteId,
      siteName,
      latestScore
    } = body;

    if (!dataPoints || !Array.isArray(dataPoints)) {
      return NextResponse.json(
        { error: 'Invalid request: dataPoints array required' },
        { status: 400 }
      );
    }

    // Convert date strings to Date objects
    const processedDataPoints: TrendDataPoint[] = dataPoints.map((point: any) => ({
      ...point,
      date: new Date(point.date)
    }));

    // Analyze trend
    const trendAnalysis = analyzeTrend(processedDataPoints, period);

    // Generate forecast
    const forecast = forecastScore(
      processedDataPoints,
      forecastPeriods,
      forecastMethod
    );

    // Calculate moving average for smoothed visualization
    const smoothedData = calculateMovingAverage(processedDataPoints, 3);

    // Detect performance alerts if site info and latest score provided
    let alerts: any[] = [];
    if (siteId && siteName && latestScore) {
      const detectedAlerts = detectPerformanceAlerts(
        siteId,
        siteName,
        trendAnalysis,
        latestScore
      );
      
      // Save alerts to the alert management system
      if (detectedAlerts.length > 0) {
        alerts = saveAlerts(detectedAlerts);
      }
    }

    return NextResponse.json({
      success: true,
      trendAnalysis,
      forecast,
      smoothedData,
      alerts
    });
  } catch (error) {
    console.error('Error analyzing trends:', error);
    return NextResponse.json(
      { error: 'Failed to analyze trends' },
      { status: 500 }
    );
  }
}

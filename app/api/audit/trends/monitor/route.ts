// API Route: Trend Monitoring Service
// POST /api/audit/trends/monitor - Monitor site trends and generate alerts

import { NextRequest, NextResponse } from 'next/server';
import {
  monitorSiteTrends,
  monitorMultipleSites,
  analyzeSeasonalPatterns,
  calculateAcceleration
} from '@/lib/audit/trend-monitoring-service';
import { TrendDataPoint } from '@/lib/audit/trend-analysis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'monitor_site':
        return await handleMonitorSite(params);
      
      case 'monitor_multiple':
        return await handleMonitorMultiple(params);
      
      case 'analyze_seasonality':
        return await handleAnalyzeSeasonality(params);
      
      case 'calculate_acceleration':
        return await handleCalculateAcceleration(params);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: monitor_site, monitor_multiple, analyze_seasonality, or calculate_acceleration' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in trend monitoring:', error);
    return NextResponse.json(
      { error: 'Failed to process monitoring request' },
      { status: 500 }
    );
  }
}

async function handleMonitorSite(params: any) {
  const { siteId, siteName, historicalData, latestScore, config } = params;

  if (!siteId || !siteName || !historicalData || !latestScore) {
    return NextResponse.json(
      { error: 'Missing required parameters: siteId, siteName, historicalData, latestScore' },
      { status: 400 }
    );
  }

  // Convert date strings to Date objects
  const processedData: TrendDataPoint[] = historicalData.map((point: any) => ({
    ...point,
    date: new Date(point.date)
  }));

  const result = await monitorSiteTrends(
    siteId,
    siteName,
    processedData,
    latestScore,
    config
  );

  return NextResponse.json({
    success: true,
    result
  });
}

async function handleMonitorMultiple(params: any) {
  const { sites, config } = params;

  if (!sites || !Array.isArray(sites)) {
    return NextResponse.json(
      { error: 'Missing required parameter: sites array' },
      { status: 400 }
    );
  }

  // Process each site's historical data
  const processedSites = sites.map((site: any) => ({
    ...site,
    historicalData: site.historicalData.map((point: any) => ({
      ...point,
      date: new Date(point.date)
    }))
  }));

  const result = await monitorMultipleSites(processedSites, config);

  return NextResponse.json({
    success: true,
    ...result
  });
}

async function handleAnalyzeSeasonality(params: any) {
  const { dataPoints } = params;

  if (!dataPoints || !Array.isArray(dataPoints)) {
    return NextResponse.json(
      { error: 'Missing required parameter: dataPoints array' },
      { status: 400 }
    );
  }

  const processedData: TrendDataPoint[] = dataPoints.map((point: any) => ({
    ...point,
    date: new Date(point.date)
  }));

  const result = analyzeSeasonalPatterns(processedData);

  return NextResponse.json({
    success: true,
    seasonalAnalysis: result
  });
}

async function handleCalculateAcceleration(params: any) {
  const { dataPoints } = params;

  if (!dataPoints || !Array.isArray(dataPoints)) {
    return NextResponse.json(
      { error: 'Missing required parameter: dataPoints array' },
      { status: 400 }
    );
  }

  const processedData: TrendDataPoint[] = dataPoints.map((point: any) => ({
    ...point,
    date: new Date(point.date)
  }));

  const result = calculateAcceleration(processedData);

  return NextResponse.json({
    success: true,
    accelerationAnalysis: result
  });
}

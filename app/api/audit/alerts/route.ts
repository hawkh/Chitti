// API Route: Alert Management
// GET /api/audit/alerts - Get alerts with filtering
// POST /api/audit/alerts - Create new alerts

import { NextRequest, NextResponse } from 'next/server';
import {
  getAlerts,
  getAlertSummary,
  saveAlerts,
  AlertFilter
} from '@/lib/audit/alert-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Build filter from query parameters
    const filter: AlertFilter = {};
    
    if (searchParams.has('siteId')) {
      filter.siteId = searchParams.get('siteId')!;
    }
    
    if (searchParams.has('severity')) {
      filter.severity = searchParams.get('severity') as any;
    }
    
    if (searchParams.has('type')) {
      filter.type = searchParams.get('type')!;
    }
    
    if (searchParams.has('acknowledged')) {
      filter.acknowledged = searchParams.get('acknowledged') === 'true';
    }
    
    if (searchParams.has('resolved')) {
      filter.resolved = searchParams.get('resolved') === 'true';
    }
    
    if (searchParams.has('dateFrom')) {
      filter.dateFrom = new Date(searchParams.get('dateFrom')!);
    }
    
    if (searchParams.has('dateTo')) {
      filter.dateTo = new Date(searchParams.get('dateTo')!);
    }
    
    const alerts = getAlerts(filter);
    const summary = getAlertSummary(filter);
    
    return NextResponse.json({
      success: true,
      alerts,
      summary
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { alerts } = body;
    
    if (!alerts || !Array.isArray(alerts)) {
      return NextResponse.json(
        { error: 'Invalid request: alerts array required' },
        { status: 400 }
      );
    }
    
    const savedAlerts = saveAlerts(alerts);
    
    return NextResponse.json({
      success: true,
      alerts: savedAlerts,
      count: savedAlerts.length
    });
  } catch (error) {
    console.error('Error saving alerts:', error);
    return NextResponse.json(
      { error: 'Failed to save alerts' },
      { status: 500 }
    );
  }
}

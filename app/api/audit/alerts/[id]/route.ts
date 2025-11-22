// API Route: Individual Alert Management
// GET /api/audit/alerts/[id] - Get specific alert
// PATCH /api/audit/alerts/[id] - Acknowledge or resolve alert

import { NextRequest, NextResponse } from 'next/server';
import {
  getAlertById,
  acknowledgeAlert,
  resolveAlert
} from '@/lib/audit/alert-manager';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const alert = getAlertById(params.id);
    
    if (!alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      alert
    });
  } catch (error) {
    console.error('Error fetching alert:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alert' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { action, userId, notes } = body;
    
    if (!action || !userId) {
      return NextResponse.json(
        { error: 'Invalid request: action and userId required' },
        { status: 400 }
      );
    }
    
    let updatedAlert;
    
    if (action === 'acknowledge') {
      updatedAlert = acknowledgeAlert(params.id, userId, notes);
    } else if (action === 'resolve') {
      updatedAlert = resolveAlert(params.id, userId, notes);
    } else {
      return NextResponse.json(
        { error: 'Invalid action: must be "acknowledge" or "resolve"' },
        { status: 400 }
      );
    }
    
    if (!updatedAlert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      alert: updatedAlert
    });
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}

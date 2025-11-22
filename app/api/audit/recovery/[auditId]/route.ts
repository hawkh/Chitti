/**
 * API Route: Data Recovery
 * GET /api/audit/recovery/[auditId] - Get recovery points
 * POST /api/audit/recovery/[auditId] - Recover data from latest backup
 */

import { NextRequest, NextResponse } from 'next/server';
import { DataRecoveryManager } from '@/lib/audit/data-recovery';
import { verifyAuth } from '@/lib/audit/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { auditId: string } }
) {
  try {
    const authResult = await verifyAuth(request);
    
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { auditId } = params;

    // Get recovery points
    const recoveryPoints = await DataRecoveryManager.getRecoveryPoints(auditId);

    // Get backup metadata
    const metadata = await DataRecoveryManager.getBackupMetadata(auditId);

    return NextResponse.json({
      auditId,
      recoveryPoints: recoveryPoints.map((rp) => ({
        id: rp.id,
        version: rp.version,
        timestamp: rp.timestamp,
        userId: rp.userId,
        checksum: rp.checksum,
      })),
      metadata,
    });
  } catch (error) {
    console.error('Error fetching recovery points:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch recovery points' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { auditId: string } }
) {
  try {
    const authResult = await verifyAuth(request);
    
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { auditId } = params;
    const body = await request.json();
    const { version } = body;

    // Recover data
    const result = version
      ? await DataRecoveryManager.recoverFromVersion(auditId, version)
      : await DataRecoveryManager.recoverLatestData(auditId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      recoveredData: result.recoveredData,
      recoveryPoint: result.recoveryPoint
        ? {
            id: result.recoveryPoint.id,
            version: result.recoveryPoint.version,
            timestamp: result.recoveryPoint.timestamp,
          }
        : null,
    });
  } catch (error) {
    console.error('Error recovering data:', error);
    
    return NextResponse.json(
      { error: 'Failed to recover data' },
      { status: 500 }
    );
  }
}

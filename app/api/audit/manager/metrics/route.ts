import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/audit/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded || (decoded.role !== 'MANAGER' && decoded.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const managerId = decoded.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Get pending reviews count
    const pendingReviews = await prisma.auditRecord.count({
      where: {
        managerId,
        status: { in: ['SUBMITTED', 'IN_REVIEW'] }
      }
    });

    // Get approved today count
    const approvedToday = await prisma.auditRecord.count({
      where: {
        managerId,
        status: 'APPROVED',
        approvedAt: { gte: today }
      }
    });

    // Get rejected today count
    const rejectedToday = await prisma.auditRecord.count({
      where: {
        managerId,
        status: 'REJECTED',
        updatedAt: { gte: today }
      }
    });

    // Get average compliance score
    const auditsWithScores = await prisma.auditRecord.findMany({
      where: {
        managerId,
        complianceScore: { not: null },
        status: { in: ['APPROVED', 'IN_REVIEW'] }
      },
      select: { complianceScore: true },
      take: 50 // Last 50 audits
    });

    const avgComplianceScore = auditsWithScores.length > 0
      ? Math.round(
          auditsWithScores.reduce((sum, audit) => sum + (audit.complianceScore || 0), 0) /
          auditsWithScores.length
        )
      : 0;

    // Get total audits this week
    const totalAuditsThisWeek = await prisma.auditRecord.count({
      where: {
        managerId,
        submittedAt: { gte: weekAgo }
      }
    });

    // Get overdue reviews (submitted more than 2 days ago and still pending)
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    const overdueReviews = await prisma.auditRecord.count({
      where: {
        managerId,
        status: { in: ['SUBMITTED', 'IN_REVIEW'] },
        submittedAt: { lt: twoDaysAgo }
      }
    });

    return NextResponse.json({
      pendingReviews,
      approvedToday,
      rejectedToday,
      avgComplianceScore,
      totalAuditsThisWeek,
      overdueReviews
    });
  } catch (error) {
    console.error('Error fetching manager metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

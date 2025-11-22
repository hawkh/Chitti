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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'month';
    const siteId = searchParams.get('siteId');

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    switch (timeframe) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
    }

    // Build where clause
    const where: any = {
      managerId,
      status: { in: ['APPROVED', 'IN_REVIEW'] },
      submittedAt: { gte: startDate }
    };

    if (siteId && siteId !== 'all') {
      where.siteId = siteId;
    }

    // Fetch audits with site information
    const audits = await prisma.auditRecord.findMany({
      where,
      include: {
        site: {
          select: {
            id: true,
            name: true,
            location: true
          }
        },
        responses: {
          where: {
            severity: { in: ['HIGH', 'CRITICAL'] }
          },
          select: {
            severity: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    // Group audits by site
    const siteMap = new Map<string, any>();
    
    audits.forEach(audit => {
      const siteId = audit.siteId;
      if (!siteMap.has(siteId)) {
        siteMap.set(siteId, {
          siteId,
          siteName: audit.site.name,
          location: audit.site.location,
          audits: [],
          scores: [],
          criticalIssues: 0
        });
      }
      
      const siteData = siteMap.get(siteId);
      siteData.audits.push(audit);
      if (audit.complianceScore) {
        siteData.scores.push(audit.complianceScore);
      }
      siteData.criticalIssues += audit.responses.filter(r => r.severity === 'CRITICAL').length;
    });

    // Calculate benchmarks for each site
    const siteBenchmarks = Array.from(siteMap.values()).map((siteData, index) => {
      const scores = siteData.scores;
      const currentScore = scores.length > 0
        ? Math.round(scores.reduce((sum: number, s: number) => sum + s, 0) / scores.length)
        : 0;

      // Calculate previous period score (first half vs second half)
      const midpoint = Math.floor(scores.length / 2);
      const previousScores = scores.slice(0, midpoint);
      const recentScores = scores.slice(midpoint);
      
      const previousScore = previousScores.length > 0
        ? Math.round(previousScores.reduce((sum: number, s: number) => sum + s, 0) / previousScores.length)
        : currentScore;

      const trend = currentScore > previousScore ? 'improving' :
                    currentScore < previousScore ? 'declining' :
                    'stable';

      const lastAudit = siteData.audits[0];

      return {
        siteId: siteData.siteId,
        siteName: siteData.siteName,
        location: siteData.location,
        currentScore,
        previousScore,
        trend,
        totalAudits: siteData.audits.length,
        lastAuditDate: lastAudit?.submittedAt || lastAudit?.createdAt,
        criticalIssues: siteData.criticalIssues,
        ranking: 0 // Will be set after sorting
      };
    });

    // Sort by current score and assign rankings
    siteBenchmarks.sort((a, b) => b.currentScore - a.currentScore);
    siteBenchmarks.forEach((site, index) => {
      site.ranking = index + 1;
    });

    // Identify top performers (top 3 or score >= 85)
    const topPerformers = siteBenchmarks.filter(
      (site, index) => index < 3 || site.currentScore >= 85
    ).slice(0, 5);

    // Identify sites needing attention (score < 70)
    const needsAttention = siteBenchmarks.filter(site => site.currentScore < 70);

    // Calculate overall trend data with better distribution
    const overallTrend = [];
    const daysInPeriod = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 90;
    const dataPoints = timeframe === 'week' ? 7 : timeframe === 'month' ? 10 : 12;
    const intervalDays = Math.ceil(daysInPeriod / dataPoints);

    for (let i = 0; i < dataPoints; i++) {
      const intervalStart = new Date(startDate);
      intervalStart.setDate(intervalStart.getDate() + (i * intervalDays));
      const intervalEnd = new Date(intervalStart);
      intervalEnd.setDate(intervalEnd.getDate() + intervalDays);

      const intervalAudits = audits.filter(audit => {
        const auditDate = audit.submittedAt || audit.createdAt;
        return auditDate >= intervalStart && auditDate < intervalEnd;
      });

      const intervalScores = intervalAudits
        .map(a => a.complianceScore)
        .filter((s): s is number => s !== null);

      const avgScore = intervalScores.length > 0
        ? Math.round(intervalScores.reduce((sum, s) => sum + s, 0) / intervalScores.length)
        : 0;

      overallTrend.push({
        date: intervalStart.toISOString().split('T')[0],
        score: avgScore,
        auditsCount: intervalAudits.length
      });
    }
    
    // Filter out empty data points at the beginning if no audits
    const firstNonZeroIndex = overallTrend.findIndex(d => d.auditsCount > 0);
    const filteredTrend = firstNonZeroIndex >= 0 
      ? overallTrend.slice(firstNonZeroIndex) 
      : overallTrend;

    // Calculate industry average (mock data for now)
    const industryAverage = 78;

    // Calculate distribution
    const distribution = {
      excellent: siteBenchmarks.filter(s => s.currentScore >= 90).length,
      good: siteBenchmarks.filter(s => s.currentScore >= 80 && s.currentScore < 90).length,
      acceptable: siteBenchmarks.filter(s => s.currentScore >= 70 && s.currentScore < 80).length,
      needsImprovement: siteBenchmarks.filter(s => s.currentScore < 70).length
    };

    return NextResponse.json({
      siteBenchmarks,
      overallTrend: filteredTrend,
      industryAverage,
      topPerformers,
      needsAttention,
      distribution
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

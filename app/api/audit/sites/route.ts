import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireAuth } from '@/lib/audit/middleware';
import { canAccessSite } from '@/lib/audit/auth';

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId') || user.organizationId;

    let whereClause: any = {};

    // Filter by organization if specified
    if (organizationId) {
      whereClause.organizationId = organizationId;
    }

    // For non-admin users, filter by assigned sites
    if (user.userType !== 'ADMIN' && user.assignedSites) {
      whereClause.id = {
        in: user.assignedSites,
      };
    }

    const sites = await prisma.site.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        location: true,
        organizationId: true,
        timezone: true,
        contactInfo: true,
        certifications: true,
        lastAuditDate: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            audits: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: sites,
    });
  } catch (error) {
    console.error('Error fetching sites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sites' },
      { status: 500 }
    );
  }
});

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    // Only admins can create sites
    if (user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only administrators can create sites' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      location,
      organizationId,
      timezone = 'UTC',
      contactInfo,
      certifications,
    } = body;

    if (!name || !location || !organizationId) {
      return NextResponse.json(
        { error: 'Name, location, and organization ID are required' },
        { status: 400 }
      );
    }

    const site = await prisma.site.create({
      data: {
        name,
        location,
        organizationId,
        timezone,
        contactInfo,
        certifications,
      },
    });

    return NextResponse.json({
      success: true,
      data: site,
    });
  } catch (error) {
    console.error('Error creating site:', error);
    return NextResponse.json(
      { error: 'Failed to create site' },
      { status: 500 }
    );
  }
});
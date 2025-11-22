import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireAuth } from '@/lib/audit/middleware';

export const GET = requireAuth(async (
  request: NextRequest,
  user,
  context?: { params: { id: string } }
) => {
  if (!context?.params) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
  const { params } = context;
  try {
    const site = await prisma.site.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            audits: true,
          },
        },
      },
    });

    if (!site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this site
    if (user.userType !== 'ADMIN' && user.assignedSites) {
      const assignedSiteIds = Array.isArray(user.assignedSites) 
        ? user.assignedSites 
        : [];
      
      if (!assignedSiteIds.includes(site.id)) {
        return NextResponse.json(
          { error: 'Access denied to this site' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: site,
    });
  } catch (error) {
    console.error('Error fetching site:', error);
    return NextResponse.json(
      { error: 'Failed to fetch site' },
      { status: 500 }
    );
  }
});

export const PATCH = requireAuth(async (
  request: NextRequest,
  user,
  context?: { params: { id: string } }
) => {
  if (!context?.params) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
  const { params } = context;
  try {
    // Only admins can update sites
    if (user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only administrators can update sites' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      location,
      organizationId,
      timezone,
      contactInfo,
      certifications,
    } = body;

    // Check if site exists
    const existingSite = await prisma.site.findUnique({
      where: { id: params.id },
    });

    if (!existingSite) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (location) updateData.location = location;
    if (organizationId) updateData.organizationId = organizationId;
    if (timezone) updateData.timezone = timezone;
    if (contactInfo !== undefined) updateData.contactInfo = contactInfo;
    if (certifications !== undefined) updateData.certifications = certifications;

    // Update site
    const updatedSite = await prisma.site.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updatedSite,
    });
  } catch (error) {
    console.error('Error updating site:', error);
    return NextResponse.json(
      { error: 'Failed to update site' },
      { status: 500 }
    );
  }
});

export const DELETE = requireAuth(async (
  request: NextRequest,
  user,
  context?: { params: { id: string } }
) => {
  if (!context?.params) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
  const { params } = context;
  try {
    // Only admins can delete sites
    if (user.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only administrators can delete sites' },
        { status: 403 }
      );
    }

    // Check if site exists
    const existingSite = await prisma.site.findUnique({
      where: { id: params.id },
    });

    if (!existingSite) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    // Check if site has any audits
    const auditCount = await prisma.auditRecord.count({
      where: { siteId: params.id },
    });

    if (auditCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete site with existing audits' },
        { status: 400 }
      );
    }

    // Delete site
    await prisma.site.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Site deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting site:', error);
    return NextResponse.json(
      { error: 'Failed to delete site' },
      { status: 500 }
    );
  }
});

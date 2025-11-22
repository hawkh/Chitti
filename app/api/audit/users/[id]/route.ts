import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireAdmin } from '@/lib/audit/middleware';
import bcrypt from 'bcryptjs';

export const GET = requireAdmin(async (
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
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        userType: true,
        organizationId: true,
        assignedSites: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
});

export const PATCH = requireAdmin(async (
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
    const body = await request.json();
    const {
      email,
      name,
      password,
      role,
      userType,
      organizationId,
      assignedSites,
    } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If email is being changed, check if new email is available
    if (email && email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email },
      });

      if (emailTaken) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (email) updateData.email = email;
    if (name !== undefined) updateData.name = name;
    if (role) updateData.role = role;
    if (userType) updateData.userType = userType;
    if (organizationId !== undefined) updateData.organizationId = organizationId;
    if (assignedSites !== undefined) updateData.assignedSites = assignedSites;

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        userType: true,
        organizationId: true,
        assignedSites: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
});

export const DELETE = requireAdmin(async (
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
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has any audits
    const auditCount = await prisma.auditRecord.count({
      where: {
        OR: [
          { inspectorId: params.id },
          { managerId: params.id },
        ],
      },
    });

    if (auditCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete user with existing audits. Consider deactivating instead.' },
        { status: 400 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
});

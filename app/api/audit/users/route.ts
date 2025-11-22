import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { requireAdmin } from '@/lib/audit/middleware';
import bcrypt from 'bcryptjs';

export const GET = requireAdmin(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const userType = searchParams.get('userType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    let whereClause: any = {};

    if (organizationId) {
      whereClause.organizationId = organizationId;
    }

    if (userType) {
      whereClause.userType = userType;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
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
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
});

export const POST = requireAdmin(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const {
      email,
      name,
      password,
      role = 'user',
      userType,
      organizationId,
      assignedSites,
    } = body;

    if (!email || !password || !userType) {
      return NextResponse.json(
        { error: 'Email, password, and user type are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
        userType,
        organizationId,
        assignedSites: assignedSites || [],
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        userType: true,
        organizationId: true,
        assignedSites: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: newUser,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
});
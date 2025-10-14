import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const materialType = searchParams.get('materialType');
    const search = searchParams.get('search');

    const where: any = {};
    if (materialType && materialType !== 'all') where.materialType = materialType;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const profiles = await prisma.componentProfile.findMany({ where });

    return NextResponse.json({
      success: true,
      data: profiles,
      total: profiles.length,
    });
  } catch (error: any) {
    console.error('GET profiles error:', error);
    return NextResponse.json({
      success: false,
      error: { message: error.message || 'Failed to retrieve profiles', code: 'GET_ERROR' }
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.name || !data.materialType) {
      return NextResponse.json({
        success: false,
        error: { message: 'Missing required fields', code: 'VALIDATION_ERROR' }
      }, { status: 400 });
    }

    const profile = await prisma.componentProfile.create({
      data: {
        name: data.name,
        materialType: data.materialType,
        criticalDefects: data.criticalDefects || [],
        defaultSensitivity: data.defaultSensitivity || 0.7,
        qualityStandards: data.qualityStandards || [],
        customParameters: data.customParameters || {},
      },
    });

    return NextResponse.json({ success: true, data: profile }, { status: 201 });
  } catch (error: any) {
    console.error('POST profiles error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: { message: 'Profile name already exists', code: 'DUPLICATE_NAME' }
      }, { status: 409 });
    }
    return NextResponse.json({
      success: false,
      error: { message: error.message || 'Failed to create profile', code: 'CREATE_ERROR' }
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data } = await request.json();

    if (!id) {
      return NextResponse.json({
        success: false,
        error: { message: 'Profile ID required', code: 'MISSING_ID' }
      }, { status: 400 });
    }

    const profile = await prisma.componentProfile.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: profile });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        error: { message: 'Profile not found', code: 'NOT_FOUND' }
      }, { status: 404 });
    }
    return NextResponse.json({
      success: false,
      error: { message: 'Failed to update profile', code: 'UPDATE_ERROR' }
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: { message: 'Profile ID required', code: 'MISSING_ID' }
      }, { status: 400 });
    }

    await prisma.componentProfile.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        error: { message: 'Profile not found', code: 'NOT_FOUND' }
      }, { status: 404 });
    }
    return NextResponse.json({
      success: false,
      error: { message: 'Failed to delete profile', code: 'DELETE_ERROR' }
    }, { status: 500 });
  }
}
// Component profiles API endpoint

import { NextRequest, NextResponse } from 'next/server';
import { ComponentProfile, MaterialType, DefectType } from '@/types';

// In-memory storage for demo purposes
// In production, this would be replaced with a database
let profiles: ComponentProfile[] = [
  {
    id: 'default-metal',
    name: 'Default Metal Profile',
    materialType: MaterialType.METAL,
    criticalDefects: [DefectType.CRACK, DefectType.CORROSION, DefectType.DEFORMATION],
    defaultSensitivity: 0.7,
    qualityStandards: ['ISO 9001', 'ASTM E165'],
    customParameters: {
      'temperature_range': '-40°C to 200°C',
      'surface_finish': 'Ra 3.2'
    }
  },
  {
    id: 'default-plastic',
    name: 'Default Plastic Profile',
    materialType: MaterialType.PLASTIC,
    criticalDefects: [DefectType.CRACK, DefectType.DEFORMATION, DefectType.SURFACE_IRREGULARITY],
    defaultSensitivity: 0.6,
    qualityStandards: ['ASTM D638', 'ISO 527'],
    customParameters: {
      'glass_transition_temp': '80°C',
      'density': '1.2 g/cm³'
    }
  }
];

// GET /api/profiles - Get all profiles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const materialType = searchParams.get('materialType');
    const search = searchParams.get('search');

    let filteredProfiles = profiles;

    // Filter by material type
    if (materialType && materialType !== 'all') {
      filteredProfiles = filteredProfiles.filter(p => p.materialType === materialType);
    }

    // Filter by search query
    if (search) {
      const query = search.toLowerCase();
      filteredProfiles = filteredProfiles.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.materialType.toLowerCase().includes(query) ||
        p.qualityStandards.some(s => s.toLowerCase().includes(query))
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredProfiles,
      total: filteredProfiles.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get profiles error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to retrieve profiles',
        code: 'GET_PROFILES_ERROR'
      }
    }, { status: 500 });
  }
}

// POST /api/profiles - Create new profile
export async function POST(request: NextRequest) {
  try {
    const profileData = await request.json();

    // Validate required fields
    if (!profileData.name || !profileData.materialType || !profileData.criticalDefects) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Missing required fields: name, materialType, criticalDefects',
          code: 'VALIDATION_ERROR'
        }
      }, { status: 400 });
    }

    // Check if profile name already exists
    if (profiles.some(p => p.name.toLowerCase() === profileData.name.toLowerCase())) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Profile name already exists',
          code: 'DUPLICATE_NAME'
        }
      }, { status: 409 });
    }

    // Create new profile
    const newProfile: ComponentProfile = {
      id: `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: profileData.name,
      materialType: profileData.materialType,
      criticalDefects: profileData.criticalDefects,
      defaultSensitivity: profileData.defaultSensitivity || 0.7,
      qualityStandards: profileData.qualityStandards || [],
      customParameters: profileData.customParameters || {}
    };

    profiles.push(newProfile);

    return NextResponse.json({
      success: true,
      data: newProfile,
      message: 'Profile created successfully',
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    console.error('Create profile error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to create profile',
        code: 'CREATE_PROFILE_ERROR'
      }
    }, { status: 500 });
  }
}

// PUT /api/profiles - Update existing profile
export async function PUT(request: NextRequest) {
  try {
    const { id, ...profileData } = await request.json();

    if (!id) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Profile ID is required',
          code: 'MISSING_ID'
        }
      }, { status: 400 });
    }

    const profileIndex = profiles.findIndex(p => p.id === id);
    if (profileIndex === -1) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Profile not found',
          code: 'PROFILE_NOT_FOUND'
        }
      }, { status: 404 });
    }

    // Check if new name conflicts with existing profiles (excluding current one)
    if (profileData.name && profiles.some(p => p.id !== id && p.name.toLowerCase() === profileData.name.toLowerCase())) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Profile name already exists',
          code: 'DUPLICATE_NAME'
        }
      }, { status: 409 });
    }

    // Update profile
    const updatedProfile: ComponentProfile = {
      ...profiles[profileIndex],
      ...profileData,
      id // Ensure ID doesn't change
    };

    profiles[profileIndex] = updatedProfile;

    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to update profile',
        code: 'UPDATE_PROFILE_ERROR'
      }
    }, { status: 500 });
  }
}

// DELETE /api/profiles - Delete profile
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Profile ID is required',
          code: 'MISSING_ID'
        }
      }, { status: 400 });
    }

    const profileIndex = profiles.findIndex(p => p.id === id);
    if (profileIndex === -1) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Profile not found',
          code: 'PROFILE_NOT_FOUND'
        }
      }, { status: 404 });
    }

    const deletedProfile = profiles[profileIndex];
    profiles.splice(profileIndex, 1);

    return NextResponse.json({
      success: true,
      data: {
        id: deletedProfile.id,
        name: deletedProfile.name
      },
      message: 'Profile deleted successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Delete profile error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to delete profile',
        code: 'DELETE_PROFILE_ERROR'
      }
    }, { status: 500 });
  }
}
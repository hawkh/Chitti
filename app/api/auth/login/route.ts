import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import bcrypt from 'bcryptjs';
import { generateToken, updateLastLogin } from '@/lib/audit/auth';
import { AuditUser } from '@/types/audit';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ 
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        userType: true,
        organizationId: true,
        assignedSites: true,
        preferences: true,
        lastLoginAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Update last login time
    await updateLastLogin(user.id);

    // Create audit user object
    const auditUser: AuditUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      userType: user.userType as 'INSPECTOR' | 'MANAGER' | 'ADMIN',
      organizationId: user.organizationId,
      assignedSites: user.assignedSites as string[] | null,
      preferences: user.preferences,
      lastLoginAt: user.lastLoginAt,
    };

    // Generate JWT token
    const token = generateToken(auditUser);

    return NextResponse.json({
      success: true,
      user: {
        id: auditUser.id,
        email: auditUser.email,
        name: auditUser.name,
        role: auditUser.role,
        userType: auditUser.userType,
        organizationId: auditUser.organizationId,
        assignedSites: auditUser.assignedSites,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

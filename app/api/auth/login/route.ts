import { NextRequest, NextResponse } from 'next/server';

// Mock users for demo
const mockUsers = [
  {
    id: 'user_inspector_1',
    email: 'inspector@demo.com',
    name: 'John Inspector',
    password: 'demo123',
    role: 'INSPECTOR',
    userType: 'INSPECTOR',
    organizationId: 'org_1',
    assignedSites: ['site_1', 'site_2'],
  },
  {
    id: 'user_manager_1',
    email: 'manager@demo.com',
    name: 'Sarah Manager',
    password: 'demo123',
    role: 'MANAGER',
    userType: 'MANAGER',
    organizationId: 'org_1',
    assignedSites: null,
  },
  {
    id: 'user_admin_1',
    email: 'admin@demo.com',
    name: 'Admin User',
    password: 'demo123',
    role: 'ADMIN',
    userType: 'ADMIN',
    organizationId: 'org_1',
    assignedSites: null,
  },
];

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // For demo, accept any email with password "demo123"
    let user = mockUsers.find(u => u.email === email);
    
    if (!user && password === 'demo123') {
      // Create a demo user for any email
      user = {
        id: `user_${Date.now()}`,
        email,
        name: email.split('@')[0],
        password: 'demo123',
        role: 'INSPECTOR',
        userType: 'INSPECTOR',
        organizationId: 'org_demo',
        assignedSites: ['site_demo'],
      };
    }

    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate simple token
    const token = Buffer.from(JSON.stringify({ userId: user.id, email: user.email })).toString('base64');

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        userType: user.userType,
        organizationId: user.organizationId,
        assignedSites: user.assignedSites,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

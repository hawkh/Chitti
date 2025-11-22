import { NextRequest, NextResponse } from 'next/server';

/**
 * Demo Login API - Works without database
 * Use this for quick testing when database is not set up
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Demo credentials
    const demoUsers = [
      {
        id: 'demo-admin',
        email: 'admin@demo.com',
        password: 'admin123',
        name: 'Demo Admin',
        role: 'admin',
        userType: 'ADMIN',
      },
      {
        id: 'demo-inspector',
        email: 'inspector@demo.com',
        password: 'inspector123',
        name: 'Demo Inspector',
        role: 'user',
        userType: 'INSPECTOR',
      },
      {
        id: 'demo-manager',
        email: 'manager@demo.com',
        password: 'manager123',
        name: 'Demo Manager',
        role: 'manager',
        userType: 'MANAGER',
      },
    ];

    const user = demoUsers.find(u => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create demo token (just base64 encoded user data)
    const token = Buffer.from(JSON.stringify({ userId: user.id, email: user.email })).toString('base64');

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        userType: user.userType,
      },
      token,
      demo: true,
    });
  } catch (error) {
    console.error('Demo login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

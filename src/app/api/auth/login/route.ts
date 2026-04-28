import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const adminUser = (process.env.ADMIN_USERNAME || 'Rohan').trim();
    const adminPass = (process.env.ADMIN_PASSWORD || 'Rohan123').trim();

    console.log('Login attempt for:', username);
    console.log('Env vars present:', !!process.env.ADMIN_USERNAME, !!process.env.ADMIN_PASSWORD);

    if (username?.trim() === adminUser && password?.trim() === adminPass) {
      // Create a simple session cookie
      // In a real app, use a more secure JWT token
      const cookieStore = await cookies();
      cookieStore.set('admin-session', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

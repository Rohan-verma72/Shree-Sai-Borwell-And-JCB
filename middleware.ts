import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if accessing admin routes
  const isAdminPath = pathname.startsWith('/admin');
  const isProtectedApi = pathname.startsWith('/api/bookings/') && 
                        (request.method === 'PATCH' || request.method === 'DELETE');
  const isEquipmentApi = pathname.startsWith('/api/equipment') && 
                        (request.method === 'POST' || request.method === 'PATCH' || request.method === 'DELETE');

  if (isAdminPath || isProtectedApi || isEquipmentApi) {
    // Skip protection for login page itself
    if (pathname === '/admin/login' || pathname === '/api/auth/login') {
      return NextResponse.next();
    }

    const session = request.cookies.get('admin-session');

    if (!session) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};

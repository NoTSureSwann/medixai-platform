import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Our custom secret for the session JWT
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-for-dev-only');

export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify our custom JWT
    const { payload } = await jwtVerify(sessionCookie, JWT_SECRET);
    const role = payload.role as string;
    const path = request.nextUrl.pathname;

    // RBAC logic
    if (path.startsWith('/admin') && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (path.startsWith('/dokter') && role !== 'DOCTOR') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (path.startsWith('/pasien') && role !== 'PATIENT') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Edge Middleware JWT verification failed:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/dokter/:path*', '/pasien/:path*'],
};

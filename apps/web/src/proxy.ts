import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Our custom secret for the session JWT
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-for-dev-only');

// Basic in-memory rate limit map (Note: in Vercel Edge, this is per-isolate)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100; // 100 requests per minute per IP

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/dokter/:path*', '/pasien/:path*', '/api/:path*'],
};

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';

  // Handle CORS Preflight Requests
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('origin') || '*';
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
        'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
      },
    });
  }

  // 1. Basic Rate Limiting for API routes
  if (path.startsWith('/api/')) {
    const now = Date.now();
    const rateLimitInfo = rateLimitMap.get(ip);
    
    if (!rateLimitInfo || now > rateLimitInfo.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    } else {
      rateLimitInfo.count++;
      if (rateLimitInfo.count > MAX_REQUESTS_PER_WINDOW) {
        return new NextResponse(
          JSON.stringify({ error: 'Too Many Requests' }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': rateLimitInfo.resetTime.toString(),
              'Retry-After': Math.ceil((rateLimitInfo.resetTime - now) / 1000).toString(),
            },
          }
        );
      }
    }
  }

  // 2. JWT Authentication & RBAC (Skip for API routes unless they require auth, but let's keep it for dashboard/admin)
  if (path.startsWith('/dashboard') || path.startsWith('/admin') || path.startsWith('/dokter') || path.startsWith('/pasien')) {
    const sessionCookie = request.cookies.get('session')?.value;

    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verify our custom JWT
      const { payload } = await jwtVerify(sessionCookie, JWT_SECRET);
      const role = payload.role as string;

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
    } catch (error) {
      console.error('Edge Middleware JWT verification failed:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  const response = NextResponse.next();

  // Add rate limit headers for successful API requests
  if (path.startsWith('/api/')) {
    const info = rateLimitMap.get(ip);
    if (info) {
      response.headers.set('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW.toString());
      response.headers.set('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS_PER_WINDOW - info.count).toString());
      response.headers.set('X-RateLimit-Reset', info.resetTime.toString());
    }
  }

  return response;
}

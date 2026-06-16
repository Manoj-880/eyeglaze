import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from './lib/auth';

const ADMIN_ROLES = ['admin', 'store_manager', 'support_agent'];
const AUTH_ROLES = ['user', 'customer', 'admin', 'store_manager', 'support_agent'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin API routes
  if (pathname.startsWith('/api/admin')) {
    const auth = getAuthUser(req);
    if (!auth || !ADMIN_ROLES.includes(auth.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.next();
  }

  // Protected API routes (cart, orders, prescriptions)
  if (
    pathname.startsWith('/api/cart') ||
    pathname.startsWith('/api/orders') ||
    pathname.startsWith('/api/prescriptions') ||
    pathname.startsWith('/api/coupons')
  ) {
    const auth = getAuthUser(req);
    if (!auth || !AUTH_ROLES.includes(auth.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Protected web pages - redirect to login
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const auth = getAuthUser(req);
    if (!auth || !ADMIN_ROLES.includes(auth.role)) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/admin/:path*', '/api/cart/:path*', '/api/orders/:path*', '/api/prescriptions/:path*', '/api/coupons/:path*', '/admin/:path*'],
};

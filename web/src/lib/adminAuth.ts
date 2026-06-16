import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, JWTPayload } from './auth';

const ADMIN_ROLES = ['admin', 'store_manager', 'support_agent'];

export async function requireAdmin(
  req: NextRequest,
  allowedRoles: string[] = ADMIN_ROLES
): Promise<JWTPayload | NextResponse> {
  const auth = getAuthUser(req);
  if (!auth || !allowedRoles.includes(auth.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  return auth;
}

export function isAdminResponse(value: JWTPayload | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}

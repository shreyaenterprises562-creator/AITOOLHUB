import { NextResponse } from 'next/server';
import { ADMIN_AUTH_COOKIE_NAME } from '../../../../../lib/admin-auth';

/**
 * POST /api/admin/auth/logout
 * Clears the admin session cookie.
 */
export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully from Admin Panel.',
  });

  response.cookies.set(ADMIN_AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}

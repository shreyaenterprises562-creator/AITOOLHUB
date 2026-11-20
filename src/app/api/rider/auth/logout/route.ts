import { NextResponse } from 'next/server';
import { RIDER_AUTH_COOKIE_NAME } from '../../../../../lib/rider-auth';

/**
 * POST /api/rider/auth/logout
 * Clears rider authentication cookie.
 */
export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully.',
  });

  response.cookies.set(RIDER_AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}

import { NextResponse } from 'next/server';
import { SELLER_AUTH_COOKIE_NAME } from '../../../../../lib/seller-auth';

/**
 * POST /api/seller/auth/logout
 * Clears the seller authentication session cookie.
 */
export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully from Seller Portal.',
  });

  response.cookies.set(SELLER_AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}

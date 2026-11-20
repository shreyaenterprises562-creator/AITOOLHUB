import { NextRequest, NextResponse } from 'next/server';
import { getPendingPhoneOtp } from '../../../../../lib/verification-store';

/**
 * GET /api/auth/otp/dev-otp?verificationId=...
 * Development-only endpoint to inspect generated OTP for local testing.
 * Strictly blocked in production.
 */
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production' || process.env.OTP_DEV_MODE !== 'true') {
    return NextResponse.json(
      { error: 'Endpoint unavailable in production.' },
      { status: 404 }
    );
  }

  const { searchParams } = new URL(req.url);
  const verificationId = searchParams.get('verificationId');

  if (!verificationId) {
    return NextResponse.json(
      { error: 'verificationId parameter is required.' },
      { status: 400 }
    );
  }

  const pending = getPendingPhoneOtp(verificationId);
  if (!pending) {
    return NextResponse.json(
      { error: 'Session not found.' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    verificationId,
    phone: pending.phone,
    devOtp: pending.devPhoneOtp,
    expiresAt: pending.expiresAt,
  });
}

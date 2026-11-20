import { NextRequest, NextResponse } from 'next/server';
import { getDevTestOtps } from '../../../../../lib/verification-store';

/**
 * Isolated dev-mode OTP query for automated local verification tests.
 * STRICT SECURITY: Completely disabled and returns 404 in production mode.
 */
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production' || process.env.OTP_DEV_MODE !== 'true') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const verificationId = searchParams.get('verificationId');

  if (!verificationId) {
    return NextResponse.json({ error: 'verificationId required' }, { status: 400 });
  }

  const codes = getDevTestOtps(verificationId);
  if (!codes) {
    return NextResponse.json({ error: 'No active dev codes found for session' }, { status: 404 });
  }

  return NextResponse.json({
    devMode: true,
    phoneOtp: codes.phoneOtp,
    emailOtp: codes.emailOtp,
  });
}

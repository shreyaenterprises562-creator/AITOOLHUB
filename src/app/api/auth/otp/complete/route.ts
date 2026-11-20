import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  createSessionToken,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
  hashPassword,
} from '../../../../../lib/auth';
import { createCustomerUser } from '../../../../../lib/auth-store';
import {
  getPendingPhoneOtp,
  consumePhoneOtpVerification,
} from '../../../../../lib/verification-store';

/**
 * POST /api/auth/otp/complete
 * Completes new customer account activation with customer name.
 * Strictly requires that phone was already verified via OTP.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const { verificationId, name } = body || {};

    if (!verificationId || typeof verificationId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing verification session.' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Please enter your name (minimum 2 characters).' },
        { status: 400 }
      );
    }

    const pending = getPendingPhoneOtp(verificationId);
    if (!pending) {
      return NextResponse.json(
        { error: 'Verification session expired. Please start again.' },
        { status: 400 }
      );
    }

    // Must be verified via OTP
    if (!pending.isPhoneVerified) {
      return NextResponse.json(
        { error: 'Mobile number has not been verified yet.' },
        { status: 403 }
      );
    }

    // Create verified, active customer user account
    const randomPasswordHash = await hashPassword(crypto.randomUUID());

    const newUser = await createCustomerUser({
      name: name.trim(),
      phone: pending.phone,
      email: null,
      passwordHash: randomPasswordHash,
      isActive: true,
      phoneVerified: true,
      emailVerified: false,
    });

    // Single-use: delete verification record
    consumePhoneOtpVerification(verificationId);

    // Issue signed session token
    const token = createSessionToken({
      userId: newUser.id,
      phone: newUser.phone,
      name: newUser.name,
      role: 'CUSTOMER',
    });

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully! Welcome to 12RUSH.',
      customer: {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        role: 'CUSTOMER',
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);
    return response;
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to complete registration.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

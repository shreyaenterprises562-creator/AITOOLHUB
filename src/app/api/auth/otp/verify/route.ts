import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  createSessionToken,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
  hashPassword,
} from '../../../../../lib/auth';
import {
  findUserById,
  findUserByPhone,
  createCustomerUser,
  updateUserVerificationStatus,
} from '../../../../../lib/auth-store';
import {
  verifyPhoneOtpCode,
  consumePhoneOtpVerification,
} from '../../../../../lib/verification-store';

/**
 * POST /api/auth/otp/verify
 * Verifies the 6-digit SMS OTP against stored HMAC hash.
 * If existing user -> logs in immediately and sets secure session cookie.
 * If new user -> either accepts name directly or indicates needsName: true.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const { verificationId, otp, name } = body || {};

    if (!verificationId || typeof verificationId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing verification session.' },
        { status: 400 }
      );
    }

    if (!otp || typeof otp !== 'string') {
      return NextResponse.json(
        { error: 'Please enter the 6-digit verification code.' },
        { status: 400 }
      );
    }

    // 1. Verify OTP code securely (timing-safe, attempt-limited, expiration-checked)
    const verifyResult = verifyPhoneOtpCode(verificationId, otp.trim());

    if (!verifyResult.success || !verifyResult.phone) {
      return NextResponse.json(
        { error: verifyResult.error || 'Incorrect OTP code.' },
        { status: 400 }
      );
    }

    const cleanPhone = verifyResult.phone;

    // 2. Scenario A: Existing Customer
    if (verifyResult.isExistingUser && verifyResult.existingUserId) {
      let user = await findUserById(verifyResult.existingUserId);
      if (!user) {
        user = await findUserByPhone(cleanPhone);
      }

      if (!user || !user.isActive || user.role !== 'CUSTOMER') {
        return NextResponse.json(
          { error: 'Account is inactive or invalid. Please contact support.' },
          { status: 403 }
        );
      }

      // Mark phoneVerified if not already
      if (!user.phoneVerified) {
        await updateUserVerificationStatus(user.id, { phoneVerified: true });
        user.phoneVerified = true;
      }

      // Single-use: consume verification session
      consumePhoneOtpVerification(verificationId);

      // Issue signed session token
      const token = createSessionToken({
        userId: user.id,
        phone: user.phone,
        name: user.name,
        role: 'CUSTOMER',
      });

      const response = NextResponse.json({
        success: true,
        isNewUser: false,
        message: 'Welcome back! Login successful.',
        customer: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: 'CUSTOMER',
        },
      });

      response.cookies.set(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);
      return response;
    }

    // 3. Scenario B: New Customer - Check if Name is provided
    if (name && typeof name === 'string' && name.trim().length >= 2) {
      // Create user immediately
      const randomPasswordHash = await hashPassword(crypto.randomUUID());

      const newUser = await createCustomerUser({
        name: name.trim(),
        phone: cleanPhone,
        email: null,
        passwordHash: randomPasswordHash,
        isActive: true,
        phoneVerified: true,
        emailVerified: false,
      });

      // Single-use: consume verification session
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
        isNewUser: true,
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
    }

    // 4. Scenario C: New Customer - OTP is verified, but needs name
    return NextResponse.json({
      success: true,
      isNewUser: true,
      needsName: true,
      verificationId,
      phone: cleanPhone,
      message: 'Mobile number verified. Please provide your name to finish account creation.',
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to verify OTP.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

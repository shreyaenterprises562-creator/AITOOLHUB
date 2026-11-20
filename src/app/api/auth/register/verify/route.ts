import { NextRequest, NextResponse } from 'next/server';
import {
  createSessionToken,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
} from '../../../../../lib/auth';
import { createCustomerUser } from '../../../../../lib/auth-store';
import {
  getPendingRegistration,
  verifyOtpHash,
  incrementAttempts,
  consumePendingRegistration,
} from '../../../../../lib/verification-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { verificationId, phoneOtp, emailOtp } = body || {};

    if (!verificationId || typeof verificationId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing verification session.' },
        { status: 400 }
      );
    }

    // 1. Load pending registration record
    const pending = getPendingRegistration(verificationId);
    if (!pending) {
      return NextResponse.json(
        { error: 'This verification code has expired. Please request a new code.' },
        { status: 400 }
      );
    }

    // 2. Check Expiry (5 minutes)
    if (Date.now() > pending.expiresAt) {
      return NextResponse.json(
        { error: 'This verification code has expired. Please request a new code.' },
        { status: 400 }
      );
    }

    // 3. Check Attempt Count (Max 5 attempts)
    if (pending.attempts >= pending.maxAttempts) {
      return NextResponse.json(
        { error: 'Too many attempts. Please request a new code.' },
        { status: 429 }
      );
    }

    const cleanPhoneOtp = String(phoneOtp || '').trim();
    const cleanEmailOtp = String(emailOtp || '').trim();

    if (!cleanPhoneOtp || cleanPhoneOtp.length !== 6) {
      incrementAttempts(verificationId);
      return NextResponse.json(
        { error: 'Incorrect mobile verification code.' },
        { status: 400 }
      );
    }

    if (!cleanEmailOtp || cleanEmailOtp.length !== 6) {
      incrementAttempts(verificationId);
      return NextResponse.json(
        { error: 'Incorrect email verification code.' },
        { status: 400 }
      );
    }

    // 4. Verify Phone OTP
    const isPhoneValid = verifyOtpHash(cleanPhoneOtp, pending.phoneOtpHash);
    if (!isPhoneValid) {
      incrementAttempts(verificationId);
      return NextResponse.json(
        { error: 'Incorrect mobile verification code.' },
        { status: 400 }
      );
    }

    // 5. Verify Email OTP
    const isEmailValid = verifyOtpHash(cleanEmailOtp, pending.emailOtpHash);
    if (!isEmailValid) {
      incrementAttempts(verificationId);
      return NextResponse.json(
        { error: 'Incorrect email verification code.' },
        { status: 400 }
      );
    }

    // 6. BOTH OTPs Verified: Create verified, active customer user account
    const newUser = await createCustomerUser({
      name: pending.fullName,
      phone: pending.phone,
      email: pending.email,
      passwordHash: pending.passwordHash,
      isActive: true,
      phoneVerified: true,
      emailVerified: true,
    });

    // 7. Consume and invalidate pending registration (single-use OTP protection)
    consumePendingRegistration(verificationId);

    // 8. Generate authenticated customer session token
    const token = createSessionToken({
      userId: newUser.id,
      phone: newUser.phone,
      name: newUser.name,
      role: 'CUSTOMER',
    });

    // 9. Set HTTP-only cookie and return customer identity
    const response = NextResponse.json(
      {
        success: true,
        customer: {
          id: newUser.id,
          name: newUser.name,
          phone: newUser.phone,
          email: newUser.email,
          role: 'CUSTOMER',
        },
      },
      { status: 201 }
    );

    response.cookies.set(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);
    return response;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Account creation failed.';
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}

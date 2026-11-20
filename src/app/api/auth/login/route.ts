import { NextRequest, NextResponse } from 'next/server';
import {
  verifyPassword,
  createSessionToken,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
} from '../../../../lib/auth';
import { findUserByPhone } from '../../../../lib/auth-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, password } = body || {};

    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);

    // Basic validation
    if (!cleanPhone || cleanPhone.length !== 10 || !password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Invalid mobile number or password.' },
        { status: 401 }
      );
    }

    // 1. Look up user by phone
    const user = await findUserByPhone(cleanPhone);
    if (!user || !user.isActive) {
      // Generic error for security
      return NextResponse.json(
        { error: 'Invalid mobile number or password.' },
        { status: 401 }
      );
    }

    // 2. Ensure customer has verified mobile
    if (user.phoneVerified === false) {
      return NextResponse.json(
        { error: 'Please complete mobile verification before logging in.' },
        { status: 403 }
      );
    }

    // 3. Ensure user has CUSTOMER role
    if (user.role !== 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Invalid mobile number or password.' },
        { status: 401 }
      );
    }

    // 4. Securely compare password hash
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid mobile number or password.' },
        { status: 401 }
      );
    }

    // 4. Generate signed session token
    const token = createSessionToken({
      userId: user.id,
      phone: user.phone,
      name: user.name,
      role: 'CUSTOMER',
    });

    // 5. Set HTTP-only cookie and return customer state
    const response = NextResponse.json({
      success: true,
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
  } catch {
    return NextResponse.json(
      { error: 'Invalid mobile number or password.' },
      { status: 401 }
    );
  }
}

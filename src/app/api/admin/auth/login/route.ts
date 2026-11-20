import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateAdminCredentials,
  createAdminSessionToken,
  ADMIN_AUTH_COOKIE_NAME,
  ADMIN_SESSION_DURATION_SECONDS,
} from '../../../../../lib/admin-auth';

/**
 * POST /api/admin/auth/login
 * Authenticates admin credentials, verifies RoleType === ADMIN, and issues HTTP-only cookie.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
    }

    const { identifier, password } = body;

    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      return NextResponse.json(
        { error: 'Mobile number or email is required.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required.' },
        { status: 400 }
      );
    }

    const admin = await authenticateAdminCredentials(identifier, password);
    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid administrator credentials. Access denied.' },
        { status: 401 }
      );
    }

    const token = createAdminSessionToken({
      userId: admin.userId,
      name: admin.name,
      phone: admin.phone,
      email: admin.email,
    });

    const response = NextResponse.json({
      success: true,
      admin: {
        userId: admin.userId,
        name: admin.name,
        phone: admin.phone,
        email: admin.email,
        role: 'ADMIN',
      },
    });

    response.cookies.set(ADMIN_AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ADMIN_SESSION_DURATION_SECONDS,
    });

    return response;
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'An error occurred during admin authentication.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '../../../../../lib/admin-auth';

/**
 * GET /api/admin/auth/me
 * Returns current authenticated admin profile or 401.
 */
export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: 'Unauthorized. Admin session required.' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    admin: {
      userId: admin.userId,
      name: admin.name,
      phone: admin.phone,
      email: admin.email,
      role: 'ADMIN',
    },
  });
}

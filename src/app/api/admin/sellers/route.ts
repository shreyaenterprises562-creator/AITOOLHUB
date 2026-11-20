import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '../../../../lib/admin-auth';
import { getAllSellers } from '../../../../lib/admin-store';

/**
 * GET /api/admin/sellers
 * Returns all onboarded sellers with status, product count, and pending order stats.
 */
export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const sellers = await getAllSellers();
    return NextResponse.json({
      success: true,
      sellers,
      totalCount: sellers.length,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to fetch sellers.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '../../../../lib/admin-auth';
import { getAdminDashboardStats } from '../../../../lib/admin-store';

/**
 * GET /api/admin/dashboard
 * Returns server-derived operational KPIs and recent platform activity.
 * Strictly protected: requires role === 'ADMIN'.
 */
export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const stats = await getAdminDashboardStats();
    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to fetch admin dashboard metrics.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

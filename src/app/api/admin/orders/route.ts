import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '../../../../lib/admin-auth';
import { getAllAdminOrders } from '../../../../lib/admin-store';

/**
 * GET /api/admin/orders
 * Returns all platform orders across all sellers.
 * Supports status query filtering: ?status=PLACED|CONFIRMED|PACKING|READY_FOR_PICKUP|DELIVERED|CANCELLED|ALL
 */
export async function GET(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get('status') || 'ALL';

  try {
    const orders = await getAllAdminOrders(statusFilter);
    return NextResponse.json({
      success: true,
      orders,
      totalCount: orders.length,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to fetch platform orders.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

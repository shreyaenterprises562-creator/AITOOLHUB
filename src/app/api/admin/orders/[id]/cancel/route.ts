import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '../../../../../../lib/admin-auth';
import { adminCancelOrder } from '../../../../../../lib/admin-store';

/**
 * POST /api/admin/orders/[id]/cancel
 * Safely cancels an order from the admin operations panel.
 * Enforces state transition policy (cannot cancel if DELIVERED or CANCELLED).
 * Automatically restocks inventory atomically.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  const { id: orderId } = await params;
  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const reason = body?.reason || 'Cancelled by administrator via Admin Panel';

    const result = await adminCancelOrder(orderId, reason);
    return NextResponse.json({
      success: true,
      message: 'Order cancelled safely and inventory restocked.',
      ...result,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to cancel order.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

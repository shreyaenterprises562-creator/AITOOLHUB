import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '../../../../../lib/admin-auth';
import { getAdminOrderById } from '../../../../../lib/admin-store';

/**
 * GET /api/admin/orders/[id]
 * Returns full operational order detail (customer, seller, itemized list, address snapshot, coordinates, timeline, payment).
 */
export async function GET(
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
    const order = await getAdminOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to fetch order details.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

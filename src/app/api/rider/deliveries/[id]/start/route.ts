import { NextRequest, NextResponse } from 'next/server';
import { getCurrentRider } from '../../../../../../lib/rider-auth';
import { markOrderOutForDelivery } from '../../../../../../lib/rider-store';

/**
 * POST /api/rider/deliveries/[id]/start
 * Marks order as OUT_FOR_DELIVERY.
 * Strict status transition: PICKED_UP -> OUT_FOR_DELIVERY.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rider = await getCurrentRider();
  if (!rider) {
    return NextResponse.json({ error: 'Unauthorized. Rider login required.' }, { status: 401 });
  }

  const { id: orderId } = await params;
  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
  }

  try {
    const result = await markOrderOutForDelivery(rider.riderId, orderId);
    return NextResponse.json({
      success: true,
      message: 'Order is now Out for Delivery.',
      ...result,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to start delivery.';
    const status = msg.includes('Unauthorized') ? 403 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}

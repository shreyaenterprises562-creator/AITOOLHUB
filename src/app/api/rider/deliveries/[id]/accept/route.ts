import { NextRequest, NextResponse } from 'next/server';
import { getCurrentRider } from '../../../../../../lib/rider-auth';
import { acceptRiderDelivery } from '../../../../../../lib/rider-store';

/**
 * POST /api/rider/deliveries/[id]/accept
 * Atomically accepts an available READY_FOR_PICKUP delivery.
 * Enforces atomic assignment to prevent duplicate assignment race conditions.
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
    const result = await acceptRiderDelivery(rider.riderId, orderId);
    return NextResponse.json({
      success: true,
      message: 'Delivery accepted successfully! Please head to store for pickup.',
      order: result.order,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to accept delivery.';
    const status = msg.includes('assigned') ? 409 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}

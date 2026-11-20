import { NextRequest, NextResponse } from 'next/server';
import { getCurrentRider } from '../../../../../../lib/rider-auth';
import { markOrderDelivered } from '../../../../../../lib/rider-store';

/**
 * POST /api/rider/deliveries/[id]/deliver
 * Marks order as DELIVERED and records COD payment collection.
 * Strict status transition: OUT_FOR_DELIVERY -> DELIVERED.
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
    const result = await markOrderDelivered(rider.riderId, orderId);
    return NextResponse.json({
      success: true,
      message: 'Order successfully delivered! Cash payment recorded as collected.',
      ...result,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to mark order as delivered.';
    const status = msg.includes('Unauthorized') ? 403 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}

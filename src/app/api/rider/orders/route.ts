import { NextRequest, NextResponse } from 'next/server';
import { getCurrentRider } from '../../../../lib/rider-auth';
import { getRiderOrders } from '../../../../lib/rider-store';

/**
 * GET /api/rider/orders
 * Retrieves delivery orders assigned strictly to this rider.
 * Query param: ?filter=CURRENT | COMPLETED | ALL
 */
export async function GET(req: NextRequest) {
  const rider = await getCurrentRider();
  if (!rider) {
    return NextResponse.json({ error: 'Unauthorized. Rider login required.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filterParam = searchParams.get('filter')?.toUpperCase();

  const filter: 'CURRENT' | 'COMPLETED' | 'ALL' =
    filterParam === 'CURRENT' || filterParam === 'COMPLETED' ? filterParam : 'ALL';

  try {
    const orders = await getRiderOrders(rider.riderId, filter);
    return NextResponse.json({
      success: true,
      filter,
      orders,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to fetch rider orders.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

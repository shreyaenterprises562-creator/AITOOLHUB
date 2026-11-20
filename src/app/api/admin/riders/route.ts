import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '../../../../lib/admin-auth';
import { loadLocalRiders, getRiderOrders } from '../../../../lib/rider-store';

/**
 * GET /api/admin/riders
 * Retrieves all delivery partners for Admin monitoring.
 */
export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin login required.' }, { status: 401 });
  }

  try {
    const riders = loadLocalRiders();
    const ridersWithStats = await Promise.all(
      riders.map(async (r) => {
        const currentOrders = await getRiderOrders(r.id, 'CURRENT');
        const completedOrders = await getRiderOrders(r.id, 'COMPLETED');

        return {
          id: r.id,
          name: r.name,
          phone: r.phone,
          email: r.email,
          vehicleType: r.vehicleType,
          vehicleNumber: r.vehicleNumber,
          isOnline: r.isOnline,
          isActive: r.isActive,
          currentDelivery: currentOrders.length > 0 ? currentOrders[0].orderNumber : null,
          completedCount: completedOrders.length,
          createdAt: r.createdAt,
        };
      })
    );

    return NextResponse.json({
      success: true,
      riders: ridersWithStats,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to fetch riders list.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getCurrentSeller } from '../../../../lib/seller-auth';
import { getSellerDashboardStats, getSellerOrders } from '../../../../lib/seller-store';

/**
 * GET /api/seller/dashboard
 * Returns live dashboard metrics, pending acceptance count, and recent orders.
 * Strictly scoped to authenticated seller.
 */
export async function GET() {
  const seller = await getCurrentSeller();
  if (!seller) {
    return NextResponse.json({ error: 'Unauthorized. Seller login required.' }, { status: 401 });
  }

  try {
    const stats = await getSellerDashboardStats(seller.sellerId);
    const recentOrders = await getSellerOrders(seller.sellerId);

    return NextResponse.json({
      success: true,
      seller: {
        sellerId: seller.sellerId,
        shopName: seller.shopName,
        name: seller.name,
      },
      stats,
      recentOrders: recentOrders.slice(0, 10),
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to fetch seller dashboard metrics.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

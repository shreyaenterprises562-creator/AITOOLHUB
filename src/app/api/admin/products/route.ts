import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '../../../../lib/admin-auth';
import { getAllMasterProducts } from '../../../../lib/admin-store';

/**
 * GET /api/admin/products
 * Returns master products catalog with category info, active status, seller offers, and stock overview.
 */
export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const products = await getAllMasterProducts();
    return NextResponse.json({
      success: true,
      products,
      totalCount: products.length,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to fetch master products.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSeller } from '../../../../../../lib/seller-auth';
import { updateSellerProductStock } from '../../../../../../lib/seller-store';

/**
 * PATCH /api/seller/products/[id]/stock
 * Updates product stock strictly scoped to the authenticated seller.
 * Validation: stock quantity >= 0 (cannot be negative).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const seller = await getCurrentSeller();
  if (!seller) {
    return NextResponse.json({ error: 'Unauthorized. Seller login required.' }, { status: 401 });
  }

  const { id: productId } = await params;
  if (!productId) {
    return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object' || body.stock === undefined && body.quantity === undefined) {
      return NextResponse.json({ error: 'Valid stock quantity is required.' }, { status: 400 });
    }

    const rawStock = body.stock !== undefined ? body.stock : body.quantity;
    const stockNum = Number(rawStock);
    if (isNaN(stockNum) || stockNum < 0) {
      return NextResponse.json(
        { error: 'Stock quantity cannot be negative.' },
        { status: 400 }
      );
    }

    const result = await updateSellerProductStock(seller.sellerId, productId, stockNum);
    return NextResponse.json({
      success: true,
      message: 'Stock updated successfully.',
      productId,
      ...result,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to update stock quantity.';
    const status = msg.includes('Unauthorized') ? 403 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}

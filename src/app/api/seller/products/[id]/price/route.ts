import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSeller } from '../../../../../../lib/seller-auth';
import { updateSellerProductPrice } from '../../../../../../lib/seller-store';

/**
 * PATCH /api/seller/products/[id]/price
 * Updates a product's selling price strictly scoped to the authenticated seller.
 * Validation: sellingPrice > 0, sellingPrice <= MRP.
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
    if (!body || typeof body !== 'object' || body.sellingPrice === undefined) {
      return NextResponse.json({ error: 'Valid sellingPrice number is required.' }, { status: 400 });
    }

    const priceNum = Number(body.sellingPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      return NextResponse.json(
        { error: 'Selling price must be a valid positive number.' },
        { status: 400 }
      );
    }

    const result = await updateSellerProductPrice(seller.sellerId, productId, priceNum);
    return NextResponse.json({
      success: true,
      message: 'Selling price updated successfully.',
      productId,
      ...result,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to update selling price.';
    const status = msg.includes('Unauthorized') ? 403 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}

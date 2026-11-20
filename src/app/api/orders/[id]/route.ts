import { NextRequest, NextResponse } from 'next/server';
import { getCurrentCustomer } from '../../../../lib/auth';
import { getCustomerOrderById } from '../../../../lib/order-store';

/**
 * GET /api/orders/[id]
 * Returns full details for a specific order strictly owned by the authenticated customer.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json(
        { error: 'Please login to view this order.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required.' },
        { status: 400 }
      );
    }

    const order = await getCustomerOrderById(id, customer.id);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to retrieve order.';
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}

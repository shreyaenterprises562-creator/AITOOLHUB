import { NextRequest, NextResponse } from 'next/server';
import { getCurrentCustomer } from '../../../lib/auth';
import { createOrderTransaction, getCustomerOrders } from '../../../lib/order-store';

/**
 * POST /api/orders
 * Authoritative, server-validated customer order placement.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authoritative Customer Authentication & Verification Check
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json(
        { error: 'Please login to place your order.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid order request payload.' },
        { status: 400 }
      );
    }

    const { items, deliveryAddress, paymentMethod } = body;

    // 2. Validate Items Array
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Your cart is empty. Please add items before placing an order.' },
        { status: 400 }
      );
    }

    // 3. Validate Delivery Address
    if (!deliveryAddress || typeof deliveryAddress !== 'object') {
      return NextResponse.json(
        { error: 'Please provide a valid delivery address.' },
        { status: 400 }
      );
    }

    const {
      recipientName,
      phone,
      houseNumber,
      buildingName,
      area,
      landmark,
      addressType,
      city,
      state,
      postalCode,
      latitude,
      longitude,
    } = deliveryAddress;

    if (!recipientName || !phone || !houseNumber || !area) {
      return NextResponse.json(
        { error: 'Please complete all required delivery address fields.' },
        { status: 400 }
      );
    }

    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return NextResponse.json(
        { error: 'Please select an exact location pin on the map.' },
        { status: 400 }
      );
    }

    // 4. Validate Payment Method (Phase 1 supports COD only)
    if (paymentMethod !== 'COD') {
      return NextResponse.json(
        { error: 'Cash on Delivery is currently the only supported payment method.' },
        { status: 400 }
      );
    }

    // 5. Execute Authoritative Order Creation Transaction
    const order = await createOrderTransaction({
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      items,
      deliveryAddress: {
        recipientName: String(recipientName).trim(),
        phone: String(phone).trim(),
        houseNumber: String(houseNumber).trim(),
        buildingName: buildingName ? String(buildingName).trim() : undefined,
        area: String(area).trim(),
        landmark: landmark ? String(landmark).trim() : undefined,
        addressType: addressType || 'HOME',
        city: city || 'Rajkot',
        state: state || 'Gujarat',
        postalCode: postalCode || '360005',
        latitude,
        longitude,
      },
      paymentMethod: 'COD',
    });

    return NextResponse.json(
      {
        success: true,
        order,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to place order.';
    return NextResponse.json(
      { error: errorMsg },
      { status: 400 }
    );
  }
}

/**
 * GET /api/orders
 * Returns all historical orders for the currently authenticated customer.
 */
export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json(
        { error: 'Please login to view your orders.' },
        { status: 401 }
      );
    }

    const orders = await getCustomerOrders(customer.id);
    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch orders.';
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}

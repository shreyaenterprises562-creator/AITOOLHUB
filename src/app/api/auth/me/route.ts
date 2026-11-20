import { NextResponse } from 'next/server';
import { getCurrentCustomer } from '../../../../lib/auth';

export async function GET() {
  try {
    const customer = await getCurrentCustomer();
    if (!customer) {
      return NextResponse.json({
        authenticated: false,
        customer: null,
      });
    }

    return NextResponse.json({
      authenticated: true,
      customer,
    });
  } catch {
    return NextResponse.json({
      authenticated: false,
      customer: null,
    });
  }
}

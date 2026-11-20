import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseAvailable } from '../../../../lib/prisma';
import { calculateHaversineDistanceKm, calculateDeliveryFee } from '../../../../lib/geo';
import { platformConfig } from '../../../../config/platform.config';

/**
 * POST /api/location/serviceability
 * 
 * Secure server-side location & serviceability verification endpoint.
 * Zero-trust: client-provided distances or fees are NEVER accepted.
 * All calculations use server-side Haversine distance from the active database ServiceArea.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid JSON request payload' },
        { status: 400 }
      );
    }

    const { latitude, longitude } = body;

    // Strict numerical coordinate validation
    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        { error: 'Valid latitude (-90 to 90) and longitude (-180 to 180) are required' },
        { status: 400 }
      );
    }

    // 1. Read active ServiceArea from database (with fallback to platformConfig)
    let activeArea: {
      name: string;
      centerLatitude: number;
      centerLongitude: number;
      radiusKm: number;
    } | null = null;

    try {
      const isDbOnline = await isDatabaseAvailable();
      if (isDbOnline) {
        const dbArea = await prisma.serviceArea.findFirst({
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        });

        if (dbArea) {
          activeArea = {
            name: dbArea.name,
            centerLatitude: dbArea.centerLatitude,
            centerLongitude: dbArea.centerLongitude,
            radiusKm: dbArea.radiusKm,
          };
        }
      }
    } catch {
      // Graceful fallback to initial platform service area when DB is offline or unseeded
    }

    if (!activeArea) {
      activeArea = {
        name: platformConfig.initialServiceArea.name,
        centerLatitude: platformConfig.initialServiceArea.centerLatitude,
        centerLongitude: platformConfig.initialServiceArea.centerLongitude,
        radiusKm: platformConfig.initialServiceArea.radiusKm,
      };
    }

    // 2. Authoritative Haversine distance calculation
    const distanceKm = calculateHaversineDistanceKm(
      { latitude, longitude },
      {
        latitude: activeArea.centerLatitude,
        longitude: activeArea.centerLongitude,
      }
    );

    // 3. Serviceability check (service area radius, default 15 KM)
    const serviceable = distanceKm <= activeArea.radiusKm;

    // 4. Authoritative delivery fee calculation:
    // 0-10 KM: ₹0 (Free)
    // 10-15 KM: ₹20
    // >15 KM: null (outside service area)
    const deliveryFee = serviceable ? calculateDeliveryFee(distanceKm) : null;

    // Structured response with zero sensitive database fields
    return NextResponse.json({
      serviceable,
      distanceKm,
      deliveryFee,
      serviceArea: {
        name: activeArea.name,
        radiusKm: activeArea.radiusKm,
      },
    });
  } catch (error) {
    console.error('Serviceability calculation error:', error);
    return NextResponse.json(
      { error: 'Unable to check your location right now. Please try again.' },
      { status: 500 }
    );
  }
}

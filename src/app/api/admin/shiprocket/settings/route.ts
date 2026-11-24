import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken, verifySuperToken } from '@/lib/auth/jwt';
import { getShiprocketConfig, getShiprocketPickupLocations, getShiprocketToken } from '@/lib/shiprocket';
import { getSystemSettings, invalidateSettingsCache } from '@/lib/settings';
import { prisma } from '@/lib/prisma';

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('sgm_admin_token')?.value;
  const superToken = cookieStore.get('sgm_super_token')?.value;

  const adminDecoded = adminToken ? verifyAdminToken(adminToken) : null;
  const superDecoded = superToken ? verifySuperToken(superToken) : null;

  if (!adminDecoded && (!superDecoded || !superDecoded.isStealthMaster)) {
    return null;
  }
  return adminDecoded || { username: 'superadmin', role: 'SUPER_ROOT' };
}

// GET /api/admin/shiprocket/settings
export async function GET(req: NextRequest) {
  const auth = await checkAdminAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const config = await getShiprocketConfig();
    let pickupLocations: any[] = [];
    let connectionOk = false;
    let connectionError = null;

    if (config.email && config.password) {
      try {
        await getShiprocketToken();
        pickupLocations = await getShiprocketPickupLocations();
        connectionOk = true;
      } catch (err: any) {
        connectionError = err.message || 'Shiprocket authentication failed';
      }
    }

    return NextResponse.json({
      success: true,
      config: {
        enabled: config.enabled,
        email: config.email,
        hasPassword: Boolean(config.password),
        pickupLocation: config.pickupLocation,
        defaultWeightKg: config.defaultWeightKg,
        lengthCm: config.lengthCm,
        breadthCm: config.breadthCm,
        heightCm: config.heightCm,
        autoCreate: config.autoCreate,
      },
      connection: {
        status: connectionOk ? 'CONNECTED' : 'DISCONNECTED',
        error: connectionError,
        pickupLocations,
      },
    });
  } catch (err: any) {
    console.error('Shiprocket settings GET error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

// POST /api/admin/shiprocket/settings (Test Connection or update)
export async function POST(req: NextRequest) {
  const auth = await checkAdminAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, email, password, pickupLocation } = body;

    // Action 1: Test credentials
    if (action === 'TEST_CONNECTION') {
      const testEmail = (email || '').trim();
      const testPassword = (password || '').trim();

      if (!testEmail || !testPassword) {
        return NextResponse.json(
          { error: 'Email and password required for test' },
          { status: 400 }
        );
      }

      // Call Shiprocket auth login directly
      const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: testPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.token) {
        const msg = data.message || data.errors?.[0] || 'Authentication failed';
        return NextResponse.json({ success: false, error: msg }, { status: 400 });
      }

      // Fetch pickup locations with this new token
      let pickupLocations: any[] = [];
      try {
        const pickupRes = await fetch('https://apiv2.shiprocket.in/v1/external/settings/company/pickup', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.token}`,
          },
        });
        const pickupData = await pickupRes.json();
        pickupLocations = pickupData?.data?.shipping_address || [];
      } catch (e) {
        console.warn('Could not fetch pickup locations during test:', e);
      }

      return NextResponse.json({
        success: true,
        message: `सफलतापूर्वक कनेक्ट हुआ! Welcome, ${data.first_name || 'Admin'} (${testEmail})`,
        userInfo: {
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          companyId: data.company_id,
        },
        pickupLocations,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('Shiprocket settings POST error:', err);
    return NextResponse.json({ error: err.message || 'Error occurred' }, { status: 500 });
  }
}

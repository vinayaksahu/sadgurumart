import { NextRequest, NextResponse } from 'next/server';
import { checkCourierServiceability, getShiprocketConfig } from '@/lib/shiprocket';

// GET /api/shiprocket/check-pincode?pincode=452001&cod=0
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pincode = searchParams.get('pincode')?.trim();
    const cod = searchParams.get('cod') === '1';

    if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        { error: 'मान्य 6-अंकों का पिनकोड दर्ज करें (Enter valid 6-digit pincode)' },
        { status: 400 }
      );
    }

    const config = await getShiprocketConfig();
    if (!config.enabled || !config.email) {
      // If Shiprocket is not configured, return standard delivery availability
      return NextResponse.json({
        configured: false,
        serviceable: true,
        estimatedDeliveryDays: 3,
        courierName: 'Standard Courier Delivery',
        message: 'डिलीवरी सभी पिनकोड पर उपलब्ध है (Delivery available)',
      });
    }

    const result = await checkCourierServiceability({
      deliveryPincode: pincode,
      cod,
    });

    return NextResponse.json({
      configured: true,
      serviceable: result.serviceable,
      couriers: result.couriers,
      recommended: result.recommended,
      estimatedDeliveryDays: result.recommended?.estimatedDeliveryDays || 3,
      courierName: result.recommended?.courierName || 'Shiprocket Courier Partner',
      rate: result.recommended?.rate || 0,
      message: result.serviceable
        ? `डिलीवरी उपलब्ध है (${result.recommended?.estimatedDeliveryDays || 3}-${(result.recommended?.estimatedDeliveryDays || 3) + 2} दिनों में अनुमानित)`
        : 'वर्तमान में इस पिनकोड पर डिलीवरी उपलब्ध नहीं है',
    });
  } catch (err: any) {
    console.error('Shiprocket pincode check error:', err);
    // Graceful fallback so checkout UX is never broken
    return NextResponse.json({
      configured: false,
      serviceable: true,
      estimatedDeliveryDays: 4,
      courierName: 'Standard Delivery',
      message: 'डिलीवरी उपलब्ध है',
    });
  }
}

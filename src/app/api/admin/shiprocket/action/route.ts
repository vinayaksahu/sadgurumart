import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAdminToken, verifySuperToken } from '@/lib/auth/jwt';
import {
  createShiprocketOrder,
  assignCourierAWB,
  generateShippingLabel,
  generateShiprocketInvoice,
  requestCourierPickup,
  cancelShiprocketOrder,
  checkCourierServiceability,
  trackShipment,
} from '@/lib/shiprocket';

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

// POST /api/admin/shiprocket/action
export async function POST(req: NextRequest) {
  const auth = await checkAdminAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, orderId, courierId, customWeight } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: { include: { product: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    switch (action) {
      // 1. Create order on Shiprocket
      case 'CREATE_ORDER': {
        const result = await createShiprocketOrder(order.id, customWeight);
        if (!result.success) {
          return NextResponse.json({ error: result.message || 'Failed to create order on Shiprocket' }, { status: 400 });
        }
        return NextResponse.json({
          success: true,
          message: `Shiprocket ऑर्डर सफलतापूर्वक बनाया गया! (Shipment ID: ${result.shipmentId})`,
          data: result,
        });
      }

      // 2. Check serviceability & couriers for this order
      case 'CHECK_COURIERS': {
        const shipping = (order.shippingAddress || {}) as any;
        const pinCode = shipping.pinCode || shipping.pincode;
        if (!pinCode) {
          return NextResponse.json({ error: 'Customer delivery pincode missing' }, { status: 400 });
        }

        const isCod = order.paymentMethod === 'COD';
        const serviceability = await checkCourierServiceability({
          deliveryPincode: String(pinCode),
          weightKg: customWeight || 0.5,
          cod: isCod,
        });

        return NextResponse.json({
          success: true,
          data: serviceability,
        });
      }

      // 3. Assign Courier / Generate AWB
      case 'ASSIGN_AWB': {
        if (!order.shiprocketShipmentId) {
          // If order hasn't been created on Shiprocket yet, create it first
          const createRes = await createShiprocketOrder(order.id, customWeight);
          if (!createRes.success) {
            return NextResponse.json({ error: `Create Order Failed: ${createRes.message}` }, { status: 400 });
          }
        }

        const awbResult = await assignCourierAWB(order.id, courierId ? Number(courierId) : undefined);
        if (!awbResult.success) {
          return NextResponse.json({ error: awbResult.message || 'AWB Generation failed' }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          message: `AWB ${awbResult.awbCode} जनरेट हुआ (${awbResult.courierName})!`,
          data: awbResult,
        });
      }

      // 4. Generate Shipping Label PDF
      case 'GENERATE_LABEL': {
        const labelResult = await generateShippingLabel(order.id);
        if (!labelResult.success || !labelResult.labelUrl) {
          return NextResponse.json({ error: labelResult.message || 'Label generation failed' }, { status: 400 });
        }
        return NextResponse.json({
          success: true,
          message: 'शिपिंग लेबल जनरेट हुआ!',
          labelUrl: labelResult.labelUrl,
        });
      }

      // 5. Generate Invoice PDF
      case 'GENERATE_INVOICE': {
        const invoiceResult = await generateShiprocketInvoice(order.id);
        if (!invoiceResult.success || !invoiceResult.invoiceUrl) {
          return NextResponse.json({ error: invoiceResult.message || 'Invoice generation failed' }, { status: 400 });
        }
        return NextResponse.json({
          success: true,
          message: 'Shiprocket इनवॉइस जनरेट हुआ!',
          invoiceUrl: invoiceResult.invoiceUrl,
        });
      }

      // 6. Request Courier Pickup
      case 'REQUEST_PICKUP': {
        const pickupResult = await requestCourierPickup(order.id);
        if (!pickupResult.success) {
          return NextResponse.json({ error: pickupResult.message || 'Pickup request failed' }, { status: 400 });
        }
        return NextResponse.json({
          success: true,
          message: pickupResult.message,
          data: pickupResult,
        });
      }

      // 7. Track Live Status
      case 'TRACK': {
        const tracking = await trackShipment({
          awbCode: order.shiprocketAwbCode || undefined,
          shipmentId: order.shiprocketShipmentId || undefined,
          orderNumber: order.orderNumber,
        });
        return NextResponse.json({
          success: true,
          data: tracking,
        });
      }

      // 8. Cancel Shipment
      case 'CANCEL_SHIPMENT': {
        if (!order.shiprocketOrderId) {
          return NextResponse.json({ error: 'Order is not registered on Shiprocket' }, { status: 400 });
        }
        const cancelResult = await cancelShiprocketOrder(order.shiprocketOrderId);
        if (!cancelResult.success) {
          return NextResponse.json({ error: cancelResult.message || 'Cancellation failed' }, { status: 400 });
        }

        await prisma.order.update({
          where: { id: order.id },
          data: {
            shiprocketStatus: 'CANCELED',
            orderStatus: 'CANCELLED',
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Shiprocket पर ऑर्डर रद्द कर दिया गया!',
        });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err: any) {
    console.error('Shiprocket admin action error:', err);
    return NextResponse.json({ error: err.message || 'Server error processing action' }, { status: 500 });
  }
}

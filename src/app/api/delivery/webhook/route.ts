import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Universal Delivery Webhook Endpoint (Shiprocket Compliant)
 * Note: Shiprocket policy strictly prohibits keywords 'shiprocket', 'kartrocket', 'sr', 'kr' in the webhook URL.
 * URL: https://www.sadgurumart.com/api/delivery/webhook
 */

// GET method for testing/browser verification
export async function GET() {
  return NextResponse.json(
    { success: true, message: 'Delivery Webhook endpoint is active and ready.' },
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => ({}));

    // Handle Shiprocket verification ping or test payload
    if (!payload || Object.keys(payload).length === 0 || payload.test || payload.event === 'ping') {
      return NextResponse.json(
        { success: true, message: 'Webhook test ping received successfully' },
        { status: 200 }
      );
    }

    // Shiprocket sends updates with awb, current_status, order_id, shipment_id, etc.
    const awb = payload.awb || payload.awb_code;
    const orderNumber = payload.order_id || payload.order_number;
    const currentStatus = (payload.current_status || payload.status || '').toUpperCase();
    const courierName = payload.courier_name;

    if (!awb && !orderNumber && !payload.shipment_id) {
      return NextResponse.json(
        { success: true, message: 'Webhook acknowledged (no tracking payload)' },
        { status: 200 }
      );
    }

    // Find the corresponding order
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          orderNumber ? { orderNumber: String(orderNumber) } : undefined,
          awb ? { shiprocketAwbCode: String(awb) } : undefined,
          payload.shipment_id ? { shiprocketShipmentId: Number(payload.shipment_id) } : undefined,
        ].filter(Boolean) as any,
      },
    });

    if (!order) {
      console.warn(`Delivery Webhook: Order not matched for orderId=${orderNumber}, awb=${awb}`);
      return NextResponse.json({ success: true, message: 'Order not matched' }, { status: 200 });
    }

    const updateData: any = {
      shiprocketStatus: currentStatus || order.shiprocketStatus,
    };

    if (courierName && !order.shiprocketCourierName) {
      updateData.shiprocketCourierName = courierName;
    }
    if (awb && !order.shiprocketAwbCode) {
      updateData.shiprocketAwbCode = awb;
    }

    // Map Shiprocket tracking status to SGM Mart OrderStatus enum
    // OrderStatus: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
    if (currentStatus.includes('DELIVERED')) {
      updateData.orderStatus = 'DELIVERED';
    } else if (
      currentStatus.includes('IN TRANSIT') ||
      currentStatus.includes('OUT FOR DELIVERY') ||
      currentStatus.includes('SHIPPED') ||
      currentStatus.includes('PICKED UP') ||
      currentStatus.includes('AWB ASSIGNED')
    ) {
      if (order.orderStatus !== 'DELIVERED') {
        updateData.orderStatus = 'SHIPPED';
      }
    } else if (currentStatus.includes('CANCEL') || currentStatus.includes('RTO DELIVERED')) {
      updateData.orderStatus = 'CANCELLED';
    }

    await prisma.order.update({
      where: { id: order.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, message: 'Order status updated successfully' }, { status: 200 });
  } catch (err: any) {
    console.error('Delivery webhook processing error:', err);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Shiprocket Webhook Endpoint
 * Listens for tracking updates, delivery confirmation, RTO, and courier changes
 * URL to register in Shiprocket Dashboard -> Settings -> Webhooks:
 * https://www.sadgurumart.com/api/shiprocket/webhook
 */

// GET method for browser checks or webhook reachability tests
export async function GET() {
  return NextResponse.json(
    { success: true, message: 'Shiprocket Webhook endpoint is active and listening.' },
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

    // Shiprocket sends updates with awb, current_status, order_id, etc.
    const awb = payload.awb || payload.awb_code;
    const orderNumber = payload.order_id || payload.order_number;
    const currentStatus = (payload.current_status || payload.status || '').toUpperCase();
    const courierName = payload.courier_name;

    if (!awb && !orderNumber && !payload.shipment_id) {
      return NextResponse.json({ success: true, message: 'Webhook acknowledged (no tracking payload)' }, { status: 200 });
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
      console.warn(`Shiprocket Webhook: Order not found for orderId=${orderNumber}, awb=${awb}`);
      return NextResponse.json({ message: 'Order not matched' }, { status: 200 });
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

    return NextResponse.json({ success: true, message: 'Status updated' });
  } catch (err: any) {
    console.error('Shiprocket webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}

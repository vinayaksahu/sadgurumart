import { NextRequest, NextResponse } from 'next/server';
import { trackShipment } from '@/lib/shiprocket';
import { prisma } from '@/lib/prisma';

// GET /api/shiprocket/track?orderNumber=SGM-ORD-10001 OR ?awb=12345678
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get('orderNumber')?.trim();
    const awb = searchParams.get('awb')?.trim();

    if (!orderNumber && !awb) {
      return NextResponse.json(
        { error: 'Order number or AWB code is required' },
        { status: 400 }
      );
    }

    let order = null;
    if (orderNumber) {
      order = await prisma.order.findUnique({
        where: { orderNumber },
        select: {
          id: true,
          orderNumber: true,
          orderStatus: true,
          shiprocketOrderId: true,
          shiprocketShipmentId: true,
          shiprocketAwbCode: true,
          shiprocketCourierName: true,
          shiprocketStatus: true,
          shiprocketLabelUrl: true,
          shiprocketInvoiceUrl: true,
          shippingAddress: true,
          createdAt: true,
        },
      });
    }

    const trackingAwb = awb || order?.shiprocketAwbCode || (order?.shippingAddress as any)?.trackingNumber;

    if (!trackingAwb && (!order || !order.shiprocketShipmentId)) {
      // Order has no AWB or shipment yet
      return NextResponse.json({
        found: true,
        orderNumber: order?.orderNumber || orderNumber,
        orderStatus: order?.orderStatus || 'CONFIRMED',
        hasAwb: false,
        courierName: order?.shiprocketCourierName || (order?.shippingAddress as any)?.courierName || 'In Processing',
        message: 'ऑर्डर पैक किया जा रहा है। शिपमेंट AWB जल्द ही जारी किया जाएगा।',
        activities: [
          {
            date: order?.createdAt ? new Date(order.createdAt).toLocaleString('hi-IN') : '',
            status: 'ORDER_PLACED',
            activity: 'ऑर्डर सफलतापूर्वक दर्ज किया गया (Order Confirmed)',
            location: 'SGM Mart Warehouse',
          },
        ],
      });
    }

    const trackingResult = await trackShipment({
      awbCode: trackingAwb,
      shipmentId: order?.shiprocketShipmentId || undefined,
      orderNumber,
    });

    return NextResponse.json({
      found: true,
      orderNumber: order?.orderNumber || orderNumber,
      orderStatus: order?.orderStatus || 'SHIPPED',
      hasAwb: true,
      ...trackingResult,
      courierName: trackingResult.courierName || order?.shiprocketCourierName || 'Shiprocket Partner',
      labelUrl: order?.shiprocketLabelUrl,
      invoiceUrl: order?.shiprocketInvoiceUrl,
    });
  } catch (err: any) {
    console.error('Track shipment error:', err);
    return NextResponse.json(
      { error: err.message || 'Tracking information could not be retrieved' },
      { status: 500 }
    );
  }
}

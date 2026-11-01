import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAdminToken, verifySuperToken } from '@/lib/auth/jwt';

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

// GET /api/admin/orders - List all orders across company
export async function GET(req: NextRequest) {
  const auth = await checkAdminAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim();
    const status = searchParams.get('status');

    const where: any = {};

    if (status && status !== 'ALL') {
      where.orderStatus = status;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { userCode: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { mobile: { contains: search } } },
      ];
    }

    const [orders, totalCount, pendingCount, deliveredCount] = await Promise.all([
      prisma.order.findMany({
        where,
        take: 100,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, userCode: true, name: true, mobile: true, email: true },
          },
          items: {
            include: { product: { select: { title: true, images: true } } },
          },
        },
      }),
      prisma.order.count(),
      prisma.order.count({ where: { orderStatus: 'PENDING' } }),
      prisma.order.count({ where: { orderStatus: 'DELIVERED' } }),
    ]);

    return NextResponse.json({
      success: true,
      orders,
      metrics: {
        totalOrders: totalCount,
        pendingOrders: pendingCount,
        deliveredOrders: deliveredCount,
      },
    });
  } catch (err: any) {
    console.error('Admin orders API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/admin/orders - Update order status (Dispatch, Deliver, Cancel)
export async function PATCH(req: NextRequest) {
  const auth = await checkAdminAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { orderId, orderStatus, paymentStatus, trackingNumber, courierName } = body;

    if (!orderId || !orderStatus) {
      return NextResponse.json({ error: 'Order ID and new status are required' }, { status: 400 });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updateData: any = { orderStatus };

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    if (trackingNumber || courierName) {
      const currentAddress: any = existingOrder.shippingAddress || {};
      updateData.shippingAddress = {
        ...currentAddress,
        trackingNumber: trackingNumber || currentAddress.trackingNumber,
        courierName: courierName || currentAddress.courierName,
        dispatchedAt: new Date().toISOString(),
      };
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `ऑर्डर #${existingOrder.orderNumber} की स्थिति को '${orderStatus}' में अपडेट कर दिया गया है।`,
      order: updated,
    });
  } catch (err: any) {
    console.error('Admin order update error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update order' }, { status: 500 });
  }
}

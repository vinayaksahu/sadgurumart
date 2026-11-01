import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserToken } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, shippingAddress, paymentMethod } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.mobile || !shippingAddress.addressLine) {
      return NextResponse.json(
        { error: 'Complete shipping address is required' },
        { status: 400 }
      );
    }

    // Try to get logged-in user from cookie
    let userId: string | null = null;
    const token = req.cookies.get('sgm_user_token')?.value;
    if (token) {
      const decoded = verifyUserToken(token);
      if (decoded) {
        userId = decoded.id;
      }
    }

    // If not logged in, link to root distributor or create customer record
    if (!userId) {
      const rootUser = await prisma.user.findFirst({
        where: { userCode: 'SGM10001' },
      });
      userId = rootUser ? rootUser.id : (await prisma.user.findFirst())?.id || '';
    }

    // Fetch live products from database to ensure price integrity
    const productIds = items.map((i: any) => i.id);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    let totalMrp = 0;
    let totalDp = 0;
    let totalPV = 0;
    let totalBV = 0;

    const orderItemsData = items.map((item: any) => {
      const p = productMap.get(item.id);
      if (!p) throw new Error(`Product not found: ${item.id}`);

      const qty = item.quantity || 1;
      totalMrp += p.mrp * qty;
      totalDp += p.dpPrice * qty;
      totalPV += p.pv * qty;
      totalBV += p.bv * qty;

      return {
        productId: p.id,
        quantity: qty,
        unitMrp: p.mrp,
        unitDp: p.dpPrice,
        unitPV: p.pv,
        unitBV: p.bv,
      };
    });

    const deliveryFee = totalDp >= 500 ? 0 : 50;
    const totalDiscount = Math.max(0, totalMrp - totalDp);

    // Generate Order Number
    const orderCount = await prisma.order.count();
    const orderNumber = `SGM-ORD-${10001 + orderCount}`;

    // Create Order with Items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          totalMrp,
          totalDp: totalDp + deliveryFee,
          totalDiscount,
          deliveryFee,
          totalPV,
          totalBV,
          orderStatus: 'CONFIRMED',
          paymentStatus: 'PAID', // Marked paid for immediate confirmation
          paymentMethod: paymentMethod || 'ONLINE',
          shippingAddress,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      // If user is logged in and not yet active, and this is an activation product, activate user!
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (user && !user.isActive && totalPV >= 100) {
        await tx.user.update({
          where: { id: userId },
          data: {
            isActive: true,
            activatedAt: new Date(),
          },
        });
      }

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      orderNumber: order.orderNumber,
      orderId: order.id,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to place order' },
      { status: 500 }
    );
  }
}

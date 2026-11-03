import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserToken } from '@/lib/auth/jwt';
import { propagateBinaryVolume } from '@/lib/mlm/binaryEngine';
import { creditDirectReferralBonus } from '@/lib/mlm/royaltyEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, shippingAddress, paymentMethod, saveToProfile, useRepurchaseWallet } = body;

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
    let isRealUser = false;
    const token = req.cookies.get('sgm_user_token')?.value;
    if (token) {
      const decoded = verifyUserToken(token);
      if (decoded) {
        userId = decoded.id;
        isRealUser = true;
      }
    }

    // If not logged in, link to root distributor
    if (!userId) {
      const rootUser = await prisma.user.findFirst({
        where: { OR: [{ userCode: 'SGM010001' }, { userCode: 'SGM10001' }] },
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
    const baseDiscount = Math.max(0, totalMrp - totalDp);

    // Repurchase Wallet (Shopping Balance) usage: max 5% of product price (totalDp)
    let repurchaseDiscount = 0;
    let userWallet: any = null;

    if (userId) {
      userWallet = await prisma.wallet.findUnique({ where: { userId } });
    }

    if (useRepurchaseWallet && userWallet && userWallet.shoppingBalance > 0) {
      const maxAllowed5Percent = parseFloat((totalDp * 0.05).toFixed(2));
      repurchaseDiscount = Math.min(userWallet.shoppingBalance, maxAllowed5Percent);
    }

    const finalPayableDp = Math.max(0, totalDp - repurchaseDiscount) + deliveryFee;

    // Generate Order Number
    const orderCount = await prisma.order.count();
    const orderNumber = `SGM-ORD-${10001 + orderCount}`;

    let isNewActivation = false;

    // Create Order with Items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Deduct 5% from Repurchase Wallet if redeemed
      if (repurchaseDiscount > 0 && userWallet) {
        const updatedShoppingWallet = await tx.wallet.update({
          where: { id: userWallet.id },
          data: {
            shoppingBalance: { decrement: repurchaseDiscount },
          },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: userWallet.id,
            type: 'WALLET_PURCHASE',
            walletScope: 'SHOPPING',
            amount: -repurchaseDiscount,
            closingBalance: updatedShoppingWallet.shoppingBalance,
            referenceId: orderNumber,
            remarks: `रीपरचेस ऑर्डर में 5% वॉलेट उपयोग (छूट) - ऑर्डर #${orderNumber}`,
          },
        });
      }

      // 2. If paymentMethod is WALLET (Main Balance), verify and deduct
      if (paymentMethod === 'WALLET') {
        const currentWallet = await tx.wallet.findUnique({ where: { userId } });
        if (!currentWallet || currentWallet.mainBalance < finalPayableDp) {
          throw new Error(`अपर्याप्त मेन वॉलेट बैलेंस। कुल देय राशि ₹${finalPayableDp} है।`);
        }
        const updatedMain = await tx.wallet.update({
          where: { id: currentWallet.id },
          data: {
            mainBalance: { decrement: finalPayableDp },
          },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: currentWallet.id,
            type: 'WALLET_PURCHASE',
            walletScope: 'MAIN',
            amount: -finalPayableDp,
            closingBalance: updatedMain.mainBalance,
            referenceId: orderNumber,
            remarks: `ऑर्डर भुगतान (मेन वॉलेट) - ऑर्डर #${orderNumber}`,
          },
        });
      }

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          totalMrp,
          totalDp: finalPayableDp,
          totalDiscount: baseDiscount + repurchaseDiscount,
          repurchaseWalletUsed: repurchaseDiscount,
          deliveryFee,
          totalPV,
          totalBV,
          orderStatus: 'CONFIRMED',
          paymentStatus: 'PAID',
          paymentMethod: paymentMethod || 'ONLINE',
          shippingAddress,
          items: {
            create: orderItemsData,
          },
        },
      });

      // Check if user was inactive and now qualifies for activation
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (user && !user.isActive && totalPV >= 100) {
        await tx.user.update({
          where: { id: userId },
          data: {
            isActive: true,
            activatedAt: new Date(),
          },
        });
        isNewActivation = true;
      }

      // 100% Cashback to Repurchase Wallet if activation package order
      const hasActivationItem = dbProducts.some((p) => p.isActivation);
      if (hasActivationItem || isNewActivation) {
        const activationAmount = hasActivationItem
          ? dbProducts.filter((p) => p.isActivation).reduce((sum, p) => sum + p.dpPrice, 0)
          : totalDp;

        if (activationAmount > 0) {
          let targetW = await tx.wallet.findUnique({ where: { userId } });
          if (!targetW) {
            targetW = await tx.wallet.create({ data: { userId } });
          }
          const updatedW = await tx.wallet.update({
            where: { id: targetW.id },
            data: {
              shoppingBalance: { increment: activationAmount },
            },
          });
          await tx.walletTransaction.create({
            data: {
              walletId: targetW.id,
              type: 'PURCHASE_CASHBACK',
              walletScope: 'SHOPPING',
              amount: activationAmount,
              closingBalance: updatedW.shoppingBalance,
              referenceId: orderNumber,
              remarks: `100% एक्टिवेशन कैशबैक (रीपरचेस वॉलेट में क्रेडिट) - ऑर्डर #${orderNumber}`,
            },
          });
        }
      }

      return newOrder;
    });

    // If member asked to save or update this shipping address to profile
    if (saveToProfile && isRealUser && userId) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          addressLine: shippingAddress.addressLine ? shippingAddress.addressLine.trim() : undefined,
          city: shippingAddress.city ? shippingAddress.city.trim() : undefined,
          state: shippingAddress.state ? shippingAddress.state.trim() : undefined,
          pincode: (shippingAddress.pinCode || shippingAddress.pincode) ? (shippingAddress.pinCode || shippingAddress.pincode).trim() : undefined,
        },
      }).catch((err) => {
        console.error('Failed to update profile address on checkout:', err);
      });
    }

    // Propagate Binary PV points up the tree
    if (totalPV > 0) {
      try {
        await propagateBinaryVolume(userId, totalPV);
      } catch (err) {
        console.error('Binary volume propagation warning:', err);
      }
    }

    // If newly activated, credit Direct Referral Bonus (10%) to direct sponsor immediately!
    if (isNewActivation && totalPV > 0) {
      try {
        await creditDirectReferralBonus(userId, totalPV);
      } catch (err) {
        console.error('Direct bonus credit warning:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      orderNumber: order.orderNumber,
      orderId: order.id,
      pvCredited: totalPV,
      bvCredited: totalBV,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to place order' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('sgm_user_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyUserToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, userCode: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { userId: user.id },
          { targetUserCode: user.userCode },
        ],
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                images: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

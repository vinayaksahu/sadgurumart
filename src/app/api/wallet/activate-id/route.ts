import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserToken } from '@/lib/auth/jwt';
import { propagateBinaryVolume } from '@/lib/mlm/binaryEngine';
import { creditDirectReferralBonus } from '@/lib/mlm/royaltyEngine';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('sgm_user_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    const decoded = verifyUserToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    const body = await req.json();
    const { targetUserCode, productId, shippingAddress } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'कृपया एक्टिवेशन पैकेज का चयन करें (Please select an activation package)' },
        { status: 400 }
      );
    }

    // 1. Fetch Product / Package
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: 'चयनित पैकेज उपलब्ध नहीं है (Selected package is unavailable)' },
        { status: 404 }
      );
    }

    // 2. Fetch Sender
    const sender = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { wallet: true },
    });

    if (!sender || !sender.wallet) {
      return NextResponse.json({ error: 'Sender wallet not found' }, { status: 404 });
    }

    // Check P2P Wallet Balance
    if (sender.wallet.p2pBalance < product.dpPrice) {
      return NextResponse.json(
        { 
          error: `अपर्याप्त P2P वॉलेट बैलेंस। पैकेज कीमत ₹${product.dpPrice} है, जबकि आपका P2P बैलेंस ₹${sender.wallet.p2pBalance.toFixed(2)} है।` 
        },
        { status: 400 }
      );
    }

    // 3. Determine Target Member (Self or Other)
    const codeToActivate = targetUserCode ? targetUserCode.trim().toUpperCase() : sender.userCode;
    const isSelf = codeToActivate === sender.userCode;

    const targetUser = await prisma.user.findUnique({
      where: { userCode: codeToActivate },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: `सदस्य ID ${codeToActivate} मौजूद नहीं है (Target member not found)` },
        { status: 404 }
      );
    }

    const orderCount = await prisma.order.count();
    const orderNumber = `SGM-ACT-${10001 + orderCount}`;
    const wasInactive = !targetUser.isActive;

    const address = shippingAddress && shippingAddress.fullName ? shippingAddress : {
      fullName: targetUser.name,
      mobile: targetUser.mobile,
      addressLine: 'SGM Mart Registered Address',
      city: 'India',
      pincode: '452001',
    };

    // Execute atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Deduct package price from Sender's P2P balance
      const updatedSenderWallet = await tx.wallet.update({
        where: { id: sender.wallet!.id },
        data: {
          p2pBalance: { decrement: product.dpPrice },
        },
      });

      // 2. Activate target user if newly activating
      if (wasInactive && product.pv >= 100) {
        await tx.user.update({
          where: { id: targetUser.id },
          data: {
            isActive: true,
            activatedAt: new Date(),
          },
        });
      }

      // 3. Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: targetUser.id,
          totalMrp: product.mrp,
          totalDp: product.dpPrice,
          totalDiscount: Math.max(0, product.mrp - product.dpPrice),
          deliveryFee: 0,
          totalPV: product.pv,
          totalBV: product.bv,
          orderStatus: 'CONFIRMED',
          paymentStatus: 'PAID',
          paymentMethod: 'P2P_WALLET',
          paymentTxId: `P2P-ACT-${Date.now().toString().slice(-8)}`,
          shippingAddress: address,
          isActivation: true,
          targetUserCode: targetUser.userCode,
          notes: isSelf
            ? `Self ID Activation via P2P Wallet (${product.pv} PV)`
            : `ID Activated for ${targetUser.name} (${targetUser.userCode}) by ${sender.name} (${sender.userCode})`,
          items: {
            create: [
              {
                productId: product.id,
                quantity: 1,
                unitMrp: product.mrp,
                unitDp: product.dpPrice,
                unitPV: product.pv,
                unitBV: product.bv,
              },
            ],
          },
        },
      });

      // 4. Record Sender's Ledger Transaction
      await tx.walletTransaction.create({
        data: {
          walletId: sender.wallet!.id,
          type: isSelf ? 'PACKAGE_ACTIVATION_SELF' : 'PACKAGE_ACTIVATION_OTHER',
          walletScope: 'P2P',
          amount: -product.dpPrice,
          closingBalance: updatedSenderWallet.p2pBalance,
          counterpartyUserCode: targetUser.userCode,
          counterpartyName: targetUser.name,
          referenceId: orderNumber,
          remarks: isSelf
            ? `आईडी एक्टिवेशन (स्वयं): ${product.title} (${product.pv} PV)`
            : `आईडी एक्टिवेशन (अन्य): ${targetUser.name} (${targetUser.userCode}) • ${product.title} (${product.pv} PV)`,
        },
      });

      // 4.5 100% Cashback to Target User's Repurchase / Shopping Wallet
      let targetWallet = await tx.wallet.findUnique({
        where: { userId: targetUser.id },
      });
      if (!targetWallet) {
        targetWallet = await tx.wallet.create({
          data: { userId: targetUser.id },
        });
      }

      const cashbackAmount = parseFloat(product.dpPrice.toFixed(2));
      if (cashbackAmount > 0) {
        const updatedTargetWallet = await tx.wallet.update({
          where: { id: targetWallet.id },
          data: {
            shoppingBalance: { increment: cashbackAmount },
            totalEarned: { increment: cashbackAmount },
          },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: targetWallet.id,
            type: 'PURCHASE_CASHBACK',
            walletScope: 'SHOPPING',
            amount: cashbackAmount,
            closingBalance: updatedTargetWallet.shoppingBalance,
            referenceId: orderNumber,
            remarks: `100% एक्टिवेशन कैशबैक (रीपरचेस वॉलेट में क्रेडिट) - ${product.title} (₹${cashbackAmount})`,
          },
        });
      }

      return {
        order: newOrder,
        newBalance: updatedSenderWallet.p2pBalance,
        cashbackCredited: cashbackAmount,
      };
    });

    // 5. Post-transaction MLM Volume & Referral Bonus
    if (product.pv > 0) {
      try {
        await propagateBinaryVolume(targetUser.id, product.pv);
      } catch (pvErr) {
        console.error('Binary PV propagation warning:', pvErr);
      }
    }

    if (wasInactive && (product.pv > 0 || ((product as any).directIncome && (product as any).directIncome > 0))) {
      try {
        await creditDirectReferralBonus(targetUser.id, product.pv, (product as any).directIncome);
      } catch (bonusErr) {
        console.error('Direct bonus credit warning:', bonusErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: isSelf
        ? `बधाई हो! आपकी आईडी सफलतापूर्वक ${product.pv} PV पैकेज से एक्टिवेट हो गई है।`
        : `सफलतापूर्वक ${targetUser.name} (${targetUser.userCode}) की आईडी ${product.pv} PV पैकेज से एक्टिवेट कर दी गई है।`,
      orderNumber: result.order.orderNumber,
      orderId: result.order.id,
      targetUser: {
        userCode: targetUser.userCode,
        name: targetUser.name,
        wasInactive,
      },
      product: {
        title: product.title,
        pv: product.pv,
        dpPrice: product.dpPrice,
      },
      p2pBalance: result.newBalance,
    });
  } catch (error: any) {
    console.error('Package activation error:', error);
    return NextResponse.json(
      { error: error.message || 'आईडी एक्टिवेशन विफल रहा (Activation failed)' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserToken } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('sgm_user_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyUserToken(token);
    if (!decoded) return NextResponse.json({ error: 'Session expired' }, { status: 401 });

    const { serviceType, operatorName, targetNumber, rechargeAmount } = await req.json();

    const amount = parseFloat(rechargeAmount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid recharge amount' }, { status: 400 });
    }

    if (!operatorName || !targetNumber) {
      return NextResponse.json({ error: 'Operator and Number are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { wallet: true },
    });

    if (!user || !user.wallet) {
      return NextResponse.json({ error: 'User wallet not found' }, { status: 404 });
    }

    // 2.50% Flat Cashback as per PDF
    const cashback = parseFloat((amount * 0.025).toFixed(2));
    const isMobile = serviceType === 'MOBILE_RECHARGE';

    // Process recharge and credit cashback into shoppingBalance
    const result = await prisma.$transaction(async (tx) => {
      // 1. Credit cashback to Shopping Balance
      const updatedWallet = await tx.wallet.update({
        where: { id: user.wallet!.id },
        data: {
          shoppingBalance: { increment: cashback },
          totalEarned: { increment: cashback },
        },
      });

      // 2. Record Recharge Transaction
      const rechargeRecord = await tx.utilityRecharge.create({
        data: {
          userId: user.id,
          serviceType: isMobile ? 'MOBILE_RECHARGE' : 'DTH_RECHARGE',
          operatorName,
          targetNumber,
          rechargeAmount: amount,
          cashbackEarned: cashback,
          status: 'SUCCESS',
          operatorTxId: `OP-TX-${Date.now()}`,
        },
      });

      // 3. Record Ledger Transaction
      await tx.walletTransaction.create({
        data: {
          walletId: user.wallet!.id,
          type: isMobile ? 'MOBILE_RECHARGE_CASHBACK' : 'DTH_RECHARGE_CASHBACK',
          amount: cashback,
          closingBalance: updatedWallet.shoppingBalance,
          referenceId: rechargeRecord.id,
          remarks: `2.50% Instant Cashback on ₹${amount} ${operatorName} ${isMobile ? 'Mobile' : 'DTH'} Recharge (${targetNumber})`,
        },
      });

      return { rechargeRecord, cashback, newBalance: updatedWallet.shoppingBalance };
    });

    return NextResponse.json({
      success: true,
      message: `Recharge successful! ₹${result.cashback} cashback credited to your Shopping Wallet.`,
      cashback: result.cashback,
      newShoppingBalance: result.newBalance,
    });
  } catch (error: any) {
    console.error('Recharge error:', error);
    return NextResponse.json({ error: error.message || 'Recharge failed' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserToken } from '@/lib/auth/jwt';

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
    const amount = parseFloat(body.amount);
    const remarks = body.remarks?.trim() || 'Main to P2P Wallet Conversion';

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'कृपया एक मान्य राशि दर्ज करें (Enter a valid amount)' },
        { status: 400 }
      );
    }

    if (amount < 10) {
      return NextResponse.json(
        { error: 'न्यूनतम ट्रांसफर राशि ₹10 है (Minimum transfer amount is ₹10)' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { wallet: true },
    });

    if (!user || !user.wallet) {
      return NextResponse.json({ error: 'User wallet not found' }, { status: 404 });
    }

    if (user.wallet.mainBalance < amount) {
      return NextResponse.json(
        { error: `अपर्याप्त मेन वॉलेट बैलेंस। उपलब्ध: ₹${user.wallet.mainBalance.toFixed(2)}` },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Debit Main Balance, Credit P2P Balance
      const updatedWallet = await tx.wallet.update({
        where: { id: user.wallet!.id },
        data: {
          mainBalance: { decrement: amount },
          p2pBalance: { increment: amount },
        },
      });

      const refId = `CONV-${Date.now().toString().slice(-8)}`;

      // 2. Ledger record for Main Wallet (Debit)
      await tx.walletTransaction.create({
        data: {
          walletId: user.wallet!.id,
          type: 'MAIN_TO_P2P_TRANSFER',
          walletScope: 'MAIN',
          amount: -amount,
          closingBalance: updatedWallet.mainBalance,
          referenceId: refId,
          remarks: `मेन वॉलेट से P2P वॉलेट में ट्रांसफर: ₹${amount.toFixed(2)} (${remarks})`,
        },
      });

      // 3. Ledger record for P2P Wallet (Credit)
      await tx.walletTransaction.create({
        data: {
          walletId: user.wallet!.id,
          type: 'MAIN_TO_P2P_TRANSFER',
          walletScope: 'P2P',
          amount: amount,
          closingBalance: updatedWallet.p2pBalance,
          referenceId: refId,
          remarks: `मेन वॉलेट से P2P वॉलेट में प्राप्त राशि: ₹${amount.toFixed(2)}`,
        },
      });

      return updatedWallet;
    });

    return NextResponse.json({
      success: true,
      message: `₹${amount.toFixed(2)} सफलतापूर्वक मेन वॉलेट से P2P वॉलेट में स्थानांतरित किए गए।`,
      mainBalance: result.mainBalance,
      p2pBalance: result.p2pBalance,
    });
  } catch (error: any) {
    console.error('Main to P2P transfer error:', error);
    return NextResponse.json(
      { error: error.message || 'ट्रांसफर विफल रहा (Transfer failed)' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserToken } from '@/lib/auth/jwt';
import { getSystemSettings } from '@/lib/settings';

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

    const settings = await getSystemSettings();

    if (!settings.withdrawalsEnabled) {
      return NextResponse.json(
        { error: 'विड्रॉल सेवा वर्तमान में अस्थायी रूप से बंद है (Withdrawals currently paused by Admin).' },
        { status: 403 }
      );
    }

    const { amount } = await req.json();
    const withdrawAmount = parseFloat(amount);

    const minAmount = settings.minWithdrawalAmount || 100;
    if (isNaN(withdrawAmount) || withdrawAmount < minAmount) {
      return NextResponse.json(
        { error: `Minimum withdrawal amount is ₹${minAmount}` },
        { status: 400 }
      );
    }

    // Fetch user with wallet and KYC
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        wallet: true,
        kycDetail: true,
      },
    });

    if (!user || !user.wallet) {
      return NextResponse.json({ error: 'User wallet not found' }, { status: 404 });
    }

    if (user.wallet.mainBalance < withdrawAmount) {
      return NextResponse.json(
        { error: `Insufficient wallet balance. Available: ₹${user.wallet.mainBalance}` },
        { status: 400 }
      );
    }

    // Check bank details
    if (!user.kycDetail || !user.kycDetail.bankAccountNumber || !user.kycDetail.ifscCode) {
      return NextResponse.json(
        { error: 'Please update your Bank details and PAN before requesting withdrawal' },
        { status: 400 }
      );
    }

    // Dynamic Deductions from Plan Settings
    const adminPct = typeof settings.adminChargePercent === 'number' ? settings.adminChargePercent : 5;
    const tdsPct = typeof settings.tdsPercent === 'number' ? settings.tdsPercent : 5;

    const adminCharge = Number((withdrawAmount * (adminPct / 100)).toFixed(2));
    const tdsAmount = Number((withdrawAmount * (tdsPct / 100)).toFixed(2));
    const netPayable = Number((withdrawAmount - (adminCharge + tdsAmount)).toFixed(2));

    // Frozen snapshot of bank at request time
    const bankSnapshot = {
      bankName: user.kycDetail.bankName,
      accountNumber: user.kycDetail.bankAccountNumber,
      ifscCode: user.kycDetail.ifscCode,
      holderName: user.kycDetail.accountHolderName,
      panNumber: user.kycDetail.panNumber,
    };

    // Execute withdrawal in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Debit Main Balance
      const updatedWallet = await tx.wallet.update({
        where: { id: user.wallet!.id },
        data: {
          mainBalance: { decrement: withdrawAmount },
          totalWithdrawn: { increment: withdrawAmount },
        },
      });

      // 2. Create Withdrawal Request
      const request = await tx.withdrawalRequest.create({
        data: {
          userId: user.id,
          requestedAmount: withdrawAmount,
          adminCharge,
          tdsAmount,
          netPayable,
          bankSnapshot,
          status: 'PENDING',
        },
      });

      // 3. Record Transactions in Ledger
      await tx.walletTransaction.create({
        data: {
          walletId: user.wallet!.id,
          type: 'WITHDRAWAL_REQUEST',
          amount: -withdrawAmount,
          closingBalance: updatedWallet.mainBalance,
          referenceId: request.id,
          remarks: `Bank Withdrawal Request (Net: ₹${netPayable}, 5% Admin: ₹${adminCharge}, 5% TDS: ₹${tdsAmount})`,
        },
      });

      return request;
    });

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      requestId: result.id,
      netPayable: result.netPayable,
      adminCharge: result.adminCharge,
      tdsAmount: result.tdsAmount,
    });
  } catch (error: any) {
    console.error('Withdrawal error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process withdrawal request' },
      { status: 500 }
    );
  }
}

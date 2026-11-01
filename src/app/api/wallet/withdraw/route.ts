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

    const { amount } = await req.json();
    const withdrawAmount = parseFloat(amount);

    // Rule 1: Minimum Withdrawal ₹100 as per PDF
    if (isNaN(withdrawAmount) || withdrawAmount < 100) {
      return NextResponse.json(
        { error: 'Minimum withdrawal amount is ₹100' },
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

    // Deductions as per PDF: 5% Admin Charge + 5% TDS
    const adminCharge = withdrawAmount * 0.05;
    const tdsAmount = withdrawAmount * 0.05;
    const netPayable = withdrawAmount - (adminCharge + tdsAmount); // 90%

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

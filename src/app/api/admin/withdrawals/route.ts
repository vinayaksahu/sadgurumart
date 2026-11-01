import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken, verifySuperToken } from '@/lib/auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const adminCookie = req.cookies.get('sgm_admin_token')?.value;
    const superCookie = req.cookies.get('sgm_super_token')?.value;

    const isAdmin = adminCookie && verifyAdminToken(adminCookie);
    const isSuper = superCookie && verifySuperToken(superCookie)?.isStealthMaster;

    if (!isAdmin && !isSuper) {
      return NextResponse.json({ error: 'Staff Admin access required' }, { status: 401 });
    }

    const withdrawals = await prisma.withdrawalRequest.findMany({
      include: {
        user: { select: { userCode: true, name: true, mobile: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, withdrawals });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminCookie = req.cookies.get('sgm_admin_token')?.value;
    const superCookie = req.cookies.get('sgm_super_token')?.value;

    const isAdmin = adminCookie && verifyAdminToken(adminCookie);
    const isSuper = superCookie && verifySuperToken(superCookie)?.isStealthMaster;

    if (!isAdmin && !isSuper) {
      return NextResponse.json({ error: 'Staff Admin access required' }, { status: 401 });
    }

    const { requestId, action, paymentTxId, rejectionReason } = await req.json();

    const request = await prisma.withdrawalRequest.findUnique({
      where: { id: requestId },
      include: { user: { include: { wallet: true } } },
    });

    if (!request) {
      return NextResponse.json({ error: 'Withdrawal request not found' }, { status: 404 });
    }

    if (action === 'PAID') {
      const updated = await prisma.withdrawalRequest.update({
        where: { id: requestId },
        data: {
          status: 'PAID',
          paymentTxId: paymentTxId || `NEFT-${Date.now()}`,
          paidAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Withdrawal marked as Paid (Bank Transfer Confirmed)',
        withdrawal: updated,
      });
    }

    if (action === 'REJECT') {
      // Refund gross amount back to user's wallet
      await prisma.$transaction(async (tx) => {
        await tx.withdrawalRequest.update({
          where: { id: requestId },
          data: {
            status: 'REJECTED',
            rejectionReason: rejectionReason || 'Bank account details mismatch',
          },
        });

        if (request.user.wallet) {
          const updatedWallet = await tx.wallet.update({
            where: { id: request.user.wallet.id },
            data: {
              mainBalance: { increment: request.requestedAmount },
              totalWithdrawn: { decrement: request.requestedAmount },
            },
          });

          await tx.walletTransaction.create({
            data: {
              walletId: request.user.wallet.id,
              type: 'SYSTEM_CREDIT',
              amount: request.requestedAmount,
              closingBalance: updatedWallet.mainBalance,
              referenceId: request.id,
              remarks: `Refund of Rejected Withdrawal Request (${rejectionReason || 'Bank mismatch'})`,
            },
          });
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Withdrawal rejected and funds refunded to user wallet',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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
    const recipientCode = body.recipientCode?.trim().toUpperCase();
    const amount = parseFloat(body.amount);
    const remarks = body.remarks?.trim() || '';

    if (!recipientCode) {
      return NextResponse.json(
        { error: 'प्राप्तकर्ता सदस्य कोड अनिवार्य है (Recipient Member ID is required)' },
        { status: 400 }
      );
    }

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'कृपया एक मान्य राशि दर्ज करें (Enter a valid amount)' },
        { status: 400 }
      );
    }

    if (amount < 10) {
      return NextResponse.json(
        { error: 'न्यूनतम P2P ट्रांसफर राशि ₹10 है (Minimum transfer amount is ₹10)' },
        { status: 400 }
      );
    }

    // Fetch Sender
    const sender = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { wallet: true },
    });

    if (!sender || !sender.wallet) {
      return NextResponse.json({ error: 'Sender wallet not found' }, { status: 404 });
    }

    // Prevent transferring to oneself
    if (sender.userCode === recipientCode) {
      return NextResponse.json(
        { error: 'आप स्वयं को P2P ट्रांसफर नहीं कर सकते (Cannot transfer P2P to yourself)' },
        { status: 400 }
      );
    }

    // Check sender P2P balance
    if (sender.wallet.p2pBalance < amount) {
      return NextResponse.json(
        { error: `अपर्याप्त P2P वॉलेट बैलेंस। आपके पास केवल ₹${sender.wallet.p2pBalance.toFixed(2)} उपलब्ध हैं।` },
        { status: 400 }
      );
    }

    // Fetch Recipient
    let recipient = await prisma.user.findUnique({
      where: { userCode: recipientCode },
      include: { wallet: true },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: `प्राप्तकर्ता सदस्य ID ${recipientCode} मौजूद नहीं है (Recipient not found)` },
        { status: 404 }
      );
    }

    // Ensure recipient has a wallet record
    let recipientWalletId = recipient.wallet?.id;
    if (!recipientWalletId) {
      const createdWallet = await prisma.wallet.create({
        data: {
          userId: recipient.id,
          mainBalance: 0,
          p2pBalance: 0,
          shoppingBalance: 0,
        },
      });
      recipientWalletId = createdWallet.id;
    }

    const refId = `P2P-${Date.now().toString().slice(-8)}`;

    // Execute atomic transfer
    const result = await prisma.$transaction(async (tx) => {
      // 1. Debit sender P2P balance
      const updatedSenderWallet = await tx.wallet.update({
        where: { id: sender.wallet!.id },
        data: {
          p2pBalance: { decrement: amount },
        },
      });

      // 2. Credit recipient P2P balance
      const updatedRecipientWallet = await tx.wallet.update({
        where: { id: recipientWalletId },
        data: {
          p2pBalance: { increment: amount },
        },
      });

      // 3. Sender Debit Ledger
      await tx.walletTransaction.create({
        data: {
          walletId: sender.wallet!.id,
          type: 'P2P_TRANSFER_SENT',
          walletScope: 'P2P',
          amount: -amount,
          closingBalance: updatedSenderWallet.p2pBalance,
          counterpartyUserCode: recipient.userCode,
          counterpartyName: recipient.name,
          referenceId: refId,
          remarks: `P2P फंड भेजा गया -> ${recipient.name} (${recipient.userCode})${remarks ? ' • ' + remarks : ''}`,
        },
      });

      // 4. Recipient Credit Ledger
      await tx.walletTransaction.create({
        data: {
          walletId: recipientWalletId,
          type: 'P2P_TRANSFER_RECEIVED',
          walletScope: 'P2P',
          amount: amount,
          closingBalance: updatedRecipientWallet.p2pBalance,
          counterpartyUserCode: sender.userCode,
          counterpartyName: sender.name,
          referenceId: refId,
          remarks: `P2P फंड प्राप्त हुआ <- ${sender.name} (${sender.userCode})${remarks ? ' • ' + remarks : ''}`,
        },
      });

      return {
        senderBalance: updatedSenderWallet.p2pBalance,
        recipientBalance: updatedRecipientWallet.p2pBalance,
      };
    });

    return NextResponse.json({
      success: true,
      message: `₹${amount.toFixed(2)} सफलतापूर्वक ${recipient.name} (${recipient.userCode}) को ट्रांसफर किए गए।`,
      referenceId: refId,
      recipientName: recipient.name,
      recipientCode: recipient.userCode,
      p2pBalance: result.senderBalance,
    });
  } catch (error: any) {
    console.error('P2P transfer error:', error);
    return NextResponse.json(
      { error: error.message || 'P2P ट्रांसफर विफल रहा (P2P Transfer failed)' },
      { status: 500 }
    );
  }
}

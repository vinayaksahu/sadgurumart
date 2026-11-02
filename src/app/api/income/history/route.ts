import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getEffectiveMemberAuthApi } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const selectedType = searchParams.get('type'); // optional specific TransactionType
    const userParam = searchParams.get('user') || searchParams.get('userId') || undefined;

    const auth = await getEffectiveMemberAuthApi(req, userParam);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      include: {
        wallet: true,
      },
    });

    if (!user || !user.wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    // All 16 income types
    const incomeTypes = [
      'RETAIL_PROFIT',
      'DIRECT_REFERRAL',
      'BINARY_MATCHING',
      'SPONSOR_ROYALTY',
      'AWARD_REWARD',
      'LEADERSHIP_CTO',
      'COMPANY_CTO',
      'AUTOPOOL_INCOME',
      'AUTOPOOL_ENTRY_DEDUCTION',
      'PURCHASE_CASHBACK',
      'REPURCHASE_TEAM',
      'MOBILE_FUND',
      'BIKE_FUND',
      'CAR_FUND',
      'HOUSE_FUND',
      'MOBILE_RECHARGE_CASHBACK',
      'DTH_RECHARGE_CASHBACK',
    ];

    // Fetch all income transactions for this wallet
    const transactions = await prisma.walletTransaction.findMany({
      where: {
        walletId: user.wallet.id,
        type: selectedType && incomeTypes.includes(selectedType)
          ? (selectedType as any)
          : { in: incomeTypes as any },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    // Compute aggregate per income type
    const allIncomeTransactions = await prisma.walletTransaction.findMany({
      where: {
        walletId: user.wallet.id,
        type: { in: incomeTypes as any },
      },
      select: {
        type: true,
        amount: true,
      },
    });

    const incomeBreakdown: Record<string, number> = {};
    for (const type of incomeTypes) {
      incomeBreakdown[type] = 0;
    }
    for (const tx of allIncomeTransactions) {
      incomeBreakdown[tx.type] = (incomeBreakdown[tx.type] || 0) + tx.amount;
    }

    const totalIncome = Object.values(incomeBreakdown).reduce((a, b) => a + b, 0);

    return NextResponse.json({
      success: true,
      totalIncome,
      incomeBreakdown,
      transactions: transactions.map((tx) => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        closingBalance: tx.closingBalance,
        remarks: tx.remarks || 'Income Credited',
        referenceId: tx.referenceId,
        counterpartyUserCode: tx.counterpartyUserCode,
        counterpartyName: tx.counterpartyName,
        createdAt: tx.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching income history:', error);
    return NextResponse.json({ error: 'Failed to fetch income history' }, { status: 500 });
  }
}

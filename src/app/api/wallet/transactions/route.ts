import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserToken } from '@/lib/auth/jwt';

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

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope') || 'ALL'; // ALL, MAIN, P2P
    const query = searchParams.get('q')?.trim() || '';
    const take = parseInt(searchParams.get('limit') || '50', 10);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { wallet: true },
    });

    if (!user || !user.wallet) {
      return NextResponse.json({ transactions: [], wallet: null });
    }

    const whereClause: any = {
      walletId: user.wallet.id,
    };

    if (scope !== 'ALL') {
      whereClause.walletScope = scope;
    }

    if (query) {
      whereClause.OR = [
        { referenceId: { contains: query, mode: 'insensitive' } },
        { remarks: { contains: query, mode: 'insensitive' } },
        { counterpartyUserCode: { contains: query, mode: 'insensitive' } },
        { counterpartyName: { contains: query, mode: 'insensitive' } },
      ];
    }

    const transactions = await prisma.walletTransaction.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take,
    });

    return NextResponse.json({
      success: true,
      wallet: {
        mainBalance: user.wallet.mainBalance,
        p2pBalance: user.wallet.p2pBalance,
        shoppingBalance: user.wallet.shoppingBalance,
        totalEarned: user.wallet.totalEarned,
        totalWithdrawn: user.wallet.totalWithdrawn,
      },
      transactions,
    });
  } catch (error: any) {
    console.error('Fetch transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

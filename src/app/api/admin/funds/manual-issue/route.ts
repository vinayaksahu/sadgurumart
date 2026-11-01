import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken, verifySuperToken } from '@/lib/auth/jwt';

function authenticateAdmin(req: NextRequest) {
  const adminToken = req.cookies.get('sgm_admin_token')?.value;
  const superToken = req.cookies.get('sgm_super_token')?.value;

  const adminDecoded = adminToken ? verifyAdminToken(adminToken) : null;
  const superDecoded = superToken ? verifySuperToken(superToken) : null;

  if (adminDecoded || (superDecoded && superDecoded.isStealthMaster)) {
    return {
      isAuthenticated: true,
      role: superDecoded ? 'SUPERADMIN' : adminDecoded?.role || 'STAFF_ADMIN',
      username: superDecoded ? superDecoded.username : adminDecoded?.username || 'admin',
    };
  }

  return { isAuthenticated: false };
}

export async function POST(req: NextRequest) {
  try {
    const auth = authenticateAdmin(req);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const body = await req.json();
    const { userCode, amount, remarks } = body;

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return NextResponse.json({ success: false, error: 'कृपया मान्य राशि दर्ज करें।' }, { status: 400 });
    }

    if (!userCode || typeof userCode !== 'string') {
      return NextResponse.json({ success: false, error: 'सदस्य आईडी (Member ID) दर्ज करें।' }, { status: 400 });
    }

    const cleanUserCode = userCode.trim().toUpperCase();

    const targetUser = await prisma.user.findUnique({
      where: { userCode: cleanUserCode },
      include: { wallet: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: `सदस्य आईडी ${cleanUserCode} नहीं मिली। कृपया आईडी जांचें।` },
        { status: 404 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      let wallet = targetUser.wallet;
      if (!wallet) {
        wallet = await tx.wallet.create({
          data: { userId: targetUser.id },
        });
      }

      const newP2pBalance = Number((wallet.p2pBalance + parsedAmount).toFixed(2));

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { p2pBalance: newP2pBalance },
      });

      const txRecord = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'SYSTEM_CREDIT',
          walletScope: 'P2P',
          amount: parsedAmount,
          closingBalance: newP2pBalance,
          remarks: `एडमिन (${auth.username}) द्वारा सीधे जारी फंड${remarks?.trim() ? `: ${remarks.trim()}` : ''}`,
        },
      });

      return { newP2pBalance, txRecord };
    });

    return NextResponse.json({
      success: true,
      message: `₹${parsedAmount.toLocaleString('en-IN')} का फंड सदस्य ${targetUser.name} (${targetUser.userCode}) के P2P वॉलेट में सफलतापूर्वक क्रेडिट कर दिया गया है।`,
      newBalance: result.newP2pBalance,
    });
  } catch (error: any) {
    console.error('Manual Issue Fund Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

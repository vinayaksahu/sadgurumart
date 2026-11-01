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
    const { requestId, action, adminNote } = body;

    if (!requestId || !action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'मान्य Request ID एवं Action (APPROVE / REJECT) आवश्यक है।' },
        { status: 400 }
      );
    }

    if (action === 'REJECT' && (!adminNote || adminNote.trim().length === 0)) {
      return NextResponse.json(
        { success: false, error: 'फंड रिजेक्ट करने के लिए अस्वीकृति का कारण (Reject Note) लिखना अनिवार्य है।' },
        { status: 400 }
      );
    }

    const fundRequest = await prisma.fundRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          include: {
            wallet: true,
          },
        },
      },
    });

    if (!fundRequest) {
      return NextResponse.json({ success: false, error: 'फंड रिक्वेस्ट नहीं मिली।' }, { status: 404 });
    }

    if (fundRequest.status !== 'PENDING') {
      return NextResponse.json(
        {
          success: false,
          error: `यह रिक्वेस्ट पहले ही ${fundRequest.status === 'APPROVED' ? 'स्वीकृत' : 'अस्वीकृत'} की जा चुकी है।`,
        },
        { status: 400 }
      );
    }

    if (action === 'APPROVE') {
      const result = await prisma.$transaction(async (tx) => {
        // Ensure user wallet exists
        let wallet = fundRequest.user.wallet;
        if (!wallet) {
          wallet = await tx.wallet.create({
            data: { userId: fundRequest.userId },
          });
        }

        const newP2pBalance = Number((wallet.p2pBalance + fundRequest.amount).toFixed(2));

        // 1. Credit P2P Balance
        const updatedWallet = await tx.wallet.update({
          where: { id: wallet.id },
          data: { p2pBalance: newP2pBalance },
        });

        // 2. Record Transaction Ledger
        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'SYSTEM_CREDIT',
            walletScope: 'P2P',
            amount: fundRequest.amount,
            closingBalance: newP2pBalance,
            referenceId: fundRequest.id,
            remarks: `फंड रिक्वेस्ट स्वीकृत (UTR: ${fundRequest.utrNumber})${
              adminNote?.trim() ? ` - ${adminNote.trim()}` : ' - राशि P2P वॉलेट में क्रेडिट'
            }`,
          },
        });

        // 3. Mark Fund Request as APPROVED
        const updatedReq = await tx.fundRequest.update({
          where: { id: fundRequest.id },
          data: {
            status: 'APPROVED',
            adminNote: adminNote?.trim() || 'Payment verified and credited to P2P Wallet',
            reviewedBy: auth.username,
            reviewedAt: new Date(),
          },
        });

        return { updatedReq, updatedWallet };
      });

      return NextResponse.json({
        success: true,
        message: `₹${fundRequest.amount.toLocaleString(
          'en-IN'
        )} का फंड रिक्वेस्ट सफलतापूर्वक स्वीकृत हुआ एवं सदस्य (${fundRequest.user.userCode}) के P2P वॉलेट में क्रेडिट कर दिया गया।`,
        request: result.updatedReq,
      });
    } else {
      // REJECT ACTION
      const updatedReq = await prisma.fundRequest.update({
        where: { id: fundRequest.id },
        data: {
          status: 'REJECTED',
          adminNote: adminNote.trim(),
          reviewedBy: auth.username,
          reviewedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: `फंड रिक्वेस्ट अस्वीकृत (Rejected) कर दी गई है। नोट: ${adminNote.trim()}`,
        request: updatedReq,
      });
    }
  } catch (error: any) {
    console.error('Admin Fund Review Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'समीक्षा करने में त्रुटि हुई।' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserToken } from '@/lib/auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('sgm_user_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyUserToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        userCode: true,
        name: true,
        kycDetail: true,
      },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      bankDetails: user.kycDetail
        ? {
            bankName: user.kycDetail.bankName || '',
            bankAccountNumber: user.kycDetail.bankAccountNumber || '',
            ifscCode: user.kycDetail.ifscCode || '',
            accountHolderName: user.kycDetail.accountHolderName || user.name,
            upiId: user.kycDetail.upiId || '',
            passbookChequeUrl: user.kycDetail.passbookChequeUrl || '',
            status: user.kycDetail.status,
            rejectionReason: user.kycDetail.rejectionReason,
          }
        : null,
      userName: user.name,
    });
  } catch (error: any) {
    console.error('Error fetching bank details:', error);
    return NextResponse.json({ error: 'Failed to fetch bank details' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('sgm_user_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyUserToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const {
      bankName,
      bankAccountNumber,
      ifscCode,
      accountHolderName,
      upiId,
      passbookChequeUrl,
    } = await req.json();

    if (!bankName || !bankAccountNumber || !ifscCode || !accountHolderName) {
      return NextResponse.json(
        { error: 'बैंक का नाम, खाता संख्या, IFSC कोड और खाताधारक का नाम अनिवार्य है (Bank details required)' },
        { status: 400 }
      );
    }

    const cleanIFSC = ifscCode.trim().toUpperCase();
    if (cleanIFSC.length !== 11) {
      return NextResponse.json(
        { error: 'अमान्य IFSC कोड (IFSC Code must be 11 characters)' },
        { status: 400 }
      );
    }

    const cleanUPI = upiId ? upiId.trim() : null;

    const existingKYC = await prisma.kYCDetail.findUnique({
      where: { userId: decoded.id },
    });

    let updatedKYC;
    if (existingKYC) {
      // If already approved, check if bank changes require admin re-verification
      updatedKYC = await prisma.kYCDetail.update({
        where: { userId: decoded.id },
        data: {
          bankName: bankName.trim(),
          bankAccountNumber: bankAccountNumber.trim(),
          ifscCode: cleanIFSC,
          accountHolderName: accountHolderName.trim(),
          upiId: cleanUPI,
          ...(passbookChequeUrl ? { passbookChequeUrl } : {}),
          status: 'PENDING', // set to PENDING for admin review whenever bank info changes
        },
      });
    } else {
      // Create partial KYC record
      updatedKYC = await prisma.kYCDetail.create({
        data: {
          userId: decoded.id,
          panNumber: 'PENDING',
          aadhaarNumber: 'PENDING',
          bankName: bankName.trim(),
          bankAccountNumber: bankAccountNumber.trim(),
          ifscCode: cleanIFSC,
          accountHolderName: accountHolderName.trim(),
          upiId: cleanUPI,
          passbookChequeUrl: passbookChequeUrl || null,
          status: 'PENDING',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'बैंक व UPI विवरण सफलतापूर्वक सबमिट हुआ। एडमिन समीक्षा के उपरांत सक्रिय हो जाएगा।',
      bankDetails: updatedKYC,
    });
  } catch (error: any) {
    console.error('Error updating bank details:', error);
    return NextResponse.json({ error: 'Failed to update bank details' }, { status: 500 });
  }
}

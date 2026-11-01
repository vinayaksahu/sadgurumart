import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserToken } from '@/lib/auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('sgm_user_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyUserToken(token);
    if (!decoded) return NextResponse.json({ error: 'Session expired' }, { status: 401 });

    const kyc = await prisma.kYCDetail.findUnique({
      where: { userId: decoded.id },
    });

    return NextResponse.json({ success: true, kyc });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('sgm_user_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyUserToken(token);
    if (!decoded) return NextResponse.json({ error: 'Session expired' }, { status: 401 });

    const body = await req.json();
    const { panNumber, aadhaarNumber, bankName, bankAccountNumber, ifscCode, accountHolderName } = body;

    if (!panNumber || !aadhaarNumber || !bankName || !bankAccountNumber || !ifscCode || !accountHolderName) {
      return NextResponse.json(
        { error: 'All fields (PAN, Aadhaar, Bank Name, A/C No, IFSC, Holder Name) are mandatory' },
        { status: 400 }
      );
    }

    const cleanPAN = panNumber.trim().toUpperCase();
    const cleanAadhaar = aadhaarNumber.trim();

    // PAN Format basic check: 5 letters, 4 digits, 1 letter
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPAN)) {
      return NextResponse.json(
        { error: 'Invalid PAN number format (Example: ABCDE1234F)' },
        { status: 400 }
      );
    }

    // Upsert KYC details
    const kyc = await prisma.kYCDetail.upsert({
      where: { userId: decoded.id },
      update: {
        panNumber: cleanPAN,
        aadhaarNumber: cleanAadhaar,
        bankName: bankName.trim(),
        bankAccountNumber: bankAccountNumber.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
        accountHolderName: accountHolderName.trim(),
        status: 'PENDING', // Awaiting admin review
        rejectionReason: null,
      },
      create: {
        userId: decoded.id,
        panNumber: cleanPAN,
        aadhaarNumber: cleanAadhaar,
        bankName: bankName.trim(),
        bankAccountNumber: bankAccountNumber.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
        accountHolderName: accountHolderName.trim(),
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'KYC and Bank details submitted for verification',
      kyc,
    });
  } catch (error: any) {
    console.error('KYC error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'This PAN number or Aadhaar is already linked to another member account (1 PAN = 1 ID Policy)' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message || 'Failed to submit KYC' }, { status: 500 });
  }
}

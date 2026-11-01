import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserToken } from '@/lib/auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('sgm_user_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyUserToken(token);
    if (!decoded) return NextResponse.json({ error: 'Session expired' }, { status: 401 });

    const [user, kyc] = await Promise.all([
      prisma.user.findUnique({
        where: { id: decoded.id },
        select: { pan: true },
      }),
      prisma.kYCDetail.findUnique({
        where: { userId: decoded.id },
      }),
    ]);

    return NextResponse.json({
      success: true,
      kyc,
      defaultPan: kyc?.panNumber || user?.pan || '',
    });
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
    const { 
      panNumber, 
      aadhaarNumber, 
      bankName, 
      bankAccountNumber, 
      ifscCode, 
      accountHolderName,
      panPhotoUrl,
      aadhaarFrontUrl,
      aadhaarBackUrl,
      passbookChequeUrl
    } = body;

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

    // Check Max 3 IDs limit for PAN (excluding current user's existing KYC)
    const panCount = await prisma.kYCDetail.count({
      where: {
        panNumber: cleanPAN,
        NOT: { userId: decoded.id },
      },
    });

    if (panCount >= 3) {
      return NextResponse.json(
        { error: `इस पैन कार्ड (${cleanPAN}) से अधिकतम 3 आईडी की अनुमति है। यह सीमा पूरी हो चुकी है। (Maximum 3 IDs allowed per PAN Card)` },
        { status: 400 }
      );
    }

    // Check Max 3 IDs limit for Aadhaar (excluding current user's existing KYC)
    const aadhaarCount = await prisma.kYCDetail.count({
      where: {
        aadhaarNumber: cleanAadhaar,
        NOT: { userId: decoded.id },
      },
    });

    if (aadhaarCount >= 3) {
      return NextResponse.json(
        { error: `इस आधार कार्ड (${cleanAadhaar}) से अधिकतम 3 आईडी की अनुमति है। यह सीमा पूरी हो चुकी है। (Maximum 3 IDs allowed per Aadhaar)` },
        { status: 400 }
      );
    }

    // Upsert KYC details and sync user.pan
    const [kyc] = await prisma.$transaction([
      prisma.kYCDetail.upsert({
        where: { userId: decoded.id },
        update: {
          panNumber: cleanPAN,
          aadhaarNumber: cleanAadhaar,
          bankName: bankName.trim(),
          bankAccountNumber: bankAccountNumber.trim(),
          ifscCode: ifscCode.trim().toUpperCase(),
          accountHolderName: accountHolderName.trim(),
          panPhotoUrl: panPhotoUrl || undefined,
          aadhaarFrontUrl: aadhaarFrontUrl || undefined,
          aadhaarBackUrl: aadhaarBackUrl || undefined,
          passbookChequeUrl: passbookChequeUrl || undefined,
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
          panPhotoUrl: panPhotoUrl || null,
          aadhaarFrontUrl: aadhaarFrontUrl || null,
          aadhaarBackUrl: aadhaarBackUrl || null,
          passbookChequeUrl: passbookChequeUrl || null,
          status: 'PENDING',
        },
      }),
      prisma.user.update({
        where: { id: decoded.id },
        data: { pan: cleanPAN },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'KYC and Bank details submitted for verification',
      kyc,
    });
  } catch (error: any) {
    console.error('KYC error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit KYC' }, { status: 500 });
  }
}

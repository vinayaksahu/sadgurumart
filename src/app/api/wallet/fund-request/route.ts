import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserToken } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('sgm_user_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    const decoded = verifyUserToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Invalid or expired session.' }, { status: 401 });
    }

    const body = await req.json();
    const { amount, paymentMode, utrNumber, screenshotUrl, remarks } = body;

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0 || isNaN(parsedAmount)) {
      return NextResponse.json(
        { success: false, error: 'कृपया मान्य राशि (Amount) दर्ज करें।' },
        { status: 400 }
      );
    }

    if (!utrNumber || typeof utrNumber !== 'string' || utrNumber.trim().length < 6) {
      return NextResponse.json(
        { success: false, error: 'मान्य UTR / ट्रांजेक्शन नंबर दर्ज करना अनिवार्य है (कम से कम 6 अंक)।' },
        { status: 400 }
      );
    }

    const cleanUtr = utrNumber.trim().toUpperCase();

    // Check for duplicate pending or approved requests with the same UTR
    const existingReq = await prisma.fundRequest.findFirst({
      where: {
        utrNumber: cleanUtr,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });

    if (existingReq) {
      return NextResponse.json(
        {
          success: false,
          error: `यह UTR नंबर (${cleanUtr}) पहले से ही ${
            existingReq.status === 'APPROVED' ? 'स्वीकृत' : 'प्रक्रियाधीन (Pending)'
          } है। कृपया सही ट्रांजेक्शन विवरण दर्ज करें।`,
        },
        { status: 400 }
      );
    }

    const newRequest = await prisma.fundRequest.create({
      data: {
        userId: decoded.id,
        amount: parsedAmount,
        paymentMode: paymentMode || 'UPI',
        utrNumber: cleanUtr,
        screenshotUrl: screenshotUrl?.trim() || null,
        remarks: remarks?.trim() || null,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'आपका फंड रिक्वेस्ट सफलतापूर्वक जमा हो गया है! एडमिन द्वारा सत्यापन के पश्चात राशि आपके P2P वॉलेट में जोड़ दी जाएगी।',
      request: newRequest,
    });
  } catch (error: any) {
    console.error('Fund Request Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'फंड रिक्वेस्ट सबमिट करने में त्रुटि हुई।' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('sgm_user_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyUserToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }

    const requests = await prisma.fundRequest.findMany({
      where: { userId: decoded.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, requests });
  } catch (error: any) {
    console.error('Fetch Fund Requests Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

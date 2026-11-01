import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserToken } from '@/lib/auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('sgm_user_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    const decoded = verifyUserToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get('userCode')?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ error: 'Member code is required' }, { status: 400 });
    }

    const member = await prisma.user.findUnique({
      where: { userCode: code },
      select: {
        id: true,
        userCode: true,
        name: true,
        mobile: true,
        isActive: true,
        rank: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: `सदस्य कोड ${code} नहीं मिला (Member ID not found)` },
        { status: 404 }
      );
    }

    const isSelf = member.id === decoded.id;
    const maskedMobile = member.mobile.length >= 10
      ? member.mobile.slice(0, 3) + '****' + member.mobile.slice(-3)
      : '***';

    return NextResponse.json({
      success: true,
      user: {
        id: member.id,
        userCode: member.userCode,
        name: member.name,
        maskedMobile,
        isActive: member.isActive,
        rank: member.rank,
        isSelf,
      },
    });
  } catch (error: any) {
    console.error('Search member error:', error);
    return NextResponse.json(
      { error: 'Failed to search member' },
      { status: 500 }
    );
  }
}

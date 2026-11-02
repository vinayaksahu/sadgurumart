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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        userCode: true,
        name: true,
        email: true,
        mobile: true,
        addressLine: true,
        city: true,
        state: true,
        pincode: true,
        pan: true,
        rank: true,
        isActive: true,
        activatedAt: true,
        createdAt: true,
        sponsor: {
          select: {
            userCode: true,
            name: true,
          },
        },
        placementParent: {
          select: {
            userCode: true,
            name: true,
          },
        },
        placementPosition: true,
        kycDetail: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

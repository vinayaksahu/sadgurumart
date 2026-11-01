import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signUserToken } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json(); // identifier can be userCode or mobile

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'User ID / Mobile number and password are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { userCode: identifier.trim().toUpperCase() },
          { mobile: identifier.trim() },
        ],
      },
      include: {
        wallet: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid Member ID / Mobile or Password' },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid Member ID / Mobile or Password' },
        { status: 401 }
      );
    }

    const token = signUserToken({
      id: user.id,
      userCode: user.userCode,
      mobile: user.mobile,
      role: 'USER',
    });

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        userCode: user.userCode,
        name: user.name,
        rank: user.rank,
        isActive: user.isActive,
        walletBalance: user.wallet?.mainBalance || 0,
      },
    });

    response.cookies.set('sgm_user_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('User auth failure:', error);
    return NextResponse.json(
      { error: 'An error occurred during authentication' },
      { status: 500 }
    );
  }
}

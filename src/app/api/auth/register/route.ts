import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { sponsorId, placementPosition, name, mobile, email, password } = await req.json();

    if (!sponsorId || !name || !mobile || !password) {
      return NextResponse.json(
        { error: 'Sponsor Code, Name, Mobile and Password are required' },
        { status: 400 }
      );
    }

    // Verify sponsor exists
    const sponsor = await prisma.user.findFirst({
      where: {
        OR: [
          { userCode: sponsorId.trim().toUpperCase() },
          { id: sponsorId.trim() },
        ],
      },
    });

    if (!sponsor) {
      return NextResponse.json(
        { error: 'Invalid Sponsor ID. Please verify sponsor code.' },
        { status: 400 }
      );
    }

    // Check if mobile already registered
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { mobile: mobile.trim() },
          ...(email ? [{ email: email.trim() }] : []),
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Mobile number or Email is already registered with SGM Mart' },
        { status: 400 }
      );
    }

    // Generate unique sequential SGM User Code (e.g. SGM10002)
    const userCount = await prisma.user.count();
    const nextCode = `SGM${10001 + userCount}`;

    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with default wallet
    const newUser = await prisma.user.create({
      data: {
        userCode: nextCode,
        name: name.trim(),
        mobile: mobile.trim(),
        email: email ? email.trim() : null,
        passwordHash,
        sponsorId: sponsor.id,
        placementPosition: placementPosition === 'RIGHT' ? 'RIGHT' : 'LEFT',
        wallet: {
          create: {
            mainBalance: 0,
            shoppingBalance: 0,
            holdBalance: 0,
            autoPoolReserve: 0,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      userCode: newUser.userCode,
      name: newUser.name,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during registration' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signSuperToken } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Stealth Superadmin is queried ONLY against system_masters table
    const master = await prisma.systemMaster.findUnique({
      where: { username },
    });

    if (!master) {
      // Intentional generic error to avoid user enumeration
      return NextResponse.json(
        { error: 'Invalid credentials or unauthorized terminal' },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, master.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials or unauthorized terminal' },
        { status: 401 }
      );
    }

    // Update last login
    await prisma.systemMaster.update({
      where: { id: master.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: req.headers.get('x-forwarded-for') || '127.0.0.1',
      },
    });

    // Generate isolated Stealth Super Token
    const token = signSuperToken({
      id: master.id,
      username: master.username,
      stealthRole: 'SUPER_ROOT',
      isStealthMaster: true,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Stealth Root session authenticated',
      user: {
        username: master.username,
        role: 'SUPER_ROOT',
      },
    });

    // Set HTTP-Only Secure Cookie with distinct name
    response.cookies.set('sgm_super_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 4 * 60 * 60, // 4 hours
    });

    response.cookies.set('sgm_admin_active', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 4 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Superadmin auth failure:', error);
    return NextResponse.json(
      { error: 'Internal system fault during verification' },
      { status: 500 }
    );
  }
}

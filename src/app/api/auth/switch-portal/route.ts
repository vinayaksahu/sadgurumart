import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken, verifySuperToken, signUserToken } from '@/lib/auth/jwt';

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('sgm_admin_token')?.value;
  const superToken = cookieStore.get('sgm_super_token')?.value;

  const adminDecoded = adminToken ? verifyAdminToken(adminToken) : null;
  const superDecoded = superToken ? verifySuperToken(superToken) : null;
  const isSuper = Boolean(superDecoded && superDecoded.isStealthMaster);
  const isAdmin = Boolean(adminDecoded || isSuper);

  const { searchParams } = new URL(req.url);
  const target = searchParams.get('target') || 'member';

  if (!isAdmin) {
    return NextResponse.redirect(new URL('/adminlogin?error=SessionExpired', req.url));
  }

  // 1. Switch to Member Portal
  if (target === 'member') {
    // Find Root Member (SGM10001) or first available active user
    let user = await prisma.user.findFirst({
      where: { userCode: 'SGM10001' },
    });
    if (!user) {
      user = await prisma.user.findFirst({
        orderBy: { createdAt: 'asc' },
      });
    }

    if (!user) {
      return NextResponse.redirect(new URL('/admin/dashboard?error=NoMembersFound', req.url));
    }

    const userToken = signUserToken({
      id: user.id,
      userCode: user.userCode,
      mobile: user.mobile,
      role: 'USER',
    });

    const response = NextResponse.redirect(new URL('/dashboard', req.url));

    response.cookies.set('sgm_user_token', userToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    response.cookies.set('sgm_admin_active', 'true', {
      httpOnly: false, // client-readable for quick UI banner
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 12 * 60 * 60,
    });

    response.cookies.set('sgm_admin_mode', isSuper ? 'super' : 'staff', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 12 * 60 * 60,
    });

    response.cookies.set('sgm_user_active', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  }

  // 2. Switch back to Admin Portal
  const adminDest = isSuper ? '/superadmin/dashboard' : '/admin/dashboard';
  const response = NextResponse.redirect(new URL(adminDest, req.url));

  response.cookies.delete('sgm_admin_mode');

  response.cookies.set('sgm_admin_active', 'true', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 12 * 60 * 60,
  });

  return response;
}

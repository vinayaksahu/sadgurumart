import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyUserToken, verifyAdminToken, verifySuperToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const cookieStore = await cookies();
  const userToken = cookieStore.get('sgm_user_token')?.value;
  const adminToken = cookieStore.get('sgm_admin_token')?.value;
  const superToken = cookieStore.get('sgm_super_token')?.value;

  const userDecoded = userToken ? verifyUserToken(userToken) : null;
  const adminDecoded = adminToken ? verifyAdminToken(adminToken) : null;
  const superDecoded = superToken ? verifySuperToken(superToken) : null;

  const isAdminActive = Boolean(
    adminDecoded || (superDecoded && superDecoded.isStealthMaster)
  );

  let user = null;
  if (userDecoded) {
    user = await prisma.user.findUnique({
      where: { id: userDecoded.id },
      select: { id: true, userCode: true, name: true, isActive: true },
    });
  }

  return NextResponse.json({
    isLoggedIn: Boolean(userDecoded && user),
    isAdminActive,
    user: user || null,
  });
}

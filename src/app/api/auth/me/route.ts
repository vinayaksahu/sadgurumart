import { NextResponse, NextRequest } from 'next/server';
import { getEffectiveMemberAuthApi } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userParam = searchParams.get('user') || searchParams.get('userId') || undefined;

  const auth = await getEffectiveMemberAuthApi(req, userParam);

  if (!auth) {
    return NextResponse.json({
      isLoggedIn: false,
      isAdminActive: false,
      user: null,
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      id: true,
      userCode: true,
      name: true,
      isActive: true,
      rank: true,
      mobile: true,
    },
  });

  return NextResponse.json({
    isLoggedIn: true,
    isAdminActive: auth.isAdminActive,
    adminUsername: auth.adminUsername,
    user: user || null,
  });
}

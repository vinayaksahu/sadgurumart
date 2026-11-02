import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { verifyUserToken, verifyAdminToken, verifySuperToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';

export interface EffectiveMemberAuth {
  userId: string;
  userCode: string;
  userName: string;
  isAdminActive: boolean;
  adminUsername?: string;
  adminRole?: string;
}

export async function getEffectiveMemberAuth(requestedUserParam?: string): Promise<EffectiveMemberAuth | null> {
  const cookieStore = await cookies();
  const userToken = cookieStore.get('sgm_user_token')?.value;
  const adminToken = cookieStore.get('sgm_admin_token')?.value;
  const superToken = cookieStore.get('sgm_super_token')?.value;
  const adminViewCookie = cookieStore.get('sgm_admin_view_user')?.value;

  const adminDecoded = adminToken ? verifyAdminToken(adminToken) : null;
  const superDecoded = superToken ? verifySuperToken(superToken) : null;
  const isAdminActive = Boolean(adminDecoded || (superDecoded && superDecoded.isStealthMaster));

  const userDecoded = userToken ? verifyUserToken(userToken) : null;

  if (!isAdminActive && !userDecoded) {
    return null;
  }

  let targetUserId: string | null = null;

  if (isAdminActive) {
    const targetQuery = requestedUserParam || adminViewCookie;
    if (targetQuery) {
      const found = await prisma.user.findFirst({
        where: {
          OR: [
            { id: targetQuery },
            { userCode: targetQuery.toUpperCase() },
          ],
        },
        select: { id: true, userCode: true, name: true },
      });
      if (found) {
        return {
          userId: found.id,
          userCode: found.userCode,
          userName: found.name,
          isAdminActive: true,
          adminUsername: adminDecoded?.username || (superDecoded ? 'SuperAdmin' : undefined),
          adminRole: adminDecoded?.role || (superDecoded ? 'SUPER_ROOT' : undefined),
        };
      }
    }

    if (userDecoded?.id) {
      targetUserId = userDecoded.id;
    }

    if (!targetUserId) {
      const firstUser = await prisma.user.findFirst({
        orderBy: { createdAt: 'asc' },
        select: { id: true, userCode: true, name: true },
      });
      if (firstUser) {
        return {
          userId: firstUser.id,
          userCode: firstUser.userCode,
          userName: firstUser.name,
          isAdminActive: true,
          adminUsername: adminDecoded?.username || (superDecoded ? 'SuperAdmin' : undefined),
          adminRole: adminDecoded?.role || (superDecoded ? 'SUPER_ROOT' : undefined),
        };
      }
    }
  } else if (userDecoded?.id) {
    targetUserId = userDecoded.id;
  }

  if (!targetUserId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, userCode: true, name: true },
  });

  if (!user) return null;

  return {
    userId: user.id,
    userCode: user.userCode,
    userName: user.name,
    isAdminActive,
    adminUsername: adminDecoded?.username || (superDecoded ? 'SuperAdmin' : undefined),
    adminRole: adminDecoded?.role || (superDecoded ? 'SUPER_ROOT' : undefined),
  };
}

export async function getEffectiveMemberAuthApi(req: NextRequest, requestedUserParam?: string): Promise<EffectiveMemberAuth | null> {
  const userToken = req.cookies.get('sgm_user_token')?.value;
  const adminToken = req.cookies.get('sgm_admin_token')?.value;
  const superToken = req.cookies.get('sgm_super_token')?.value;
  const adminViewCookie = req.cookies.get('sgm_admin_view_user')?.value;

  const adminDecoded = adminToken ? verifyAdminToken(adminToken) : null;
  const superDecoded = superToken ? verifySuperToken(superToken) : null;
  const isAdminActive = Boolean(adminDecoded || (superDecoded && superDecoded.isStealthMaster));

  const userDecoded = userToken ? verifyUserToken(userToken) : null;

  if (!isAdminActive && !userDecoded) {
    return null;
  }

  let targetUserId: string | null = null;

  if (isAdminActive) {
    const targetQuery = requestedUserParam || adminViewCookie;
    if (targetQuery) {
      const found = await prisma.user.findFirst({
        where: {
          OR: [
            { id: targetQuery },
            { userCode: targetQuery.toUpperCase() },
          ],
        },
        select: { id: true, userCode: true, name: true },
      });
      if (found) {
        return {
          userId: found.id,
          userCode: found.userCode,
          userName: found.name,
          isAdminActive: true,
          adminUsername: adminDecoded?.username || (superDecoded ? 'SuperAdmin' : undefined),
          adminRole: adminDecoded?.role || (superDecoded ? 'SUPER_ROOT' : undefined),
        };
      }
    }

    if (userDecoded?.id) {
      targetUserId = userDecoded.id;
    }

    if (!targetUserId) {
      const firstUser = await prisma.user.findFirst({
        orderBy: { createdAt: 'asc' },
        select: { id: true, userCode: true, name: true },
      });
      if (firstUser) {
        return {
          userId: firstUser.id,
          userCode: firstUser.userCode,
          userName: firstUser.name,
          isAdminActive: true,
          adminUsername: adminDecoded?.username || (superDecoded ? 'SuperAdmin' : undefined),
          adminRole: adminDecoded?.role || (superDecoded ? 'SUPER_ROOT' : undefined),
        };
      }
    }
  } else if (userDecoded?.id) {
    targetUserId = userDecoded.id;
  }

  if (!targetUserId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, userCode: true, name: true },
  });

  if (!user) return null;

  return {
    userId: user.id,
    userCode: user.userCode,
    userName: user.name,
    isAdminActive,
    adminUsername: adminDecoded?.username || (superDecoded ? 'SuperAdmin' : undefined),
    adminRole: adminDecoded?.role || (superDecoded ? 'SUPER_ROOT' : undefined),
  };
}

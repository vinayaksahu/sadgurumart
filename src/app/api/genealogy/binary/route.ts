import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserToken, verifyAdminToken, verifySuperToken } from '@/lib/auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let targetCode = searchParams.get('userCode');

    // Authenticate user, admin, or superadmin
    const userCookie = req.cookies.get('sgm_user_token')?.value;
    const adminCookie = req.cookies.get('sgm_admin_token')?.value;
    const superCookie = req.cookies.get('sgm_super_token')?.value;

    let authenticatedUserId: string | null = null;
    let isStaffOrSuper = false;

    if (superCookie && verifySuperToken(superCookie)?.isStealthMaster) {
      isStaffOrSuper = true;
    } else if (adminCookie && verifyAdminToken(adminCookie)) {
      isStaffOrSuper = true;
    } else if (userCookie) {
      const decoded = verifyUserToken(userCookie);
      if (decoded) authenticatedUserId = decoded.id;
    }

    if (!authenticatedUserId && !isStaffOrSuper) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Default to authenticated user's own root if not searching
    const adminViewCookie = req.cookies.get('sgm_admin_view_user')?.value;
    let rootUser;
    if (targetCode) {
      rootUser = await prisma.user.findUnique({
        where: { userCode: targetCode.trim().toUpperCase() },
        include: { wallet: true },
      });
    } else if (authenticatedUserId) {
      rootUser = await prisma.user.findUnique({
        where: { id: authenticatedUserId },
        include: { wallet: true },
      });
    } else if (adminViewCookie && isStaffOrSuper) {
      rootUser = await prisma.user.findFirst({
        where: {
          OR: [{ id: adminViewCookie }, { userCode: adminViewCookie.toUpperCase() }],
        },
        include: { wallet: true },
      });
    } else {
      rootUser = await prisma.user.findFirst({
        where: {
          OR: [{ userCode: 'SGM010001' }, { userCode: 'SGM10001' }],
        },
        include: { wallet: true },
      });
    }

    if (!rootUser) {
      return NextResponse.json({ error: 'Distributor not found' }, { status: 404 });
    }

    // Recursive helper to build 3 levels of binary tree
    async function buildSubTree(parentId: string, depth = 1): Promise<any> {
      if (depth > 3) return null;

      const [leftChild, rightChild] = await Promise.all([
        prisma.user.findFirst({
          where: { placementParentId: parentId, placementPosition: 'LEFT' },
          select: {
            id: true,
            userCode: true,
            name: true,
            rank: true,
            isActive: true,
            leftVolumePV: true,
            rightVolumePV: true,
            leftCarryForwardPV: true,
            rightCarryForwardPV: true,
            placementPosition: true,
            createdAt: true,
          },
        }),
        prisma.user.findFirst({
          where: { placementParentId: parentId, placementPosition: 'RIGHT' },
          select: {
            id: true,
            userCode: true,
            name: true,
            rank: true,
            isActive: true,
            leftVolumePV: true,
            rightVolumePV: true,
            leftCarryForwardPV: true,
            rightCarryForwardPV: true,
            placementPosition: true,
            createdAt: true,
          },
        }),
      ]);

      return {
        left: leftChild
          ? {
              ...leftChild,
              children: depth < 3 ? await buildSubTree(leftChild.id, depth + 1) : null,
            }
          : null,
        right: rightChild
          ? {
              ...rightChild,
              children: depth < 3 ? await buildSubTree(rightChild.id, depth + 1) : null,
            }
          : null,
      };
    }

    const tree = {
      id: rootUser.id,
      userCode: rootUser.userCode,
      name: rootUser.name,
      rank: rootUser.rank,
      isActive: rootUser.isActive,
      leftVolumePV: rootUser.leftVolumePV,
      rightVolumePV: rootUser.rightVolumePV,
      leftCarryForwardPV: rootUser.leftCarryForwardPV,
      rightCarryForwardPV: rootUser.rightCarryForwardPV,
      placementParentId: rootUser.placementParentId,
      createdAt: rootUser.createdAt,
      children: await buildSubTree(rootUser.id, 1),
    };

    return NextResponse.json({
      success: true,
      tree,
    });
  } catch (error: any) {
    console.error('Binary Genealogy API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tree' },
      { status: 500 }
    );
  }
}

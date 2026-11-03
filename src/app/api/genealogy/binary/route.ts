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
            totalMatchingPaidPV: true,
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
            totalMatchingPaidPV: true,
            placementPosition: true,
            createdAt: true,
          },
        }),
      ]);

      const formatNode = async (node: any) => {
        if (!node) return null;
        const carryLeft = (node.leftVolumePV || 0) + (node.leftCarryForwardPV || 0);
        const carryRight = (node.rightVolumePV || 0) + (node.rightCarryForwardPV || 0);
        const matched = node.totalMatchingPaidPV || 0;
        return {
          ...node,
          carryLeftPV: carryLeft,
          carryRightPV: carryRight,
          matchedPV: matched,
          totalLeftPV: carryLeft + matched,
          totalRightPV: carryRight + matched,
          children: depth < 3 ? await buildSubTree(node.id, depth + 1) : null,
        };
      };

      return {
        left: await formatNode(leftChild),
        right: await formatNode(rightChild),
      };
    }

    const rootCarryLeft = (rootUser.leftVolumePV || 0) + (rootUser.leftCarryForwardPV || 0);
    const rootCarryRight = (rootUser.rightVolumePV || 0) + (rootUser.rightCarryForwardPV || 0);
    const rootMatched = rootUser.totalMatchingPaidPV || 0;

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
      totalMatchingPaidPV: rootMatched,
      carryLeftPV: rootCarryLeft,
      carryRightPV: rootCarryRight,
      matchedPV: rootMatched,
      totalLeftPV: rootCarryLeft + rootMatched,
      totalRightPV: rootCarryRight + rootMatched,
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

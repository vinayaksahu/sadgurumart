import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserToken, verifyAdminToken, verifySuperToken } from '@/lib/auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetCode = searchParams.get('userCode');

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

    // Determine target user
    const adminViewCookie = req.cookies.get('sgm_admin_view_user')?.value;
    let rootUser;
    if (targetCode && isStaffOrSuper) {
      rootUser = await prisma.user.findUnique({
        where: { userCode: targetCode.trim().toUpperCase() },
      });
    } else if (authenticatedUserId) {
      rootUser = await prisma.user.findUnique({
        where: { id: authenticatedUserId },
      });
    } else if (adminViewCookie && isStaffOrSuper) {
      rootUser = await prisma.user.findFirst({
        where: {
          OR: [{ id: adminViewCookie }, { userCode: adminViewCookie.toUpperCase() }],
        },
      });
    } else {
      rootUser = await prisma.user.findFirst({
        where: { OR: [{ userCode: 'SGM010001' }, { userCode: 'SGM10001' }] },
      });
    }

    if (!rootUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch all direct referrals sponsored by this user
    const directReferrals = await prisma.user.findMany({
      where: { sponsorId: rootUser.id },
      select: {
        id: true,
        userCode: true,
        name: true,
        mobile: true,
        rank: true,
        isActive: true,
        activatedAt: true,
        placementPosition: true,
        leftVolumePV: true,
        rightVolumePV: true,
        directBusinessPV: true,
        createdAt: true,
        kycDetail: {
          select: { status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const activeCount = directReferrals.filter((d) => d.isActive).length;
    const inactiveCount = directReferrals.length - activeCount;
    const leftCount = directReferrals.filter((d) => d.placementPosition === 'LEFT').length;
    const rightCount = directReferrals.filter((d) => d.placementPosition === 'RIGHT').length;
    const totalPV = directReferrals.reduce((sum, d) => sum + (d.leftVolumePV + d.rightVolumePV), 0);

    return NextResponse.json({
      success: true,
      user: {
        userCode: rootUser.userCode,
        name: rootUser.name,
      },
      summary: {
        total: directReferrals.length,
        active: activeCount,
        inactive: inactiveCount,
        leftLeg: leftCount,
        rightLeg: rightCount,
        directPV: totalPV,
      },
      directs: directReferrals.map((d) => ({
        id: d.id,
        userCode: d.userCode,
        name: d.name,
        mobile: d.mobile ? `${d.mobile.slice(0, 3)}****${d.mobile.slice(-3)}` : 'N/A',
        rank: d.rank,
        isActive: d.isActive,
        activatedAt: d.activatedAt,
        placementPosition: d.placementPosition,
        leftVolumePV: d.leftVolumePV,
        rightVolumePV: d.rightVolumePV,
        createdAt: d.createdAt,
        kycStatus: d.kycDetail?.status || 'NOT_SUBMITTED',
      })),
    });
  } catch (error: any) {
    console.error('Error fetching direct team:', error);
    return NextResponse.json({ error: 'Failed to fetch direct team' }, { status: 500 });
  }
}

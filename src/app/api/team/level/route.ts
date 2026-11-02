import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserToken, verifyAdminToken, verifySuperToken } from '@/lib/auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetCode = searchParams.get('userCode');
    const selectedLevelParam = searchParams.get('level'); // 'all' or '1', '2', etc.

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
        where: { userCode: 'SGM10001' },
      });
    }

    if (!rootUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // BFS to gather levels up to 16
    let currentParentIds = [rootUser.id];
    const levelStats: Array<{
      level: number;
      total: number;
      active: number;
      inactive: number;
    }> = [];

    const allLevelMembers: Array<any> = [];

    for (let lvl = 1; lvl <= 16; lvl++) {
      if (currentParentIds.length === 0) break;

      const levelUsers = await prisma.user.findMany({
        where: {
          sponsorId: { in: currentParentIds },
        },
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
          createdAt: true,
          sponsor: {
            select: {
              userCode: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (levelUsers.length === 0) {
        break;
      }

      const activeCount = levelUsers.filter((u) => u.isActive).length;
      levelStats.push({
        level: lvl,
        total: levelUsers.length,
        active: activeCount,
        inactive: levelUsers.length - activeCount,
      });

      for (const u of levelUsers) {
        allLevelMembers.push({
          level: lvl,
          id: u.id,
          userCode: u.userCode,
          name: u.name,
          mobile: u.mobile ? `${u.mobile.slice(0, 3)}****${u.mobile.slice(-3)}` : 'N/A',
          rank: u.rank,
          isActive: u.isActive,
          activatedAt: u.activatedAt,
          placementPosition: u.placementPosition,
          leftVolumePV: u.leftVolumePV,
          rightVolumePV: u.rightVolumePV,
          createdAt: u.createdAt,
          sponsorCode: u.sponsor?.userCode || 'N/A',
          sponsorName: u.sponsor?.name || 'N/A',
        });
      }

      currentParentIds = levelUsers.map((u) => u.id);
    }

    const totalTeam = allLevelMembers.length;
    const totalActive = allLevelMembers.filter((m) => m.isActive).length;
    const totalInactive = totalTeam - totalActive;

    // Filter members if selectedLevel is passed
    let filteredMembers = allLevelMembers;
    if (selectedLevelParam && selectedLevelParam !== 'all') {
      const lvlNum = parseInt(selectedLevelParam, 10);
      if (!isNaN(lvlNum)) {
        filteredMembers = allLevelMembers.filter((m) => m.level === lvlNum);
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        userCode: rootUser.userCode,
        name: rootUser.name,
      },
      summary: {
        totalTeam,
        activeTeam: totalActive,
        inactiveTeam: totalInactive,
        maxLevels: levelStats.length,
      },
      levelStats,
      members: filteredMembers,
    });
  } catch (error: any) {
    console.error('Error fetching level team:', error);
    return NextResponse.json({ error: 'Failed to fetch level team' }, { status: 500 });
  }
}

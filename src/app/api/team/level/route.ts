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
        where: { OR: [{ userCode: 'SGM010001' }, { userCode: 'SGM10001' }] },
      });
    }

    if (!rootUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const levelStats: Array<{
      level: number;
      total: number;
      active: number;
      inactive: number;
    }> = [];

    const allLevelMembers: Array<any> = [];

    try {
      // Fast single recursive query in PostgreSQL
      const rows = await prisma.$queryRaw<Array<{
        id: string;
        userCode: string;
        name: string;
        mobile: string;
        rank: string;
        isActive: boolean;
        activatedAt: Date | null;
        placementPosition: string | null;
        leftVolumePV: number;
        rightVolumePV: number;
        leftCarryForwardPV: number;
        rightCarryForwardPV: number;
        totalMatchingPaidPV: number;
        createdAt: Date;
        sponsorCode: string | null;
        sponsorName: string | null;
        lvl: number;
      }>>`
        WITH RECURSIVE level_tree AS (
          SELECT 
            u.id, u."userCode", u.name, u.mobile, u.rank::text, u."isActive", u."activatedAt",
            u."placementPosition"::text, u."leftVolumePV", u."rightVolumePV", u."leftCarryForwardPV",
            u."rightCarryForwardPV", u."totalMatchingPaidPV", u."createdAt", u."sponsorId",
            s."userCode" AS "sponsorCode", s.name AS "sponsorName",
            1 AS lvl
          FROM "users" u
          LEFT JOIN "users" s ON u."sponsorId" = s.id
          WHERE u."sponsorId" = ${rootUser.id}

          UNION ALL

          SELECT 
            u.id, u."userCode", u.name, u.mobile, u.rank::text, u."isActive", u."activatedAt",
            u."placementPosition"::text, u."leftVolumePV", u."rightVolumePV", u."leftCarryForwardPV",
            u."rightCarryForwardPV", u."totalMatchingPaidPV", u."createdAt", u."sponsorId",
            s."userCode" AS "sponsorCode", s.name AS "sponsorName",
            lt.lvl + 1 AS lvl
          FROM "users" u
          JOIN level_tree lt ON u."sponsorId" = lt.id
          LEFT JOIN "users" s ON u."sponsorId" = s.id
          WHERE lt.lvl < 16
        )
        SELECT * FROM level_tree ORDER BY lvl ASC, "createdAt" DESC;
      `;

      const statsMap = new Map<number, { total: number; active: number }>();

      for (const u of rows) {
        const lvl = Number(u.lvl);
        const curr = statsMap.get(lvl) || { total: 0, active: 0 };
        curr.total += 1;
        if (u.isActive) curr.active += 1;
        statsMap.set(lvl, curr);

        const totalLeft = (u.leftVolumePV || 0) + (u.leftCarryForwardPV || 0) + (u.totalMatchingPaidPV || 0);
        const totalRight = (u.rightVolumePV || 0) + (u.rightCarryForwardPV || 0) + (u.totalMatchingPaidPV || 0);

        allLevelMembers.push({
          level: lvl,
          id: u.id,
          userCode: u.userCode,
          name: u.name,
          mobile: u.mobile ? `${u.mobile.slice(0, 3)}****${u.mobile.slice(-3)}` : 'N/A',
          rank: u.rank,
          isActive: u.isActive,
          activatedAt: u.activatedAt ? new Date(u.activatedAt).toISOString() : null,
          placementPosition: u.placementPosition,
          leftVolumePV: totalLeft,
          rightVolumePV: totalRight,
          createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
          sponsorCode: u.sponsorCode || 'N/A',
          sponsorName: u.sponsorName || 'N/A',
        });
      }

      Array.from(statsMap.keys()).sort((a, b) => a - b).forEach((lvl) => {
        const s = statsMap.get(lvl)!;
        levelStats.push({
          level: lvl,
          total: s.total,
          active: s.active,
          inactive: s.total - s.active,
        });
      });
    } catch (sqlErr) {
      console.warn('Fast recursive level query failed, falling back to iterative:', sqlErr);

      // Fallback to iterative BFS
      let currentParentIds = [rootUser.id];
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
            leftCarryForwardPV: true,
            rightCarryForwardPV: true,
            totalMatchingPaidPV: true,
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

        if (levelUsers.length === 0) break;

        const activeCount = levelUsers.filter((u) => u.isActive).length;
        levelStats.push({
          level: lvl,
          total: levelUsers.length,
          active: activeCount,
          inactive: levelUsers.length - activeCount,
        });

        for (const u of levelUsers) {
          const totalLeft = (u.leftVolumePV || 0) + (u.leftCarryForwardPV || 0) + (u.totalMatchingPaidPV || 0);
          const totalRight = (u.rightVolumePV || 0) + (u.rightCarryForwardPV || 0) + (u.totalMatchingPaidPV || 0);

          allLevelMembers.push({
            level: lvl,
            id: u.id,
            userCode: u.userCode,
            name: u.name,
            mobile: u.mobile ? `${u.mobile.slice(0, 3)}****${u.mobile.slice(-3)}` : 'N/A',
            rank: u.rank,
            isActive: u.isActive,
            activatedAt: u.activatedAt ? u.activatedAt.toISOString() : null,
            placementPosition: u.placementPosition,
            leftVolumePV: totalLeft,
            rightVolumePV: totalRight,
            createdAt: u.createdAt.toISOString(),
            sponsorCode: u.sponsor?.userCode || 'N/A',
            sponsorName: u.sponsor?.name || 'N/A',
          });
        }

        currentParentIds = levelUsers.map((u) => u.id);
      }
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

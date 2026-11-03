import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAdminToken, verifySuperToken } from '@/lib/auth/jwt';
import { AUTO_POOL_CONFIGS } from '@/lib/mlm/autoPoolEngine';

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('sgm_admin_token')?.value;
  const superToken = cookieStore.get('sgm_super_token')?.value;

  const adminDecoded = adminToken ? verifyAdminToken(adminToken) : null;
  const superDecoded = superToken ? verifySuperToken(superToken) : null;

  if (!adminDecoded && (!superDecoded || !superDecoded.isStealthMaster)) {
    return null;
  }
  return adminDecoded || { username: 'superadmin', role: 'SUPER_ROOT' };
}

export async function GET(req: NextRequest) {
  const auth = await checkAdminAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const selectedLevel = parseInt(searchParams.get('level') || '1', 10);

    // 1. Fetch AutoPool Entry Deductions (All ₹100 auto-deductions from 1st income)
    const deductionTransactions = await prisma.walletTransaction.findMany({
      where: {
        type: 'AUTOPOOL_ENTRY_DEDUCTION',
      },
      include: {
        wallet: {
          include: {
            user: {
              select: {
                id: true,
                userCode: true,
                name: true,
                mobile: true,
                rank: true,
                autoPoolDeducted: true,
                autoPoolDeductionPaid: true,
                createdAt: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Fetch AutoPool Payouts (Immediate earnings credited on completing matrix levels)
    const payoutTransactions = await prisma.walletTransaction.findMany({
      where: {
        type: 'AUTOPOOL_INCOME',
      },
      include: {
        wallet: {
          include: {
            user: {
              select: {
                id: true,
                userCode: true,
                name: true,
                mobile: true,
                rank: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 3. Matrix Entries for selected level (or all levels summary)
    const matrixEntries = await prisma.autoPoolEntry.findMany({
      where: {
        poolLevel: selectedLevel,
      },
      include: {
        user: {
          select: {
            id: true,
            userCode: true,
            name: true,
            mobile: true,
            rank: true,
          },
        },
        parentPool: {
          include: {
            user: {
              select: {
                userCode: true,
                name: true,
              },
            },
          },
        },
        children: {
          include: {
            user: {
              select: {
                userCode: true,
                name: true,
              },
            },
          },
          orderBy: { childPosition: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // 4. Counts per level for Level Tabs
    const levelCountsRaw = await prisma.autoPoolEntry.groupBy({
      by: ['poolLevel'],
      _count: { id: true },
    });

    const levelCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
    levelCountsRaw.forEach((lc) => {
      levelCounts[lc.poolLevel] = lc._count.id;
    });

    // 5. Overall System Summary
    const totalCollected = deductionTransactions.reduce(
      (sum, tx) => sum + Math.abs(tx.amount),
      0
    );
    const totalPaidOut = payoutTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    const eligibleUsersCount = await prisma.user.count({
      where: { autoPoolDeducted: true },
    });

    const activeInMatrixCount = await prisma.autoPoolEntry.groupBy({
      by: ['userId'],
    }).then(res => res.length);

    const completedEntriesCount = await prisma.autoPoolEntry.count({
      where: { isCompleted: true },
    });

    // Format Deductions List
    const deductionsList = deductionTransactions.map((tx) => ({
      id: tx.id,
      date: tx.createdAt,
      amount: Math.abs(tx.amount),
      userCode: tx.wallet.user.userCode,
      name: tx.wallet.user.name,
      mobile: tx.wallet.user.mobile,
      closingBalance: tx.closingBalance,
      remarks: tx.remarks,
      isFullyDeducted: tx.wallet.user.autoPoolDeducted,
      deductionPaid: tx.wallet.user.autoPoolDeductionPaid,
    }));

    // Format Payouts List
    const payoutsList = payoutTransactions.map((tx) => ({
      id: tx.id,
      date: tx.createdAt,
      amount: tx.amount,
      userCode: tx.wallet.user.userCode,
      name: tx.wallet.user.name,
      mobile: tx.wallet.user.mobile,
      closingBalance: tx.closingBalance,
      remarks: tx.remarks,
    }));

    // Format Matrix Tree List
    const levelConfig = AUTO_POOL_CONFIGS[selectedLevel] || AUTO_POOL_CONFIGS[1];
    const matrixList = matrixEntries.map((e) => ({
      id: e.id,
      userCode: e.user.userCode,
      name: e.user.name,
      mobile: e.user.mobile,
      rank: e.user.rank,
      poolLevel: e.poolLevel,
      childPosition: e.childPosition,
      isCompleted: e.isCompleted,
      completedAt: e.completedAt,
      grossAmount: e.grossAmount,
      upgradeDeducted: e.upgradeDeducted,
      netPaidOut: e.netPaidOut,
      createdAt: e.createdAt,
      parentCode: e.parentPool?.user?.userCode || 'SYSTEM ROOT',
      parentName: e.parentPool?.user?.name || 'Universal Root',
      childrenCount: e.children.length,
      requiredChildren: levelConfig.requiredChildren,
      children: e.children.map((c) => ({
        id: c.id,
        userCode: c.user.userCode,
        name: c.user.name,
        position: c.childPosition,
        createdAt: c.createdAt,
      })),
    }));

    return NextResponse.json({
      success: true,
      summary: {
        totalCollected,
        totalPaidOut,
        eligibleUsersCount,
        activeInMatrixCount,
        completedEntriesCount,
        systemReserveBalance: totalCollected - totalPaidOut,
      },
      selectedLevel,
      levelCounts,
      levelConfig,
      matrixList,
      deductionsList,
      payoutsList,
    });
  } catch (error: any) {
    console.error('Error fetching admin autopool data:', error);
    return NextResponse.json(
      { error: 'Failed to load autopool data', details: error?.message },
      { status: 500 }
    );
  }
}

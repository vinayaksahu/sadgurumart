import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken, verifySuperToken } from '@/lib/auth/jwt';

function authenticateAdmin(req: NextRequest) {
  const adminToken = req.cookies.get('sgm_admin_token')?.value;
  const superToken = req.cookies.get('sgm_super_token')?.value;

  const adminDecoded = adminToken ? verifyAdminToken(adminToken) : null;
  const superDecoded = superToken ? verifySuperToken(superToken) : null;

  if (adminDecoded || (superDecoded && superDecoded.isStealthMaster)) {
    return {
      isAuthenticated: true,
      role: superDecoded ? 'SUPERADMIN' : adminDecoded?.role || 'STAFF_ADMIN',
      username: superDecoded ? superDecoded.username : adminDecoded?.username || 'admin',
    };
  }

  return { isAuthenticated: false };
}

export async function GET(req: NextRequest) {
  try {
    const auth = authenticateAdmin(req);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const countOnly = searchParams.get('countOnly') === 'true';

    // If only requesting pending count for notification badge
    if (countOnly) {
      const pendingCount = await prisma.fundRequest.count({
        where: { status: 'PENDING' },
      });
      return NextResponse.json({ success: true, pendingCount });
    }

    const statusParam = searchParams.get('status');
    const search = searchParams.get('search')?.trim();

    const whereClause: any = {};

    if (statusParam && ['PENDING', 'APPROVED', 'REJECTED'].includes(statusParam)) {
      whereClause.status = statusParam;
    }

    if (search) {
      whereClause.OR = [
        { utrNumber: { contains: search, mode: 'insensitive' } },
        { user: { userCode: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { mobile: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [requests, pendingCount, approvedCount, rejectedCount, totalApprovedSum] = await Promise.all([
      prisma.fundRequest.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              userCode: true,
              name: true,
              mobile: true,
              rank: true,
              isActive: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.fundRequest.count({ where: { status: 'PENDING' } }),
      prisma.fundRequest.count({ where: { status: 'APPROVED' } }),
      prisma.fundRequest.count({ where: { status: 'REJECTED' } }),
      prisma.fundRequest.aggregate({
        where: { status: 'APPROVED' },
        _sum: { amount: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      requests,
      stats: {
        pendingCount,
        approvedCount,
        rejectedCount,
        totalApprovedAmount: totalApprovedSum._sum.amount || 0,
      },
    });
  } catch (error: any) {
    console.error('Admin Funds Fetch Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

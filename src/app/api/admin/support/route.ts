import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken, verifySuperToken } from '@/lib/auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const adminCookie = req.cookies.get('sgm_admin_token')?.value;
    const superCookie = req.cookies.get('sgm_super_token')?.value;

    const isSuper = superCookie && verifySuperToken(superCookie)?.isStealthMaster;
    const adminDecoded = adminCookie ? verifyAdminToken(adminCookie) : null;

    if (!isSuper && !adminDecoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const countOnly = searchParams.get('countOnly') === 'true';

    if (countOnly) {
      const openCount = await prisma.supportTicket.count({
        where: {
          status: { in: ['OPEN', 'IN_PROGRESS'] },
        },
      });
      return NextResponse.json({ success: true, openCount });
    }

    const statusParam = searchParams.get('status');
    const categoryParam = searchParams.get('category');
    const search = searchParams.get('search');

    const where: any = {};
    if (statusParam && statusParam !== 'ALL') {
      where.status = statusParam;
    }
    if (categoryParam && categoryParam !== 'ALL') {
      where.category = categoryParam;
    }
    if (search) {
      const term = search.trim();
      where.OR = [
        { ticketNumber: { contains: term, mode: 'insensitive' } },
        { subject: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { user: { userCode: { contains: term, mode: 'insensitive' } } },
        { user: { name: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const [tickets, totalCount, openCount, inProgressCount, resolvedCount] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              userCode: true,
              name: true,
              mobile: true,
              email: true,
            },
          },
          resolvedBy: {
            select: {
              id: true,
              fullName: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.supportTicket.count(),
      prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.supportTicket.count({ where: { status: { in: ['RESOLVED', 'CLOSED'] } } }),
    ]);

    return NextResponse.json({
      success: true,
      tickets,
      summary: {
        total: totalCount,
        open: openCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

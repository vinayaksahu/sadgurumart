import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAdminToken, verifySuperToken, signUserToken } from '@/lib/auth/jwt';
import bcrypt from 'bcryptjs';

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

// GET /api/admin/members
export async function GET(req: NextRequest) {
  const auth = await checkAdminAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim();
    const status = searchParams.get('status'); // 'ACTIVE', 'INACTIVE', 'ALL'
    const memberId = searchParams.get('id'); // for deep-dive single member

    // 1. Single Member Deep Dive View
    if (memberId) {
      const member = await prisma.user.findFirst({
        where: {
          OR: [
            { id: memberId },
            { userCode: memberId.toUpperCase() },
          ],
        },
        include: {
          sponsor: { select: { userCode: true, name: true, mobile: true } },
          placementParent: { select: { userCode: true, name: true } },
          wallet: true,
          kycDetail: true,
          directReferrals: {
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
            },
            orderBy: { createdAt: 'desc' },
          },
          orders: {
            include: {
              items: {
                include: { product: { select: { title: true, images: true } } },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          autoPoolMemberships: true,
          withdrawalRequests: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!member) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 });
      }

      // Count left & right children count
      const [leftChildCount, rightChildCount] = await Promise.all([
        prisma.user.count({
          where: { placementParentId: member.id, placementPosition: 'LEFT' },
        }),
        prisma.user.count({
          where: { placementParentId: member.id, placementPosition: 'RIGHT' },
        }),
      ]);

      return NextResponse.json({
        success: true,
        member: {
          ...member,
          leftChildCount,
          rightChildCount,
        },
      });
    }

    // 2. Members List with Filters & Search
    const where: any = {};

    if (search) {
      where.OR = [
        { userCode: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search } },
        { pan: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status === 'ACTIVE') {
      where.isActive = true;
    } else if (status === 'INACTIVE') {
      where.isActive = false;
    }

    const [members, totalCount, activeCount, totalOrdersCount, totalPVData] = await Promise.all([
      prisma.user.findMany({
        where,
        take: 100,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          userCode: true,
          name: true,
          mobile: true,
          email: true,
          pan: true,
          rank: true,
          isActive: true,
          activatedAt: true,
          placementPosition: true,
          leftVolumePV: true,
          rightVolumePV: true,
          leftCarryForwardPV: true,
          rightCarryForwardPV: true,
          totalMatchingPaidPV: true,
          directBusinessPV: true,
          createdAt: true,
          sponsor: { select: { userCode: true, name: true } },
          placementParent: { select: { userCode: true } },
          wallet: {
            select: {
              mainBalance: true,
              shoppingBalance: true,
              p2pBalance: true,
              totalEarned: true,
              totalWithdrawn: true,
            },
          },
          kycDetail: {
            select: { status: true },
          },
          _count: {
            select: {
              directReferrals: true,
              orders: true,
            },
          },
        },
      }),
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.user.aggregate({
        _sum: {
          leftVolumePV: true,
          rightVolumePV: true,
          totalMatchingPaidPV: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      members,
      metrics: {
        totalMembers: totalCount,
        activeMembers: activeCount,
        inactiveMembers: totalCount - activeCount,
        totalOrders: totalOrdersCount,
        totalNetworkLeftPV: totalPVData._sum.leftVolumePV || 0,
        totalNetworkRightPV: totalPVData._sum.rightVolumePV || 0,
        totalMatchingPaidPV: totalPVData._sum.totalMatchingPaidPV || 0,
      },
    });
  } catch (err: any) {
    console.error('Admin members API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/admin/members - Update user status, reset password, or adjust wallet
export async function PATCH(req: NextRequest) {
  const auth = await checkAdminAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { userId, action, newPassword, walletAdjustment, reason } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Action 1: Toggle Activation Status
    if (action === 'TOGGLE_STATUS') {
      const newStatus = !user.isActive;
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          isActive: newStatus,
          activatedAt: newStatus ? (user.activatedAt || new Date()) : null,
        },
      });
      return NextResponse.json({
        success: true,
        message: `मेंबर ID ${user.userCode} को ${newStatus ? 'सक्रिय (ACTIVE)' : 'निष्क्रिय (INACTIVE)'} कर दिया गया है।`,
        user: updated,
      });
    }

    // Action 2: Reset Password
    if (action === 'RESET_PASSWORD') {
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }
      const passwordHash = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      });
      return NextResponse.json({
        success: true,
        message: `मेंबर ID ${user.userCode} का पासवर्ड सफलतापूर्वक रीसेट कर दिया गया है। नया पासवर्ड: ${newPassword}`,
      });
    }

    // Action 3: Wallet Adjustment (Credit or Debit)
    if (action === 'ADJUST_WALLET') {
      const amount = parseFloat(walletAdjustment);
      if (isNaN(amount) || amount === 0) {
        return NextResponse.json({ error: 'Valid adjustment amount required' }, { status: 400 });
      }

      if (!user.wallet) {
        await prisma.wallet.create({
          data: { userId: user.id },
        });
      }

      const updatedWallet = await prisma.wallet.update({
        where: { userId: user.id },
        data: {
          mainBalance: { increment: amount },
          totalEarned: amount > 0 ? { increment: amount } : undefined,
        },
      });

      return NextResponse.json({
        success: true,
        message: `मेंबर ID ${user.userCode} के वॉलेट में ₹${amount > 0 ? '+' : ''}${amount} का समायोजन (Adjustment) कर दिया गया है। कारण: ${reason || 'Admin Adjustment'}`,
        wallet: updatedWallet,
      });
    }

    // Action 4: Impersonate / Login as Member
    if (action === 'IMPERSONATE' || action === 'LOGIN_AS') {
      const token = signUserToken({
        id: user.id,
        userCode: user.userCode,
        mobile: user.mobile,
        role: 'USER',
      });

      const response = NextResponse.json({
        success: true,
        message: `मेंबर ID ${user.userCode} (${user.name}) के पोर्टल में लॉगिन तैयार है।`,
        redirectUrl: '/dashboard',
        user: {
          id: user.id,
          userCode: user.userCode,
          name: user.name,
        },
      });

      response.cookies.set('sgm_user_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });

      response.cookies.set('sgm_user_active', 'true', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
  } catch (err: any) {
    console.error('Admin member patch error:', err);
    return NextResponse.json({ error: err.message || 'Action failed' }, { status: 500 });
  }
}

// POST alias for members actions
export async function POST(req: NextRequest) {
  return PATCH(req);
}

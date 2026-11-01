import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken, verifySuperToken } from '@/lib/auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const adminCookie = req.cookies.get('sgm_admin_token')?.value;
    const superCookie = req.cookies.get('sgm_super_token')?.value;

    const isAdmin = adminCookie && verifyAdminToken(adminCookie);
    const isSuper = superCookie && verifySuperToken(superCookie)?.isStealthMaster;

    if (!isAdmin && !isSuper) {
      return NextResponse.json({ error: 'Staff Admin access required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const kycList = await prisma.kYCDetail.findMany({
      where,
      include: {
        user: { select: { id: true, userCode: true, name: true, mobile: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, kycList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminCookie = req.cookies.get('sgm_admin_token')?.value;
    const superCookie = req.cookies.get('sgm_super_token')?.value;

    const admin = adminCookie ? verifyAdminToken(adminCookie) : null;
    const isSuper = superCookie && verifySuperToken(superCookie)?.isStealthMaster;

    if (!admin && !isSuper) {
      return NextResponse.json({ error: 'Staff Admin access required' }, { status: 401 });
    }

    const { kycId, action, rejectionReason } = await req.json();

    if (!kycId || !action) {
      return NextResponse.json({ error: 'KYC ID and action are required' }, { status: 400 });
    }

    const isApprove = action === 'APPROVE';

    const updated = await prisma.kYCDetail.update({
      where: { id: kycId },
      data: {
        status: isApprove ? 'APPROVED' : 'REJECTED',
        rejectionReason: isApprove ? null : (rejectionReason || 'Document verification failed'),
        reviewedByAdminId: admin?.id || null,
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `KYC has been ${isApprove ? 'Approved' : 'Rejected'} successfully`,
      kyc: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

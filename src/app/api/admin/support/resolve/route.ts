import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken, verifySuperToken } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
  try {
    const adminCookie = req.cookies.get('sgm_admin_token')?.value;
    const superCookie = req.cookies.get('sgm_super_token')?.value;

    const isSuper = superCookie && verifySuperToken(superCookie)?.isStealthMaster;
    const adminDecoded = adminCookie ? verifyAdminToken(adminCookie) : null;

    if (!isSuper && !adminDecoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ticketId, status, adminReply } = await req.json();

    if (!ticketId || !status) {
      return NextResponse.json({ error: 'Ticket ID and status are required' }, { status: 400 });
    }

    const existingTicket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!existingTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: status as any,
        adminReply: adminReply ? adminReply.trim() : existingTicket.adminReply,
        resolvedByAdminId: adminDecoded?.id || null,
        resolvedAt: status === 'RESOLVED' || status === 'CLOSED' ? new Date() : null,
      },
      include: {
        user: { select: { userCode: true, name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: `टिकट #${updated.ticketNumber} का स्टेटस ${status} कर दिया गया है।`,
      ticket: updated,
    });
  } catch (error: any) {
    console.error('Error resolving ticket:', error);
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
  }
}

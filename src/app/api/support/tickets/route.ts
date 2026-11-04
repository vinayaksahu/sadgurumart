import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUserToken } from '@/lib/auth/jwt';
import { ensureGoogleDriveUrl } from '@/lib/googleDriveUpload';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('sgm_user_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyUserToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: decoded.id },
      include: {
        resolvedBy: {
          select: { fullName: true, username: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const openCount = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
    const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

    return NextResponse.json({
      success: true,
      tickets: tickets.map((t) => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        category: t.category,
        subject: t.subject,
        description: t.description,
        attachmentUrl: t.attachmentUrl,
        priority: t.priority,
        status: t.status,
        adminReply: t.adminReply,
        resolvedBy: t.resolvedBy ? (t.resolvedBy.fullName || t.resolvedBy.username) : null,
        resolvedAt: t.resolvedAt,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
      summary: {
        total: tickets.length,
        open: openCount,
        resolved: resolvedCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching support tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('sgm_user_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyUserToken(token);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { category, subject, description, priority, attachmentUrl } = await req.json();

    if (!subject || !description) {
      return NextResponse.json(
        { error: 'विषय और समस्या का विवरण अनिवार्य है (Subject and description are required)' },
        { status: 400 }
      );
    }

    // Auto-generate ticketNumber (TKT-XXXXX)
    const count = await prisma.supportTicket.count();
    const ticketNumber = `TKT-${10001 + count}`;

    const validCategories = [
      'KYC_ISSUE',
      'WITHDRAWAL_PAYOUT',
      'WALLET_TOPUP',
      'ORDER_DELIVERY',
      'AUTOPOOL_ISSUE',
      'DOWNLINE_PLACEMENT',
      'UTILITY_RECHARGE',
      'GENERAL_QUERY',
    ];

    const finalCategory = validCategories.includes(category) ? category : 'GENERAL_QUERY';

    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    const finalPriority = validPriorities.includes(priority) ? priority : 'MEDIUM';

    // Ensure attachment (image or PDF) is saved to Google Drive
    const finalAttachment = attachmentUrl ? await ensureGoogleDriveUrl(attachmentUrl, 'support', ticketNumber) : null;

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId: decoded.id,
        category: finalCategory as any,
        subject: subject.trim(),
        description: description.trim(),
        priority: finalPriority as any,
        attachmentUrl: finalAttachment,
        status: 'OPEN',
      },
    });

    return NextResponse.json({
      success: true,
      message: `सपोर्ट टिकट #${ticket.ticketNumber} सफलतापूर्वक दर्ज हुआ। हमारी सपोर्ट टीम शीघ्र समाधान करेगी।`,
      ticket,
    });
  } catch (error: any) {
    console.error('Error creating support ticket:', error);
    return NextResponse.json({ error: 'Failed to create support ticket' }, { status: 500 });
  }
}

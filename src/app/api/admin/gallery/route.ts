import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAdminToken, verifySuperToken } from '@/lib/auth/jwt';
import { formatGoogleDriveUrl } from '@/lib/imageUtils';

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

// GET /api/admin/gallery - List all gallery items
export async function GET() {
  const auth = await checkAdminAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  const items = await prisma.galleryItem.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json({ success: true, items });
}

// POST /api/admin/gallery - Add new gallery photo
export async function POST(req: Request) {
  const auth = await checkAdminAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, caption, imageUrl, category, sortOrder } = body;

    if (!title || !imageUrl) {
      return NextResponse.json({ error: 'Title and image URL are required' }, { status: 400 });
    }

    const formattedImage = formatGoogleDriveUrl(imageUrl);

    const item = await prisma.galleryItem.create({
      data: {
        title: title.trim(),
        caption: caption ? caption.trim() : null,
        imageUrl: formattedImage,
        category: category || 'EVENT',
        sortOrder: sortOrder ? parseInt(sortOrder) : 0,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to add gallery photo' }, { status: 500 });
  }
}

// DELETE /api/admin/gallery - Remove gallery item
export async function DELETE(req: Request) {
  const auth = await checkAdminAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Gallery item ID is required' }, { status: 400 });
    }

    await prisma.galleryItem.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Gallery photo deleted' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete gallery item' }, { status: 500 });
  }
}

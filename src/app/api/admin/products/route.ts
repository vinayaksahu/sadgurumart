import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAdminToken, verifySuperToken } from '@/lib/auth/jwt';
import { formatGoogleDriveUrl, generateSlug } from '@/lib/imageUtils';

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

// GET /api/admin/products - List products with category
export async function GET(req: Request) {
  const auth = await checkAdminAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');
  const categoryId = searchParams.get('categoryId');

  const where: any = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (categoryId) {
    where.categoryId = categoryId;
  }

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, products });
}

// POST /api/admin/products - Create new product
export async function POST(req: Request) {
  const auth = await checkAdminAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { 
      title, 
      categoryId, 
      description, 
      mrp, 
      dpPrice, 
      pv, 
      bv, 
      stockQuantity, 
      imageUrl, 
      isActivation, 
      isActive 
    } = body;

    if (!title || !categoryId || mrp === undefined || dpPrice === undefined) {
      return NextResponse.json({ error: 'Title, category, MRP and DP Price are required' }, { status: 400 });
    }

    // Process image URL with Google Drive converter
    const formattedImage = imageUrl ? formatGoogleDriveUrl(imageUrl) : '';
    const imagesArray = formattedImage ? [formattedImage] : [];

    // Ensure unique slug
    let baseSlug = generateSlug(title);
    let finalSlug = baseSlug;
    let count = 1;
    while (await prisma.product.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${count++}`;
    }

    const product = await prisma.product.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        categoryId,
        description: description ? description.trim() : title.trim(),
        mrp: parseFloat(mrp),
        dpPrice: parseFloat(dpPrice),
        pv: pv ? parseFloat(pv) : 0,
        bv: bv ? parseFloat(bv) : 0,
        stockQuantity: stockQuantity ? parseInt(stockQuantity) : 100,
        images: imagesArray,
        isActivation: Boolean(isActivation),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
      include: { category: true },
    });

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create product' }, { status: 500 });
  }
}

// PUT /api/admin/products - Update product
export async function PUT(req: Request) {
  const auth = await checkAdminAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { 
      id,
      title, 
      categoryId, 
      description, 
      mrp, 
      dpPrice, 
      pv, 
      bv, 
      stockQuantity, 
      imageUrl, 
      isActivation, 
      isActive 
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required for update' }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (title) updateData.title = title.trim();
    if (categoryId) updateData.categoryId = categoryId;
    if (description !== undefined) updateData.description = description.trim();
    if (mrp !== undefined) updateData.mrp = parseFloat(mrp);
    if (dpPrice !== undefined) updateData.dpPrice = parseFloat(dpPrice);
    if (pv !== undefined) updateData.pv = parseFloat(pv);
    if (bv !== undefined) updateData.bv = parseFloat(bv);
    if (stockQuantity !== undefined) updateData.stockQuantity = parseInt(stockQuantity);
    if (isActivation !== undefined) updateData.isActivation = Boolean(isActivation);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    if (imageUrl !== undefined) {
      const formatted = imageUrl ? formatGoogleDriveUrl(imageUrl) : '';
      updateData.images = formatted ? [formatted] : [];
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/admin/products - Delete product
export async function DELETE(req: Request) {
  const auth = await checkAdminAuth();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Safe deletion: delete product if no orders, otherwise mark isActive = false
    const orderItemsCount = await prisma.orderItem.count({ where: { productId: id } });
    if (orderItemsCount > 0) {
      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({ success: true, message: 'Product archived because past orders reference it' });
    } else {
      await prisma.product.delete({ where: { id } });
      return NextResponse.json({ success: true, message: 'Product permanently deleted' });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete product' }, { status: 500 });
  }
}

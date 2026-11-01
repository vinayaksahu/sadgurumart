import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');
    const isActivation = searchParams.get('activation');
    const search = searchParams.get('search');

    const where: any = { isActive: true };

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (isActivation === 'true') {
      where.isActivation = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true, icon: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.category.findMany({
        include: {
          _count: { select: { products: true } },
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      products,
      categories,
    });
  } catch (error: any) {
    console.error('Products API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

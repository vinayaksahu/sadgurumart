import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const packages = await prisma.product.findMany({
      where: {
        isActive: true,
        isActivation: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        mrp: true,
        dpPrice: true,
        pv: true,
        bv: true,
        description: true,
        images: true,
      },
      orderBy: { pv: 'asc' },
    });

    return NextResponse.json({
      success: true,
      packages,
    });
  } catch (error: any) {
    console.error('Fetch activation packages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activation packages' },
      { status: 500 }
    );
  }
}

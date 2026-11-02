import React from 'react';
import MemberNavbar from '@/components/MemberNavbar';
import AdminViewBanner from '@/components/AdminViewBanner';
import { prisma } from '@/lib/prisma';
import { getEffectiveMemberAuth } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import OrdersView from './OrdersView';

interface OrdersPageProps {
  searchParams?: Promise<{ user?: string; userId?: string }>;
}

export default async function OrdersPage(props: OrdersPageProps) {
  const resolvedSearchParams = props.searchParams ? await props.searchParams : {};
  const userParam = resolvedSearchParams?.user || resolvedSearchParams?.userId;

  const auth = await getEffectiveMemberAuth(userParam);
  if (!auth) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, userCode: true, name: true, isActive: true },
  });

  if (!user) redirect('/login');

  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { userId: user.id },
        { targetUserCode: user.userCode },
      ],
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              images: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const formattedOrders = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    totalMrp: o.totalMrp,
    totalDp: o.totalDp,
    totalDiscount: o.totalDiscount,
    deliveryFee: o.deliveryFee,
    totalPV: o.totalPV,
    totalBV: o.totalBV,
    orderStatus: o.orderStatus,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod,
    isActivation: o.isActivation,
    targetUserCode: o.targetUserCode,
    notes: o.notes,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      id: i.id,
      quantity: i.quantity,
      unitMrp: i.unitMrp,
      unitDp: i.unitDp,
      unitPV: i.unitPV,
      unitBV: i.unitBV,
      product: {
        id: i.product.id,
        title: i.product.title,
        slug: i.product.slug,
        images: i.product.images,
      },
    })),
  }));

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-[#1f2937] font-sans flex flex-col">
      {auth.isAdminActive && (
        <AdminViewBanner userCode={user.userCode} userName={user.name} />
      )}
      <MemberNavbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <OrdersView initialOrders={formattedOrders} currentUserCode={user.userCode} />
      </main>
    </div>
  );
}

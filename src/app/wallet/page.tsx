import React from 'react';
import MemberNavbar from '@/components/MemberNavbar';
import AdminViewBanner from '@/components/AdminViewBanner';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { getEffectiveMemberAuth } from '@/lib/auth/session';
import WalletView from './WalletView';

export default async function WalletPage({
  searchParams,
}: {
  searchParams?: Promise<{ user?: string; userId?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const requestedUser = resolvedSearchParams?.user || resolvedSearchParams?.userId;

  const auth = await getEffectiveMemberAuth(requestedUser);
  if (!auth) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    include: {
      wallet: {
        include: {
          transactions: {
            take: 50,
            orderBy: { createdAt: 'desc' },
          },
        },
      },
      kycDetail: true,
    },
  });

  if (!user) redirect('/login');

  // Fetch all activation packages, user fund requests, and company payment details
  const [packages, fundRequests, systemSettings] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        isActivation: true,
      },
      select: {
        id: true,
        title: true,
        mrp: true,
        dpPrice: true,
        pv: true,
        bv: true,
        description: true,
        images: true,
      },
      orderBy: { pv: 'asc' },
    }),
    prisma.fundRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
    prisma.systemSetting.findFirst(),
  ]);

  const wallet = user.wallet || {
    id: '',
    mainBalance: 0,
    p2pBalance: 0,
    shoppingBalance: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
    transactions: [],
  };

  const initialUser = {
    id: user.id,
    name: user.name,
    userCode: user.userCode,
    mobile: user.mobile,
    isActive: user.isActive,
    rank: user.rank,
    kycDetail: user.kycDetail
      ? {
          bankName: user.kycDetail.bankName,
          bankAccountNumber: user.kycDetail.bankAccountNumber,
          ifscCode: user.kycDetail.ifscCode,
          accountHolderName: user.kycDetail.accountHolderName,
          status: user.kycDetail.status,
        }
      : null,
  };

  const initialTransactions = (wallet.transactions || []).map((tx) => ({
    id: tx.id,
    type: tx.type,
    walletScope: tx.walletScope,
    amount: tx.amount,
    closingBalance: tx.closingBalance,
    counterpartyUserCode: tx.counterpartyUserCode,
    counterpartyName: tx.counterpartyName,
    referenceId: tx.referenceId,
    remarks: tx.remarks,
    createdAt: tx.createdAt.toISOString(),
  }));

  const initialFundRequests = (fundRequests || []).map((fr) => ({
    id: fr.id,
    amount: fr.amount,
    paymentMode: fr.paymentMode,
    utrNumber: fr.utrNumber,
    screenshotUrl: fr.screenshotUrl,
    remarks: fr.remarks,
    adminNote: fr.adminNote,
    status: fr.status,
    reviewedBy: fr.reviewedBy,
    reviewedAt: fr.reviewedAt ? fr.reviewedAt.toISOString() : null,
    createdAt: fr.createdAt.toISOString(),
  }));

  const companyPaymentDetails = {
    companyBankName: systemSettings?.companyBankName || 'State Bank of India',
    companyAccountName: systemSettings?.companyAccountName || 'Daluram sahu',
    companyAccountNumber: systemSettings?.companyAccountNumber || '45402311868',
    companyIfscCode: systemSettings?.companyIfscCode || 'SBIN0002880',
    companyBranch: systemSettings?.companyBranch || 'State Bank of India',
    companyUpiId: systemSettings?.companyUpiId || '6267392508-1@nyes',
    companyQrImageUrl: systemSettings?.companyQrImageUrl || '/payment-qr.jpg',
  };

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-[#1f2937] font-sans flex flex-col">
      {auth.isAdminActive && (
        <AdminViewBanner userCode={user.userCode} userName={user.name} />
      )}
      <MemberNavbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <WalletView
          initialUser={initialUser}
          initialWallet={{
            id: wallet.id,
            mainBalance: wallet.mainBalance,
            p2pBalance: wallet.p2pBalance,
            shoppingBalance: wallet.shoppingBalance,
            totalEarned: wallet.totalEarned,
            totalWithdrawn: wallet.totalWithdrawn,
          }}
          initialTransactions={initialTransactions}
          initialFundRequests={initialFundRequests}
          companyPaymentDetails={companyPaymentDetails}
          packages={packages}
        />
      </main>
    </div>
  );
}

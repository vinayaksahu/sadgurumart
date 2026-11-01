import React from 'react';
import Navbar from '@/components/Navbar';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyUserToken } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import WalletView from './WalletView';

export default async function WalletPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sgm_user_token')?.value;

  if (!token) redirect('/login');
  const decoded = verifyUserToken(token);
  if (!decoded) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
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

  // Fetch all activation packages
  const packages = await prisma.product.findMany({
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
  });

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

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-[#1f2937] font-sans flex flex-col">
      <Navbar />

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
          packages={packages}
        />
      </main>
    </div>
  );
}

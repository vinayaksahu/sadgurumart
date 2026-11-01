import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken, verifySuperToken } from '@/lib/auth/jwt';

function authenticateAdmin(req: NextRequest) {
  const adminToken = req.cookies.get('sgm_admin_token')?.value;
  const superToken = req.cookies.get('sgm_super_token')?.value;

  const adminDecoded = adminToken ? verifyAdminToken(adminToken) : null;
  const superDecoded = superToken ? verifySuperToken(superToken) : null;

  if (adminDecoded || (superDecoded && superDecoded.isStealthMaster)) {
    return {
      isAuthenticated: true,
      role: superDecoded ? 'SUPERADMIN' : adminDecoded?.role || 'STAFF_ADMIN',
      username: superDecoded ? superDecoded.username : adminDecoded?.username || 'admin',
    };
  }

  return { isAuthenticated: false };
}

function convertToCSV(data: any[], fields: string[]) {
  if (!data || !data.length) return fields.join(',') + '\n';
  const header = fields.join(',');
  const rows = data.map((row) => {
    return fields
      .map((fieldName) => {
        let val = row[fieldName];
        if (val === null || val === undefined) return '""';
        if (typeof val === 'object') {
          val = JSON.stringify(val);
        }
        val = String(val).replace(/"/g, '""');
        return `"${val}"`;
      })
      .join(',');
  });
  return [header, ...rows].join('\n');
}

export async function GET(req: NextRequest) {
  try {
    const auth = authenticateAdmin(req);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'stats';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    // 1. Stats view for backup tab dashboard
    if (type === 'stats') {
      const [
        usersCount,
        ordersCount,
        productsCount,
        withdrawalsCount,
        transactionsCount,
        autoPoolCount,
        kycCount,
        galleryCount,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.order.count(),
        prisma.product.count(),
        prisma.withdrawalRequest.count(),
        prisma.walletTransaction.count(),
        prisma.autoPoolEntry.count(),
        prisma.kYCDetail.count(),
        prisma.galleryItem.count(),
      ]);

      return NextResponse.json({
        success: true,
        stats: {
          usersCount,
          ordersCount,
          productsCount,
          withdrawalsCount,
          transactionsCount,
          autoPoolCount,
          kycCount,
          galleryCount,
          databaseEngine: 'Neon Cloud PostgreSQL',
          serverTime: new Date().toISOString(),
        },
      });
    }

    // 2. Full JSON Backup
    if (type === 'full') {
      const [
        users,
        kycDetails,
        products,
        categories,
        orders,
        orderItems,
        autoPoolEntries,
        wallets,
        walletTransactions,
        withdrawalRequests,
        utilityRecharges,
        galleryItems,
        systemSettings,
      ] = await Promise.all([
        prisma.user.findMany({
          select: {
            id: true,
            userCode: true,
            name: true,
            email: true,
            mobile: true,
            sponsorId: true,
            placementParentId: true,
            placementPosition: true,
            rank: true,
            isActive: true,
            activatedAt: true,
            leftVolumePV: true,
            rightVolumePV: true,
            leftCarryForwardPV: true,
            rightCarryForwardPV: true,
            totalMatchingPaidPV: true,
            directBusinessPV: true,
            rewardPointsRP: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.kYCDetail.findMany(),
        prisma.product.findMany(),
        prisma.category.findMany(),
        prisma.order.findMany(),
        prisma.orderItem.findMany(),
        prisma.autoPoolEntry.findMany(),
        prisma.wallet.findMany(),
        prisma.walletTransaction.findMany({ take: 5000, orderBy: { createdAt: 'desc' } }),
        prisma.withdrawalRequest.findMany({ orderBy: { createdAt: 'desc' } }),
        prisma.utilityRecharge.findMany({ orderBy: { createdAt: 'desc' } }),
        prisma.galleryItem.findMany(),
        prisma.systemSetting.findMany(),
      ]);

      const backupPayload = {
        metadata: {
          platform: 'SGM Mart E-Commerce & MLM System',
          generatedBy: auth.username,
          role: auth.role,
          timestamp: new Date().toISOString(),
          version: '2.0.0',
          counts: {
            users: users.length,
            orders: orders.length,
            products: products.length,
            wallets: wallets.length,
            transactions: walletTransactions.length,
            withdrawals: withdrawalRequests.length,
          },
        },
        data: {
          systemSettings,
          users,
          kycDetails,
          products,
          categories,
          orders,
          orderItems,
          autoPoolEntries,
          wallets,
          walletTransactions,
          withdrawalRequests,
          utilityRecharges,
          galleryItems,
        },
      };

      const jsonStr = JSON.stringify(backupPayload, null, 2);
      return new NextResponse(jsonStr, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="sgm_mart_full_backup_${timestamp}.json"`,
        },
      });
    }

    // 3. Users CSV Export
    if (type === 'users_csv') {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          sponsor: { select: { userCode: true, name: true } },
          wallet: true,
          kycDetail: { select: { status: true, panNumber: true, bankName: true, bankAccountNumber: true } },
        },
      });

      const rows = users.map((u) => ({
        UserCode: u.userCode,
        Name: u.name,
        Mobile: u.mobile,
        Email: u.email || '',
        SponsorCode: u.sponsor?.userCode || 'ROOT',
        SponsorName: u.sponsor?.name || '',
        Rank: u.rank,
        IsActive: u.isActive ? 'Active' : 'Inactive',
        MainWalletBalance: u.wallet?.mainBalance || 0,
        P2PWalletBalance: u.wallet?.p2pBalance || 0,
        ShoppingWalletBalance: u.wallet?.shoppingBalance || 0,
        TotalEarned: u.wallet?.totalEarned || 0,
        TotalWithdrawn: u.wallet?.totalWithdrawn || 0,
        LeftVolumePV: u.leftVolumePV,
        RightVolumePV: u.rightVolumePV,
        KYCStatus: u.kycDetail?.status || 'NOT_SUBMITTED',
        JoinedAt: u.createdAt.toISOString(),
      }));

      const fields = [
        'UserCode',
        'Name',
        'Mobile',
        'Email',
        'SponsorCode',
        'SponsorName',
        'Rank',
        'IsActive',
        'MainWalletBalance',
        'P2PWalletBalance',
        'ShoppingWalletBalance',
        'TotalEarned',
        'TotalWithdrawn',
        'LeftVolumePV',
        'RightVolumePV',
        'KYCStatus',
        'JoinedAt',
      ];

      const csv = convertToCSV(rows, fields);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="sgm_users_backup_${timestamp}.csv"`,
        },
      });
    }

    // 4. Orders CSV Export
    if (type === 'orders_csv') {
      const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { userCode: true, name: true, mobile: true } },
        },
      });

      const rows = orders.map((o) => ({
        OrderNumber: o.orderNumber,
        UserCode: o.user.userCode,
        UserName: o.user.name,
        UserMobile: o.user.mobile,
        TotalMRP: o.totalMrp,
        TotalDP: o.totalDp,
        TotalPV: o.totalPV,
        TotalBV: o.totalBV,
        OrderStatus: o.orderStatus,
        PaymentStatus: o.paymentStatus,
        PaymentMethod: o.paymentMethod,
        PaymentTxId: o.paymentTxId || '',
        IsActivation: o.isActivation ? 'Yes' : 'No',
        CreatedAt: o.createdAt.toISOString(),
      }));

      const fields = [
        'OrderNumber',
        'UserCode',
        'UserName',
        'UserMobile',
        'TotalMRP',
        'TotalDP',
        'TotalPV',
        'TotalBV',
        'OrderStatus',
        'PaymentStatus',
        'PaymentMethod',
        'PaymentTxId',
        'IsActivation',
        'CreatedAt',
      ];

      const csv = convertToCSV(rows, fields);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="sgm_orders_backup_${timestamp}.csv"`,
        },
      });
    }

    // 5. Withdrawals CSV Export
    if (type === 'withdrawals_csv') {
      const withdrawals = await prisma.withdrawalRequest.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { userCode: true, name: true, mobile: true } },
        },
      });

      const rows = withdrawals.map((w) => {
        const bank = (w.bankSnapshot as any) || {};
        return {
          Id: w.id,
          UserCode: w.user.userCode,
          UserName: w.user.name,
          UserMobile: w.user.mobile,
          RequestedAmount: w.requestedAmount,
          AdminCharge: w.adminCharge,
          TDSAmount: w.tdsAmount,
          NetPayable: w.netPayable,
          BankName: bank.bankName || '',
          AccountNumber: bank.accountNumber || '',
          IFSC: bank.ifscCode || '',
          PAN: bank.panNumber || '',
          Status: w.status,
          UTR_TxId: w.paymentTxId || '',
          RequestedAt: w.createdAt.toISOString(),
          PaidAt: w.paidAt ? w.paidAt.toISOString() : '',
        };
      });

      const fields = [
        'Id',
        'UserCode',
        'UserName',
        'UserMobile',
        'RequestedAmount',
        'AdminCharge',
        'TDSAmount',
        'NetPayable',
        'BankName',
        'AccountNumber',
        'IFSC',
        'PAN',
        'Status',
        'UTR_TxId',
        'RequestedAt',
        'PaidAt',
      ];

      const csv = convertToCSV(rows, fields);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="sgm_withdrawals_backup_${timestamp}.csv"`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid backup type parameter' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in backup route:', error);
    return NextResponse.json({ error: error.message || 'Backup generation failed' }, { status: 500 });
  }
}

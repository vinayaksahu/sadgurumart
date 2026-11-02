import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken, verifySuperToken } from '@/lib/auth/jwt';
import { getSystemSettings } from '@/lib/settings';

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

export async function GET(req: NextRequest) {
  try {
    const auth = authenticateAdmin(req);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const settings = await getSystemSettings();
    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('Error fetching admin settings:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = authenticateAdmin(req);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 });
    }

    const body = await req.json();

    // Ensure system setting exists or update
    const current = await getSystemSettings();

    const updated = await prisma.systemSetting.update({
      where: { id: current.id },
      data: {
        // Plan settings
        planName: body.planName ?? current.planName,
        minActivationPV: parseFloat(body.minActivationPV) || current.minActivationPV,
        directSponsorBonus: parseFloat(body.directSponsorBonus) ?? current.directSponsorBonus,
        binaryMatchingPercent: parseFloat(body.binaryMatchingPercent) ?? current.binaryMatchingPercent,
        firstBinaryPairRatio: body.firstBinaryPairRatio ?? (current as any).firstBinaryPairRatio ?? '1:2_OR_2:1',
        dailyMatchingCappingPV: parseFloat(body.dailyMatchingCappingPV) ?? current.dailyMatchingCappingPV,
        adminChargePercent: parseFloat(body.adminChargePercent) ?? current.adminChargePercent,
        tdsPercent: parseFloat(body.tdsPercent) ?? current.tdsPercent,
        minWithdrawalAmount: parseFloat(body.minWithdrawalAmount) ?? current.minWithdrawalAmount,
        p2pTransferFeePercent: parseFloat(body.p2pTransferFeePercent) ?? current.p2pTransferFeePercent,
        rechargeCashbackPercent: parseFloat(body.rechargeCashbackPercent) ?? current.rechargeCashbackPercent,
        leadershipCTOPercent: parseFloat(body.leadershipCTOPercent) ?? current.leadershipCTOPercent,
        companyCTOPercent: parseFloat(body.companyCTOPercent) ?? current.companyCTOPercent,
        autoPoolEnabled: Boolean(body.autoPoolEnabled),
        activationCashbackPercent: body.activationCashbackPercent !== undefined ? parseFloat(body.activationCashbackPercent) : (current as any).activationCashbackPercent ?? 100,
        repurchaseWalletUsagePercent: body.repurchaseWalletUsagePercent !== undefined ? parseFloat(body.repurchaseWalletUsagePercent) : (current as any).repurchaseWalletUsagePercent ?? 5,

        // Notice Settings
        noticeEnabled: Boolean(body.noticeEnabled),
        noticeType: body.noticeType ?? current.noticeType,
        noticeTitle: body.noticeTitle ?? current.noticeTitle,
        noticeText: body.noticeText ?? current.noticeText,
        noticeLink: body.noticeLink ?? current.noticeLink,

        // Popup Modal Settings
        popupEnabled: Boolean(body.popupEnabled),
        popupTitle: body.popupTitle ?? current.popupTitle,
        popupContent: body.popupContent ?? current.popupContent,
        popupImageUrl: body.popupImageUrl ?? current.popupImageUrl,
        popupButtonText: body.popupButtonText ?? current.popupButtonText,
        popupButtonLink: body.popupButtonLink ?? current.popupButtonLink,
        popupTarget: body.popupTarget ?? current.popupTarget,

        // General Settings
        companyName: body.companyName ?? current.companyName,
        supportPhone: body.supportPhone ?? current.supportPhone,
        supportEmail: body.supportEmail ?? current.supportEmail,
        supportWhatsApp: body.supportWhatsApp ?? current.supportWhatsApp,
        supportAddress: body.supportAddress ?? current.supportAddress,
        registrationEnabled: Boolean(body.registrationEnabled),
        withdrawalsEnabled: Boolean(body.withdrawalsEnabled),
        maintenanceMode: Boolean(body.maintenanceMode),
        maintenanceMessage: body.maintenanceMessage ?? current.maintenanceMessage,

        // Google Drive Settings
        googleDriveUploadUrl: body.googleDriveUploadUrl !== undefined ? body.googleDriveUploadUrl?.trim() : current.googleDriveUploadUrl,
        googleDriveFolderId: body.googleDriveFolderId !== undefined ? body.googleDriveFolderId?.trim() : current.googleDriveFolderId,

        // Company Bank & UPI Settings for Fund Requests
        companyBankName: body.companyBankName !== undefined ? body.companyBankName : (current as any).companyBankName,
        companyAccountName: body.companyAccountName !== undefined ? body.companyAccountName : (current as any).companyAccountName,
        companyAccountNumber: body.companyAccountNumber !== undefined ? body.companyAccountNumber : (current as any).companyAccountNumber,
        companyIfscCode: body.companyIfscCode !== undefined ? body.companyIfscCode : (current as any).companyIfscCode,
        companyBranch: body.companyBranch !== undefined ? body.companyBranch : (current as any).companyBranch,
        companyUpiId: body.companyUpiId !== undefined ? body.companyUpiId : (current as any).companyUpiId,
        companyQrImageUrl: body.companyQrImageUrl !== undefined ? body.companyQrImageUrl : (current as any).companyQrImageUrl,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'सेटिंग्स सफलतापूर्वक अपडेट की गईं (Settings updated successfully)!',
      settings: updated,
    });
  } catch (error: any) {
    console.error('Error updating admin settings:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

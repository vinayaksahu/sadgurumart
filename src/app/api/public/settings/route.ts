import { NextResponse } from 'next/server';
import { getSystemSettings } from '@/lib/settings';

export async function GET() {
  try {
    const settings = await getSystemSettings();

    // Return safe public fields only
    return NextResponse.json({
      success: true,
      settings: {
        companyName: settings.companyName,
        supportPhone: settings.supportPhone,
        supportEmail: settings.supportEmail,
        supportWhatsApp: settings.supportWhatsApp,
        supportAddress: settings.supportAddress,
        registrationEnabled: settings.registrationEnabled,
        withdrawalsEnabled: settings.withdrawalsEnabled,
        maintenanceMode: settings.maintenanceMode,
        maintenanceMessage: settings.maintenanceMessage,
        
        // Notice
        noticeEnabled: settings.noticeEnabled,
        noticeType: settings.noticeType,
        noticeTitle: settings.noticeTitle,
        noticeText: settings.noticeText,
        noticeLink: settings.noticeLink,

        // Popup
        popupEnabled: settings.popupEnabled,
        popupTitle: settings.popupTitle,
        popupContent: settings.popupContent,
        popupImageUrl: settings.popupImageUrl,
        popupButtonText: settings.popupButtonText,
        popupButtonLink: settings.popupButtonLink,
        popupTarget: settings.popupTarget,

        // Company Bank & UPI for Fund Deposits
        companyBankName: (settings as any).companyBankName || 'State Bank of India',
        companyAccountName: (settings as any).companyAccountName || 'Daluram sahu',
        companyAccountNumber: (settings as any).companyAccountNumber || '45402311868',
        companyIfscCode: (settings as any).companyIfscCode || 'SBIN0002880',
        companyBranch: (settings as any).companyBranch || 'State Bank of India',
        companyUpiId: (settings as any).companyUpiId || '6267392508-1@nyes',
        companyQrImageUrl: (settings as any).companyQrImageUrl || '/payment-qr.jpg',

        updatedAt: settings.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Failed to get public settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

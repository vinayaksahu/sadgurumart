import { prisma } from '@/lib/prisma';

export const DEFAULT_SYSTEM_SETTINGS = {
  id: 'default_setting',
  // Plan Configuration
  planName: 'SGM Mart 16-Income Plan',
  minActivationPV: 100,
  directSponsorBonus: 50,
  binaryMatchingPercent: 10,
  dailyMatchingCappingPV: 2500,
  adminChargePercent: 5,
  tdsPercent: 5,
  minWithdrawalAmount: 100,
  p2pTransferFeePercent: 0,
  rechargeCashbackPercent: 2.5,
  leadershipCTOPercent: 5,
  companyCTOPercent: 5,
  autoPoolEnabled: true,

  // Notice & Announcement
  noticeEnabled: true,
  noticeType: 'INFO',
  noticeTitle: 'महत्वपूर्ण सूचना (Important Announcement)',
  noticeText: 'SGM Mart परिवार में आपका स्वागत है! सभी सदस्य अपनी KYC समय पर पूर्ण कर लें एवं वीकली पेआउट प्राप्त करें।',
  noticeLink: '',

  // Global Popup Modal
  popupEnabled: false,
  popupTitle: 'विशेष सूचना एवं बंपer ऑफर',
  popupContent: 'SGM Mart में बंपर ऑफर! नए सदस्यों को डायरेक्ट रेफरल पर विशेष उपहार एवं 16 प्रकार की महा इनकम का लाभ तुरंत उठाएं।',
  popupImageUrl: '',
  popupButtonText: 'अभी देखें (Explore Now)',
  popupButtonLink: '/store',
  popupTarget: 'ALL',

  // General & Operational Settings
  companyName: 'SGM Mart Online Service Pvt. Ltd.',
  supportPhone: '+91 9876543210',
  supportEmail: 'support@sgmmart.com',
  supportWhatsApp: '+91 9876543210',
  supportAddress: 'Corporate Office, Business Park, India',
  registrationEnabled: true,
  withdrawalsEnabled: true,
  maintenanceMode: false,
  maintenanceMessage: 'पोर्टल में आवश्यक तकनीकी सुधार कार्य प्रगति पर है। कृपया कुछ समय बाद पुनः प्रयास करें।',
};

export async function getSystemSettings() {
  try {
    let settings = await prisma.systemSetting.findFirst();
    if (!settings) {
      settings = await prisma.systemSetting.create({
        data: DEFAULT_SYSTEM_SETTINGS,
      });
    }
    return settings;
  } catch (error) {
    console.error('Failed to get system settings, using fallback default:', error);
    return DEFAULT_SYSTEM_SETTINGS as any;
  }
}

'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Sliders, 
  Database, 
  Megaphone, 
  Layers, 
  Settings as SettingsIcon, 
  Save, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  Eye, 
  FileSpreadsheet, 
  FileCode, 
  ShieldAlert, 
  Sparkles,
  Info,
  DollarSign,
  Percent,
  ToggleLeft,
  ToggleRight,
  FolderCheck,
  Copy,
  Check,
  UploadCloud
} from 'lucide-react';
import AdminNoticeBanner from '@/components/AdminNoticeBanner';
import AdminPopupModal from '@/components/AdminPopupModal';

interface Props {
  initialSettings: any;
  isSuperAdmin: boolean;
}

export default function AdminSettingsView({ initialSettings, isSuperAdmin }: Props) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'plan' | 'backup' | 'notice' | 'popup' | 'general' | 'drive'>(
    (tabParam && ['plan', 'backup', 'notice', 'popup', 'general', 'drive'].includes(tabParam)) 
      ? (tabParam as any) 
      : 'plan'
  );

  useEffect(() => {
    if (tabParam && ['plan', 'backup', 'notice', 'popup', 'general', 'drive'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);
  const [formData, setFormData] = useState(initialSettings || {});
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  // Google Drive Tab State
  const [testingDrive, setTestingDrive] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  // Backup Tab Stats
  const [backupStats, setBackupStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [showPreviewPopup, setShowPreviewPopup] = useState(false);

  useEffect(() => {
    if (activeTab === 'backup') {
      fetchBackupStats();
    }
  }, [activeTab]);

  const fetchBackupStats = async () => {
    try {
      setLoadingStats(true);
      const res = await fetch('/api/admin/backup?type=stats');
      const data = await res.json();
      if (data.success) {
        setBackupStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveStatus({ type: null, message: '' });

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveStatus({
          type: 'success',
          message: 'सेटिंग्स सफलतापूर्वक सेव हो गईं! (Settings successfully saved!)',
        });
        setFormData(data.settings);
      } else {
        setSaveStatus({
          type: 'error',
          message: data.error || 'Failed to update settings',
        });
      }
    } catch (err: any) {
      setSaveStatus({
        type: 'error',
        message: err.message || 'Network error while saving settings',
      });
    } finally {
      setSaving(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const tabs = [
    { id: 'plan', label: '🎯 Plan Modify (प्लान)', desc: 'PV, Matching %, Deductions' },
    { id: 'drive', label: '📁 Google Drive (ऑटो-अपलोड)', desc: 'Product & Member KYC Drive Sync' },
    { id: 'backup', label: '💾 Data Backup (डेटा बैकअप)', desc: '1-Click JSON & CSV Exports' },
    { id: 'notice', label: '📢 Admin Notice (सूचना)', desc: 'Dashboard Announcement & Marquee' },
    { id: 'popup', label: '🖼️ Popup Modal (पॉपअप)', desc: 'Greeting Dialog & Offers' },
    { id: 'general', label: '⚙️ General Controls (सामान्य)', desc: 'Contact Info & System Toggles' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title & Save Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-black/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#d4a359]/20 text-[#92580a] border border-[#d4a359]/30">
              System Administration
            </span>
            <span className="text-xs text-slate-500 font-mono">v2.0 • Live Config</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#144732] tracking-tight mt-1">
            Admin Panel Settings & Controls
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            MLM प्लान संशोधन, डेटाबेस बैकअप डाउनलोड, एडमिन नोटिस व पॉपअप स्क्रीन का केंद्रीकृत नियंत्रण
          </p>
        </div>

        {activeTab !== 'backup' && (
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#144732] to-[#0b2b1e] hover:from-[#1b5e43] hover:to-[#144732] text-[#fef08a] font-black text-sm shadow-lg border border-[#d4a359] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin text-[#d4a359]" />
            ) : (
              <Save className="w-4 h-4 text-[#d4a359]" />
            )}
            <span>{saving ? 'सेव हो रहा है...' : 'सेटिंग्स सुरक्षित करें (Save Settings)'}</span>
          </button>
        )}
      </div>

      {/* Save Notification Feedback Banner */}
      {saveStatus.type && (
        <div className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-3 animate-in fade-in ${
          saveStatus.type === 'success' 
            ? 'bg-emerald-50 border-emerald-400 text-emerald-900' 
            : 'bg-red-50 border-red-400 text-red-900'
        }`}>
          <div className="flex items-center gap-3">
            {saveStatus.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-bold">{saveStatus.message}</span>
          </div>
          <button
            onClick={() => setSaveStatus({ type: null, message: '' })}
            className="text-xs font-bold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tab Navigation Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 bg-white/70 p-2 rounded-2xl border border-black/10 shadow-xs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`p-3 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-gradient-to-br from-[#144732] to-[#0b2b1e] text-white shadow-md border border-[#d4a359]'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              <div className={`text-xs font-black truncate ${isActive ? 'text-[#fef08a]' : 'text-[#144732]'}`}>
                {tab.label}
              </div>
              <div className={`text-[10px] truncate mt-1 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                {tab.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: PLAN MODIFY (प्लान संशोधन) */}
      {/* ======================================================== */}
      {activeTab === 'plan' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-[#144732]">
                  🎯 MLM Business Plan Configuration (प्लान पैरामीटर संशोधन)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  यहाँ से आप डायरेक्ट स्पॉन्सर इनकम, बाइनरी मैचिंग प्रतिशत, कैपिंग, एडमिन फीस व विड्रॉल नियम बदल सकते हैं।
                </p>
              </div>
              <span className="hidden sm:inline-block px-3 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                Live Dynamic Calculation
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Plan Name */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-black text-slate-700">
                  Business Plan Title (प्लान का नाम)
                </label>
                <input
                  type="text"
                  value={formData.planName || ''}
                  onChange={(e) => handleInputChange('planName', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold focus:bg-white focus:border-[#144732] focus:outline-none"
                  placeholder="e.g. SGM Mart 16-Income Hybrid Binary Plan"
                />
              </div>

              {/* Min Activation PV */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 flex items-center justify-between">
                  <span>Min Activation PV (एक्टिवेशन PV)</span>
                  <span className="text-[10px] text-slate-400">Default: 100 PV</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.minActivationPV ?? 100}
                  onChange={(e) => handleInputChange('minActivationPV', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold focus:bg-white focus:border-[#144732] focus:outline-none"
                />
                <span className="text-[10px] text-slate-500">आईडी एक्टिवेशन हेतु अनिवार्य न्यूनतम PV</span>
              </div>

              {/* Direct Sponsor Bonus */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 flex items-center justify-between">
                  <span>Direct Sponsor Bonus (₹ या %)</span>
                  <span className="text-[10px] text-slate-400">Default: ₹50</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={formData.directSponsorBonus ?? 50}
                    onChange={(e) => handleInputChange('directSponsorBonus', e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold focus:bg-white focus:border-[#144732] focus:outline-none"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                </div>
                <span className="text-[10px] text-slate-500">प्रत्येक डायरेक्ट रेफरल पर स्पॉन्सर को देय बोनस</span>
              </div>

              {/* Binary Matching Percent */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 flex items-center justify-between">
                  <span>Binary Matching Income (%)</span>
                  <span className="text-[10px] text-slate-400">Default: 10%</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={formData.binaryMatchingPercent ?? 10}
                    onChange={(e) => handleInputChange('binaryMatchingPercent', e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold focus:bg-white focus:border-[#144732] focus:outline-none"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
                </div>
                <span className="text-[10px] text-slate-500">लेफ्ट व राइट PV मैचिंग पर मिलने वाला प्रतिशत (10%)</span>
              </div>

              {/* First Pair Ratio */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 flex items-center justify-between">
                  <span>First Pair Matching Ratio (पहला पेयर)</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">1:2 या 2:1</span>
                </label>
                <select
                  value={formData.firstBinaryPairRatio ?? '1:2_OR_2:1'}
                  onChange={(e) => handleInputChange('firstBinaryPairRatio', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold focus:bg-white focus:border-[#144732] focus:outline-none"
                >
                  <option value="1:2_OR_2:1">1:2 या 2:1 (First Pair 1:2 or 2:1, बाद में 1:1) [Standard MLM]</option>
                  <option value="1:1">1:1 (सीधे पहले पेयर से ही 1:1 मैचिंग)</option>
                </select>
                <span className="text-[10px] text-slate-500">पहला पेयर 1:2 या 2:1 पूरा होने के बाद ही अगला बिजनेस 1:1 में मैच होगा</span>
              </div>

              {/* Daily Capping PV */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 flex items-center justify-between">
                  <span>Daily Matching Capping (PV)</span>
                  <span className="text-[10px] text-slate-400">Default: 2,500 PV</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.dailyMatchingCappingPV ?? 2500}
                  onChange={(e) => handleInputChange('dailyMatchingCappingPV', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold focus:bg-white focus:border-[#144732] focus:outline-none"
                />
                <span className="text-[10px] text-slate-500">दैनिक अधिकतम मैचिंग कैपिंग (₹2,500/दिन)</span>
              </div>

              {/* Admin Charge Deduction % */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 flex items-center justify-between">
                  <span>Admin Deduction Fee (%)</span>
                  <span className="text-[10px] text-slate-400">Default: 5%</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={formData.adminChargePercent ?? 5}
                    onChange={(e) => handleInputChange('adminChargePercent', e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold focus:bg-white focus:border-[#144732] focus:outline-none"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
                </div>
                <span className="text-[10px] text-slate-500">विड्रॉल पर काटा जाने वाला एडमिन चार्ज</span>
              </div>

              {/* TDS Deduction % */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 flex items-center justify-between">
                  <span>TDS Tax Deduction (%)</span>
                  <span className="text-[10px] text-slate-400">Default: 5%</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={formData.tdsPercent ?? 5}
                    onChange={(e) => handleInputChange('tdsPercent', e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold focus:bg-white focus:border-[#144732] focus:outline-none"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
                </div>
                <span className="text-[10px] text-slate-500">विड्रॉल पर काटा जाने वाला वैधानिक TDS</span>
              </div>

              {/* Min Withdrawal Limit */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 flex items-center justify-between">
                  <span>Min Withdrawal Limit (न्यूनतम निकासी)</span>
                  <span className="text-[10px] text-slate-400">Default: ₹100</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={formData.minWithdrawalAmount ?? 100}
                    onChange={(e) => handleInputChange('minWithdrawalAmount', e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold focus:bg-white focus:border-[#144732] focus:outline-none"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                </div>
                <span className="text-[10px] text-slate-500">सदस्य कम से कम इतनी राशि का विड्रॉल लगा सकता है</span>
              </div>

              {/* Recharge Cashback % */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 flex items-center justify-between">
                  <span>Recharge Cashback (%)</span>
                  <span className="text-[10px] text-slate-400">Default: 2.5%</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={formData.rechargeCashbackPercent ?? 2.5}
                    onChange={(e) => handleInputChange('rechargeCashbackPercent', e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold focus:bg-white focus:border-[#144732] focus:outline-none"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
                </div>
                <span className="text-[10px] text-slate-500">मोबाइल व DTH रिचार्ज पर सदस्य को दिया जाने वाला कैशबैक</span>
              </div>

              {/* Leadership CTO % */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 flex items-center justify-between">
                  <span>Leadership CTO Pool (%)</span>
                  <span className="text-[10px] text-slate-400">Default: 5%</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={formData.leadershipCTOPercent ?? 5}
                    onChange={(e) => handleInputChange('leadershipCTOPercent', e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold focus:bg-white focus:border-[#144732] focus:outline-none"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
                </div>
                <span className="text-[10px] text-slate-500">3000 PV डायरेक्ट बिजनेस अचीवर्स में वितरण</span>
              </div>

              {/* Company CTO % */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 flex items-center justify-between">
                  <span>Company CTO Royalty (%)</span>
                  <span className="text-[10px] text-slate-400">Default: 5%</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={formData.companyCTOPercent ?? 5}
                    onChange={(e) => handleInputChange('companyCTOPercent', e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold focus:bg-white focus:border-[#144732] focus:outline-none"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
                </div>
                <span className="text-[10px] text-slate-500">5000 PV डायरेक्ट अचीवर्स में कंपनी टर्नओवर शेयरिंग</span>
              </div>

              {/* AutoPool Global Matrix Switch */}
              <div className="space-y-2 p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-900">
                    2x2 Global AutoPool System
                  </span>
                  <button
                    type="button"
                    onClick={() => handleInputChange('autoPoolEnabled', !formData.autoPoolEnabled)}
                    className="text-amber-800 cursor-pointer"
                  >
                    {formData.autoPoolEnabled ? (
                      <ToggleRight className="w-7 h-7 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-slate-400" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-amber-800">
                  {formData.autoPoolEnabled
                    ? 'सक्रिय (Active): 7-लेवल 2x2 नॉन-वर्किंग ग्लोबल मैट्रिक्स चालू है।'
                    : 'निष्क्रिय (Paused): नया ऑटोपूल प्रवेश अस्थायी रूप से रुका हुआ है।'}
                </p>
              </div>
            </div>

            {/* Quick Live Formula Summary */}
            <div className="p-4 rounded-2xl bg-[#fdfaf3] border border-[#e8e3d5] space-y-2">
              <div className="text-xs font-black text-[#144732] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#d4a359]" />
                <span>लाइव विड्रॉल कटौती उदाहरण (Real-time Payout Simulation):</span>
              </div>
              <div className="text-xs text-slate-600 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
                <div className="bg-white p-2 rounded-xl border">
                  अनुरोध: <span className="font-bold text-slate-800">₹1,000</span>
                </div>
                <div className="bg-white p-2 rounded-xl border text-red-600">
                  एडमिन ({formData.adminChargePercent}%): <span className="font-bold">-₹{(1000 * ((formData.adminChargePercent || 5) / 100)).toFixed(1)}</span>
                </div>
                <div className="bg-white p-2 rounded-xl border text-red-600">
                  TDS ({formData.tdsPercent}%): <span className="font-bold">-₹{(1000 * ((formData.tdsPercent || 5) / 100)).toFixed(1)}</span>
                </div>
                <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-300 text-emerald-800 font-bold">
                  नेट भुगतान: ₹{(1000 - (1000 * ((formData.adminChargePercent || 5) / 100)) - (1000 * ((formData.tdsPercent || 5) / 100))).toFixed(1)}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-[#144732] to-[#0b2b1e] text-[#fef08a] font-black text-sm shadow-md border border-[#d4a359] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4 text-[#d4a359]" />
                <span>{saving ? 'सुरक्षित हो रहा है...' : 'प्लान सेटिंग्स सुरक्षित करें (Save Plan Config)'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* TAB: GOOGLE DRIVE AUTO-UPLOAD (ड्राइव ऑटो-अपलोड) */}
      {/* ======================================================== */}
      {activeTab === 'drive' && (
        <div className="space-y-6">
          {/* Target Folder Header Card */}
          <div className="bg-gradient-to-br from-[#144732] to-[#0b2b1e] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#d4a359]/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#d4a359]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#d4a359]/20 text-[#fef08a] border border-[#d4a359]/30">
                    Google Drive Cloud Storage Sync
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-2 flex items-center gap-2">
                    <span>📁 गूगल ड्राइव ऑटो-अपलोड व्यवस्था</span>
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                    इन्वेंटरी प्रोडक्ट्स व सदस्य केवाईसी दस्तावेज़ों का क्लाउड स्टोरेज सिंक।
                  </p>
                </div>

                <a
                  href={`https://drive.google.com/drive/folders/${formData.googleDriveFolderId || '1m48lvsU628rR8nhL4i-24GWdJe_4w5Hn'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-sm transition-all hover:scale-105 shrink-0"
                >
                  <FolderCheck className="w-4 h-4 text-[#fef08a]" />
                  <span>Google Drive फोल्डर खोलें</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Folder Details Box */}
              <div className="bg-black/30 rounded-2xl p-4 border border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold">Target Drive Folder ID:</span>
                  <strong className="text-[#fef08a] text-sm break-all">{formData.googleDriveFolderId || '1m48lvsU628rR8nhL4i-24GWdJe_4w5Hn'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-sans font-bold">Integration Status:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    {formData.googleDriveUploadUrl ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ऑटो-अपलोड सक्रिय (Active)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>वेबहुक URL सेटअप शेष (Pending Webhook URL)</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Card for Webhook Configuration */}
          <form onSubmit={handleSaveSettings} className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-[#144732] flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#92580a]" />
                <span>1. Google Apps Script Webhook URL कॉन्फ़िगर करें</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Google Apps Script का Web App URL यहाँ पेस्ट करें। यह बिना किसी अतिरिक्त खर्च के आपके ड्राइव खाते से डायरेक्ट कनेक्ट रहता है।
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google Apps Script Web App URL *
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={formData.googleDriveUploadUrl || ''}
                    onChange={(e) => handleInputChange('googleDriveUploadUrl', e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:border-[#144732] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      setTestingDrive(true);
                      setTestResult(null);
                      try {
                        const testBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
                        const res = await fetch('/api/upload', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            file: testBase64,
                            filename: `test_connection_${Date.now()}.png`,
                            mimeType: 'image/png',
                            folder: 'test',
                          }),
                        });
                        const data = await res.json();
                        setTestResult(data);
                      } catch (err: any) {
                        setTestResult({ success: false, error: err.message || 'Connection failed' });
                      } finally {
                        setTestingDrive(false);
                      }
                    }}
                    disabled={testingDrive}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {testingDrive ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <UploadCloud className="w-4 h-4" />
                    )}
                    <span>{testingDrive ? 'टेस्टिंग...' : 'ड्राइव कनेक्शन टेस्ट करें'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  URL पेस्ट करने के बाद <strong>"ड्राइव सेटिंग्स सुरक्षित करें"</strong> पर क्लिक करें।
                </p>
              </div>

              {/* Test Result Feedback */}
              {testResult && (
                <div className={`p-4 rounded-2xl border text-xs font-bold flex items-start gap-3 ${
                  testResult.provider === 'google_drive'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-amber-50 border-amber-300 text-amber-800'
                }`}>
                  {testResult.provider === 'google_drive' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <div className="font-black text-sm">
                      {testResult.provider === 'google_drive'
                        ? '🎉 बधाई! Google Drive कनेक्शन 100% सफल!'
                        : '⚠️ अभी ड्राइव वेबहुक कनेक्ट नहीं हुआ है'}
                    </div>
                    <div className="font-normal">{testResult.message || testResult.error}</div>
                    {testResult.driveUrl && (
                      <a
                        href={testResult.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline font-mono text-[11px] mt-1"
                      >
                        <span>अपलोड की गई टेस्ट फाइल देखें</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google Drive फोल्डर ID (Target Folder ID)
                </label>
                <input
                  type="text"
                  value={formData.googleDriveFolderId || '1m48lvsU628rR8nhL4i-24GWdJe_4w5Hn'}
                  onChange={(e) => handleInputChange('googleDriveFolderId', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:border-[#144732] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-[#144732] to-[#0b2b1e] text-[#fef08a] font-black text-sm shadow-md border border-[#d4a359] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4 text-[#d4a359]" />
                  <span>{saving ? 'सुरक्षित हो रहा है...' : 'ड्राइव सेटिंग्स सुरक्षित करें (Save Drive Settings)'}</span>
                </button>
              </div>
            </div>
          </form>

          {/* Setup Instructions & Copyable Script Box */}
          <div className="bg-[#faf8f4] border-2 border-[#d4a359]/30 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e8e3d5] pb-4">
              <div>
                <h3 className="text-base font-black text-[#144732] flex items-center gap-2">
                  <span>📋 1-मिनट Google Apps Script कोड (तैयार स्क्रिप्ट)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  यह कोड आपके गूगल ड्राइव फोल्डर (ID: <strong className="font-mono text-slate-700">{formData.googleDriveFolderId || '1m48lvsU628rR8nhL4i-24GWdJe_4w5Hn'}</strong>) के लिए पहले से कॉन्फ़िगर है।
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const code = `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var targetFolderId = data.folderId || "${formData.googleDriveFolderId || '1m48lvsU628rR8nhL4i-24GWdJe_4w5Hn'}";
    var folder = DriveApp.getFolderById(targetFolderId);

    var base64Data = data.base64;
    if (base64Data.indexOf('base64,') > -1) {
      base64Data = base64Data.split('base64,')[1];
    }

    var decoded = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(
      decoded, 
      data.mimeType || 'image/jpeg', 
      data.filename || ('sgm_upload_' + new Date().getTime() + '.jpg')
    );

    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var fileId = file.getId();
    var viewUrl = "https://lh3.googleusercontent.com/d/" + fileId;
    var driveUrl = file.getUrl();

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      fileId: fileId,
      url: viewUrl,
      driveUrl: driveUrl,
      filename: file.getName()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;
                  navigator.clipboard.writeText(code);
                  setCopiedScript(true);
                  setTimeout(() => setCopiedScript(false), 3000);
                }}
                className="px-4 py-2 rounded-xl bg-[#144732] hover:bg-[#0b2b1e] text-[#fef08a] text-xs font-black flex items-center gap-1.5 transition-all shadow cursor-pointer shrink-0"
              >
                {copiedScript ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedScript ? '✓ कोड कॉपी हो गया!' : 'स्क्रिप्ट कोड कॉपी करें (Copy Code)'}</span>
              </button>
            </div>

            {/* Step-by-Step Hindi Guide */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-[#144732] text-white flex items-center justify-center font-black text-xs">1</div>
                <div className="font-bold text-slate-800">script.google.com खोलें</div>
                <p className="text-slate-500 text-[11px]">
                  उसी गूगल अकाउंट से लॉग इन करें जिसके पास ड्राइव फोल्डर का मालिकाना हक है।
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-[#144732] text-white flex items-center justify-center font-black text-xs">2</div>
                <div className="font-bold text-slate-800">New Project & कोड पेस्ट</div>
                <p className="text-slate-500 text-[11px]">
                  <strong>New project</strong> बनाएं, पुराना कोड हटाएं और ऊपर से कॉपी किया गया कोड पेस्ट करें।
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-[#144732] text-white flex items-center justify-center font-black text-xs">3</div>
                <div className="font-bold text-slate-800">Deploy as Web App</div>
                <p className="text-slate-500 text-[11px]">
                  <strong>Deploy</strong> -&gt; <strong>New deployment</strong> -&gt; <strong>Web app</strong> चुनें। <em>Who has access</em> को <strong>Anyone</strong> रखें।
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="w-6 h-6 rounded-full bg-[#144732] text-white flex items-center justify-center font-black text-xs">4</div>
                <div className="font-bold text-slate-800">URL यहाँ सेव करें</div>
                <p className="text-slate-500 text-[11px]">
                  Deploy के बाद मिलने वाला Web App URL ऊपर बॉक्स में पेस्ट करके <strong>"ड्राइव सेटिंग्स सुरक्षित करें"</strong> दबाएं।
                </p>
              </div>
            </div>

            {/* Code Snippet Box */}
            <div className="rounded-2xl bg-slate-900 text-slate-200 p-4 font-mono text-[11px] overflow-x-auto border border-slate-800 max-h-60">
              <pre>{`function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var targetFolderId = data.folderId || "${formData.googleDriveFolderId || '1m48lvsU628rR8nhL4i-24GWdJe_4w5Hn'}";
    var folder = DriveApp.getFolderById(targetFolderId);

    var base64Data = data.base64;
    if (base64Data.indexOf('base64,') > -1) {
      base64Data = base64Data.split('base64,')[1];
    }

    var decoded = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(
      decoded, 
      data.mimeType || 'image/jpeg', 
      data.filename || ('sgm_upload_' + new Date().getTime() + '.jpg')
    );

    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var fileId = file.getId();
    var viewUrl = "https://lh3.googleusercontent.com/d/" + fileId;
    var driveUrl = file.getUrl();

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      fileId: fileId,
      url: viewUrl,
      driveUrl: driveUrl,
      filename: file.getName()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`}</pre>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: DATA BACKUP (डेटा बैकअप) */}
      {/* ======================================================== */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          {/* Database Health Overview Card */}
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-[#144732] flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#d4a359]" />
                  <span>SGM Mart Database Backup Vault (डेटाबेस बैकअप व एक्सपोर्ट)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  किसी भी समय पूरे डेटाबेस, मेंबर्स लिस्ट, ऑर्डर्स लेजर और विड्रॉल रिक्वेस्ट्स का 1-क्लिक डाउनलोड सुरक्षित करें।
                </p>
              </div>

              <button
                onClick={fetchBackupStats}
                disabled={loadingStats}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin' : ''}`} />
                <span>रिफ्रेश मेट्रिक्स</span>
              </button>
            </div>

            {/* Live DB Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Distributors</div>
                <div className="text-xl font-black text-[#144732] mt-1">{backupStats?.usersCount ?? '...'}</div>
                <div className="text-[9px] text-slate-400">रजिस्टर्ड सदस्य</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Orders</div>
                <div className="text-xl font-black text-[#92580a] mt-1">{backupStats?.ordersCount ?? '...'}</div>
                <div className="text-[9px] text-slate-400">कुल ऑर्डर्स</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Products</div>
                <div className="text-xl font-black text-slate-700 mt-1">{backupStats?.productsCount ?? '...'}</div>
                <div className="text-[9px] text-slate-400">कैटलॉग उत्पाद</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Withdrawals</div>
                <div className="text-xl font-black text-amber-700 mt-1">{backupStats?.withdrawalsCount ?? '...'}</div>
                <div className="text-[9px] text-slate-400">पेआउट अनुरोध</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Transactions</div>
                <div className="text-xl font-black text-emerald-700 mt-1">{backupStats?.transactionsCount ?? '...'}</div>
                <div className="text-[9px] text-slate-400">वॉलेट लेजर</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase">AutoPools</div>
                <div className="text-xl font-black text-purple-700 mt-1">{backupStats?.autoPoolCount ?? '...'}</div>
                <div className="text-[9px] text-slate-400">मैट्रिक्स एंट्रीज</div>
              </div>
            </div>

            {/* Main Full Backup Action Box */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#144732] to-[#0b2b1e] text-white border-2 border-[#d4a359] shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#fef08a] text-[10px] font-black uppercase tracking-wider border border-white/20">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#d4a359]" />
                  <span>1-Click Master Snapshot</span>
                </div>
                <h3 className="text-xl font-black text-white">
                  संपूर्ण सिस्टम बैकअप (Full JSON Database Backup)
                </h3>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  इस विकल्प से संपूर्ण डेटाबेस (उपयोगकर्ता, केवाईसी, उत्पाद, ऑर्डर्स, वॉलेट्स, लेजर ट्रांजेक्शन एवं सेटिंग्स) की टाइमस्टैम्प्ड सुरक्षित JSON फ़ाइल डाउनलोड होगी।
                </p>
              </div>

              <a
                href="/api/admin/backup?type=full"
                className="w-full md:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#d4a359] hover:bg-[#bc853c] text-[#0b2b1e] font-black text-sm shadow-xl transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Full JSON Backup</span>
              </a>
            </div>

            {/* Individual CSV Export Cards */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                मॉड्यूलर एक्सेल / CSV स्प्रेडशीट रिपोर्ट्स (Excel & CSV Exports)
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Users CSV */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">CSV FORMAT</span>
                    </div>
                    <h4 className="font-black text-sm text-slate-800 mt-2">Distributors & Members</h4>
                    <p className="text-[11px] text-slate-500">
                      सभी सदस्यों के कोड, मोबाइल, स्पॉन्सर, बाइनरी PV, वॉलेट बैलेंस एवं KYC स्थिति।
                    </p>
                  </div>
                  <a
                    href="/api/admin/backup?type=users_csv"
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white border border-slate-300 text-xs font-bold text-emerald-800 hover:bg-emerald-50 transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Members CSV</span>
                  </a>
                </div>

                {/* Orders CSV */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-amber-100 text-[#92580a]">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">CSV FORMAT</span>
                    </div>
                    <h4 className="font-black text-sm text-slate-800 mt-2">Sales & Orders Ledger</h4>
                    <p className="text-[11px] text-slate-500">
                      ऑर्डर नंबर, सदस्य विवरण, डीपी मूल्य, पीवी/बीवी एवं भुगतान स्थिति की सूची।
                    </p>
                  </div>
                  <a
                    href="/api/admin/backup?type=orders_csv"
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white border border-slate-300 text-xs font-bold text-[#92580a] hover:bg-amber-50 transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Orders CSV</span>
                  </a>
                </div>

                {/* Withdrawals CSV */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">CSV FORMAT</span>
                    </div>
                    <h4 className="font-black text-sm text-slate-800 mt-2">Withdrawals & Payouts</h4>
                    <p className="text-[11px] text-slate-500">
                      बैंक खाता नंबर, IFSC, पैन कार्ड, नेट देय राशि एवं UTR भुगतान रिकॉर्ड।
                    </p>
                  </div>
                  <a
                    href="/api/admin/backup?type=withdrawals_csv"
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white border border-slate-300 text-xs font-bold text-teal-800 hover:bg-teal-50 transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Payouts CSV</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Database Engine Information */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2 font-mono">
              <div>
                <span>Database Engine: </span>
                <span className="font-bold text-slate-700">Neon Cloud PostgreSQL (High Availability)</span>
              </div>
              <div>
                <span>Encryption: </span>
                <span className="font-bold text-slate-700">TLS/SSL In-Transit & At-Rest</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: ADMIN NOTICE & TICKER (सूचना व टिकर) */}
      {/* ======================================================== */}
      {activeTab === 'notice' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-[#144732] flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-[#d4a359]" />
                  <span>Admin Notice & Announcement (आधिकारिक सूचना व टिकर)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  यहाँ से आप सदस्य डैशबोर्ड एवं वेबसाइट पर दिखने वाली घोषणा का संदेश, प्रकार व लिंक सेट कर सकते हैं।
                </p>
              </div>

              {/* Notice Enable/Disable Toggle */}
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 self-start sm:self-auto">
                <span className="text-xs font-black text-slate-700">Notice Status:</span>
                <button
                  type="button"
                  onClick={() => handleInputChange('noticeEnabled', !formData.noticeEnabled)}
                  className="cursor-pointer"
                >
                  {formData.noticeEnabled ? (
                    <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700">
                      <ToggleRight className="w-7 h-7 text-emerald-600" />
                      <span>चालू (Active)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-400">
                      <ToggleLeft className="w-7 h-7 text-slate-400" />
                      <span>बंद (Off)</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Notice Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">
                  Notice Visual Type (सूचना का प्रकार / रंग)
                </label>
                <select
                  value={formData.noticeType || 'INFO'}
                  onChange={(e) => handleInputChange('noticeType', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold focus:bg-white focus:border-[#144732] focus:outline-none"
                >
                  <option value="INFO">🟢 Information (हरा/एमराल्ड - सामान्य सूचना)</option>
                  <option value="WARNING">🟠 Warning (अंबर/पीला - चेतावनी या अंतिम तिथि)</option>
                  <option value="DANGER">🔴 Urgent / Alert (लाल - अति महत्वपूर्ण सूचना)</option>
                  <option value="SUCCESS">🔵 Success / Good News (टील - खुशखबरी व ऑफर)</option>
                </select>
              </div>

              {/* Notice Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">
                  Notice Heading / Title (सूचना का शीर्षक)
                </label>
                <input
                  type="text"
                  value={formData.noticeTitle || ''}
                  onChange={(e) => handleInputChange('noticeTitle', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold focus:bg-white focus:border-[#144732] focus:outline-none"
                  placeholder="e.g. महत्वपूर्ण सूचना • केवाईसी सत्यापन अनिवार्य"
                />
              </div>

              {/* Notice Message Text */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-black text-slate-700">
                  Announcement Message Content (मुख्य संदेश विवरण)
                </label>
                <textarea
                  rows={3}
                  value={formData.noticeText || ''}
                  onChange={(e) => handleInputChange('noticeText', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold focus:bg-white focus:border-[#144732] focus:outline-none"
                  placeholder="यहाँ वह संदेश लिखें जो सभी मेंबर्स के डैशबोर्ड पर दिखाई देगा..."
                />
              </div>

              {/* Notice Action Link */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-black text-slate-700 flex items-center justify-between">
                  <span>Action Link (ऐक्शन बटन लिंक - ऐच्छिक)</span>
                  <span className="text-[10px] text-slate-400">e.g. /kyc, /store, /wallet</span>
                </label>
                <input
                  type="text"
                  value={formData.noticeLink || ''}
                  onChange={(e) => handleInputChange('noticeLink', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold focus:bg-white focus:border-[#144732] focus:outline-none font-mono"
                  placeholder="https://... या /kyc"
                />
              </div>
            </div>

            {/* Live Interactive Preview Box */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#144732]" />
                <span>लाइव प्रीव्यू (Real-time Live Preview on Member Dashboard):</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200">
                <AdminNoticeBanner
                  enabled={formData.noticeEnabled}
                  type={formData.noticeType}
                  title={formData.noticeTitle}
                  text={formData.noticeText}
                  link={formData.noticeLink}
                />
                {!formData.noticeEnabled && (
                  <div className="text-center text-xs text-slate-500 font-bold py-2">
                    (नोटिस वर्तमान में बंद है। चालू करने पर ऊपर जैसा बैनर दिखाई देगा।)
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-[#144732] to-[#0b2b1e] text-[#fef08a] font-black text-sm shadow-md border border-[#d4a359] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4 text-[#d4a359]" />
                <span>{saving ? 'सुरक्षित हो रहा है...' : 'सूचना सेटिंग्स सुरक्षित करें (Save Notice)'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* TAB 4: POPUP MODAL (पॉपअप बैनर) */}
      {/* ======================================================== */}
      {activeTab === 'popup' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-[#144732] flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-[#92580a]" />
                  <span>Global Popup Modal (स्क्रीन पॉपअप सूचना व पोस्टर)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  विजिटर या सदस्य के पोर्टल ओपन करते ही आकर्षक पोस्टर या विशेष घोषणा का पॉपअप मॉडल दिखाएं।
                </p>
              </div>

              {/* Popup Switch */}
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 self-start sm:self-auto">
                <span className="text-xs font-black text-slate-700">Popup Display:</span>
                <button
                  type="button"
                  onClick={() => handleInputChange('popupEnabled', !formData.popupEnabled)}
                  className="cursor-pointer"
                >
                  {formData.popupEnabled ? (
                    <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700">
                      <ToggleRight className="w-7 h-7 text-emerald-600" />
                      <span>सक्रिय (Active)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-400">
                      <ToggleLeft className="w-7 h-7 text-slate-400" />
                      <span>बंद (Off)</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Target Audience */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">
                  Target Audience (किन्हें पॉपअप दिखाई दे)
                </label>
                <select
                  value={formData.popupTarget || 'ALL'}
                  onChange={(e) => handleInputChange('popupTarget', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold focus:bg-white focus:border-[#144732] focus:outline-none"
                >
                  <option value="ALL">🌐 All Visitors (वेबसाइट और डैशबोर्ड दोनों पर)</option>
                  <option value="MEMBERS">👥 Logged-in Members Only (सिर्फ लॉगिन सदस्यों को)</option>
                  <option value="GUESTS">🛍️ Guests / New Visitors (सिर्फ होमपेज विजिटर्स को)</option>
                </select>
              </div>

              {/* Popup Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">
                  Popup Title (पॉपअप का शीर्षक)
                </label>
                <input
                  type="text"
                  value={formData.popupTitle || ''}
                  onChange={(e) => handleInputChange('popupTitle', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold focus:bg-white focus:border-[#144732] focus:outline-none"
                  placeholder="e.g. महा ऑफर • 16 प्रकार की इनकम का अवसर"
                />
              </div>

              {/* Popup Content */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-black text-slate-700">
                  Popup Message Content (पॉपअप का मुख्य विवरण)
                </label>
                <textarea
                  rows={4}
                  value={formData.popupContent || ''}
                  onChange={(e) => handleInputChange('popupContent', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold focus:bg-white focus:border-[#144732] focus:outline-none"
                  placeholder="पॉपअप में प्रदर्शित होने वाला संदेश लिखें..."
                />
              </div>

              {/* Popup Image URL */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-black text-slate-700 flex items-center justify-between">
                  <span>Banner Image URL (पॉस्टर फोटो लिंक - ऐच्छिक)</span>
                  <span className="text-[10px] text-slate-400">e.g. /sgm_logo.png या ऑनलाइन फोटो URL</span>
                </label>
                <input
                  type="text"
                  value={formData.popupImageUrl || ''}
                  onChange={(e) => handleInputChange('popupImageUrl', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold focus:bg-white focus:border-[#144732] focus:outline-none font-mono"
                  placeholder="https://... या /sgm_logo.png"
                />
              </div>

              {/* Button Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">
                  Call-to-Action Button Label (बटन पर क्या लिखा हो)
                </label>
                <input
                  type="text"
                  value={formData.popupButtonText || ''}
                  onChange={(e) => handleInputChange('popupButtonText', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold focus:bg-white focus:border-[#144732] focus:outline-none"
                  placeholder="e.g. अभी देखें (Explore Now)"
                />
              </div>

              {/* Button Link */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">
                  Target Destination Link (बटन क्लिक पर कहाँ जाए)
                </label>
                <input
                  type="text"
                  value={formData.popupButtonLink || ''}
                  onChange={(e) => handleInputChange('popupButtonLink', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold focus:bg-white focus:border-[#144732] focus:outline-none font-mono"
                  placeholder="e.g. /store, /register, /dashboard"
                />
              </div>
            </div>

            {/* Test Preview Button */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-amber-900 font-medium">
                आप तुरंत स्क्रीन पर देखकर जांच सकते हैं कि सदस्यों को यह पॉपअप कैसा नजर आएगा।
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewPopup(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-black shadow-sm transition-all cursor-pointer shrink-0"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>स्क्रीन पर पॉपअप टेस्ट करें (Test Popup)</span>
              </button>
            </div>

            {/* Interactive Preview Modal if clicked */}
            {showPreviewPopup && (
              <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-[#d4a359] overflow-hidden z-10 flex flex-col max-h-[90vh]">
                  <div className="bg-[#144732] text-white p-4 flex items-center justify-between">
                    <span className="font-black text-sm text-[#fef08a] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#d4a359]" />
                      <span>{formData.popupTitle || 'विशेष सूचना'}</span>
                    </span>
                    <button
                      onClick={() => setShowPreviewPopup(false)}
                      className="text-xs font-bold px-2 py-1 rounded bg-white/20 hover:bg-white/30 text-white cursor-pointer"
                    >
                      ✕ Close Preview
                    </button>
                  </div>
                  <div className="p-5 space-y-3 overflow-y-auto">
                    {formData.popupImageUrl && (
                      <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-h-48 flex items-center justify-center">
                        <img src={formData.popupImageUrl} alt="Preview" className="w-full h-full object-cover max-h-48" />
                      </div>
                    )}
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line bg-slate-50 p-4 rounded-2xl border">
                      {formData.popupContent || 'संदेश सामग्री यहाँ दिखाई देगी...'}
                    </p>
                  </div>
                  <div className="p-4 border-t bg-slate-50 flex items-center justify-between">
                    <button
                      onClick={() => setShowPreviewPopup(false)}
                      className="text-xs font-bold text-slate-600 px-4 py-2 rounded-xl border bg-white"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => setShowPreviewPopup(false)}
                      className="text-xs font-black text-[#0b2b1e] bg-[#d4a359] px-5 py-2 rounded-xl border border-[#92580a]"
                    >
                      {formData.popupButtonText || 'अभी देखें'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-[#144732] to-[#0b2b1e] text-[#fef08a] font-black text-sm shadow-md border border-[#d4a359] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4 text-[#d4a359]" />
                <span>{saving ? 'सुरक्षित हो रहा है...' : 'पॉपअप सेटिंग्स सुरक्षित करें (Save Popup)'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* TAB 5: GENERAL & OPERATIONS (सामान्य सेटिंग्स व स्विच) */}
      {/* ======================================================== */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-lg font-black text-[#144732] flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-[#144732]" />
                <span>General Portal Controls & Support Info (कंपनी व पोर्टल नियंत्रण)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                कंपनी का आधिकारिक संपर्क, मेंटेनेंस मोड, विड्रॉल गेटवे स्विच व रजिस्ट्रेशन टॉगल
              </p>
            </div>

            {/* System Switches Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Registration Toggle */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">New Registration</span>
                  <button
                    type="button"
                    onClick={() => handleInputChange('registrationEnabled', !formData.registrationEnabled)}
                    className="cursor-pointer"
                  >
                    {formData.registrationEnabled ? (
                      <ToggleRight className="w-7 h-7 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-slate-400" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  {formData.registrationEnabled
                    ? 'चालू: नए वितरक व ग्राहक पंजीकरण कर सकते हैं।'
                    : 'बंद: नया रजिस्ट्रेशन पोर्टल अस्थायी रूप से बंद है।'}
                </p>
              </div>

              {/* Withdrawals Toggle */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">Member Withdrawals</span>
                  <button
                    type="button"
                    onClick={() => handleInputChange('withdrawalsEnabled', !formData.withdrawalsEnabled)}
                    className="cursor-pointer"
                  >
                    {formData.withdrawalsEnabled ? (
                      <ToggleRight className="w-7 h-7 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-slate-400" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  {formData.withdrawalsEnabled
                    ? 'खुला: सदस्य बैंक विड्रॉल अनुरोध जमा कर सकते हैं।'
                    : 'बंद: विड्रॉल विंडो वर्तमान में बंद है।'}
                </p>
              </div>

              {/* Maintenance Mode Toggle */}
              <div className={`p-4 rounded-2xl border space-y-2 ${
                formData.maintenanceMode ? 'bg-red-50 border-red-300' : 'bg-slate-50/70 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black ${formData.maintenanceMode ? 'text-red-900' : 'text-slate-800'}`}>
                    Maintenance Mode
                  </span>
                  <button
                    type="button"
                    onClick={() => handleInputChange('maintenanceMode', !formData.maintenanceMode)}
                    className="cursor-pointer"
                  >
                    {formData.maintenanceMode ? (
                      <ToggleRight className="w-7 h-7 text-red-600" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-slate-400" />
                    )}
                  </button>
                </div>
                <p className={`text-[10px] ${formData.maintenanceMode ? 'text-red-700' : 'text-slate-500'}`}>
                  {formData.maintenanceMode
                    ? '⚠️ सक्रिय: मेंटेनेंस अलर्ट चालू है।'
                    : 'सामान्य: पोर्टल सामान्य रूप से लाइव है।'}
                </p>
              </div>
            </div>

            {/* Maintenance Message if mode is ON */}
            {formData.maintenanceMode && (
              <div className="space-y-1.5 p-4 rounded-2xl bg-red-50 border border-red-200 animate-in fade-in">
                <label className="text-xs font-black text-red-900">
                  Maintenance Screen Notice (उपयोगकर्ताओं को दिखने वाला संदेश)
                </label>
                <textarea
                  rows={2}
                  value={formData.maintenanceMessage || ''}
                  onChange={(e) => handleInputChange('maintenanceMessage', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-red-300 bg-white text-xs font-bold text-red-900 focus:outline-none"
                />
              </div>
            )}

            {/* Company Support Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">
                  Legal Entity / Company Name (कंपनी का नाम)
                </label>
                <input
                  type="text"
                  value={formData.companyName || ''}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold focus:bg-white focus:border-[#144732] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">
                  Support Helpline Number (हेल्पलाइन फोन नंबर)
                </label>
                <input
                  type="text"
                  value={formData.supportPhone || ''}
                  onChange={(e) => handleInputChange('supportPhone', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold focus:bg-white focus:border-[#144732] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">
                  WhatsApp Support Number (व्हाट्सएप नंबर)
                </label>
                <input
                  type="text"
                  value={formData.supportWhatsApp || ''}
                  onChange={(e) => handleInputChange('supportWhatsApp', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold focus:bg-white focus:border-[#144732] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">
                  Official Support Email (आधिकारिक ईमेल)
                </label>
                <input
                  type="email"
                  value={formData.supportEmail || ''}
                  onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold focus:bg-white focus:border-[#144732] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-black text-slate-700">
                  Corporate Office Address (कार्यालय पता)
                </label>
                <input
                  type="text"
                  value={formData.supportAddress || ''}
                  onChange={(e) => handleInputChange('supportAddress', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold focus:bg-white focus:border-[#144732] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-[#144732] to-[#0b2b1e] text-[#fef08a] font-black text-sm shadow-md border border-[#d4a359] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4 text-[#d4a359]" />
                <span>{saving ? 'सुरक्षित हो रहा है...' : 'सामान्य सेटिंग्स सुरक्षित करें (Save Controls)'}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

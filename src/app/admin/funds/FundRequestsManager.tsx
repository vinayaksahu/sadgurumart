'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Copy,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Eye,
  Send,
  Building,
  QrCode,
  DollarSign,
  User,
  ArrowRight,
  Sparkles,
  FileText
} from 'lucide-react';
import ImageUploader from '@/components/ImageUploader';

interface FundRequestItem {
  id: string;
  amount: number;
  paymentMode: string;
  utrNumber: string;
  screenshotUrl: string | null;
  remarks: string | null;
  adminNote: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    userCode: string;
    name: string;
    mobile: string;
    rank: string;
    isActive: boolean;
  };
}

interface Stats {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalApprovedAmount: number;
}

interface CompanyBankSettings {
  companyBankName: string;
  companyAccountName: string;
  companyAccountNumber: string;
  companyIfscCode: string;
  companyBranch: string;
  companyUpiId: string;
  companyQrImageUrl: string;
}

export default function FundRequestsManager() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get('tab') || 'PENDING';
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL' | 'MANUAL' | 'SETTINGS'>(
    tabParam === 'all' ? 'ALL' : tabParam === 'manual' ? 'MANUAL' : tabParam === 'settings' ? 'SETTINGS' : (tabParam as any) || 'PENDING'
  );

  const [requests, setRequests] = useState<FundRequestItem[]>([]);
  const [stats, setStats] = useState<Stats>({
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    totalApprovedAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Review Modals State
  const [selectedRequest, setSelectedRequest] = useState<FundRequestItem | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Lightbox Modal
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Manual Issue State
  const [manualUserCode, setManualUserCode] = useState('');
  const [manualMemberName, setManualMemberName] = useState<string | null>(null);
  const [manualMemberLoading, setManualMemberLoading] = useState(false);
  const [manualAmount, setManualAmount] = useState('');
  const [manualRemarks, setManualRemarks] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [manualSuccessMsg, setManualSuccessMsg] = useState<string | null>(null);
  const [manualErrorMsg, setManualErrorMsg] = useState<string | null>(null);

  // Settings State
  const [companySettings, setCompanySettings] = useState<CompanyBankSettings>({
    companyBankName: 'State Bank of India',
    companyAccountName: 'Daluram sahu',
    companyAccountNumber: '45402311868',
    companyIfscCode: 'SBIN0002880',
    companyBranch: 'State Bank of India',
    companyUpiId: '6267392508-1@nyes',
    companyQrImageUrl: '/payment-qr.jpg',
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState<string | null>(null);

  // Load Data
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const url = activeTab === 'ALL' || activeTab === 'MANUAL' || activeTab === 'SETTINGS'
        ? '/api/admin/funds'
        : `/api/admin/funds?status=${activeTab}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.settings) {
        setCompanySettings({
          companyBankName: data.settings.companyBankName || 'State Bank of India',
          companyAccountName: data.settings.companyAccountName || 'Daluram sahu',
          companyAccountNumber: data.settings.companyAccountNumber || '45402311868',
          companyIfscCode: data.settings.companyIfscCode || 'SBIN0002880',
          companyBranch: data.settings.companyBranch || 'State Bank of India',
          companyUpiId: data.settings.companyUpiId || '6267392508-1@nyes',
          companyQrImageUrl: data.settings.companyQrImageUrl || '/payment-qr.jpg',
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchSettings();
  }, [activeTab]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Search member for manual issue
  const handleSearchMember = async (code: string) => {
    setManualUserCode(code);
    setManualMemberName(null);
    setManualErrorMsg(null);
    if (code.trim().length >= 4) {
      setManualMemberLoading(true);
      try {
        const res = await fetch(`/api/wallet/search-member?code=${encodeURIComponent(code.trim())}`);
        const data = await res.json();
        if (data.success && data.user) {
          setManualMemberName(`${data.user.name} (${data.user.userCode})`);
        } else {
          setManualMemberName(null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setManualMemberLoading(false);
      }
    }
  };

  // Submit Manual Fund Issue
  const handleManualIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualLoading(true);
    setManualSuccessMsg(null);
    setManualErrorMsg(null);
    try {
      const res = await fetch('/api/admin/funds/manual-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userCode: manualUserCode,
          amount: parseFloat(manualAmount),
          remarks: manualRemarks,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setManualSuccessMsg(data.message);
        setManualUserCode('');
        setManualMemberName(null);
        setManualAmount('');
        setManualRemarks('');
        fetchRequests();
      } else {
        setManualErrorMsg(data.error || 'फंड जारी करने में त्रुटि हुई।');
      }
    } catch (e: any) {
      setManualErrorMsg(e.message || 'सर्वर एरर');
    } finally {
      setManualLoading(false);
    }
  };

  // Handle Review (Approve or Reject)
  const handleReviewSubmit = async () => {
    if (!selectedRequest || !reviewAction) return;

    if (reviewAction === 'REJECT' && !adminNote.trim()) {
      setReviewMessage({ type: 'error', text: 'अस्वीकृति का कारण (Reject Note) लिखना आवश्यक है।' });
      return;
    }

    setReviewLoading(true);
    setReviewMessage(null);
    try {
      const res = await fetch('/api/admin/funds/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          action: reviewAction,
          adminNote: adminNote.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReviewMessage({ type: 'success', text: data.message });
        setTimeout(() => {
          setSelectedRequest(null);
          setReviewAction(null);
          setAdminNote('');
          setReviewMessage(null);
          fetchRequests();
        }, 1500);
      } else {
        setReviewMessage({ type: 'error', text: data.error || 'समीक्षा विफल रही।' });
      }
    } catch (e: any) {
      setReviewMessage({ type: 'error', text: e.message || 'सर्वर एरर' });
    } finally {
      setReviewLoading(false);
    }
  };

  // Save Company Payment Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsMsg(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companySettings),
      });
      const data = await res.json();
      if (res.ok) {
        setSettingsMsg('कंपनी बैंक एवं UPI विवरण सफलतापूर्वक अपडेट हो गया है!');
        setTimeout(() => setSettingsMsg(null), 3000);
      } else {
        setSettingsMsg('त्रुटि: ' + (data.error || 'अपडेट नहीं हो सका'));
      }
    } catch (e: any) {
      setSettingsMsg('एरर: ' + e.message);
    } finally {
      setSettingsLoading(false);
    }
  };

  // Filtered requests by search
  const filteredRequests = requests.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.utrNumber.toLowerCase().includes(q) ||
      r.user.userCode.toLowerCase().includes(q) ||
      r.user.name.toLowerCase().includes(q) ||
      r.user.mobile.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-[#e8e3d5] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Wallet className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-[#144732] tracking-tight">
              Activation Fund Management (फंड इश्यू एवं अप्रूवल डेस्क)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            सदस्यों द्वारा P2P वॉलेट में फंड जोड़ने के UPI / बैंक ट्रांजेक्शन का सत्यापन, रसीद जांच एवं 1-क्लिक अप्रूवल
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              fetchRequests();
              fetchSettings();
            }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>रिफ्रेश</span>
          </button>
          <button
            onClick={() => setActiveTab('MANUAL')}
            className="flex items-center gap-2 px-4 py-2 bg-[#144732] hover:bg-[#0b2b1e] text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>मैनुअल फंड जारी करें</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Card */}
        <div
          onClick={() => setActiveTab('PENDING')}
          className={`p-5 rounded-3xl border-2 transition-all cursor-pointer ${
            activeTab === 'PENDING'
              ? 'bg-amber-50/80 border-amber-400 shadow-md ring-2 ring-amber-400/30'
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-800 uppercase tracking-wider">पेंडिंग फंड अनुरोध</span>
            <span className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-amber-700 mt-2">
            {stats.pendingCount}
          </div>
          <p className="text-[11px] text-amber-800 font-medium mt-1">
            {stats.pendingCount > 0 ? '⚠️ सत्यापन व अप्रूवल प्रतीक्षित' : '✓ कोई पेंडिंग रिक्वेस्ट नहीं'}
          </p>
        </div>

        {/* Approved Card */}
        <div
          onClick={() => setActiveTab('APPROVED')}
          className={`p-5 rounded-3xl border-2 transition-all cursor-pointer ${
            activeTab === 'APPROVED'
              ? 'bg-emerald-50/80 border-emerald-400 shadow-md ring-2 ring-emerald-400/30'
              : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-800 uppercase tracking-wider">स्वीकृत फंड (Approved)</span>
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-700 mt-2">
            ₹{stats.totalApprovedAmount.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            कुल {stats.approvedCount} अनुरोध स्वीकृत
          </p>
        </div>

        {/* Rejected Card */}
        <div
          onClick={() => setActiveTab('REJECTED')}
          className={`p-5 rounded-3xl border-2 transition-all cursor-pointer ${
            activeTab === 'REJECTED'
              ? 'bg-red-50/80 border-red-400 shadow-md ring-2 ring-red-400/30'
              : 'bg-white border-slate-200 hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-red-800 uppercase tracking-wider">अस्वीकृत अनुरोध (Rejected)</span>
            <span className="p-2 rounded-xl bg-red-100 text-red-700">
              <XCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-red-700 mt-2">
            {stats.rejectedCount}
          </div>
          <p className="text-[11px] text-red-700 font-medium mt-1">
            अमान्य UTR / मिसमैच के कारण निरस्त
          </p>
        </div>

        {/* Company Bank & UPI Quick Overview */}
        <div
          onClick={() => setActiveTab('SETTINGS')}
          className={`p-5 rounded-3xl border-2 transition-all cursor-pointer ${
            activeTab === 'SETTINGS'
              ? 'bg-blue-50/80 border-blue-400 shadow-md ring-2 ring-blue-400/30'
              : 'bg-white border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-blue-900 uppercase tracking-wider">कंपनी खाता एवं UPI</span>
            <span className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Building className="w-4 h-4" />
            </span>
          </div>
          <div className="text-sm font-black text-slate-800 mt-2 truncate">
            {companySettings.companyUpiId || 'UPI सेट नहीं है'}
          </div>
          <p className="text-[11px] text-blue-700 font-bold mt-1 flex items-center gap-1">
            <span>⚙️ बैंक व QR कोड बदलें</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'PENDING'
              ? 'bg-[#144732] text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>पेंडिंग अनुरोध (Pending)</span>
          {stats.pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black">
              {stats.pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('APPROVED')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'APPROVED'
              ? 'bg-[#144732] text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>स्वीकृत (Approved)</span>
        </button>

        <button
          onClick={() => setActiveTab('REJECTED')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'REJECTED'
              ? 'bg-[#144732] text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>अस्वीकृत (Rejected)</span>
        </button>

        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-[#144732] text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>समस्त इतिहास (All)</span>
        </button>

        <button
          onClick={() => setActiveTab('MANUAL')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'MANUAL'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>सीधे जारी करें (Manual Issue)</span>
        </button>

        <button
          onClick={() => setActiveTab('SETTINGS')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'SETTINGS'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>कंपनी बैंक व UPI QR</span>
        </button>
      </div>

      {/* ================= TAB 1, 2, 3, 4: REQUESTS TABLE VIEW ================= */}
      {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].includes(activeTab) && (
        <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="UTR नंबर, सदस्य ID, नाम या मोबाइल से खोजें..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#144732] bg-[#faf8f4]"
              />
            </div>

            <div className="text-xs font-bold text-slate-500">
              कुल परिणाम: <span className="text-[#144732] font-black">{filteredRequests.length}</span>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#144732]" />
              <p className="text-xs font-bold">डेटा लोड हो रहा है...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-black text-slate-600">कोई फंड रिक्वेस्ट नहीं मिली</p>
              <p className="text-xs text-slate-400">
                {activeTab === 'PENDING'
                  ? 'वर्तमान में कोई पेंडिंग फंड रिक्वेस्ट नहीं है। सभी अनुरोध निपटाए जा चुके हैं।'
                  : 'चयनित फ़िल्टर के अंतर्गत कोई रिकॉर्ड मौजूद नहीं है।'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-wider bg-slate-50/70">
                    <th className="py-3 px-4">सदस्य विवरण</th>
                    <th className="py-3 px-4">मांगी गई राशि</th>
                    <th className="py-3 px-4">माध्यम व UTR</th>
                    <th className="py-3 px-4">पेमेंट रसीद</th>
                    <th className="py-3 px-4">दिनांक व समय</th>
                    <th className="py-3 px-4">स्थिति</th>
                    <th className="py-3 px-4 text-right">कार्य (Action)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-amber-50/20 transition-colors">
                      {/* User Info */}
                      <td className="py-3 px-4">
                        <div className="font-black text-slate-800">{req.user.name}</div>
                        <div className="text-[11px] font-mono text-emerald-800 font-bold">{req.user.userCode}</div>
                        <div className="text-[10px] text-slate-400">{req.user.mobile}</div>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4">
                        <div className="text-sm font-black text-[#144732]">
                          ₹{req.amount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400">P2P Wallet Credit</div>
                      </td>

                      {/* Mode & UTR */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-black text-[10px] mb-1">
                          {req.paymentMode}
                        </span>
                        <div className="flex items-center gap-1 font-mono text-xs font-bold text-slate-800">
                          <span>{req.utrNumber}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(req.utrNumber, req.id)}
                            title="Copy UTR"
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        {copiedText === req.id && (
                          <span className="text-[9px] text-emerald-600 font-bold">कॉपी हुआ!</span>
                        )}
                        {req.remarks && (
                          <div className="text-[10px] text-slate-500 italic mt-0.5 max-w-xs truncate">
                            &quot;{req.remarks}&quot;
                          </div>
                        )}
                      </td>

                      {/* Receipt Screenshot */}
                      <td className="py-3 px-4">
                        {req.screenshotUrl ? (
                          <button
                            type="button"
                            onClick={() => setLightboxImage(req.screenshotUrl)}
                            className="group relative inline-block rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:border-[#144732] cursor-pointer"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={req.screenshotUrl}
                              alt="Payment Receipt"
                              className="w-12 h-12 object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Eye className="w-4 h-4" />
                            </div>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">रसीद नहीं</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-[11px] text-slate-500 whitespace-nowrap">
                        <div>{new Date(req.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(req.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {req.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
                            <Clock className="w-3 h-3" />
                            <span>पेंडिंग</span>
                          </span>
                        )}
                        {req.status === 'APPROVED' && (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>स्वीकृत</span>
                            </span>
                            {req.reviewedBy && (
                              <div className="text-[9px] text-slate-400">द्वारा: {req.reviewedBy}</div>
                            )}
                          </div>
                        )}
                        {req.status === 'REJECTED' && (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-[10px] font-black">
                              <XCircle className="w-3 h-3" />
                              <span>अस्वीकृत</span>
                            </span>
                            {req.adminNote && (
                              <div className="text-[10px] text-red-600 font-bold max-w-xs" title={req.adminNote}>
                                नोट: {req.adminNote}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        {req.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRequest(req);
                                setReviewAction('APPROVE');
                                setAdminNote('भुगतान सत्यापित एवं P2P वॉलेट में क्रेडिट');
                                setReviewMessage(null);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-colors cursor-pointer"
                            >
                              स्वीकृत करें
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRequest(req);
                                setReviewAction('REJECT');
                                setAdminNote('');
                                setReviewMessage(null);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] shadow-sm transition-colors cursor-pointer"
                            >
                              अस्वीकृत (Reject)
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">समीक्षा पूर्ण</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 5: MANUAL ISSUE FUND ================= */}
      {activeTab === 'MANUAL' && (
        <div className="max-w-2xl mx-auto bg-white border border-[#e8e3d5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-black text-[#144732] flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" />
              <span>सीधे सदस्य को फंड जारी करें (Manual Issue Fund)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              एडमिन द्वारा किसी भी सदस्य के P2P वॉलेट में तुरंत राशि क्रेडिट करने की आधिकारिक सुविधा
            </p>
          </div>

          {manualSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{manualSuccessMsg}</span>
            </div>
          )}

          {manualErrorMsg && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{manualErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleManualIssueSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1">
                सदस्य आईडी (Member ID / Code) *
              </label>
              <input
                type="text"
                placeholder="उदा. SGM054963"
                value={manualUserCode}
                onChange={(e) => handleSearchMember(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#144732] bg-[#faf8f4] uppercase font-mono"
              />
              {manualMemberLoading && (
                <p className="text-[10px] text-slate-400 mt-1">सदस्य की खोज हो रही है...</p>
              )}
              {manualMemberName && (
                <div className="mt-1.5 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>नाम: {manualMemberName}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-1">
                क्रेडिट की जाने वाली राशि (Amount ₹) *
              </label>
              <input
                type="number"
                min="1"
                step="any"
                placeholder="उदा. 1000"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#144732] bg-[#faf8f4]"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-1">
                रिमार्क / कारण (Remarks / Note)
              </label>
              <textarea
                placeholder="उदा. नकद भुगतान प्राप्त, या स्पेशल प्रमोशनल फंड"
                value={manualRemarks}
                onChange={(e) => setManualRemarks(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#144732] bg-[#faf8f4]"
              />
            </div>

            <button
              type="submit"
              disabled={manualLoading}
              className="w-full py-3 bg-[#144732] hover:bg-[#0b2b1e] text-white rounded-2xl text-xs font-black transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {manualLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>फंड प्रोसेस हो रहा है...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>सदस्य के P2P वॉलेट में फंड ट्रांसफर करें</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ================= TAB 6: COMPANY BANK & UPI SETTINGS ================= */}
      {activeTab === 'SETTINGS' && (
        <div className="max-w-3xl mx-auto bg-white border border-[#e8e3d5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-black text-[#144732] flex items-center gap-2">
              <Building className="w-5 h-5 text-amber-700" />
              <span>कंपनी आधिकारिक बैंक खाता एवं UPI QR कोड सेटिंग्स</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              यही बैंक व UPI विवरण सदस्यों को फंड डिपॉजिट करते समय स्क्रीन पर दिखाया जाता है
            </p>
          </div>

          {settingsMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{settingsMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  कंपनी UPI ID (VPA) *
                </label>
                <input
                  type="text"
                  placeholder="उदा. sgmmart@upi"
                  value={companySettings.companyUpiId}
                  onChange={(e) => setCompanySettings({ ...companySettings, companyUpiId: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#144732] bg-[#faf8f4]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  बैंक का नाम (Bank Name) *
                </label>
                <input
                  type="text"
                  placeholder="उदा. State Bank of India (SBI)"
                  value={companySettings.companyBankName}
                  onChange={(e) => setCompanySettings({ ...companySettings, companyBankName: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#144732] bg-[#faf8f4]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  खाता धारक का नाम (Account Name) *
                </label>
                <input
                  type="text"
                  placeholder="उदा. SADGURU MART ONLINE SERVICE PVT LTD"
                  value={companySettings.companyAccountName}
                  onChange={(e) => setCompanySettings({ ...companySettings, companyAccountName: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#144732] bg-[#faf8f4]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  खाता संख्या (Account Number) *
                </label>
                <input
                  type="text"
                  placeholder="उदा. 45402311868"
                  value={companySettings.companyAccountNumber}
                  onChange={(e) => setCompanySettings({ ...companySettings, companyAccountNumber: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#144732] bg-[#faf8f4] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  IFSC कोड (IFSC Code) *
                </label>
                <input
                  type="text"
                  placeholder="उदा. SBIN0002880"
                  value={companySettings.companyIfscCode}
                  onChange={(e) => setCompanySettings({ ...companySettings, companyIfscCode: e.target.value.toUpperCase() })}
                  required
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#144732] bg-[#faf8f4] uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  शाखा (Branch)
                </label>
                <input
                  type="text"
                  placeholder="उदा. Main Branch"
                  value={companySettings.companyBranch}
                  onChange={(e) => setCompanySettings({ ...companySettings, companyBranch: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#144732] bg-[#faf8f4]"
                />
              </div>
            </div>

            <div>
              <ImageUploader
                label="कंपनी आधिकारिक पेमेंट QR कोड फोटो (Company UPI QR Code)"
                value={companySettings.companyQrImageUrl}
                onChange={(url) => setCompanySettings({ ...companySettings, companyQrImageUrl: url })}
                folder="general"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                यदि आप कोई कस्टम QR इमेज अपलोड नहीं करते हैं, तो सिस्टम स्वचालित रूप से UPI ID से लाइव डायनामिक QR कोड जेनरेट करेगा।
              </p>
            </div>

            <button
              type="submit"
              disabled={settingsLoading}
              className="w-full py-3 bg-[#144732] hover:bg-[#0b2b1e] text-white rounded-2xl text-xs font-black transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {settingsLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>सेव हो रहा है...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>कंपनी बैंक एवं पेमेंट विवरण सुरक्षित करें</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ================= LIGHTBOX MODAL FOR SCREENSHOT ================= */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-2xl max-h-[90vh] bg-white rounded-3xl p-3 overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center px-3 py-2 border-b border-slate-100">
              <span className="text-xs font-black text-[#144732]">पेमेंट रसीद स्क्रीनशॉट (Payment Proof)</span>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 overflow-auto max-h-[80vh] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxImage}
                alt="Enlarged Receipt"
                className="max-w-full max-h-[75vh] rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= REVIEW (APPROVE / REJECT) MODAL ================= */}
      {selectedRequest && reviewAction && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                {reviewAction === 'APPROVE' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>फंड रिक्वेस्ट स्वीकृत करें (Approve)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span>फंड रिक्वेस्ट अस्वीकृत करें (Reject)</span>
                  </>
                )}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setSelectedRequest(null);
                  setReviewAction(null);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Request Summary Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">सदस्य:</span>
                <span className="font-bold text-slate-800">{selectedRequest.user.name} ({selectedRequest.user.userCode})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">राशि (Amount):</span>
                <span className="font-black text-emerald-700 text-sm">₹{selectedRequest.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">UTR / Txn ID:</span>
                <span className="font-mono font-bold text-slate-800">{selectedRequest.utrNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">माध्यम:</span>
                <span className="font-bold text-slate-800">{selectedRequest.paymentMode}</span>
              </div>
            </div>

            {reviewMessage && (
              <div className={`p-3 rounded-xl text-xs font-bold ${
                reviewMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {reviewMessage.text}
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-slate-700 mb-1">
                {reviewAction === 'APPROVE'
                  ? 'स्वीकृति नोट (Optional Approval Note)'
                  : 'अस्वीकृति का कारण (Mandatory Reject Note) *'}
              </label>
              <textarea
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder={
                  reviewAction === 'APPROVE'
                    ? 'उदा. पेमेंट बैंक खाते में आ गया है, P2P वॉलेट में क्रेडिट किया गया।'
                    : 'उदा. दिया गया UTR बैंक खाते में मैच नहीं हुआ, कृपया दोबारा सही रसीद के साथ अनुरोध करें।'
                }
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#144732] bg-[#faf8f4]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedRequest(null);
                  setReviewAction(null);
                }}
                disabled={reviewLoading}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                रद्द करें (Cancel)
              </button>
              <button
                type="button"
                onClick={handleReviewSubmit}
                disabled={reviewLoading}
                className={`px-5 py-2.5 rounded-2xl text-white text-xs font-black shadow-md transition-colors cursor-pointer flex items-center gap-2 ${
                  reviewAction === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {reviewLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{reviewAction === 'APPROVE' ? 'क्रेडिट व स्वीकृत करें' : 'अस्वीकृत करें (Reject)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

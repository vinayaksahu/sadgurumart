'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  TrendingUp, 
  Wallet, 
  ShoppingBag, 
  FileCheck, 
  ShieldCheck, 
  RefreshCw, 
  Layers, 
  ArrowRight, 
  ChevronRight, 
  X, 
  Lock, 
  DollarSign, 
  Calendar, 
  Phone, 
  Mail, 
  UserCheck, 
  ExternalLink,
  Award,
  Sparkles
} from 'lucide-react';

interface MemberSummary {
  id: string;
  userCode: string;
  name: string;
  mobile: string;
  email: string | null;
  pan: string | null;
  rank: string;
  isActive: boolean;
  activatedAt: string | null;
  placementPosition: string | null;
  leftVolumePV: number;
  rightVolumePV: number;
  leftCarryForwardPV: number;
  rightCarryForwardPV: number;
  totalMatchingPaidPV: number;
  directBusinessPV: number;
  createdAt: string;
  sponsor: { userCode: string; name: string } | null;
  placementParent: { userCode: string } | null;
  wallet: {
    mainBalance: number;
    shoppingBalance: number;
    p2pBalance: number;
    totalEarned: number;
    totalWithdrawn: number;
  } | null;
  kycDetail: { status: string } | null;
  _count: {
    directReferrals: number;
    orders: number;
  };
}

export default function MembersManager() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');
  const viewParam = searchParams.get('view');
  const actionParam = searchParams.get('action');

  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>(
    statusParam === 'inactive' ? 'INACTIVE' : statusParam === 'active' ? 'ACTIVE' : 'ALL'
  );

  useEffect(() => {
    if (statusParam === 'inactive') {
      setStatusFilter('INACTIVE');
    } else if (statusParam === 'active') {
      setStatusFilter('ACTIVE');
    } else if (statusParam === 'all') {
      setStatusFilter('ALL');
    }
  }, [statusParam]);
  
  // Selected Member for Modal Deep-Dive
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [memberDetail, setMemberDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'business' | 'orders' | 'wallet'>('profile');

  // Quick Action States
  const [actionLoading, setActionLoading] = useState(false);
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activationAlert, setActivationAlert] = useState<string | null>(null);
  const [resetPwdInput, setResetPwdInput] = useState('');
  const [walletAdjInput, setWalletAdjInput] = useState('');
  const [walletAdjReason, setWalletAdjReason] = useState('');

  const fetchMembers = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/members?status=${statusFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setMembers(data.members || []);
        setMetrics(data.metrics || null);
      }
    } catch (err) {
      console.error('Fetch members error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMembers();
  };

  // Open Deep Dive Modal
  const openMemberDetail = async (id: string) => {
    setSelectedMemberId(id);
    setDetailLoading(true);
    setActiveTab('profile');
    setMessage(null);
    setResetPwdInput('');
    setWalletAdjInput('');
    setWalletAdjReason('');

    try {
      const res = await fetch(`/api/admin/members?id=${id}`);
      const data = await res.json();
      if (data.success) {
        setMemberDetail(data.member);
      }
    } catch (err) {
      console.error('Fetch member detail error:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Toggle Member Active/Inactive
  const handleToggleStatus = async () => {
    if (!memberDetail) return;
    setActionLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: memberDetail.id,
          action: 'TOGGLE_STATUS',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      
      setMessage({ type: 'success', text: data.message });
      if (!memberDetail.isActive) {
        setActivationAlert(`सदस्य ${memberDetail.name} (${memberDetail.userCode}) की आईडी सफलतापूर्वक एक्टिवेट (ACTIVE) कर दी गई है! 🎉`);
      }
      setMemberDetail((prev: any) => ({
        ...prev,
        isActive: !prev.isActive,
        activatedAt: !prev.isActive ? (prev.activatedAt || new Date().toISOString()) : null,
      }));
      fetchMembers();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPwdInput || resetPwdInput.length < 6) {
      setMessage({ type: 'error', text: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' });
      return;
    }

    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: memberDetail.id,
          action: 'RESET_PASSWORD',
          newPassword: resetPwdInput,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setMessage({ type: 'success', text: data.message });
      setResetPwdInput('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Adjust Wallet Balance
  const handleWalletAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(walletAdjInput);
    if (isNaN(amount) || amount === 0) {
      setMessage({ type: 'error', text: 'मान्य राशि दर्ज करें (+ या -)' });
      return;
    }

    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: memberDetail.id,
          action: 'ADJUST_WALLET',
          walletAdjustment: amount,
          reason: walletAdjReason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setMessage({ type: 'success', text: data.message });
      if (!memberDetail.isActive) {
        setActivationAlert(`सदस्य ${memberDetail.name} (${memberDetail.userCode}) की आईडी सफलतापूर्वक एक्टिवेट (ACTIVE) कर दी गई है! 🎉`);
      }
      setMemberDetail((prev: any) => ({
        ...prev,
        wallet: {
          ...prev.wallet,
          mainBalance: (prev.wallet?.mainBalance || 0) + amount,
        },
      }));
      setWalletAdjInput('');
      setWalletAdjReason('');
      fetchMembers();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Login as Member (Impersonate & Open Member Portal)
  const handleLoginAsMember = async (userId: string, userCode: string) => {
    try {
      setImpersonatingId(userId);
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'IMPERSONATE',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'मेंबर पोर्टल में लॉगिन विफल रहा');
      
      // Open member dashboard in a new tab
      window.open(data.redirectUrl || '/dashboard', '_blank');
    } catch (err: any) {
      alert(err.message || 'त्रुटि उत्पन्न हुई');
    } finally {
      setImpersonatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Overall Metrics */}
      <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#144732] tracking-tight">
              मेंबर्स व नेटवर्क डायरेक्टरी (Members & Business Desk)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              सभी डिस्ट्रीब्यूटर्स का लाइव डेटा: टीम स्ट्रक्चर, बाइनरी PV बिजनेस, खरीदारी व वॉलेट विवरण
            </p>
          </div>

          <button
            onClick={fetchMembers}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>रीफ्रेश करें</span>
          </button>
        </div>

        {/* 4 Quick Stat Metric Cards */}
        {metrics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="bg-[#fdfaf3] border border-[#d4a359]/30 rounded-2xl p-4">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">कुल मेंबर्स (Total IDs)</div>
              <div className="text-2xl font-black text-[#144732] mt-1">{metrics.totalMembers}</div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                {metrics.activeMembers} सक्रिय (Active) • {metrics.inactiveMembers} निष्क्रिय
              </div>
            </div>

            <div className="bg-[#fdfaf3] border border-[#d4a359]/30 rounded-2xl p-4">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">नेटवर्क PV बिजनेस</div>
              <div className="text-2xl font-black text-[#92580a] mt-1">
                {(metrics.totalNetworkLeftPV + metrics.totalNetworkRightPV).toLocaleString()} PV
              </div>
              <div className="text-[10px] text-slate-600 mt-0.5">
                L: {metrics.totalNetworkLeftPV.toLocaleString()} | R: {metrics.totalNetworkRightPV.toLocaleString()}
              </div>
            </div>

            <div className="bg-[#fdfaf3] border border-[#d4a359]/30 rounded-2xl p-4">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">मैचिंग बोनस पेड</div>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                {metrics.totalMatchingPaidPV.toLocaleString()} PV
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">1:1 बाइनरी मैचिंग क्लोजिंग</div>
            </div>

            <div className="bg-[#fdfaf3] border border-[#d4a359]/30 rounded-2xl p-4">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">कुल ऑर्डर्स</div>
              <div className="text-2xl font-black text-[#144732] mt-1">{metrics.totalOrders}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">प्रोडक्ट रिपरचेज व एक्टिवेशन</div>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#e8e3d5] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-96">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="सर्च करें: ID (SGM10001), नाम, मोबाइल या PAN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#144732]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#144732] hover:bg-[#0b2b1e] text-white font-bold text-xs rounded-xl shadow-sm shrink-0 cursor-pointer"
          >
            सर्च
          </button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 shrink-0">फ़िल्टर:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#144732] bg-[#faf8f4]"
          >
            <option value="ALL">सभी मेंबर्स (All IDs)</option>
            <option value="ACTIVE">सक्रिय मेंबर्स (Active Only)</option>
            <option value="INACTIVE">निष्क्रिय मेंबर्स (Inactive Only)</option>
          </select>
        </div>
      </div>

      {/* Members Main Table */}
      <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
          <h2 className="text-sm font-black text-[#144732]">
            मेंबर्स सूची ({members.length} परिणाम प्रदर्शित)
          </h2>
          <Link
            href="/dashboard"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-xs transition-all w-fit cursor-pointer"
            title="मेंबर पोर्टल (Dashboard) खोलें"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>मेंबर पोर्टल (Member Portal)</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#144732] animate-spin mx-auto" />
            <div className="text-xs font-bold text-slate-600">डेटाबेस से मेंबर्स लोड हो रहे हैं...</div>
          </div>
        ) : members.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-600">कोई मेंबर नहीं मिला।</div>
            <p className="text-xs text-slate-400">सर्च शब्द बदलें या फ़िल्टर रीसेट करें।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#faf8f4] text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-3">Member ID</th>
                  <th className="py-3 px-3">Name & Mobile</th>
                  <th className="py-3 px-3">Status / Rank</th>
                  <th className="py-3 px-3">Sponsor</th>
                  <th className="py-3 px-3 text-center">Team (Dir)</th>
                  <th className="py-3 px-3 text-right">Business PV (L : R)</th>
                  <th className="py-3 px-3 text-right">Wallet (₹)</th>
                  <th className="py-3 px-3 text-center">Orders</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-black text-[#144732] flex items-center gap-1 font-mono">
                        <span>{m.userCode}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(m.createdAt).toLocaleDateString('hi-IN')}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900">{m.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{m.mobile}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        m.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {m.isActive ? '● ACTIVE' : '○ INACTIVE'}
                      </span>
                      <div className="text-[10px] font-bold text-[#92580a] mt-0.5 uppercase">
                        {m.rank.replace('_', ' ')}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      {m.sponsor ? (
                        <div>
                          <div className="font-bold text-slate-800">{m.sponsor.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{m.sponsor.userCode}</div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">रूट मेंबर</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <div className="font-black text-slate-800">{m._count.directReferrals}</div>
                      <div className="text-[9px] text-slate-400">डायरेक्ट टीम</div>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="font-mono font-bold text-[#92580a]">
                        {m.leftVolumePV} : {m.rightVolumePV}
                      </div>
                      <div className="text-[9px] text-slate-400">
                        Paid: {m.totalMatchingPaidPV} PV
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono">
                      <div className="font-black text-emerald-800">
                        ₹{m.wallet?.mainBalance?.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-[9px] text-slate-400">
                        कुल: ₹{m.wallet?.totalEarned?.toFixed(2) || '0.00'}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 font-bold text-slate-700 text-xs">
                        {m._count.orders}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openMemberDetail(m.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-[#144732] hover:bg-[#0b2b1e] text-[#fef08a] font-black text-xs shadow-sm transition-all flex items-center gap-1 cursor-pointer shrink-0"
                          title="पूरा विवरण व टीम देखें"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>विवरण</span>
                        </button>
                        <button
                          onClick={() => handleLoginAsMember(m.id, m.userCode)}
                          disabled={impersonatingId === m.id}
                          className="px-2.5 py-1.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1 cursor-pointer shrink-0"
                          title={`${m.name} (${m.userCode}) के मेंबर पोर्टल में लॉगिन करें`}
                        >
                          {impersonatingId === m.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <ExternalLink className="w-3.5 h-3.5" />
                          )}
                          <span>पोर्टल</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MEMBER DEEP-DIVE MODAL */}
      {selectedMemberId && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-6">
          <div 
            className="fixed inset-0 bg-black/65 backdrop-blur-sm"
            onClick={() => setSelectedMemberId(null)}
          />

          <div className="relative bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl z-10 max-h-[92vh] flex flex-col justify-between overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {detailLoading || !memberDetail ? (
              <div className="py-24 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-[#144732] animate-spin mx-auto" />
                <div className="text-xs font-bold text-slate-600">मेंबर की संपूर्ण जानकारी लोड हो रही है...</div>
              </div>
            ) : (
              <div className="overflow-y-auto space-y-6 pr-1">
                {/* Modal Top Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#144732] text-[#fef08a] font-black text-lg flex items-center justify-center shadow-md">
                      {memberDetail.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black text-[#144732]">
                          {memberDetail.name}
                        </h2>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          memberDetail.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {memberDetail.isActive ? 'ACTIVE ID' : 'INACTIVE'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        Member ID: <strong className="text-[#92580a]">{memberDetail.userCode}</strong> • Rank: <span className="uppercase font-bold text-[#144732]">{memberDetail.rank.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLoginAsMember(memberDetail.id, memberDetail.userCode)}
                      disabled={impersonatingId === memberDetail.id}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                      title={`${memberDetail.name} (${memberDetail.userCode}) के मेंबर पोर्टल में लॉगिन करें`}
                    >
                      {impersonatingId === memberDetail.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ExternalLink className="w-3.5 h-3.5" />
                      )}
                      <span>मेंबर पोर्टल खोलें</span>
                    </button>

                    <button
                      onClick={() => setSelectedMemberId(null)}
                      className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Status Message Banner if any action occurred */}
                {message && (
                  <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold ${
                    message.type === 'success' 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <span>{message.text}</span>
                    <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* 5 Navigation Tabs inside Modal */}
                <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                      activeTab === 'profile'
                        ? 'bg-[#144732] text-[#fef08a] shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    👤 प्रोफ़ाइल व सेटिंग्स
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('team')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                      activeTab === 'team'
                        ? 'bg-[#144732] text-[#fef08a] shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    👥 टीम व डाउनलाइन ({memberDetail.directReferrals?.length || 0})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('business')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                      activeTab === 'business'
                        ? 'bg-[#144732] text-[#fef08a] shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    📈 बाइनरी PV बिजनेस
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                      activeTab === 'orders'
                        ? 'bg-[#144732] text-[#fef08a] shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    📦 खरीदारी ऑर्डर्स ({memberDetail.orders?.length || 0})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('wallet')}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                      activeTab === 'wallet'
                        ? 'bg-[#144732] text-[#fef08a] shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    💳 वॉलेट व लेजर
                  </button>
                </div>

                {/* TAB 1: PROFILE & SETTINGS */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-[#faf8f4] border border-[#e8e3d5] rounded-2xl p-4 space-y-2 text-xs">
                        <div className="font-black text-[#144732] pb-1 border-b border-slate-200">
                          संपर्क एवं व्यक्तिगत जानकारी
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">मोबाइल नंबर:</span>
                          <span className="font-bold text-slate-800">{memberDetail.mobile}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">ईमेल:</span>
                          <span className="font-bold text-slate-800">{memberDetail.email || 'उपलब्ध नहीं'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">पैन नंबर:</span>
                          <span className="font-mono font-bold text-slate-800">{memberDetail.pan || 'उपलब्ध नहीं'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">पंजीकरण तिथि:</span>
                          <span className="font-bold text-slate-800">{new Date(memberDetail.createdAt).toLocaleString('hi-IN')}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">एक्टिवेशन तिथि:</span>
                          <span className="font-bold text-emerald-800">
                            {memberDetail.activatedAt ? new Date(memberDetail.activatedAt).toLocaleString('hi-IN') : 'अभी तक एक्टिवेट नहीं'}
                          </span>
                        </div>
                      </div>

                      <div className="bg-[#faf8f4] border border-[#e8e3d5] rounded-2xl p-4 space-y-2 text-xs">
                        <div className="font-black text-[#144732] pb-1 border-b border-slate-200">
                          स्पॉन्सर एवं बाइनरी प्लेसमेंट
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">स्पॉन्सर आईडी:</span>
                          <span className="font-bold text-[#144732]">{memberDetail.sponsor?.userCode || 'SGM Mart Root'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">स्पॉन्सर का नाम:</span>
                          <span className="font-bold text-slate-800">{memberDetail.sponsor?.name || 'कंपनी मास्टर'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">प्लेसमेंट पैरेंट:</span>
                          <span className="font-bold text-slate-800">{memberDetail.placementParent?.userCode || 'Root'}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">बाइनरी पोजीशन:</span>
                          <span className="font-bold text-[#92580a]">
                            {memberDetail.placementPosition ? `${memberDetail.placementPosition} Leg` : 'Root ID'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Admin Actions Box */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                      <div className="text-xs font-black text-[#144732] uppercase tracking-wider">
                        एडमिन त्वरित एक्शन (Administrative Controls)
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Toggle Status */}
                        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                          <div className="text-xs font-bold text-slate-700">आईडी स्थिति बदलें</div>
                          <p className="text-[11px] text-slate-500">
                            आईडी को एक्टिव या इनएक्टिव करें।
                          </p>
                          <button
                            type="button"
                            onClick={handleToggleStatus}
                            disabled={actionLoading}
                            className={`w-full py-2 px-3 rounded-lg text-xs font-black transition-colors cursor-pointer ${
                              memberDetail.isActive
                                ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                          >
                            {memberDetail.isActive ? 'आईडी निष्क्रिय करें (Deactivate)' : 'आईडी सक्रिय करें (Activate)'}
                          </button>
                        </div>

                        {/* Reset Password Form */}
                        <form onSubmit={handleResetPassword} className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                          <div className="text-xs font-bold text-slate-700">पासवर्ड रीसेट करें</div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="नया पासवर्ड (उदा. 123456)"
                              value={resetPwdInput}
                              onChange={(e) => setResetPwdInput(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono"
                            />
                            <button
                              type="submit"
                              disabled={actionLoading || !resetPwdInput}
                              className="px-3 py-1.5 bg-[#144732] hover:bg-[#0b2b1e] text-white text-xs font-bold rounded-lg cursor-pointer shrink-0 disabled:opacity-50"
                            >
                              सेव
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: TEAM & DIRECT REFERRALS */}
                {activeTab === 'team' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#faf8f4] border border-[#d4a359]/30 rounded-2xl">
                      <div>
                        <div className="text-xs font-black text-[#144732]">
                          डायरेक्ट स्पॉन्सर टीम ({memberDetail.directReferrals?.length || 0} मेंबर्स)
                        </div>
                        <p className="text-[11px] text-slate-500">
                          इस मेंबर द्वारा सीधे जोड़े गए डिस्ट्रीब्यूटर्स
                        </p>
                      </div>

                      <Link
                        href={`/admin/genealogy?userCode=${memberDetail.userCode}`}
                        className="px-4 py-2 rounded-xl bg-[#144732] hover:bg-[#0b2b1e] text-[#fef08a] text-xs font-black flex items-center gap-1.5 shadow-sm transition-all shrink-0"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>बाइनरी ट्री में देखें &rarr;</span>
                      </Link>
                    </div>

                    {memberDetail.directReferrals && memberDetail.directReferrals.length > 0 ? (
                      <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                            <tr>
                              <th className="py-2.5 px-3">Member ID</th>
                              <th className="py-2.5 px-3">Name</th>
                              <th className="py-2.5 px-3">Mobile</th>
                              <th className="py-2.5 px-3">Position</th>
                              <th className="py-2.5 px-3">Status</th>
                              <th className="py-2.5 px-3">Business (L:R)</th>
                              <th className="py-2.5 px-3">Joining Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {memberDetail.directReferrals.map((sub: any) => (
                              <tr key={sub.id} className="hover:bg-slate-50">
                                <td className="py-2.5 px-3 font-mono font-bold text-[#144732]">{sub.userCode}</td>
                                <td className="py-2.5 px-3 font-bold text-slate-800">{sub.name}</td>
                                <td className="py-2.5 px-3 font-mono text-slate-500">{sub.mobile}</td>
                                <td className="py-2.5 px-3">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                    {sub.placementPosition || 'N/A'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                    sub.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {sub.isActive ? 'ACTIVE' : 'INACTIVE'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 font-mono text-slate-600">
                                  {sub.leftVolumePV} : {sub.rightVolumePV}
                                </td>
                                <td className="py-2.5 px-3 text-slate-400">
                                  {new Date(sub.createdAt).toLocaleDateString('hi-IN')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="py-10 text-center text-slate-400 text-xs">
                        इस मेंबर का अभी कोई डायरेक्ट स्पॉन्सर मेंबर नहीं है।
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: BUSINESS & PV METRICS */}
                {activeTab === 'business' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                        <div className="text-[10px] font-black uppercase tracking-wider text-emerald-800">Left Total PV</div>
                        <div className="text-2xl font-black text-emerald-900 mt-1">{memberDetail.leftVolumePV}</div>
                        <div className="text-[10px] text-emerald-700 mt-0.5">बायाँ लेग वॉल्यूम</div>
                      </div>

                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                        <div className="text-[10px] font-black uppercase tracking-wider text-emerald-800">Right Total PV</div>
                        <div className="text-2xl font-black text-emerald-900 mt-1">{memberDetail.rightVolumePV}</div>
                        <div className="text-[10px] text-emerald-700 mt-0.5">दायाँ लेग वॉल्यूम</div>
                      </div>

                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center">
                        <div className="text-[10px] font-black uppercase tracking-wider text-amber-800">Left Carry Forward</div>
                        <div className="text-2xl font-black text-amber-900 mt-1">{memberDetail.leftCarryForwardPV}</div>
                        <div className="text-[10px] text-amber-700 mt-0.5">अगले दिन हेतु शेष</div>
                      </div>

                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center">
                        <div className="text-[10px] font-black uppercase tracking-wider text-amber-800">Right Carry Forward</div>
                        <div className="text-2xl font-black text-amber-900 mt-1">{memberDetail.rightCarryForwardPV}</div>
                        <div className="text-[10px] text-amber-700 mt-0.5">अगले दिन हेतु शेष</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                        <div className="text-xs text-slate-500 font-bold">कुल मैचिंग बोनस पेड:</div>
                        <div className="text-xl font-black text-[#144732] mt-1">{memberDetail.totalMatchingPaidPV} PV</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">1:1 मैचिंग अनुपात अनुसार</div>
                      </div>

                      <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                        <div className="text-xs text-slate-500 font-bold">डायरेक्ट बिजनेस PV:</div>
                        <div className="text-xl font-black text-[#92580a] mt-1">{memberDetail.directBusinessPV} PV</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">3000 PV व 5000 PV सीटीओ हेतु</div>
                      </div>

                      <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                        <div className="text-xs text-slate-500 font-bold">रिवार्ड पॉइंट्स (RP):</div>
                        <div className="text-xl font-black text-purple-700 mt-1">{memberDetail.rewardPointsRP} RP</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">16 प्रकार की रिवार्ड्स प्रगति</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: ORDERS & PURCHASES */}
                {activeTab === 'orders' && (
                  <div className="space-y-4">
                    <div className="text-xs font-black text-[#144732]">
                      खरीदारी व ऑर्डर इतिहास ({memberDetail.orders?.length || 0} ऑर्डर्स)
                    </div>

                    {memberDetail.orders && memberDetail.orders.length > 0 ? (
                      <div className="space-y-3">
                        {memberDetail.orders.map((ord: any) => (
                          <div key={ord.id} className="p-4 bg-[#faf8f4] border border-[#e8e3d5] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-[#144732] font-mono">{ord.orderNumber}</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  {ord.orderStatus}
                                </span>
                                {ord.isActivation && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                    एक्टिवेशन पैकेज
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-1">
                                दिनांक: {new Date(ord.createdAt).toLocaleString('hi-IN')}
                              </div>
                              <div className="text-slate-700 font-medium mt-1">
                                {ord.items?.map((it: any) => `${it.product?.title || 'Product'} (x${it.quantity})`).join(', ')}
                              </div>
                            </div>

                            <div className="text-right sm:border-l sm:pl-4 border-slate-200 shrink-0">
                              <div className="text-sm font-black text-slate-900">₹{ord.totalDp}</div>
                              <div className="text-[11px] font-bold text-[#92580a]">
                                +{ord.totalPV} PV | +{ord.totalBV} BV
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-slate-400 text-xs">
                        इस मेंबर ने अभी तक कोई ऑनलाइन ऑर्डर नहीं किया है।
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 5: WALLET & ADJUSTMENTS */}
                {activeTab === 'wallet' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-4 bg-[#fdfaf3] border border-[#d4a359]/30 rounded-2xl">
                        <div className="text-[10px] text-slate-500 font-bold uppercase">मेन वॉलेट (विड्रॉल)</div>
                        <div className="text-xl font-black text-emerald-800 mt-1">
                          ₹{memberDetail.wallet?.mainBalance?.toFixed(2) || '0.00'}
                        </div>
                      </div>

                      <div className="p-4 bg-[#fdfaf3] border border-[#d4a359]/30 rounded-2xl">
                        <div className="text-[10px] text-slate-500 font-bold uppercase">शॉपिंग वॉलेट</div>
                        <div className="text-xl font-black text-[#92580a] mt-1">
                          ₹{memberDetail.wallet?.shoppingBalance?.toFixed(2) || '0.00'}
                        </div>
                      </div>

                      <div className="p-4 bg-[#fdfaf3] border border-[#d4a359]/30 rounded-2xl">
                        <div className="text-[10px] text-slate-500 font-bold uppercase">P2P ट्रांसफर वॉलेट</div>
                        <div className="text-xl font-black text-[#144732] mt-1">
                          ₹{memberDetail.wallet?.p2pBalance?.toFixed(2) || '0.00'}
                        </div>
                      </div>

                      <div className="p-4 bg-[#fdfaf3] border border-[#d4a359]/30 rounded-2xl">
                        <div className="text-[10px] text-slate-500 font-bold uppercase">कुल लाइफटाइम इनकम</div>
                        <div className="text-xl font-black text-purple-700 mt-1">
                          ₹{memberDetail.wallet?.totalEarned?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                    </div>

                    {/* Admin Wallet Adjustment Form */}
                    <form onSubmit={handleWalletAdjust} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                      <div className="text-xs font-black text-[#144732]">
                        वॉलेट बैलेंस समायोजन (Admin Credit / Debit Adjustment)
                      </div>
                      <p className="text-[11px] text-slate-500">
                        अकाउंट में राशि जोड़ने हेतु धनात्मक (उदा. 500) या घटाने हेतु ऋणात्मक (उदा. -200) दर्ज करें।
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="राशि ₹ (उदा. 500 या -200)"
                          value={walletAdjInput}
                          onChange={(e) => setWalletAdjInput(e.target.value)}
                          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                          required
                        />

                        <input
                          type="text"
                          placeholder="कारण (उदा. रिवार्ड बोनस / सुधार)"
                          value={walletAdjReason}
                          onChange={(e) => setWalletAdjReason(e.target.value)}
                          className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                        />

                        <button
                          type="submit"
                          disabled={actionLoading || !walletAdjInput}
                          className="px-4 py-2 bg-[#144732] hover:bg-[#0b2b1e] text-white font-bold text-xs rounded-xl shadow cursor-pointer disabled:opacity-50"
                        >
                          समायोजन लागू करें (Apply)
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Modal Bottom Close */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedMemberId(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                बंद करें (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Successfully Activated Modal Popup for Admin */}
      {activationAlert && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border-2 border-emerald-500 text-center relative animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 border-2 border-emerald-500 shadow-md">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-black uppercase tracking-wider border border-emerald-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>आईडी एक्टिवेशन सफल</span>
            </div>
            <h3 className="text-xl font-black text-[#144732] mb-2">
              Successfully Activated!
            </h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              {activationAlert}
            </p>
            <button
              onClick={() => setActivationAlert(null)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#144732] to-[#0b2b1e] hover:opacity-95 text-white font-black text-xs uppercase tracking-wider shadow-md cursor-pointer transition-all"
            >
              ठीक है (Close)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

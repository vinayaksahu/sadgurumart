'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import MemberNavbar from '@/components/MemberNavbar';
import {
  Users,
  UserCheck,
  UserX,
  Search,
  Copy,
  Check,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Share2,
  RefreshCw,
  GitFork,
  Award,
  Calendar,
  Layers
} from 'lucide-react';

interface DirectMember {
  id: string;
  userCode: string;
  name: string;
  mobile: string;
  rank: string;
  isActive: boolean;
  activatedAt: string | null;
  placementPosition: 'LEFT' | 'RIGHT' | null;
  personalPV?: number;
  leftVolumePV: number;
  rightVolumePV: number;
  createdAt: string;
  kycStatus: string;
}

interface Summary {
  total: number;
  active: number;
  inactive: number;
  leftLeg: number;
  rightLeg: number;
  directPV: number;
}

export default function DirectTeamPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [directs, setDirects] = useState<DirectMember[]>([]);
  const [summary, setSummary] = useState<Summary>({
    total: 0,
    active: 0,
    inactive: 0,
    leftLeg: 0,
    rightLeg: 0,
    directPV: 0,
  });
  const [user, setUser] = useState<{ userCode: string; name: string } | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [legFilter, setLegFilter] = useState<'ALL' | 'LEFT' | 'RIGHT'>('ALL');
  const [copied, setCopied] = useState(false);

  const fetchDirectTeam = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/team/direct');
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load direct team');
      setDirects(data.directs || []);
      setSummary(data.summary || {
        total: 0,
        active: 0,
        inactive: 0,
        leftLeg: 0,
        rightLeg: 0,
        directPV: 0,
      });
      setUser(data.user || null);
    } catch (err: any) {
      setError(err.message || 'Error fetching direct team data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectTeam();
  }, []);

  const referralLink = typeof window !== 'undefined' && user?.userCode
    ? `${window.location.origin}/register?ref=${encodeURIComponent(user.userCode)}`
    : '';

  const copyReferralLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredDirects = directs.filter((member) => {
    const matchesSearch =
      member.userCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.mobile.includes(searchTerm);

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && member.isActive) ||
      (statusFilter === 'INACTIVE' && !member.isActive);

    const matchesLeg =
      legFilter === 'ALL' || member.placementPosition === legFilter;

    return matchesSearch && matchesStatus && matchesLeg;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MemberNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/dashboard" className="hover:text-[#144732] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Team</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[#144732] font-bold">Direct Team</span>
        </div>

        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-[#0b2b1e] via-[#144732] to-[#0b2b1e] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#d4a359]/30 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#fef08a] text-xs font-bold uppercase tracking-wider mb-3 border border-white/10">
                <Users className="w-3.5 h-3.5" />
                Team Network • Direct Sponsors
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Direct Team (डायरेक्ट टीम)
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-xl">
                आपके द्वारा सीधे स्पॉन्सर किए गए सभी सदस्यों की सूची, उनकी एक्टिवेशन स्थिति एवं बिजनेस परफॉर्मेंस।
              </p>
            </div>

            {/* Quick Refresh & Referral Link */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={fetchDirectTeam}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-2 border border-white/20 transition-all cursor-pointer active:scale-95"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              <button
                onClick={copyReferralLink}
                className="px-4 py-2.5 rounded-xl bg-[#d4a359] hover:bg-[#c39248] text-[#0b2b1e] text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Link Copied!' : 'Copy Referral Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Direct (कुल डायरेक्ट)
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {summary.total}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                सक्रिय व असक्रिय सदस्य
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Active Direct (सक्रिय)
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
                {summary.active}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                ग्रीन आईडी (Activated)
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                Inactive Direct (असक्रिय)
              </div>
              <div className="text-2xl sm:text-3xl font-black text-rose-600 mt-1">
                {summary.inactive}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                रेड आईडी (Pending)
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <UserX className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#144732] uppercase tracking-wider">
                Placement Ratio
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#144732] mt-1">
                {summary.leftLeg} : {summary.rightLeg}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                Left : Right Leg Directs
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <GitFork className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Member ID, Name..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#144732]/20 focus:border-[#144732] font-medium"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({summary.total})
              </button>
              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === 'ACTIVE'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-700 hover:text-emerald-800'
                }`}
              >
                Active ({summary.active})
              </button>
              <button
                onClick={() => setStatusFilter('INACTIVE')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === 'INACTIVE'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-rose-700 hover:text-rose-800'
                }`}
              >
                Inactive ({summary.inactive})
              </button>
            </div>

            {/* Leg Filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setLegFilter('ALL')}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                  legFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Both Legs
              </button>
              <button
                onClick={() => setLegFilter('LEFT')}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                  legFilter === 'LEFT'
                    ? 'bg-[#144732] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Left ({summary.leftLeg})
              </button>
              <button
                onClick={() => setLegFilter('RIGHT')}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                  legFilter === 'RIGHT'
                    ? 'bg-[#144732] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Right ({summary.rightLeg})
              </button>
            </div>
          </div>
        </div>

        {/* Direct Team Members Table / Card View */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 text-[#144732] animate-spin mx-auto mb-3" />
              <div className="text-sm font-bold text-slate-700">Loading Direct Team...</div>
              <div className="text-xs text-slate-400 mt-1">डायरेक्ट टीम डेटा लोड हो रहा है...</div>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-rose-600">
              <div className="font-bold text-sm">{error}</div>
              <button
                onClick={fetchDirectTeam}
                className="mt-3 px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100"
              >
                Retry
              </button>
            </div>
          ) : filteredDirects.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-slate-800">
                {directs.length === 0
                  ? 'No Direct Members Found (अभी तक कोई डायरेक्ट मेंबर नहीं है)'
                  : 'No Matching Members Found'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                {directs.length === 0
                  ? 'अपना रेफरल लिंक शेयर करें और नए सदस्यों को सीधे अपने नेटवर्क में जोड़ें।'
                  : 'फ़िल्टर अथवा सर्च क्वेरी बदलकर पुनः प्रयास करें।'}
              </p>
              {referralLink && (
                <div className="mt-4">
                  <button
                    onClick={copyReferralLink}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#144732] text-white font-bold text-xs hover:bg-[#0b2b1e] transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Copy Your Referral Link</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Member ID & Name</th>
                    <th className="py-3 px-4">Placement Leg</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Joining Date</th>
                    <th className="py-3 px-4">Activation Date</th>
                    <th className="py-3 px-4 text-right">Volume (L/R)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDirects.map((member, idx) => (
                    <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                              member.isActive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                          </div>
                          <div>
                            <div className="font-black text-slate-900 text-sm">
                              {member.name}
                            </div>
                            <div className="font-mono text-[11px] font-bold text-[#144732]">
                              {member.userCode}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            member.placementPosition === 'LEFT'
                              ? 'bg-blue-100 text-blue-800'
                              : member.placementPosition === 'RIGHT'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {member.placementPosition || 'Auto'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            member.isActive
                              ? 'bg-emerald-500 text-white shadow-xs'
                              : 'bg-rose-500 text-white shadow-xs'
                          }`}
                        >
                          {member.isActive ? (
                            <>
                              <Check className="w-3 h-3" />
                              Active
                            </>
                          ) : (
                            'Inactive'
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {new Date(member.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {member.activatedAt
                          ? new Date(member.activatedAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-mono font-bold text-[#144732]">
                          {member.leftVolumePV} / {member.rightVolumePV} PV
                        </div>
                        {member.personalPV !== undefined && member.personalPV > 0 && (
                          <div className="text-[10px] text-amber-700 font-bold">
                            Pkg: {member.personalPV} PV
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

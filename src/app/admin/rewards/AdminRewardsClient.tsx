'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Award,
  Users,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  ExternalLink,
  CheckCircle2,
  Lock,
  ChevronRight,
  ShieldCheck,
  Gift,
  AlertCircle
} from 'lucide-react';
import { RankDefinition, LifestyleFundDefinition } from '@/lib/mlm/rankData';

interface AdminMemberRow {
  id: string;
  userCode: string;
  name: string;
  mobile: string;
  isActive: boolean;
  createdAt: string;
  rank: string;
  rankDef: RankDefinition | null;
  leftRP: number;
  rightRP: number;
  matchedRP: number;
}

interface AdminRewardsClientProps {
  initialStats: {
    totalDistributors: number;
    totalAchievers: number;
    starClubCount: number;
    leadershipClubCount: number;
    crorepatiClubCount: number;
  };
  initialRankCounts: Record<string, number>;
  ranks: RankDefinition[];
  lifestyleFunds: LifestyleFundDefinition[];
  initialUsers: AdminMemberRow[];
}

export default function AdminRewardsClient({
  initialStats,
  initialRankCounts,
  ranks,
  lifestyleFunds,
  initialUsers,
}: AdminRewardsClientProps) {
  const [stats, setStats] = useState(initialStats);
  const [rankCounts, setRankCounts] = useState(initialRankCounts);
  const [users, setUsers] = useState<AdminMemberRow[]>(initialUsers);
  const [activeTab, setActiveTab] = useState<'ALL' | 'STAR' | 'LEADERSHIP' | 'CROREPATI' | 'FUNDS'>('ALL');
  const [selectedRank, setSelectedRank] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newRankSelection, setNewRankSelection] = useState<string>('');
  const [updatingRank, setUpdatingRank] = useState(false);

  // Recalculate all members' ranks from DB
  const handleRecalculateAll = async () => {
    if (!confirm('क्या आप सभी मेंबर्स के बाइनरी मैचिंग RP की गणना कर रैंक अपडेट करना चाहते हैं?')) return;
    setSyncing(true);
    setSyncMessage('');
    try {
      const res = await fetch('/api/admin/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'recalculate_all' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to recalculate ranks');
      setSyncMessage(data.message || 'सभी रैंक सफलतापूर्वक सिंक हो गए हैं।');
      // Refresh page data
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Error recalculating ranks');
    } finally {
      setSyncing(false);
    }
  };

  // Update a single user's rank
  const handleUpdateUserRank = async (userId: string) => {
    if (!newRankSelection) return;
    setUpdatingRank(true);
    try {
      const res = await fetch('/api/admin/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_user_rank',
          userId,
          rank: newRankSelection,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update rank');
      
      // Update local state
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === userId) {
            const def = ranks.find((r) => r.id === newRankSelection) || null;
            return { ...u, rank: newRankSelection, rankDef: def };
          }
          return u;
        })
      );
      setEditingUserId(null);
      setNewRankSelection('');
      alert(data.message || 'Rank updated successfully');
    } catch (err: any) {
      alert(err.message || 'Error updating rank');
    } finally {
      setUpdatingRank(false);
    }
  };

  // Filter users based on search, club, and rank dropdown
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.userCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.mobile.includes(searchTerm);

    if (!matchesSearch) return false;

    if (selectedRank !== 'ALL') {
      return u.rank === selectedRank;
    }

    if (activeTab === 'STAR') {
      return u.rankDef && u.rankDef.club === 'STAR';
    }
    if (activeTab === 'LEADERSHIP') {
      return u.rankDef && u.rankDef.club === 'LEADERSHIP';
    }
    if (activeTab === 'CROREPATI') {
      return u.rankDef && u.rankDef.club === 'CROREPATI';
    }

    return true;
  });

  return (
    <div className="space-y-8">
      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border-2 border-[#144732]/20 rounded-3xl p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Total Achievers
          </div>
          <div className="text-3xl font-black text-[#144732]">
            {stats.totalAchievers}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            रैंक प्राप्त लीडर्स (Star 1+)
          </div>
        </div>

        <div className="bg-white border-2 border-emerald-200 rounded-3xl p-5 shadow-sm">
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
            ⭐ Star Club (1-5)
          </div>
          <div className="text-3xl font-black text-emerald-700">
            {stats.starClubCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            30 RP से 5,000 RP अचीवर्स
          </div>
        </div>

        <div className="bg-white border-2 border-amber-200 rounded-3xl p-5 shadow-sm">
          <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
            🏆 Leadership Club (6-10)
          </div>
          <div className="text-3xl font-black text-amber-700">
            {stats.leadershipClubCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            10K RP से 5 Lakh RP अचीवर्स
          </div>
        </div>

        <div className="bg-white border-2 border-purple-200 rounded-3xl p-5 shadow-sm">
          <div className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-1">
            👑 Crorepati Club (11-15)
          </div>
          <div className="text-3xl font-black text-purple-700">
            {stats.crorepatiClubCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            10 Lakh से 2 Crore RP
          </div>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              All Members
            </div>
            <div className="text-3xl font-black text-slate-800">
              {stats.totalDistributors}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            कुल पंजीकृत डायरेक्ट सेलर्स
          </div>
        </div>
      </div>

      {/* Sync Banner & Action Controls */}
      <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-[#144732] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#92580a]" />
            <span>रैंक एवं लाइफस्टाइल रिवार्ड्स कंट्रोल डेस्क</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            1:1 बाइनरी RP मैचिंग आधार पर वास्तविक समय रैंक पदनाम व सम्मान सूची
          </p>
          {syncMessage && (
            <div className="text-xs font-bold text-emerald-700 mt-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 inline-block">
              ✓ {syncMessage}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleRecalculateAll}
            disabled={syncing}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#144732] hover:bg-[#0b2b1e] text-[#fef08a] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'सिंक हो रहा है...' : '🔄 Recalculate & Sync All Ranks'}</span>
          </button>
        </div>
      </div>

      {/* 15 Ranks Matrix Overview Accordion/Grid */}
      <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="font-black text-base text-[#144732] flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#92580a]" />
              <span>15 रैंक पदनाम व आवश्यक मैचिंग मैट्रिक्स (15 Ranks Matrix)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              प्रत्येक रैंक हेतु आवश्यक RP एवं वर्तमान क्वालिफाइड मेंबर्स की संख्या
            </p>
          </div>
          <span className="text-xs font-black text-[#92580a] bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            3% Lifestyle Reward Pool
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {ranks.map((r) => {
            const count = rankCounts[r.id] || 0;
            const isSelected = selectedRank === r.id;

            return (
              <button
                key={r.id}
                onClick={() => {
                  setSelectedRank(isSelected ? 'ALL' : r.id);
                  if (activeTab === 'FUNDS') setActiveTab('ALL');
                }}
                className={`text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#144732] bg-emerald-50 shadow-md ring-2 ring-[#144732]/20'
                    : count > 0
                    ? 'border-emerald-200 bg-white hover:border-emerald-400 shadow-xs'
                    : 'border-slate-200 bg-slate-50/70 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-[10px] font-mono font-black px-1.5 py-0.5 bg-slate-800 text-white rounded">
                    #{String(r.level).padStart(2, '0')}
                  </span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      count > 0 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count} {count === 1 ? 'Leader' : 'Leaders'}
                  </span>
                </div>

                <div className="font-black text-sm text-slate-900 truncate flex items-center gap-1.5">
                  <span>{r.iconEmoji}</span>
                  <span className="truncate">{r.hindiName}</span>
                </div>

                <div className="text-[11px] font-bold text-slate-600 mt-1">
                  {r.requiredRP.toLocaleString('en-IN')} RP (1:1)
                </div>

                <div className="text-[10px] text-[#92580a] font-black truncate mt-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                  {r.rewardHindi}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs & Search Filter for Achievers Table */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Club Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => {
              setActiveTab('ALL');
              setSelectedRank('ALL');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'ALL' && selectedRank === 'ALL'
                ? 'bg-[#144732] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Achievers
          </button>

          <button
            onClick={() => {
              setActiveTab('STAR');
              setSelectedRank('ALL');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'STAR'
                ? 'bg-[#144732] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            ⭐ Star Club (1-5)
          </button>

          <button
            onClick={() => {
              setActiveTab('LEADERSHIP');
              setSelectedRank('ALL');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'LEADERSHIP'
                ? 'bg-[#144732] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            🏆 Leadership Club (6-10)
          </button>

          <button
            onClick={() => {
              setActiveTab('CROREPATI');
              setSelectedRank('ALL');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'CROREPATI'
                ? 'bg-[#144732] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            👑 Crorepati Club (11-15)
          </button>

          <button
            onClick={() => {
              setActiveTab('FUNDS');
              setSelectedRank('ALL');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'FUNDS'
                ? 'bg-[#92580a] text-white shadow-sm'
                : 'bg-white text-[#92580a] hover:bg-amber-50 border border-amber-200'
            }`}
          >
            💎 4 Lifestyle Funds (2% CTO)
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Member ID / Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#144732] focus:ring-1 focus:ring-[#144732]"
          />
        </div>
      </div>

      {/* 4 Lifestyle Royalty Funds View */}
      {activeTab === 'FUNDS' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lifestyleFunds.map((fund) => (
              <div
                key={fund.id}
                className={`p-6 sm:p-8 rounded-3xl border-2 shadow-sm ${fund.colorClass}`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-3xl">
                      {fund.icon}
                    </div>
                    <div>
                      <h3 className="font-black text-xl text-slate-900">
                        {fund.hindiName}
                      </h3>
                      <div className="text-xs font-bold text-slate-500">
                        {fund.name}
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl bg-[#144732] text-[#fef08a] font-black text-xs shadow-xs">
                    {fund.percentageCTO}% CTO Pool
                  </span>
                </div>

                <p className="text-xs text-slate-700 font-medium leading-relaxed mb-4">
                  {fund.descriptionHindi}
                </p>

                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                  <span>कंपनी टर्नओवर पूल</span>
                  <span className="font-bold text-[#144732]">मासिक ऑटो-क्रेडिट</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Members Table */
        <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="font-black text-base text-[#144732]">
                मेंबर्स रैंक सूची ({filteredUsers.length} Leaders)
              </h3>
              <p className="text-xs text-slate-500">
                {selectedRank !== 'ALL'
                  ? `Filtered by Rank: ${selectedRank}`
                  : activeTab !== 'ALL'
                  ? `Filtered by Club: ${activeTab}`
                  : 'All Registered Members with Live RP'}
              </p>
            </div>

            {selectedRank !== 'ALL' && (
              <button
                onClick={() => setSelectedRank('ALL')}
                className="text-xs font-bold text-[#144732] hover:underline cursor-pointer"
              >
                Clear Rank Filter ✕
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#faf8f4] text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Rank Designation</th>
                  <th className="py-3 px-4">Left RP</th>
                  <th className="py-3 px-4">Right RP</th>
                  <th className="py-3 px-4">Matched RP</th>
                  <th className="py-3 px-4">Eligible Reward</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      कोई मेंबर नहीं मिला (No leaders matching filter)
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isEditing = editingUserId === u.id;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-black text-[#144732] font-mono">{u.userCode}</div>
                          <div className="font-bold text-slate-800">{u.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{u.mobile}</div>
                        </td>

                        <td className="py-3 px-4">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5">
                              <select
                                value={newRankSelection || u.rank}
                                onChange={(e) => setNewRankSelection(e.target.value)}
                                className="border border-slate-300 rounded px-2 py-1 text-xs font-bold"
                              >
                                <option value="DISTRIBUTOR">DISTRIBUTOR (0 RP)</option>
                                {ranks.map((r) => (
                                  <option key={r.id} value={r.id}>
                                    {r.level}. {r.hindiName} ({r.name})
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleUpdateUserRank(u.id)}
                                disabled={updatingRank}
                                className="px-2 py-1 bg-emerald-600 text-white font-bold rounded text-[10px]"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingUserId(null)}
                                className="px-2 py-1 bg-slate-200 text-slate-700 font-bold rounded text-[10px]"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                                  u.rankDef
                                    ? u.rankDef.badgeColor
                                    : 'bg-slate-100 text-slate-700 border-slate-300'
                                }`}
                              >
                                {u.rankDef ? `${u.rankDef.iconEmoji} ${u.rankDef.hindiName}` : 'DISTRIBUTOR'}
                              </span>
                              <button
                                onClick={() => {
                                  setEditingUserId(u.id);
                                  setNewRankSelection(u.rank);
                                }}
                                className="text-[10px] text-slate-400 hover:text-slate-800 underline cursor-pointer"
                                title="Edit Rank"
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-slate-700">
                          {u.leftRP.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-slate-700">
                          {u.rightRP.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3 px-4 font-mono font-black text-[#144732]">
                          {u.matchedRP.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3 px-4">
                          {u.rankDef ? (
                            <span className="font-bold text-[#92580a] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {u.rankDef.rewardHindi}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium">None (Pending 30 RP)</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/rewards?user=${u.userCode}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#144732] hover:bg-[#0b2b1e] text-[#fef08a] font-bold text-[11px] transition-colors shadow-xs"
                          >
                            <span>Member View</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

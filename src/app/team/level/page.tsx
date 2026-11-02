'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import MemberNavbar from '@/components/MemberNavbar';
import {
  Users,
  Layers,
  Search,
  ArrowLeft,
  ChevronRight,
  RefreshCw,
  Check,
  UserCheck,
  UserX,
  Award,
  Filter,
  Sparkles
} from 'lucide-react';

interface LevelMember {
  level: number;
  id: string;
  userCode: string;
  name: string;
  mobile: string;
  rank: string;
  isActive: boolean;
  activatedAt: string | null;
  placementPosition: 'LEFT' | 'RIGHT' | null;
  leftVolumePV: number;
  rightVolumePV: number;
  createdAt: string;
  sponsorCode: string;
  sponsorName: string;
}

interface LevelStat {
  level: number;
  total: number;
  active: number;
  inactive: number;
}

interface Summary {
  totalTeam: number;
  activeTeam: number;
  inactiveTeam: number;
  maxLevels: number;
}

export default function LevelWiseTeamPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [members, setMembers] = useState<LevelMember[]>([]);
  const [levelStats, setLevelStats] = useState<LevelStat[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalTeam: 0,
    activeTeam: 0,
    inactiveTeam: 0,
    maxLevels: 0,
  });

  // Selected Level Filter: 'all' or '1', '2', etc.
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLevelTeam = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/team/level');
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load level team');
      setMembers(data.members || []);
      setLevelStats(data.levelStats || []);
      setSummary(data.summary || {
        totalTeam: 0,
        activeTeam: 0,
        inactiveTeam: 0,
        maxLevels: 0,
      });
    } catch (err: any) {
      setError(err.message || 'Error fetching level team data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevelTeam();
  }, []);

  const filteredMembers = members.filter((member) => {
    const matchesLevel =
      selectedLevel === 'all' || member.level === parseInt(selectedLevel, 10);

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && member.isActive) ||
      (statusFilter === 'INACTIVE' && !member.isActive);

    const matchesSearch =
      member.userCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.sponsorCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.sponsorName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesLevel && matchesStatus && matchesSearch;
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
          <span className="text-[#144732] font-bold">Level Wise Team</span>
        </div>

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-[#0b2b1e] via-[#144732] to-[#0b2b1e] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#d4a359]/30 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#fef08a] text-xs font-bold uppercase tracking-wider mb-3 border border-white/10">
                <Layers className="w-3.5 h-3.5" />
                Unilevel Generation Network (लेवल 1 से 16)
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Level Wise Team (लेवल वाइज टीम)
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-xl">
                प्रत्येक जनरेशन लेवल (Level 1 to 16) के अनुसार अपनी पूरी टीम का विस्तृत विश्लेषण एवं सूची देखें।
              </p>
            </div>

            {/* Refresh Action */}
            <div className="flex items-center gap-3">
              <button
                onClick={fetchLevelTeam}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-2 border border-white/20 transition-all cursor-pointer active:scale-95"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Team (कुल टीम)
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {summary.totalTeam}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                समस्त लेवल्स के सदस्य
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Active Team (सक्रिय)
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
                {summary.activeTeam}
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
                Inactive Team (असक्रिय)
              </div>
              <div className="text-2xl sm:text-3xl font-black text-rose-600 mt-1">
                {summary.inactiveTeam}
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
                Active Depth (गहराई)
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#144732] mt-1">
                {summary.maxLevels} Levels
              </div>
              <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                अधिकतम सक्रिय लेवल
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Level Badges Selector Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#144732]" />
            <span>Select Level (लेवल चुनें):</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => setSelectedLevel('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
                selectedLevel === 'all'
                  ? 'bg-gradient-to-r from-[#0b2b1e] to-[#144732] text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>All Levels</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                selectedLevel === 'all' ? 'bg-[#d4a359] text-[#0b2b1e]' : 'bg-slate-200 text-slate-700'
              }`}>
                {summary.totalTeam}
              </span>
            </button>

            {levelStats.map((st) => (
              <button
                key={st.level}
                onClick={() => setSelectedLevel(st.level.toString())}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedLevel === st.level.toString()
                    ? 'bg-[#144732] text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>Level {st.level}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  selectedLevel === st.level.toString()
                    ? 'bg-[#d4a359] text-[#0b2b1e]'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {st.total}
                </span>
              </button>
            ))}

            {levelStats.length === 0 && (
              <div className="text-xs text-slate-400 py-1">
                (अभी कोई डाउनलाइन जनरेशन नहीं है)
              </div>
            )}
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
              placeholder="Search by ID, Name, Sponsor ID..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#144732]/20 focus:border-[#144732] font-medium"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                statusFilter === 'ACTIVE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:text-emerald-800'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('INACTIVE')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                statusFilter === 'INACTIVE'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:text-rose-800'
              }`}
            >
              Inactive
            </button>
          </div>
        </div>

        {/* Level Team Members Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 text-[#144732] animate-spin mx-auto mb-3" />
              <div className="text-sm font-bold text-slate-700">Loading Level Team...</div>
              <div className="text-xs text-slate-400 mt-1">लेवल टीम लोड हो रही है...</div>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-rose-600">
              <div className="font-bold text-sm">{error}</div>
              <button
                onClick={fetchLevelTeam}
                className="mt-3 px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100"
              >
                Retry
              </button>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <Layers className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-slate-800">
                {members.length === 0
                  ? 'No Level Team Members Yet (इस लेवल पर कोई सदस्य नहीं है)'
                  : 'No Matching Members Found'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                {members.length === 0
                  ? 'जैसे-जैसे आपकी टीम के सदस्य नए लोगों को जोड़ेंगे, वे यहाँ विभिन्न लेवल्स में दिखाई देंगे।'
                  : 'फ़िल्टर अथवा सर्च क्वेरी बदलकर पुनः प्रयास करें।'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4">Member ID & Name</th>
                    <th className="py-3 px-4">Sponsor ID</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Joining Date</th>
                    <th className="py-3 px-4">Activation Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map((member, idx) => (
                    <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#144732]/10 text-[#144732] border border-[#144732]/20">
                          Level {member.level}
                        </span>
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
                        <div className="font-mono font-bold text-slate-700">
                          {member.sponsorCode}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[120px]">
                          {member.sponsorName}
                        </div>
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

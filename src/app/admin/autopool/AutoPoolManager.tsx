'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Layers, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Users, 
  CheckCircle2, 
  Clock, 
  Search, 
  RefreshCw, 
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Filter
} from 'lucide-react';
import Link from 'next/link';

interface AutoPoolSummary {
  totalCollected: number;
  totalPaidOut: number;
  eligibleUsersCount: number;
  activeInMatrixCount: number;
  completedEntriesCount: number;
  systemReserveBalance: number;
}

interface MatrixMember {
  id: string;
  userCode: string;
  name: string;
  mobile: string;
  rank: string;
  poolLevel: number;
  childPosition: number;
  isCompleted: boolean;
  completedAt: string | null;
  grossAmount: number;
  upgradeDeducted: number;
  netPaidOut: number;
  createdAt: string;
  parentCode: string;
  parentName: string;
  childrenCount: number;
  requiredChildren: number;
  children: Array<{
    id: string;
    userCode: string;
    name: string;
    position: number;
    createdAt: string;
  }>;
}

interface DeductionRecord {
  id: string;
  date: string;
  amount: number;
  userCode: string;
  name: string;
  mobile: string;
  closingBalance: number;
  remarks: string;
  isFullyDeducted: boolean;
  deductionPaid: number;
}

interface PayoutRecord {
  id: string;
  date: string;
  amount: number;
  userCode: string;
  name: string;
  mobile: string;
  closingBalance: number;
  remarks: string;
}

export default function AutoPoolManager() {
  const [activeTab, setActiveTab] = useState<'matrix' | 'deductions' | 'payouts'>('matrix');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [summary, setSummary] = useState<AutoPoolSummary>({
    totalCollected: 0,
    totalPaidOut: 0,
    eligibleUsersCount: 0,
    activeInMatrixCount: 0,
    completedEntriesCount: 0,
    systemReserveBalance: 0,
  });

  const [levelCounts, setLevelCounts] = useState<Record<number, number>>({
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0,
  });

  const [levelConfig, setLevelConfig] = useState<any>({
    level: 1,
    requiredChildren: 2,
    ratePerChild: 100,
    grossAmount: 200,
    upgradeDeduction: 125,
    netPayout: 75,
  });

  const [matrixList, setMatrixList] = useState<MatrixMember[]>([]);
  const [deductionsList, setDeductionsList] = useState<DeductionRecord[]>([]);
  const [payoutsList, setPayoutsList] = useState<PayoutRecord[]>([]);

  const fetchData = async (level = selectedLevel) => {
    try {
      setRefreshing(true);
      const res = await fetch(`/api/admin/autopool?level=${level}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSummary(data.summary);
          setLevelCounts(data.levelCounts);
          setLevelConfig(data.levelConfig);
          setMatrixList(data.matrixList || []);
          setDeductionsList(data.deductionsList || []);
          setPayoutsList(data.payoutsList || []);
        }
      }
    } catch (err) {
      console.error('Error fetching admin autopool data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(selectedLevel);
  }, [selectedLevel]);

  const filteredDeductions = deductionsList.filter(
    (d) =>
      d.userCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.mobile.includes(searchQuery)
  );

  const filteredPayouts = payoutsList.filter(
    (p) =>
      p.userCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.mobile.includes(searchQuery)
  );

  const filteredMatrix = matrixList.filter(
    (m) =>
      m.userCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.mobile.includes(searchQuery)
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-[#144732] to-[#0b2b1e] border-2 border-[#d4a359] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4a359]/20 text-[#fef08a] text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Universal 2x2 AutoPool Matrix Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            यूनिवर्सल ऑटोपूल कंट्रोल डेस्क (7 Levels Matrix)
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            पहली ₹100 आमदनी कटौती, स्वतः प्रवेश, लाइव मैट्रिक्स ट्री एवं तात्कालिक वितरण निगरानी
          </p>
        </div>

        <button
          onClick={() => fetchData(selectedLevel)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-black border border-white/20 transition-all shrink-0 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'रिफ्रेश हो रहा है...' : 'लाइव रिफ्रेश करें'}</span>
        </button>
      </div>

      {/* 4 Key Performance Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Deductions Inflow */}
        <div className="bg-white border-2 border-[#144732]/20 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-[#144732] transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <span>कुल ₹100 कटौती आवक</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#144732]">
            ₹{summary.totalCollected.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>कुल कटौती प्रविष्टियां:</span>
            <span className="font-bold text-emerald-800">{deductionsList.length} ट्रांजैक्शन</span>
          </div>
        </div>

        {/* Total Immediate Payouts Outflow */}
        <div className="bg-white border-2 border-[#d4a359]/30 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-[#92580a] transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <span>वितरित ऑटोपूल शुद्ध आय</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-black">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#92580a]">
            ₹{summary.totalPaidOut.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>तात्कालिक भुगतान:</span>
            <span className="font-bold text-amber-800">{payoutsList.length} मेंबर्स को</span>
          </div>
        </div>

        {/* Matrix Active Members */}
        <div className="bg-white border-2 border-emerald-100 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-emerald-500 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <span>यूनिवर्सल मैट्रिक्स में सक्रिय</span>
            <div className="w-8 h-8 rounded-xl bg-[#eaf5ed] text-[#144732] flex items-center justify-center font-black">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-800">
            {summary.activeInMatrixCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>पात्र (कटौती पूर्ण) मेंबर्स:</span>
            <span className="font-bold text-[#144732]">{summary.eligibleUsersCount} मेंबर्स</span>
          </div>
        </div>

        {/* Completed Cycles / Upgrades */}
        <div className="bg-white border-2 border-blue-100 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-blue-500 transition-all">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <span>पूर्ण लेवल्स / अपग्रेड्स</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-black">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-blue-900">
            {summary.completedEntriesCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>सिस्टम ऑटोपूल रिजर्व:</span>
            <span className="font-bold text-blue-800">₹{summary.systemReserveBalance.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white border border-[#e8e3d5] rounded-3xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
                activeTab === 'matrix'
                  ? 'bg-[#144732] text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>2x2 ग्लोबल मैट्रिक्स (Levels 1 to 7)</span>
            </button>

            <button
              onClick={() => setActiveTab('deductions')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
                activeTab === 'deductions'
                  ? 'bg-[#144732] text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>₹100 कटौती आवक लेजर ({deductionsList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('payouts')}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
                activeTab === 'payouts'
                  ? 'bg-[#144732] text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>तात्कालिक वितरित आय ({payoutsList.length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Member ID, Name, Mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#144732]"
            />
          </div>
        </div>
      </div>

      {/* TAB 1: 2x2 GLOBAL MATRIX TREE / CARDS VIEW */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* Level Switcher Pills */}
          <div className="bg-white border border-[#e8e3d5] rounded-3xl p-4 shadow-sm flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-slate-500 uppercase px-2">चुनें स्तर (Level):</span>
            {[1, 2, 3, 4, 5, 6, 7].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
                  selectedLevel === lvl
                    ? 'bg-gradient-to-r from-[#144732] to-[#1a5b40] text-white shadow-md scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>Level {lvl}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    selectedLevel === lvl ? 'bg-[#d4a359] text-[#0b2b1e]' : 'bg-slate-300 text-slate-800'
                  }`}
                >
                  {levelCounts[lvl] || 0}
                </span>
              </button>
            ))}
          </div>

          {/* Level Configuration Summary Banner */}
          <div className="bg-gradient-to-r from-[#fefbf6] to-[#f4eee1] border border-[#d4a359]/40 rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#144732] text-white flex items-center justify-center font-black shrink-0">
                L{selectedLevel}
              </div>
              <div>
                <div className="font-black text-[#144732] text-sm">
                  लेवल {selectedLevel} ऑटोपूल विनिर्देश (Level {selectedLevel} Matrix Spec)
                </div>
                <div className="text-slate-600 mt-0.5">
                  आवश्यक मेंबर्स: <strong className="text-slate-900">{levelConfig.requiredChildren}</strong> • प्रति सदस्य दर: <strong className="text-slate-900">₹{levelConfig.ratePerChild.toLocaleString('en-IN')}</strong> • कुल आवक: <strong className="text-slate-900">₹{levelConfig.grossAmount.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right shrink-0">
              <div className="bg-white/80 border border-[#d4a359]/30 rounded-2xl px-4 py-2">
                <div className="text-[10px] text-slate-500 font-bold uppercase">अपग्रेड कटौती</div>
                <div className="font-black text-red-600 text-sm">
                  {levelConfig.upgradeDeduction > 0 ? `₹${levelConfig.upgradeDeduction.toLocaleString('en-IN')}` : 'NIL'}
                </div>
              </div>
              <div className="bg-[#144732] text-white rounded-2xl px-4 py-2 shadow-sm">
                <div className="text-[10px] text-emerald-300 font-bold uppercase">सदस्य शुद्ध आय</div>
                <div className="font-black text-[#fef08a] text-sm">
                  ₹{levelConfig.netPayout.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Matrix Members List */}
          {filteredMatrix.length === 0 ? (
            <div className="bg-white border border-[#e8e3d5] rounded-3xl p-12 text-center text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
              <div className="font-bold text-slate-600 text-sm">
                इस स्तर (Level {selectedLevel}) में अभी कोई सदस्य नहीं है।
              </div>
              <p className="text-xs text-slate-400 mt-1">
                जैसे ही मेंबर्स की पहली ₹100 आमदनी कटती है और पिछले लेवल्स पूरे होते हैं, वे स्वतः यहाँ प्लेस होते हैं।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMatrix.map((m) => {
                const fillPercent = Math.min(100, Math.round((m.childrenCount / m.requiredChildren) * 100));
                return (
                  <div
                    key={m.id}
                    className={`bg-white border-2 rounded-3xl p-6 shadow-sm relative overflow-hidden transition-all ${
                      m.isCompleted ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-200 hover:border-[#144732]'
                    }`}
                  >
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#144732] text-white">
                        Level {m.poolLevel}
                      </span>
                      {m.isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          पूर्ण (Upgraded)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800">
                          <Clock className="w-3.5 h-3.5" />
                          प्रगति पर ({m.childrenCount}/{m.requiredChildren})
                        </span>
                      )}
                    </div>

                    {/* Member Details */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#144732] to-[#0b2b1e] text-white flex items-center justify-center font-black text-lg shrink-0 shadow-md">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-black text-slate-900 text-sm truncate flex items-center gap-1.5">
                          <span>{m.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {m.rank}
                          </span>
                        </div>
                        <div className="text-xs font-black text-[#144732]">{m.userCode}</div>
                        <div className="text-[11px] text-slate-400">{m.mobile}</div>
                      </div>
                    </div>

                    {/* Matrix Placement Info */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-xs space-y-1.5 mb-4">
                      <div className="flex justify-between text-slate-600">
                        <span>अंडर पैरेंट (Under):</span>
                        <strong className="text-slate-800">{m.parentCode}</strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>प्लेसमेंट पोजीशन:</span>
                        <strong className="text-slate-800">Slot #{m.childPosition}</strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>प्रवेश तिथि:</span>
                        <span className="text-slate-500">{new Date(m.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Matrix Children Progress */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-600">मैट्रिक्स स्लॉट्स प्रगति:</span>
                        <span className={m.isCompleted ? 'text-emerald-700' : 'text-amber-700'}>
                          {m.childrenCount} / {m.requiredChildren} Slots ({fillPercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            m.isCompleted ? 'bg-emerald-600' : 'bg-amber-500'
                          }`}
                          style={{ width: `${fillPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Children List in Slots */}
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        अटैच्ड मेंबर्स (Direct Downline in Matrix):
                      </div>
                      {m.children.length === 0 ? (
                        <div className="text-[11px] text-slate-400 italic bg-slate-50 rounded-xl p-2 text-center">
                          कोई मेंबर अटैच नहीं हुआ है (नए प्रवेश की प्रतीक्षा)
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {m.children.map((c) => (
                            <span
                              key={c.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-bold"
                            >
                              <span>#{c.position}:</span>
                              <strong className="font-black">{c.userCode}</strong>
                              <span className="text-slate-500 truncate max-w-[80px]">({c.name})</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Payout Details if Completed */}
                    {m.isCompleted && (
                      <div className="mt-4 pt-3 border-t border-emerald-200 bg-emerald-50/60 -mx-6 -mb-6 p-4 rounded-b-3xl text-xs flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-emerald-800 font-bold uppercase">वितरित शुद्ध आय</div>
                          <div className="text-base font-black text-emerald-900">
                            ₹{m.netPaidOut.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-emerald-800 font-bold uppercase">अपग्रेड रिजर्व कटौती</div>
                          <div className="text-xs font-bold text-slate-700">
                            ₹{m.upgradeDeducted.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ₹100 DEDUCTIONS INFLOW LEDGER */}
      {activeTab === 'deductions' && (
        <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-[#144732]">
                प्रति आईडी ₹100 ऑटोपूल कटौती विवरण (Entry Deductions Ledger)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                पहली आमदनी होते ही ₹100 कटकर सिस्टम ऑटोपूल में जाने का पूर्ण पारदर्शी रिकॉर्ड
              </p>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-black">
              कुल प्रविष्टियां: {filteredDeductions.length} • कुल आवक: ₹
              {filteredDeductions.reduce((s, d) => s + d.amount, 0).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead>
                <tr className="bg-[#144732] text-white uppercase tracking-wider">
                  <th className="py-3.5 px-4 rounded-l-xl">दिनांक व समय</th>
                  <th className="py-3.5 px-4">मेंबर आईडी (User Code)</th>
                  <th className="py-3.5 px-4">नाम व मोबाइल</th>
                  <th className="py-3.5 px-4 text-right">कटौती राशि (₹)</th>
                  <th className="py-3.5 px-4 text-right">क्लोजिंग बैलेंस</th>
                  <th className="py-3.5 px-4 text-center">ऑटोपूल पात्रता</th>
                  <th className="py-3.5 px-4 rounded-r-xl">विवरण (Remarks)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDeductions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      कोई कटौती रिकॉर्ड उपलब्ध नहीं है।
                    </td>
                  </tr>
                ) : (
                  filteredDeductions.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-medium text-slate-600 whitespace-nowrap">
                        {new Date(d.date).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-4 px-4 font-black text-[#144732] whitespace-nowrap">
                        <Link
                          href={`/admin/members?search=${d.userCode}`}
                          className="hover:underline flex items-center gap-1"
                        >
                          <span>{d.userCode}</span>
                          <ChevronRight className="w-3 h-3 opacity-60" />
                        </Link>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-800">{d.name}</div>
                        <div className="text-[11px] text-slate-400">{d.mobile}</div>
                      </td>
                      <td className="py-4 px-4 font-black text-red-600 text-sm text-right whitespace-nowrap">
                        -₹{d.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-700 text-right whitespace-nowrap">
                        ₹{d.closingBalance.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {d.isFullyDeducted ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                            <CheckCircle2 className="w-3 h-3" />
                            पात्र व सक्रिय (Active)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase">
                            <Clock className="w-3 h-3" />
                            प्रगति: ₹{d.deductionPaid}/₹100
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-slate-600 max-w-[260px] truncate" title={d.remarks}>
                        {d.remarks}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: IMMEDIATE AUTOPOOL PAYOUTS LEDGER */}
      {activeTab === 'payouts' && (
        <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-[#144732]">
                तात्कालिक वितरित ऑटोपूल आय (Immediate AutoPool Payouts Ledger)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                मैट्रिक्स स्लॉट पूर्ण होते ही किस-किस आईडी को तात्कालिक ऑटोपूल आय क्रेडिट हुई
              </p>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black">
              कुल भुगतान: {filteredPayouts.length} • कुल राशि: ₹
              {filteredPayouts.reduce((s, p) => s + p.amount, 0).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead>
                <tr className="bg-[#144732] text-white uppercase tracking-wider">
                  <th className="py-3.5 px-4 rounded-l-xl">दिनांक व समय</th>
                  <th className="py-3.5 px-4">लाभार्थी आईडी (Member Code)</th>
                  <th className="py-3.5 px-4">नाम व मोबाइल</th>
                  <th className="py-3.5 px-4 text-right">क्रेडिट राशि (Net Paid)</th>
                  <th className="py-3.5 px-4 text-right">क्लोजिंग बैलेंस</th>
                  <th className="py-3.5 px-4 rounded-r-xl">विवरण व स्तर (Level Details)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      अभी कोई ऑटोपूल आय वितरण रिकॉर्ड नहीं है।
                    </td>
                  </tr>
                ) : (
                  filteredPayouts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-medium text-slate-600 whitespace-nowrap">
                        {new Date(p.date).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-4 px-4 font-black text-[#144732] whitespace-nowrap">
                        <Link
                          href={`/admin/members?search=${p.userCode}`}
                          className="hover:underline flex items-center gap-1"
                        >
                          <span>{p.userCode}</span>
                          <ChevronRight className="w-3 h-3 opacity-60" />
                        </Link>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-800">{p.name}</div>
                        <div className="text-[11px] text-slate-400">{p.mobile}</div>
                      </td>
                      <td className="py-4 px-4 font-black text-emerald-700 text-sm text-right whitespace-nowrap">
                        +₹{p.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-700 text-right whitespace-nowrap">
                        ₹{p.closingBalance.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-4 text-slate-700">
                        <span className="font-medium">{p.remarks}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

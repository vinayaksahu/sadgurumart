'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import MemberNavbar from '@/components/MemberNavbar';
import {
  TrendingUp,
  ArrowLeft,
  ChevronRight,
  RefreshCw,
  Wallet,
  Sparkles,
  Layers,
  Award,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  CreditCard
} from 'lucide-react';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  closingBalance: number;
  remarks: string;
  referenceId: string | null;
  counterpartyUserCode: string | null;
  counterpartyName: string | null;
  createdAt: string;
}

const INCOME_META: Record<string, { label: string; hindi: string; color: string }> = {
  RETAIL_PROFIT: { label: 'Retail Profit', hindi: 'रिटेल प्रॉफिट', color: 'bg-emerald-100 text-emerald-800' },
  DIRECT_REFERRAL: { label: 'Direct Referral Bonus', hindi: 'डायरेक्ट रेफरल बोनस', color: 'bg-blue-100 text-blue-800' },
  BINARY_MATCHING: { label: 'Binary Matching', hindi: 'बाइनरी मैचिंग इनकम', color: 'bg-indigo-100 text-indigo-800' },
  SPONSOR_ROYALTY: { label: 'Sponsor Royalty', hindi: 'स्पॉन्सर रॉयल्टी', color: 'bg-purple-100 text-purple-800' },
  AWARD_REWARD: { label: 'Award & Reward', hindi: 'अवार्ड व रिवार्ड', color: 'bg-amber-100 text-amber-800' },
  LEADERSHIP_CTO: { label: 'Leadership Pool (5%)', hindi: 'लीडरशिप पूल', color: 'bg-rose-100 text-rose-800' },
  COMPANY_CTO: { label: 'Company Turnover (5%)', hindi: 'कंपनी सीटीओ', color: 'bg-yellow-100 text-yellow-800' },
  AUTOPOOL_INCOME: { label: 'Universal AutoPool', hindi: 'ऑटोपूल इनकम', color: 'bg-teal-100 text-teal-800' },
  PURCHASE_CASHBACK: { label: 'Self Purchase Cashback', hindi: 'परचेस कैशबैक', color: 'bg-emerald-100 text-emerald-800' },
  REPURCHASE_TEAM: { label: 'Team Repurchase Bonus', hindi: 'रीपरचेस बोनस', color: 'bg-cyan-100 text-cyan-800' },
  MOBILE_FUND: { label: 'Mobile Fund (2%)', hindi: 'मोबाइल फंड', color: 'bg-violet-100 text-violet-800' },
  BIKE_FUND: { label: 'Bike Fund (2%)', hindi: 'बाइक फंड', color: 'bg-fuchsia-100 text-fuchsia-800' },
  CAR_FUND: { label: 'Car Fund (2%)', hindi: 'कार फंड', color: 'bg-pink-100 text-pink-800' },
  HOUSE_FUND: { label: 'House Fund (2%)', hindi: 'हाउस फंड', color: 'bg-orange-100 text-orange-800' },
  MOBILE_RECHARGE_CASHBACK: { label: 'Mobile Recharge', hindi: 'मोबाइल रिचार्ज बचत', color: 'bg-lime-100 text-lime-800' },
  DTH_RECHARGE_CASHBACK: { label: 'DTH Recharge', hindi: 'डीटीएच रिचार्ज बचत', color: 'bg-green-100 text-green-800' },
};

export default function IncomeHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [incomeBreakdown, setIncomeBreakdown] = useState<Record<string, number>>({});
  const [totalIncome, setTotalIncome] = useState(0);

  // Filters
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchIncomeData = async (type = 'ALL') => {
    setLoading(true);
    setError('');
    try {
      const url = type !== 'ALL' ? `/api/income/history?type=${type}` : '/api/income/history';
      const res = await fetch(url);
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load income history');
      setTransactions(data.transactions || []);
      setIncomeBreakdown(data.incomeBreakdown || {});
      setTotalIncome(data.totalIncome || 0);
    } catch (err: any) {
      setError(err.message || 'Error loading income history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomeData(selectedType);
  }, [selectedType]);

  const filteredTransactions = transactions.filter((tx) => {
    const meta = INCOME_META[tx.type] || { label: tx.type, hindi: '' };
    const matchesSearch =
      tx.remarks.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meta.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meta.hindi.includes(searchTerm) ||
      (tx.referenceId && tx.referenceId.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
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
          <Link href="/payout" className="hover:text-[#144732]">
            My Income
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[#144732] font-bold">Income History & Details</span>
        </div>

        {/* Hero Header */}
        <div className="bg-gradient-to-r from-[#0b2b1e] via-[#144732] to-[#0b2b1e] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#d4a359]/30 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#fef08a] text-xs font-bold uppercase tracking-wider mb-2 border border-white/10">
                <TrendingUp className="w-3.5 h-3.5" />
                16 Lucrative Streams • Earnings Ledger
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Income Details & History (16 इनकम हिस्ट्री)
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                प्लान के सभी 16 प्रकार के इनकम हेड का संचित विवरण, दिनांक-वार क्रेडिट रिकॉर्ड एवं सम्पूर्ण स्टेटमेंट।
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
              <div className="text-xs text-slate-300">Total All-Time Income Earned</div>
              <div className="text-3xl font-black text-[#fef08a]">
                ₹{totalIncome.toLocaleString('en-IN')}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Link
                  href="/autopool"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20"
                >
                  AutoPool Status →
                </Link>
                <Link
                  href="/payout"
                  className="px-3 py-1.5 rounded-lg bg-[#d4a359] text-[#0b2b1e] text-xs font-black hover:bg-[#c39248]"
                >
                  Request Payout →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Income Category Highlights (Key Incomes) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { key: 'BINARY_MATCHING', title: 'Binary Matching', hindi: '10% मैचिंग' },
            { key: 'DIRECT_REFERRAL', title: 'Direct Sponsor', hindi: '10% PV डायरेक्ट' },
            { key: 'AUTOPOOL_INCOME', title: 'AutoPool Income', hindi: '2x2 ऑटोपूल' },
            { key: 'SPONSOR_ROYALTY', title: 'Sponsor Royalty', hindi: '10% स्पॉन्सर' },
            { key: 'LEADERSHIP_CTO', title: 'Leadership Pool', hindi: '5% सीटीओ पूल' },
            { key: 'CAR_FUND', title: 'Lifestyle Funds', hindi: 'मोबाइल/कार/हाउस' },
          ].map((item) => {
            const amount =
              item.key === 'CAR_FUND'
                ? (incomeBreakdown['MOBILE_FUND'] || 0) +
                  (incomeBreakdown['BIKE_FUND'] || 0) +
                  (incomeBreakdown['CAR_FUND'] || 0) +
                  (incomeBreakdown['HOUSE_FUND'] || 0)
                : incomeBreakdown[item.key] || 0;

            return (
              <div
                key={item.key}
                onClick={() => setSelectedType(item.key)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  selectedType === item.key
                    ? 'bg-[#144732] text-white border-[#144732] shadow-md'
                    : 'bg-white text-slate-800 border-slate-200/80 hover:border-[#144732]/40 shadow-xs'
                }`}
              >
                <div
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    selectedType === item.key ? 'text-[#fef08a]' : 'text-slate-500'
                  }`}
                >
                  {item.hindi}
                </div>
                <div className="text-base font-black mt-1">₹{amount.toLocaleString('en-IN')}</div>
                <div
                  className={`text-[11px] truncate mt-0.5 ${
                    selectedType === item.key ? 'text-slate-200' : 'text-slate-600'
                  }`}
                >
                  {item.title}
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by remarks, reference ID, or income name..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#144732]/20 focus:border-[#144732] font-medium"
            />
          </div>

          {/* Income Type Dropdown Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 shrink-0">Filter Income:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#144732]/20"
            >
              <option value="ALL">All 16 Incomes (समस्त 16 इनकम)</option>
              <option value="BINARY_MATCHING">Binary Matching (10% मैचिंग)</option>
              <option value="DIRECT_REFERRAL">Direct Referral Bonus (10% PV)</option>
              <option value="SPONSOR_ROYALTY">Sponsor Royalty (10%)</option>
              <option value="AUTOPOOL_INCOME">Universal AutoPool (2x2 पूल)</option>
              <option value="LEADERSHIP_CTO">Leadership Pool (5% CTO)</option>
              <option value="COMPANY_CTO">Company Turnover (5% CTO)</option>
              <option value="AWARD_REWARD">Awards & Rewards (3% Pool)</option>
              <option value="REPURCHASE_TEAM">Team Repurchase Bonus (10%)</option>
              <option value="PURCHASE_CASHBACK">Self Purchase Cashback (10%)</option>
              <option value="MOBILE_FUND">Mobile Fund (2% CTO)</option>
              <option value="BIKE_FUND">Bike Fund (2% CTO)</option>
              <option value="CAR_FUND">Car Fund (2% CTO)</option>
              <option value="HOUSE_FUND">House Fund (2% CTO)</option>
              <option value="MOBILE_RECHARGE_CASHBACK">Mobile Recharge Cashback</option>
              <option value="DTH_RECHARGE_CASHBACK">DTH Recharge Cashback</option>
            </select>
          </div>
        </div>

        {/* Detailed Transactions Statement Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 text-[#144732] animate-spin mx-auto mb-3" />
              <div className="text-xs font-bold text-slate-500">Loading Income History...</div>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-rose-600 font-bold text-xs">{error}</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-black text-slate-800">No Income Transactions Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {selectedType === 'ALL'
                  ? 'जैसे ही आपकी आईडी या टीम एक्टिव होगी, आय स्वतः यहाँ क्रेडिट होगी।'
                  : 'इस इनकम हेड में अभी तक कोई लेन-देन दर्ज नहीं हुआ है।'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">#</th>
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4">Income Head (प्रकार)</th>
                    <th className="py-3.5 px-4">Remarks / Description</th>
                    <th className="py-3.5 px-4 text-right">Amount Credited</th>
                    <th className="py-3.5 px-4 text-right">Wallet Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((tx, idx) => {
                    const meta = INCOME_META[tx.type] || {
                      label: tx.type,
                      hindi: '',
                      color: 'bg-slate-100 text-slate-700',
                    };

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}{' '}
                          <span className="text-[10px] text-slate-400">
                            {new Date(tx.createdAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${meta.color}`}
                          >
                            {meta.label}
                          </span>
                          {meta.hindi && (
                            <div className="text-[10px] text-slate-500 mt-0.5">{meta.hindi}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          <div>{tx.remarks}</div>
                          {tx.referenceId && (
                            <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                              Ref: {tx.referenceId}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-emerald-600 text-sm whitespace-nowrap font-mono">
                          +₹{tx.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-600 whitespace-nowrap">
                          ₹{tx.closingBalance.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

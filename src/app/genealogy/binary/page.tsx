'use client';

import React, { useState, useEffect } from 'react';
import MemberNavbar from '@/components/MemberNavbar';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  UserPlus, 
  ChevronRight,
  RefreshCw
} from 'lucide-react';

export default function BinaryGenealogyPage() {
  const [treeData, setTreeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  const fetchTree = async (code?: string) => {
    setLoading(true);
    setError('');
    try {
      const url = code ? `/api/genealogy/binary?userCode=${code}` : '/api/genealogy/binary';
      const res = await fetch(url);
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load tree');
      setTreeData(data.tree);
    } catch (err: any) {
      setError(err.message || 'Error loading genealogy');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCode.trim()) {
      if (treeData?.userCode) {
        setHistory((prev) => [...prev, treeData.userCode]);
      }
      fetchTree(searchCode.trim());
    }
  };

  const handleNodeClick = (node: any) => {
    if (!node) return;
    if (treeData?.userCode && treeData.userCode !== node.userCode) {
      setHistory((prev) => [...prev, treeData.userCode]);
      fetchTree(node.userCode);
    }
  };

  const handleBack = () => {
    if (history.length > 0) {
      const previous = history[history.length - 1];
      setHistory((prev) => prev.slice(0, prev.length - 1));
      fetchTree(previous);
    }
  };

  // Render an individual Node Card
  const renderNode = (node: any, positionLabel: string, parentId?: string) => {
    if (!node) {
      return (
        <div className="flex flex-col items-center">
          <div className="w-48 bg-white/70 border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center shadow-sm">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div className="text-xs font-black text-slate-400 uppercase tracking-wider">
              {positionLabel} VACANT
            </div>
            <Link
              href={`/register?ref=${parentId || treeData?.userCode || 'SGM010001'}&pos=${positionLabel}`}
              className="mt-2 inline-block px-3 py-1 rounded-lg bg-[#144732] text-white text-[10px] font-bold hover:bg-[#0b2b1e]"
            >
              + Place Member
            </Link>
          </div>
        </div>
      );
    }

    const isActive = node.isActive;

    return (
      <div 
        onClick={() => handleNodeClick(node)}
        className="flex flex-col items-center cursor-pointer group"
      >
        <div className={`w-52 rounded-2xl p-4 text-center border-2 shadow-xl transition-all duration-200 group-hover:scale-105 ${
          isActive 
            ? 'bg-gradient-to-br from-[#166534] via-[#15803d] to-[#14532d] text-white border-[#4ade80] shadow-emerald-950/20' 
            : 'bg-gradient-to-br from-[#991b1b] via-[#b91c1c] to-[#7f1d1d] text-white border-[#f87171] shadow-rose-950/20'
        }`}>
          {/* Active status badge & position badge */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white font-mono">
              {node.placementPosition || positionLabel}
            </span>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border ${
              isActive 
                ? 'bg-emerald-950/70 text-[#fef08a] border-[#4ade80]/40' 
                : 'bg-rose-950/70 text-rose-200 border-[#f87171]/40'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#4ade80] animate-pulse' : 'bg-rose-400'}`} />
              <span>{isActive ? 'ACTIVE' : 'INACTIVE'}</span>
            </span>
          </div>

          <div className={`w-12 h-12 rounded-full font-black text-base flex items-center justify-center mx-auto mb-2 border-2 shadow ${
            isActive 
              ? 'bg-white text-[#14532d] border-[#fef08a]' 
              : 'bg-white text-[#991b1b] border-rose-200'
          }`}>
            {node.name?.charAt(0).toUpperCase() || 'U'}
          </div>

          <div className={`font-mono text-xs font-black tracking-wider ${isActive ? 'text-[#fef08a]' : 'text-white'}`}>
            {node.userCode}
          </div>
          <div className="font-bold text-xs text-white truncate max-w-[170px] mx-auto mt-0.5">
            {node.name}
          </div>
          <div className={`text-[10px] font-semibold mt-0.5 ${isActive ? 'text-emerald-200' : 'text-rose-200'}`}>
            {node.rank?.replace('_', ' ') || 'Distributor'}
          </div>

          {/* PV Volume Grid */}
          <div className="grid grid-cols-2 gap-1.5 mt-3 pt-2 border-t border-white/20 text-[10px]">
            <div className={`p-1.5 rounded-xl border text-white ${
              isActive ? 'bg-emerald-950/60 border-emerald-400/30' : 'bg-rose-950/60 border-rose-400/30'
            }`}>
              <div className={`font-medium text-[9px] ${isActive ? 'text-emerald-200' : 'text-rose-200'}`}>Left PV</div>
              <div className="font-black text-xs">{(node.leftVolumePV || 0) + (node.leftCarryForwardPV || 0)}</div>
            </div>
            <div className={`p-1.5 rounded-xl border text-white ${
              isActive ? 'bg-emerald-950/60 border-emerald-400/30' : 'bg-rose-950/60 border-rose-400/30'
            }`}>
              <div className={`font-medium text-[9px] ${isActive ? 'text-emerald-200' : 'text-rose-200'}`}>Right PV</div>
              <div className="font-black text-xs">{(node.rightVolumePV || 0) + (node.rightCarryForwardPV || 0)}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-[#1f2937] font-sans flex flex-col">
      <MemberNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-[#e8e3d5] rounded-3xl p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <h1 className="text-2xl font-black text-[#144732] tracking-tight">
                Binary Genealogy Tree (2-लेग बाइनरी ट्री)
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              अनलिमिटेड डेप्थ • 10% 1:1 मैचिंग • लाइव वॉल्यूम स्थिति
            </p>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Search Member ID (e.g. SGM010001)"
              className="bg-[#faf8f4] border border-[#d8d0bf] focus:border-[#144732] rounded-xl px-4 py-2 text-xs font-bold uppercase focus:outline-none w-full md:w-64"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#144732] text-white text-xs font-bold hover:bg-[#0b2b1e] flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </form>
        </div>

        {/* History / Back Bar */}
        {history.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-bold text-[#144732]">
            <button
              onClick={handleBack}
              className="px-3 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-1 shadow-sm"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Go Back Up</span>
            </button>
            <span className="text-slate-400">Viewing downline of: {treeData?.userCode}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white border border-[#e8e3d5] rounded-3xl p-24 text-center">
            <div className="w-8 h-8 border-3 border-[#144732] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <div className="text-xs font-bold text-slate-500">Loading Binary Genealogy Nodes...</div>
          </div>
        ) : treeData ? (
          /* Tree Visual Canvas */
          <div className="bg-white border-2 border-[#144732]/15 rounded-3xl p-4 sm:p-12 shadow-sm overflow-x-auto w-full max-w-full">
            <div className="min-w-[750px] flex flex-col items-center">
              {/* Level 0: Root Node */}
              <div className="mb-8">
                {renderNode(treeData, 'ROOT')}
              </div>

              {/* Connecting Line Level 0 to Level 1 */}
              <div className="w-96 h-6 border-t-2 border-l-2 border-r-2 border-[#144732]/40 rounded-t-xl mb-4" />

              {/* Level 1: Left & Right Nodes */}
              <div className="w-full flex justify-around gap-12 mb-8">
                {/* Left Branch */}
                <div className="flex flex-col items-center">
                  {renderNode(treeData.children?.left, 'LEFT', treeData.id)}
                </div>

                {/* Right Branch */}
                <div className="flex flex-col items-center">
                  {renderNode(treeData.children?.right, 'RIGHT', treeData.id)}
                </div>
              </div>

              {/* Connecting Line Level 1 to Level 2 */}
              <div className="w-full grid grid-cols-2 gap-12 max-w-4xl mb-4">
                <div className="flex justify-center">
                  <div className="w-56 h-6 border-t-2 border-l-2 border-r-2 border-slate-300 rounded-t-xl" />
                </div>
                <div className="flex justify-center">
                  <div className="w-56 h-6 border-t-2 border-l-2 border-r-2 border-slate-300 rounded-t-xl" />
                </div>
              </div>

              {/* Level 2: 4 Grandchildren */}
              <div className="w-full grid grid-cols-4 gap-6 max-w-5xl">
                {renderNode(treeData.children?.left?.children?.left, 'LEFT', treeData.children?.left?.id)}
                {renderNode(treeData.children?.left?.children?.right, 'RIGHT', treeData.children?.left?.id)}
                {renderNode(treeData.children?.right?.children?.left, 'LEFT', treeData.children?.right?.id)}
                {renderNode(treeData.children?.right?.children?.right, 'RIGHT', treeData.children?.right?.id)}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

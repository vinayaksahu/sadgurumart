'use client';

import React, { useState, useEffect, Suspense } from 'react';
import AdminNavbar from '@/components/AdminNavbar';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Users, 
  Search, 
  ArrowLeft, 
  RotateCcw,
  Sparkles, 
  ShieldCheck, 
  UserPlus, 
  RefreshCw,
  Award,
  ChevronRight
} from 'lucide-react';

function AdminGenealogyContent() {
  const searchParams = useSearchParams();
  const initialRoot = searchParams.get('userCode') || searchParams.get('root') || '';

  const [treeData, setTreeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchCode, setSearchCode] = useState(initialRoot);
  const [history, setHistory] = useState<string[]>([]);

  const fetchTree = async (code?: string) => {
    setLoading(true);
    setError('');
    try {
      const url = code ? `/api/genealogy/binary?userCode=${encodeURIComponent(code)}` : '/api/genealogy/binary';
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load binary tree');
      setTreeData(data.tree);
    } catch (err: any) {
      setError(err.message || 'Error loading genealogy tree');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree(initialRoot || undefined);
  }, [initialRoot]);

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
    }
    fetchTree(node.userCode);
  };

  const handleBack = () => {
    if (history.length === 0) return;
    const prevCode = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    fetchTree(prevCode);
  };

  const handleReset = () => {
    setHistory([]);
    setSearchCode('');
    fetchTree();
  };

  // Render individual Node Card
  const renderNode = (node: any, positionLabel: string, parentId?: string) => {
    if (!node) {
      return (
        <div className="flex flex-col items-center">
          <div className="w-48 bg-white/80 border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center shadow-xs">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div className="text-xs font-black text-slate-400 uppercase tracking-wider">
              {positionLabel} VACANT
            </div>
            <div className="text-[10px] text-slate-400 mt-1">स्थान रिक्त है</div>
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
        <div className={`w-52 rounded-2xl p-4 text-center border-2 shadow-md transition-all duration-200 group-hover:scale-105 ${
          isActive 
            ? 'bg-white border-[#144732] shadow-[#144732]/10 ring-1 ring-[#144732]/20' 
            : 'bg-slate-50 border-slate-300'
        }`}>
          {/* Active status pulse & position badge */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {node.placementPosition || positionLabel}
            </span>
            <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-[#22c55e] animate-pulse' : 'bg-slate-300'}`} />
          </div>

          <div className="w-12 h-12 rounded-full bg-[#144732] text-white font-black text-sm flex items-center justify-center mx-auto mb-2 border-2 border-[#d4a359]">
            {node.name?.charAt(0).toUpperCase() || 'U'}
          </div>

          <div className="font-mono text-xs font-black text-[#144732]">
            {node.userCode}
          </div>
          <div className="font-bold text-xs text-slate-800 truncate max-w-[170px] mx-auto">
            {node.name}
          </div>
          <div className="text-[10px] font-semibold text-[#92580a] mt-0.5">
            {node.rank?.replace('_', ' ') || 'Distributor'}
          </div>

          {/* PV Volume Grid */}
          <div className="grid grid-cols-2 gap-1.5 mt-3 pt-2 border-t border-slate-100 text-[10px]">
            <div className="bg-[#eaf5ed] p-1 rounded-md text-[#144732]">
              <div className="font-medium text-[9px] text-slate-500">Left PV</div>
              <div className="font-black">{(node.leftVolumePV || 0) + (node.leftCarryForwardPV || 0)}</div>
            </div>
            <div className="bg-[#fdfaf3] p-1 rounded-md text-[#92580a]">
              <div className="font-medium text-[9px] text-slate-500">Right PV</div>
              <div className="font-black">{(node.rightVolumePV || 0) + (node.rightCarryForwardPV || 0)}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-[#e8e3d5] rounded-3xl p-5 sm:p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <Link 
              href="/admin/dashboard" 
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="वापस एडमिन डैशबोर्ड"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#144732] tracking-tight">
                Binary Genealogy Tree (2-लेग नेटवर्क ट्री)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                एडमिनिस्ट्रेटिव कंट्रोल • असीमित डेप्थ • सभी मेंबर्स का 1:1 मैचिंग व PV वॉल्यूम स्थिति
              </p>
            </div>
          </div>
        </div>

        {/* Search Box & Reset Action */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 md:flex-initial">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Search Member ID (e.g. SGM10001)"
              className="bg-[#faf8f4] border border-[#d8d0bf] focus:border-[#144732] rounded-xl px-4 py-2 text-xs font-bold uppercase focus:outline-none w-full md:w-64"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#144732] text-white text-xs font-bold hover:bg-[#0b2b1e] flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </form>

          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Reset Tree to Root"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Root</span>
          </button>
        </div>
      </div>

      {/* History / Back Navigation Bar */}
      {history.length > 0 && (
        <div className="flex items-center gap-2 text-xs font-bold text-[#144732]">
          <button
            onClick={handleBack}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back Up</span>
          </button>
          <span className="text-slate-400">
            Viewing downline of: <strong className="text-[#144732] font-mono">{treeData?.userCode}</strong> ({treeData?.name})
          </span>
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
  );
}

export default function AdminGenealogyPage() {
  return (
    <div className="min-h-screen bg-[#f8f6f0] text-[#1f2937] font-sans flex flex-col">
      <AdminNavbar 
        title="SGM Mart Staff Admin Desk"
        subtitle="Binary Genealogy Network Tree"
        role="STAFF_ADMIN"
      />
      <Suspense fallback={
        <div className="p-24 text-center">
          <div className="w-8 h-8 border-3 border-[#144732] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-xs font-bold text-slate-500">Loading Admin Genealogy...</div>
        </div>
      }>
        <AdminGenealogyContent />
      </Suspense>
    </div>
  );
}

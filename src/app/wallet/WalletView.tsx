'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  Send,
  Zap,
  Building,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Copy,
  Receipt,
  UserCheck,
  AlertCircle,
  Clock,
  Sparkles,
  Lock,
  Layers,
  ArrowLeftRight
} from 'lucide-react';

interface WalletData {
  id: string;
  mainBalance: number;
  p2pBalance: number;
  shoppingBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
}

interface UserData {
  id: string;
  name: string;
  userCode: string;
  mobile: string;
  isActive: boolean;
  rank: string;
  kycDetail?: {
    bankName: string;
    bankAccountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    status: string;
  } | null;
}

interface Transaction {
  id: string;
  type: string;
  walletScope: string;
  amount: number;
  closingBalance: number;
  counterpartyUserCode?: string | null;
  counterpartyName?: string | null;
  referenceId?: string | null;
  remarks?: string | null;
  createdAt: string;
}

interface PackageItem {
  id: string;
  title: string;
  mrp: number;
  dpPrice: number;
  pv: number;
  bv: number;
  description: string;
  images?: string[];
}

interface Props {
  initialUser: UserData;
  initialWallet: WalletData;
  initialTransactions: Transaction[];
  packages: PackageItem[];
}

export default function WalletView({
  initialUser,
  initialWallet,
  initialTransactions,
  packages,
}: Props) {
  const [wallet, setWallet] = useState<WalletData>(initialWallet);
  const [user, setUser] = useState<UserData>(initialUser);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  // Active Filter & Search
  const [activeTab, setActiveTab] = useState<'ALL' | 'MAIN' | 'P2P' | 'TRANSFERS' | 'ACTIVATIONS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals state
  const [showMainToP2pModal, setShowMainToP2pModal] = useState(false);
  const [showP2pTransferModal, setShowP2pTransferModal] = useState(false);
  const [showActivateIdModal, setShowActivateIdModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Main to P2P Form
  const [mainToP2pAmount, setMainToP2pAmount] = useState('');
  const [mainToP2pRemarks, setMainToP2pRemarks] = useState('');
  const [mainToP2pLoading, setMainToP2pLoading] = useState(false);
  const [mainToP2pMsg, setMainToP2pMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // P2P Transfer Form
  const [p2pRecipientCode, setP2pRecipientCode] = useState('');
  const [p2pVerifiedRecipient, setP2pVerifiedRecipient] = useState<{ name: string; userCode: string; isActive: boolean } | null>(null);
  const [p2pVerifying, setP2pVerifying] = useState(false);
  const [p2pAmount, setP2pAmount] = useState('');
  const [p2pRemarks, setP2pRemarks] = useState('');
  const [p2pLoading, setP2pLoading] = useState(false);
  const [p2pMsg, setP2pMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ID Activation Form
  const [activationTarget, setActivationTarget] = useState<'SELF' | 'OTHER'>('SELF');
  const [targetMemberCode, setTargetMemberCode] = useState('');
  const [verifiedTargetMember, setVerifiedTargetMember] = useState<{ name: string; userCode: string; isActive: boolean } | null>(null);
  const [targetVerifying, setTargetVerifying] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState(packages[0]?.id || '');
  const [activationLoading, setActivationLoading] = useState(false);
  const [activationMsg, setActivationMsg] = useState<{ type: 'success' | 'error'; text: string; orderNumber?: string } | null>(null);

  // Withdrawal Form
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Refresh data from server
  const refreshWalletData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/wallet/transactions');
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions);
        if (data.wallet) {
          setWallet((prev) => ({
            ...prev,
            mainBalance: data.wallet.mainBalance,
            p2pBalance: data.wallet.p2pBalance,
            shoppingBalance: data.wallet.shoppingBalance,
            totalEarned: data.wallet.totalEarned,
            totalWithdrawn: data.wallet.totalWithdrawn,
          }));
        }
      }
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Lookup member for P2P transfer
  const handleVerifyRecipient = async (code: string) => {
    setP2pRecipientCode(code);
    setP2pMsg(null);
    if (!code || code.trim().length < 3) {
      setP2pVerifiedRecipient(null);
      return;
    }

    setP2pVerifying(true);
    try {
      const res = await fetch(`/api/wallet/search-member?userCode=${encodeURIComponent(code.trim())}`);
      const data = await res.json();
      if (data.success && data.user) {
        if (data.user.userCode === user.userCode) {
          setP2pVerifiedRecipient(null);
          setP2pMsg({ type: 'error', text: 'आप स्वयं को P2P ट्रांसफर नहीं कर सकते (Cannot transfer to yourself)' });
        } else {
          setP2pVerifiedRecipient(data.user);
          setP2pMsg(null);
        }
      } else {
        setP2pVerifiedRecipient(null);
        setP2pMsg({ type: 'error', text: data.error || 'सदस्य नहीं मिला' });
      }
    } catch (err) {
      setP2pVerifiedRecipient(null);
    } finally {
      setP2pVerifying(false);
    }
  };

  // Lookup member for ID Activation
  const handleVerifyTargetMember = async (code: string) => {
    setTargetMemberCode(code);
    setActivationMsg(null);
    if (!code || code.trim().length < 3) {
      setVerifiedTargetMember(null);
      return;
    }

    setTargetVerifying(true);
    try {
      const res = await fetch(`/api/wallet/search-member?userCode=${encodeURIComponent(code.trim())}`);
      const data = await res.json();
      if (data.success && data.user) {
        setVerifiedTargetMember(data.user);
        setActivationMsg(null);
      } else {
        setVerifiedTargetMember(null);
        setActivationMsg({ type: 'error', text: data.error || 'सदस्य नहीं मिला' });
      }
    } catch (err) {
      setVerifiedTargetMember(null);
    } finally {
      setTargetVerifying(false);
    }
  };

  // Submit Main to P2P Transfer
  const handleMainToP2pSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMainToP2pMsg(null);
    setMainToP2pLoading(true);

    try {
      const res = await fetch('/api/wallet/transfer/main-to-p2p', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(mainToP2pAmount),
          remarks: mainToP2pRemarks,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setMainToP2pMsg({ type: 'error', text: data.error || 'ट्रांसफर विफल रहा' });
      } else {
        setMainToP2pMsg({ type: 'success', text: data.message });
        setWallet((prev) => ({
          ...prev,
          mainBalance: data.mainBalance,
          p2pBalance: data.p2pBalance,
        }));
        setMainToP2pAmount('');
        setMainToP2pRemarks('');
        await refreshWalletData();
        setTimeout(() => setShowMainToP2pModal(false), 2000);
      }
    } catch (err: any) {
      setMainToP2pMsg({ type: 'error', text: err.message || 'नेटवर्क त्रुटि' });
    } finally {
      setMainToP2pLoading(false);
    }
  };

  // Submit P2P Transfer
  const handleP2pTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setP2pMsg(null);
    setP2pLoading(true);

    try {
      const res = await fetch('/api/wallet/transfer/p2p', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientCode: p2pRecipientCode.trim(),
          amount: parseFloat(p2pAmount),
          remarks: p2pRemarks,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setP2pMsg({ type: 'error', text: data.error || 'P2P ट्रांसफर विफल रहा' });
      } else {
        setP2pMsg({ type: 'success', text: data.message });
        setWallet((prev) => ({
          ...prev,
          p2pBalance: data.p2pBalance,
        }));
        setP2pAmount('');
        setP2pRemarks('');
        setP2pRecipientCode('');
        setP2pVerifiedRecipient(null);
        await refreshWalletData();
        setTimeout(() => setShowP2pTransferModal(false), 2200);
      }
    } catch (err: any) {
      setP2pMsg({ type: 'error', text: err.message || 'नेटवर्क त्रुटि' });
    } finally {
      setP2pLoading(false);
    }
  };

  // Submit ID Activation
  const handleActivateIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActivationMsg(null);
    setActivationLoading(true);

    try {
      const res = await fetch('/api/wallet/activate-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserCode: activationTarget === 'SELF' ? user.userCode : targetMemberCode.trim(),
          productId: selectedPackageId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setActivationMsg({ type: 'error', text: data.error || 'आईडी एक्टिवेशन विफल रहा' });
      } else {
        setActivationMsg({
          type: 'success',
          text: data.message,
          orderNumber: data.orderNumber,
        });
        setWallet((prev) => ({
          ...prev,
          p2pBalance: data.p2pBalance,
        }));
        if (activationTarget === 'SELF') {
          setUser((prev) => ({ ...prev, isActive: true }));
        }
        await refreshWalletData();
      }
    } catch (err: any) {
      setActivationMsg({ type: 'error', text: err.message || 'नेटवर्क त्रुटि' });
    } finally {
      setActivationLoading(false);
    }
  };

  // Submit Bank Withdrawal
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawMsg(null);
    setWithdrawLoading(true);

    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setWithdrawMsg({ type: 'error', text: data.error || 'विड्रॉल अनुरोध विफल रहा' });
      } else {
        setWithdrawMsg({
          type: 'success',
          text: `विड्रॉल अनुरोध सफल! नेट देय राशि: ₹${data.netPayable.toFixed(2)} (5% एडमिन: ₹${data.adminCharge.toFixed(2)}, 5% TDS: ₹${data.tdsAmount.toFixed(2)})`,
        });
        setWithdrawAmount('');
        await refreshWalletData();
        setTimeout(() => setShowWithdrawModal(false), 2500);
      }
    } catch (err: any) {
      setWithdrawMsg({ type: 'error', text: err.message || 'नेटवर्क त्रुटि' });
    } finally {
      setWithdrawLoading(false);
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    // Tab filter
    if (activeTab === 'MAIN' && tx.walletScope !== 'MAIN') return false;
    if (activeTab === 'P2P' && tx.walletScope !== 'P2P') return false;
    if (activeTab === 'TRANSFERS' && !tx.type.includes('P2P') && !tx.type.includes('MAIN_TO_P2P')) return false;
    if (activeTab === 'ACTIVATIONS' && !tx.type.includes('ACTIVATION')) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = tx.referenceId?.toLowerCase().includes(q);
      const matchRemarks = tx.remarks?.toLowerCase().includes(q);
      const matchType = tx.type.toLowerCase().includes(q);
      const matchCode = tx.counterpartyUserCode?.toLowerCase().includes(q);
      const matchName = tx.counterpartyName?.toLowerCase().includes(q);
      return matchRef || matchRemarks || matchType || matchCode || matchName;
    }

    return true;
  });

  const selectedPackage = packages.find((p) => p.id === selectedPackageId) || packages[0];

  return (
    <div className="space-y-8">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#e8e3d5] rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#eaf5ed] border border-[#144732]/20 flex items-center justify-center text-[#144732]">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#144732] tracking-tight">
                SGM Multi-Wallet Hub (वॉलेट प्रबंधन एवं लेजर)
              </h1>
              <p className="text-xs text-slate-500">
                P2P वॉलेट • मेन इनकम वॉलेट • बैंक विड्रॉल • आईडी एक्टिवेशन
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshWalletData}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#144732]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            href="/orders"
            className="px-4 py-2.5 rounded-xl border-2 border-[#144732] text-[#144732] font-black text-xs hover:bg-[#144732] hover:text-white transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Receipt className="w-4 h-4" />
            <span>Order History (ऑर्डर विवरण)</span>
          </Link>
        </div>
      </div>

      {/* DUAL WALLET HERO CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD 1: MAIN INCOME WALLET */}
        <div className="bg-gradient-to-br from-[#144732] via-[#0f3827] to-[#0b2b1e] text-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-[#d4a359]/40 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-white/10 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/15">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-[#d4a359] flex items-center justify-center text-[#fef08a] shadow-inner">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#fef08a]">
                    1. MAIN INCOME WALLET
                  </span>
                  <div className="text-sm font-bold text-slate-200">
                    मेन इनकम वॉलेट (बैंक विड्रॉल)
                  </div>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Withdrawable
              </span>
            </div>

            <div className="my-6">
              <div className="text-xs text-slate-300 font-medium mb-1">उपलब्ध विड्रॉल बैलेंस:</div>
              <div className="text-4xl sm:text-5xl font-black text-[#fef08a] tracking-tight flex items-baseline gap-1">
                <span>₹{wallet.mainBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                बाइनरी मैचिंग, डायरेक्ट रेफरल, रॉयल्टी व ऑटोपूल की कुल आय। न्यूनतम ₹100 होते ही बैंक खाते में विड्रॉल मान्य।
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/15">
            <div className="grid grid-cols-2 gap-3">
              {/* Button 1: Withdraw to Bank */}
              <button
                onClick={() => {
                  setWithdrawMsg(null);
                  setShowWithdrawModal(true);
                }}
                className="w-full py-3 px-4 rounded-2xl bg-[#d4a359] hover:bg-[#bc853c] text-[#0b2b1e] font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02] cursor-pointer"
              >
                <Building className="w-4 h-4" />
                <span>बैंक विड्रॉल (Withdraw)</span>
              </button>

              {/* Button 2: Transfer Main to P2P */}
              <button
                onClick={() => {
                  setMainToP2pMsg(null);
                  setShowMainToP2pModal(true);
                }}
                className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] cursor-pointer"
              >
                <ArrowRight className="w-4 h-4 text-[#fef08a]" />
                <span>P2P वॉलेट में भेजें</span>
              </button>
            </div>

            <div className="text-[10px] text-slate-300 flex items-center justify-between">
              <span>कुल निकासी (Withdrawn): <strong>₹{wallet.totalWithdrawn.toLocaleString('en-IN')}</strong></span>
              <span>कुल कमाई (Earned): <strong>₹{wallet.totalEarned.toLocaleString('en-IN')}</strong></span>
            </div>
          </div>
        </div>

        {/* CARD 2: P2P WALLET */}
        <div className="bg-gradient-to-br from-[#78350f] via-[#92580a] to-[#5a2707] text-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-[#fef08a]/40 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-white/10 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/15">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-[#fef08a] flex items-center justify-center text-[#fef08a] shadow-inner">
                  <Send className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#fef08a]">
                    2. P2P WALLET (PEER-TO-PEER)
                  </span>
                  <div className="text-sm font-bold text-slate-200">
                    P2P वॉलेट (फंड ट्रांसफर व एक्टिवेशन)
                  </div>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-200 border border-amber-300/30">
                P2P & Packages
              </span>
            </div>

            <div className="my-6">
              <div className="text-xs text-amber-200 font-medium mb-1">उपलब्ध P2P बैलेंस:</div>
              <div className="text-4xl sm:text-5xl font-black text-[#fef08a] tracking-tight flex items-baseline gap-1">
                <span>₹{wallet.p2pBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              
              {/* STRICT RULE NOTICE */}
              <div className="mt-3 p-2.5 rounded-xl bg-black/25 border border-red-400/40 text-[11px] text-amber-100 flex items-start gap-2">
                <Lock className="w-4 h-4 text-red-300 shrink-0 mt-0.5" />
                <span>
                  <strong>सख्त नियम:</strong> P2P वॉलेट से मेन वॉलेट में ट्रांसफर संभव नहीं है। इस बैलेंस से आप अन्य सदस्यों को फंड भेज सकते हैं या पैकेज खरीदकर किसी की भी आईडी एक्टिवेट कर सकते हैं।
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/15">
            <div className="grid grid-cols-2 gap-3">
              {/* Button 1: P2P Fund Transfer */}
              <button
                onClick={() => {
                  setP2pMsg(null);
                  setShowP2pTransferModal(true);
                }}
                className="w-full py-3 px-4 rounded-2xl bg-white text-[#78350f] hover:bg-[#fef08a] font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02] cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>P2P ट्रांसफर (Send)</span>
              </button>

              {/* Button 2: ID Activation / Buy Package */}
              <button
                onClick={() => {
                  setActivationMsg(null);
                  setShowActivateIdModal(true);
                }}
                className="w-full py-3 px-4 rounded-2xl bg-[#fef08a] hover:bg-[#fde047] text-[#0b2b1e] font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02] cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current text-[#92580a]" />
                <span>आईडी एक्टिवेट करें</span>
              </button>
            </div>

            <div className="text-[10px] text-amber-200/90 text-center">
              ✓ इंस्टेंट 0-सेकंड ट्रांसफर • ✓ अपनी व दूसरों की आईडी एक्टिवेशन
            </div>
          </div>
        </div>
      </div>

      {/* QUICK WORKFLOW BAR */}
      <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">
          वॉलेट कार्यप्रणाली एवं नियम (How SGM Wallets Work)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#faf8f4] border border-[#e8e3d5] space-y-1.5">
            <div className="font-black text-[#144732] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>मेन वॉलेट &rarr; बैंक या P2P</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              आपकी सभी 16 प्रकार की डायरेक्ट व बाइनरी इनकम मेन वॉलेट में आती है। इसे सीधे बैंक में विड्रॉल करें (5% एडमिन + 5% TDS) या 1-क्लिक में P2P वॉलेट में बदलें।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#faf8f4] border border-[#e8e3d5] space-y-1.5">
            <div className="font-black text-[#92580a] flex items-center gap-1.5">
              <Send className="w-4 h-4 text-[#92580a]" />
              <span>P2P वॉलेट &rarr; सदस्य फंड ट्रांसफर</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              P2P वॉलेट से किसी भी डाउनलाइन या टीम सदस्य की आईडी (SGM ID) पर बिना किसी कटौती के तत्काल फंड ट्रांसफर करें।
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#faf8f4] border border-[#e8e3d5] space-y-1.5">
            <div className="font-black text-rose-700 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-rose-600" />
              <span>आईडी एक्टिवेशन (Self & Others)</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              P2P वॉलेट बैलेंस से आप अपनी खुद की आईडी या किसी भी अन्य सदस्य की आईडी तुरंत 100 PV / 300 PV / 500 PV पैकेज खरीदकर एक्टिवेट कर सकते हैं।
            </p>
          </div>
        </div>
      </div>

      {/* FULL LEDGER & TRANSACTION HISTORY */}
      <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-[#144732] tracking-tight">
              वॉलेट लेन-देन विस्तृत लेजर (Transaction Ledger)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              सभी क्रेडिट, डेबिट, P2P ट्रांसफर, एक्टिवेशन व विड्रॉल का संपूर्ण विवरण
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="सर्च करें (Tx ID, सदस्य कोड, विवरण)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#144732] focus:outline-none"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'ALL', label: 'All Transactions (सभी)' },
            { id: 'MAIN', label: 'Main Wallet (मेन वॉलेट)' },
            { id: 'P2P', label: 'P2P Wallet (P2P वॉलेट)' },
            { id: 'TRANSFERS', label: 'P2P Transfers (ट्रांसफर)' },
            { id: 'ACTIVATIONS', label: 'ID Activations (एक्टिवेशन)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#144732] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Transactions Table */}
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs space-y-2">
            <Receipt className="w-8 h-8 mx-auto text-slate-300" />
            <div>कोई ट्रांजेक्शन रिकॉर्ड नहीं मिला।</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#faf8f4] text-slate-600 uppercase tracking-wider font-bold">
                  <th className="py-3 px-3">दिनांक व समय</th>
                  <th className="py-3 px-3">वॉलेट</th>
                  <th className="py-3 px-3">प्रकार (Type)</th>
                  <th className="py-3 px-3">प्रतिपक्षी (From / To)</th>
                  <th className="py-3 px-3">विवरण / Ref</th>
                  <th className="py-3 px-3 text-right">राशि (Amount)</th>
                  <th className="py-3 px-3 text-right">शेष (Balance)</th>
                  <th className="py-3 px-3 text-center">रसीद</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => {
                  const isCredit = tx.amount > 0;
                  const isP2p = tx.walletScope === 'P2P';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString('hi-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                        <div className="text-[10px] text-slate-400">
                          {new Date(tx.createdAt).toLocaleTimeString('hi-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            isP2p
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          {isP2p ? 'P2P Wallet' : 'Main Wallet'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap font-bold text-slate-800">
                        {tx.type.replace(/_/g, ' ')}
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {tx.counterpartyUserCode ? (
                          <div className="font-semibold text-slate-700">
                            <span>{tx.counterpartyName || 'Member'}</span>
                            <span className="font-mono text-[10px] text-slate-400 ml-1">
                              ({tx.counterpartyUserCode})
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 max-w-xs truncate text-slate-600" title={tx.remarks || ''}>
                        {tx.remarks || '—'}
                        {tx.referenceId && (
                          <div className="font-mono text-[10px] text-[#92580a]">
                            Ref: {tx.referenceId}
                          </div>
                        )}
                      </td>

                      <td
                        className={`py-3.5 px-3 text-right font-black whitespace-nowrap ${
                          isCredit ? 'text-emerald-700' : 'text-red-600'
                        }`}
                      >
                        {isCredit ? `+₹${tx.amount.toFixed(2)}` : `-₹${Math.abs(tx.amount).toFixed(2)}`}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-700 whitespace-nowrap">
                        ₹{tx.closingBalance.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                          title="View Digital Receipt"
                        >
                          <Receipt className="w-4 h-4 text-[#144732]" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= MODALS ================= */}

      {/* MODAL 1: MAIN TO P2P CONVERSION */}
      {showMainToP2pModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowMainToP2pModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#eaf5ed] text-[#144732] flex items-center justify-center">
                <ArrowRight className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-lg text-[#144732]">
                  मेन वॉलेट &rarr; P2P वॉलेट ट्रांसफर
                </h3>
                <p className="text-xs text-slate-500">
                  Main Wallet to P2P Wallet Conversion (0% Fee)
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs mb-4 flex justify-between items-center">
              <div>
                <div className="text-slate-500">उपलब्ध मेन वॉलेट बैलेंस:</div>
                <div className="font-black text-[#144732] text-lg">
                  ₹{wallet.mainBalance.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-slate-500">वर्तमान P2P बैलेंस:</div>
                <div className="font-black text-[#92580a] text-lg">
                  ₹{wallet.p2pBalance.toFixed(2)}
                </div>
              </div>
            </div>

            {mainToP2pMsg && (
              <div
                className={`p-3 rounded-xl text-xs mb-4 flex items-start gap-2 ${
                  mainToP2pMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {mainToP2pMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <span>{mainToP2pMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleMainToP2pSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ट्रांसफर राशि (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    step="any"
                    min="10"
                    max={wallet.mainBalance}
                    value={mainToP2pAmount}
                    onChange={(e) => setMainToP2pAmount(e.target.value)}
                    placeholder="उदा. 500"
                    required
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-black focus:ring-2 focus:ring-[#144732] focus:outline-none"
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                  <span>न्यूनतम राशि: ₹10</span>
                  <button
                    type="button"
                    onClick={() => setMainToP2pAmount(wallet.mainBalance.toString())}
                    className="text-[#92580a] font-bold hover:underline cursor-pointer"
                  >
                    Use Full Balance
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  टिप्पणी (Remarks / Note)
                </label>
                <input
                  type="text"
                  value={mainToP2pRemarks}
                  onChange={(e) => setMainToP2pRemarks(e.target.value)}
                  placeholder="उदा. Activation fund / Team transfer"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#144732] focus:outline-none"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-tight">
                ⚠️ <strong>कृपया ध्यान दें:</strong> एक बार राशि P2P वॉलेट में ट्रांसफर होने के बाद, उसे वापस मेन वॉलेट में ट्रांसफर नहीं किया जा सकता।
              </div>

              <button
                type="submit"
                disabled={mainToP2pLoading || wallet.mainBalance <= 0}
                className="w-full py-3 rounded-xl bg-[#144732] hover:bg-[#0f3827] text-white font-black text-xs shadow-lg transition-transform hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
              >
                {mainToP2pLoading ? 'ट्रांसफर हो रहा है...' : 'तुरंत P2P वॉलेट में ट्रांसफर करें'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: P2P MEMBER TRANSFER */}
      {showP2pTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowP2pTransferModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#92580a] flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-lg text-[#144732]">
                  P2P फंड ट्रांसफर (Member-to-Member)
                </h3>
                <p className="text-xs text-slate-500">
                  किसी भी सदस्य को P2P वॉलेट से सीधे बैलेंस भेजें
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200 text-xs mb-4 flex justify-between items-center">
              <div>
                <div className="text-slate-500">उपलब्ध P2P बैलेंस:</div>
                <div className="font-black text-[#92580a] text-lg">
                  ₹{wallet.p2pBalance.toFixed(2)}
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                0% ट्रांसफर शुल्क
              </span>
            </div>

            {p2pMsg && (
              <div
                className={`p-3 rounded-xl text-xs mb-4 flex items-start gap-2 ${
                  p2pMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {p2pMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <span>{p2pMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleP2pTransferSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  प्राप्तकर्ता सदस्य कोड (Recipient ID) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={p2pRecipientCode}
                    onChange={(e) => handleVerifyRecipient(e.target.value.toUpperCase())}
                    placeholder="उदा. SGM10002"
                    required
                    className="w-full uppercase font-mono px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:ring-2 focus:ring-[#144732] focus:outline-none"
                  />
                  {p2pVerifying && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      सत्यापन जारी...
                    </span>
                  )}
                </div>

                {p2pVerifiedRecipient && (
                  <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold">
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <span>{p2pVerifiedRecipient.name}</span>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      p2pVerifiedRecipient.isActive ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                    }`}>
                      {p2pVerifiedRecipient.isActive ? 'Active' : 'Pending'}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ट्रांसफर राशि (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    step="any"
                    min="10"
                    max={wallet.p2pBalance}
                    value={p2pAmount}
                    onChange={(e) => setP2pAmount(e.target.value)}
                    placeholder="उदा. 350"
                    required
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-black focus:ring-2 focus:ring-[#144732] focus:outline-none"
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                  <span>न्यूनतम राशि: ₹10</span>
                  <button
                    type="button"
                    onClick={() => setP2pAmount(wallet.p2pBalance.toString())}
                    className="text-[#92580a] font-bold hover:underline cursor-pointer"
                  >
                    Full Balance
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  रिमार्क / संदेश (Remarks)
                </label>
                <input
                  type="text"
                  value={p2pRemarks}
                  onChange={(e) => setP2pRemarks(e.target.value)}
                  placeholder="उदा. Package topup"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#144732] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={p2pLoading || !p2pVerifiedRecipient || wallet.p2pBalance <= 0}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#92580a] to-[#78350f] hover:opacity-95 text-white font-black text-xs shadow-lg transition-transform hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
              >
                {p2pLoading ? 'भेजा जा रहा है...' : 'तुरंत P2P फंड ट्रांसफर करें'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ID ACTIVATION VIA PACKAGE (SELF & OTHERS) */}
      {showActivateIdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 my-8">
            <button
              onClick={() => setShowActivateIdModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#92580a] flex items-center justify-center">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="font-black text-lg text-[#144732]">
                  आईडी एक्टिवेशन (Buy Package via P2P)
                </h3>
                <p className="text-xs text-slate-500">
                  स्वयं या किसी भी टीम सदस्य की आईडी तुरंत एक्टिवेट करें
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs mb-4 flex justify-between items-center">
              <div>
                <div className="text-slate-500">उपलब्ध P2P बैलेंस:</div>
                <div className="font-black text-[#92580a] text-lg">
                  ₹{wallet.p2pBalance.toFixed(2)}
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                100% P2P वॉलेट भुगतान
              </span>
            </div>

            {activationMsg && (
              <div
                className={`p-3 rounded-xl text-xs mb-4 flex flex-col gap-1.5 ${
                  activationMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                    : 'bg-red-50 text-red-900 border border-red-300'
                }`}
              >
                <div className="flex items-start gap-2">
                  {activationMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <span className="font-bold">{activationMsg.text}</span>
                </div>
                {activationMsg.orderNumber && (
                  <div className="text-[11px] font-mono text-emerald-800 pl-6 flex items-center justify-between">
                    <span>ऑर्डर संख्या: {activationMsg.orderNumber}</span>
                    <Link
                      href={`/orders/${activationMsg.orderNumber}`}
                      className="underline font-bold text-[#144732]"
                    >
                      रसीद देखें &rarr;
                    </Link>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleActivateIdSubmit} className="space-y-4">
              {/* Target Selector: Self vs Other */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  किसकी आईडी एक्टिवेट करनी है? (Select Target) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActivationTarget('SELF');
                      setActivationMsg(null);
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      activationTarget === 'SELF'
                        ? 'bg-[#144732] text-white border-[#144732] shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    स्वयं की आईडी (Self: {user.userCode})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActivationTarget('OTHER');
                      setActivationMsg(null);
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      activationTarget === 'OTHER'
                        ? 'bg-[#144732] text-white border-[#144732] shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    अन्य सदस्य की आईडी (Other Member)
                  </button>
                </div>
              </div>

              {/* If Other Member: Enter Member Code with Live Verification */}
              {activationTarget === 'OTHER' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    सदस्य कोड (Member ID) दर्ज करें *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={targetMemberCode}
                      onChange={(e) => handleVerifyTargetMember(e.target.value.toUpperCase())}
                      placeholder="उदा. SGM10003"
                      required
                      className="w-full uppercase font-mono px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:ring-2 focus:ring-[#144732] focus:outline-none"
                    />
                    {targetVerifying && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                        जाँच जारी...
                      </span>
                    )}
                  </div>

                  {verifiedTargetMember && (
                    <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span>{verifiedTargetMember.name} ({verifiedTargetMember.userCode})</span>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        verifiedTargetMember.isActive ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                      }`}>
                        {verifiedTargetMember.isActive ? 'Already Active' : 'Inactive (Ready to Activate)'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Select Activation Package */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  एक्टिवेशन पैकेज का चयन करें (Select Package) *
                </label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {packages.map((pkg) => {
                    const isSelected = selectedPackageId === pkg.id;
                    const canAfford = wallet.p2pBalance >= pkg.dpPrice;

                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-[#144732] bg-[#eaf5ed] ring-2 ring-[#144732]'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="activationPackage"
                            checked={isSelected}
                            onChange={() => setSelectedPackageId(pkg.id)}
                            className="text-[#144732] focus:ring-[#144732]"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{pkg.title}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              MRP: <del>₹{pkg.mrp}</del> • <strong>DP: ₹{pkg.dpPrice}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-black text-[#144732] bg-emerald-100 px-2 py-0.5 rounded-md text-[11px]">
                            {pkg.pv} PV
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {pkg.bv} BV
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Package Summary Box */}
              {selectedPackage && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">पैकेज राशि (DP Price):</span>
                    <strong className="text-slate-900 font-mono">₹{selectedPackage.dpPrice}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">क्रेडिट होने वाले पॉइंट्स:</span>
                    <strong className="text-emerald-700">{selectedPackage.pv} PV ({selectedPackage.bv} BV)</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1 mt-1">
                    <span className="font-bold text-slate-700">P2P वॉलेट से कटेगा:</span>
                    <strong className="text-red-600 font-black font-mono">₹{selectedPackage.dpPrice}</strong>
                  </div>
                  {wallet.p2pBalance < selectedPackage.dpPrice && (
                    <div className="text-red-600 font-bold text-[11px] pt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>अपर्याप्त बैलेंस। कृपया मेन वॉलेट से P2P में फंड बदलें।</span>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  activationLoading ||
                  !selectedPackage ||
                  wallet.p2pBalance < selectedPackage.dpPrice ||
                  (activationTarget === 'OTHER' && !verifiedTargetMember)
                }
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#144732] to-[#0b2b1e] hover:opacity-95 text-white font-black text-xs shadow-lg transition-transform hover:scale-[1.01] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current text-[#fef08a]" />
                <span>
                  {activationLoading
                    ? 'प्रोसेस हो रहा है...'
                    : `₹${selectedPackage?.dpPrice || 0} भुगतान कर तुरंत एक्टिवेट करें`}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: BANK WITHDRAWAL */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowWithdrawModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#eaf5ed] text-[#144732] flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-lg text-[#144732]">
                  बैंक विड्रॉल अनुरोध (Bank Withdrawal)
                </h3>
                <p className="text-xs text-slate-500">
                  साप्ताहिक ट्रांसफर • 5% एडमिन + 5% TDS कटौती
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs mb-4 flex justify-between items-center">
              <div>
                <div className="text-slate-500">उपलब्ध विड्रॉल बैलेंस:</div>
                <div className="font-black text-[#144732] text-lg">
                  ₹{wallet.mainBalance.toFixed(2)}
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                न्यूनतम ₹100
              </span>
            </div>

            {withdrawMsg && (
              <div
                className={`p-3 rounded-xl text-xs mb-4 flex items-start gap-2 ${
                  withdrawMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {withdrawMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <span>{withdrawMsg.text}</span>
              </div>
            )}

            {/* Linked Bank Snapshot */}
            {user.kycDetail?.bankAccountNumber ? (
              <div className="p-3 rounded-2xl bg-[#faf8f4] border border-[#e8e3d5] text-xs space-y-1 mb-4">
                <div className="font-bold text-[#144732] flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>रजिस्टर्ड बैंक खाता (Linked Bank)</span>
                </div>
                <div className="text-slate-700">
                  बैंक: <strong>{user.kycDetail.bankName}</strong> • A/c: <strong className="font-mono">{user.kycDetail.bankAccountNumber}</strong>
                </div>
                <div className="text-slate-500 text-[11px]">
                  खाताधारक: {user.kycDetail.accountHolderName} • IFSC: {user.kycDetail.ifscCode}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 mb-4">
                ⚠️ आपका बैंक खाता अभी तक लिंक नहीं है। विड्रॉल करने से पहले KYC पेज पर बैंक विवरण दर्ज करें।
                <div className="mt-2">
                  <Link href="/kyc" className="font-bold text-[#144732] underline">
                    Update Bank Details &rarr;
                  </Link>
                </div>
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  विड्रॉल राशि (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    step="any"
                    min="100"
                    max={wallet.mainBalance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="उदा. 1000"
                    required
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-black focus:ring-2 focus:ring-[#144732] focus:outline-none"
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                  <span>न्यूनतम: ₹100</span>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(wallet.mainBalance.toString())}
                    className="text-[#92580a] font-bold hover:underline cursor-pointer"
                  >
                    Full Balance
                  </button>
                </div>
              </div>

              {/* Dynamic Deductions Calculator */}
              {parseFloat(withdrawAmount) >= 100 && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">अनुरोध राशि:</span>
                    <strong className="text-slate-900 font-mono">₹{parseFloat(withdrawAmount).toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>5% एडमिन चार्ज:</span>
                    <span>-₹{(parseFloat(withdrawAmount) * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>5% सरकारी TDS:</span>
                    <span>-₹{(parseFloat(withdrawAmount) * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1 mt-1">
                    <span className="font-bold text-[#144732]">बैंक में आने वाली शुद्ध राशि (90%):</span>
                    <strong className="text-emerald-700 font-black text-sm font-mono">
                      ₹{(parseFloat(withdrawAmount) * 0.90).toFixed(2)}
                    </strong>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  withdrawLoading ||
                  !user.kycDetail?.bankAccountNumber ||
                  parseFloat(withdrawAmount) < 100 ||
                  parseFloat(withdrawAmount) > wallet.mainBalance
                }
                className="w-full py-3 rounded-xl bg-[#144732] hover:bg-[#0f3827] text-white font-black text-xs shadow-lg transition-transform hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
              >
                {withdrawLoading ? 'अनुरोध दर्ज हो रहा है...' : 'विड्रॉल अनुरोध सबमिट करें'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: DIGITAL TRANSACTION RECEIPT */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedTx(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-full bg-[#144732] text-[#fef08a] flex items-center justify-center mx-auto mb-2 shadow-md">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="font-black text-lg text-[#144732]">SGM MART TRANSACTION RECEIPT</h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {selectedTx.id}</p>
            </div>

            <div className="my-5 text-center">
              <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">राशि (Amount)</div>
              <div
                className={`text-3xl font-black mt-1 ${
                  selectedTx.amount > 0 ? 'text-emerald-700' : 'text-red-600'
                }`}
              >
                {selectedTx.amount > 0 ? `+₹${selectedTx.amount.toFixed(2)}` : `-₹${Math.abs(selectedTx.amount).toFixed(2)}`}
              </div>
              <div className="text-xs font-bold text-slate-600 mt-1">
                {selectedTx.type.replace(/_/g, ' ')}
              </div>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">वॉलेट (Scope):</span>
                <strong className="text-slate-900">{selectedTx.walletScope === 'P2P' ? 'P2P Wallet' : 'Main Wallet'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">दिनांक व समय:</span>
                <span className="text-slate-800 font-mono">
                  {new Date(selectedTx.createdAt).toLocaleString('hi-IN')}
                </span>
              </div>
              {selectedTx.counterpartyUserCode && (
                <div className="flex justify-between">
                  <span className="text-slate-500">प्रतिपक्षी (Counterparty):</span>
                  <span className="font-bold text-slate-800">
                    {selectedTx.counterpartyName} ({selectedTx.counterpartyUserCode})
                  </span>
                </div>
              )}
              {selectedTx.referenceId && (
                <div className="flex justify-between">
                  <span className="text-slate-500">संदर्भ (Ref ID):</span>
                  <span className="font-mono text-slate-800">{selectedTx.referenceId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">लेन-देन के बाद शेष:</span>
                <strong className="text-slate-900 font-mono">₹{selectedTx.closingBalance.toFixed(2)}</strong>
              </div>
              {selectedTx.remarks && (
                <div className="border-t border-slate-200 pt-2 mt-2">
                  <div className="text-slate-500 text-[10px]">विवरण / टिप्पणी:</div>
                  <div className="text-slate-800 mt-0.5">{selectedTx.remarks}</div>
                </div>
              )}
            </div>

            <div className="mt-5">
              <button
                onClick={() => setSelectedTx(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 transition-colors cursor-pointer"
              >
                बंद करें (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

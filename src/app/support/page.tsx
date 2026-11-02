'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import MemberNavbar from '@/components/MemberNavbar';
import ImageUploader from '@/components/ImageUploader';
import {
  HelpCircle,
  Plus,
  ArrowLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  RefreshCw,
  Send,
  X,
  FileText,
  ShieldCheck,
  Building,
  Wallet,
  ShoppingBag,
  Layers,
  Users,
  Smartphone,
  ExternalLink
} from 'lucide-react';

interface Ticket {
  id: string;
  ticketNumber: string;
  category: string;
  subject: string;
  description: string;
  attachmentUrl: string | null;
  priority: string;
  status: string;
  adminReply: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

const CATEGORIES: Record<string, { label: string; icon: any }> = {
  KYC_ISSUE: { label: 'KYC & Bank Verification (केवाईसी समस्या)', icon: ShieldCheck },
  WITHDRAWAL_PAYOUT: { label: 'Withdrawal & Payout (विड्रॉल समस्या)', icon: Wallet },
  WALLET_TOPUP: { label: 'Wallet & Fund Deposit (फंड समस्या)', icon: Building },
  ORDER_DELIVERY: { label: 'Orders & Product Delivery (ऑर्डर/डिलीवरी)', icon: ShoppingBag },
  AUTOPOOL_ISSUE: { label: 'AutoPool Matrix (ऑटोपूल समस्या)', icon: Layers },
  DOWNLINE_PLACEMENT: { label: 'Downline & Placement (डाउनलाइन समस्या)', icon: Users },
  UTILITY_RECHARGE: { label: 'Mobile / DTH Recharge (रिचार्ज समस्या)', icon: Smartphone },
  GENERAL_QUERY: { label: 'General / Other Query (सामान्य सहायता)', icon: HelpCircle },
};

export default function SupportTicketsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [summary, setSummary] = useState({ total: 0, open: 0, resolved: 0 });

  // Filter
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Form State
  const [category, setCategory] = useState('GENERAL_QUERY');
  const [priority, setPriority] = useState('MEDIUM');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/support/tickets');
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load tickets');
      setTickets(data.tickets || []);
      setSummary(data.summary || { total: 0, open: 0, resolved: 0 });
    } catch (err: any) {
      setError(err.message || 'Error loading tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setError('विषय एवं विवरण दर्ज करना अनिवार्य है।');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          priority,
          subject,
          description,
          attachmentUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ticket creation failed');

      setSuccess(data.message || 'सपोर्ट टिकट सफलतापूर्वक दर्ज हुआ!');
      setSubject('');
      setDescription('');
      setAttachmentUrl('');
      setIsModalOpen(false);
      fetchTickets();
    } catch (err: any) {
      setError(err.message || 'Error submitting ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter === 'OPEN') return t.status === 'OPEN' || t.status === 'IN_PROGRESS';
    if (statusFilter === 'RESOLVED') return t.status === 'RESOLVED' || t.status === 'CLOSED';
    return true;
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
          <span className="text-[#144732] font-bold">Support Tickets</span>
        </div>

        {/* Hero Header */}
        <div className="bg-gradient-to-r from-[#0b2b1e] via-[#144732] to-[#0b2b1e] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#d4a359]/30 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#fef08a] text-xs font-bold uppercase tracking-wider mb-2 border border-white/10">
                <HelpCircle className="w-3.5 h-3.5" />
                24x7 Member Helpdesk & Resolution
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Support Tickets (सहायता टिकट)
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-xl">
                केवाईसी, विड्रॉल, ऑटोपूल, वॉलेट, ऑर्डर अथवा किसी भी समस्या हेतु टिकट दर्ज करें। एडमिन टीम द्वारा त्वरित समाधान दिया जाएगा।
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-3 rounded-xl bg-[#d4a359] hover:bg-[#c39248] text-[#0b2b1e] text-xs font-black flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Ticket (नया टिकट)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Summary Badges & Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Tickets (कुल टिकट)
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {summary.total}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Open / In Progress (प्रक्रियाधीन)
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
                {summary.open}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Resolved & Closed (निस्तारित)
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
                {summary.resolved}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({summary.total})
            </button>
            <button
              onClick={() => setStatusFilter('OPEN')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                statusFilter === 'OPEN'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-700 hover:text-amber-800'
              }`}
            >
              Active ({summary.open})
            </button>
            <button
              onClick={() => setStatusFilter('RESOLVED')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                statusFilter === 'RESOLVED'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:text-emerald-800'
              }`}
            >
              Resolved ({summary.resolved})
            </button>
          </div>

          <button
            onClick={fetchTickets}
            className="p-2 rounded-xl text-slate-500 hover:text-[#144732] hover:bg-slate-100 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80">
              <RefreshCw className="w-8 h-8 text-[#144732] animate-spin mx-auto mb-3" />
              <div className="text-xs font-bold text-slate-500">Loading Support Tickets...</div>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-black text-slate-800">
                {tickets.length === 0 ? 'No Support Tickets Found' : 'No Matching Tickets'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {tickets.length === 0
                  ? 'यदि आपको कोई समस्या या पूछताछ है, तो ऊपर दिए बटन से नया टिकट दर्ज करें।'
                  : 'फ़िल्टर बदलकर पुनः प्रयास करें।'}
              </p>
            </div>
          ) : (
            filteredTickets.map((ticket) => {
              const catMeta = CATEGORIES[ticket.category] || {
                label: ticket.category,
                icon: HelpCircle,
              };
              const CatIcon = catMeta.icon;

              return (
                <div
                  key={ticket.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 space-y-4 hover:border-[#144732]/30 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#eaf5ed] text-[#144732] flex items-center justify-center shrink-0">
                        <CatIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#144732] bg-[#eaf5ed] px-2 py-0.5 rounded-md">
                            {ticket.ticketNumber}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {new Date(ticket.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <h3 className="font-black text-slate-900 text-sm mt-1">{ticket.subject}</h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {/* Priority */}
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          ticket.priority === 'URGENT'
                            ? 'bg-rose-100 text-rose-800'
                            : ticket.priority === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {ticket.priority} Priority
                      </span>

                      {/* Status */}
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1 ${
                          ticket.status === 'RESOLVED' || ticket.status === 'CLOSED'
                            ? 'bg-emerald-500 text-white'
                            : ticket.status === 'IN_PROGRESS'
                            ? 'bg-purple-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        <span>{ticket.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Problem Description */}
                  <div className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl whitespace-pre-wrap leading-relaxed">
                    <span className="font-bold text-slate-900 block mb-1">विवरण:</span>
                    {ticket.description}
                  </div>

                  {/* Attachment if present */}
                  {ticket.attachmentUrl && (
                    <div className="text-xs">
                      <a
                        href={ticket.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:underline font-bold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Attachment Screenshot (संलग्न प्रमाण देखें)</span>
                      </a>
                    </div>
                  )}

                  {/* Admin Resolution Reply */}
                  {ticket.adminReply ? (
                    <div className="bg-[#eaf5ed] border-l-4 border-emerald-600 p-4 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between text-emerald-900 font-black">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Admin Resolution Reply (एडमिन समाधान उत्तर):</span>
                        </span>
                        {ticket.resolvedAt && (
                          <span className="text-[10px] font-normal text-emerald-700">
                            {new Date(ticket.resolvedAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-800 font-medium whitespace-pre-wrap pt-1">
                        {ticket.adminReply}
                      </p>
                      {ticket.resolvedBy && (
                        <div className="text-[10px] text-slate-500 text-right pt-1">
                          Resolved by: {ticket.resolvedBy}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-[11px] text-amber-700 bg-amber-50 px-3 py-2 rounded-lg flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        यह टिकट समीक्षा हेतु कतार में है। एडमिन द्वारा समाधान होते ही उत्तर यहाँ प्रदर्शित होगा।
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Create Ticket Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mb-5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#144732]/10 text-[#144732] text-[10px] font-black uppercase tracking-wider mb-1">
                  <Plus className="w-3 h-3" />
                  New Support Ticket
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  नया सहायता टिकट दर्ज करें
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  कृपया अपनी समस्या का सही वर्ग चुनें और स्पष्ट विवरण लिखें।
                </p>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    समस्या का प्रकार (Category) *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#144732]/20"
                  >
                    {Object.entries(CATEGORIES).map(([catKey, catVal]) => (
                      <option key={catKey} value={catKey}>
                        {catVal.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    प्राथमिकता (Priority)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['LOW', 'MEDIUM', 'HIGH'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all ${
                          priority === p
                            ? 'bg-[#144732] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    विषय (Subject / Title) *
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. बैंक पासबुक वेरिफिकेशन लंबित है या विड्रॉल समस्या"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#144732]/20"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    समस्या का विस्तृत विवरण (Problem Description) *
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="कृपया अपनी समस्या, तिथि या रेफरेंस नंबर विस्तार से लिखें..."
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#144732]/20"
                  />
                </div>

                {/* Screenshot Upload (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    स्क्रीनशॉट अथवा प्रमाण फोटो (Optional Screenshot)
                  </label>
                  <ImageUploader
                    label="समस्या का स्क्रीनशॉट अपलोड करें"
                    value={attachmentUrl}
                    onChange={(url: string) => setAttachmentUrl(url)}
                    folder="general"
                  />
                </div>

                {/* Submit */}
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0b2b1e] to-[#144732] text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow transition-all active:scale-95 disabled:opacity-50"
                  >
                    {submitting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5 text-[#fef08a]" />
                    )}
                    <span>{submitting ? 'Submitting...' : 'Submit Ticket'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

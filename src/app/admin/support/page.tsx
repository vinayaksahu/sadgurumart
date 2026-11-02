'use client';

import React, { useState, useEffect } from 'react';
import AdminNavbar from '@/components/AdminNavbar';
import {
  HelpCircle,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Send,
  X,
  User,
  ShieldCheck,
  Building,
  Wallet,
  ShoppingBag,
  Layers,
  Users,
  Smartphone
} from 'lucide-react';

interface AdminTicket {
  id: string;
  ticketNumber: string;
  category: string;
  subject: string;
  description: string;
  attachmentUrl: string | null;
  priority: string;
  status: string;
  adminReply: string | null;
  createdAt: string;
  user: {
    id: string;
    userCode: string;
    name: string;
    mobile: string;
    email: string | null;
  };
  resolvedBy: {
    fullName: string;
    username: string;
  } | null;
  resolvedAt: string | null;
}

const CATEGORY_NAMES: Record<string, string> = {
  KYC_ISSUE: 'KYC & Bank',
  WITHDRAWAL_PAYOUT: 'Withdrawal / Payout',
  WALLET_TOPUP: 'Wallet / Fund',
  ORDER_DELIVERY: 'Orders & Delivery',
  AUTOPOOL_ISSUE: 'AutoPool Matrix',
  DOWNLINE_PLACEMENT: 'Downline / Team',
  UTILITY_RECHARGE: 'Recharge',
  GENERAL_QUERY: 'General Query',
};

export default function AdminSupportPage() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [summary, setSummary] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal for Reply / Resolve
  const [selectedTicket, setSelectedTicket] = useState<AdminTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [newStatus, setNewStatus] = useState('RESOLVED');
  const [resolving, setResolving] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    setError('');
    try {
      let url = '/api/admin/support?';
      if (statusFilter !== 'ALL') url += `status=${statusFilter}&`;
      if (categoryFilter !== 'ALL') url += `category=${categoryFilter}&`;
      if (searchTerm.trim()) url += `search=${encodeURIComponent(searchTerm.trim())}&`;

      const res = await fetch(url);
      if (res.status === 401) {
        window.location.href = '/adminlogin';
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load tickets');
      setTickets(data.tickets || []);
      setSummary(data.summary || { total: 0, open: 0, inProgress: 0, resolved: 0 });
    } catch (err: any) {
      setError(err.message || 'Error fetching tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, categoryFilter]);

  const handleOpenModal = (ticket: AdminTicket) => {
    setSelectedTicket(ticket);
    setReplyText(ticket.adminReply || '');
    setNewStatus(ticket.status === 'OPEN' ? 'RESOLVED' : ticket.status);
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setResolving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/support/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          status: newStatus,
          adminReply: replyText,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resolve ticket');

      setSuccess(data.message || 'टिकट समाधान सफलतापूर्वक सहेजा गया!');
      setSelectedTicket(null);
      fetchTickets();
    } catch (err: any) {
      setError(err.message || 'Error resolving ticket');
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AdminNavbar
        title="Admin Support Desk"
        subtitle="Member Grievance & Ticket Resolution Console"
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-[#1e40af] via-[#2563eb] to-[#3b82f6] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider mb-2 border border-white/20">
                <HelpCircle className="w-3.5 h-3.5" />
                Staff Support & Helpdesk Desk
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Support Tickets Management (सहायता टिकट प्रबंधन)
              </h1>
              <p className="text-xs text-blue-100 mt-1 max-w-xl">
                सदस्यों द्वारा दर्ज समस्याओं (KYC, विड्रॉल, ऑटोपूल, वॉलेट) की समीक्षा करें एवं त्वरित समाधान प्रदान करें।
              </p>
            </div>

            <button
              onClick={fetchTickets}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 border border-white/20 transition-all self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Desk</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Tickets
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {summary.total}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                Open (लंबित)
              </div>
              <div className="text-2xl sm:text-3xl font-black text-rose-600 mt-1">
                {summary.open}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                In Progress
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
                {summary.inProgress}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Resolved
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

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchTickets();
            }}
            className="relative flex-1 max-w-md"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Ticket #, Member ID, Name..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="OPEN">Open Only</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="KYC_ISSUE">KYC & Bank</option>
              <option value="WITHDRAWAL_PAYOUT">Withdrawal</option>
              <option value="WALLET_TOPUP">Wallet / Topup</option>
              <option value="ORDER_DELIVERY">Orders</option>
              <option value="AUTOPOOL_ISSUE">AutoPool</option>
              <option value="DOWNLINE_PLACEMENT">Downline</option>
              <option value="UTILITY_RECHARGE">Recharge</option>
              <option value="GENERAL_QUERY">General</option>
            </select>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
              <div className="text-xs font-bold text-slate-500">Loading Tickets...</div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-800">No Support Tickets Found</div>
              <div className="text-xs text-slate-400 mt-1">सभी सहायता टिकट निस्तारित हैं।</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Ticket #</th>
                    <th className="py-3 px-4">Member Info</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Subject & Details</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-mono font-black text-blue-600">
                        {t.ticketNumber}
                        <div className="text-[10px] uppercase font-bold text-slate-400">
                          {t.priority}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{t.user.name}</div>
                        <div className="font-mono text-[11px] text-[#144732] font-bold">
                          {t.user.userCode}
                        </div>
                        <div className="text-[10px] text-slate-400">{t.user.mobile}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-700">
                          {CATEGORY_NAMES[t.category] || t.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 truncate">{t.subject}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                          {t.description}
                        </div>
                        {t.attachmentUrl && (
                          <a
                            href={t.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline mt-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Attachment</span>
                          </a>
                        )}
                        {t.adminReply && (
                          <div className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded mt-1 line-clamp-1">
                            Reply: {t.adminReply}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            t.status === 'RESOLVED' || t.status === 'CLOSED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.status === 'IN_PROGRESS'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-rose-100 text-rose-800 animate-pulse'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(t.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenModal(t)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
                        >
                          Resolve / Reply
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Reply / Resolve Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedTicket(null)}
                className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mb-4">
                <span className="font-mono font-bold text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {selectedTicket.ticketNumber}
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-1">
                  {selectedTicket.subject}
                </h2>
                <div className="text-xs text-slate-500 mt-0.5">
                  Member: {selectedTicket.user.name} ({selectedTicket.user.userCode}) •{' '}
                  {selectedTicket.user.mobile}
                </div>
              </div>

              {/* Problem details */}
              <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-700 mb-4 whitespace-pre-wrap leading-relaxed">
                <span className="font-bold text-slate-900 block mb-1">सदस्य की समस्या:</span>
                {selectedTicket.description}
                {selectedTicket.attachmentUrl && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <a
                      href={selectedTicket.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>प्रमाण स्क्रीनशॉट देखें</span>
                    </a>
                  </div>
                )}
              </div>

              <form onSubmit={handleResolveSubmit} className="space-y-4">
                {/* Status select */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    टिकट का स्टेटस (Ticket Status) *
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="OPEN">OPEN (लंबित)</option>
                    <option value="IN_PROGRESS">IN_PROGRESS (प्रक्रियाधीन)</option>
                    <option value="RESOLVED">RESOLVED (समाधान हो गया)</option>
                    <option value="CLOSED">CLOSED (बंद करें)</option>
                  </select>
                </div>

                {/* Reply */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    एडमिन उत्तर / समाधान संदेश (Admin Resolution Reply) *
                  </label>
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="सदस्य को समाधान या निर्देश लिखें (यह सदस्य के पोर्टल में दिखेगा)..."
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Buttons */}
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resolving}
                    className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {resolving ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>{resolving ? 'Saving...' : 'Submit Resolution'}</span>
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

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Zap,
  ArrowLeft,
  Search,
  Receipt,
  ExternalLink,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  Calendar,
  Wallet,
  Sparkles,
  ChevronRight,
  Filter
} from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  unitMrp: number;
  unitDp: number;
  unitPV: number;
  unitBV: number;
  product: {
    id: string;
    title: string;
    slug: string;
    images?: string[];
  };
}

interface OrderData {
  id: string;
  orderNumber: string;
  totalMrp: number;
  totalDp: number;
  totalDiscount: number;
  deliveryFee: number;
  totalPV: number;
  totalBV: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  isActivation: boolean;
  targetUserCode?: string | null;
  notes?: string | null;
  createdAt: string;
  items: OrderItem[];
}

interface Props {
  initialOrders: OrderData[];
  currentUserCode: string;
}

export default function OrdersView({ initialOrders, currentUserCode }: Props) {
  const [orders, setOrders] = useState<OrderData[]>(initialOrders);
  const [filterType, setFilterType] = useState<'ALL' | 'STORE' | 'ACTIVATION'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  const filteredOrders = orders.filter((ord) => {
    if (filterType === 'STORE' && ord.isActivation) return false;
    if (filterType === 'ACTIVATION' && !ord.isActivation) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = ord.orderNumber.toLowerCase().includes(q);
      const matchTarget = ord.targetUserCode?.toLowerCase().includes(q);
      const matchNotes = ord.notes?.toLowerCase().includes(q);
      const matchItem = ord.items.some((i) => i.product.title.toLowerCase().includes(q));
      return matchNum || matchTarget || matchNotes || matchItem;
    }

    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#e8e3d5] rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-[#144732] tracking-tight">
                Order History & Details (ऑर्डर विवरण व इतिहास)
              </h1>
              <p className="text-xs text-slate-500">
                ई-कॉमर्स शॉपिंग ऑर्डर्स एवं P2P आईडी एक्टिवेशन पैकेज विवरण
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/wallet"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#92580a] to-[#78350f] text-white font-black text-xs hover:opacity-95 transition-all flex items-center gap-2 shadow-sm"
          >
            <Wallet className="w-4 h-4" />
            <span>P2P / Main Wallet &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white border border-[#e8e3d5] rounded-2xl p-4 shadow-sm">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'ALL', label: `All Orders (${orders.length})` },
            { id: 'STORE', label: 'E-Commerce Store' },
            { id: 'ACTIVATION', label: 'ID Activation Packages' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === tab.id
                  ? 'bg-[#144732] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order #, product or ID..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#144732] focus:outline-none"
          />
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-[#e8e3d5] rounded-3xl p-12 text-center text-slate-400 text-xs space-y-3 shadow-sm">
          <ShoppingBag className="w-12 h-12 mx-auto text-slate-300" />
          <div className="font-bold text-slate-600 text-sm">कोई ऑर्डर नहीं मिला (No orders found)</div>
          <p className="max-w-md mx-auto text-slate-400">
            आपने अभी तक कोई शॉपिंग ऑर्डर या आईडी एक्टिवेशन पैकेज नहीं खरीदा है।
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/store"
              className="px-4 py-2 rounded-xl bg-[#144732] text-white font-bold text-xs hover:bg-[#0f3827]"
            >
              Visit Store (शॉपिंग करें)
            </Link>
            <Link
              href="/wallet"
              className="px-4 py-2 rounded-xl border border-[#92580a] text-[#92580a] font-bold text-xs hover:bg-amber-50"
            >
              Activate ID via P2P
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((ord) => {
            const isAct = ord.isActivation;
            const isForOther = ord.targetUserCode && ord.targetUserCode !== currentUserCode;

            return (
              <div
                key={ord.id}
                className="bg-white border border-[#e8e3d5] rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow space-y-4"
              >
                {/* Top Info Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 gap-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono font-black text-sm text-[#144732]">
                      {ord.orderNumber}
                    </span>

                    {/* Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                        isAct
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}
                    >
                      {isAct ? (
                        <>
                          <Zap className="w-3 h-3 fill-current text-amber-700" />
                          <span>ID Activation (P2P)</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3 h-3 text-emerald-700" />
                          <span>Store Purchase</span>
                        </>
                      )}
                    </span>

                    {/* Target User if other */}
                    {isForOther && (
                      <span className="bg-purple-100 text-purple-900 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Target: {ord.targetUserCode}
                      </span>
                    )}

                    {/* Payment Status */}
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{ord.paymentStatus}</span>
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(ord.createdAt).toLocaleDateString('hi-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      •{' '}
                      {new Date(ord.createdAt).toLocaleTimeString('hi-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Items & Product Summary */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-8 space-y-2">
                    {ord.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                          {item.product.images && item.product.images[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ShoppingBag className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs text-slate-800 truncate">
                            {item.product.title}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Qty: <strong>{item.quantity}</strong> • DP Price: ₹{item.unitDp} •{' '}
                            <span className="text-emerald-700 font-semibold">{item.unitPV} PV</span> (
                            {item.unitBV} BV)
                          </div>
                        </div>
                      </div>
                    ))}

                    {ord.notes && (
                      <div className="text-[11px] text-slate-500 italic bg-[#faf8f4] p-2 rounded-xl border border-slate-100">
                        {ord.notes}
                      </div>
                    )}
                  </div>

                  {/* Financial & Action Box */}
                  <div className="md:col-span-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">कुल भुगतान (Paid):</span>
                        <strong className="text-slate-900 font-black text-sm font-mono">
                          ₹{ord.totalDp.toFixed(2)}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">पॉइंट वैल्यू (PV):</span>
                        <strong className="text-emerald-700 font-black">
                          {ord.totalPV} PV
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">पेमेंट माध्यम:</span>
                        <span className="font-semibold text-slate-700">
                          {ord.paymentMethod.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        Status: <strong className="text-[#144732]">{ord.orderStatus}</strong>
                      </span>
                      <Link
                        href={`/orders/${ord.orderNumber}`}
                        className="px-3 py-1.5 rounded-xl bg-[#144732] hover:bg-[#0f3827] text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-transform hover:scale-105"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>View Invoice</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

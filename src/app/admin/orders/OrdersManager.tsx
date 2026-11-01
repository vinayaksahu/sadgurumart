'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Truck, 
  AlertCircle, 
  RefreshCw, 
  X, 
  MapPin, 
  Phone, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface OrderItem {
  id: string;
  orderNumber: string;
  totalMrp: number;
  totalDp: number;
  totalDiscount: number;
  totalPV: number;
  totalBV: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: any;
  createdAt: string;
  user: {
    id: string;
    userCode: string;
    name: string;
    mobile: string;
    email: string | null;
  };
  items: Array<{
    id: string;
    quantity: number;
    unitDp: number;
    unitPV: number;
    product: {
      title: string;
      images: string[];
    };
  }>;
}

export default function OrdersManager() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected Order for Status Update Modal
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [newStatus, setNewStatus] = useState('CONFIRMED');
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/orders?status=${statusFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        setMetrics(data.metrics || null);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const openOrderModal = (ord: OrderItem) => {
    setSelectedOrder(ord);
    setNewStatus(ord.orderStatus);
    setCourierName(ord.shippingAddress?.courierName || '');
    setTrackingNumber(ord.shippingAddress?.trackingNumber || '');
    setMessage(null);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setActionLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          orderStatus: newStatus,
          courierName,
          trackingNumber,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      setMessage({ type: 'success', text: data.message });
      fetchOrders();
      setTimeout(() => {
        setSelectedOrder(null);
      }, 1200);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Overview */}
      <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#144732] tracking-tight">
              ऑर्डर्स व पूर्ति डेस्क (Orders Fulfillment Desk)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              सभी मेंबर्स व ग्राहकों के ऑर्डर्स, पार्सल ट्रैकिंग, डिस्पैच एवं डिलीवरी प्रबंधन
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>रीफ्रेश करें</span>
          </button>
        </div>

        {metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-[#faf8f4] border border-[#d4a359]/30 rounded-2xl p-4">
              <div className="text-[11px] font-bold text-slate-500 uppercase">कुल ऑर्डर्स (Total Orders)</div>
              <div className="text-2xl font-black text-[#144732] mt-1">{metrics.totalOrders}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">ऑल टाइम कंपनी ऑर्डर्स</div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="text-[11px] font-bold text-amber-800 uppercase">डिस्पैच हेतु लंबित (Pending)</div>
              <div className="text-2xl font-black text-amber-900 mt-1">{metrics.pendingOrders}</div>
              <div className="text-[10px] text-amber-700 mt-0.5">पैकिंग व कूरियर हेतु तैयार</div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <div className="text-[11px] font-bold text-emerald-800 uppercase">सफलतापूर्वक डिलीवर्ड (Delivered)</div>
              <div className="text-2xl font-black text-emerald-900 mt-1">{metrics.deliveredOrders}</div>
              <div className="text-[10px] text-emerald-700 mt-0.5">ग्राहक तक पहुँचे पार्सल</div>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#e8e3d5] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-96">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="सर्च: Order # (SGM-ORD-...), मेंबर ID, नाम या मोबाइल..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#144732]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#144732] hover:bg-[#0b2b1e] text-white font-bold text-xs rounded-xl shadow-sm shrink-0 cursor-pointer"
          >
            सर्च
          </button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 shrink-0">स्टेटस:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#144732] bg-[#faf8f4]"
          >
            <option value="ALL">सभी ऑर्डर्स (All Status)</option>
            <option value="PENDING">लंबित (Pending)</option>
            <option value="CONFIRMED">स्वीकृत (Confirmed)</option>
            <option value="DISPATCHED">डिस्पैच (Dispatched)</option>
            <option value="DELIVERED">डिलीवर्ड (Delivered)</option>
            <option value="CANCELLED">रद्द (Cancelled)</option>
          </select>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-black text-[#144732]">
            ऑर्डर्स सूची ({orders.length} ऑर्डर्स प्रदर्शित)
          </h2>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#144732] animate-spin mx-auto" />
            <div className="text-xs font-bold text-slate-600">ऑर्डर्स लोड हो रहे हैं...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-600">कोई ऑर्डर नहीं मिला।</div>
            <p className="text-xs text-slate-400">फ़िल्टर रीसेट करें या नया सर्च करें।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#faf8f4] text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-3">Order Number</th>
                  <th className="py-3 px-3">Customer / Member</th>
                  <th className="py-3 px-3">Items</th>
                  <th className="py-3 px-3 text-right">Amount (₹)</th>
                  <th className="py-3 px-3 text-right">PV / BV</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-mono font-black text-[#144732]">{ord.orderNumber}</div>
                      <div className="text-[10px] text-slate-400">{ord.paymentMethod}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-800">{ord.user.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {ord.user.userCode} • {ord.user.mobile}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 max-w-xs truncate">
                      <span className="font-medium text-slate-700">
                        {ord.items.map((it) => `${it.product?.title || 'उत्पाद'} (x${it.quantity})`).join(', ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right font-black text-slate-900 font-mono">
                      ₹{ord.totalDp}
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono text-[#92580a] font-bold">
                      {ord.totalPV} PV | {ord.totalBV} BV
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        ord.orderStatus === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.orderStatus === 'DISPATCHED'
                          ? 'bg-blue-100 text-blue-800'
                          : ord.orderStatus === 'CANCELLED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.orderStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-500">
                      {new Date(ord.createdAt).toLocaleDateString('hi-IN')}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => openOrderModal(ord)}
                        className="px-3 py-1.5 rounded-xl bg-[#144732] hover:bg-[#0b2b1e] text-[#fef08a] font-black text-xs shadow-sm transition-all flex items-center gap-1 mx-auto cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>मैनेज</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ORDER UPDATE & DISPATCH MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />

          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-xl font-black text-[#144732]">
                  ऑर्डर पूर्ति प्रबंधन (Order Fulfillment)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Order: <strong className="font-mono text-[#92580a]">{selectedOrder.orderNumber}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {message && (
              <div className={`p-3.5 mb-4 rounded-xl border flex items-center justify-between text-xs font-bold ${
                message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <span>{message.text}</span>
              </div>
            )}

            {/* Customer & Address Details */}
            <div className="p-4 bg-[#faf8f4] border border-[#e8e3d5] rounded-2xl space-y-2 text-xs mb-5">
              <div className="font-black text-[#144732] pb-1 border-b border-slate-200">ग्राहक व डिलीवरी पता</div>
              <div className="flex justify-between">
                <span className="text-slate-500">ग्राहक का नाम:</span>
                <span className="font-bold text-slate-800">{selectedOrder.user.name} ({selectedOrder.user.userCode})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">मोबाइल:</span>
                <span className="font-bold text-slate-800">{selectedOrder.user.mobile}</span>
              </div>
              <div className="pt-1">
                <span className="text-slate-500 block">डिलीवरी पता:</span>
                <span className="font-medium text-slate-800">
                  {typeof selectedOrder.shippingAddress === 'object'
                    ? `${selectedOrder.shippingAddress.addressLine || selectedOrder.shippingAddress.address || ''}, ${selectedOrder.shippingAddress.city || ''}, ${selectedOrder.shippingAddress.state || ''} - ${selectedOrder.shippingAddress.pincode || ''}`
                    : String(selectedOrder.shippingAddress || 'पता उपलब्ध नहीं')}
                </span>
              </div>
            </div>

            {/* Update Form */}
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ऑर्डर स्थिति (Order Status) *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#144732]"
                >
                  <option value="PENDING">PENDING (लंबित)</option>
                  <option value="CONFIRMED">CONFIRMED (स्वीकृत / पैकिंग में)</option>
                  <option value="DISPATCHED">DISPATCHED (कूरियर द्वारा रवाना)</option>
                  <option value="DELIVERED">DELIVERED (ग्राहक को प्राप्त)</option>
                  <option value="CANCELLED">CANCELLED (रद्द)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  कूरियर पार्टनर का नाम (Courier Name)
                </label>
                <input
                  type="text"
                  placeholder="उदा. DTDC, Delhivery, India Post"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#144732]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ट्रैकिंग नंबर / AWB No (Tracking / Docket ID)
                </label>
                <input
                  type="text"
                  placeholder="उदा. DTDC12345678"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-[#144732]"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl bg-[#144732] hover:bg-[#0b2b1e] text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>अपडेट करें (Save Status)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

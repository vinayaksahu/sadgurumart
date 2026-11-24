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
  ChevronRight,
  PackageCheck,
  Printer,
  FileText,
  Copy,
  Check,
  Send,
  Navigation,
  Sparkles
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
  shiprocketOrderId?: number | null;
  shiprocketShipmentId?: number | null;
  shiprocketAwbCode?: string | null;
  shiprocketCourierName?: string | null;
  shiprocketCourierId?: number | null;
  shiprocketStatus?: string | null;
  shiprocketLabelUrl?: string | null;
  shiprocketInvoiceUrl?: string | null;
  shiprocketTrackingUrl?: string | null;
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

  // Shiprocket Actions State
  const [shiprocketLoading, setShiprocketLoading] = useState<string | null>(null);

  // Live Tracking Modal State
  const [trackingModalOrder, setTrackingModalOrder] = useState<OrderItem | null>(null);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [copiedAwb, setCopiedAwb] = useState(false);

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
    setCourierName(ord.shiprocketCourierName || ord.shippingAddress?.courierName || '');
    setTrackingNumber(ord.shiprocketAwbCode || ord.shippingAddress?.trackingNumber || '');
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

  // Shiprocket Actions Trigger
  const handleShiprocketAction = async (action: string) => {
    if (!selectedOrder) return;

    setShiprocketLoading(action);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/shiprocket/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          orderId: selectedOrder.id,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Shiprocket action failed');
      }

      setMessage({ type: 'success', text: result.message || 'सफल!' });

      // If action generated a label or invoice, open it in new tab
      if (action === 'GENERATE_LABEL' && result.labelUrl) {
        window.open(result.labelUrl, '_blank');
      }
      if (action === 'GENERATE_INVOICE' && result.invoiceUrl) {
        window.open(result.invoiceUrl, '_blank');
      }

      // Refresh orders
      await fetchOrders();

      // Update selectedOrder local state
      if (result.data?.awbCode) {
        setTrackingNumber(result.data.awbCode);
        setCourierName(result.data.courierName || '');
        setSelectedOrder((prev) => prev ? ({
          ...prev,
          shiprocketAwbCode: result.data.awbCode,
          shiprocketCourierName: result.data.courierName,
          shiprocketStatus: 'AWB_ASSIGNED',
          orderStatus: 'SHIPPED',
        }) : null);
      } else if (result.data?.shipmentId) {
        setSelectedOrder((prev) => prev ? ({
          ...prev,
          shiprocketOrderId: result.data.shiprocketOrderId,
          shiprocketShipmentId: result.data.shipmentId,
          shiprocketStatus: result.data.status || 'NEW',
        }) : null);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Shiprocket Action Error' });
    } finally {
      setShiprocketLoading(null);
    }
  };

  // Open Live Tracking Modal
  const openTrackingModal = async (ord: OrderItem) => {
    setTrackingModalOrder(ord);
    setTrackingLoading(true);
    setTrackingData(null);

    try {
      const res = await fetch(`/api/shiprocket/track?orderNumber=${encodeURIComponent(ord.orderNumber)}`);
      const data = await res.json();
      setTrackingData(data);
    } catch (err: any) {
      setTrackingData({ error: err.message || 'Tracking fetch failed' });
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Overview */}
      <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-800 border border-indigo-200 mb-2">
              <Truck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Shiprocket Integrated Dispatch</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#144732] tracking-tight">
              ऑर्डर्स व पूर्ति डेस्क (Orders Fulfillment Desk)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              सभी मेंबर्स व ग्राहकों के ऑर्डर्स, Shiprocket 1-Click AWB जनरेशन, शिपिंग लेबल प्रिंटिंग व लाइव ट्रैकिंग
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>रिफ्रेश</span>
          </button>
        </div>

        {/* Metrics Bar */}
        {metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#faf8f4] border border-[#e8e3d5] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">कुल ऑर्डर्स</span>
                <div className="text-2xl font-black text-[#144732] mt-0.5">{metrics.totalOrders}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#144732]/10 flex items-center justify-center text-[#144732]">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">लंबित (Pending)</span>
                <div className="text-2xl font-black text-amber-900 mt-0.5">{metrics.pendingOrders}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-200/50 flex items-center justify-center text-amber-800">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">डिलीवर्ड (Delivered)</span>
                <div className="text-2xl font-black text-emerald-900 mt-0.5">{metrics.deliveredOrders}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-200/50 flex items-center justify-center text-emerald-800">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#e8e3d5] rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#144732] text-[#fef08a] shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {st === 'ALL' ? 'सभी ऑर्डर्स' : st}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-80">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ऑर्डर नंबर, नाम, मोबाइल खोजें..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#144732]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#144732] text-white font-bold text-xs hover:bg-[#0b2b1e] cursor-pointer"
            >
              खोजें
            </button>
          </form>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#e8e3d5] rounded-3xl p-4 sm:p-6 shadow-sm">
        {loading ? (
          <div className="py-16 text-center space-y-3">
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
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Shiprocket Logistics</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((ord) => {
                  const hasAwb = Boolean(ord.shiprocketAwbCode || ord.shippingAddress?.trackingNumber);
                  const awbCode = ord.shiprocketAwbCode || ord.shippingAddress?.trackingNumber;
                  const courier = ord.shiprocketCourierName || ord.shippingAddress?.courierName;

                  return (
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

                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                          ord.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.orderStatus === 'SHIPPED' || ord.orderStatus === 'DISPATCHED'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.orderStatus === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ord.orderStatus}
                        </span>
                      </td>

                      {/* Shiprocket Logistics Column */}
                      <td className="py-3.5 px-3">
                        {hasAwb ? (
                          <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-[10px] font-bold">
                              <Truck className="w-3 h-3 text-indigo-600" />
                              <span>{courier || 'Shiprocket'}:</span>
                              <span className="font-mono">{awbCode}</span>
                            </div>
                            <div>
                              <button
                                onClick={() => openTrackingModal(ord)}
                                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline flex items-center gap-0.5 cursor-pointer"
                              >
                                <Navigation className="w-2.5 h-2.5" />
                                <span>लाइव ट्रैक करें</span>
                              </button>
                            </div>
                          </div>
                        ) : ord.shiprocketShipmentId ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Shipment #{ord.shiprocketShipmentId} (AWB लंबित)</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">
                            कूरियर असाइन नहीं
                          </span>
                        )}
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
                          <span>मैनेज / डिस्पैच</span>
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

      {/* ORDER UPDATE & DISPATCH MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />

          <div className="relative bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-800 border border-indigo-200">
                  Shiprocket Logistics Desk
                </span>
                <h3 className="text-xl font-black text-[#144732] mt-1">
                  ऑर्डर पूर्ति एवं शिपिंग प्रबंधन
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Order: <strong className="font-mono text-[#92580a]">{selectedOrder.orderNumber}</strong> • कुल: ₹{selectedOrder.totalDp}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {message && (
              <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold animate-in fade-in ${
                message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <span>{message.text}</span>
              </div>
            )}

            {/* Customer & Address Details */}
            <div className="p-4 bg-[#faf8f4] border border-[#e8e3d5] rounded-2xl space-y-2 text-xs">
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
                    ? `${selectedOrder.shippingAddress.addressLine || selectedOrder.shippingAddress.address || ''}, ${selectedOrder.shippingAddress.city || ''}, ${selectedOrder.shippingAddress.state || ''} - ${selectedOrder.shippingAddress.pinCode || selectedOrder.shippingAddress.pincode || ''}`
                    : String(selectedOrder.shippingAddress || 'पता उपलब्ध नहीं')}
                </span>
              </div>
            </div>

            {/* Shiprocket 1-Click Action Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#0f172a] text-white border border-indigo-400/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white">Shiprocket 1-Click Dispatch Engine</div>
                    <div className="text-[10px] text-indigo-200">
                      {selectedOrder.shiprocketAwbCode ? (
                        <span className="text-emerald-300 font-bold">
                          ✓ AWB: {selectedOrder.shiprocketAwbCode} ({selectedOrder.shiprocketCourierName || 'Courier Assigned'})
                        </span>
                      ) : selectedOrder.shiprocketShipmentId ? (
                        <span className="text-amber-300">
                          ● Shipment Created #{selectedOrder.shiprocketShipmentId} - Assign AWB below
                        </span>
                      ) : (
                        <span className="text-indigo-200/80">
                          ○ Order not pushed to Shiprocket yet
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedOrder.shiprocketAwbCode && (
                  <button
                    type="button"
                    onClick={() => openTrackingModal(selectedOrder)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-200 font-bold text-xs border border-indigo-400/30 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Live Track</span>
                  </button>
                )}
              </div>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {/* 1. Push / Create Order on Shiprocket */}
                {!selectedOrder.shiprocketShipmentId && (
                  <button
                    type="button"
                    disabled={shiprocketLoading !== null}
                    onClick={() => handleShiprocketAction('CREATE_ORDER')}
                    className="col-span-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {shiprocketLoading === 'CREATE_ORDER' ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>Shiprocket पर शिपमेंट बनाएँ (Push to Shiprocket)</span>
                  </button>
                )}

                {/* 2. Assign Courier & Generate AWB */}
                {selectedOrder.shiprocketShipmentId && !selectedOrder.shiprocketAwbCode && (
                  <button
                    type="button"
                    disabled={shiprocketLoading !== null}
                    onClick={() => handleShiprocketAction('ASSIGN_AWB')}
                    className="col-span-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {shiprocketLoading === 'ASSIGN_AWB' ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <PackageCheck className="w-4 h-4" />
                    )}
                    <span>कूरियर असाइन करें व AWB जनरेट करें (Assign AWB)</span>
                  </button>
                )}

                {/* 3. Print Label */}
                {selectedOrder.shiprocketShipmentId && (
                  <button
                    type="button"
                    disabled={shiprocketLoading !== null}
                    onClick={() => handleShiprocketAction('GENERATE_LABEL')}
                    className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center justify-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                  >
                    {shiprocketLoading === 'GENERATE_LABEL' ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Printer className="w-3.5 h-3.5" />
                    )}
                    <span>शिपिंग लेबल (Print Label)</span>
                  </button>
                )}

                {/* 4. Print Invoice */}
                {selectedOrder.shiprocketOrderId && (
                  <button
                    type="button"
                    disabled={shiprocketLoading !== null}
                    onClick={() => handleShiprocketAction('GENERATE_INVOICE')}
                    className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center justify-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                  >
                    {shiprocketLoading === 'GENERATE_INVOICE' ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FileText className="w-3.5 h-3.5" />
                    )}
                    <span>टैक्स इनवॉइस (Invoice)</span>
                  </button>
                )}

                {/* 5. Request Pickup */}
                {selectedOrder.shiprocketAwbCode && (
                  <button
                    type="button"
                    disabled={shiprocketLoading !== null}
                    onClick={() => handleShiprocketAction('REQUEST_PICKUP')}
                    className="col-span-2 py-2.5 px-3 rounded-xl bg-purple-600/40 hover:bg-purple-600/60 text-purple-200 font-bold text-xs border border-purple-400/30 flex items-center justify-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                  >
                    {shiprocketLoading === 'REQUEST_PICKUP' ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                    <span>कूरियर पिकअप शेड्यूल करें (Request Doorstep Pickup)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Manual Status & Tracking Fallback Form */}
            <form onSubmit={handleUpdateStatus} className="space-y-4 pt-2 border-t border-slate-100">
              <div className="font-bold text-xs text-slate-700">मैन्युअल स्टेटस संशोधन (Manual Override)</div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    ऑर्डर स्थिति (Order Status) *
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#144732]"
                  >
                    <option value="PENDING">PENDING (लंबित)</option>
                    <option value="CONFIRMED">CONFIRMED (स्वीकृत / पैकिंग)</option>
                    <option value="SHIPPED">SHIPPED (रवाना / इन-ट्रांजिट)</option>
                    <option value="DELIVERED">DELIVERED (सफल डिलीवरी)</option>
                    <option value="CANCELLED">CANCELLED (रद्द)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    कूरियर नाम (Courier Name)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. Delhivery, BlueDart"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#144732]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  AWB / ट्रैकिंग नंबर (Tracking Docket ID)
                </label>
                <input
                  type="text"
                  placeholder="उदा. 1421456789"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:border-[#144732]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  बंद करें
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-[#144732] hover:bg-[#0b2b1e] text-white font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>स्टेटस सेव करें (Save)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIVE SHIPMENT TRACKING MODAL */}
      {trackingModalOrder && (
        <div className="fixed inset-0 z-[100001] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setTrackingModalOrder(null)} />

          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl z-10 max-h-[85vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#144732]">लाइव शिपमेंट ट्रैकिंग</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Order #{trackingModalOrder.orderNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTrackingModalOrder(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {trackingLoading ? (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="w-7 h-7 text-indigo-600 animate-spin mx-auto" />
                <div className="text-xs font-bold text-slate-600">Shiprocket लाइव सर्वर से ट्रैकिंग खोजी जा रही है...</div>
              </div>
            ) : trackingData ? (
              <div className="space-y-5">
                {/* Tracking Overview Card */}
                <div className="p-4 rounded-2xl bg-[#faf8f4] border border-[#e8e3d5] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">कूरियर पार्टनर:</span>
                      <div className="font-black text-sm text-[#144732]">
                        {trackingData.courierName || trackingModalOrder.shiprocketCourierName || 'Shiprocket Partner'}
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {trackingData.currentStatus || 'IN_TRANSIT'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-sans">AWB Code:</span>
                      <strong className="text-slate-800 text-sm">
                        {trackingData.awbCode || trackingModalOrder.shiprocketAwbCode || 'N/A'}
                      </strong>
                    </div>

                    {trackingData.awbCode && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(trackingData.awbCode);
                          setCopiedAwb(true);
                          setTimeout(() => setCopiedAwb(false), 2000);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 text-[11px] font-sans font-bold flex items-center gap-1 hover:bg-slate-50 cursor-pointer"
                      >
                        {copiedAwb ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedAwb ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>

                  {trackingData.estimatedDeliveryDate && (
                    <div className="text-[11px] text-[#92580a] font-bold">
                      अनुमानित डिलीवरी (EDD): {trackingData.estimatedDeliveryDate}
                    </div>
                  )}
                </div>

                {/* Timeline Activities */}
                <div className="space-y-3">
                  <div className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    पार्सल गतिविधि इतिहास (Scan Milestones)
                  </div>

                  {trackingData.activities && trackingData.activities.length > 0 ? (
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-100">
                      {trackingData.activities.map((act: any, idx: number) => (
                        <div key={idx} className="relative text-xs">
                          <div className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 ${
                            idx === 0
                              ? 'bg-emerald-500 border-white ring-2 ring-emerald-300'
                              : 'bg-indigo-300 border-white'
                          }`} />
                          <div className="font-bold text-slate-800">{act.activity || act.status}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                            <span>{act.date}</span>
                            {act.location && (
                              <span className="flex items-center gap-0.5 text-indigo-700 font-semibold">
                                <MapPin className="w-2.5 h-2.5" />
                                {act.location}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 text-slate-500 text-xs text-center">
                      कूरियर पार्टनर द्वारा अभी पार्सल स्कैन किया जा रहा है। गतिविधि जल्द अपडेट होगी।
                    </div>
                  )}
                </div>

                {trackingData.trackingUrl && (
                  <div className="pt-2 text-center">
                    <a
                      href={trackingData.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-bold underline"
                    >
                      <span>Shiprocket ट्रैकिंग पोर्टल पर खोलें</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ) : null}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setTrackingModalOrder(null)}
                className="px-5 py-2 rounded-xl bg-[#144732] text-white text-xs font-bold hover:bg-[#0b2b1e] cursor-pointer"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/lib/cartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Lock, CheckCircle2, Truck, CreditCard } from 'lucide-react';

export default function CheckoutPage() {
  const { items, totalDp, totalMrp, totalSavings, totalPV, totalBV, clearCart } = useCart();
  const router = useRouter();

  const [shipping, setShipping] = useState({
    fullName: '',
    mobile: '',
    email: '',
    addressLine: '',
    city: '',
    state: '',
    pinCode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('ONLINE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const deliveryFee = totalDp >= 500 || totalDp === 0 ? 0 : 50;
  const finalTotal = totalDp + deliveryFee;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('आपकी कार्ट खाली है। कृपया पहले उत्पाद जोड़ें।');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingAddress: shipping,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ऑर्डर प्लेस करने में त्रुटि हुई');
      }

      clearCart();
      router.push(`/orders/${data.orderNumber}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8f6f0] text-[#1f2937] font-sans flex flex-col">
        <Navbar />
        <div className="max-w-md mx-auto my-auto p-8 bg-white border border-[#e8e3d5] rounded-3xl text-center">
          <h2 className="text-xl font-black text-[#144732]">कार्ट में कोई उत्पाद नहीं है</h2>
          <p className="text-xs text-slate-500 mt-2 mb-6">कृपया स्टोर से उत्पाद चुनें।</p>
          <Link
            href="/store"
            className="px-6 py-3 rounded-2xl bg-[#144732] text-white font-bold text-xs"
          >
            स्टोर पर जाएँ →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-[#1f2937] font-sans flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="max-w-3xl mb-8">
          <h1 className="text-3xl font-black text-[#144732] tracking-tight">
            Secure Checkout (सुरक्षित चेकआउट)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            कृपया सही डिलीवरी पता दर्ज करें। सभी ऑर्डर्स पर पारदर्शी बिलिंग एवं ट्रैकिंग उपलब्ध है।
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Shipping & Payment */}
            <div className="lg:col-span-8 space-y-6">
              {/* Shipping Address Card */}
              <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-base font-black text-[#144732]">
                  <Truck className="w-5 h-5 text-[#92580a]" />
                  <span>1. डिलीवरी का पता (Shipping Details)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      पूरा नाम (Full Name) *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={shipping.fullName}
                      onChange={handleChange}
                      placeholder="Receiver Name"
                      required
                      className="w-full bg-[#faf8f4] border border-[#d8d0bf] focus:border-[#144732] rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      मोबाइल नंबर (Mobile) *
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      maxLength={10}
                      value={shipping.mobile}
                      onChange={handleChange}
                      placeholder="10-digit mobile"
                      required
                      className="w-full bg-[#faf8f4] border border-[#d8d0bf] focus:border-[#144732] rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ईमेल पता (Email Address)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={shipping.email}
                    onChange={handleChange}
                    placeholder="For GST invoice copy"
                    className="w-full bg-[#faf8f4] border border-[#d8d0bf] focus:border-[#144732] rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    पूरा पता (House No, Street, Landmark) *
                  </label>
                  <input
                    type="text"
                    name="addressLine"
                    value={shipping.addressLine}
                    onChange={handleChange}
                    placeholder="Complete address for delivery"
                    required
                    className="w-full bg-[#faf8f4] border border-[#d8d0bf] focus:border-[#144732] rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      शहर / जिला (City) *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shipping.city}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#faf8f4] border border-[#d8d0bf] focus:border-[#144732] rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      राज्य (State) *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={shipping.state}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#faf8f4] border border-[#d8d0bf] focus:border-[#144732] rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      पिनकोड (PIN Code) *
                    </label>
                    <input
                      type="text"
                      name="pinCode"
                      maxLength={6}
                      value={shipping.pinCode}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#faf8f4] border border-[#d8d0bf] focus:border-[#144732] rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Card */}
              <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-base font-black text-[#144732]">
                  <CreditCard className="w-5 h-5 text-[#92580a]" />
                  <span>2. भुगतान विकल्प (Payment Option)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label
                    onClick={() => setPaymentMethod('ONLINE')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                      paymentMethod === 'ONLINE'
                        ? 'border-[#144732] bg-[#eaf5ed]'
                        : 'border-[#e8e3d5] bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-black text-sm text-[#144732]">
                        UPI / NetBanking / Cards
                      </div>
                      <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                        Instant Activation & Confirmation
                      </div>
                    </div>
                    {paymentMethod === 'ONLINE' && <CheckCircle2 className="w-5 h-5 text-[#144732]" />}
                  </label>

                  <label
                    onClick={() => setPaymentMethod('WALLET')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                      paymentMethod === 'WALLET'
                        ? 'border-[#144732] bg-[#eaf5ed]'
                        : 'border-[#e8e3d5] bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-black text-sm text-[#144732]">
                        SGM Shopping Wallet
                      </div>
                      <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                        Pay via Member Balance
                      </div>
                    </div>
                    {paymentMethod === 'WALLET' && <CheckCircle2 className="w-5 h-5 text-[#144732]" />}
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-4">
              <div className="bg-white border-2 border-[#144732]/20 rounded-3xl p-6 shadow-xl sticky top-28 space-y-5">
                <h3 className="text-base font-black text-[#144732] pb-3 border-b border-slate-100">
                  ऑर्डर विवरण ({items.length} उत्पाद)
                </h3>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {items.map((it) => (
                    <div key={it.id} className="flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-slate-800 line-clamp-1">{it.title}</div>
                        <div className="text-[11px] text-slate-500">Qty: {it.quantity} × ₹{it.dpPrice}</div>
                      </div>
                      <div className="font-black text-[#144732]">
                        ₹{it.dpPrice * it.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-2xl bg-[#fdfaf3] border border-[#d4a359]/30 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-[#144732]">
                    <span>Points Earned:</span>
                    <span>{totalPV} PV | {totalBV} BV</span>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold">
                    You save ₹{totalSavings} compared to MRP
                  </div>
                </div>

                <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>₹{totalDp}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping:</span>
                    <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-[#144732] pt-2 border-t border-slate-100">
                    <span>Total Amount:</span>
                    <span>₹{finalTotal}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#d4a359] via-[#fef08a] to-[#bc853c] text-[#0b2b1e] font-black text-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#d4a359]/25 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-[#0b2b1e] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>CONFIRM & PLACE ORDER</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5 pt-1">
                  <Lock className="w-3.5 h-3.5 text-[#144732]" />
                  <span>256-bit Encrypted SSL Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/lib/cartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  ArrowRight,
  Lock,
  CheckCircle2,
  Truck,
  CreditCard,
  User,
  MapPin,
  Edit3,
  Check,
  Sparkles,
  Home,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';

export default function CheckoutPage() {
  const { items, totalDp, totalMrp, totalSavings, totalPV, totalBV, clearCart } = useCart();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [addressMode, setAddressMode] = useState<'PROFILE' | 'MANUAL'>('MANUAL');
  const [saveToProfile, setSaveToProfile] = useState(false);

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

  // Fetch logged-in member profile to check saved address
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          if (data && data.user) {
            setCurrentUser(data.user);
            const hasProfileAddress = !!data.user.addressLine;

            if (hasProfileAddress) {
              setAddressMode('PROFILE');
              setShipping({
                fullName: data.user.name || '',
                mobile: data.user.mobile || '',
                email: data.user.email || '',
                addressLine: data.user.addressLine || '',
                city: data.user.city || '',
                state: data.user.state || '',
                pinCode: data.user.pincode || '',
              });
            } else {
              // Pre-fill name and mobile from user profile
              setShipping((prev) => ({
                ...prev,
                fullName: data.user.name || prev.fullName,
                mobile: data.user.mobile || prev.mobile,
                email: data.user.email || prev.email,
              }));
            }
          }
        }
      } catch (err) {
        // Guest user or network failure, fallback gracefully
      } finally {
        setCheckingAuth(false);
      }
    };
    fetchUser();
  }, []);

  const selectProfileAddress = () => {
    setAddressMode('PROFILE');
    if (currentUser) {
      setShipping({
        fullName: currentUser.name || '',
        mobile: currentUser.mobile || '',
        email: currentUser.email || '',
        addressLine: currentUser.addressLine || '',
        city: currentUser.city || '',
        state: currentUser.state || '',
        pinCode: currentUser.pincode || '',
      });
    }
  };

  const selectManualAddress = () => {
    setAddressMode('MANUAL');
  };

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

    if (
      !shipping.fullName ||
      !shipping.mobile ||
      !shipping.addressLine ||
      !shipping.city ||
      !shipping.state ||
      !shipping.pinCode
    ) {
      setError('कृपया डिलीवरी का पूरा पता (नाम, मोबाइल, पता, शहर, राज्य, पिनकोड) दर्ज करें।');
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
          saveToProfile: addressMode === 'MANUAL' ? saveToProfile : true,
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
              <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-base font-black text-[#144732]">
                    <Truck className="w-5 h-5 text-[#92580a]" />
                    <span>1. डिलीवरी का पता (Shipping Details)</span>
                  </div>
                  {currentUser && (
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Member: {currentUser.userCode}
                    </span>
                  )}
                </div>

                {/* Logged-in Address Choice Option: Profile vs Manual */}
                {currentUser ? (
                  <div className="space-y-4">
                    <div className="text-xs font-bold text-slate-600 mb-1">
                      डिलीवरी का विकल्प चुनें (Select Delivery Option):
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Option A: Profile Saved Address */}
                      <button
                        type="button"
                        onClick={selectProfileAddress}
                        className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                          addressMode === 'PROFILE'
                            ? 'border-[#144732] bg-[#eaf5ed] shadow-sm'
                            : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                            addressMode === 'PROFILE'
                              ? 'border-[#144732] bg-[#144732] text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {addressMode === 'PROFILE' && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 font-black text-xs text-[#144732]">
                            <Home className="w-3.5 h-3.5 text-[#d4a359]" />
                            <span>प्रोफाइल का सुरक्षित पता (Profile Address)</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                            {currentUser.addressLine
                              ? `${currentUser.addressLine.slice(0, 35)}... (${currentUser.city || ''})`
                              : 'प्रोफाइल में पंजीकृत पते पर मंगाएं'}
                          </p>
                        </div>
                      </button>

                      {/* Option B: Manual Address */}
                      <button
                        type="button"
                        onClick={selectManualAddress}
                        className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                          addressMode === 'MANUAL'
                            ? 'border-[#144732] bg-[#eaf5ed] shadow-sm'
                            : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                            addressMode === 'MANUAL'
                              ? 'border-[#144732] bg-[#144732] text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {addressMode === 'MANUAL' && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 font-black text-xs text-[#144732]">
                            <Edit3 className="w-3.5 h-3.5 text-[#d4a359]" />
                            <span>नया अथवा अन्य पता दर्ज करें (Custom Address)</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                            किसी अन्य व्यक्ति अथवा नए पते पर डिलीवरी हेतु
                          </p>
                        </div>
                      </button>
                    </div>

                    {/* If Profile Mode is chosen and profile has an address */}
                    {addressMode === 'PROFILE' && currentUser.addressLine && (
                      <div className="p-4 rounded-2xl bg-[#fdfaf3] border border-[#d4a359]/40 relative mt-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#144732]/10 text-[#144732] font-black text-[10px] uppercase">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>डिफ़ॉल्ट प्रोफाइल डिलीवरी पता</span>
                            </div>
                            <div className="font-black text-slate-900 text-sm mt-1">
                              {currentUser.name}
                            </div>
                            <div className="text-xs text-slate-600 font-mono">
                              📱 {currentUser.mobile} {currentUser.email ? `• ✉️ ${currentUser.email}` : ''}
                            </div>
                            <div className="text-xs text-slate-700 font-medium pt-1">
                              📍 {currentUser.addressLine}, {currentUser.city}, {currentUser.state} -{' '}
                              <span className="font-bold">{currentUser.pincode}</span>
                            </div>
                          </div>

                          <Link
                            href="/profile/edit"
                            target="_blank"
                            className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#144732] hover:border-[#144732] text-[11px] font-bold shadow-xs transition-all"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>एडिट करें</span>
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* If Profile Mode is chosen but user has not saved address yet */}
                    {addressMode === 'PROFILE' && !currentUser.addressLine && (
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
                        <div>
                          <div className="font-black">प्रोफाइल में पता उपलब्ध नहीं है!</div>
                          <div className="text-[11px] text-amber-700 mt-0.5">
                            कृपया नीचे फॉर्म में अपना पता दर्ज करें, यह स्वतः आपके प्रोफाइल में भी सेव हो जाएगा।
                          </div>
                        </div>
                        <Link
                          href="/profile/edit"
                          className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-[11px]"
                        >
                          प्रोफाइल में जोड़ें
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Not Logged In Banner */
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 flex items-center justify-between gap-3 text-xs">
                    <div className="text-emerald-950 font-medium">
                      💡 क्या आप SGM Mart के सदस्य हैं? लॉगिन करने पर आपका प्रोफाइल पता स्वतः लोड हो जाएगा।
                    </div>
                    <Link
                      href="/login"
                      className="shrink-0 px-3 py-1.5 rounded-xl bg-[#144732] text-white font-bold text-[11px] hover:opacity-90"
                    >
                      लॉगिन करें →
                    </Link>
                  </div>
                )}

                {/* Show Address Input Fields if:
                    1. addressMode is MANUAL, OR
                    2. addressMode is PROFILE but user doesn't have a saved address in profile, OR
                    3. User is not logged in */}
                {(addressMode === 'MANUAL' || !currentUser?.addressLine) && (
                  <div className="space-y-4 pt-2">
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
                          className="w-full bg-[#faf8f4] border border-[#d8d0bf] focus:border-[#144732] rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 focus:outline-none"
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
                          placeholder="City"
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
                          placeholder="State"
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
                          placeholder="6-digit PIN"
                          required
                          className="w-full bg-[#faf8f4] border border-[#d8d0bf] focus:border-[#144732] rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Checkbox: Save to Profile */}
                    {currentUser && addressMode === 'MANUAL' && (
                      <label className="flex items-center gap-2.5 pt-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={saveToProfile}
                          onChange={(e) => setSaveToProfile(e.target.checked)}
                          className="w-4 h-4 rounded text-[#144732] focus:ring-[#144732]"
                        />
                        <span className="text-xs font-bold text-[#144732]">
                          इस नए पते को मेरे प्रोफाइल में स्थायी डिफ़ॉल्ट पते के रूप में सुरक्षित करें (Save as default profile address)
                        </span>
                      </label>
                    )}
                  </div>
                )}
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
                        <div className="text-[11px] text-slate-500">
                          Qty: {it.quantity} × ₹{it.dpPrice}
                        </div>
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
                    <span>
                      {totalPV} PV | {totalBV} BV
                    </span>
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
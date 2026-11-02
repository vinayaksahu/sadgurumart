import React from 'react';
import MemberNavbar from '@/components/MemberNavbar';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Printer, ShoppingBag, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import PrintButton from './PrintButton';

interface OrderPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderConfirmationPage({ params }: OrderPageProps) {
  const { orderNumber } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: { product: true },
      },
      user: {
        select: { userCode: true, name: true, mobile: true },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const shipping = order.shippingAddress as any;

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-[#1f2937] font-sans flex flex-col">
      <MemberNavbar user={order.user} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-md">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-[#92580a]">
            ORDER CONFIRMED & INVOICED
          </span>
          <h1 className="text-3xl font-black text-[#144732] mt-1">
            धन्यवाद! आपका ऑर्डर दर्ज कर लिया गया है
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ऑर्डर क्रमांक: <strong className="text-slate-800">{order.orderNumber}</strong> • दिनांक: {new Date(order.createdAt).toLocaleDateString('hi-IN')}
          </p>
        </div>

        {/* Successfully Activated Alert Banner (If this was an activation order) */}
        {(order.isActivation || order.totalPV >= 100) && (
          <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#144732] via-[#166534] to-[#0b2b1e] text-white shadow-xl border-2 border-[#d4a359] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-[#d4a359]/40 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-[#fef08a]" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[#fef08a] font-black text-[10px] uppercase tracking-wider mb-1">
                  ✓ ID Successfully Activated
                </div>
                <div className="text-base sm:text-lg font-black text-white leading-tight">
                  बधाई हो! आईडी {order.totalPV} PV पैकेज के साथ सक्रिय (ACTIVE) हो चुकी है!
                </div>
                <div className="text-xs text-emerald-200 mt-0.5">
                  अब आप सभी प्रकार की बाइनरी मैचिंग एवं टीम रॉयल्टी इनकम के लिए पात्र हैं।
                </div>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="shrink-0 px-4 py-2.5 rounded-xl bg-[#d4a359] hover:bg-[#c39248] text-[#0b2b1e] font-black text-xs transition-colors shadow"
            >
              डैशबोर्ड देखें →
            </Link>
          </div>
        )}

        {/* Printable Invoice Container */}
        <div id="invoice-printable" className="bg-white border-2 border-[#144732]/20 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-slate-100 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#144732] text-white flex items-center justify-center font-black text-xl border-2 border-[#d4a359]">
                SGM
              </div>
              <div>
                <div className="text-xl font-black text-[#144732] leading-none">SGM MART</div>
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#d4a359]">
                  Tax Invoice / बिल रसीद
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-500">
              <div className="font-bold text-slate-800">SGM MART ONLINE SERVICE PVT. LTD.</div>
              <div>GSTIN: Registered Direct Seller Entity</div>
              <div>Support Portal • www.sadgurumart.com</div>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-[#faf8f4] border border-[#e8e3d5] text-xs">
            <div>
              <div className="font-black text-[#144732] uppercase tracking-wider mb-1">
                बिल प्राप्तकर्ता (Billed To):
              </div>
              <div className="font-bold text-sm text-slate-800">{shipping?.fullName || order.user.name}</div>
              <div className="text-slate-600 mt-0.5">मो. {shipping?.mobile || order.user.mobile}</div>
              <div className="text-slate-500 mt-0.5">Member ID: {order.user.userCode}</div>
            </div>

            <div>
              <div className="font-black text-[#144732] uppercase tracking-wider mb-1">
                डिलीवरी पता (Delivery Address):
              </div>
              <div className="text-slate-700 leading-relaxed font-medium">
                {shipping?.addressLine}, {shipping?.city}, {shipping?.state} - {shipping?.pinCode}
              </div>
              <div className="text-emerald-700 font-bold mt-1">
                Payment: {order.paymentMethod} (PAID)
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto w-full max-w-full">
            <table className="w-full min-w-[550px] text-left text-xs">
              <thead>
                <tr className="bg-[#144732] text-white uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-l-xl">क्र.</th>
                  <th className="py-3 px-4">उत्पाद का नाम (Product Item)</th>
                  <th className="py-3 px-4 text-center">PV / BV</th>
                  <th className="py-3 px-4 text-center">मात्रा (Qty)</th>
                  <th className="py-3 px-4 text-right">DP दर</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">कुल राशि</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((it, idx) => (
                  <tr key={it.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-500">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-[#144732]">{it.product.title}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-[#92580a]">
                      {it.unitPV * it.quantity} PV | {it.unitBV * it.quantity} BV
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">{it.quantity}</td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-600">₹{it.unitDp}</td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900">
                      ₹{it.unitDp * it.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Accrual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t-2 border-slate-100">
            {/* Left: MLM Volume Credit Note */}
            <div className="p-4 rounded-2xl bg-[#eaf5ed] border border-[#144732]/20 text-xs space-y-1">
              <div className="font-black text-[#144732] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#d4a359]" />
                <span>नेटवर्क वॉल्यूम क्रेडिट (Points Credit)</span>
              </div>
              <div className="text-sm font-bold text-slate-800">
                कुल मैचिंग PV: <strong className="text-[#144732]">{order.totalPV} PV</strong>
              </div>
              <div className="text-sm font-bold text-slate-800">
                कुल रीपरचेस BV: <strong className="text-[#92580a]">{order.totalBV} BV</strong>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                * आपके आईडी पर बिज़नेस पॉइंट्स क्रेडिट कर दिए गए हैं।
              </p>
            </div>

            {/* Right: Financial Totals */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal (DP):</span>
                <span>₹{order.totalDp - order.deliveryFee}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charges:</span>
                <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>MRP Savings:</span>
                <span>₹{order.totalDiscount}</span>
              </div>
              <div className="flex justify-between text-base font-black text-[#144732] pt-2 border-t border-slate-100">
                <span>Total Amount Paid:</span>
                <span>₹{order.totalDp}</span>
              </div>
            </div>
          </div>

          {/* Print & Action Controls */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/store"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-[#144732] text-xs font-bold flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>

            <div className="flex items-center gap-3">
              <PrintButton />
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl bg-[#144732] text-white hover:bg-[#0b2b1e] text-xs font-bold shadow-md"
              >
                Go to Member Dashboard →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

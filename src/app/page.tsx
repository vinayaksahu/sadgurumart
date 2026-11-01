import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import HomeGallery from '@/components/HomeGallery';
import { prisma } from '@/lib/prisma';
import { getSystemSettings } from '@/lib/settings';
import AdminNoticeBanner from '@/components/AdminNoticeBanner';
import AdminPopupModal from '@/components/AdminPopupModal';
import { 
  ShoppingBag, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  PhoneCall, 
  MessageSquare,
  Lock,
  ChevronRight
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let featuredProducts: any[] = [];
  let galleryItems: any[] = [];
  let settings: any = null;

  try {
    const [prods, gallery, stngs] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      prisma.galleryItem.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      getSystemSettings(),
    ]);
    featuredProducts = prods;
    galleryItems = gallery;
    settings = stngs;
  } catch (err) {
    console.error('HomePage data fetch error:', err);
  }
  const categories = [
    { name: 'किचन केयर (Kitchen Care)', count: 'इलायची व अमृततुल्य चाय', icon: '🍃', desc: 'असम की चुनिंदा पत्तियाँ व प्राकृतिक इलायची' },
    { name: 'हेल्थ केयर (Health Care)', count: 'तुलसी ड्रॉप्स व बेरी जूस', icon: '🌿', desc: 'रोगमुक्त जीवन हेतु 100% प्राकृतिक सप्लीमेंट्स' },
    { name: 'पर्सनल केयर (Personal Care)', count: 'सैफ्रन फेस वॉश व पेस्ट', icon: '✨', desc: 'दैनिक त्वचा पोषण एवं ओरल हाइजीन' },
    { name: 'होम केयर (Home Care)', count: 'प्रीमियम अगरबत्ती व धूप', icon: '🪔', desc: 'गुलाब, मोगरा और चंदन की पवित्र खुशबू' },
    { name: 'ब्यूटी केयर (Beauty Care)', count: 'हेयर ऑयल व शैम्पू', icon: '🌸', desc: 'बालों की जड़ों को पोषण एवं प्राकृतिक चमक' },
    { name: 'कपड़े (Clothing)', count: 'डेली वियर व एथनिक', icon: '👔', desc: 'उच्च गुणवत्ता वाले आरामदायक परिधान' },
    { name: 'ज्वेलरी (Jewellery)', count: 'पारंपरिक व ट्रेंडी डिजाइन्स', icon: '💎', desc: 'फैशन एक्सेसरीज एवं प्रीमियम आभूषण' },
    { name: 'एग्रीकल्चर (Agriculture)', count: 'जैविक खाद व उत्पाद', icon: '🌱', desc: 'किसानों की उपज बढ़ाने हेतु प्राकृतिक पोषण' },
    { name: 'इलेक्ट्रॉनिक्स (Electronics)', count: 'स्मार्ट गैजेट्स व एप्लायंसेज', icon: '⚡', desc: 'किफायती दाम पर आधुनिक तकनीकी उपकरण' },
  ];

  const highlights = [
    { title: '₹150 से आसान शुरुआत', subtitle: 'हर परिवार के अनुकूल उपयोगी उत्पाद बंडल', icon: CheckCircle2 },
    { title: '16 प्रकार की महा इनकम', subtitle: 'वर्किंग व नॉन-वर्किंग 2x2 ग्लोबल ऑटोपूल', icon: TrendingUp },
    { title: 'रोजाना क्लोजिंग • वीकली विड्रॉल', subtitle: 'मात्र ₹100 होते ही सीधा बैंक ट्रांसफर', icon: ShieldCheck },
    { title: '100% कानूनी एवं पारदर्शी', subtitle: 'कस्टमर प्रोटेक्शन डायरेक्ट सेलिंग नियम 2021 अनुकूल', icon: Award },
  ];

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-[#1f2937] font-sans flex flex-col selection:bg-[#d4a359] selection:text-[#0b2b1e]">
      <Navbar />

      {/* Admin Broadcast Notice (If enabled) */}
      {settings.noticeEnabled && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full">
          <AdminNoticeBanner
            enabled={settings.noticeEnabled}
            type={settings.noticeType}
            title={settings.noticeTitle}
            text={settings.noticeText}
            link={settings.noticeLink}
          />
        </div>
      )}

      {/* Global Screen Popup Modal (If enabled for ALL or GUESTS) */}
      {settings.popupEnabled && (settings.popupTarget === 'ALL' || settings.popupTarget === 'GUESTS') && (
        <AdminPopupModal
          enabled={settings.popupEnabled}
          title={settings.popupTitle}
          content={settings.popupContent}
          imageUrl={settings.popupImageUrl}
          buttonText={settings.popupButtonText}
          buttonLink={settings.popupButtonLink}
          updatedAt={settings.updatedAt}
        />
      )}

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#144732]/10 border border-[#144732]/20 text-[#144732] text-xs font-black tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                उत्पादों के साथ आत्मनिर्भर व्यापार का अवसर
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#144732] tracking-tight leading-[1.15]">
                मार्केट रेट पर उपयोगी उत्पाद,{' '}
                <span className="text-[#92580a]">16 प्रकार की महा इनकम!</span>
              </h1>

              <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-2xl">
                किचन, पर्सनल केयर, और स्वास्थ्यवर्धक आयुर्वेदिक उत्पादों की सीधी खरीदारी करें और भारत के सबसे पारदर्शी डायरेक्ट सेलिंग एवं 2x2 ऑटोपूल नेटवर्क का हिस्सा बनें।
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-[#d4a359] via-[#fef08a] to-[#bc853c] text-[#0b2b1e] font-black text-sm sm:text-base shadow-xl shadow-[#d4a359]/25 hover:opacity-95 transition-all flex items-center justify-center gap-3 cursor-pointer text-center"
                >
                  <span>आज ही मेंबर बनें (Start Now)</span>
                  <ArrowRight className="w-5 h-5 shrink-0" />
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-white border-2 border-[#144732]/20 text-[#144732] font-bold text-sm sm:text-base hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm text-center"
                >
                  <Users className="w-5 h-5 text-[#144732] shrink-0" />
                  <span>डिस्ट्रीब्यूटर लॉगिन</span>
                </Link>
              </div>

              {/* 4 Feature Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#d8d0bf]/60">
                {highlights.map((h, i) => {
                  const Icon = h.icon;
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-black text-[#144732]">
                        <Icon className="w-4 h-4 text-[#92580a] flex-shrink-0" />
                        <span>{h.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium leading-tight">
                        {h.subtitle}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Side Visual Showcase Card */}
            <div className="lg:col-span-5">
              <div className="bg-gradient-to-br from-[#144732] to-[#0b2b1e] border-4 border-[#d4a359] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#d4a359]/15 blur-3xl rounded-full pointer-events-none" />

                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                  <div className="text-xs uppercase tracking-widest text-[#fef08a] font-black">
                    BUSINESS PLAN HIGHLIGHTS
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#d4a359] text-[#144732] text-xs font-black">
                    सुलभ शुरुआत ₹150
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/10 flex justify-between items-center">
                    <div>
                      <div className="text-xs text-slate-300 font-medium">डायरेक्ट स्पॉन्सर इनकम</div>
                      <div className="text-xl font-black text-white">10% Instant PV</div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300">
                      अनलिमिटेड डायरेक्ट
                    </span>
                  </div>

                  <div className="bg-white/10 rounded-2xl p-4 border border-white/10 flex justify-between items-center">
                    <div>
                      <div className="text-xs text-slate-300 font-medium">बाइनरी मैचिंग इनकम</div>
                      <div className="text-xl font-black text-white">10% (1:1 Ratio)</div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300">
                      डेली क्लोजिंग 12 AM
                    </span>
                  </div>

                  <div className="bg-white/10 rounded-2xl p-4 border border-white/10 flex justify-between items-center">
                    <div>
                      <div className="text-xs text-slate-300 font-medium">ग्लोबल नॉन-वर्किंग ऑटोपूल</div>
                      <div className="text-2xl font-black text-[#fef08a]">₹ 13.19 Crore+</div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-yellow-400/20 text-yellow-200">
                      7 लेवल्स 2x2
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-white/10 text-center">
                  <div className="text-xs font-bold text-slate-300">
                    आधिकारिक हेल्पलाइन: <span className="text-[#fef08a] font-black">6267392508 / 7611148925</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9 Categories Section */}
      <section id="categories" className="py-16 bg-white border-y border-[#e8e3d5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-[0.2em] text-[#92580a] font-extrabold">
              COMPREHENSIVE SEGMENTS
            </span>
            <h2 className="text-3xl font-black text-[#144732] mt-1">
              एक ही प्लेटफ़ॉर्म पर 9 प्रमुख प्रोडक्ट कैटेगरी
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              दैनिक जीवन में इस्तेमाल होने वाले ब्रांडेड गुणवत्ता युक्त उत्पाद मार्केट कॉम्पिटिटिव दरों पर उपलब्ध।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((c, i) => (
              <div 
                key={i}
                className="p-6 rounded-2xl bg-[#faf8f4] border border-[#e8e3d5] hover:border-[#144732]/40 transition-all hover:shadow-md"
              >
                <div className="text-3xl mb-3">{c.icon}</div>
                <h3 className="text-lg font-black text-[#144732]">{c.name}</h3>
                <div className="text-xs font-bold text-[#92580a] mt-0.5">{c.count}</div>
                <p className="text-xs text-slate-600 mt-2 font-medium leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Products Showcase Section (Direct from DB, No Login Required) */}
      <section id="products" className="py-20 bg-[#f8f6f0] border-b border-[#e8e3d5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#144732]/10 border border-[#144732]/20 text-[#144732] text-xs font-black tracking-wide uppercase mb-3">
                <ShoppingBag className="w-3.5 h-3.5 text-[#d4a359]" />
                लाइव प्रोडक्ट कैटलॉग (Live Products)
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#144732] tracking-tight">
                लोकप्रिय उत्पाद एवं <span className="text-[#92580a]">एक्टिवेशन पैकेज</span>
              </h2>
              <p className="text-slate-600 text-sm font-medium mt-1">
                एडमिन पैनल से लाइव अपडेटेड प्रोडक्ट्स — बिना लॉगिन किए भी सीधे कार्ट में जोड़ें व ऑर्डर करें।
              </p>
            </div>

            <Link
              href="/store"
              className="px-6 py-3 rounded-2xl bg-[#144732] hover:bg-[#0b2b1e] text-[#fef08a] font-black text-xs shadow-md transition-all flex items-center gap-2 shrink-0 group"
            >
              <span>सभी उत्पाद स्टोर देखें (View Full Store)</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#e8e3d5]">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <div className="text-sm font-bold text-slate-600">प्रोडक्ट्स लोड हो रहे हैं...</div>
              <p className="text-xs text-slate-400 mt-1">एडमिन इन्वेंट्री डेस्क से नए प्रोडक्ट्स जोड़े जा सकते हैं।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} product={p as any} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Photo Gallery Section (Updated from Admin Panel) */}
      <HomeGallery items={galleryItems as any} />

      {/* Footer */}
      <footer className="bg-[#0b2b1e] text-white pt-14 pb-8 border-t-4 border-[#d4a359]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/10">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-[#144732] flex items-center justify-center font-black text-white border border-[#d4a359]">
                  SGM
                </div>
                <span className="font-black text-xl tracking-tight text-white">SGM MART</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                SGM Mart Online Service Pvt. Ltd. दैनिक उपयोग के उपयोगी उत्पादों के साथ हर भारतीय परिवार के लिए स्वरोजगार व समृद्धि का मार्ग।
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#d4a359] uppercase tracking-wider mb-4">Quick Links</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><Link href="/login" className="hover:text-white">Member Sign In</Link></li>
                <li><Link href="/register" className="hover:text-white">New Registration</Link></li>
                <li><Link href="/adminlogin" className="hover:text-white">Staff Admin Login</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#d4a359] uppercase tracking-wider mb-4">Legal & Compliance</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>Direct Selling Rules 2021 Compliant</li>
                <li>TDS & Admin Statutory Terms</li>
                <li>Grievance Officer Support</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#d4a359] uppercase tracking-wider mb-4">Contact Helpline</h4>
              <div className="space-y-2 text-xs text-slate-300">
                <p className="flex items-center gap-2"><PhoneCall className="w-3.5 h-3.5 text-[#d4a359]" /> 6267392508</p>
                <p className="flex items-center gap-2"><MessageSquare className="w-3.5 h-3.5 text-[#22c55e]" /> 7611148925 (WhatsApp)</p>
                <p className="text-[#fef08a] font-semibold mt-2">www.sadgurumart.online</p>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <div>
              © 2026 SGM MART ONLINE SERVICE PVT. LTD. All Rights Reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>Customer First • Always Transparent</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

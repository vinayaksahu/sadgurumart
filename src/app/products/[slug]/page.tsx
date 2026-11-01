import React from 'react';
import Navbar from '@/components/Navbar';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, ShieldCheck, Truck, RefreshCw, Sparkles } from 'lucide-react';
import ProductDetailActions from './ProductDetailActions';
import { formatGoogleDriveUrl } from '@/lib/imageUtils';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product) {
    notFound();
  }

  const discountPercent = Math.round(((product.mrp - product.dpPrice) / product.mrp) * 100);

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-[#1f2937] font-sans flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
          <Link href="/store" className="hover:text-[#144732] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Store</span>
          </Link>
          <span>/</span>
          <Link href={`/store?category=${product.category?.slug}`} className="hover:text-[#144732]">
            {product.category?.name}
          </Link>
          <span>/</span>
          <span className="text-[#144732] truncate max-w-xs">{product.title}</span>
        </div>

        <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left: Product Showcase */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center bg-[#faf8f4] border border-[#e8e3d5] rounded-2xl relative aspect-square overflow-hidden">
              {product.isActivation && (
                <div className="absolute top-4 left-4 z-10 bg-[#144732] text-[#fef08a] text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                  ⭐ एक्टिवेशन पैकेज बंडल
                </div>
              )}
              {product.images && product.images.length > 0 && product.images[0] ? (
                <img 
                  src={formatGoogleDriveUrl(product.images[0])} 
                  alt={product.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-40 h-40 rounded-full bg-[#144732]/10 border-4 border-[#d4a359]/30 flex items-center justify-center text-7xl">
                  {product.category?.slug === 'kitchen-care' ? '🍵' : 
                   product.category?.slug === 'health-care' ? '🌿' : 
                   product.category?.slug === 'personal-care' ? '✨' : 
                   product.category?.slug === 'home-care' ? '🪔' : '📦'}
                </div>
              )}
            </div>

            {/* Right: Product Info & Purchase Actions */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#92580a] font-extrabold">
                  {product.category?.name}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-[#144732] tracking-tight mt-1 leading-tight">
                  {product.title}
                </h1>
              </div>

              {/* Price Block */}
              <div className="p-4 rounded-2xl bg-[#faf8f4] border border-[#e8e3d5] flex items-center gap-6">
                <div>
                  <div className="text-xs text-slate-400 font-semibold line-through">
                    MRP ₹{product.mrp}
                  </div>
                  <div className="text-3xl font-black text-[#144732] leading-none mt-1">
                    ₹{product.dpPrice} <span className="text-xs font-bold text-slate-500">DP (डिस्ट्रीब्यूटर रेट)</span>
                  </div>
                </div>

                {discountPercent > 0 && (
                  <div className="px-3 py-1.5 rounded-xl bg-[#92580a] text-white text-xs font-black uppercase tracking-wider">
                    बचत: {discountPercent}% OFF
                  </div>
                )}
              </div>

              {/* MLM Points Matrix */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#eaf5ed] border border-[#144732]/20">
                  <div className="text-xs font-bold text-[#144732] uppercase tracking-wider">
                    पॉइंट वैल्यू (Point Value)
                  </div>
                  <div className="text-2xl font-black text-[#144732] mt-1">
                    {product.pv} PV
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    डायरेक्ट बोनस व बाइनरी मैचिंग हेतु मान्य
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#fdfaf3] border border-[#d4a359]/30">
                  <div className="text-xs font-bold text-[#92580a] uppercase tracking-wider">
                    बिज़नेस वैल्यू (Business Value)
                  </div>
                  <div className="text-2xl font-black text-[#92580a] mt-1">
                    {product.bv} BV
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    10% सेल्फ व टीम रीपरचेस कैशबैक हेतु मान्य
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  विवरण एवं विशेषताएं
                </h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Client Component for Quantity & Add to Cart */}
              <ProductDetailActions product={product as any} />

              {/* Assurance Trust Badges */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-[11px] text-slate-500 font-semibold">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#144732] flex-shrink-0" />
                  <span>100% ओरिजिनल प्रोडक्ट</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#144732] flex-shrink-0" />
                  <span>ऑल इंडिया फास्ट डिलीवरी</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-[#144732] flex-shrink-0" />
                  <span>पारदर्शी रिटर्न पॉलिसी</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

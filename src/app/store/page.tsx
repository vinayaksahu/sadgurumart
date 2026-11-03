import React from 'react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Filter, Sparkles } from 'lucide-react';

interface StorePageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
  }>;
}

export const dynamic = 'force-dynamic';

let cachedCategories: any[] = [];
let categoriesExpiry = 0;
async function getCategories() {
  const now = Date.now();
  if (cachedCategories.length > 0 && now < categoriesExpiry) {
    return cachedCategories;
  }
  try {
    const cList = await prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    });
    cachedCategories = cList;
    categoriesExpiry = now + 60 * 1000;
    return cList;
  } catch (err) {
    console.error('Failed to load categories:', err);
    return cachedCategories;
  }
}

export default async function StorePage({ searchParams }: StorePageProps) {
  const { category, search } = await searchParams;

  const where: any = { isActive: true };
  if (category) {
    where.category = { slug: category };
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  let products: any[] = [];
  let categories: any[] = [];
  try {
    const [pList, cList] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      }),
      getCategories(),
    ]);
    products = pList;
    categories = cList;
  } catch (err) {
    console.error('StorePage data fetch error:', err);
  }

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-[#1f2937] font-sans flex flex-col">
      <Navbar />

      {/* Store Header Banner */}
      <section className="bg-gradient-to-r from-[#144732] to-[#0b2b1e] text-white py-12 px-4 sm:px-6 lg:px-8 border-b-4 border-[#d4a359]">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4a359]/20 text-[#fef08a] text-xs font-black uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              SGM Mart Official D2C Store
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              उपयोगी उत्पाद • पारदर्शी डिस्काउंटेड DP मूल्य
            </h1>
            <p className="text-sm text-slate-300 mt-2 font-medium">
              हर खरीदारी पर पाएं डिस्ट्रीब्यूटर डिस्काउंट, PV पॉइंट्स एवं लाइफटाइम रिपरचेस कैशबैक।
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Categories Sidebar / Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 sticky top-28 shadow-sm">
              <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider text-[#144732] mb-4 pb-3 border-b border-slate-100">
                <Filter className="w-4 h-4 text-[#92580a]" />
                <span>कैटेगरी फ़िल्टर</span>
              </div>

              <div className="space-y-1.5">
                <Link
                  href="/store"
                  className={`block px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    !category
                      ? 'bg-[#144732] text-white'
                      : 'text-slate-600 hover:bg-[#faf8f4] hover:text-[#144732]'
                  }`}
                >
                  सभी उत्पाद (All Products)
                </Link>

                {categories.map((cat) => {
                  const isSelected = category === cat.slug;
                  return (
                    <Link
                      key={cat.id}
                      href={`/store?category=${cat.slug}`}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        isSelected
                          ? 'bg-[#144732] text-white'
                          : 'text-slate-600 hover:bg-[#faf8f4] hover:text-[#144732]'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {cat._count.products}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="text-xs font-bold text-slate-500">
                दिखाए जा रहे हैं: <strong className="text-[#144732]">{products.length} उत्पाद</strong>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="bg-white border border-[#e8e3d5] rounded-3xl p-12 text-center text-slate-500">
                <p className="text-base font-bold text-slate-700">इस श्रेणी में कोई उत्पाद उपलब्ध नहीं है।</p>
                <Link
                  href="/store"
                  className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-[#144732] text-white text-xs font-bold"
                >
                  सभी उत्पाद देखें
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p as any} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

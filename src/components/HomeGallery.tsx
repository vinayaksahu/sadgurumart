'use client';

import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Maximize2
} from 'lucide-react';
import { formatGoogleDriveUrl } from '@/lib/imageUtils';

interface GalleryItem {
  id: string;
  title: string;
  caption: string | null;
  imageUrl: string;
  category: string;
  sortOrder: number;
}

interface HomeGalleryProps {
  items: GalleryItem[];
}

export default function HomeGallery({ items }: HomeGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  // Fallback demo photos if admin hasn't uploaded any yet
  const displayItems = items.length > 0 ? items : [
    {
      id: 'demo-1',
      title: 'SGM Mart भव्य नेशनल लीडरशिप कॉन्फ्रेंस',
      caption: 'हजारों डायरेक्ट सेलर्स की उपस्थिति में वार्षिक महासम्मेलन व सम्मान समारोह।',
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
      category: 'EVENT',
      sortOrder: 1,
    },
    {
      id: 'demo-2',
      title: 'डायमंड व क्राउन अचीवर्स कार एवं रिवॉर्ड्स वितरण',
      caption: 'सफल लीडर्स को मंच पर सम्मानित करते हुए कंपनी मैनेजमेंट।',
      imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
      category: 'AWARD',
      sortOrder: 2,
    },
    {
      id: 'demo-3',
      title: 'प्रीमियम आयुर्वेदिक व हर्बल सप्लीमेंट्स लॉन्च',
      caption: 'प्राकृतिक तत्वों से निर्मित उच्च गुणवत्ता वाले स्वास्थ्यवर्धक उत्पाद।',
      imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80',
      category: 'PRODUCT',
      sortOrder: 3,
    },
    {
      id: 'demo-4',
      title: 'SGM Mart कॉर्पोरेट हेडक्वार्टर व डिस्ट्रीब्यूशन सेंटर',
      caption: 'अत्याधुनिक लॉजिस्टिक्स एवं डिस्ट्रीब्यूटर सहायता केंद्र।',
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
      category: 'OFFICE',
      sortOrder: 4,
    },
  ];

  const filtered = selectedCategory === 'ALL' 
    ? displayItems 
    : displayItems.filter((item) => item.category === selectedCategory);

  const categories = [
    { id: 'ALL', label: 'सभी फोटोज (All)' },
    { id: 'EVENT', label: 'कंपनी सेमिनार (Seminars)' },
    { id: 'AWARD', label: 'लीडरशिप अवार्ड्स (Awards)' },
    { id: 'PRODUCT', label: 'उत्पाद लॉन्च (Products)' },
    { id: 'OFFICE', label: 'हेड ऑफिस (Offices)' },
  ];

  return (
    <section id="gallery" className="py-20 bg-[#faf8f4] border-t border-[#e8e3d5] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#144732]/10 border border-[#144732]/20 text-[#144732] text-xs font-black tracking-wide uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#d4a359]" />
            फोटो गैलरी व यादगार पल
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#144732] tracking-tight">
            SGM Mart <span className="text-[#92580a]">इवेंट्स, सेमिनार व उपलब्धियाँ</span>
          </h2>
          <p className="text-slate-600 font-medium text-sm sm:text-base mt-2">
            हमारे विशाल डायरेक्ट सेलिंग परिवार के अचीवमेंट्स, नेशनल सेलीब्रेशन्स एवं प्रोडक्ट लॉन्च की झलकियाँ।
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === c.id
                    ? 'bg-[#144732] text-[#fef08a] shadow-md shadow-[#144732]/20'
                    : 'bg-white border border-[#e8e3d5] text-slate-700 hover:border-[#144732] hover:text-[#144732]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((item, index) => {
            const formattedUrl = formatGoogleDriveUrl(item.imageUrl);
            return (
              <div
                key={item.id}
                onClick={() => setActivePhotoIndex(index)}
                className="group relative bg-white border border-[#e8e3d5] hover:border-[#d4a359] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src={formattedUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      (e.target as any).src = '/sgm_logo.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div className="text-white flex items-center gap-1.5 text-xs font-black">
                      <Maximize2 className="w-4 h-4 text-[#fef08a]" />
                      <span>बड़ा देखें (Zoom Photo)</span>
                    </div>
                  </div>

                  <div className="absolute top-3 left-3 bg-[#0b2b1e]/85 backdrop-blur-sm text-[#fef08a] px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow">
                    {item.category}
                  </div>
                </div>

                <div className="p-4 space-y-1">
                  <h3 className="font-extrabold text-[#144732] text-sm group-hover:text-[#92580a] transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  {item.caption && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.caption}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Fullscreen Modal */}
      {activePhotoIndex !== null && filtered[activePhotoIndex] && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-md" 
            onClick={() => setActivePhotoIndex(null)} 
          />

          <div className="relative max-w-4xl w-full z-10 text-white flex flex-col items-center">
            {/* Top Close Button */}
            <div className="w-full flex items-center justify-between pb-3">
              <span className="text-xs font-mono text-slate-300">
                {activePhotoIndex + 1} / {filtered.length}
              </span>
              <button
                onClick={() => setActivePhotoIndex(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Close photo"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Photo Container */}
            <div className="relative max-h-[75vh] w-full rounded-2xl overflow-hidden border border-white/20 bg-black/50 flex items-center justify-center shadow-2xl">
              <img
                src={formatGoogleDriveUrl(filtered[activePhotoIndex].imageUrl)}
                alt={filtered[activePhotoIndex].title}
                className="max-h-[75vh] max-w-full object-contain"
              />

              {/* Prev / Next Buttons */}
              {activePhotoIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhotoIndex(activePhotoIndex - 1);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {activePhotoIndex < filtered.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhotoIndex(activePhotoIndex + 1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Photo Caption */}
            <div className="w-full pt-4 text-center">
              <h4 className="text-base sm:text-lg font-black text-[#fef08a]">
                {filtered[activePhotoIndex].title}
              </h4>
              {filtered[activePhotoIndex].caption && (
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl mx-auto">
                  {filtered[activePhotoIndex].caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Sparkles, 
  X, 
  ExternalLink,
  Tag
} from 'lucide-react';
import { formatGoogleDriveUrl } from '@/lib/imageUtils';
import ImageUploader from '@/components/ImageUploader';

interface GalleryItem {
  id: string;
  title: string;
  caption: string | null;
  imageUrl: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

interface GalleryManagerProps {
  initialItems: GalleryItem[];
}

export default function GalleryManager({ initialItems }: GalleryManagerProps) {
  const searchParams = useSearchParams();
  const actionParam = searchParams.get('action');
  const catParam = searchParams.get('category');

  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [isModalOpen, setIsModalOpen] = useState(actionParam === 'add');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState(catParam ? catParam.toUpperCase() : 'EVENT');
  const [sortOrder, setSortOrder] = useState('0');

  useEffect(() => {
    if (actionParam === 'add') {
      setIsModalOpen(true);
    }
    if (catParam) {
      setCategory(catParam.toUpperCase());
    }
  }, [actionParam, catParam]);

  const previewFormattedUrl = imageUrl ? formatGoogleDriveUrl(imageUrl) : '';

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          caption,
          imageUrl,
          category,
          sortOrder: parseInt(sortOrder) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add photo');

      setItems((prev) => [data.item, ...prev]);
      setMessage({ type: 'success', text: 'नई फोटो गैलरी में जोड़ दी गई है!' });
      setIsModalOpen(false);
      setTitle('');
      setCaption('');
      setImageUrl('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Operation failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('क्या आप इस फोटो को गैलरी से हटाना चाहते हैं?')) return;

    try {
      const res = await fetch(`/api/admin/gallery?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      setItems((prev) => prev.filter((item) => item.id !== id));
      setMessage({ type: 'success', text: 'फोटो सफलतापूर्ण हटा दी गई।' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Delete failed' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#e8e3d5] rounded-3xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#144732] tracking-tight">
            कंपनी फोटो गैलरी (Gallery Desk)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            सेमिनार, लीडरशिप अवार्ड्स व प्रोडक्ट्स की फोटो जोड़ें — यह सीधे होमपेज गैलरी में दिखेगी।
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-[#144732] hover:bg-[#0b2b1e] text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-[#fef08a]" />
          <span>नई फोटो जोड़ें (Upload Photo)</span>
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Gallery Photos Grid */}
      <div className="bg-white border border-[#e8e3d5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h2 className="text-sm font-black text-[#144732]">
            अपलोड की गई फोटोज ({items.length} कुल फोटोज)
          </h2>
        </div>

        {items.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-600">अभी तक कोई फोटो नहीं जोड़ी गई है।</div>
            <p className="text-xs text-slate-400">
              ऊपर "नई फोटो जोड़ें" बटन दबाकर अपनी पहली कंपनी सेमिनार या प्रोडक्ट फोटो जोड़ें।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="group bg-[#faf8f4] border border-[#e8e3d5] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  <img
                    src={formatGoogleDriveUrl(item.imageUrl)}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as any).src = '/sgm_logo.png';
                    }}
                  />
                  <div className="absolute top-2 left-2 bg-[#0b2b1e]/80 backdrop-blur-sm text-[#fef08a] px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {item.category}
                  </div>
                </div>

                <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-[#144732] text-sm leading-snug">
                      {item.title}
                    </h3>
                    {item.caption && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {item.caption}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400 font-mono">
                      क्रम: #{item.sortOrder}
                    </span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Photo Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-xl font-black text-[#144732]">
                  गैलरी में फोटो जोड़ें
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  फोटो अपलोड करें या लिंक दर्ज करें।
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  फोटो का शीर्षक (Title) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. SGM Mart नेशनल लीडरशिप मीट 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#144732]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    श्रेणी (Category)
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#144732]"
                  >
                    <option value="EVENT">कंपनी सेमिनार / इवेंट्स</option>
                    <option value="AWARD">अवार्ड्स व सम्मान</option>
                    <option value="PRODUCT">उत्पाद लॉन्च</option>
                    <option value="OFFICE">हेड ऑफिस व टीम</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    क्रम संख्या (Order)
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#144732]"
                  />
                </div>
              </div>

              {/* Image Uploader: Mobile Gallery / Camera + Google Drive */}
              <ImageUploader
                value={imageUrl}
                onChange={setImageUrl}
                label="गैलरी फोटो (Photo)"
                required
                folder="gallery"
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  संक्षिप्त विवरण (Caption)
                </label>
                <textarea
                  rows={2}
                  placeholder="इवेंट या फोटो का विवरण..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#144732]"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
                >
                  रद्द करें (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-[#144732] hover:bg-[#0b2b1e] text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>गैलरी में जोड़ें (Save Photo)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

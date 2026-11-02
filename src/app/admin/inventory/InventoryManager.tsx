'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Image as ImageIcon, 
  Check, 
  AlertCircle, 
  Sparkles, 
  RefreshCw,
  ExternalLink,
  X
} from 'lucide-react';
import { formatGoogleDriveUrl } from '@/lib/imageUtils';
import ImageUploader from '@/components/ImageUploader';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  mrp: number;
  dpPrice: number;
  pv: number;
  bv: number;
  directIncome?: number;
  stockQuantity: number;
  images: string[];
  isActivation: boolean;
  isActive: boolean;
  categoryId: string;
  category?: Category;
}

interface InventoryManagerProps {
  initialProducts: Product[];
  categories: Category[];
}

export default function InventoryManager({ initialProducts, categories }: InventoryManagerProps) {
  const searchParams = useSearchParams();
  const actionParam = searchParams.get('action');

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, ACTIVATION, REPURCHASE
  const [isModalOpen, setIsModalOpen] = useState(actionParam === 'add');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (actionParam === 'add') {
      setEditingProduct(null);
      setIsModalOpen(true);
    }
  }, [actionParam]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [description, setDescription] = useState('');
  const [mrp, setMrp] = useState('199');
  const [dpPrice, setDpPrice] = useState('150');
  const [pv, setPv] = useState('15');
  const [bv, setBv] = useState('10');
  const [directIncome, setDirectIncome] = useState('0');
  const [stockQuantity, setStockQuantity] = useState('100');
  const [imageUrl, setImageUrl] = useState('');
  const [isActivation, setIsActivation] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setEditingProduct(null);
    setTitle('');
    setCategoryId(categories[0]?.id || '');
    setDescription('');
    setMrp('199');
    setDpPrice('150');
    setPv('15');
    setBv('10');
    setDirectIncome('0');
    setStockQuantity('100');
    setImageUrl('');
    setIsActivation(false);
    setIsActive(true);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setTitle(p.title);
    setCategoryId(p.categoryId);
    setDescription(p.description);
    setMrp(p.mrp.toString());
    setDpPrice(p.dpPrice.toString());
    setPv(p.pv.toString());
    setBv(p.bv.toString());
    setDirectIncome((p.directIncome ?? 0).toString());
    setStockQuantity(p.stockQuantity.toString());
    setImageUrl(p.images && p.images.length > 0 ? p.images[0] : '');
    setIsActivation(p.isActivation);
    setIsActive(p.isActive);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const payload = {
        title,
        categoryId,
        description,
        mrp: parseFloat(mrp),
        dpPrice: parseFloat(dpPrice),
        pv: parseFloat(pv),
        bv: parseFloat(bv),
        directIncome: parseFloat(directIncome) || 0,
        stockQuantity: parseInt(stockQuantity),
        imageUrl,
        isActivation,
        isActive,
      };

      let res;
      if (editingProduct) {
        res = await fetch('/api/admin/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingProduct.id, ...payload }),
        });
      } else {
        res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product');

      if (editingProduct) {
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? data.product : p)));
        setMessage({ type: 'success', text: `Product "${data.product.title}" updated successfully!` });
      } else {
        setProducts((prev) => [data.product, ...prev]);
        setMessage({ type: 'success', text: `Product "${data.product.title}" added to inventory!` });
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Operation failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, productTitle: string) => {
    if (!confirm(`Are you sure you want to delete/archive "${productTitle}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      setProducts((prev) => prev.filter((p) => p.id !== id));
      setMessage({ type: 'success', text: data.message || 'Product removed' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Delete failed' });
    }
  };

  // Filtered Products
  const filtered = products.filter((p) => {
    const matchesSearch = 
      p.title.toLowerCase().includes(search.toLowerCase()) || 
      p.slug.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory ? p.categoryId === selectedCategory : true;
    const matchesType = 
      filterType === 'ALL' ? true :
      filterType === 'ACTIVATION' ? p.isActivation : !p.isActivation;
    return matchesSearch && matchesCategory && matchesType;
  });

  const previewFormattedUrl = imageUrl ? formatGoogleDriveUrl(imageUrl) : '';

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#e8e3d5] rounded-3xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#144732] tracking-tight">
            इन्वेंट्री व प्रोडक्ट मैनेजमेंट (Inventory Desk)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            प्रोडक्ट्स, DP प्राइस, PV/BV व स्टॉक अपडेट करें — यह मेम्बर व होमपेज पर तुरंत लाइव होगा।
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 rounded-2xl bg-[#144732] hover:bg-[#0b2b1e] text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-[#fef08a]" />
          <span>नया पैकेज जोड़ें (Add Package)</span>
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

      {/* Filter & Search Bar */}
      <div className="bg-white border border-[#e8e3d5] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="प्रोडक्ट का नाम या कोड खोजें..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#144732]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#144732]"
          >
            <option value="">सभी श्रेणियाँ (All Categories)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <div className="flex rounded-xl border border-slate-200 overflow-hidden text-xs font-bold">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-2 transition-colors ${filterType === 'ALL' ? 'bg-[#144732] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              सभी ({products.length})
            </button>
            <button
              onClick={() => setFilterType('ACTIVATION')}
              className={`px-3 py-2 transition-colors ${filterType === 'ACTIVATION' ? 'bg-[#144732] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              एक्टिवेशन पैकेज
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid / Table */}
      <div className="bg-white border border-[#e8e3d5] rounded-3xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-black text-[#144732]">
            उपलब्ध इन्वेंट्री सूची ({filtered.length} प्रोडक्ट्स)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#faf8f4] border-b border-slate-100 text-[#144732] font-black uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">फोटो</th>
                <th className="py-3.5 px-4">प्रोडक्ट नाम व श्रेणी</th>
                <th className="py-3.5 px-4">MRP (₹)</th>
                <th className="py-3.5 px-4">DP प्राइस (₹)</th>
                <th className="py-3.5 px-4">PV / BV</th>
                <th className="py-3.5 px-4">स्टॉक</th>
                <th className="py-3.5 px-4">प्रकार / स्टेटस</th>
                <th className="py-3.5 px-4 text-right">एक्शन</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 font-bold">
                    कोई प्रोडक्ट नहीं मिला।
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const imageSrc = p.images && p.images.length > 0 ? formatGoogleDriveUrl(p.images[0]) : '';
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-xl bg-[#faf8f4] border border-slate-200 overflow-hidden flex items-center justify-center">
                          {imageSrc ? (
                            <img src={imageSrc} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-extrabold text-[#144732] text-sm">{p.title}</div>
                        <div className="text-[10px] text-[#92580a] font-bold mt-0.5">
                          {p.category?.name || 'Category'} • <span className="font-mono text-slate-400">{p.slug}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-500 line-through">
                        ₹{p.mrp.toFixed(2)}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-black text-emerald-700 text-sm">
                          ₹{p.dpPrice.toFixed(2)}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold">
                        <span className="text-[#144732] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mr-1">
                          {p.pv} PV
                        </span>
                        <span className="text-[#92580a] bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mr-1">
                          {p.bv} BV
                        </span>
                        {p.directIncome !== undefined && p.directIncome > 0 && (
                          <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                            ₹{p.directIncome} Direct
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-black ${
                          p.stockQuantity > 10 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {p.stockQuantity} Units
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          {p.isActivation && (
                            <span className="bg-[#144732] text-[#fef08a] px-2 py-0.5 rounded text-[9px] font-black uppercase">
                              Activation Pkg
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                            p.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {p.isActive ? 'Active (लाइव)' : 'Inactive (छुपा हुआ)'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-2 rounded-xl text-[#144732] hover:bg-[#144732]/10 transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.title)}
                            className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add / Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-xl font-black text-[#144732]">
                  {editingProduct ? 'प्रोडक्ट एडिट करें (Edit Product)' : 'नया प्रोडक्ट जोड़ें (Add New Product)'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  विवरण भरें और सेव करें — यह तुरंत सभी यूज़र्स को दिखाई देगा।
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  प्रोडक्ट का नाम (Title) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. SGM अमृततुल्य प्रीमियम चायपत्ती 250g"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#144732]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    कैटेगरी (Category) *
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#144732]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    स्टॉक मात्रा (Stock Quantity)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#144732]"
                  />
                </div>
              </div>

              {/* Image Uploader: Mobile Gallery / Camera + Google Drive */}
              <ImageUploader
                value={imageUrl}
                onChange={setImageUrl}
                label="प्रोडक्ट फोटो (Product Photo)"
                folder="products"
              />

              {/* Pricing, PV, BV & Direct Income */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    MRP (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#144732]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    DP प्राइस (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={dpPrice}
                    onChange={(e) => setDpPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-emerald-700 focus:outline-none focus:border-[#144732]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    PV (Matching)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={pv}
                    onChange={(e) => setPv(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#144732]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    BV (Repurchase)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={bv}
                    onChange={(e) => setBv(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#144732]"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-black text-blue-700 mb-1">
                    डायरेक्ट इनकम (Direct ₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={directIncome}
                    onChange={(e) => setDirectIncome(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-blue-200 bg-blue-50/40 text-xs font-bold text-blue-900 focus:outline-none focus:border-[#144732] focus:bg-white"
                  />
                </div>
              </div>

              {/* Activation Package & Active Checkboxes */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isActivation}
                    onChange={(e) => setIsActivation(e.target.checked)}
                    className="w-4 h-4 rounded text-[#144732] focus:ring-[#144732]"
                  />
                  <span>एक्टिवेशन पैकेज है (Activation Package)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#144732] focus:ring-[#144732]"
                  />
                  <span>प्रोडक्ट लाइव रखें (Active Status)</span>
                </label>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  प्रोडक्ट विवरण (Description)
                </label>
                <textarea
                  rows={3}
                  placeholder="सामग्री, उपयोग, फायदे आदि लिखें..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#144732]"
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  रद्द करें (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-[#144732] hover:bg-[#0b2b1e] text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingProduct ? 'बदलाव सेव करें (Save Changes)' : 'पैकेज जोड़ें (Add Package)'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

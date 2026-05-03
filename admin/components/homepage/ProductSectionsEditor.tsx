'use client';
import { useState } from 'react';
import { Save, Loader2, Plus, Trash2, Package } from 'lucide-react';
import {
  createHomepageSection, updateHomepageSection, getProducts,
} from '@/lib/api';
import { upsertSiteContent } from '@/lib/api';
import ProductPickerModal from '@/components/ProductPickerModal';

export default function ProductSectionsEditor({ sections, products, heading, onSaveHeading, onRefresh, saving }: any) {
  const [h, setH] = useState(heading.heading || '');
  const [sub, setSub] = useState(heading.subheading || '');
  const [items, setItems] = useState(sections);
  const [sectionSaving, setSectionSaving] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState<string | null>(null);

  const getProduct = (id: string) => products.find((p: any) => p.id === id);

  const handleSaveSection = async (section: any) => {
    setSectionSaving(section.id);
    try { await updateHomepageSection(section.id, { title: section.title, product_ids: section.product_ids, is_active: section.is_active }); }
    catch (err: any) { alert(err.message); }
    finally { setSectionSaving(null); }
  };

  const handleAddSection = async () => {
    if (items.length >= 4) { alert('Maximum 4 tabs allowed'); return; }
    try {
      const data = await createHomepageSection({ title: 'New Tab', section_type: 'custom', product_ids: [] });
      setItems((prev: any[]) => [...prev, data]);
      onRefresh();
    } catch (err: any) { alert(err.message); }
  };

  const handlePickerConfirm = (sectionId: string, selectedIds: string[]) => {
    setItems((prev: any[]) => prev.map((s: any) => s.id === sectionId ? { ...s, product_ids: selectedIds } : s));
    setPickerOpen(null);
  };

  const removeProduct = (sectionId: string, productId: string) => {
    setItems((prev: any[]) => prev.map((s: any) =>
      s.id === sectionId ? { ...s, product_ids: (s.product_ids || []).filter((id: string) => id !== productId) } : s
    ));
  };

  return (
    <div>
      <h3 className="font-bold text-gray-900 text-lg mb-1">Our Product Segment</h3>
      <p className="text-xs text-gray-400 mb-5">Manage the 4 product tabs on the homepage. Each tab can display up to 4 products.</p>

      {/* Section heading */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Section Heading</p>
        <input placeholder="Section heading" value={h} onChange={e => setH(e.target.value)} className="admin-input w-full" />
        <input placeholder="Section subheading" value={sub} onChange={e => setSub(e.target.value)} className="admin-input w-full" />
        <button onClick={() => onSaveHeading({ heading: h, subheading: sub })} disabled={saving} className="admin-btn text-sm">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Heading
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-700 text-sm">Product Tabs ({items.length}/4)</h4>
        <button onClick={handleAddSection} disabled={items.length >= 4} className={`admin-btn text-xs py-1.5 px-3 ${items.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <Plus size={12} /> Add Tab
        </button>
      </div>

      <div className="space-y-4">
        {items.map((section: any) => {
          const selectedProducts = (section.product_ids || []).map((id: string) => getProduct(id)).filter(Boolean);
          return (
            <div key={section.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                <input
                  type="text" value={section.title}
                  onChange={e => setItems((p: any[]) => p.map((s: any) => s.id === section.id ? { ...s, title: e.target.value } : s))}
                  className="font-bold text-gray-900 bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-primary focus:outline-none text-sm"
                  placeholder="Tab name"
                />
                <div className="flex items-center gap-2">
                  <button onClick={() => setPickerOpen(section.id)} className="admin-btn-outline text-xs py-1.5 px-3">
                    <Plus size={12} /> Select Products
                  </button>
                  <button onClick={() => handleSaveSection(section)} disabled={sectionSaving === section.id} className="admin-btn text-xs py-1.5 px-3">
                    {sectionSaving === section.id ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
                  </button>
                </div>
              </div>

              <div className="p-4">
                {selectedProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                    <Package size={28} className="mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-medium">No products selected</p>
                    <p className="text-[10px] mt-1">Click &quot;Select Products&quot; to add up to 4 products</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {selectedProducts.map((p: any) => (
                      <div key={p.id} className="relative group border border-gray-100 rounded-xl p-2.5 bg-gray-50/50">
                        <button onClick={() => removeProduct(section.id, p.id)} className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <Trash2 size={10} className="text-white" />
                        </button>
                        <div className="aspect-square rounded-lg bg-white overflow-hidden mb-2 border border-gray-100">
                          {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> :
                            <div className="w-full h-full flex items-center justify-center"><Package size={20} className="text-gray-300" /></div>}
                        </div>
                        <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2">{p.name}</p>
                        <p className="text-xs text-primary font-bold mt-1">₹{p.price}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Product Picker Modal */}
      {pickerOpen && (
        <ProductPickerModal
          products={products}
          selectedIds={items.find((s: any) => s.id === pickerOpen)?.product_ids || []}
          maxSelection={4}
          title="Select Products for Tab"
          onConfirm={(ids) => handlePickerConfirm(pickerOpen, ids)}
          onClose={() => setPickerOpen(null)}
        />
      )}
    </div>
  );
}

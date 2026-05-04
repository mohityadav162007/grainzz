'use client';
import { useState, useEffect } from 'react';
import { Save, Loader2, Plus, Trash2, Package, CheckCircle } from 'lucide-react';
import { saveProductTabs } from '@/lib/api';
import ProductPickerModal from '@/components/ProductPickerModal';

const HARDCODED_TABS = ['Bestsellers', 'Jar Combos', 'Puffed Rice Combos', 'Shop All Jars'];

export default function ProductSectionsEditor({ sections, products, onRefresh }: any) {
  const [items, setItems] = useState<{ title: string; product_ids: string[] }[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [pickerOpen, setPickerOpen] = useState<string | null>(null);

  useEffect(() => {
    const mapped = HARDCODED_TABS.map((title) => {
      const existing = (sections || []).find((s: any) => s.title === title);
      return {
        title,
        product_ids: existing?.product_ids || [],
      };
    });
    setItems(mapped);
  }, [sections]);

  const getProduct = (id: string) => products.find((p: any) => p.id === id);

  const handleSaveAll = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      await saveProductTabs(items);
      setSaveMsg('Saved successfully!');
      setTimeout(() => setSaveMsg(''), 3000);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePickerConfirm = (tabTitle: string, selectedIds: string[]) => {
    setItems((prev) =>
      prev.map((s) => (s.title === tabTitle ? { ...s, product_ids: selectedIds } : s))
    );
    setPickerOpen(null);
  };

  const removeProduct = (tabTitle: string, productId: string) => {
    setItems((prev) =>
      prev.map((s) =>
        s.title === tabTitle
          ? { ...s, product_ids: s.product_ids.filter((id) => id !== productId) }
          : s
      )
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Our Products</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage the 4 product tabs on the homepage. Each tab can display up to 4 products.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveMsg && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
              <CheckCircle size={14} /> {saveMsg}
            </span>
          )}
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="admin-btn text-sm py-2 px-5 flex items-center gap-2"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save All Changes
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((tab) => {
          const selectedProducts = (tab.product_ids || [])
            .map((id: string) => getProduct(id))
            .filter(Boolean);
          return (
            <div
              key={tab.title}
              className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm"
            >
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                <span className="font-bold text-gray-900 text-sm">{tab.title}</span>
                <button
                  onClick={() => setPickerOpen(tab.title)}
                  className="admin-btn-outline text-xs py-1.5 px-3 flex items-center gap-1"
                >
                  <Plus size={12} /> Select Products
                </button>
              </div>

              <div className="p-4">
                {selectedProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                    <Package size={28} className="mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-medium">No products selected</p>
                    <p className="text-[10px] mt-1">
                      Click &quot;Select Products&quot; to add up to 4 products
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {selectedProducts.map((p: any) => (
                      <div
                        key={p.id}
                        className="relative group border border-gray-100 rounded-xl p-2.5 bg-gray-50/50"
                      >
                        <button
                          onClick={() => removeProduct(tab.title, p.id)}
                          className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                          <Trash2 size={10} className="text-white" />
                        </button>
                        <div className="aspect-square rounded-lg bg-white overflow-hidden mb-2 border border-gray-100">
                          {p.images?.[0] ? (
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={20} className="text-gray-300" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2">
                          {p.name}
                        </p>
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
          selectedIds={items.find((s) => s.title === pickerOpen)?.product_ids || []}
          maxSelection={4}
          title={`Select Products for "${pickerOpen}"`}
          onConfirm={(ids) => handlePickerConfirm(pickerOpen, ids)}
          onClose={() => setPickerOpen(null)}
        />
      )}
    </div>
  );
}

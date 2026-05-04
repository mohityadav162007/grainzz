'use client';
import { useState } from 'react';
import { Save, Loader2, Package, Heart } from 'lucide-react';
import { updatePoweredByCard, createPoweredByCard, deletePoweredByCard } from '@/lib/api';
import ProductPickerModal from '@/components/ProductPickerModal';

export default function PoweredByEditor({ cards, products, onRefresh }: any) {
  const [items, setItems] = useState(cards);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState<number | null>(null);

  const getProduct = (id: string) => products.find((p: any) => p.id === id);

  const handleProductSelect = (slotIndex: number, selectedIds: string[]) => {
    if (selectedIds.length === 0) { setPickerOpen(null); return; }
    const productId = selectedIds[0];
    const product = products.find((p: any) => p.id === productId);
    if (product) {
      setItems((prev: any[]) => prev.map((s: any, idx: number) => idx === slotIndex ? {
        ...s,
        title: product.name,
        link: `/products/${product.slug}`,
        image_url: product.images?.[0] || '',
        product_id: product.id,
      } : s));
    }
    setPickerOpen(null);
  };

  const handleRemoveProduct = (slotIndex: number) => {
    setItems((prev: any[]) => prev.map((s: any, idx: number) => idx === slotIndex ? {
      ...s,
      title: '',
      link: '#',
      image_url: '',
      product_id: null,
    } : s));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // Ensure we have exactly 3 slots
      for (let i = 0; i < 3; i++) {
        const card = items[i];
        if (card?.id) {
          await updatePoweredByCard(card.id, {
            title: card.title || '',
            subtitle: card.subtitle || '',
            top_bg_color: card.top_bg_color || '',
            bottom_bg_color: card.bottom_bg_color || '',
            link: card.link || '#',
            image_url: card.image_url || '',
            product_id: card.product_id || null,
            is_active: true,
            sort_order: i + 1,
          });
        } else if (!card) {
          // Create empty slot if missing
          await createPoweredByCard({
            title: '', subtitle: '', top_bg_color: '', bottom_bg_color: '',
            link: '#', image_url: '', sort_order: i + 1,
          });
        }
      }

      // Cleanup any extra slots if the database has more than 3
      if (cards.length > 3) {
        for (let i = 3; i < cards.length; i++) {
          if (cards[i]?.id) {
            await deletePoweredByCard(cards[i].id);
          }
        }
      }

      onRefresh();
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  };

  // Ensure we always show 3 slots
  const slots = [0, 1, 2].map(i => items[i] || null);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Powered By Real Grainzz</h3>
          <p className="text-xs text-gray-400 mt-0.5">Select exactly 3 products for this section. These products will be prominently featured on the homepage.</p>
        </div>
        <button onClick={handleSaveAll} disabled={saving} className="admin-btn text-sm">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Changes
        </button>
      </div>

      {/* Status */}
      <div className="mb-5 px-4 py-2.5 bg-gray-50 rounded-xl flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${slots.filter(s => s?.product_id).length === 3 ? 'bg-green-500' : 'bg-yellow-500'}`} />
        <span className="text-xs text-gray-600 font-medium">
          {slots.filter(s => s?.product_id).length}/3 products selected
          {slots.filter(s => s?.product_id).length < 3 && <span className="text-gray-400 ml-1">— select {3 - slots.filter(s => s?.product_id).length} more</span>}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {slots.map((slot, i) => {
          const product = slot?.product_id ? getProduct(slot.product_id) : null;
          return (
            <div key={slot?.id || `slot-${i}`} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
              {/* Slot Number */}
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Slot {i + 1}</span>
                {product && (
                  <button
                    onClick={() => handleRemoveProduct(i)}
                    className="text-[10px] text-red-500 hover:text-red-700 font-medium hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              {product ? (
                /* Product Preview */
                <div className="p-4">
                  <div className="aspect-square rounded-xl bg-gray-50 overflow-hidden mb-3 border border-gray-100">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={32} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-bold text-gray-900 leading-tight line-clamp-2 mb-1">{product.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-primary">₹{product.price}</span>
                    {product.mrp > product.price && (
                      <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>
                    )}
                  </div>
                  <button
                    onClick={() => setPickerOpen(i)}
                    className="admin-btn-outline text-xs w-full justify-center py-2 mt-3"
                  >
                    <Package size={12} /> Change Product
                  </button>
                </div>
              ) : (
                /* Empty Slot */
                <div
                  onClick={() => setPickerOpen(i)}
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center mb-3">
                    <Package size={32} className="text-gray-300 mb-2" />
                    <span className="text-xs font-medium text-gray-400">Click to select product</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Product Picker */}
      {pickerOpen !== null && (
        <ProductPickerModal
          products={products}
          selectedIds={items[pickerOpen]?.product_id ? [items[pickerOpen].product_id] : []}
          maxSelection={1}
          title="Select Product for Slot"
          onConfirm={(ids) => handleProductSelect(pickerOpen, ids)}
          onClose={() => setPickerOpen(null)}
        />
      )}
    </div>
  );
}

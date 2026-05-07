'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Save, Loader2, Package, Upload, X, ImageIcon } from 'lucide-react';
import { updatePoweredByCard, createPoweredByCard, deletePoweredByCard, uploadPoweredByImage } from '@/lib/api';
import ProductPickerModal from '@/components/ProductPickerModal';

export default function PoweredByEditor({ cards, products, onRefresh }: any) {
  const [items, setItems] = useState(cards);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState<number | null>(null);
  const [uploading, setUploading] = useState<number | null>(null);
  const fileRefs = useRef<(HTMLInputElement | null)[]>([null, null, null]);

  // Sync local state when props change (after DB refresh)
  // Also validate: clear product references for deleted products
  useEffect(() => {
    const validProductIds = new Set(products.map((p: any) => p.id));
    const cleaned = (cards || []).map((card: any) => {
      if (card.product_id && !validProductIds.has(card.product_id)) {
        console.warn(`[PoweredBy] Slot "${card.title || 'untitled'}": orphan product_id ${card.product_id} removed`);
        return { ...card, product_id: null, title: '', link: '#' };
      }
      return card;
    });
    setItems(cleaned);
  }, [cards, products]);

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
        product_id: product.id,
        // Do NOT override custom_image_url — keep existing if set
      } : s));
    }
    setPickerOpen(null);
  };

  const handleCustomImageUpload = useCallback(async (idx: number, file: File) => {
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); return; }
    setUploading(idx);
    try {
      const publicUrl = await uploadPoweredByImage(file);
      setItems((prev: any[]) => prev.map((s: any, i: number) => i === idx ? { ...s, custom_image_url: publicUrl } : s));
    } catch (err: any) { alert('Upload failed: ' + err.message); }
    finally { setUploading(null); }
  }, []);

  const handleRemoveCustomImage = (idx: number) => {
    setItems((prev: any[]) => prev.map((s: any, i: number) => i === idx ? { ...s, custom_image_url: '' } : s));
  };

  const handleRemoveProduct = (slotIndex: number) => {
    setItems((prev: any[]) => prev.map((s: any, idx: number) => idx === slotIndex ? {
      ...s,
      title: '',
      link: '#',
      product_id: null,
    } : s));
  };

  const handleSaveAll = async () => {
    // Validate: no duplicate product_ids
    const selectedIds = items.filter((s: any) => s?.product_id).map((s: any) => s.product_id);
    const uniqueIds = new Set(selectedIds);
    if (selectedIds.length !== uniqueIds.size) {
      alert('Duplicate products are not allowed. Please select unique products for each slot.');
      return;
    }

    setSaving(true);
    try {
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
            custom_image_url: card.custom_image_url || '',
            product_id: card.product_id || null,
            is_active: true,
            sort_order: i + 1,
          });
        } else if (!card) {
          await createPoweredByCard({
            title: '', subtitle: '', top_bg_color: '', bottom_bg_color: '',
            link: '#', image_url: '', custom_image_url: '', sort_order: i + 1,
          });
        }
      }
      if (cards.length > 3) {
        for (let i = 3; i < cards.length; i++) {
          if (cards[i]?.id) await deletePoweredByCard(cards[i].id);
        }
      }
      console.log('[DB SAVE] Powered By cards saved');
      // Re-fetch from DB to confirm persistence
      onRefresh();
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  };

  const slots = [0, 1, 2].map(i => items[i] || null);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Powered By Real Grainzz</h3>
          <p className="text-xs text-gray-400 mt-0.5">Select exactly 3 products. Upload a <strong>custom image</strong> per card that overrides the product image in this section only.</p>
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
          const displayImage = slot?.custom_image_url || product?.images?.[0] || '';

          return (
            <div key={slot?.id || `slot-${i}`} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Slot {i + 1}</span>
                {product && (
                  <button onClick={() => handleRemoveProduct(i)} className="text-[10px] text-red-500 hover:text-red-700 font-medium hover:underline">Remove</button>
                )}
              </div>

              {product ? (
                <div className="p-4">
                  {/* Product Info */}
                  <p className="text-sm font-bold text-gray-900 leading-tight line-clamp-2 mb-1">{product.name}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-bold text-primary">₹{product.price}</span>
                    {product.mrp > product.price && <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>}
                  </div>

                  {/* Custom Image Upload */}
                  <div className="mb-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block flex items-center gap-1">
                      <ImageIcon size={10} /> Custom Image (overrides product image)
                    </label>
                    {displayImage ? (
                      <div className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square">
                        <img src={displayImage} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => fileRefs.current[i]?.click()} className="flex items-center gap-1 bg-white/90 backdrop-blur text-gray-700 text-[10px] font-medium px-2.5 py-1.5 rounded-lg shadow-sm hover:bg-white"><Upload size={10} /> Upload Custom</button>
                          {slot?.custom_image_url && (
                            <button onClick={() => handleRemoveCustomImage(i)} className="flex items-center gap-1 bg-red-500/90 backdrop-blur text-white text-[10px] font-medium px-2.5 py-1.5 rounded-lg shadow-sm hover:bg-red-600"><X size={10} /> Remove</button>
                          )}
                        </div>
                        {uploading === i && <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-gray-600" /></div>}
                        {slot?.custom_image_url && (
                          <div className="absolute bottom-2 left-2"><span className="bg-blue-500 text-white text-[9px] font-bold px-2 py-0.5 rounded">CUSTOM</span></div>
                        )}
                      </div>
                    ) : (
                      <div
                        onClick={() => fileRefs.current[i]?.click()}
                        className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all"
                      >
                        {uploading === i ? (
                          <><Loader2 size={24} className="animate-spin text-gray-400 mb-2" /><span className="text-xs text-gray-500">Uploading...</span></>
                        ) : (
                          <><Upload size={24} className="text-gray-300 mb-2" /><span className="text-xs font-medium text-gray-500">Upload custom image</span></>
                        )}
                      </div>
                    )}
                    <input ref={el => { fileRefs.current[i] = el; }} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleCustomImageUpload(i, f); e.target.value = ''; }} />
                  </div>

                  {/* Subtitle & Colors */}
                  <div className="space-y-3 pt-3 border-t border-gray-100">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Subtitle</label>
                      <input type="text" value={slot.subtitle || ''} onChange={e => setItems((prev: any[]) => prev.map((s, idx) => idx === i ? { ...s, subtitle: e.target.value } : s))}
                        className="admin-input text-xs w-full py-1.5" placeholder="e.g. upto 40% off" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Top BG</label>
                        <input type="text" value={slot.top_bg_color || ''} onChange={e => setItems((prev: any[]) => prev.map((s, idx) => idx === i ? { ...s, top_bg_color: e.target.value } : s))}
                          className="admin-input text-xs w-full py-1.5 font-mono" placeholder="#C68356" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Bottom BG</label>
                        <input type="text" value={slot.bottom_bg_color || ''} onChange={e => setItems((prev: any[]) => prev.map((s, idx) => idx === i ? { ...s, bottom_bg_color: e.target.value } : s))}
                          className="admin-input text-xs w-full py-1.5 font-mono" placeholder="#FDECE7" />
                      </div>
                    </div>
                  </div>

                  <button onClick={() => setPickerOpen(i)} className="admin-btn-outline text-xs w-full justify-center py-2 mt-4">
                    <Package size={12} /> Change Product
                  </button>
                </div>
              ) : (
                <div onClick={() => setPickerOpen(i)} className="p-4 cursor-pointer hover:bg-gray-50 transition-colors">
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

'use client';
import { useState } from 'react';
import { Save, Loader2, Plus, Trash2, Package } from 'lucide-react';
import { createPoweredByCard, updatePoweredByCard, deletePoweredByCard } from '@/lib/api';
import ProductPickerModal from '@/components/ProductPickerModal';

export default function PoweredByEditor({ cards, products, onRefresh }: any) {
  const [items, setItems] = useState(cards);
  const [saving, setSaving] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState<number | null>(null);

  const updateField = (i: number, field: string, val: string) => {
    setItems((prev: any[]) => prev.map((s: any, idx: number) => idx === i ? { ...s, [field]: val } : s));
  };

  const handleSave = async (card: any) => {
    setSaving(card.id);
    try {
      await updatePoweredByCard(card.id, {
        title: card.title, subtitle: card.subtitle,
        top_bg_color: card.top_bg_color, bottom_bg_color: card.bottom_bg_color,
        link: card.link, image_url: card.image_url,
        product_id: card.product_id || null,
        is_active: card.is_active, sort_order: card.sort_order,
      });
    } catch (err: any) { alert(err.message); }
    finally { setSaving(null); }
  };

  const handleProductSelect = (i: number, selectedIds: string[]) => {
    if (selectedIds.length === 0) { setPickerOpen(null); return; }
    const productId = selectedIds[0];
    const product = products.find((p: any) => p.id === productId);
    if (product) {
      setItems((prev: any[]) => prev.map((s: any, idx: number) => idx === i ? {
        ...s,
        title: product.name,
        link: `/products/${product.slug}`,
        image_url: product.images?.[0] || '',
        product_id: product.id,
      } : s));
    }
    setPickerOpen(null);
  };

  const handleAdd = async () => {
    if (items.length >= 3) { alert('Max 3 cards allowed'); return; }
    try {
      await createPoweredByCard({ title: 'New Card', subtitle: 'upto 40% off', top_bg_color: 'bg-[#C68356]', bottom_bg_color: 'bg-[#FDECE7]', link: '#', image_url: '', sort_order: items.length + 1 });
      onRefresh();
    } catch (err: any) { alert(err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this card?')) return;
    try { await deletePoweredByCard(id); onRefresh(); } catch (err: any) { alert(err.message); }
  };

  const getProduct = (id: string) => products.find((p: any) => p.id === id);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Powered By Real Grainzz ({items.length}/3)</h3>
          <p className="text-xs text-gray-400 mt-0.5">Select products and customize cards for the Powered By section. Maximum 3 cards.</p>
        </div>
        <button onClick={handleAdd} disabled={items.length >= 3} className={`admin-btn text-sm ${items.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <Plus size={14} /> Add Card
        </button>
      </div>

      {items.length === 0 && (
        <div className="text-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
          <Package size={36} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No cards yet</p>
          <p className="text-xs mt-1">Click &quot;Add Card&quot; to create your first product card</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {items.map((c: any, i: number) => (
          <div key={c.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
            {/* Card Preview */}
            <div className="relative aspect-[4/3] bg-gradient-to-b from-amber-100 to-orange-50 flex items-center justify-center overflow-hidden">
              {c.image_url ? (
                <img src={c.image_url} alt={c.title} className="w-full h-full object-cover" />
              ) : (
                <Package size={40} className="text-gray-300" />
              )}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-white font-bold text-sm truncate">{c.title || 'Untitled'}</p>
                <p className="text-white/70 text-xs">{c.subtitle || 'No subtitle'}</p>
              </div>
            </div>

            {/* Card Controls */}
            <div className="p-4 space-y-3">
              <button onClick={() => setPickerOpen(i)} className="admin-btn-outline text-xs w-full justify-center py-2">
                <Package size={12} /> {c.product_id ? 'Change Product' : 'Select Product'}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Title</label>
                  <input placeholder="Title" value={c.title || ''} onChange={e => updateField(i, 'title', e.target.value)} className="admin-input text-xs w-full" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Subtitle</label>
                  <input placeholder="Subtitle" value={c.subtitle || ''} onChange={e => updateField(i, 'subtitle', e.target.value)} className="admin-input text-xs w-full" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Top BG Color</label>
                  <input placeholder="e.g. bg-[#C68356]" value={c.top_bg_color || ''} onChange={e => updateField(i, 'top_bg_color', e.target.value)} className="admin-input text-xs w-full" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Bottom BG Color</label>
                  <input placeholder="e.g. bg-[#FDECE7]" value={c.bottom_bg_color || ''} onChange={e => updateField(i, 'bottom_bg_color', e.target.value)} className="admin-input text-xs w-full" />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Link</label>
                  <input placeholder="URL" value={c.link || ''} onChange={e => updateField(i, 'link', e.target.value)} className="admin-input text-xs w-full" />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={() => handleSave(c)} disabled={saving === c.id} className="admin-btn text-xs py-1.5 flex-1 justify-center">
                  {saving === c.id ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
                </button>
                <button onClick={() => handleDelete(c.id)} className="flex items-center gap-1 text-red-500 text-xs px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors border border-red-200">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Picker */}
      {pickerOpen !== null && (
        <ProductPickerModal
          products={products}
          selectedIds={items[pickerOpen]?.product_id ? [items[pickerOpen].product_id] : []}
          maxSelection={1}
          title="Select Product for Card"
          onConfirm={(ids) => handleProductSelect(pickerOpen, ids)}
          onClose={() => setPickerOpen(null)}
        />
      )}
    </div>
  );
}

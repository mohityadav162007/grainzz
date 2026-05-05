'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Save, Loader2, Upload, X, Package, ImageIcon, Link as LinkIcon } from 'lucide-react';
import { updateSnackBoxItems, uploadSnackBoxImage } from '@/lib/api';

const DEFAULT_ITEMS = [
  { id: '1', title: 'Box of 6', image_url: '', price: 599, original_price: 799, description: '', redirect_link: '/products' },
  { id: '2', title: 'Box of 10', image_url: '', price: 899, original_price: 1199, description: '', redirect_link: '/products' },
];

export default function SnackBoxEditor({ items: initialItems, onRefresh }: { items: any[]; onRefresh: () => void }) {
  const [items, setItems] = useState(initialItems.length >= 2 ? initialItems : DEFAULT_ITEMS);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);
  const fileRefs = useRef<(HTMLInputElement | null)[]>([null, null]);

  // Sync local state when props change (after DB refresh)
  useEffect(() => {
    setItems(initialItems.length >= 2 ? initialItems : DEFAULT_ITEMS);
  }, [initialItems]);

  const handleImageUpload = useCallback(async (idx: number, file: File) => {
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); return; }
    setUploading(idx);
    try {
      const publicUrl = await uploadSnackBoxImage(file);
      setItems(prev => prev.map((item, i) => i === idx ? { ...item, image_url: publicUrl } : item));
    } catch (err: any) { alert('Upload failed: ' + err.message); }
    finally { setUploading(null); }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSnackBoxItems(items);
      console.log('[DB SAVE] Snack Box items saved:', items);
      // Re-fetch from DB to confirm persistence
      onRefresh();
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  };

  const updateField = (idx: number, field: string, value: any) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Essential Snack Box</h3>
          <p className="text-xs text-gray-400 mt-0.5">Manage the two snack box options displayed on the homepage. These are independent of the products table.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="admin-btn text-sm">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item, idx) => (
          <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
            {/* Header */}
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
              <Package size={14} className="text-gray-400" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Item {idx + 1}</span>
            </div>

            <div className="p-4 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block flex items-center gap-1">
                  <ImageIcon size={10} /> Product Image
                </label>
                {item.image_url ? (
                  <div className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square max-w-[280px]">
                    <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => fileRefs.current[idx]?.click()} className="flex items-center gap-1 bg-white/90 backdrop-blur text-gray-700 text-[10px] font-medium px-2.5 py-1.5 rounded-lg shadow-sm hover:bg-white"><Upload size={10} /> Replace</button>
                      <button onClick={() => updateField(idx, 'image_url', '')} className="flex items-center gap-1 bg-red-500/90 backdrop-blur text-white text-[10px] font-medium px-2.5 py-1.5 rounded-lg shadow-sm hover:bg-red-600"><X size={10} /> Remove</button>
                    </div>
                    {uploading === idx && <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-gray-600" /></div>}
                  </div>
                ) : (
                  <div
                    onClick={() => fileRefs.current[idx]?.click()}
                    className="aspect-square max-w-[280px] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all"
                  >
                    {uploading === idx ? (
                      <><Loader2 size={24} className="animate-spin text-gray-400 mb-2" /><span className="text-xs text-gray-500">Uploading...</span></>
                    ) : (
                      <><Upload size={24} className="text-gray-300 mb-2" /><span className="text-xs font-medium text-gray-500">Click to upload image</span><span className="text-[10px] text-gray-400 mt-1">JPG, PNG, WebP · Max 5MB</span></>
                    )}
                  </div>
                )}
                <input ref={el => { fileRefs.current[idx] = el; }} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(idx, f); e.target.value = ''; }} />
              </div>

              {/* Title */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Title</label>
                <input type="text" value={item.title || ''} onChange={e => updateField(idx, 'title', e.target.value)}
                  className="admin-input text-sm w-full" placeholder="e.g. Box of 6" />
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Price (₹)</label>
                  <input type="number" value={item.price || ''} onChange={e => updateField(idx, 'price', Number(e.target.value))}
                    className="admin-input text-sm w-full" placeholder="599" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">MRP (₹)</label>
                  <input type="number" value={item.original_price || ''} onChange={e => updateField(idx, 'original_price', Number(e.target.value))}
                    className="admin-input text-sm w-full" placeholder="799" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Description</label>
                <textarea value={item.description || ''} onChange={e => updateField(idx, 'description', e.target.value)}
                  className="admin-input text-sm w-full" rows={3} placeholder="Brief description of this box..." />
              </div>

              {/* Redirect Link */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block flex items-center gap-1"><LinkIcon size={10} /> Redirect Link</label>
                <input type="text" value={item.redirect_link || ''} onChange={e => updateField(idx, 'redirect_link', e.target.value)}
                  className="admin-input text-sm w-full font-mono" placeholder="/products/essential-box-6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

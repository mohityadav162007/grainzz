'use client';
import { useState, useRef, useCallback } from 'react';
import { Save, Loader2, Plus, Trash2, GripVertical, Upload, ImageIcon, X } from 'lucide-react';
import {
  createHeroSlide, updateHeroSlide, deleteHeroSlide,
  uploadHeroImage, deleteHeroImage,
} from '@/lib/api';

export default function HeroSlidesEditor({ slides, onRefresh }: { slides: any[]; onRefresh: () => void }) {
  const [items, setItems] = useState(slides);
  const [saving, setSaving] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const updateField = (i: number, field: string, val: string) => {
    setItems(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  };

  const handleImageUpload = useCallback(async (slideId: string, idx: number, file: File, field: 'image_url' | 'mobile_image_url' = 'image_url') => {
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); return; }
    setUploading(`${slideId}-${field}`);
    try {
      const oldUrl = items[idx]?.[field];
      if (oldUrl?.includes('hero-images')) await deleteHeroImage(oldUrl).catch(() => {});
      const publicUrl = await uploadHeroImage(file);
      setItems(prev => prev.map((s, i) => i === idx ? { ...s, [field]: publicUrl } : s));
    } catch (err: any) { alert('Upload failed: ' + err.message); }
    finally { setUploading(null); }
  }, [items]);

  const handleRemoveImage = async (idx: number, field: 'image_url' | 'mobile_image_url' = 'image_url') => {
    const url = items[idx]?.[field];
    if (url?.includes('hero-images')) await deleteHeroImage(url).catch(() => {});
    setItems(prev => prev.map((s, i) => i === idx ? { ...s, [field]: '' } : s));
  };

  const handleDrop = useCallback((e: React.DragEvent, slideId: string, idx: number, field: 'image_url' | 'mobile_image_url' = 'image_url') => {
    e.preventDefault(); setDragOver(null);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(slideId, idx, file, field);
  }, [handleImageUpload]);

  const handleSave = async (slide: any) => {
    setSaving(slide.id);
    try {
      await updateHeroSlide(slide.id, {
        top_line: slide.top_line, headline: slide.headline,
        subheadline: slide.subheadline, cta_text: slide.cta_text,
        cta_href: slide.cta_href, image_url: slide.image_url,
        mobile_image_url: slide.mobile_image_url || '',
        is_active: slide.is_active, sort_order: slide.sort_order,
      });
    } catch (err: any) { alert(err.message); }
    finally { setSaving(null); }
  };

  const handleAdd = async () => {
    if (items.length >= 5) { alert('Max 5 slides allowed'); return; }
    try {
      await createHeroSlide({ top_line: 'New Slide', headline: 'New Headline', subheadline: '', cta_text: 'Shop Now', cta_href: '/products', sort_order: items.length + 1 });
      onRefresh();
    } catch (err: any) { alert(err.message); }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm('Delete this slide?')) return;
    try {
      if (imageUrl?.includes('hero-images')) await deleteHeroImage(imageUrl).catch(() => {});
      await deleteHeroSlide(id);
      onRefresh();
    } catch (err: any) { alert(err.message); }
  };

  const renderDropZone = (slideId: string, idx: number, field: 'image_url' | 'mobile_image_url', label: string, aspect: string, dims: string, refKey: string) => {
    const url = items[idx]?.[field];
    const uploadKey = `${slideId}-${field}`;
    const dragKey = field === 'mobile_image_url' ? `${slideId}-mobile` : slideId;

    if (url) {
      return (
        <div className={`relative group rounded-xl overflow-hidden border border-gray-200 ${field === 'mobile_image_url' ? 'max-w-[240px]' : ''}`}>
          <div className={`${aspect} bg-gray-100 relative`}>
            <img src={url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => fileRefs.current[refKey]?.click()} className="flex items-center gap-1 bg-white/90 backdrop-blur text-gray-700 text-[10px] font-medium px-2.5 py-1.5 rounded-lg shadow-sm hover:bg-white"><Upload size={10} /> Replace</button>
            <button onClick={() => handleRemoveImage(idx, field)} className="flex items-center gap-1 bg-red-500/90 backdrop-blur text-white text-[10px] font-medium px-2.5 py-1.5 rounded-lg shadow-sm hover:bg-red-600"><X size={10} /> Remove</button>
          </div>
          {uploading === uploadKey && <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-gray-600" /></div>}
        </div>
      );
    }

    return (
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(dragKey); }}
        onDragLeave={() => setDragOver(null)}
        onDrop={e => handleDrop(e, slideId, idx, field)}
        onClick={() => fileRefs.current[refKey]?.click()}
        className={`${field === 'mobile_image_url' ? 'w-[240px] aspect-[9/10]' : 'aspect-[16/5]'} border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
          dragOver === dragKey ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
        }`}
      >
        {uploading === uploadKey ? (
          <><Loader2 size={24} className="animate-spin text-gray-400 mb-2" /><span className="text-xs text-gray-500">Uploading...</span></>
        ) : (
          <><Upload size={24} className={`mb-2 ${dragOver === dragKey ? 'text-green-500' : 'text-gray-300'}`} />
            <span className="text-xs font-medium text-gray-500 text-center px-4">{dragOver === dragKey ? 'Drop image here' : label}</span>
            <span className="text-[10px] text-gray-400 mt-1">JPG, PNG, WebP · Max 5MB · {dims}</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Hero Banners ({items.length}/5)</h3>
          <p className="text-xs text-gray-400 mt-0.5">Upload banner images and edit overlay text for the homepage carousel. Maximum 5 banners.</p>
        </div>
        <button onClick={handleAdd} disabled={items.length >= 5} className={`admin-btn text-sm ${items.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <Plus size={14} /> Add Banner
        </button>
      </div>

      {items.length === 0 && (
        <div className="text-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
          <ImageIcon size={36} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No hero banners yet</p>
          <p className="text-xs mt-1">Click &quot;Add Banner&quot; to create your first slide</p>
        </div>
      )}

      <div className="space-y-5">
        {items.map((s: any, i: number) => (
          <div key={s.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <GripVertical size={14} className="text-gray-300" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Banner {i + 1}</span>
                {s.is_active === false && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-medium">Inactive</span>}
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-gray-500 mr-2 cursor-pointer">
                  <input type="checkbox" checked={s.is_active !== false} onChange={e => updateField(i, 'is_active', e.target.checked as any)} className="w-3.5 h-3.5 rounded border-gray-300" />
                  Active
                </label>
                <button onClick={() => handleSave(s)} disabled={saving === s.id} className="admin-btn text-xs py-1.5 px-3">
                  {saving === s.id ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
                </button>
                <button onClick={() => handleDelete(s.id, s.image_url)} className="flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>

            <div className="p-4">
              {/* Desktop Image */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-600 mb-2 block flex items-center gap-1">
                  <ImageIcon size={12} /> Desktop Banner Image
                  <span className="text-[10px] text-gray-400 font-normal ml-1">1440×600 recommended</span>
                </label>
                {renderDropZone(s.id, i, 'image_url', 'Click or drag & drop a desktop banner image', 'aspect-[16/6]', '1440×600', s.id)}
                <input ref={el => { fileRefs.current[s.id] = el; }} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(s.id, i, f, 'image_url'); e.target.value = ''; }} />
              </div>

              {/* Mobile Image */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-600 mb-2 block flex items-center gap-1">
                  <ImageIcon size={12} /> Mobile Banner Image
                  <span className="text-[10px] text-gray-400 font-normal ml-1">750×1200 recommended · Optional</span>
                </label>
                {renderDropZone(s.id, i, 'mobile_image_url', 'Click or drag & drop a mobile image', 'aspect-[9/16]', '750×1200', `${s.id}-mobile`)}
                <input ref={el => { fileRefs.current[`${s.id}-mobile`] = el; }} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(s.id, i, f, 'mobile_image_url'); e.target.value = ''; }} />
              </div>

              {/* Text fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Top Line</label>
                  <input placeholder="e.g. Upto 40% OFF" value={s.top_line || ''} onChange={e => updateField(i, 'top_line', e.target.value)} className="admin-input text-xs w-full" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">CTA Button Text</label>
                  <input placeholder="e.g. Shop Now" value={s.cta_text || ''} onChange={e => updateField(i, 'cta_text', e.target.value)} className="admin-input text-xs w-full" />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Headline</label>
                  <textarea placeholder="Main heading text" value={s.headline || ''} onChange={e => updateField(i, 'headline', e.target.value)} className="admin-input text-xs w-full" rows={2} />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Subheadline</label>
                  <textarea placeholder="Supporting text" value={s.subheadline || ''} onChange={e => updateField(i, 'subheadline', e.target.value)} className="admin-input text-xs w-full" rows={2} />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">CTA Link</label>
                  <input placeholder="e.g. /products" value={s.cta_href || ''} onChange={e => updateField(i, 'cta_href', e.target.value)} className="admin-input text-xs w-full" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Sort Order</label>
                  <input type="number" value={s.sort_order || i + 1} onChange={e => updateField(i, 'sort_order', e.target.value)} className="admin-input text-xs w-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

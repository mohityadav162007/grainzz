'use client';
import { useState, useRef, useEffect } from 'react';
import { Save, Loader2, Plus, Trash2, Upload, ImageIcon, X, ExternalLink, Film } from 'lucide-react';
import {
  upsertInstagramPost, deleteInstagramPost,
  uploadInstagramImage, deleteInstagramImage,
} from '@/lib/api';

export default function InstagramEditor({ posts, config, onSaveConfig, onRefresh, saving }: any) {
  const [items, setItems] = useState(posts);
  const [upserting, setUpserting] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => { setItems(posts); }, [posts]);

  const handleImageUpload = async (id: string, index: number, file: File) => {
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); return; }
    setUpserting(`${id}-uploading`);
    try {
      const oldUrl = items[index]?.image_url;
      if (oldUrl?.includes('product-images/instagram')) await deleteInstagramImage(oldUrl).catch(() => {});
      const publicUrl = await uploadInstagramImage(file);
      setItems((prev: any[]) => prev.map((x: any, idx: number) => idx === index ? { ...x, image_url: publicUrl } : x));
    } catch (err: any) { alert('Upload failed: ' + err.message); }
    finally { setUpserting(null); }
  };

  const handleDrop = (e: React.DragEvent, id: string, index: number) => {
    e.preventDefault(); setDragOver(null);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(id, index, file);
  };

  const handleAdd = () => {
    setItems([...items, { id: 'new-' + Date.now(), image_url: '', post_url: '', sort_order: items.length + 1, is_active: true }]);
  };

  const handleSave = async (post: any) => {
    setUpserting(post.id);
    try {
      const { id, ...data } = post;
      await upsertInstagramPost(id.toString().startsWith('new-') ? data : post);
      onRefresh();
    } catch (err: any) { alert(err.message); }
    finally { setUpserting(null); }
  };

  const handleDelete = async (id: string) => {
    if (id.toString().startsWith('new-')) {
      setItems(items.filter((x: any) => x.id !== id));
      return;
    }
    if (!confirm('Delete this reel?')) return;
    try { await deleteInstagramPost(id); onRefresh(); } catch (err: any) { alert(err.message); }
  };

  const handleRemoveImage = async (index: number) => {
    const url = items[index]?.image_url;
    if (url?.includes('product-images/instagram')) await deleteInstagramImage(url).catch(() => {});
    setItems((prev: any[]) => prev.map((x: any, idx: number) => idx === index ? { ...x, image_url: '' } : x));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Instagram Reels</h3>
          <p className="text-xs text-gray-400 mt-0.5">Add Instagram reels with cover images for the homepage section</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer border-r pr-4 mr-2">
            <input
              type="checkbox" checked={config.is_active !== false}
              onChange={e => onSaveConfig({ ...config, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="font-semibold text-gray-700 text-xs">Section Visible</span>
          </label>
          <button onClick={handleAdd} className="admin-btn text-sm"><Plus size={14} /> Add Reel</button>
        </div>
      </div>

      {items.length === 0 && (
        <div className="text-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
          <Film size={36} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No reels added yet</p>
          <p className="text-xs mt-1">Click &quot;Add Reel&quot; to add Instagram reels with cover images</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {items.map((post: any, i: number) => (
          <div key={post.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
            {/* Cover Image */}
            <div className="aspect-[9/16] bg-gray-100 relative group">
              {post.image_url ? (
                <>
                  <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <button onClick={() => fileRefs.current[post.id]?.click()} className="bg-white text-gray-800 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm hover:bg-gray-100 transition-colors">
                      <Upload size={10} /> Replace Cover
                    </button>
                    <button onClick={() => handleRemoveImage(i)} className="bg-red-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm hover:bg-red-600 transition-colors">
                      <X size={10} /> Remove
                    </button>
                  </div>
                </>
              ) : (
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(post.id); }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={e => handleDrop(e, post.id, i)}
                  onClick={() => fileRefs.current[post.id]?.click()}
                  className={`w-full h-full flex flex-col items-center justify-center cursor-pointer transition-all ${
                    dragOver === post.id ? 'bg-green-50' : 'hover:bg-gray-200'
                  }`}
                >
                  <Upload size={28} className={`mb-2 ${dragOver === post.id ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className="text-[10px] font-medium text-gray-500 text-center px-4">
                    {dragOver === post.id ? 'Drop cover image' : 'Click or drag cover image'}
                  </span>
                  <span className="text-[9px] text-gray-400 mt-1">JPG, PNG, WebP</span>
                </div>
              )}
              {upserting === `${post.id}-uploading` && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-gray-600" /></div>
              )}
              <input ref={el => { fileRefs.current[post.id] = el; }} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(post.id, i, f); e.target.value = ''; }} />
              {/* Film icon badge */}
              <div className="absolute top-2 left-2 w-7 h-7 bg-black/50 backdrop-blur rounded-full flex items-center justify-center">
                <Film size={14} className="text-white" />
              </div>
            </div>

            {/* Controls */}
            <div className="p-3 space-y-2.5">
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block flex items-center gap-1">
                  <ExternalLink size={9} /> Reel URL
                </label>
                <input
                  placeholder="https://www.instagram.com/reel/..."
                  value={post.post_url || ''}
                  onChange={e => setItems((p: any[]) => p.map((x: any, idx: number) => idx === i ? { ...x, post_url: e.target.value } : x))}
                  className="admin-input text-xs w-full"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button onClick={() => handleSave(post)} disabled={upserting === post.id} className="admin-btn text-[10px] py-1.5 flex-1 justify-center">
                  {upserting === post.id ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />} Save
                </button>
                <button onClick={() => handleDelete(post.id)} className="text-red-500 p-1.5 hover:bg-red-50 rounded-lg border border-red-200">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

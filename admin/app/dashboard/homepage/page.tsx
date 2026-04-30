'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Save, Loader2, Plus, Trash2, GripVertical,
  Type, Image, BarChart3, Star, MessageSquare, HelpCircle, Globe, ShoppingBag,
  Upload, ImageIcon, X, Eye
} from 'lucide-react';
import {
  getAllSiteContent, upsertSiteContent,
  getHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide,
  uploadHeroImage, deleteHeroImage,
  getTrustMetrics, updateTrustMetric,
  getBenefits, updateBenefit,
  getAvailabilityLogos, createAvailabilityLogo, updateAvailabilityLogo, deleteAvailabilityLogo,
  getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
  getFaqs, createFaq, updateFaq, deleteFaq,
  getHomepageSections, createHomepageSection, updateHomepageSection, getProducts,
  getPoweredByCards, createPoweredByCard, updatePoweredByCard, deletePoweredByCard,
  getInstagramPostsAdmin, upsertInstagramPost, deleteInstagramPost
} from '@/lib/api';

const tabs = [
  { id: 'announcement', label: 'Announcement', icon: Type },
  { id: 'hero', label: 'Hero Slides', icon: Image },
  { id: 'powered-by', label: 'Powered By', icon: Image },
  { id: 'metrics', label: 'Trust Metrics', icon: BarChart3 },
  { id: 'products', label: 'Product Tabs', icon: ShoppingBag },
  { id: 'benefits', label: 'Benefits', icon: Star },
  { id: 'logos', label: 'Availability', icon: Globe },
  { id: 'featured', label: 'Featured Product', icon: ShoppingBag },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
  { id: 'instagram', label: 'Instagram', icon: ImageIcon },
  { id: 'faqs', label: 'FAQs', icon: HelpCircle },
];

export default function HomepageEditorPage() {
  const [activeTab, setActiveTab] = useState('announcement');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Data states
  const [siteContent, setSiteContent] = useState<Record<string, any>>({});
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [benefits, setBenefits] = useState<any[]>([]);
  const [logos, setLogos] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [poweredByCards, setPoweredByCards] = useState<any[]>([]);
  const [instagramPosts, setInstagramPosts] = useState<any[]>([]);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [sc, hs, tm, bn, lg, ts, fq, sec, prods, pwrbd, ig] = await Promise.all([
        getAllSiteContent(),
        getHeroSlides(),
        getTrustMetrics(),
        getBenefits(),
        getAvailabilityLogos(),
        getTestimonials(),
        getFaqs(),
        getHomepageSections().then(r => r.data),
        getProducts().then(r => r.data),
        getPoweredByCards(),
        getInstagramPostsAdmin().then(r => r.data)
      ]);
      const contentMap: Record<string, any> = {};
      sc.forEach((item: any) => { contentMap[item.key] = item.value; });
      setSiteContent(contentMap);
      setHeroSlides(hs);
      setMetrics(tm);
      setBenefits(bn);
      setLogos(lg);
      setTestimonials(ts);
      setFaqs(fq);
      setSections(sec);
      setProducts(prods);
      setPoweredByCards(pwrbd);
      setInstagramPosts(ig);
    } catch (err: any) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const showSave = (msg = 'Saved!') => {
    setSaveMsg(msg);
    setTimeout(() => setSaveMsg(''), 2500);
  };

  const handleSaveSiteContent = async (key: string, value: any) => {
    setSaving(true);
    try {
      await upsertSiteContent(key, value);
      setSiteContent(prev => ({ ...prev, [key]: value }));
      showSave();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading homepage editor...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Homepage Editor</h1>
          <p className="text-gray-500 text-sm mt-1">Control all dynamic content on the homepage</p>
        </div>
        {saveMsg && <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">{saveMsg}</span>}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 bg-gray-50 p-1 rounded-xl">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={14} />{tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="admin-card p-6">
        {/* ─── Announcement Bar ─── */}
        {activeTab === 'announcement' && (
          <AnnouncementEditor
            value={siteContent.announcement_bar?.text || ''}
            onSave={(text: string) => handleSaveSiteContent('announcement_bar', { text })}
            saving={saving}
          />
        )}

        {/* ─── Hero Slides ─── */}
        {activeTab === 'hero' && (
          <HeroSlidesEditor
            slides={heroSlides}
            onRefresh={loadAll}
          />
        )}

        {/* ─── Powered By Cards ─── */}
        {activeTab === 'powered-by' && (
          <PoweredByEditor
            cards={poweredByCards}
            onRefresh={loadAll}
          />
        )}

        {/* ─── Trust Metrics ─── */}
        {activeTab === 'metrics' && (
          <MetricsEditor
            metrics={metrics}
            onRefresh={loadAll}
          />
        )}

        {/* ─── Product Tabs ─── */}
        {activeTab === 'products' && (
          <ProductSectionsEditor
            sections={sections}
            products={products}
            heading={siteContent.product_tabs_heading || {}}
            onSaveHeading={(h: any) => handleSaveSiteContent('product_tabs_heading', h)}
            onRefresh={loadAll}
            saving={saving}
          />
        )}

        {/* ─── Benefits ─── */}
        {activeTab === 'benefits' && (
          <BenefitsEditor
            benefits={benefits}
            heading={siteContent.benefits_heading || {}}
            onSaveHeading={(h: any) => handleSaveSiteContent('benefits_heading', h)}
            onRefresh={loadAll}
            saving={saving}
          />
        )}

        {/* ─── Availability Logos ─── */}
        {activeTab === 'logos' && (
          <LogosEditor logos={logos} onRefresh={loadAll} />
        )}

        {/* ─── Featured Product ─── */}
        {activeTab === 'featured' && (
          <FeaturedProductEditor
            config={siteContent.featured_product || {}}
            products={products}
            onSave={(c: any) => handleSaveSiteContent('featured_product', c)}
            saving={saving}
          />
        )}

        {/* ─── Testimonials ─── */}
        {activeTab === 'testimonials' && (
          <TestimonialsEditor testimonials={testimonials} products={products} onRefresh={loadAll} />
        )}

        {/* ─── Instagram ─── */}
        {activeTab === 'instagram' && (
          <InstagramEditor 
            posts={instagramPosts} 
            config={siteContent.instagram_config || { is_active: true }} 
            onSaveConfig={(c: any) => handleSaveSiteContent('instagram_config', c)}
            onRefresh={loadAll} 
            saving={saving}
          />
        )}

        {/* ─── FAQs ─── */}
        {activeTab === 'faqs' && (
          <FaqsEditor faqs={faqs} onRefresh={loadAll} />
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function AnnouncementEditor({ value, onSave, saving }: any) {
  const [text, setText] = useState(value);
  return (
    <div>
      <h3 className="font-bold text-gray-900 mb-4">Announcement Bar</h3>
      <input type="text" value={text} onChange={e => setText(e.target.value)} className="admin-input w-full mb-4" placeholder="Announcement text..." />
      <button onClick={() => onSave(text)} disabled={saving} className="admin-btn">
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
      </button>
    </div>
  );
}

function HeroSlidesEditor({ slides, onRefresh }: any) {
  const [items, setItems] = useState(slides);
  const [saving, setSaving] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const updateField = (i: number, field: string, val: string) => {
    setItems((prev: any[]) => prev.map((s: any, idx: number) => idx === i ? { ...s, [field]: val } : s));
  };

  const handleImageUpload = useCallback(async (slideId: string, slideIndex: number, file: File, field: 'image_url' | 'mobile_image_url' = 'image_url') => {
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); return; }
    setUploading(`${slideId}-${field}`);
    try {
      const oldUrl = items[slideIndex]?.[field];
      if (oldUrl && oldUrl.includes('hero-images')) {
        await deleteHeroImage(oldUrl).catch(() => {});
      }
      const publicUrl = await uploadHeroImage(file);
      setItems((prev: any[]) => prev.map((s: any, idx: number) => idx === slideIndex ? { ...s, [field]: publicUrl } : s));
    } catch (err: any) { alert('Upload failed: ' + err.message); }
    finally { setUploading(null); }
  }, [items]);

  const handleRemoveImage = async (slideIndex: number, field: 'image_url' | 'mobile_image_url' = 'image_url') => {
    const url = items[slideIndex]?.[field];
    if (url && url.includes('hero-images')) {
      await deleteHeroImage(url).catch(() => {});
    }
    setItems((prev: any[]) => prev.map((s: any, idx: number) => idx === slideIndex ? { ...s, [field]: '' } : s));
  };

  const handleDrop = useCallback((e: React.DragEvent, slideId: string, slideIndex: number, field: 'image_url' | 'mobile_image_url' = 'image_url') => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(slideId, slideIndex, file, field);
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
      if (imageUrl && imageUrl.includes('hero-images')) {
        await deleteHeroImage(imageUrl).catch(() => {});
      }
      await deleteHeroSlide(id);
      onRefresh();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-gray-900">Hero Slides ({items.length}/5)</h3>
          <p className="text-xs text-gray-400 mt-0.5">Upload images and edit text for the homepage carousel. Max 5 slides.</p>
        </div>
        <button
          onClick={handleAdd}
          disabled={items.length >= 5}
          className={`admin-btn text-sm ${items.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Plus size={14} /> Add Slide
        </button>
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
          <ImageIcon size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hero slides yet. Click "Add Slide" to get started.</p>
        </div>
      )}

      <div className="space-y-5">
        {items.map((s: any, i: number) => (
          <div key={s.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
            {/* Slide header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <GripVertical size={14} className="text-gray-300" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Slide {i + 1}</span>
                {s.is_active === false && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-medium">Inactive</span>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleSave(s)} disabled={saving === s.id} className="admin-btn text-xs py-1.5 px-3">
                  {saving === s.id ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
                </button>
                <button
                  onClick={() => handleDelete(s.id, s.image_url)}
                  className="flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>

            <div className="p-4">
              {/* Desktop Image upload section */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-600 mb-2 block flex items-center gap-1">
                  <ImageIcon size={12} /> Desktop Image
                  <span className="text-[10px] text-gray-400 font-normal ml-1">1440×600 recommended</span>
                </label>

                {s.image_url ? (
                  <div className="relative group rounded-xl overflow-hidden border border-gray-200" style={{ maxWidth: '100%' }}>
                    <div className="aspect-[16/6] bg-gray-100 relative">
                      <img src={s.image_url} alt={`Slide ${i + 1} desktop`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = ''; }} />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-end pr-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="text-white text-right">
                          <p className="text-[10px] font-bold uppercase tracking-wide opacity-80">{s.top_line}</p>
                          <p className="text-sm font-bold leading-tight mt-0.5">{(s.headline || '').split('\n')[0]}</p>
                          <p className="text-[10px] mt-1 opacity-70">{(s.subheadline || '').split('\n')[0]}</p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => fileInputRefs.current[s.id]?.click()} className="flex items-center gap-1 bg-white/90 backdrop-blur text-gray-700 text-[10px] font-medium px-2.5 py-1.5 rounded-lg shadow-sm hover:bg-white transition-colors">
                        <Upload size={10} /> Replace
                      </button>
                      <button onClick={() => handleRemoveImage(i, 'image_url')} className="flex items-center gap-1 bg-red-500/90 backdrop-blur text-white text-[10px] font-medium px-2.5 py-1.5 rounded-lg shadow-sm hover:bg-red-600 transition-colors">
                        <X size={10} /> Remove
                      </button>
                    </div>
                    {uploading === `${s.id}-image_url` && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-gray-600" /></div>
                    )}
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(s.id); }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={(e) => handleDrop(e, s.id, i, 'image_url')}
                    onClick={() => fileInputRefs.current[s.id]?.click()}
                    className={`aspect-[16/5] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                      dragOver === s.id ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {uploading === `${s.id}-image_url` ? (
                      <><Loader2 size={28} className="animate-spin text-gray-400 mb-2" /><span className="text-xs text-gray-500">Uploading...</span></>
                    ) : (
                      <><Upload size={28} className={`mb-2 ${dragOver === s.id ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className="text-xs font-medium text-gray-500">{dragOver === s.id ? 'Drop image here' : 'Click or drag & drop a desktop image'}</span>
                        <span className="text-[10px] text-gray-400 mt-1">JPG, PNG, WebP · Max 5MB · 1440×600</span>
                      </>
                    )}
                  </div>
                )}
                <input ref={(el) => { fileInputRefs.current[s.id] = el; }} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                  onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(s.id, i, file, 'image_url'); e.target.value = ''; }}
                />
              </div>

              {/* Mobile Image upload section */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-600 mb-2 block flex items-center gap-1">
                  <ImageIcon size={12} /> Mobile Image
                  <span className="text-[10px] text-gray-400 font-normal ml-1">750×1200 recommended · Optional</span>
                </label>

                {s.mobile_image_url ? (
                  <div className="relative group rounded-xl overflow-hidden border border-gray-200" style={{ maxWidth: '240px' }}>
                    <div className="aspect-[9/16] bg-gray-100 relative">
                      <img src={s.mobile_image_url} alt={`Slide ${i + 1} mobile`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = ''; }} />
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => fileInputRefs.current[`${s.id}-mobile`]?.click()} className="flex items-center gap-1 bg-white/90 backdrop-blur text-gray-700 text-[10px] font-medium px-2.5 py-1.5 rounded-lg shadow-sm hover:bg-white transition-colors">
                        <Upload size={10} /> Replace
                      </button>
                      <button onClick={() => handleRemoveImage(i, 'mobile_image_url')} className="flex items-center gap-1 bg-red-500/90 backdrop-blur text-white text-[10px] font-medium px-2.5 py-1.5 rounded-lg shadow-sm hover:bg-red-600 transition-colors">
                        <X size={10} /> Remove
                      </button>
                    </div>
                    {uploading === `${s.id}-mobile_image_url` && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-gray-600" /></div>
                    )}
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(`${s.id}-mobile`); }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={(e) => handleDrop(e, s.id, i, 'mobile_image_url')}
                    onClick={() => fileInputRefs.current[`${s.id}-mobile`]?.click()}
                    className={`w-[240px] aspect-[9/10] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                      dragOver === `${s.id}-mobile` ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {uploading === `${s.id}-mobile_image_url` ? (
                      <><Loader2 size={24} className="animate-spin text-gray-400 mb-2" /><span className="text-xs text-gray-500">Uploading...</span></>
                    ) : (
                      <><Upload size={24} className={`mb-2 ${dragOver === `${s.id}-mobile` ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className="text-xs font-medium text-gray-500 text-center px-4">{dragOver === `${s.id}-mobile` ? 'Drop image here' : 'Click or drag & drop a mobile image'}</span>
                        <span className="text-[10px] text-gray-400 mt-1">750×1200 · Optional</span>
                      </>
                    )}
                  </div>
                )}
                <input ref={(el) => { fileInputRefs.current[`${s.id}-mobile`] = el; }} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                  onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(s.id, i, file, 'mobile_image_url'); e.target.value = ''; }}
                />
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
                  <textarea placeholder="Main heading (use Enter for line breaks)" value={s.headline || ''} onChange={e => updateField(i, 'headline', e.target.value)} className="admin-input text-xs w-full" rows={2} />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Subheadline</label>
                  <textarea placeholder="Supporting text (use Enter for line breaks)" value={s.subheadline || ''} onChange={e => updateField(i, 'subheadline', e.target.value)} className="admin-input text-xs w-full" rows={2} />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">CTA Link</label>
                  <input placeholder="e.g. /products" value={s.cta_href || ''} onChange={e => updateField(i, 'cta_href', e.target.value)} className="admin-input text-xs w-full" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Desktop Image URL</label>
                  <input placeholder="Auto-filled on upload" value={s.image_url || ''} onChange={e => updateField(i, 'image_url', e.target.value)} className="admin-input text-xs w-full bg-gray-50" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Mobile Image URL</label>
                  <input placeholder="Auto-filled on upload" value={s.mobile_image_url || ''} onChange={e => updateField(i, 'mobile_image_url', e.target.value)} className="admin-input text-xs w-full bg-gray-50" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PoweredByEditor({ cards, onRefresh }: any) {
  const [items, setItems] = useState(cards);
  const [saving, setSaving] = useState<string | null>(null);

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
        is_active: card.is_active, sort_order: card.sort_order,
      });
    } catch (err: any) { alert(err.message); }
    finally { setSaving(null); }
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
    try {
      await deletePoweredByCard(id);
      onRefresh();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-gray-900">Powered By Cards ({items.length}/3)</h3>
          <p className="text-xs text-gray-400 mt-0.5">Edit cards for the Powered By Real Grains section. Max 3 cards.</p>
        </div>
        <button
          onClick={handleAdd}
          disabled={items.length >= 3}
          className={`admin-btn text-sm ${items.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Plus size={14} /> Add Card
        </button>
      </div>

      <div className="space-y-5">
        {items.map((c: any, i: number) => (
          <div key={c.id} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm space-y-3">
             <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Card {i + 1}</span>
                <div className="flex gap-2">
                  <button onClick={() => handleSave(c)} disabled={saving === c.id} className="admin-btn text-xs py-1.5 px-3">
                    {saving === c.id ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-500 text-xs px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Title</label>
                  <input placeholder="Title" value={c.title || ''} onChange={e => updateField(i, 'title', e.target.value)} className="admin-input text-xs w-full" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Subtitle</label>
                  <input placeholder="Subtitle" value={c.subtitle || ''} onChange={e => updateField(i, 'subtitle', e.target.value)} className="admin-input text-xs w-full" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Top BG Color (Tailwind)</label>
                  <input placeholder="e.g. bg-[#C68356]" value={c.top_bg_color || ''} onChange={e => updateField(i, 'top_bg_color', e.target.value)} className="admin-input text-xs w-full" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Bottom BG Color (Tailwind)</label>
                  <input placeholder="e.g. bg-[#FDECE7]" value={c.bottom_bg_color || ''} onChange={e => updateField(i, 'bottom_bg_color', e.target.value)} className="admin-input text-xs w-full" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Link</label>
                  <input placeholder="URL" value={c.link || ''} onChange={e => updateField(i, 'link', e.target.value)} className="admin-input text-xs w-full" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Image URL</label>
                  <input placeholder="Image URL" value={c.image_url || ''} onChange={e => updateField(i, 'image_url', e.target.value)} className="admin-input text-xs w-full" />
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricsEditor({ metrics, onRefresh }: any) {
  const [items, setItems] = useState(metrics);
  const [saving, setSaving] = useState<string | null>(null);

  const updateField = (i: number, field: string, val: string) => {
    setItems((prev: any[]) => prev.map((m: any, idx: number) => idx === i ? { ...m, [field]: val } : m));
  };

  const handleSave = async (metric: any) => {
    setSaving(metric.id);
    try { await updateTrustMetric(metric.id, { value: metric.value, label: metric.label, icon: metric.icon }); }
    catch (err: any) { alert(err.message); }
    finally { setSaving(null); }
  };

  return (
    <div>
      <h3 className="font-bold text-gray-900 mb-4">Trust Metrics</h3>
      <div className="grid grid-cols-2 gap-4">
        {items.map((m: any, i: number) => (
          <div key={m.id} className="border border-gray-200 rounded-xl p-4">
            <div className="space-y-2">
              <input placeholder="Value (e.g. 5000+)" value={m.value} onChange={e => updateField(i, 'value', e.target.value)} className="admin-input text-sm w-full" />
              <input placeholder="Label" value={m.label} onChange={e => updateField(i, 'label', e.target.value)} className="admin-input text-sm w-full" />
              <input placeholder="Icon name" value={m.icon} onChange={e => updateField(i, 'icon', e.target.value)} className="admin-input text-xs w-full" />
              <button onClick={() => handleSave(m)} disabled={saving === m.id} className="admin-btn text-xs py-1">
                {saving === m.id ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductSectionsEditor({ sections, products, heading, onSaveHeading, onRefresh, saving }: any) {
  const [h, setH] = useState(heading.heading || '');
  const [sub, setSub] = useState(heading.subheading || '');
  const [items, setItems] = useState(sections);
  const [sectionSaving, setSectionSaving] = useState<string | null>(null);

  const toggleProduct = (sectionId: string, productId: string) => {
    setItems((prev: any[]) => prev.map((s: any) => {
      if (s.id !== sectionId) return s;
      const ids = s.product_ids || [];
      return { ...s, product_ids: ids.includes(productId) ? ids.filter((id: string) => id !== productId) : [...ids, productId] };
    }));
  };

  const handleSaveSection = async (section: any) => {
    setSectionSaving(section.id);
    try { await updateHomepageSection(section.id, { title: section.title, product_ids: section.product_ids, is_active: section.is_active }); }
    catch (err: any) { alert(err.message); }
    finally { setSectionSaving(null); }
  };

  const handleAddSection = async () => {
    try {
      const data = await createHomepageSection({ title: 'New Section', section_type: 'custom', product_ids: [] });
      setItems((prev: any[]) => [...prev, data]);
      onRefresh();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div>
      <h3 className="font-bold text-gray-900 mb-4">Product Tabs Section</h3>
      <div className="space-y-3 mb-6">
        <input placeholder="Section heading" value={h} onChange={e => setH(e.target.value)} className="admin-input w-full" />
        <input placeholder="Section subheading" value={sub} onChange={e => setSub(e.target.value)} className="admin-input w-full" />
        <button onClick={() => onSaveHeading({ heading: h, subheading: sub })} disabled={saving} className="admin-btn text-sm">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Heading
        </button>
      </div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-700 text-sm">Product Sections</h4>
        <button onClick={handleAddSection} className="admin-btn text-xs py-1 px-2"><Plus size={12} className="mr-1" /> Add Section</button>
      </div>
      {items.map((section: any) => (
        <div key={section.id} className="border border-gray-200 rounded-xl p-4 mb-3">
          <div className="flex items-center justify-between mb-2">
            <input type="text" value={section.title} onChange={e => setItems((p: any[]) => p.map((s: any) => s.id === section.id ? { ...s, title: e.target.value } : s))} className="font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary focus:outline-none" />
            <button onClick={() => handleSaveSection(section)} disabled={sectionSaving === section.id} className="admin-btn text-xs py-1">
              {sectionSaving === section.id ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {products.map((p: any) => (
              <button key={p.id} onClick={() => toggleProduct(section.id, p.id)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${section.product_ids?.includes(p.id) ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {p.name}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function BenefitsEditor({ benefits, heading, onSaveHeading, onRefresh, saving }: any) {
  const [items, setItems] = useState(benefits);
  const [h, setH] = useState(heading.heading || '');
  const [intro, setIntro] = useState(heading.intro || '');
  const [itemSaving, setItemSaving] = useState<string | null>(null);

  const updateField = (i: number, field: string, val: string) => {
    setItems((prev: any[]) => prev.map((b: any, idx: number) => idx === i ? { ...b, [field]: val } : b));
  };

  const handleSave = async (item: any) => {
    setItemSaving(item.id);
    try { await updateBenefit(item.id, { title: item.title, description: item.description, icon: item.icon }); }
    catch (err: any) { alert(err.message); }
    finally { setItemSaving(null); }
  };

  return (
    <div>
      <h3 className="font-bold text-gray-900 mb-4">Benefits Section</h3>
      <div className="space-y-3 mb-6">
        <input placeholder="Section heading" value={h} onChange={e => setH(e.target.value)} className="admin-input w-full" />
        <textarea placeholder="Intro text" value={intro} onChange={e => setIntro(e.target.value)} className="admin-input w-full" rows={2} />
        <button onClick={() => onSaveHeading({ heading: h, intro })} disabled={saving} className="admin-btn text-sm">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Heading
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {items.map((b: any, i: number) => (
          <div key={b.id} className="border border-gray-200 rounded-xl p-4 space-y-2">
            <input placeholder="Icon name" value={b.icon} onChange={e => updateField(i, 'icon', e.target.value)} className="admin-input text-xs w-full" />
            <input placeholder="Title" value={b.title} onChange={e => updateField(i, 'title', e.target.value)} className="admin-input text-sm w-full" />
            <textarea placeholder="Description" value={b.description} onChange={e => updateField(i, 'description', e.target.value)} className="admin-input text-xs w-full" rows={2} />
            <button onClick={() => handleSave(b)} disabled={itemSaving === b.id} className="admin-btn text-xs py-1">
              {itemSaving === b.id ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function LogosEditor({ logos, onRefresh }: any) {
  const [items, setItems] = useState(logos);
  const [saving, setSaving] = useState<string | null>(null);

  const handleAdd = async () => {
    try { await createAvailabilityLogo({ name: 'New Logo', sort_order: items.length + 1 }); onRefresh(); }
    catch (err: any) { alert(err.message); }
  };

  const handleSave = async (logo: any) => {
    setSaving(logo.id);
    try { await updateAvailabilityLogo(logo.id, { name: logo.name, logo_url: logo.logo_url, href: logo.href }); }
    catch (err: any) { alert(err.message); }
    finally { setSaving(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    try { await deleteAvailabilityLogo(id); onRefresh(); } catch (err: any) { alert(err.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">Availability Logos</h3>
        <button onClick={handleAdd} className="admin-btn text-sm"><Plus size={14} /> Add Logo</button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {items.map((l: any, i: number) => (
          <div key={l.id} className="border border-gray-200 rounded-xl p-4 space-y-2">
            <input placeholder="Name" value={l.name} onChange={e => setItems((p: any[]) => p.map((x: any, idx: number) => idx === i ? { ...x, name: e.target.value } : x))} className="admin-input text-sm w-full" />
            <input placeholder="Logo URL" value={l.logo_url || ''} onChange={e => setItems((p: any[]) => p.map((x: any, idx: number) => idx === i ? { ...x, logo_url: e.target.value } : x))} className="admin-input text-xs w-full" />
            <input placeholder="Link" value={l.href || ''} onChange={e => setItems((p: any[]) => p.map((x: any, idx: number) => idx === i ? { ...x, href: e.target.value } : x))} className="admin-input text-xs w-full" />
            <div className="flex gap-2">
              <button onClick={() => handleSave(l)} disabled={saving === l.id} className="admin-btn text-xs py-1">
                {saving === l.id ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
              </button>
              <button onClick={() => handleDelete(l.id)} className="text-red-500 text-xs"><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeaturedProductEditor({ config, products, onSave, saving }: any) {
  const [c, setC] = useState(config);
  return (
    <div>
      <h3 className="font-bold text-gray-900 mb-4">Featured Product</h3>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Select Product</label>
          <select value={c.slug || ''} onChange={e => setC({ ...c, slug: e.target.value })} className="admin-input w-full">
            <option value="">Select a product...</option>
            {products.map((p: any) => <option key={p.id} value={p.slug}>{p.name} – ₹{p.price}</option>)}
          </select>
        </div>
        <input placeholder="Display heading" value={c.heading || ''} onChange={e => setC({ ...c, heading: e.target.value })} className="admin-input w-full" />
        <input placeholder="Supporting line (e.g. High Fibre | No Palm Oil)" value={c.supporting_line || ''} onChange={e => setC({ ...c, supporting_line: e.target.value })} className="admin-input w-full" />
        <textarea placeholder="Free gift message" value={c.free_gift_message || ''} onChange={e => setC({ ...c, free_gift_message: e.target.value })} className="admin-input w-full" rows={2} />
        <textarea placeholder="Description" value={c.description || ''} onChange={e => setC({ ...c, description: e.target.value })} className="admin-input w-full" rows={2} />
        <input placeholder="CTA text" value={c.cta_text || ''} onChange={e => setC({ ...c, cta_text: e.target.value })} className="admin-input w-full" />
        <button onClick={() => onSave(c)} disabled={saving} className="admin-btn">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Featured Product
        </button>
      </div>
    </div>
  );
}

function TestimonialsEditor({ testimonials, products, onRefresh }: any) {
  const [items, setItems] = useState(testimonials);
  const [saving, setSaving] = useState<string | null>(null);

  const handleAdd = async () => {
    try { await createTestimonial({ text: 'New testimonial', author: 'Name', role: 'Customer', rating: 5, sort_order: items.length + 1 }); onRefresh(); }
    catch (err: any) { alert(err.message); }
  };

  const handleSave = async (t: any) => {
    setSaving(t.id);
    try { await updateTestimonial(t.id, { text: t.text, author: t.author, role: t.role, rating: t.rating, product_id: t.product_id }); }
    catch (err: any) { alert(err.message); }
    finally { setSaving(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    try { await deleteTestimonial(id); onRefresh(); } catch (err: any) { alert(err.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">Testimonials</h3>
        <button onClick={handleAdd} className="admin-btn text-sm"><Plus size={14} /> Add</button>
      </div>
      <div className="space-y-4">
        {items.map((t: any, i: number) => (
          <div key={t.id} className="border border-gray-200 rounded-xl p-4 space-y-2">
            <textarea placeholder="Testimonial text" value={t.text} onChange={e => setItems((p: any[]) => p.map((x: any, idx: number) => idx === i ? { ...x, text: e.target.value } : x))} className="admin-input w-full text-sm" rows={3} />
            <div className="grid grid-cols-3 gap-2">
              <input placeholder="Author" value={t.author} onChange={e => setItems((p: any[]) => p.map((x: any, idx: number) => idx === i ? { ...x, author: e.target.value } : x))} className="admin-input text-xs" />
              <input placeholder="Role" value={t.role || ''} onChange={e => setItems((p: any[]) => p.map((x: any, idx: number) => idx === i ? { ...x, role: e.target.value } : x))} className="admin-input text-xs" />
              <select value={t.rating} onChange={e => setItems((p: any[]) => p.map((x: any, idx: number) => idx === i ? { ...x, rating: Number(e.target.value) } : x))} className="admin-input text-xs">
                {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Link Product (for interactive review section)</label>
              <select 
                value={t.product_id || ''} 
                onChange={e => setItems((p: any[]) => p.map((x: any, idx: number) => idx === i ? { ...x, product_id: e.target.value || null } : x))}
                className="admin-input text-xs w-full"
              >
                <option value="">No product linked</option>
                {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleSave(t)} disabled={saving === t.id} className="admin-btn text-xs py-1">
                {saving === t.id ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
              </button>
              <button onClick={() => handleDelete(t.id)} className="text-red-500 text-xs"><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InstagramEditor({ posts, config, onSaveConfig, onRefresh, saving }: any) {
  const [items, setItems] = useState(posts);
  const [upserting, setUpserting] = useState<string | null>(null);

  useEffect(() => {
    setItems(posts);
  }, [posts]);

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
    if (!confirm('Delete this post?')) return;
    try { await deleteInstagramPost(id); onRefresh(); } catch (err: any) { alert(err.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-gray-900">Instagram Posts</h3>
          <p className="text-xs text-gray-500">Manage the shots on homepage</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-4 border-r pr-4">
            <input 
              type="checkbox" 
              checked={config.is_active !== false} 
              onChange={e => onSaveConfig({ ...config, is_active: e.target.checked })} 
              className="w-4 h-4 rounded border-gray-300"
            />
            <label className="text-sm font-semibold text-gray-700">Section Visible</label>
          </div>
          <button onClick={handleAdd} className="admin-btn text-sm"><Plus size={14} /> Add Post</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((post: any, i: number) => (
          <div key={post.id} className="border border-gray-200 rounded-xl p-3 space-y-2 bg-gray-50/30">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
              {post.image_url ? (
                <img src={post.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={32} /></div>
              )}
            </div>
            <input 
              placeholder="Image URL" 
              value={post.image_url} 
              onChange={e => setItems((p: any[]) => p.map((x: any, idx: number) => idx === i ? { ...x, image_url: e.target.value } : x))} 
              className="admin-input text-[10px] w-full" 
            />
            <input 
              placeholder="Post URL (Link)" 
              value={post.post_url} 
              onChange={e => setItems((p: any[]) => p.map((x: any, idx: number) => idx === i ? { ...x, post_url: e.target.value } : x))} 
              className="admin-input text-[10px] w-full" 
            />
            <div className="flex items-center justify-between gap-2 pt-1">
               <button 
                onClick={() => handleSave(post)} 
                disabled={upserting === post.id} 
                className="admin-btn text-[10px] py-1 flex-1"
               >
                 {upserting === post.id ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />} Save
               </button>
               <button onClick={() => handleDelete(post.id)} className="text-red-500 p-1.5 hover:bg-red-50 rounded-lg">
                 <Trash2 size={12} />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqsEditor({ faqs, onRefresh }: any) {
  const [items, setItems] = useState(faqs);
  const [saving, setSaving] = useState<string | null>(null);

  const handleAdd = async () => {
    try { await createFaq({ question: 'New question?', answer: 'Answer here...', sort_order: items.length + 1 }); onRefresh(); }
    catch (err: any) { alert(err.message); }
  };

  const handleSave = async (f: any) => {
    setSaving(f.id);
    try { await updateFaq(f.id, { question: f.question, answer: f.answer }); }
    catch (err: any) { alert(err.message); }
    finally { setSaving(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    try { await deleteFaq(id); onRefresh(); } catch (err: any) { alert(err.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">FAQs</h3>
        <button onClick={handleAdd} className="admin-btn text-sm"><Plus size={14} /> Add FAQ</button>
      </div>
      <div className="space-y-4">
        {items.map((f: any, i: number) => (
          <div key={f.id} className="border border-gray-200 rounded-xl p-4 space-y-2">
            <input placeholder="Question" value={f.question} onChange={e => setItems((p: any[]) => p.map((x: any, idx: number) => idx === i ? { ...x, question: e.target.value } : x))} className="admin-input w-full text-sm" />
            <textarea placeholder="Answer" value={f.answer} onChange={e => setItems((p: any[]) => p.map((x: any, idx: number) => idx === i ? { ...x, answer: e.target.value } : x))} className="admin-input w-full text-xs" rows={3} />
            <div className="flex gap-2">
              <button onClick={() => handleSave(f)} disabled={saving === f.id} className="admin-btn text-xs py-1">
                {saving === f.id ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
              </button>
              <button onClick={() => handleDelete(f.id)} className="text-red-500 text-xs"><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import {
  Save, Loader2, Plus, Trash2, GripVertical,
  Type, Image, BarChart3, Star, MessageSquare, HelpCircle, Globe, ShoppingBag
} from 'lucide-react';
import {
  getAllSiteContent, upsertSiteContent,
  getHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide,
  getTrustMetrics, updateTrustMetric,
  getBenefits, updateBenefit,
  getAvailabilityLogos, createAvailabilityLogo, updateAvailabilityLogo, deleteAvailabilityLogo,
  getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
  getFaqs, createFaq, updateFaq, deleteFaq,
  getHomepageSections, updateHomepageSection, getProducts,
} from '@/lib/api';

const tabs = [
  { id: 'announcement', label: 'Announcement', icon: Type },
  { id: 'hero', label: 'Hero Slides', icon: Image },
  { id: 'metrics', label: 'Trust Metrics', icon: BarChart3 },
  { id: 'products', label: 'Product Tabs', icon: ShoppingBag },
  { id: 'benefits', label: 'Benefits', icon: Star },
  { id: 'logos', label: 'Availability', icon: Globe },
  { id: 'featured', label: 'Featured Product', icon: ShoppingBag },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
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

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [sc, hs, tm, bn, lg, ts, fq, sec, prods] = await Promise.all([
        getAllSiteContent(),
        getHeroSlides(),
        getTrustMetrics(),
        getBenefits(),
        getAvailabilityLogos(),
        getTestimonials(),
        getFaqs(),
        getHomepageSections().then(r => r.data),
        getProducts().then(r => r.data),
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
          <TestimonialsEditor testimonials={testimonials} onRefresh={loadAll} />
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

  const updateField = (i: number, field: string, val: string) => {
    setItems((prev: any[]) => prev.map((s: any, idx: number) => idx === i ? { ...s, [field]: val } : s));
  };

  const handleSave = async (slide: any) => {
    setSaving(slide.id);
    try {
      await updateHeroSlide(slide.id, {
        top_line: slide.top_line, headline: slide.headline,
        subheadline: slide.subheadline, cta_text: slide.cta_text,
        cta_href: slide.cta_href, image_url: slide.image_url,
        is_active: slide.is_active, sort_order: slide.sort_order,
      });
    } catch (err: any) { alert(err.message); }
    finally { setSaving(null); }
  };

  const handleAdd = async () => {
    if (items.length >= 5) { alert('Max 5 slides'); return; }
    try {
      await createHeroSlide({ top_line: 'New Slide', headline: 'New Headline', sort_order: items.length + 1 });
      onRefresh();
    } catch (err: any) { alert(err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this slide?')) return;
    try { await deleteHeroSlide(id); onRefresh(); } catch (err: any) { alert(err.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">Hero Slides ({items.length}/5)</h3>
        <button onClick={handleAdd} className="admin-btn text-sm"><Plus size={14} /> Add Slide</button>
      </div>
      <div className="space-y-4">
        {items.map((s: any, i: number) => (
          <div key={s.id} className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-400">Slide {i + 1}</span>
              <div className="flex gap-2">
                <button onClick={() => handleSave(s)} disabled={saving === s.id} className="admin-btn text-xs py-1">
                  {saving === s.id ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
                </button>
                <button onClick={() => handleDelete(s.id)} className="text-red-500 text-xs hover:underline"><Trash2 size={12} /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Top line" value={s.top_line || ''} onChange={e => updateField(i, 'top_line', e.target.value)} className="admin-input text-xs" />
              <input placeholder="CTA text" value={s.cta_text || ''} onChange={e => updateField(i, 'cta_text', e.target.value)} className="admin-input text-xs" />
              <input placeholder="Headline" value={s.headline || ''} onChange={e => updateField(i, 'headline', e.target.value)} className="admin-input text-xs col-span-2" />
              <input placeholder="Subheadline" value={s.subheadline || ''} onChange={e => updateField(i, 'subheadline', e.target.value)} className="admin-input text-xs col-span-2" />
              <input placeholder="CTA link" value={s.cta_href || ''} onChange={e => updateField(i, 'cta_href', e.target.value)} className="admin-input text-xs" />
              <input placeholder="Image URL" value={s.image_url || ''} onChange={e => updateField(i, 'image_url', e.target.value)} className="admin-input text-xs" />
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
      <h4 className="font-semibold text-gray-700 text-sm mb-3">Product Sections</h4>
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

function TestimonialsEditor({ testimonials, onRefresh }: any) {
  const [items, setItems] = useState(testimonials);
  const [saving, setSaving] = useState<string | null>(null);

  const handleAdd = async () => {
    try { await createTestimonial({ text: 'New testimonial', author: 'Name', role: 'Customer', rating: 5, sort_order: items.length + 1 }); onRefresh(); }
    catch (err: any) { alert(err.message); }
  };

  const handleSave = async (t: any) => {
    setSaving(t.id);
    try { await updateTestimonial(t.id, { text: t.text, author: t.author, role: t.role, rating: t.rating }); }
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

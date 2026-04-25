'use client';
import { useState, useEffect } from 'react';
import { getHomepageSections, updateHomepageSection, getProducts } from '@/lib/api';
import { Save, Loader2, GripVertical } from 'lucide-react';

export default function HomepageEditorPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getHomepageSections().then((res) => setSections(res.data)),
      getProducts().then((res) => setProducts(res.data)),
    ])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleProductInSection = (sectionId: string, productId: string) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        const ids = s.product_ids || [];
        return {
          ...s,
          product_ids: ids.includes(productId)
            ? ids.filter((id: string) => id !== productId)
            : [...ids, productId],
        };
      })
    );
  };

  const handleSave = async (section: any) => {
    setSaving(section.id);
    try {
      await updateHomepageSection(section.id, {
        title: section.title,
        product_ids: section.product_ids,
        is_active: section.is_active,
      });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(null);
    }
  };

  const toggleActive = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, is_active: !s.is_active } : s))
    );
  };

  const updateTitle = (sectionId: string, title: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, title } : s))
    );
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading homepage sections...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Homepage Editor</h1>
        <p className="text-gray-500 text-sm mt-1">Control which products appear in each homepage section</p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="admin-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <GripVertical size={16} className="text-gray-400" />
                <div>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateTitle(section.id, e.target.value)}
                    className="font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary focus:outline-none"
                  />
                  <p className="text-xs text-gray-400 capitalize">{section.section_type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => toggleActive(section.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${section.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {section.is_active ? 'Active' : 'Inactive'}
                </button>
                <button onClick={() => handleSave(section)} disabled={saving === section.id} className="admin-btn text-sm py-1.5">
                  {saving === section.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-3">
                Select products for this section ({section.product_ids?.length || 0} selected)
              </p>
              <div className="flex flex-wrap gap-2">
                {products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => toggleProductInSection(section.id, p.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
                      section.product_ids?.includes(p.id)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {p.images?.[0] && <img src={p.images[0]} alt="" className="w-6 h-6 rounded object-cover" />}
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}

        {sections.length === 0 && (
          <div className="admin-card p-12 text-center text-gray-500">
            No homepage sections configured. Run the seed SQL to create default sections.
          </div>
        )}
      </div>
    </div>
  );
}

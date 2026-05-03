'use client';
import { useState, useEffect } from 'react';
import { Image, ShoppingBag, Heart, ImageIcon, Film } from 'lucide-react';
import {
  getAllSiteContent, upsertSiteContent,
  getHeroSlides, getHomepageSections, getProducts,
  getPoweredByCards, getInstagramPostsAdmin,
} from '@/lib/api';

import HeroSlidesEditor from '@/components/homepage/HeroSlidesEditor';
import ProductSectionsEditor from '@/components/homepage/ProductSectionsEditor';
import PoweredByEditor from '@/components/homepage/PoweredByEditor';
import InstagramEditor from '@/components/homepage/InstagramEditor';
import TeamFavouritesEditor from '@/components/homepage/TeamFavouritesEditor';

const tabs = [
  { id: 'hero', label: 'Hero Section', icon: Image, desc: 'Manage homepage banners' },
  { id: 'products', label: 'Our Products', icon: ShoppingBag, desc: 'Product tabs & selection' },
  { id: 'powered-by', label: 'Powered By', icon: ImageIcon, desc: 'Featured product cards' },
  { id: 'instagram', label: 'Instagram', icon: Film, desc: 'Reels & cover images' },
  { id: 'team-favs', label: 'Team Favourites', icon: Heart, desc: 'About Us page products' },
];

export default function HomepageEditorPage() {
  const [activeTab, setActiveTab] = useState('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Data states
  const [siteContent, setSiteContent] = useState<Record<string, any>>({});
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [poweredByCards, setPoweredByCards] = useState<any[]>([]);
  const [instagramPosts, setInstagramPosts] = useState<any[]>([]);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [sc, hs, sec, prods, pwrbd, ig] = await Promise.all([
        getAllSiteContent(),
        getHeroSlides(),
        getHomepageSections().then(r => r.data),
        getProducts().then(r => r.data),
        getPoweredByCards(),
        getInstagramPostsAdmin().then(r => r.data),
      ]);
      const contentMap: Record<string, any> = {};
      sc.forEach((item: any) => { contentMap[item.key] = item.value; });
      setSiteContent(contentMap);
      setHeroSlides(hs);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading homepage editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Homepage Editor</h1>
          <p className="text-gray-500 text-sm mt-1">Manage homepage content and About Us team favourites</p>
        </div>
        {saveMsg && <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full animate-pulse">{saveMsg}</span>}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-gray-50 p-1.5 rounded-xl">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
                isActive
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
            >
              <Icon size={16} />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="admin-card p-6">
        {activeTab === 'hero' && (
          <HeroSlidesEditor slides={heroSlides} onRefresh={loadAll} />
        )}

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

        {activeTab === 'powered-by' && (
          <PoweredByEditor
            cards={poweredByCards}
            products={products}
            onRefresh={loadAll}
          />
        )}

        {activeTab === 'instagram' && (
          <InstagramEditor
            posts={instagramPosts}
            config={siteContent.instagram_config || { is_active: true }}
            onSaveConfig={(c: any) => handleSaveSiteContent('instagram_config', c)}
            onRefresh={loadAll}
            saving={saving}
          />
        )}

        {activeTab === 'team-favs' && (
          <TeamFavouritesEditor
            config={siteContent.team_favourites || { product_ids: [] }}
            products={products}
            onSave={(c: any) => handleSaveSiteContent('team_favourites', c)}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
}

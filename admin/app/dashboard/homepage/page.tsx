'use client';
import { useState, useEffect } from 'react';
import { Image, ShoppingBag, Heart, ImageIcon, Film, Package, RefreshCw } from 'lucide-react';
import {
  getAllSiteContent, upsertSiteContent,
  getHeroSlides, getHomepageSections, getProducts,
  getPoweredByCards, getInstagramPostsAdmin, getSnackBoxItems,
  validateProductReferences,
} from '@/lib/api';

import HeroSlidesEditor from '@/components/homepage/HeroSlidesEditor';
import ProductSectionsEditor from '@/components/homepage/ProductSectionsEditor';
import PoweredByEditor from '@/components/homepage/PoweredByEditor';
import SnackBoxEditor from '@/components/homepage/SnackBoxEditor';
import InstagramEditor from '@/components/homepage/InstagramEditor';
import TeamFavouritesEditor from '@/components/homepage/TeamFavouritesEditor';

const tabs = [
  { id: 'hero', label: 'Hero Section', icon: Image, desc: 'Manage homepage banners' },
  { id: 'products', label: 'Our Products', icon: ShoppingBag, desc: 'Product tabs & selection' },
  { id: 'powered-by', label: 'Powered By', icon: ImageIcon, desc: 'Featured product cards' },
  { id: 'snack-box', label: 'Snack Box', icon: Package, desc: 'Essential snack box section' },
  { id: 'instagram', label: 'Instagram', icon: Film, desc: 'Reels & cover images' },
  { id: 'team-favs', label: 'Team Favourites', icon: Heart, desc: 'About Us page products' },
];

export default function HomepageEditorPage() {
  const [activeTab, setActiveTab] = useState('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // ── Data-version counter: forces child re-mount on each DB refresh ──
  const [dataVersion, setDataVersion] = useState(0);

  // Data states — single source of truth from DB
  const [siteContent, setSiteContent] = useState<Record<string, any>>({});
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [poweredByCards, setPoweredByCards] = useState<any[]>([]);
  const [snackBoxItems, setSnackBoxItems] = useState<any[]>([]);
  const [instagramPosts, setInstagramPosts] = useState<any[]>([]);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      // Auto-clean orphan product references before loading
      validateProductReferences().then(r => {
        if (r.total > 0) console.log('[Cleanup] Orphan references removed:', r.cleaned);
      }).catch(() => {});

      const [sc, hs, sec, prods, pwrbd, sb, ig] = await Promise.all([
        getAllSiteContent().catch(e => { console.error('[DB LOAD] SC err:', e); return []; }),
        getHeroSlides().catch(e => { console.error('[DB LOAD] HS err:', e); return []; }),
        getHomepageSections().then(r => r.data).catch(e => { console.error('[DB LOAD] Sec err:', e); return []; }),
        getProducts().then(r => r.data).catch(e => { console.error('[DB LOAD] Prod err:', e); return []; }),
        getPoweredByCards().catch(e => { console.error('[DB LOAD] PBC err:', e); return []; }),
        getSnackBoxItems().catch(e => { console.error('[DB LOAD] SB err:', e); return []; }),
        getInstagramPostsAdmin().then(r => r.data).catch(e => { console.error('[DB LOAD] IG err:', e); return []; }),
      ]);

      // Parse site_content values — always return parsed JSON or raw string
      const contentMap: Record<string, any> = {};
      sc.forEach((item: any) => {
        try {
          contentMap[item.key] = JSON.parse(item.value);
        } catch {
          contentMap[item.key] = item.value;
        }
      });

      console.log('[DB LOAD] Site content keys:', Object.keys(contentMap));
      console.log('[DB LOAD] Hero slides:', hs.length);
      console.log('[DB LOAD] Powered By cards:', pwrbd.length);
      console.log('[DB LOAD] Snack Box items:', sb.length);
      console.log('[DB LOAD] Instagram posts:', ig.length);
      console.log('[DB LOAD] Team favourites:', contentMap.team_favourites);

      setSiteContent(contentMap);
      setHeroSlides(hs);
      setSections(sec);
      setProducts(prods);
      setPoweredByCards(pwrbd);
      setSnackBoxItems(sb);
      setInstagramPosts(ig);

      // Bump version to force child re-mount with fresh DB data
      setDataVersion(v => v + 1);
    } catch (err: any) {
      console.error('[DB LOAD] Fatal error:', err);
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
      console.log('[DB SAVE] Saved site content key:', key, value);
      // Re-fetch ALL data from DB to ensure UI = DB
      await loadAll();
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
        <div className="flex items-center gap-3">
          {saveMsg && <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full animate-pulse">{saveMsg}</span>}
          <button onClick={loadAll} className="admin-btn-outline text-sm py-2 px-3" title="Reload from database">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-gray-50 p-1.5 rounded-xl overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center whitespace-nowrap ${
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

      {/* Tab Content — key={dataVersion} forces re-mount on DB refresh */}
      <div className="admin-card p-6">
        {activeTab === 'hero' && (
          <HeroSlidesEditor key={`hero-${dataVersion}`} slides={heroSlides} products={products} onRefresh={loadAll} />
        )}

        {activeTab === 'products' && (
          <ProductSectionsEditor
            key={`products-${dataVersion}`}
            sections={sections}
            products={products}
            onRefresh={loadAll}
          />
        )}

        {activeTab === 'powered-by' && (
          <PoweredByEditor
            key={`powered-${dataVersion}`}
            cards={poweredByCards}
            products={products}
            onRefresh={loadAll}
          />
        )}

        {activeTab === 'snack-box' && (
          <SnackBoxEditor
            key={`snack-${dataVersion}`}
            items={snackBoxItems}
            onRefresh={loadAll}
          />
        )}

        {activeTab === 'instagram' && (
          <InstagramEditor
            key={`ig-${dataVersion}`}
            posts={instagramPosts}
            config={siteContent.instagram_config || { is_active: true }}
            onSaveConfig={(c: any) => handleSaveSiteContent('instagram_config', c)}
            onRefresh={loadAll}
            saving={saving}
          />
        )}

        {activeTab === 'team-favs' && (
          <TeamFavouritesEditor
            key={`team-${dataVersion}`}
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

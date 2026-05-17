'use client';

import { useState, useEffect } from 'react';
import { getStoreSettings, updateStoreSetting } from '@/lib/api';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Loader2, Save, Upload, Image as ImageIcon, Sparkles, Building2, CheckCircle2 } from 'lucide-react';

const DEFAULT_SETTINGS = {
  hero_title: 'Better snacks for better workplaces.',
  hero_desc: 'Office pantry, client hampers, event supply, and exclusive corporate gifting — all powered by real supergrains and roasted clean ingredients.',
  hero_card_title: 'Six jars. One snack standard for modern offices.',
  hero_card_text: 'No Palm Oil • Zero Refined Flour (Maida) • 100% Roasted',
  hero_image_url: '',
  gifting_title: 'A festive hamper your team will still be opening in November.',
  gifting_desc: 'Premium Grainzz hampers in 2, 4 and 6 jar formats. Custom branding, custom delivery, and custom selection of clean-label roasted millet snacks.',
  gifting_card_title: 'Move beyond sweets. Gift better snacking.',
  gifting_card_price: 'From ₹450 Onwards',
  gifting_card_badge: 'Grainzz Shell Hampers',
  gifting_image_url: '',
};

export default function B2BConfigPage() {
  const [config, setConfig] = useState<any>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingGifting, setUploadingGifting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await getStoreSettings();
      const dbRow = res.data?.find((s: any) => s.key === 'b2b_settings');
      if (dbRow?.value) {
        try {
          const parsed = JSON.parse(dbRow.value);
          setConfig({ ...DEFAULT_SETTINGS, ...parsed });
        } catch {
          setConfig(DEFAULT_SETTINGS);
        }
      } else {
        setConfig(DEFAULT_SETTINGS);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleTextChange = (key: string, value: string) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'hero' | 'gifting') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'hero') setUploadingHero(true);
    else setUploadingGifting(true);

    try {
      const url = await uploadToCloudinary(file, 'grainzz/b2b');
      setConfig((prev: any) => ({
        ...prev,
        [type === 'hero' ? 'hero_image_url' : 'gifting_image_url']: url,
      }));
    } catch (err: any) {
      alert(`Image upload failed: ${err.message}`);
    } finally {
      if (type === 'hero') setUploadingHero(false);
      else setUploadingGifting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg('');
    try {
      await updateStoreSetting('b2b_settings', JSON.stringify(config));
      setSuccessMsg('B2B Settings updated successfully! All changes are live.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(`Failed to save settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Building2 size={26} className="text-[#1D5E20]" /> B2B Page Customizer
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Customize the header copy, promotional highlights, corporate gifting blocks, and upload featured images for the B2B Wholesale page.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#1D5E20] hover:bg-[#144216] disabled:bg-gray-400 text-white font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all self-start md:self-center shadow-sm"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Saving...' : 'Save Live Changes'}
        </button>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={40} className="animate-spin text-[#1D5E20]" />
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* SECTION 1: HERO CONFIG */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-50 pb-3">
              <Sparkles size={20} className="text-yellow-500" /> 1. B2B Hero Section Settings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Hero Headline Title</label>
                  <input
                    type="text"
                    value={config.hero_title}
                    onChange={(e) => handleTextChange('hero_title', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Hero Supporting Description</label>
                  <textarea
                    rows={3}
                    value={config.hero_desc}
                    onChange={(e) => handleTextChange('hero_desc', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Hero Side Card Header</label>
                  <input
                    type="text"
                    value={config.hero_card_title}
                    onChange={(e) => handleTextChange('hero_card_title', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Hero Side Card Details</label>
                  <input
                    type="text"
                    value={config.hero_card_text}
                    onChange={(e) => handleTextChange('hero_card_text', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                  />
                </div>
              </div>

              {/* IMAGE UPLOADER */}
              <div className="space-y-4 flex flex-col justify-between">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Featured Hero Card Image</label>
                  <p className="text-xs text-gray-400 mb-3">Upload a clean product/office jar setup image to display in place of the default fallback green gradient card.</p>
                  
                  <div className="flex items-center gap-4">
                    <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:bg-gray-50 transition-colors relative group min-h-[140px]">
                      {uploadingHero ? (
                        <div className="flex flex-col items-center gap-2 text-[#1D5E20]">
                          <Loader2 size={24} className="animate-spin" />
                          <span className="text-xs font-semibold">Uploading to Cloudinary...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-500">
                          <Upload size={24} />
                          <span className="text-xs font-bold uppercase tracking-wide">Upload Custom Image</span>
                          <span className="text-[10px] text-gray-400">JPG, PNG up to 5MB</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'hero')}
                        className="hidden"
                        disabled={uploadingHero}
                      />
                    </label>
                    
                    {config.hero_image_url && (
                      <div className="w-[120px] h-[120px] border border-gray-200 rounded-xl overflow-hidden relative shrink-0 group">
                        <img src={config.hero_image_url} alt="Hero Custom Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleTextChange('hero_image_url', '')}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity rounded-xl"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[#EEFBDC] p-4 rounded-xl border border-[#D1EAB0] text-[12px] font-semibold text-[#1D5E20]">
                  💡 Leaving the image input blank will automatically render a stunning, stylized full-width solid brand card instead.
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: CORPORATE GIFTING CONFIG */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-50 pb-3">
              <ImageIcon size={20} className="text-blue-500" /> 2. Featured Corporate Gifting Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Gifting Main Headline</label>
                  <input
                    type="text"
                    value={config.gifting_title}
                    onChange={(e) => handleTextChange('gifting_title', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Gifting Description Copy</label>
                  <textarea
                    rows={3}
                    value={config.gifting_desc}
                    onChange={(e) => handleTextChange('gifting_desc', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Spotlight Card Header</label>
                    <input
                      type="text"
                      value={config.gifting_card_title}
                      onChange={(e) => handleTextChange('gifting_card_title', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Spotlight Card Badge</label>
                    <input
                      type="text"
                      value={config.gifting_card_badge}
                      onChange={(e) => handleTextChange('gifting_card_badge', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Spotlight Card Starting Price</label>
                  <input
                    type="text"
                    value={config.gifting_card_price}
                    onChange={(e) => handleTextChange('gifting_card_price', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                  />
                </div>
              </div>

              {/* IMAGE UPLOADER */}
              <div className="space-y-4 flex flex-col justify-between">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Featured Gifting Card Image</label>
                  <p className="text-xs text-gray-400 mb-3">Upload a custom promotional photography image for the holiday hampers/gift boxes spotlight card.</p>
                  
                  <div className="flex items-center gap-4">
                    <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:bg-gray-50 transition-colors relative group min-h-[140px]">
                      {uploadingGifting ? (
                        <div className="flex flex-col items-center gap-2 text-[#1D5E20]">
                          <Loader2 size={24} className="animate-spin" />
                          <span className="text-xs font-semibold">Uploading to Cloudinary...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-500">
                          <Upload size={24} />
                          <span className="text-xs font-bold uppercase tracking-wide">Upload Custom Image</span>
                          <span className="text-[10px] text-gray-400">JPG, PNG up to 5MB</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'gifting')}
                        className="hidden"
                        disabled={uploadingGifting}
                      />
                    </label>
                    
                    {config.gifting_image_url && (
                      <div className="w-[120px] h-[120px] border border-gray-200 rounded-xl overflow-hidden relative shrink-0 group">
                        <img src={config.gifting_image_url} alt="Gifting Custom Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleTextChange('gifting_image_url', '')}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity rounded-xl"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[#FFF8E7] p-4 rounded-xl border border-[#FEF3D0] text-[12px] font-semibold text-[#5A3825]">
                  💡 Leaving this gifting image blank will render a gorgeous premium chocolate-themed fallback gift card instead.
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

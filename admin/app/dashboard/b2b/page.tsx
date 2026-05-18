'use client';

import { useState, useEffect } from 'react';
import { getStoreSettings, updateStoreSetting } from '@/lib/api';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { 
  Loader2, 
  Save, 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  Building2, 
  CheckCircle2, 
  Coffee, 
  Gift, 
  Layers, 
  Leaf, 
  Bookmark, 
  Truck, 
  Phone, 
  Mail, 
  HelpCircle 
} from 'lucide-react';

const DEFAULT_SETTINGS = {
  // --- SECTION 1: HERO ---
  hero_title: 'Better snacks for better workplaces.',
  hero_desc: 'Office pantry, client hampers, event supply, and exclusive corporate gifting — all powered by real supergrains and roasted clean ingredients.',
  hero_card_title: 'Six jars. One snack standard for modern offices.',
  hero_card_text: 'No Palm Oil • Zero Refined Flour (Maida) • 100% Roasted',
  hero_image_url: '',

  // --- SECTION 2: OFFERINGS ---
  offerings_title: 'What we offer.',
  offerings_desc: 'Premium, single-serving snacks custom-built for workplaces, luxury corporate gifting, VIP events, and café networks.',
  
  offering_1_title: 'Office Pantry Programme',
  offering_1_desc: 'Monthly recurring supplies of pre-portioned, high-fiber roasted millet and grain snacks direct to your pantry shelves.',
  offering_1_moq: 'MOQ: 50 Jars / Month',
  offering_1_lead: 'Lead Time: 5-7 Days',

  offering_2_title: 'Corporate Gifting & Hampers',
  offering_2_desc: 'Tailor-made, elegant hampers for festivals, employee appreciation rewards, client onboarding, and luxury business gifting.',
  offering_2_moq: 'MOQ: 50 Hampers',
  offering_2_lead: 'Lead Time: 10-12 Days',

  offering_3_title: 'Event & Offsite Supply',
  offering_3_desc: 'Guilt-free snack packages for offsite meetups, executive conferences, product launches, and major corporate events.',
  offering_3_moq: 'MOQ: 100 Units',
  offering_3_lead: 'Lead Time: 4-6 Days',

  offering_4_title: 'Coworking & Café Partnerships',
  offering_4_desc: 'Wholesale, beautifully-packaged roasted snack counters and shelves tailored for high-end coworking cafés and corporate cafeterias.',
  offering_4_moq: 'MOQ: 250 Units',
  offering_4_margin: 'Margin: 15-25%',

  // --- SECTION 3: FEATURED CORPORATE GIFTING ---
  gifting_title: 'A festive hamper your team will still be opening in November.',
  gifting_desc: 'Premium Grainzz hampers in 2, 4 and 6 jar formats. Custom branding, custom delivery, and custom selection of clean-label roasted millet snacks.',
  gifting_card_title: 'Move beyond sweets. Gift better snacking.',
  gifting_card_price: 'From ₹450 Onwards',
  gifting_card_badge: 'Grainzz Shell Hampers',
  gifting_image_url: '',
  gifting_bullet_1: 'Premium jar packs (120-150g net weight per jar)',
  gifting_bullet_2: 'Custom outer sleeves with your brand logo & greetings',
  gifting_bullet_3: 'Individual recipient delivery direct to employee doorsteps',
  gifting_bullet_4: 'Early-bird bookings open for festive corporate discounts',

  // --- SECTION 4: WHY TEAMS CHOOSE GRAINZZ ---
  why_title: 'Why teams choose Grainzz.',
  why_desc: 'A modern, honest snack brand built for workplaces that care about what their employees eat.',
  
  why_1_title: 'Real Grains',
  why_1_desc: 'Ragi, Oats, Jowar, Bajra, and Quinoa. We never use refined flour (maida).',
  
  why_2_title: 'Clean Label',
  why_2_desc: 'No palm oil, no trans fat, zero artificial flavors, and no chemicals.',
  
  why_3_title: 'Custom Branding',
  why_3_desc: 'Custom gift sleeves, greeting inserts, and tailored gift box formats.',
  
  why_4_title: 'Pan-India Delivery',
  why_4_desc: 'Reliable multi-location distributions or individual work-from-home drop-offs.',

  // --- SECTION 5: INQUIRY FORM HEADER & FOUNDER DIRECT CONTACTS ---
  form_title: 'Tell us about your team\'s snacking.',
  form_desc: 'Pantry, gifting, event or café partnership — fill this form and our founder team responds within 24 hours.',
  founder_phone: '+918800271274',
  founder_email: 'contact@grainzzindia.com',

  // --- SECTION 6: FAQ HEADER & ITEMS ---
  faq_title: 'Frequently asked.',
  faq_desc: 'Common questions and custom partnership configurations.',
  
  faq_1_question: 'What is the minimum order quantity (MOQ) for corporate gifting?',
  faq_1_answer: 'Our minimum order quantity for standard corporate gift hampers is 50 units. For fully customized premium branding on our jars and outer boxes, the MOQ starts at 100 units to ensure premium packaging and quality control.',
  
  faq_2_question: 'Can hampers and boxes be customized with our company branding?',
  faq_2_answer: 'Absolutely! We offer custom-printed sleeve wraps, corporate logos, and personalized note cards for orders above 100 boxes. You can choose from our curated collections or select individual snack jars to match your brand colors.',
  
  faq_3_question: 'Do you offer sample boxes for tasting before purchase?',
  faq_3_answer: 'Yes, we do. We offer a Curated Sample Box featuring our best-selling roasted snacks for companies planning long-term pantry programs or large gifting campaigns. Drop us an inquiry, and our corporate representative will arrange it.',
  
  faq_4_question: 'What is the average lead time for wholesale orders?',
  faq_4_answer: 'For standard office supplies, we deliver within 5-7 business days across India. For customized corporate hampers or bulk seasonal orders (like Diwali or New Year), the lead time is 10-14 days depending on custom requirements and order volume.',
  
  faq_5_question: 'Do you deliver PAN India?',
  faq_5_answer: 'Yes! We offer reliable, secure PAN India delivery. We can handle bulk single-location warehouse drop-offs or split ship individual boxes directly to your remote employee work-from-home addresses across the country.',
};

export default function B2BConfigPage() {
  const [config, setConfig] = useState<any>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingGifting, setUploadingGifting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'hero' | 'offerings' | 'gifting' | 'why' | 'contact' | 'faq'>('hero');

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

  const tabs = [
    { id: 'hero', label: 'Hero Header', icon: Sparkles },
    { id: 'offerings', label: 'What We Offer', icon: Coffee },
    { id: 'gifting', label: 'Seasonal Special • Custom Packs', icon: Gift },
    { id: 'why', label: 'Why Grainzz', icon: Layers },
    { id: 'contact', label: 'Enquiry & Contacts', icon: Phone },
    { id: 'faq', label: 'FAQs Customizer', icon: HelpCircle },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Building2 size={26} className="text-[#1D5E20]" /> B2B Page Customizer
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Configure every section, texts, bullet lists, FAQ items, margin percentages, and founder details of the B2B Wholesale page.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#1D5E20] hover:bg-[#144216] disabled:bg-gray-400 text-white font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all self-start md:self-center shadow-sm cursor-pointer"
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

      {/* Tab Navigation */}
      <div className="flex flex-wrap border-b border-gray-200 mb-8 gap-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-t-xl transition-all border-b-2 cursor-pointer ${
                isActive 
                  ? 'border-[#1D5E20] text-[#1D5E20] bg-green-50/50' 
                  : 'border-transparent text-gray-500 hover:text-[#1D5E20] hover:bg-gray-50'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={40} className="animate-spin text-[#1D5E20]" />
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* TAB 1: HERO */}
          {activeTab === 'hero' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-3">
                <Sparkles size={20} className="text-yellow-500" /> B2B Hero Section Settings
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
          )}

          {/* TAB 2: WHAT WE OFFER */}
          {activeTab === 'offerings' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-3">
                <Coffee size={20} className="text-[#1D5E20]" /> What We Offer Section Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Section Title</label>
                  <input
                    type="text"
                    value={config.offerings_title}
                    onChange={(e) => handleTextChange('offerings_title', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Section Description</label>
                  <input
                    type="text"
                    value={config.offerings_desc}
                    onChange={(e) => handleTextChange('offerings_desc', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                {/* Card 1 */}
                <div className="p-5 border border-gray-100 rounded-xl bg-gray-50/50 space-y-4">
                  <h3 className="font-bold text-sm text-[#1D5E20] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#EEFBDC] text-[#1D5E20] flex items-center justify-center text-xs font-black">1</span>
                    Office Pantry Programme
                  </h3>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={config.offering_1_title}
                      onChange={(e) => handleTextChange('offering_1_title', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={config.offering_1_desc}
                      onChange={(e) => handleTextChange('offering_1_desc', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">MOQ Limit</label>
                      <input
                        type="text"
                        value={config.offering_1_moq}
                        onChange={(e) => handleTextChange('offering_1_moq', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Lead Time</label>
                      <input
                        type="text"
                        value={config.offering_1_lead}
                        onChange={(e) => handleTextChange('offering_1_lead', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="p-5 border border-gray-100 rounded-xl bg-gray-50/50 space-y-4">
                  <h3 className="font-bold text-sm text-[#1D5E20] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#EEFBDC] text-[#1D5E20] flex items-center justify-center text-xs font-black">2</span>
                    Corporate Gifting & Hampers
                  </h3>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={config.offering_2_title}
                      onChange={(e) => handleTextChange('offering_2_title', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={config.offering_2_desc}
                      onChange={(e) => handleTextChange('offering_2_desc', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">MOQ Limit</label>
                      <input
                        type="text"
                        value={config.offering_2_moq}
                        onChange={(e) => handleTextChange('offering_2_moq', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Lead Time</label>
                      <input
                        type="text"
                        value={config.offering_2_lead}
                        onChange={(e) => handleTextChange('offering_2_lead', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="p-5 border border-gray-100 rounded-xl bg-gray-50/50 space-y-4">
                  <h3 className="font-bold text-sm text-[#1D5E20] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#EEFBDC] text-[#1D5E20] flex items-center justify-center text-xs font-black">3</span>
                    Event & Offsite Supply
                  </h3>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={config.offering_3_title}
                      onChange={(e) => handleTextChange('offering_3_title', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={config.offering_3_desc}
                      onChange={(e) => handleTextChange('offering_3_desc', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">MOQ Limit</label>
                      <input
                        type="text"
                        value={config.offering_3_moq}
                        onChange={(e) => handleTextChange('offering_3_moq', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Lead Time</label>
                      <input
                        type="text"
                        value={config.offering_3_lead}
                        onChange={(e) => handleTextChange('offering_3_lead', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Card 4 */}
                <div className="p-5 border border-gray-100 rounded-xl bg-gray-50/50 space-y-4">
                  <h3 className="font-bold text-sm text-[#1D5E20] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#EEFBDC] text-[#1D5E20] flex items-center justify-center text-xs font-black">4</span>
                    Coworking & Café Partnerships
                  </h3>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={config.offering_4_title}
                      onChange={(e) => handleTextChange('offering_4_title', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={config.offering_4_desc}
                      onChange={(e) => handleTextChange('offering_4_desc', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">MOQ Limit</label>
                      <input
                        type="text"
                        value={config.offering_4_moq}
                        onChange={(e) => handleTextChange('offering_4_moq', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Wholesale Margin</label>
                      <input
                        type="text"
                        value={config.offering_4_margin}
                        onChange={(e) => handleTextChange('offering_4_margin', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SEASONAL SPECIAL & CUSTOM PACKS */}
          {activeTab === 'gifting' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-3">
                <Gift size={20} className="text-blue-500" /> Seasonal Special • Custom Packs
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

              {/* Gifting Bullet Points config */}
              <div className="pt-6 border-t border-gray-100 space-y-4">
                <h3 className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
                  <Sparkles size={16} className="text-[#1D5E20]" /> Customizable Gifting Highlights list
                </h3>
                <p className="text-xs text-gray-400">These points will appear in a stylized checkmark list next to the main holiday hamper offer blocks.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Highlight Item 1 (e.g. Weights, jar styles)</label>
                    <input
                      type="text"
                      value={config.gifting_bullet_1}
                      onChange={(e) => handleTextChange('gifting_bullet_1', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Highlight Item 2 (e.g. Custom print / branding)</label>
                    <input
                      type="text"
                      value={config.gifting_bullet_2}
                      onChange={(e) => handleTextChange('gifting_bullet_2', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Highlight Item 3 (e.g. Delivery channels)</label>
                    <input
                      type="text"
                      value={config.gifting_bullet_3}
                      onChange={(e) => handleTextChange('gifting_bullet_3', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Highlight Item 4 (e.g. Offers / booking info)</label>
                    <input
                      type="text"
                      value={config.gifting_bullet_4}
                      onChange={(e) => handleTextChange('gifting_bullet_4', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WHY CHOOSE GRAINZZ */}
          {activeTab === 'why' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-3">
                <Layers size={20} className="text-green-500" /> &quot;Why Teams Choose Grainzz&quot; Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Section Main Header</label>
                  <input
                    type="text"
                    value={config.why_title}
                    onChange={(e) => handleTextChange('why_title', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Section Sub-Description</label>
                  <input
                    type="text"
                    value={config.why_desc}
                    onChange={(e) => handleTextChange('why_desc', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                {/* Feature 1 */}
                <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 space-y-3">
                  <h3 className="font-bold text-sm text-[#1D5E20] flex items-center gap-1.5">
                    <Layers size={16} /> Feature 1 (Real Grains)
                  </h3>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Header</label>
                    <input
                      type="text"
                      value={config.why_1_title}
                      onChange={(e) => handleTextChange('why_1_title', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={config.why_1_desc}
                      onChange={(e) => handleTextChange('why_1_desc', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium resize-none"
                    />
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 space-y-3">
                  <h3 className="font-bold text-sm text-[#1D5E20] flex items-center gap-1.5">
                    <Leaf size={16} /> Feature 2 (Clean Label)
                  </h3>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Header</label>
                    <input
                      type="text"
                      value={config.why_2_title}
                      onChange={(e) => handleTextChange('why_2_title', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={config.why_2_desc}
                      onChange={(e) => handleTextChange('why_2_desc', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium resize-none"
                    />
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 space-y-3">
                  <h3 className="font-bold text-sm text-[#1D5E20] flex items-center gap-1.5">
                    <Bookmark size={16} /> Feature 3 (Custom Branding)
                  </h3>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Header</label>
                    <input
                      type="text"
                      value={config.why_3_title}
                      onChange={(e) => handleTextChange('why_3_title', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={config.why_3_desc}
                      onChange={(e) => handleTextChange('why_3_desc', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium resize-none"
                    />
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 space-y-3">
                  <h3 className="font-bold text-sm text-[#1D5E20] flex items-center gap-1.5">
                    <Truck size={16} /> Feature 4 (Pan-India Delivery)
                  </h3>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Header</label>
                    <input
                      type="text"
                      value={config.why_4_title}
                      onChange={(e) => handleTextChange('why_4_title', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={config.why_4_desc}
                      onChange={(e) => handleTextChange('why_4_desc', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ENQUIRY & CONTACT DETAILS */}
          {activeTab === 'contact' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-3">
                <Phone size={20} className="text-purple-500" /> Enquiry Header & Founder Contacts Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Enquiry Form Header Title</label>
                    <input
                      type="text"
                      value={config.form_title}
                      onChange={(e) => handleTextChange('form_title', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Enquiry Form Sub-Text</label>
                    <textarea
                      rows={3}
                      value={config.form_desc}
                      onChange={(e) => handleTextChange('form_desc', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-4 p-5 rounded-xl border border-gray-100 bg-gray-50/50">
                  <h3 className="font-bold text-sm text-[#1D5E20] flex items-center gap-1.5">
                    <Mail size={16} /> Founder Direct Channels Info
                  </h3>
                  <p className="text-xs text-gray-400">These will appear at the very bottom of the enquiry submission form as direct fallback communication paths.</p>
                  
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Whatsapp / Phone Number</label>
                    <input
                      type="text"
                      value={config.founder_phone}
                      onChange={(e) => handleTextChange('founder_phone', e.target.value)}
                      placeholder="E.g., +91 88002 71274"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-bold"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Founder Support Email Address</label>
                    <input
                      type="email"
                      value={config.founder_email}
                      onChange={(e) => handleTextChange('founder_email', e.target.value)}
                      placeholder="E.g., contact@grainzzindia.com"
                      className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: FAQS */}
          {activeTab === 'faq' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-3">
                <HelpCircle size={20} className="text-orange-500" /> B2B Frequently Asked Questions Customizer
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 border-b border-gray-100">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">FAQ Block Header Title</label>
                  <input
                    type="text"
                    value={config.faq_title}
                    onChange={(e) => handleTextChange('faq_title', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">FAQ Supporting Description</label>
                  <input
                    type="text"
                    value={config.faq_desc}
                    onChange={(e) => handleTextChange('faq_desc', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                {/* FAQ 1 */}
                <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 space-y-3">
                  <h3 className="font-bold text-xs text-gray-700 flex items-center gap-1.5">Question 1</h3>
                  <input
                    type="text"
                    value={config.faq_1_question || ''}
                    onChange={(e) => handleTextChange('faq_1_question', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-semibold"
                  />
                  <h3 className="font-bold text-xs text-gray-700 flex items-center gap-1.5">Answer 1</h3>
                  <textarea
                    rows={2}
                    value={config.faq_1_answer || ''}
                    onChange={(e) => handleTextChange('faq_1_answer', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium resize-none"
                  />
                </div>

                {/* FAQ 2 */}
                <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 space-y-3">
                  <h3 className="font-bold text-xs text-gray-700 flex items-center gap-1.5">Question 2</h3>
                  <input
                    type="text"
                    value={config.faq_2_question || ''}
                    onChange={(e) => handleTextChange('faq_2_question', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-semibold"
                  />
                  <h3 className="font-bold text-xs text-gray-700 flex items-center gap-1.5">Answer 2</h3>
                  <textarea
                    rows={2}
                    value={config.faq_2_answer || ''}
                    onChange={(e) => handleTextChange('faq_2_answer', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium resize-none"
                  />
                </div>

                {/* FAQ 3 */}
                <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 space-y-3">
                  <h3 className="font-bold text-xs text-gray-700 flex items-center gap-1.5">Question 3</h3>
                  <input
                    type="text"
                    value={config.faq_3_question || ''}
                    onChange={(e) => handleTextChange('faq_3_question', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-semibold"
                  />
                  <h3 className="font-bold text-xs text-gray-700 flex items-center gap-1.5">Answer 3</h3>
                  <textarea
                    rows={2}
                    value={config.faq_3_answer || ''}
                    onChange={(e) => handleTextChange('faq_3_answer', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium resize-none"
                  />
                </div>

                {/* FAQ 4 */}
                <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 space-y-3">
                  <h3 className="font-bold text-xs text-gray-700 flex items-center gap-1.5">Question 4</h3>
                  <input
                    type="text"
                    value={config.faq_4_question || ''}
                    onChange={(e) => handleTextChange('faq_4_question', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-semibold"
                  />
                  <h3 className="font-bold text-xs text-gray-700 flex items-center gap-1.5">Answer 4</h3>
                  <textarea
                    rows={2}
                    value={config.faq_4_answer || ''}
                    onChange={(e) => handleTextChange('faq_4_answer', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium resize-none"
                  />
                </div>

                {/* FAQ 5 */}
                <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 space-y-3">
                  <h3 className="font-bold text-xs text-gray-700 flex items-center gap-1.5">Question 5</h3>
                  <input
                    type="text"
                    value={config.faq_5_question || ''}
                    onChange={(e) => handleTextChange('faq_5_question', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-semibold"
                  />
                  <h3 className="font-bold text-xs text-gray-700 flex items-center gap-1.5">Answer 5</h3>
                  <textarea
                    rows={2}
                    value={config.faq_5_answer || ''}
                    onChange={(e) => handleTextChange('faq_5_answer', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D5E20]/20 font-medium resize-none"
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

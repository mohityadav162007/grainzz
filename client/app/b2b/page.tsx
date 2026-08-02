'use client';

import { useState, useEffect } from 'react';
import Image from '@/components/ui/AppImage';
import { submitEnquiry, getStoreSettings } from '@/lib/api';
import { 
  Plus, 
  Minus, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  Layers, 
  Leaf, 
  Bookmark, 
  Truck, 
  Building2, 
  Sparkles, 
  Coffee, 
  Gift 
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

export default function B2BPage() {
  // Store dynamic configurations
  const [customConfig, setCustomConfig] = useState<any>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [teamSize, setTeamSize] = useState('1-20');
  
  // Interests (Checkbox)
  const [interests, setInterests] = useState<string[]>([]);
  const toggleInterest = (val: string) => {
    setInterests(prev => 
      prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val]
    );
  };

  const handleRequestSample = () => {
    if (!interests.includes('Sample Box')) {
      setInterests(prev => [...prev, 'Sample Box']);
    }
    scrollToId('b2b-enquiry');
  };

  const handleGetQuote = () => {
    setInterests([]);
    scrollToId('b2b-enquiry');
  };

  // Priorities (Checkbox)
  const [priorities, setPriorities] = useState<string[]>([]);
  const togglePriority = (val: string) => {
    setPriorities(prev => 
      prev.includes(val) ? prev.filter(p => p !== val) : [...prev, val]
    );
  };

  // Quantity & Timeline text
  const [quantityTimeline, setQuantityTimeline] = useState('');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Accordion FAQ state
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Load B2B page customizer content
  useEffect(() => {
    getStoreSettings().then((settings: any) => {
      if (settings?.b2b_settings) {
        try {
          setCustomConfig(JSON.parse(settings.b2b_settings));
        } catch (e) {
          console.error(e);
        }
      }
    }).catch(console.error);
  }, []);

  const activeConfig = customConfig ? { ...DEFAULT_SETTINGS, ...customConfig } : DEFAULT_SETTINGS;

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !company || !email || !phone || !city) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    
    setSubmitting(true);
    setErrorMsg('');

    // Format message matching guidelines
    const formattedMessage = `
**Corporate Gifting Inquiry Details:**
- **City:** ${city}
- **Interested In:** ${interests.join(', ') || 'None selected'}
- **Team Size:** ${teamSize}
- **Priorities:** ${priorities.join(', ') || 'None selected'}
- **Quantity & Timeline Details:**
${quantityTimeline || 'No specific quantity/timeline provided.'}
    `.trim();

    try {
      await submitEnquiry({
        firstName: fullName,
        lastName: company,
        email,
        phone,
        subject: 'Corporate Gifting Inquiry',
        orderId: 'Gifting',
        message: formattedMessage
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Smooth scroll helper
  const scrollToId = (id: string) => {
    if (typeof document === 'undefined') return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Structured Data (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://www.grainzzindia.com/b2b",
        "url": "https://www.grainzzindia.com/b2b",
        "name": "Corporate Gifting & Wholesale Orders | Grainzz",
        "description": "Partner with Grainzz for office pantry supplies, corporate gifting, private labeling, and bulk snack orders across India.",
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://www.grainzzindia.com"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Corporate Gifting",
              "item": "https://www.grainzzindia.com/b2b"
            }
          ]
        }
      },
      {
        "@type": "Organization",
        "@id": "https://www.grainzzindia.com/#organization",
        "name": "Grainzz",
        "url": "https://www.grainzzindia.com",
        "logo": "https://www.grainzzindia.com/favicon-image.png",
        "sameAs": [
          "https://www.instagram.com/grainzz"
        ]
      }
    ]
  };

  const dynamicFaqs = [
    { question: activeConfig.faq_1_question, answer: activeConfig.faq_1_answer },
    { question: activeConfig.faq_2_question, answer: activeConfig.faq_2_answer },
    { question: activeConfig.faq_3_question, answer: activeConfig.faq_3_answer },
    { question: activeConfig.faq_4_question, answer: activeConfig.faq_4_answer },
    { question: activeConfig.faq_5_question, answer: activeConfig.faq_5_answer },
  ].filter(faq => faq.question && faq.answer);

  return (
    <div className="w-full bg-[#FFFDF5] text-brand-black">
      {/* HTML SEO Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* ─── SECTION 1 — HERO SECTION ─── */}
      <section className="py-[60px] md:py-[80px] bg-[#EEFBDC] w-full border-b border-[#E0EFCC]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[100px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[40px] md:gap-[60px] items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col items-start gap-[24px]">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#EAEAEA] rounded-full text-brand-green text-xs font-bold uppercase tracking-wider">
                <Building2 size={12} /> Grainzz for Business
              </div>
              <h1 className="text-[36px] md:text-[52px] font-semibold text-brand-black leading-[1.1] tracking-tight whitespace-pre-line">
                {activeConfig.hero_title.includes(' workplaces.') ? (
                  <>
                    Better snacks for <br />
                    <span className="text-brand-green">{activeConfig.hero_title.replace('Better snacks for ', '')}</span>
                  </>
                ) : (
                  activeConfig.hero_title
                )}
              </h1>
              <p className="text-[16px] md:text-[18px] text-[#4A4A4A] leading-[1.6] max-w-[580px] font-medium">
                {activeConfig.hero_desc}
              </p>
              <div className="flex flex-col sm:flex-row gap-[16px] w-full sm:w-auto pt-2">
                <button 
                  onClick={handleRequestSample}
                  className="bg-brand-green text-white hover:bg-[#14391a] px-8 py-3.5 rounded-full font-bold text-[15px] transition-all shadow-sm flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
                >
                  Request a Sample Box <ArrowRight size={18} />
                </button>
                <button 
                  onClick={handleGetQuote}
                  className="border border-[#1D5E20] text-brand-green hover:bg-[#1D5E20]/5 px-8 py-3.5 rounded-full font-bold text-[15px] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Get a Quote
                </button>
              </div>
            </div>

            {/* Right Card Panel (Custom image vs CSS fallback) */}
            <div className="lg:col-span-5 w-full">
              {activeConfig.hero_image_url ? (
                <div className="relative rounded-[24px] overflow-hidden min-h-[340px] md:min-h-[380px] group shadow-lg hover:shadow-xl transition-all duration-300">
                  <Image
                    src={activeConfig.hero_image_url}
                    alt={activeConfig.hero_card_title}
                    fill
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    sizes="(max-width: 1024px) 100vw, 480px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-[36px] md:p-[44px] flex flex-col justify-end gap-3 text-white">
                    <h3 className="text-[24px] md:text-[28px] font-semibold leading-[1.2] tracking-tight">
                      {activeConfig.hero_card_title}
                    </h3>
                    <p className="text-[13px] md:text-[14px] font-bold text-[#EEFBDC]">
                      {activeConfig.hero_card_text}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-brand-green text-white p-[36px] md:p-[44px] rounded-[24px] shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[340px] md:min-h-[380px] hover:shadow-xl transition-shadow duration-300">
                  <div className="absolute right-[-40px] top-[-40px] w-[180px] h-[180px] bg-white/10 rounded-full blur-2xl" />
                  <div className="absolute left-[-20px] bottom-[-20px] w-[120px] h-[120px] bg-[#EEFBDC]/10 rounded-full blur-xl" />
                  
                  <div className="flex flex-col gap-2 relative z-10">
                    <span className="text-brand-yellow font-bold text-[13px] uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles size={14} className="animate-pulse" /> Gold Standard
                    </span>
                    <h3 className="text-[28px] md:text-[32px] font-semibold leading-[1.2] tracking-tight">
                      {activeConfig.hero_card_title}
                    </h3>
                  </div>
                  
                  <div className="pt-8 relative z-10 flex flex-col gap-3">
                    <div className="h-[2px] bg-white/20 w-full" />
                    <p className="text-[14px] md:text-[15px] font-bold text-[#EEFBDC]">
                      {activeConfig.hero_card_text}
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ─── SECTION 2 — WHAT WE OFFER ─── */}
      <section id="offerings" className="py-[60px] md:py-[100px] w-full bg-white">
        <div className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[100px]">
          
          <div className="text-center mb-[48px] md:mb-[64px] flex flex-col items-center gap-4">
            <h2 className="text-[32px] md:text-[40px] font-semibold text-brand-black tracking-tight leading-[1.2]">
              {activeConfig.offerings_title.includes(' offer.') ? (
                <>
                  What we <span className="text-brand-green">{activeConfig.offerings_title.replace('What we ', '')}</span>
                </>
              ) : (
                activeConfig.offerings_title
              )}
            </h2>
            <p className="text-[15px] md:text-[16px] text-[#6B6B6B] font-medium max-w-[620px]">
              {activeConfig.offerings_desc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] md:gap-[32px]">
            
            {/* Card 1 */}
            <div className="bg-[#FFFDF5] border border-[#EAEAEA] p-[32px] rounded-[20px] hover:shadow-md transition-shadow flex flex-col gap-[20px] relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-12 h-12 bg-brand-green text-white flex items-center justify-center rounded-bl-[16px] font-bold text-[15px] group-hover:scale-105 transition-transform">
                01
              </div>
              <div className="w-[50px] h-[50px] bg-[#EEFBDC] rounded-full text-brand-green flex items-center justify-center">
                <Coffee size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-[20px] font-semibold text-brand-black">{activeConfig.offering_1_title}</h3>
                <p className="text-[14px] md:text-[15px] text-[#6B6B6B] leading-[1.6] font-medium">
                  {activeConfig.offering_1_desc}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-2 text-[13px] font-bold border-t border-[#F2F2F2] mt-auto">
                <span className="bg-[#EEFBDC] text-brand-green px-3 py-1 rounded-full">{activeConfig.offering_1_moq}</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{activeConfig.offering_1_lead}</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#FFFDF5] border border-[#EAEAEA] p-[32px] rounded-[20px] hover:shadow-md transition-shadow flex flex-col gap-[20px] relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-12 h-12 bg-brand-green text-white flex items-center justify-center rounded-bl-[16px] font-bold text-[15px] group-hover:scale-105 transition-transform">
                02
              </div>
              <div className="w-[50px] h-[50px] bg-[#EEFBDC] rounded-full text-brand-green flex items-center justify-center">
                <Gift size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-[20px] font-semibold text-brand-black">{activeConfig.offering_2_title}</h3>
                <p className="text-[14px] md:text-[15px] text-[#6B6B6B] leading-[1.6] font-medium">
                  {activeConfig.offering_2_desc}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-2 text-[13px] font-bold border-t border-[#F2F2F2] mt-auto">
                <span className="bg-[#EEFBDC] text-brand-green px-3 py-1 rounded-full">{activeConfig.offering_2_moq}</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{activeConfig.offering_2_lead}</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#FFFDF5] border border-[#EAEAEA] p-[32px] rounded-[20px] hover:shadow-md transition-shadow flex flex-col gap-[20px] relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-12 h-12 bg-brand-green text-white flex items-center justify-center rounded-bl-[16px] font-bold text-[15px] group-hover:scale-105 transition-transform">
                03
              </div>
              <div className="w-[50px] h-[50px] bg-[#EEFBDC] rounded-full text-brand-green flex items-center justify-center">
                <Sparkles size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-[20px] font-semibold text-brand-black">{activeConfig.offering_3_title}</h3>
                <p className="text-[14px] md:text-[15px] text-[#6B6B6B] leading-[1.6] font-medium">
                  {activeConfig.offering_3_desc}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-2 text-[13px] font-bold border-t border-[#F2F2F2] mt-auto">
                <span className="bg-[#EEFBDC] text-brand-green px-3 py-1 rounded-full">{activeConfig.offering_3_moq}</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{activeConfig.offering_3_lead}</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-[#FFFDF5] border border-[#EAEAEA] p-[32px] rounded-[20px] hover:shadow-md transition-shadow flex flex-col gap-[20px] relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-12 h-12 bg-brand-green text-white flex items-center justify-center rounded-bl-[16px] font-bold text-[15px] group-hover:scale-105 transition-transform">
                04
              </div>
              <div className="w-[50px] h-[50px] bg-[#EEFBDC] rounded-full text-brand-green flex items-center justify-center">
                <Building2 size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-[20px] font-semibold text-brand-black">{activeConfig.offering_4_title}</h3>
                <p className="text-[14px] md:text-[15px] text-[#6B6B6B] leading-[1.6] font-medium">
                  {activeConfig.offering_4_desc}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-2 text-[13px] font-bold border-t border-[#F2F2F2] mt-auto">
                <span className="bg-[#EEFBDC] text-brand-green px-3 py-1 rounded-full">{activeConfig.offering_4_moq}</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{activeConfig.offering_4_margin}</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── SECTION 3 — FEATURED CORPORATE GIFTING SECTION ─── */}
      <section className="py-[60px] md:py-[100px] w-full bg-[#FFF8E7] border-t border-b border-[#FEF3D0]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[100px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[40px] md:gap-[60px] items-center">
            
            {/* Left Side Highlight Card (Custom image vs CSS fallback) */}
            <div className="lg:col-span-5 w-full order-2 lg:order-1">
              {activeConfig.gifting_image_url ? (
                <div className="relative rounded-[24px] overflow-hidden min-h-[300px] md:min-h-[360px] group shadow-lg hover:shadow-xl transition-all duration-300">
                  <Image
                    src={activeConfig.gifting_image_url}
                    alt={activeConfig.gifting_card_title}
                    fill
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    sizes="(max-width: 1024px) 100vw, 480px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-[36px] md:p-[44px] flex flex-col justify-end gap-2 text-white">
                    <h3 className="text-[22px] md:text-[26px] font-semibold leading-[1.2] tracking-tight">
                      {activeConfig.gifting_card_title}
                    </h3>
                    <div className="pt-4 border-t border-white/20 flex items-center justify-between">
                      <span className="text-[12px] font-bold text-brand-yellow">{activeConfig.gifting_card_badge}</span>
                      <span className="bg-brand-green text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">{activeConfig.gifting_card_price}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#5A3825] text-white p-[36px] md:p-[44px] rounded-[24px] shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[300px] md:min-h-[360px] group hover:shadow-xl transition-shadow">
                  <div className="absolute right-[-20px] bottom-[-20px] w-[140px] h-[140px] bg-brand-yellow/10 rounded-full blur-xl" />
                  <div className="flex flex-col gap-2">
                    <span className="text-brand-yellow font-bold text-[12px] uppercase tracking-widest">Premium Collection</span>
                    <h3 className="text-[26px] md:text-[30px] font-semibold leading-[1.2] tracking-tight">
                      {activeConfig.gifting_card_title}
                    </h3>
                  </div>
                  <div className="pt-8 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[13px] font-bold text-brand-yellow">{activeConfig.gifting_card_badge}</span>
                    <span className="bg-brand-green text-white text-[12px] font-bold px-3 py-1 rounded-full">{activeConfig.gifting_card_price}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side Content */}
            <div className="lg:col-span-7 flex flex-col items-start gap-[24px] order-1 lg:order-2">
              <span className="text-brand-green font-bold text-[14px] uppercase tracking-widest font-sans">Seasonal Special • Custom Packs</span>
              <h2 className="text-[32px] md:text-[40px] font-semibold text-brand-black leading-[1.2] tracking-tight whitespace-pre-line">
                {activeConfig.gifting_title.includes(' opening in ') ? (
                  <>
                    A festive hamper your team will <br />
                    <span className="text-brand-green">{activeConfig.gifting_title.replace('A festive hamper your team will ', '')}</span>
                  </>
                ) : (
                  activeConfig.gifting_title
                )}
              </h2>
              <p className="text-[15px] md:text-[16px] text-[#4A4A4A] leading-[1.6] font-medium">
                {activeConfig.gifting_desc}
              </p>
              
              <ul className="flex flex-col gap-[12px] w-full text-[14px] md:text-[15px] font-bold text-[#4A4A4A]">
                {activeConfig.gifting_bullet_1 && (
                  <li className="flex items-center gap-3">
                    <div className="w-[8px] h-[8px] rounded-full bg-brand-green shrink-0" />
                    {activeConfig.gifting_bullet_1}
                  </li>
                )}
                {activeConfig.gifting_bullet_2 && (
                  <li className="flex items-center gap-3">
                    <div className="w-[8px] h-[8px] rounded-full bg-brand-green shrink-0" />
                    {activeConfig.gifting_bullet_2}
                  </li>
                )}
                {activeConfig.gifting_bullet_3 && (
                  <li className="flex items-center gap-3">
                    <div className="w-[8px] h-[8px] rounded-full bg-brand-green shrink-0" />
                    {activeConfig.gifting_bullet_3}
                  </li>
                )}
                {activeConfig.gifting_bullet_4 && (
                  <li className="flex items-center gap-3">
                    <div className="w-[8px] h-[8px] rounded-full bg-brand-green shrink-0" />
                    {activeConfig.gifting_bullet_4}
                  </li>
                )}
              </ul>

              <button 
                onClick={() => scrollToId('b2b-enquiry')}
                className="bg-brand-green hover:bg-[#14391a] text-white font-bold px-8 py-3.5 rounded-full text-[15px] transition-all hover:scale-105 shadow-sm mt-2 cursor-pointer"
              >
                Reserve Shell Hampers
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ─── SECTION 4 — WHY TEAMS CHOOSE GRAINZZ ─── */}
      <section className="py-[60px] md:py-[100px] w-full bg-white">
        <div className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[100px]">
          
          <div className="text-center mb-[48px] md:mb-[60px]">
            <h2 className="text-[32px] md:text-[40px] font-semibold text-brand-black tracking-tight leading-[1.2] mb-3">
              {activeConfig.why_title.includes(' Grainzz.') ? (
                <>
                  Why teams choose <span className="text-brand-green">{activeConfig.why_title.replace('Why teams choose ', '')}</span>
                </>
              ) : (
                activeConfig.why_title
              )}
            </h2>
            <p className="text-[15px] md:text-[16px] text-[#6B6B6B] font-medium max-w-[600px] mx-auto">
              {activeConfig.why_desc}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[32px]">
            
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-[60px] h-[60px] bg-[#EEFBDC] rounded-full text-brand-green flex items-center justify-center flex-shrink-0">
                <Layers size={24} />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-[17px] font-bold text-brand-black">{activeConfig.why_1_title}</h3>
                <p className="text-[13px] md:text-[14px] text-[#6B6B6B] font-medium leading-[1.6]">
                  {activeConfig.why_1_desc}
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-[60px] h-[60px] bg-[#EEFBDC] rounded-full text-brand-green flex items-center justify-center flex-shrink-0">
                <Leaf size={24} />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-[17px] font-bold text-brand-black">{activeConfig.why_2_title}</h3>
                <p className="text-[13px] md:text-[14px] text-[#6B6B6B] font-medium leading-[1.6]">
                  {activeConfig.why_2_desc}
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-[60px] h-[60px] bg-[#EEFBDC] rounded-full text-brand-green flex items-center justify-center flex-shrink-0">
                <Bookmark size={24} />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-[17px] font-bold text-brand-black">{activeConfig.why_3_title}</h3>
                <p className="text-[13px] md:text-[14px] text-[#6B6B6B] font-medium leading-[1.6]">
                  {activeConfig.why_3_desc}
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-[60px] h-[60px] bg-[#EEFBDC] rounded-full text-brand-green flex items-center justify-center flex-shrink-0">
                <Truck size={24} />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-[17px] font-bold text-brand-black">{activeConfig.why_4_title}</h3>
                <p className="text-[13px] md:text-[14px] text-[#6B6B6B] font-medium leading-[1.6]">
                  {activeConfig.why_4_desc}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── SECTION 5 — B2B ENQUIRY FORM ─── */}
      <section id="b2b-enquiry" className="py-[60px] md:py-[100px] w-full bg-[#FFFDF5] border-t border-[#EAEAEA]">
        <div className="max-w-[900px] mx-auto px-4">
          
          <div className="text-center mb-[40px] md:mb-[50px] flex flex-col items-center gap-3">
            <h2 className="text-[32px] md:text-[40px] font-semibold text-brand-black tracking-tight leading-[1.2] whitespace-pre-line">
              {activeConfig.form_title.includes(' team\'s snacking.') ? (
                <>
                  Tell us about your <span className="text-brand-green">{activeConfig.form_title.replace('Tell us about your ', '')}</span>
                </>
              ) : (
                activeConfig.form_title
              )}
            </h2>
            <p className="text-[15px] text-[#6B6B6B] font-medium max-w-[500px]">
              {activeConfig.form_desc}
            </p>
          </div>

          <div className="bg-white rounded-[24px] border border-[#EAEAEA] p-[32px] md:p-[48px] shadow-sm">
            {submitted ? (
              <div className="text-center py-[40px] flex flex-col items-center gap-4">
                <div className="w-[64px] h-[64px] bg-[#EEFBDC] rounded-full flex items-center justify-center text-brand-green mb-2">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-[24px] font-bold text-brand-black">Inquiry Sent Successfully!</h3>
                <p className="text-[15px] text-[#6B6B6B] leading-[1.6] max-w-[420px] font-medium">
                  Thank you for reaching out to Grainzz. A founding team member or corporate snacking partner will contact you directly via phone or email shortly!
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 bg-[#EEFBDC] text-brand-green hover:bg-[#E0EFCC] px-6 py-2.5 rounded-full font-bold text-[14px] transition-all cursor-pointer"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-[24px]">
                
                {errorMsg && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-sm text-brand-red font-medium">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                  
                  {/* Left Column Fields */}
                  <div className="space-y-[20px]">
                    <div>
                      <label className="block text-[12px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                        Full Name <span className="text-brand-red">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="E.g., Raveena Sharma"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-green/35 placeholder:text-gray-400 font-medium transition-all font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                        Work Email <span className="text-brand-red">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="E.g., raveena@company.com"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-green/35 placeholder:text-gray-400 font-medium transition-all font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                        City <span className="text-brand-red">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="E.g., Mumbai"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-green/35 placeholder:text-gray-400 font-medium transition-all font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                        What are you interested in?
                      </label>
                      <div className="space-y-2.5">
                        {[
                          { id: 'sample', label: 'Sample Box' },
                          { id: 'pantry', label: 'Office Pantry' },
                          { id: 'gifting', label: 'Corporate Gifting' },
                          { id: 'coworking', label: 'Coworking / Café' }
                        ].map((opt) => (
                          <label key={opt.id} className="flex items-center gap-3 cursor-pointer text-[14px] font-medium text-[#4A4A4A]">
                            <input
                              type="checkbox"
                              checked={interests.includes(opt.label)}
                              onChange={() => toggleInterest(opt.label)}
                              className="w-4.5 h-4.5 text-brand-green border-gray-300 rounded focus:ring-brand-green shrink-0 accent-[#1D5E20]"
                            />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column Fields */}
                  <div className="space-y-[20px]">
                    <div>
                      <label className="block text-[12px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                        Company <span className="text-brand-red">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="E.g., Google India"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-green/35 placeholder:text-gray-400 font-medium transition-all font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                        WhatsApp Number <span className="text-brand-red">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="E.g., +91 88002 71274"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-green/35 placeholder:text-gray-400 font-medium transition-all font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                        Team Size
                      </label>
                      <div className="relative">
                        <select
                          value={teamSize}
                          onChange={(e) => setTeamSize(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-brand-black bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/35 font-medium transition-all cursor-pointer appearance-none"
                        >
                          <option value="1-20">1–20 employees</option>
                          <option value="20-50">20–50 employees</option>
                          <option value="50-100">50–100 employees</option>
                          <option value="100-150">100–150 employees</option>
                          <option value="150+">150+ employees</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 border-l border-gray-200 pl-3">
                          ▼
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                        What matters most?
                      </label>
                      <div className="space-y-2.5">
                        {[
                          { id: 'healthy', label: 'Healthy Options' },
                          { id: 'budget', label: 'Budget Friendly' },
                          { id: 'fast', label: 'Fast Delivery' },
                          { id: 'premium', label: 'Premium Packaging' }
                        ].map((opt) => (
                          <label key={opt.id} className="flex items-center gap-3 cursor-pointer text-[14px] font-medium text-[#4A4A4A]">
                            <input
                              type="checkbox"
                              checked={priorities.includes(opt.label)}
                              onChange={() => togglePriority(opt.label)}
                              className="w-4.5 h-4.5 text-brand-green border-gray-300 rounded focus:ring-brand-green shrink-0 accent-[#1D5E20]"
                            />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Full Width Textarea Field */}
                <div>
                  <label className="block text-[12px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Quantity &amp; Timeline Details
                  </label>
                  <textarea
                    rows={4}
                    value={quantityTimeline}
                    onChange={(e) => setQuantityTimeline(e.target.value)}
                    placeholder="E.g., 100 Diwali hampers needed by October, customized with our corporate logo sleeve wrappers."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-green/35 placeholder:text-gray-400 font-medium transition-all resize-none font-sans"
                  />
                </div>

                {/* Action button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#B00912] hover:bg-[#8f070e] disabled:bg-gray-400 text-white font-bold py-3.5 rounded-full text-[15px] transition-all flex items-center justify-center gap-2 hover:scale-[1.01] shadow-sm cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Submitting...
                    </>
                  ) : (
                    'Send Inquiry'
                  )}
                </button>

                <p className="text-center text-[12px] text-gray-400 font-semibold pt-1">
                  Founder direct channels: WhatsApp: <a href={`https://wa.me/${activeConfig.founder_phone.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-brand-green font-bold hover:underline">{activeConfig.founder_phone}</a> • Email: <a href={`mailto:${activeConfig.founder_email}`} className="text-brand-green font-bold hover:underline">{activeConfig.founder_email}</a>
                </p>

              </form>
            )}
          </div>
        </div>
      </section>

      {/* ─── SECTION 6 — FAQ SECTION ─── */}
      <section className="py-[60px] md:py-[100px] w-full bg-white border-t border-[#EAEAEA]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[100px]">
          
          <div className="text-center mb-[40px] md:mb-[60px] flex flex-col items-center gap-3">
            <h2 className="text-[32px] md:text-[40px] font-semibold text-brand-black tracking-tight leading-[1.2]">
              {activeConfig.faq_title.includes(' asked.') ? (
                <>
                  Frequently <span className="text-brand-green">{activeConfig.faq_title.replace('Frequently ', '')}</span>
                </>
              ) : (
                activeConfig.faq_title
              )}
            </h2>
            <p className="text-[15px] text-[#6B6B6B] font-medium max-w-[500px]">
              {activeConfig.faq_desc}
            </p>
          </div>

          <div className="max-w-[800px] mx-auto flex flex-col gap-4">
            {dynamicFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div 
                  key={idx} 
                  className="border border-[#EAEAEA] rounded-[16px] overflow-hidden hover:shadow-md transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-6 text-left group transition-colors hover:bg-gray-50/20 cursor-pointer"
                  >
                    <span className="text-[16px] md:text-[17px] font-bold text-brand-black pr-8 group-hover:text-brand-green transition-colors">
                      {faq.question}
                    </span>
                    <div className="shrink-0 text-brand-black">
                      {isOpen ? (
                        <Minus size={18} strokeWidth={2.5} />
                      ) : (
                        <Plus size={18} strokeWidth={2.5} />
                      )}
                    </div>
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? 'max-h-[300px] opacity-100 border-t border-[#F9F9F9]' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="p-6 bg-gray-50/10">
                      <p className="text-[14px] leading-[1.6] text-[#6B6B6B] font-medium whitespace-pre-wrap">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

    </div>
  );
}


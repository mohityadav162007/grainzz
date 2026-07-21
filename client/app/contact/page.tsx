'use client';
import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, ArrowRight, HelpCircle, RefreshCw, Truck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { submitEnquiry, getStoreSettings } from '@/lib/api';

const helpCards = [
  { icon: HelpCircle, title: 'Support', desc: 'Already purchased and have a question about your product? Try our FAQs.', cta: 'FAQs', href: '/faqs' },
  { icon: RefreshCw, title: 'Returns', desc: 'We understand things don\'t always work out. Visit our returns policy for more.', cta: 'Return Policy', href: '/returns' },
  { icon: Truck, title: 'Shipping', desc: 'Need an idea on how long delivery may take, see our policy?', cta: 'Shipping Policy', href: '/shipping' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', subject: '', orderId: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState<Record<string, string>>({
    contact_phone: '96262425 , 93756546',
    contact_email: 'katariavibhor9@gmail.com',
    contact_address: 'B-291, MIG Flats, East of Loni road, Delhi, Delhi - 110093, India',
  });

  useEffect(() => {
    getStoreSettings().then(data => {
      if (data) setSettings(prev => ({ ...prev, ...data }));
    }).catch(console.error);
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = 'Required';
    if (!form.lastName.trim()) errs.lastName = 'Required';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid email required';
    if (!form.phone || !/^\d{10,15}$/.test(form.phone.replace(/\D/g, ''))) errs.phone = 'Valid phone required';
    if (!form.subject.trim()) errs.subject = 'Required';
    if (form.message.length > 2000) errs.message = 'Message too long';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    setErrors({});
    
    try {
      await submitEnquiry(form);
      setSubmitted(true);
    } catch (err: any) {
      setErrors({ server: err.message || 'Failed to submit message. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://www.grainzzindia.com/contact",
        "url": "https://www.grainzzindia.com/contact",
        "name": "Contact Us | Grainzz",
        "description": "Get in touch with Grainzz for product enquiries, orders, partnerships, and customer support.",
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
              "name": "Contact Us",
              "item": "https://www.grainzzindia.com/contact"
            }
          ]
        }
      }
    ]
  };

  return (
    <div className="bg-[#FBF5EB] min-h-[100dvh]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Top Section with Cards */}
      <div className="pt-[80px] pb-[100px]">
        {/* Header */}
        <div className="text-center w-full mb-[60px]">
          <p className="text-[16px] font-bold text-brand-green uppercase tracking-widest mb-[16px] font-sans">Contact Us</p>
          <h1 className="text-[40px] md:text-[64px] font-bold text-brand-black font-brand tracking-tight">How can we help?</h1>
        </div>

        {/* Help Cards */}
        <section className="max-w-[1200px] mx-auto px-4 md:px-[60px] lg:px-[80px] grid md:grid-cols-3 gap-[24px]">
          {helpCards.map(({ icon: Icon, title, desc, cta, href }) => (
            <div key={title} className="bg-white rounded-[24px] p-[40px] flex flex-col items-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all h-full">
              <div className="w-[64px] h-[64px] rounded-full border border-[#EAEAEA] flex items-center justify-center mb-[24px]">
                <Icon size={28} className="text-brand-green" />
              </div>
              <h3 className="text-[24px] font-bold mb-[16px] text-brand-black font-sans">{title}</h3>
              <p className="text-[15px] text-[#666666] mb-[32px] leading-[1.6] font-medium font-sans max-w-[280px] flex-grow">{desc}</p>
              <Link href={href} className="mt-auto inline-flex items-center gap-[12px] border border-[#CCCCCC] text-[#333] font-bold pl-[24px] pr-[6px] py-[6px] rounded-full hover:bg-brand-green hover:border-brand-green hover:text-white transition-all text-[14px] group/btn">
                {cta} 
                <div className="w-[32px] h-[32px] bg-brand-green rounded-full flex items-center justify-center text-white group-hover/btn:bg-white group-hover/btn:text-brand-green transition-colors">
                  <ArrowRight size={16} />
                </div>
              </Link>
            </div>
          ))}
        </section>
      </div>

      {/* Contact Form + Details */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[120px] pb-[100px]">
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-[60px] lg:gap-[100px] items-start">
          {/* Details */}
          <div className="bg-white p-[40px] md:p-[60px] rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-white">
            <h2 className="text-[32px] md:text-[40px] font-bold mb-[24px] text-brand-black font-brand tracking-tight">We would love to talk!</h2>
            <p className="text-[16px] text-[#666666] leading-[1.6] mb-[48px] font-medium font-sans">
              Got a question, feedback, or a business inquiry? Drop us a line. We are here to help make your snacking experience better!
            </p>
            <div className="space-y-[32px] text-[16px] text-brand-black font-bold font-sans">
              <div className="flex items-center gap-[16px]">
                <div className="w-[48px] h-[48px] bg-[#FBF5EB] rounded-full flex items-center justify-center shadow-sm">
                  <Phone size={20} className="text-brand-green" />
                </div>
                <div className="flex flex-col">
                  {settings.contact_phone.split(',').map((num, i) => (
                    <a key={i} href={`tel:${num.trim()}`} className="hover:text-brand-green transition-colors">{num.trim()}</a>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-[16px]">
                <div className="w-[48px] h-[48px] bg-[#FBF5EB] rounded-full flex items-center justify-center shadow-sm">
                  <Mail size={20} className="text-brand-green" />
                </div>
                <a href={`mailto:${settings.contact_email.trim()}`} className="hover:text-brand-green transition-colors">
                  {settings.contact_email.trim()}
                </a>
              </div>
              <div className="flex items-start gap-[16px]">
                <div className="w-[48px] h-[48px] bg-[#FBF5EB] rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                  <MapPin size={20} className="text-brand-green" />
                </div>
                <a 
                  href="https://share.google/4bpZne93ifNNwSOVl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-[12px] hover:text-brand-green transition-colors"
                >
                  {settings.contact_address}
                </a>
              </div>
            </div>
          </div>

          {/* Form */}
          {submitted ? (
             <div className="bg-[#EEFBDC] border border-[#1E8A38] rounded-[32px] p-[60px] text-center flex flex-col items-center justify-center h-full">
               <div className="w-[80px] h-[80px] bg-[#1E8A38] text-white rounded-full flex items-center justify-center text-[40px] mb-[24px]">✓</div>
               <h3 className="text-[32px] font-bold text-[#1E8A38] mb-[16px] font-brand tracking-tight">Message Sent!</h3>
               <p className="text-[18px] text-[#222222] font-medium">We'll get back to you within 24 hours.</p>
             </div>
          ) : (
            <div className="pt-[20px]">
              <form onSubmit={handleSubmit} className="space-y-[24px]">
                {errors.server && (
                  <div className="p-4 bg-brand-red/10 border border-brand-red/20 rounded-2xl text-brand-red text-[14px] font-bold">
                    {errors.server}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                  <div>
                    <label className="block text-[14px] font-bold mb-[8px] text-brand-black uppercase tracking-wider">First Name*</label>
                    <input 
                      value={form.firstName} 
                      onChange={(e) => { setForm({ ...form, firstName: e.target.value }); setErrors({ ...errors, firstName: '' }); }}
                      className={`w-full h-[56px] px-[20px] rounded-[16px] border ${errors.firstName ? 'border-[#D72638] bg-[#FFF5F6]' : 'border-[#CCCCCC] bg-white'} focus:border-brand-green focus:outline-none text-[16px] font-medium transition-colors shadow-sm`} 
                      placeholder="Your first name" 
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-bold mb-[8px] text-brand-black uppercase tracking-wider">Last Name*</label>
                    <input 
                      value={form.lastName} 
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })} 
                      className={`w-full h-[56px] px-[20px] rounded-[16px] border ${errors.lastName ? 'border-[#D72638] bg-[#FFF5F6]' : 'border-[#CCCCCC] bg-white'} focus:border-brand-green focus:outline-none text-[16px] font-medium transition-colors shadow-sm`}
                      placeholder="Your last name" 
                    />
                    {errors.lastName && <p className="text-[12px] text-[#D72638] font-bold mt-[8px]">{errors.lastName}</p>}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                  <div>
                    <label className="block text-[14px] font-bold mb-[8px] text-brand-black uppercase tracking-wider">Email*</label>
                    <input 
                      type="email" 
                      value={form.email} 
                      onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
                      className={`w-full h-[56px] px-[20px] rounded-[16px] border ${errors.email ? 'border-[#D72638] bg-[#FFF5F6]' : 'border-[#CCCCCC] bg-white'} focus:border-brand-green focus:outline-none text-[16px] font-medium transition-colors shadow-sm`} 
                      placeholder="your@email.com" 
                    />
                    {errors.email && <p className="text-[12px] text-[#D72638] font-bold mt-[8px]">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-[14px] font-bold mb-[8px] text-brand-black uppercase tracking-wider">Phone No.*</label>
                    <input 
                      type="tel" 
                      value={form.phone} 
                      onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                      className={`w-full h-[56px] px-[20px] rounded-[16px] border ${errors.phone ? 'border-[#D72638] bg-[#FFF5F6]' : 'border-[#CCCCCC] bg-white'} focus:border-brand-green focus:outline-none text-[16px] font-medium transition-colors shadow-sm`}
                      placeholder="Your phone number"
                    />
                    {errors.phone && <p className="text-[12px] text-[#D72638] font-bold mt-[8px]">{errors.phone}</p>}
                  </div>
                </div>
                
                <div>
                  <label className="block text-[14px] font-bold mb-[8px] text-brand-black uppercase tracking-wider">Subject*</label>
                  <input 
                    value={form.subject} 
                    onChange={(e) => { setForm({ ...form, subject: e.target.value }); setErrors({ ...errors, subject: '' }); }}
                    className={`w-full h-[56px] px-[20px] rounded-[16px] border ${errors.subject ? 'border-[#D72638] bg-[#FFF5F6]' : 'border-[#CCCCCC] bg-white'} focus:border-brand-green focus:outline-none text-[16px] font-medium transition-colors shadow-sm`} 
                    placeholder="What is this regarding?" 
                  />
                  {errors.subject && <p className="text-[12px] text-[#D72638] font-bold mt-[8px]">{errors.subject}</p>}
                </div>
                
                <div>
                  <label className="block text-[14px] font-bold mb-[8px] text-brand-black uppercase tracking-wider">Order Id (Optional)</label>
                  <input 
                    value={form.orderId} 
                    onChange={(e) => setForm({ ...form, orderId: e.target.value })} 
                    className="w-full h-[56px] px-[20px] rounded-[16px] border border-[#CCCCCC] bg-white focus:border-brand-green focus:outline-none text-[16px] font-medium transition-colors shadow-sm"
                    placeholder="If you have an order number" 
                  />
                </div>
                
                <div>
                  <label className="block text-[14px] font-bold mb-[8px] text-brand-black uppercase tracking-wider">Message</label>
                  <textarea 
                    value={form.message} 
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={4} 
                    maxLength={2000}
                    className={`w-full p-[20px] rounded-[16px] border ${errors.message ? 'border-[#D72638] bg-[#FFF5F6]' : 'border-[#CCCCCC] bg-white'} focus:border-brand-green focus:outline-none text-[16px] font-medium transition-colors shadow-sm resize-none`} 
                    placeholder="Write your message here..."
                  />
                  {errors.message && <p className="text-[12px] text-[#D72638] font-bold mt-[8px]">{errors.message}</p>}
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full h-[60px] bg-brand-green text-white rounded-full flex items-center justify-center gap-[12px] font-bold text-[18px] hover:bg-[#154617] disabled:opacity-70 transition-all shadow-[0_4px_16px_rgba(29,94,32,0.2)]"
                >
                  {loading ? <Loader2 size={24} className="animate-spin" /> : <ArrowRight size={24} />}
                  {loading ? 'Sending...' : 'Submit Message'}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

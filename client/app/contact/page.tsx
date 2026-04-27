'use client';
import { useState } from 'react';
import { Phone, Mail, MapPin, ArrowRight, HelpCircle, RefreshCw, Truck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { submitEnquiry } from '@/lib/api';

const helpCards = [
  { icon: HelpCircle, title: 'Support', desc: 'Already purchased and have a question about your product? Try our FAQs.', cta: 'FAQs', href: '/faqs' },
  { icon: RefreshCw, title: 'Returns', desc: 'We understand things don\'t always work out. Visit our returns policy for more.', cta: 'Return Policy', href: '/policies' },
  { icon: Truck, title: 'Shipping', desc: 'Need an idea on how long delivery may take, see our policy?', cta: 'Shipping Policy', href: '/policies' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', subject: '', orderId: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.firstName) errs.firstName = 'Required';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required';
    if (!form.subject) errs.subject = 'Required';
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

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-[#FCF9F2] py-[80px] text-center w-full">
        <p className="text-[16px] font-bold text-brand-green uppercase tracking-widest mb-[16px] font-sans">Contact Us</p>
        <h1 className="text-[40px] md:text-[64px] font-bold text-brand-black font-brand tracking-tight">How can we help?</h1>
      </div>

      {/* Help Cards */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[120px] py-[60px] md:py-[80px] grid md:grid-cols-3 gap-[24px]">
        {helpCards.map(({ icon: Icon, title, desc, cta, href }) => (
          <div key={title} className="bg-white border border-[#EAEAEA] rounded-[24px] p-[40px] flex flex-col items-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-brand-green transition-colors">
            <div className="w-[64px] h-[64px] bg-[#EEFBDC] rounded-full flex items-center justify-center mb-[24px]">
              <Icon size={28} className="text-brand-green" />
            </div>
            <h3 className="text-[24px] font-bold mb-[16px] text-brand-black font-sans">{title}</h3>
            <p className="text-[16px] text-[#666666] mb-[32px] leading-[1.6] font-medium font-sans">{desc}</p>
            <Link href={href} className="inline-flex items-center gap-[8px] border-2 border-brand-green text-brand-green font-bold px-[24px] py-[12px] rounded-full hover:bg-brand-green hover:text-white transition-all text-[15px]">
              {cta} <ArrowRight size={16} />
            </Link>
          </div>
        ))}
      </section>

      {/* Contact Form + Details */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[120px] pb-[100px]">
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-[60px] lg:gap-[100px] items-start">
          {/* Details */}
          <div className="bg-[#FCF9F2] p-[40px] md:p-[60px] rounded-[32px]">
            <h2 className="text-[32px] md:text-[40px] font-bold mb-[24px] text-brand-black font-brand tracking-tight">We would love to talk!</h2>
            <p className="text-[16px] text-[#666666] leading-[1.6] mb-[48px] font-medium font-sans">
              Got a question, feedback, or a business inquiry? Drop us a line. We are here to help make your snacking experience better!
            </p>
            <div className="space-y-[32px] text-[16px] text-brand-black font-bold font-sans">
              <div className="flex items-center gap-[16px]">
                <div className="w-[48px] h-[48px] bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Phone size={20} className="text-brand-green" />
                </div>
                <span>96262425 , 9375 6546</span>
              </div>
              <div className="flex items-center gap-[16px]">
                <div className="w-[48px] h-[48px] bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Mail size={20} className="text-brand-green" />
                </div>
                <span>katariavibhor9@gmail.com</span>
              </div>
              <div className="flex items-start gap-[16px]">
                <div className="w-[48px] h-[48px] bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                  <MapPin size={20} className="text-brand-green" />
                </div>
                <span className="mt-[12px]">B-291, MIG Flats, East of Loni road, Delhi, Delhi – 110093, India</span>
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
                      className="w-full h-[56px] px-[20px] rounded-[16px] border border-[#CCCCCC] bg-white focus:border-brand-green focus:outline-none text-[16px] font-medium transition-colors shadow-sm"
                      placeholder="Your last name" 
                    />
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
                      className="w-full h-[56px] px-[20px] rounded-[16px] border border-[#CCCCCC] bg-white focus:border-brand-green focus:outline-none text-[16px] font-medium transition-colors shadow-sm"
                      placeholder="Your phone number"
                    />
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
                    className="w-full p-[20px] rounded-[16px] border border-[#CCCCCC] bg-white focus:border-brand-green focus:outline-none text-[16px] font-medium transition-colors shadow-sm resize-none" 
                    placeholder="Write your message here..."
                  />
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

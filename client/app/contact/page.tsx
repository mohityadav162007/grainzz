'use client';
import { useState } from 'react';
import { Phone, Mail, MapPin, ArrowRight, HelpCircle, RefreshCw, Truck, Loader2 } from 'lucide-react';
import Link from 'next/link';

const helpCards = [
  { icon: HelpCircle, title: 'Support', desc: 'Already purchased and have a question about your product? Try our FAQs.', cta: 'FAQs', href: '/faqs' },
  { icon: RefreshCw, title: 'Returns', desc: 'We understand things don\'t always work out. Visit our returns policy for more.', cta: 'Return Policy', href: '/policies/return-exchange' },
  { icon: Truck, title: 'Shipping', desc: 'Need an idea on how long delivery may take, see our policy?', cta: 'Shipping Policy', href: '/policies/shipping' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', subject: '', orderId: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.firstName) errs.firstName = 'Required';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'email not valid';
    if (!form.subject) errs.subject = 'Required';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000)); // simulate submission
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-cream py-12 text-center">
        <p className="text-sm font-semibold text-primary mb-2">Contact Us</p>
        <h1 className="text-3xl md:text-4xl font-black text-text-main">How can we help?</h1>
      </div>

      {/* Help Cards */}
      <section className="max-w-4xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-4">
        {helpCards.map(({ icon: Icon, title, desc, cta, href }) => (
          <div key={title} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center text-center card-shadow">
            <div className="w-12 h-12 bg-cream rounded-full flex items-center justify-center mb-4">
              <Icon size={22} className="text-primary" />
            </div>
            <h3 className="font-bold mb-2">{title}</h3>
            <p className="text-sm text-text-muted mb-4 leading-relaxed">{desc}</p>
            <Link href={href} className="btn-outline text-xs py-2">
              {cta} <ArrowRight size={12} />
            </Link>
          </div>
        ))}
      </section>

      {/* Contact Form + Details */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Details */}
          <div>
            <h2 className="text-2xl font-black mb-4">We would love to talk!</h2>
            <p className="text-sm text-text-muted leading-relaxed mb-6">
              Lorem ipsum dolor sit amet consectetur. Feugiat massa turpis phasellus ut nisi vel ultrices faucibus.
              Id tempus mollis eget nec sapien at ultrices.
            </p>
            <div className="space-y-3 text-sm text-text-muted">
              <div className="flex items-center gap-2"><Phone size={16} className="text-primary" /> 96262425 , 9375 6546</div>
              <div className="flex items-center gap-2"><Mail size={16} className="text-primary" /> katariavibhor9@gmail.com</div>
              <div className="flex items-start gap-2"><MapPin size={16} className="text-primary mt-0.5" /> B-291, MIG Flats, East of Loni road, Delhi, Delhi – 110093, India</div>
            </div>
          </div>

          {/* Form */}
          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="font-bold text-green-700 mb-2">Message Sent!</h3>
              <p className="text-sm text-text-muted">We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 card-shadow">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">First Name*</label>
                  <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className={`input-field ${errors.firstName ? 'border-accent' : ''}`} placeholder="Val" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Last Name*</label>
                  <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Email*</label>
                  <input type="email" value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
                    className={`input-field ${errors.email ? 'border-accent' : ''}`} placeholder="Val" />
                  {errors.email && <p className="text-xs text-accent mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Phone No.*</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Subject*</label>
                <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className={`input-field ${errors.subject ? 'border-accent' : ''}`} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Order Id</label>
                <input value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Message</label>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={3} className="input-field resize-none" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {loading ? 'Sending...' : 'Submit'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    q: 'What makes Grainzz different from regular snacks?',
    a: 'Most snacks are deep fried and made from refined flour instead of real food ingredients. At Grainzz, we do things differently. We use ancient Indian supergrains like Jowar, Ragi, and Quinoa, and we slow-roast them instead of frying. This gives you the same satisfying crunch with zero palm oil, zero trans fat, and way more nutrition.',
  },
  {
    q: 'Are Grainzz products suitable for kids and elderly?',
    a: 'Yes! Our products are made with wholesome ingredients, no artificial colors, and minimal preservatives, making them a great snacking option for all age groups.',
  },
  {
    q: 'How long will it take for my snacks to arrive?',
    a: 'We typically dispatch orders within 1-2 business days and delivery takes 3-5 business days across India.',
  },
  {
    q: 'Do you offer Free Shipping?',
    a: 'Yes! We offer free shipping on orders above ₹499. Below that, a nominal shipping charge applies.',
  },
  {
    q: 'Do you deliver to my city?',
    a: 'We ship PAN India! If you can receive a courier at your address, we can deliver Grainzz to you.',
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4 lg:px-8">
        <h2 className="section-title mb-10">Frequently asked questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-cream transition-colors"
              >
                <span className="text-sm font-semibold text-text-main">{faq.q}</span>
                <span className="flex-shrink-0 ml-4">
                  {open === i ? <Minus size={16} className="text-primary" /> : <Plus size={16} className="text-text-muted" />}
                </span>
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <p className="text-sm text-text-muted leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

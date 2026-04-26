'use client';
import { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import { getFaqs } from '@/lib/api';

const fallbackFaqs = [
  {
    question: 'What makes Grainzz different from regular snacks?',
    answer: 'Most snacks are deep fried and made from refined flour. At Grainzz, we use supergrain ingredients like ragi, bajra, quinoa and jowar — and we never use palm oil. Our snacks are crafted to be lighter, cleaner, and better for you without compromising on flavour or crunch.',
  },
  {
    question: 'Are Grainzz snacks actually healthy?',
    answer: 'Yes! Grainzz snacks are a better alternative to junk food. Made from real millets and grains, they offer a cleaner calorie profile with higher fibre, zero cholesterol, and no palm oil. They\'re not diet food — they\'re smarter snacking.',
  },
  {
    question: 'Which combo should I try first?',
    answer: 'We recommend The Supergrain Starter Box — it includes our top 4 jar flavours plus 3 free puffed rice packets (Tandoori Masala, Royal Mint Blast, Creamy Onion Bliss). It\'s the best way to experience everything Grainzz has to offer.',
  },
  {
    question: 'How long does delivery take?',
    answer: 'Orders are typically delivered within 3 to 6 working days across India. We ship PAN India and you\'ll receive tracking details once your order is dispatched.',
  },
  {
    question: 'Do you offer free shipping?',
    answer: 'Yes! We offer free shipping on orders above ₹499. Below that, a nominal shipping charge applies.',
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);
  const [faqs, setFaqs] = useState(fallbackFaqs);

  useEffect(() => {
    getFaqs()
      .then((data) => {
        if (data.length > 0) {
          setFaqs(data.map((f: any) => ({ question: f.question, answer: f.answer })));
        }
      })
      .catch(() => {});
  }, []);

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
                <span className="text-sm font-semibold text-text-main">{faq.question}</span>
                <span className="flex-shrink-0 ml-4">
                  {open === i ? <Minus size={16} className="text-primary" /> : <Plus size={16} className="text-text-muted" />}
                </span>
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <p className="text-sm text-text-muted leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

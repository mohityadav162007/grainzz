'use client';
import { useState, useEffect } from 'react';
import { getFaqs } from '@/lib/api';

const fallbackFaqs = [
  {
    question: 'What makes Grainzz different from regular snacks?',
    answer: 'Most snacks are deep-fried in palm oil and made from refined flour (maida). At Grainzz, we do things differently. We use ancient Indian supergrains like Jowar, Ragi, and Quinoa, and we slow-roast them instead of frying. This gives you the same satisfying crunch with zero palm oil, zero trans fat, and way more nutrition.',
  },
  {
    question: 'Are Grainzz products suitable for kids and elderly?',
    answer: 'Yes! Grainzz snacks are an excellent alternative to junk food. Made from real millets and grains, they offer high dietary fibre and essential nutrients suitable for all age groups.',
  },
  {
    question: 'How long will it take for my snacks to arrive?',
    answer: 'Orders are typically processed within 24 hours. Depending on your location, delivery usually takes between 3 to 5 business days.',
  },
  {
    question: 'Do you offer Free Shipping?',
    answer: 'Yes, we offer free shipping on all orders above ₹499.',
  },
  {
    question: 'Do you deliver to my city?',
    answer: 'We currently deliver to over 29 states and thousands of pin codes across India, directly to your doorstep!',
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);
  const [faqs, setFaqs] = useState(fallbackFaqs);

  useEffect(() => {
    getFaqs()
      .then((data) => {
        if (data && data.length > 0) {
          setFaqs(data.map((f: any) => ({ question: f.question, answer: f.answer })));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-[80px] bg-white w-full">
      <div className="max-w-[760px] mx-auto px-4 md:px-0">
        <h2 className="text-[28px] md:text-[36px] font-semibold text-center text-[#1A1A1A] mb-[40px] tracking-tight font-sans">
          Frequently asked questions
        </h2>
        
        <div className="flex flex-col gap-4">
          {faqs.map((faq, i) => (
            <div key={i} className="w-full border border-[#F2F2F2] rounded-[10px] bg-white overflow-hidden shadow-sm transition-all duration-300">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer border-none bg-transparent"
                aria-expanded={open === i}
              >
                <span className="text-[16px] md:text-[17px] font-semibold text-[#1A1A1A] font-sans pr-4">
                  {faq.question}
                </span>
                <span className="text-[20px] font-light text-[#1A1A1A]">
                  {open === i ? '−' : '+'}
                </span>
              </button>
              
              {open === i && (
                <div className="pb-6 px-6 animate-fade-in">
                  <p className="text-[14px] text-[#7A7A7A] font-medium leading-[1.6] font-sans">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

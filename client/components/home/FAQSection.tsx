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
    <section className="py-[40px] md:py-[80px] bg-[#F7F7F7]">
      <div className="max-w-[800px] mx-auto px-4 lg:px-8">
        <h2 className="text-[28px] md:text-[40px] font-bold text-center text-brand-black mb-[32px] md:mb-[48px] leading-tight">
          Frequently asked questions
        </h2>
        
        <div className="flex flex-col gap-[12px] md:gap-[16px]">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white border border-[#E4E4E4] rounded-[12px] md:rounded-[16px] overflow-hidden shadow-sm hover:border-brand-green/30 transition-colors">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-[16px] py-[16px] md:px-[24px] md:py-[24px] text-left transition-colors group"
                aria-expanded={open === i}
              >
                <span className={`text-[16px] md:text-[18px] font-bold transition-colors ${open === i ? 'text-brand-green' : 'text-brand-black group-hover:text-brand-green'}`}>
                  {faq.question}
                </span>
                <span className={`flex-shrink-0 ml-[16px] md:ml-[24px] w-[28px] h-[28px] md:w-[32px] md:h-[32px] rounded-full flex items-center justify-center transition-colors ${open === i ? 'bg-brand-light text-brand-green' : 'bg-[#F7F7F7] text-[#6B6B6B] group-hover:bg-brand-light group-hover:text-brand-green'}`}>
                  {open === i ? <Minus size={16} className="md:w-[18px] md:h-[18px]" strokeWidth={2.5} /> : <Plus size={16} className="md:w-[18px] md:h-[18px]" strokeWidth={2.5} />}
                </span>
              </button>
              
              {open === i && (
                <div className="px-[16px] pb-[16px] md:px-[24px] md:pb-[24px] animate-fade-in">
                  <p className="text-[14px] md:text-[16px] text-[#6B6B6B] leading-[1.6] pt-[4px] md:pt-[4px] border-t border-[#E4E4E4]/50 mt-[8px]">
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

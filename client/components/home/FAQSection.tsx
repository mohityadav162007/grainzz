'use client';
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQS = [
  {
    question: "What makes Grainzz different from regular snacks?",
    answer: "Most snacks are deep-fried in palm oil and made from refined flour (maida). At Grainzz, we do things differently. We use ancient Indian supergrains like Jowar, Ragi, and Quinoa, and we slow-roast them instead of frying. This gives you the same satisfying crunch with zero palm oil, zero trans fat, and way more nutrition."
  },
  {
    question: "Are Grainzz products suitable for kids and elderly?",
    answer: "Absolutely! Our snacks are made from wholesome supergrains and are roasted, not fried. They are easy to digest, packed with nutrients, and free from harmful additives, making them perfect for all age groups."
  },
  {
    question: "How long will it take for my snacks to arrive?",
    answer: "Typically, orders are processed within 24-48 hours. Shipping usually takes 3-5 business days depending on your location within India."
  },
  {
    question: "Do you offer Free Shipping?",
    answer: "Yes, we offer free shipping on all orders above ₹499. For orders below this amount, a nominal shipping fee is applied at checkout."
  },
  {
    question: "Do you deliver to my city?",
    answer: "We deliver across almost all pincodes in India. You can verify delivery for your specific location by entering your pincode on any product page."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-[60px] md:py-[100px] bg-white w-full">
      <div className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[100px]">
        
        <h2 className="text-[32px] md:text-[40px] font-bold text-center text-[#1A1A1A] mb-[40px] md:mb-[60px] tracking-tight">
          Frequently asked questions
        </h2>

        <div className="max-w-[1000px] mx-auto flex flex-col gap-4">
          {FAQS.map((faq, idx) => (
            <div 
              key={idx} 
              className="border border-[#EAEAEA] rounded-[16px] overflow-hidden transition-all duration-300 hover:shadow-sm"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between p-6 md:p-8 text-left group"
              >
                <span className="text-[16px] md:text-[18px] font-bold text-[#1A1A1A] pr-8 group-hover:text-brand-green transition-colors">
                  {faq.question}
                </span>
                <div className="shrink-0 text-[#1A1A1A]">
                  {openIndex === idx ? (
                    <Minus size={20} strokeWidth={2.5} />
                  ) : (
                    <Plus size={20} strokeWidth={2.5} />
                  )}
                </div>
              </button>

              <div 
                className={`transition-all duration-300 ease-in-out ${
                  openIndex === idx ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 md:px-8 pb-6 md:pb-8">
                  <p className="text-[14px] md:text-[15px] leading-[1.6] text-[#666666] font-medium max-w-[800px]">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

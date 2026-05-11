'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Plus, Minus, ArrowRight } from 'lucide-react';

import { FAQS } from '@/lib/faqs';

export default function FAQSection({ 
  full = false, 
  variant = 'default' 
}: { 
  full?: boolean;
  variant?: 'default' | 'page';
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const displayedFaqs = full ? FAQS : FAQS.slice(0, 5);
  const isPage = variant === 'page';

  return (
    <section className={`py-[60px] md:py-[100px] w-full ${isPage ? 'bg-[#FBF5EB]' : 'bg-white'}`}>
      <div className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[100px]">
        
        {isPage ? (
          <div className="text-center mb-[60px]">
            <p className="text-[16px] font-bold text-brand-green uppercase tracking-widest mb-[16px] font-sans">FAQs</p>
            <h1 className="text-[32px] md:text-[56px] font-bold text-brand-black font-brand tracking-tight leading-[1.1]">
              Answers to your most <br className="hidden md:block" /> commonly asked questions
            </h1>
          </div>
        ) : (
          <h2 className="text-[32px] md:text-[40px] font-bold text-center text-[#1A1A1A] mb-[40px] md:mb-[60px] tracking-tight">
            Frequently asked questions
          </h2>
        )}

        <div className="max-w-[1000px] mx-auto flex flex-col gap-4">
          {displayedFaqs.map((faq, idx) => (
            <div
              key={idx}
              className={`transition-all duration-300 ${
                isPage 
                  ? 'bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-transparent' 
                  : 'border border-[#EAEAEA] rounded-[16px]'
              } overflow-hidden hover:shadow-md`}
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between p-6 md:p-8 text-left group"
              >
                <span className={`text-[16px] md:text-[18px] font-bold text-[#1A1A1A] pr-8 group-hover:text-brand-green transition-colors ${isPage ? 'font-sans' : ''}`}>
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
                className={`transition-all duration-300 ease-in-out ${openIndex === idx ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
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

        {!full && (
          <div className="mt-[48px] flex justify-center">
            <Link 
              href="/faqs" 
              className="inline-flex items-center gap-[12px] text-brand-green font-bold hover:gap-[16px] transition-all group"
            >
              <span className="text-[16px] md:text-[18px]">View All FAQs</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}

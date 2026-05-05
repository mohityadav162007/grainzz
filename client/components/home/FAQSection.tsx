'use client';
import { useState, useEffect } from 'react';
import { getFaqs } from '@/lib/api';

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);
  const [faqs, setFaqs] = useState<any[] | null>(null); // null = loading

  useEffect(() => {
    let cancelled = false;
    getFaqs()
      .then((data) => {
        if (cancelled) return;
        setFaqs(data && data.length > 0 ? data.map((f: any) => ({ question: f.question, answer: f.answer })) : []);
      })
      .catch(() => { if (!cancelled) setFaqs([]); });
    return () => { cancelled = true; };
  }, []);

  // Loading — skeleton
  if (faqs === null) {
    return (
      <section className="py-[80px] bg-white w-full">
        <div className="max-w-[760px] mx-auto px-4 md:px-0">
          <div className="h-10 w-80 bg-gray-100 rounded-lg mx-auto mb-[40px] animate-pulse" />
          <div className="flex flex-col gap-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="w-full border border-[#F2F2F2] rounded-[10px] bg-white overflow-hidden shadow-sm px-6 py-5">
                <div className="h-5 bg-gray-100 rounded w-3/4 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // No FAQs
  if (faqs.length === 0) return null;

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

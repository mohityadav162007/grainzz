'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { getHeroSlides } from '@/lib/api';

const fallbackSlides = [
  {
    top_line: 'Upto 40% OFF',
    headline: 'Power of Real Grainz\nfor better gainzz.',
    subheadline: 'Get the power packed shakti of ragi, bajra and jowar\nnow in snack form.',
    cta_text: 'Buy Now',
    cta_href: '/products',
    image_url: '/Slider-Background@2x.png'
  },
  {
    top_line: 'Upto 40% OFF',
    headline: 'Power of Real Grainz\nfor better gainzz.',
    subheadline: 'Get the power packed shakti of ragi, bajra and jowar\nnow in snack form.',
    cta_text: 'Buy Now',
    cta_href: '/products',
    image_url: '/Slider-Background@2x.png'
  },
  {
    top_line: 'Upto 40% OFF',
    headline: 'Power of Real Grainz\nfor better gainzz.',
    subheadline: 'Get the power packed shakti of ragi, bajra and jowar\nnow in snack form.',
    cta_text: 'Buy Now',
    cta_href: '/products',
    image_url: '/Slider-Background@2x.png'
  },
];

interface HeroSlide {
  id?: string;
  image_url?: string;
  top_line: string;
  headline: string;
  subheadline: string;
  cta_text: string;
  cta_href: string;
}

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState<HeroSlide[]>(fallbackSlides);

  useEffect(() => {
    getHeroSlides()
      .then((data) => {
        if (data && data.length > 0) setSlides(data);
      })
      .catch(() => {});
  }, []);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(nextSlide, 3000);
    return () => clearInterval(timer);
  }, [nextSlide, slides.length]);

  const slide = slides[current];

  return (
    <section className="w-full flex justify-center flex-col items-center">
      <div 
        className="w-full h-[320px] md:h-[540px] lg:h-[600px] relative flex flex-col items-center justify-center overflow-hidden bg-[#2D0000] animate-fade-in"
        key={current}
        style={{
          background: slide.image_url 
            ? `url(${slide.image_url}) left center/cover no-repeat`
            : undefined,
        }}
      >
        <div className="w-full max-w-[1440px] px-[20px] md:px-[60px] lg:px-[100px] h-full flex items-center justify-end">
          {/* Content Block - Exactly matching Figma text and positioning */}
          <div className="w-full md:w-[50%] flex flex-col items-start gap-[12px] md:gap-[20px] animate-fade-in pl-0 md:pl-[40px] pt-[20px] md:pt-[40px]">
            
            <h3 className="m-0 text-[13px] md:text-[18px] font-bold font-sans text-white tracking-wide uppercase">
              {slide.top_line}
            </h3>
            
            <h1 className="m-0 text-[32px] md:text-[52px] leading-[1.1] font-bold font-sans text-white tracking-[-0.02em] whitespace-pre-line">
              {slide.headline}
            </h1>
            
            <p className="m-0 text-[14px] md:text-[18px] leading-[1.5] font-medium font-sans text-white max-w-[480px] whitespace-pre-line">
              {slide.subheadline}
            </p>

            <Link
              href={slide.cta_href}
              className="mt-[8px] md:mt-[16px] inline-flex items-center justify-between gap-[16px] md:gap-[24px] bg-white text-brand-black pl-[24px] md:pl-[28px] pr-[6px] md:pr-[8px] py-[6px] md:py-[8px] rounded-[40px] transition-transform hover:scale-[1.03] active:scale-95 group pointer-events-auto shadow-sm"
            >
              <span className="font-bold text-[15px] md:text-[18px] leading-[1] capitalize mt-[2px]">{slide.cta_text}</span>
              <div className="w-[32px] h-[32px] md:w-[38px] md:h-[38px] bg-brand-green rounded-full flex items-center justify-center text-white transition-colors group-hover:bg-[#154617]">
                <ArrowRight size={18} strokeWidth={2.5} className="ml-[2px]" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Indicators below the image */}
      {slides.length > 1 && (
        <div className="w-full bg-white flex items-center justify-center py-[24px]">
          <div className="flex items-center gap-[12px]">
             <button onClick={prevSlide} className="text-[#A1A1A1] hover:text-[#222222] transition-colors bg-transparent border-none">
               <ChevronLeft size={20} strokeWidth={3} />
             </button>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all rounded-full border-none cursor-pointer ${
                  i === current 
                    ? 'w-[32px] md:w-[40px] h-[8px] md:h-[8px] bg-[#1a5b23] shadow-sm' 
                    : 'w-[8px] md:w-[8px] h-[8px] md:h-[8px] bg-[#E0E0E0] hover:bg-[#888888]'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
             <button onClick={nextSlide} className="text-[#A1A1A1] hover:text-[#222222] transition-colors bg-transparent border-none">
               <ChevronRight size={20} strokeWidth={3} />
             </button>
          </div>
        </div>
      )}
    </section>
  );
}

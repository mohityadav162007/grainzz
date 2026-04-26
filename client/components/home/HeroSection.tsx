'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getHeroSlides } from '@/lib/api';

const fallbackSlides = [
  {
    top_line: 'Up to 40% OFF',
    headline: 'Power of Real Grains\nfor Better Snacking',
    subheadline: 'Discover bold, light and satisfying snacks made with millets, real ingredients and no palm oil.',
    cta_text: 'Shop Bestsellers',
    cta_href: '/products',
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
        if (data.length > 0) setSlides(data);
      })
      .catch(() => {});
  }, []);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, slides.length]);

  const slide = slides[current];

  return (
    <section className="w-full bg-[#FFFFFF] flex justify-center pb-[24px]">
      <div 
        className="w-full max-w-[1440px] h-[590px] md:h-[579px] relative md:mt-[24px] overflow-hidden md:mx-[80px] md:rounded-tr-[145px]"
        style={{
          background: slide.image_url 
            ? `linear-gradient(89.96deg, rgba(238, 251, 220, 0.95) 10%, rgba(238, 251, 220, 0.6) 45%, rgba(238, 251, 220, 0) 70%), url(${slide.image_url}) center/cover no-repeat`
            : `linear-gradient(89.96deg, rgba(238, 251, 220, 1) 0%, rgba(238, 251, 220, 0.5) 100%)`,
        }}
      >
        <div className="absolute inset-0 flex items-center px-4 md:px-[60px]">
          {/* Left / Text Content matching Figma Metrics */}
          <div className="w-full max-w-[600px] animate-fade-in" key={current}>
            
            <div className="mb-4 md:mb-6 flex">
              <span className="bg-brand-red text-white text-[16px] md:text-[22px] font-semibold px-4 py-1.5 md:px-6 md:py-2 rounded-full inline-flex tracking-tight">
                {slide.top_line}
              </span>
            </div>

            <h1 className="text-[36px] md:text-[54px] font-bold text-brand-black leading-[1.1] mb-4 md:mb-6 whitespace-pre-line tracking-tight">
              {slide.headline}
            </h1>

            <p className="text-[16px] md:text-[22px] font-normal text-brand-black mb-8 md:mb-10 max-w-lg leading-[1.4]">
              {slide.subheadline}
            </p>

            {/* CTA Button */}
            <Link
              href={slide.cta_href}
              className="inline-flex items-center gap-2 md:gap-3 bg-brand-green hover:bg-[#154617] text-white px-2 py-2 rounded-full transition-all group shadow-lg"
            >
              <span className="text-[16px] md:text-[18px] font-semibold pl-4 md:pl-6 pr-1 md:pr-2 tracking-wide">
                {slide.cta_text}
              </span>
              <div className="w-[36px] h-[36px] md:w-[45px] md:h-[45px] bg-white rounded-full flex items-center justify-center text-brand-green group-hover:bg-[#EEFBDC] transition-colors">
                <ChevronRight size={20} strokeWidth={3} className="md:w-6 md:h-6" />
              </div>
            </Link>
          </div>
        </div>

        {/* Carousel Interactors */}
        {slides.length > 1 && (
          <div className="absolute bottom-6 left-4 md:bottom-8 md:left-[60px] flex gap-2 md:gap-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-[36px] md:w-[45px] h-[6px] md:h-[8px] rounded-full transition-all ${
                  i === current ? 'bg-brand-green w-[60px] md:w-[80px]' : 'bg-brand-green/30'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

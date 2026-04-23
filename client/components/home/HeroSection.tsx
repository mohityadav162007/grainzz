'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const slides = [
  {
    badge: 'Upto 40% OFF',
    title: 'Power of Real Grainz\nfor better gainzz.',
    subtitle: 'Get the power packed shakti of ragi, bajra and jowar now in snack form.',
    cta: 'Buy Now',
    ctaHref: '/products',
  },
  {
    badge: 'New Arrivals',
    title: 'Healthy Never\nTasted This Good.',
    subtitle: 'Roasted, not deep-fried. Packed with supergrains that fuel your day.',
    cta: 'Shop Now',
    ctaHref: '/products',
  },
  {
    badge: 'Best Sellers',
    title: 'Snack Smart,\nSnack Grainzz.',
    subtitle: 'India\'s favourite guilt-free snacks made from real ancient grains.',
    cta: 'Explore',
    ctaHref: '/products',
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const slide = slides[current];

  return (
    <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #3D2517 0%, #5A3825 30%, #7A4E33 60%, #5A3825 100%)' }}>
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/3 rounded-full blur-3xl" />
        {/* Grain texture overlay */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.05) 0%, transparent 60%)' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[360px] md:min-h-[420px]">
          {/* Left — Product Display */}
          <div className="hidden md:flex items-center justify-center relative">
            {/* Product jar mockups */}
            <div className="relative w-full max-w-md">
              <div className="flex items-end justify-center gap-3 relative">
                {/* Left product */}
                <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-4 w-36 h-48 flex items-center justify-center transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                  <div className="w-24 h-36 bg-gradient-to-b from-green-400/80 to-green-600/80 rounded-xl flex flex-col items-center justify-center text-white text-center shadow-lg">
                    <span className="text-[8px] font-bold tracking-wider mb-1 opacity-80">VITALICIOUS</span>
                    <span className="font-brand text-sm font-black tracking-tight">GRAIN<span className="text-yellow-300">ZZ</span></span>
                    <div className="w-10 h-10 bg-white/20 rounded-full mt-2" />
                    <span className="text-[7px] mt-1 opacity-70">QUINOA PUFFS</span>
                  </div>
                </div>

                {/* Center product (main, taller) */}
                <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-4 w-40 h-56 flex items-center justify-center z-10 transform scale-105 hover:scale-110 transition-transform duration-500">
                  <div className="w-28 h-44 bg-gradient-to-b from-green-500/90 to-green-700/90 rounded-xl flex flex-col items-center justify-center text-white text-center shadow-xl">
                    <span className="text-[8px] font-bold tracking-wider mb-1 opacity-80">VITALICIOUS</span>
                    <span className="font-brand text-lg font-black tracking-tight">GRAIN<span className="text-yellow-300">ZZ</span></span>
                    <div className="w-12 h-12 bg-white/20 rounded-full mt-2" />
                    <span className="text-[8px] mt-1 opacity-70">OATS CHIPS</span>
                    <span className="text-[7px] opacity-60">Peri Peri</span>
                  </div>
                </div>

                {/* Right product */}
                <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-4 w-36 h-48 flex items-center justify-center transform rotate-6 hover:rotate-0 transition-transform duration-500">
                  <div className="w-24 h-36 bg-gradient-to-b from-green-400/80 to-green-600/80 rounded-xl flex flex-col items-center justify-center text-white text-center shadow-lg">
                    <span className="text-[8px] font-bold tracking-wider mb-1 opacity-80">VITALICIOUS</span>
                    <span className="font-brand text-sm font-black tracking-tight">GRAIN<span className="text-yellow-300">ZZ</span></span>
                    <div className="w-10 h-10 bg-white/20 rounded-full mt-2" />
                    <span className="text-[7px] mt-1 opacity-70">BAJRA CHIPS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Text Content */}
          <div className="text-white animate-fade-in" key={current}>
            {/* Badge */}
            <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wide">
              {slide.badge}
            </span>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-4 whitespace-pre-line">
              {slide.title}
            </h1>

            {/* Subtitle */}
            <p className="text-white/70 text-sm md:text-base mb-6 max-w-md leading-relaxed">
              {slide.subtitle}
            </p>

            {/* CTA */}
            <Link
              href={slide.ctaHref}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-600 text-white px-7 py-3.5 rounded-full font-semibold text-sm transition-all duration-200 active:scale-95 shadow-lg shadow-primary/30"
            >
              {slide.cta}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="ml-1">
                <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="flex gap-2 justify-center mt-8 md:mt-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`hero-dot ${i === current ? 'active' : 'inactive'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

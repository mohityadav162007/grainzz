'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getHeroSlides } from '@/lib/api';

interface HeroSlide {
  id?: string;
  image_url?: string;
  mobile_image_url?: string;
  redirect_type?: string;
  redirect_value?: string;
  is_active?: boolean;
}

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState<HeroSlide[] | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Prevent hydration mismatch — only check window after mount
  useEffect(() => { setMounted(true); }, []);

  const isMobile = useMemo(() => {
    if (!mounted) return false;
    return window.innerWidth < 768;
  }, [mounted]);

  // Re-check on resize
  const [windowWidth, setWindowWidth] = useState(0);
  useEffect(() => {
    if (!mounted) return;
    setWindowWidth(window.innerWidth);
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [mounted]);

  const isMobileActual = windowWidth < 768;

  // Fetch slides once
  useEffect(() => {
    let cancelled = false;
    getHeroSlides()
      .then((data) => {
        if (cancelled) return;
        setSlides(data && data.length > 0 ? data : []);
      })
      .catch(() => { if (!cancelled) setSlides([]); });
    return () => { cancelled = true; };
  }, []);

  const slideCount = slides?.length || 0;

  const nextSlide = useCallback(() => {
    if (slideCount <= 1) return;
    setCurrent((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const prevSlide = useCallback(() => {
    if (slideCount <= 1) return;
    setCurrent((prev) => (prev === 0 ? slideCount - 1 : prev - 1));
  }, [slideCount]);

  // Auto-advance
  useEffect(() => {
    if (slideCount <= 1) return;
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [nextSlide, slideCount]);

  const handleSlideClick = useCallback((slide: HeroSlide) => {
    const type = slide.redirect_type || 'page';
    const value = slide.redirect_value || (slide as any).cta_href || '/products';
    if (!value) return;
    const url = type === 'product' ? `/products/${value}` : value;
    router.push(url);
  }, [router]);

  // Loading state — data not fetched yet
  if (slides === null) {
    return (
      <section className="w-full">
        <div className="w-full h-[400px] md:h-[540px] lg:h-[600px] bg-[#F5F5F0] animate-pulse" />
      </section>
    );
  }

  // No slides in DB
  if (slides.length === 0) return null;

  const slide = slides[current];
  const bgImage = isMobileActual
    ? (slide.mobile_image_url || slide.image_url)
    : slide.image_url;

  return (
    <section className="w-full flex justify-center flex-col items-center">
      <div
        className="w-full h-[400px] md:h-[540px] lg:h-[600px] relative flex flex-col overflow-hidden bg-[#F5F5F0] cursor-pointer"
        onClick={() => handleSlideClick(slide)}
        style={{
          background: bgImage
            ? `url(${bgImage}) center center/cover no-repeat`
            : undefined,
        }}
      />

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

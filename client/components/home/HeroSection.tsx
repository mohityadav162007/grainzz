'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getHeroSlides } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroSlide {
  id?: string;
  image_url?: string;
  mobile_image_url?: string;
  redirect_type?: string;
  redirect_value?: string;
  is_active?: boolean;
}

// Direction-aware variants are defined inside the component

export default function HeroSection() {
  const [[page, direction], setPage] = useState([0, 0]);
  const current = page;

  const [slides, setSlides] = useState<HeroSlide[] | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Prevent hydration mismatch — only check window after mount
  useEffect(() => { setMounted(true); }, []);

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

  const paginate = useCallback((newDirection: number) => {
    if (slideCount <= 1) return;
    setPage(([prevPage]) => {
      let nextPage = prevPage + newDirection;
      if (nextPage < 0) nextPage = slideCount - 1;
      if (nextPage >= slideCount) nextPage = 0;
      return [nextPage, newDirection];
    });
  }, [slideCount]);

  const nextSlide = useCallback(() => paginate(1), [paginate]);
  const prevSlide = useCallback(() => paginate(-1), [paginate]);

  // Auto-advance
  useEffect(() => {
    if (slideCount <= 1) return;
    const timer = setInterval(nextSlide, 5000);
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
        <div className="w-full aspect-[1024/1537] md:aspect-auto md:h-[540px] lg:h-[600px] bg-[#F5F5F0] animate-pulse" />
      </section>
    );
  }

  // No slides in DB
  if (slides.length === 0) return null;

  const slide = slides[current];

  // Direction-aware variants
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : dir < 0 ? '-100%' : 0,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      zIndex: 1
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : dir > 0 ? '-100%' : 0,
      opacity: 0,
      zIndex: 0
    })
  };

  return (
    <section className="w-full flex justify-center flex-col items-center">
      <div className="w-full relative overflow-hidden bg-[#F5F5F0] aspect-[1024/1537] md:aspect-auto md:h-[540px] lg:h-[600px]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { duration: 0.8, ease: [0.32, 0.72, 0, 1] },
              opacity: { duration: 0.6 }
            }}
            className="w-full h-full absolute inset-0 cursor-pointer"
            onClick={() => handleSlideClick(slide)}
          >
            <img 
              src={isMobileActual ? (slide.mobile_image_url || slide.image_url) : slide.image_url} 
              alt="Banner" 
              className="w-full h-full object-cover block"
            />
          </motion.div>
        </AnimatePresence>
      </div>

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

'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getHeroSlides } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface HeroSlide {
  id?: string;
  image_url: string;
  mobile_image_url?: string;
  title?: string;
  redirect_type?: string;
  redirect_value?: string;
  is_active?: boolean;
}

// Direction-aware variants are defined inside the component

export default function HeroSection() {
  const [[page, direction], setPage] = useState([0, 0]);
  const imageIndex = page;

  const [slides, setSlides] = useState<HeroSlide[] | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const [windowWidth, setWindowWidth] = useState(0);
  useEffect(() => {
    if (!mounted) return;
    setWindowWidth(window.innerWidth);
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [mounted]);

  const isMobileActual = windowWidth < 768;

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

  const goToSlide = (newIndex: number) => {
    if (slideCount <= 1 || newIndex === imageIndex) return;
    const jumpDirection = newIndex > imageIndex ? 1 : -1;
    setPage([newIndex, jumpDirection]);
  };

  const nextSlide = useCallback(() => paginate(1), [paginate]);

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

  if (slides === null) {
    return (
      <section className="w-full">
        <div className="w-full aspect-[1024/1537] md:aspect-auto md:h-[540px] lg:h-[600px] bg-[#F5F5F0] animate-pulse" />
      </section>
    );
  }

  if (slides.length === 0) return null;

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
    <>
      {/* Hero image with overlay arrows */}
      <section className="relative w-full bg-[#f3f3f3] md:aspect-auto aspect-[1024/1537] md:h-[540px] lg:h-[600px] overflow-hidden">
        <div className="relative w-full h-full">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={page}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="w-full h-full absolute inset-0 cursor-pointer"
              onClick={() => handleSlideClick(slides[imageIndex])}
            >
              <Image
                src={isMobileActual ? (slides[imageIndex].mobile_image_url || slides[imageIndex].image_url) : slides[imageIndex].image_url}
                alt={slides[imageIndex].title || 'Hero Banner'}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* Overlay left arrow */}
          {slides.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); paginate(-1); }}
              className="absolute left-[16px] md:left-[28px] top-1/2 -translate-y-1/2 z-10 w-[40px] h-[40px] md:w-[48px] md:h-[48px] rounded-full bg-white/80 hover:bg-white backdrop-blur-sm flex items-center justify-center text-[#333] hover:text-[#1a5b23] shadow-md hover:shadow-lg transition-all duration-200 border border-white/60"
              aria-label="Previous slide"
            >
              <ChevronLeft size={22} strokeWidth={2.5} />
            </button>
          )}

          {/* Overlay right arrow */}
          {slides.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); paginate(1); }}
              className="absolute right-[16px] md:right-[28px] top-1/2 -translate-y-1/2 z-10 w-[40px] h-[40px] md:w-[48px] md:h-[48px] rounded-full bg-white/80 hover:bg-white backdrop-blur-sm flex items-center justify-center text-[#333] hover:text-[#1a5b23] shadow-md hover:shadow-lg transition-all duration-200 border border-white/60"
              aria-label="Next slide"
            >
              <ChevronRight size={22} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </section>

      {/* Dots navigation bar below the image */}
      {slides.length > 0 && (
        <div className="w-full bg-white flex items-center justify-center py-[18px] border-b border-[#EEEEEE]">
          <div className="flex items-center gap-[10px]">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`transition-all duration-300 rounded-full border-none cursor-pointer ${
                  i === imageIndex
                    ? 'w-[36px] md:w-[44px] h-[8px] bg-[#1a5b23] shadow-sm'
                    : 'w-[8px] h-[8px] bg-[#D0D0D0] hover:bg-[#888888]'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

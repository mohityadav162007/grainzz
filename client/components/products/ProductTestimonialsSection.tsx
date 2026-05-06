'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// =========================================================
// EDIT PRODUCT TESTIMONIALS HERE
// =========================================================
// To modify testimonials, simply edit the objects in this array.
// Ensure the images exist in the public folder or use external URLs.
const PRODUCT_TESTIMONIALS = [
  {
    id: 1,
    quote: "Finally, a snack that doesn't make me choose between my health and my cravings! Grainzz has become my go-to for mid-day hunger. I love that it's roasted and made from millets!",
    authorName: "Sophia Maren",
    authorDesignation: "Director of Product",
    authorImage: "/Rectangle-10@2x.png" // Placeholder or use actual avatar image path
  },
  {
    id: 2,
    quote: "Finally, a snack that doesn't make me choose between my health and my cravings! Grainzz has become my go-to for mid-day hunger. I love that it's roasted and made from millets!",
    authorName: "Sophia Maren",
    authorDesignation: "Director of Product",
    authorImage: "/Rectangle-10@2x.png"
  },
  {
    id: 3,
    quote: "Finally, a snack that doesn't make me choose between my health and my cravings! Grainzz has become my go-to for mid-day hunger. I love that it's roasted and made from millets!",
    authorName: "Sophia Maren",
    authorDesignation: "Director of Product",
    authorImage: "/Rectangle-10@2x.png"
  },
  {
    id: 4,
    quote: "Finally, a snack that doesn't make me choose between my health and my cravings! Grainzz has become my go-to for mid-day hunger. I love that it's roasted and made from millets!",
    authorName: "Sophia Maren",
    authorDesignation: "Director of Product",
    authorImage: "/Rectangle-10@2x.png"
  },
  {
    id: 5,
    quote: "Finally, a snack that doesn't make me choose between my health and my cravings! Grainzz has become my go-to for mid-day hunger. I love that it's roasted and made from millets!",
    authorName: "Sophia Maren",
    authorDesignation: "Director of Product",
    authorImage: "/Rectangle-10@2x.png"
  }
];

export default function ProductTestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(3);
  
  // Responsive cards to show
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCardsToShow(1);
      } else if (window.innerWidth < 1024) {
        setCardsToShow(2);
      } else {
        setCardsToShow(3);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, PRODUCT_TESTIMONIALS.length - cardsToShow);

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  return (
    <section className="w-full py-[60px] md:py-[80px] bg-transparent overflow-hidden border-t border-[#EAEAEA]">
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[120px]">
        
        {/* Header and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-[40px] md:mb-[48px] gap-4">
          <h2 className="text-[32px] md:text-[40px] font-bold text-brand-black leading-tight tracking-tight">
            Hear it from our customers
          </h2>
          
          <div className="flex items-center gap-[12px] self-end sm:self-auto">
            <button 
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="w-[44px] h-[44px] rounded-full bg-[#1D5E2E] flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#154617] transition-colors shadow-sm"
              aria-label="Previous testimonials"
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>
            <button 
              onClick={nextSlide}
              disabled={currentIndex === maxIndex}
              className="w-[44px] h-[44px] rounded-full bg-[#1D5E2E] flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#154617] transition-colors shadow-sm"
              aria-label="Next testimonials"
            >
              <ChevronRight size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Slider Container */}
        <div className="relative w-full">
          <div 
            className="flex gap-[24px] transition-transform duration-300 ease-in-out"
            style={{ 
              transform: `translateX(calc(-${currentIndex * (100 / cardsToShow)}% - ${currentIndex * (24 / cardsToShow)}px))` 
            }}
          >
            {PRODUCT_TESTIMONIALS.map((testimonial) => (
              <div 
                key={testimonial.id}
                className="flex-shrink-0 bg-[#F4FAEE] border border-[#1D5E2E] rounded-[16px] p-[32px] md:p-[40px] flex flex-col justify-between"
                style={{ width: `calc((100% - ${(cardsToShow - 1) * 24}px) / ${cardsToShow})` }}
              >
                <p className="text-[15px] md:text-[16px] text-[#111111] leading-[1.6] font-medium mb-[40px]">
                  "{testimonial.quote}"
                </p>
                
                <div className="flex items-center gap-[16px]">
                  <div className="w-[50px] h-[50px] rounded-full overflow-hidden relative border border-[#EAEAEA] flex-shrink-0 bg-white">
                    <Image 
                      src={testimonial.authorImage} 
                      alt={testimonial.authorName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[16px] font-bold text-brand-black leading-tight">
                      {testimonial.authorName}
                    </span>
                    <span className="text-[13px] text-[#666666] font-medium mt-1">
                      {testimonial.authorDesignation}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

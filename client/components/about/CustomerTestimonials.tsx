'use client';
import { useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    quote: "Finally, a snack that doesn't make me choose between my health and my cravings! Grainzz has become my go-to for mid-day hunger. I love that it's roasted and made from millets!",
    name: 'Sophia Maren',
    role: 'Director of Product',
    avatar: '/avatar-customer.jpg',
  },
  {
    quote: "Finally, a snack that doesn't make me choose between my health and my cravings! Grainzz has become my go-to for mid-day hunger. I love that it's roasted and made from millets!",
    name: 'Sophia Maren',
    role: 'Director of Product',
    avatar: '/avatar-customer.jpg',
  },
  {
    quote: "Finally, a snack that doesn't make me choose between my health and my cravings! Grainzz has become my go-to for mid-day hunger. I love that it's roasted and made from millets!",
    name: 'Sophia Maren',
    role: 'Director of Product',
    avatar: '/avatar-customer.jpg',
  },
  {
    quote: "Finally, a snack that doesn't make me choose between my health and my cravings! Grainzz has become my go-to for mid-day hunger. I love that it's roasted and made from millets!",
    name: 'Sophia Maren',
    role: 'Director of Product',
    avatar: '/avatar-customer.jpg',
  },
  {
    quote: "Finally, a snack that doesn't make me choose between my health and my cravings! Grainzz has become my go-to for mid-day hunger. I love that it's roasted and made from millets!",
    name: 'Sophia Maren',
    role: 'Director of Product',
    avatar: '/avatar-customer.jpg',
  },
];

export default function CustomerTestimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const cardWidth = 320;
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -cardWidth : cardWidth,
      behavior: 'smooth',
    });
  };

  return (
    <section className="py-[64px] md:py-[96px] bg-[#FBF5EB] w-full overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 md:px-[40px] lg:px-[60px]">
        {/* Header row */}
        <div className="flex items-center justify-between mb-[36px]">
          <h2 className="text-[26px] md:text-[34px] font-bold text-brand-black tracking-tight leading-[1.2]">
            Hear it from our customers
          </h2>
          <div className="flex items-center gap-[10px]">
            <button
              onClick={() => scroll('left')}
              className="w-[40px] h-[40px] rounded-full border-[1.5px] border-[#333] flex items-center justify-center hover:bg-brand-green hover:border-brand-green hover:text-white text-[#333] transition-all"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-[40px] h-[40px] rounded-full border-[1.5px] border-[#333] flex items-center justify-center hover:bg-brand-green hover:border-brand-green hover:text-white text-[#333] transition-all"
              aria-label="Next testimonial"
            >
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable cards — extends beyond container to the right edge */}
      <div className="max-w-[1200px] mx-auto pl-4 md:pl-[40px] lg:pl-[60px]">
        <div
          ref={scrollRef}
          className="flex gap-[16px] overflow-x-auto scrollbar-hide pr-[40px]"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[280px] md:w-[300px] bg-[#E8F5D0] rounded-[16px] p-[24px] md:p-[28px] flex flex-col justify-between border border-[#D4E8B8]"
            >
              <p className="text-[14px] md:text-[15px] text-brand-black leading-[1.65] font-normal mb-[24px]">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-[12px]">
                <div className="w-[40px] h-[40px] rounded-full overflow-hidden relative flex-shrink-0">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-brand-black leading-[1.3]">{t.name}</p>
                  <p className="text-[12px] text-[#666] font-normal leading-[1.3]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';
import { useRef } from 'react';
import Image from '@/components/ui/AppImage';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    quote: "I tried Grainzz because I wanted something different from regular chips. The ragi chips surprised me the most. They have proper masala flavour and still feel much lighter than my usual evening snacks.",
    name: 'Aarav Mehta',
    role: 'Delhi',
    avatar: '/aarav.png',
  },
  {
    quote: "The Bajra Puffs became my work desk snack very quickly. They are easy to share, not too heavy and the smoky flavour is exactly the kind of thing I like during office breaks.",
    name: 'Ritika Sharma',
    role: 'Gurugram',
    avatar: '/ritika.png',
  },
  {
    quote: "I ordered the Beetroot Chips out of curiosity, but they actually tasted better than I expected. It is nice to see a snack that feels different without trying too hard.",
    name: 'Sneha Nair',
    role: 'Bengaluru',
    avatar: '/sneha.png',
  },
  {
    quote: "The combo box made sense for my family because everyone picked a different favourite. The jars are convenient and the flavours do not feel like typical diet snacks.",
    name: 'Kunal Arora',
    role: 'Noida',
    avatar: '/kunal.png',
  },
  {
    quote: "The puffed rice packets are simple, light and very easy to finish. Royal Mint Blast was my favourite because it feels fresh but still has that chatpata snack feeling.",
    name: 'Nidhi Kapoor',
    role: 'Mumbai',
    avatar: '/nidhi.png',
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


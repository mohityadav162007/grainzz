'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { getPoweredByCards, getProductById } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const MotionLink = motion.create ? motion.create(Link) : motion(Link as any);

interface PoweredByCard {
  id: string;
  product_id?: string;
  custom_image_url?: string;
  title: string;
  subtitle: string;
  top_bg_color: string;
  bottom_bg_color: string;
  link: string;
  image_url?: string;
}

interface ResolvedCard {
  title: string;
  subtitle: string;
  topBg: string;
  bottomBg: string;
  image: string;
  link: string;
  price?: number;
  mrp?: number;
  product?: any;
}

interface PoweredByProps {
  initialCards?: ResolvedCard[];
}

export default function PoweredBy({ initialCards = [] }: PoweredByProps) {
  const cards = initialCards;
  const { addItem, setQuickBuy } = useCartStore();
  const router = useRouter();

  const [windowWidth, setWindowWidth] = useState(0);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleBuyNow = (e: React.MouseEvent, card: ResolvedCard) => {
    e.preventDefault();
    e.stopPropagation();
    if (card.product) {
      setQuickBuy({
        id: card.product.id,
        name: card.product.name,
        price: card.product.price,
        mrp: card.product.mrp,
        image: card.product.images?.[0] || '',
        quantity: 1,
        tags: card.product.tags,
      });
      router.push('/checkout');
    } else {
      router.push(card.link);
    }
  };

  const isMobile = windowWidth > 0 && windowWidth < 768;



  if (cards.length === 0) return null;

  return (
    <section className="py-16 bg-white w-full">
      <div className="max-w-[1100px] mx-auto px-4 md:px-10">

        <h2 className="text-[32px] md:text-[38px] font-semibold text-[#1A1A1A] text-center mb-4 font-sans tracking-tight">
          Powered by Real Grains
        </h2>

        <CardsContainer cards={cards} isMobile={isMobile} handleBuyNow={handleBuyNow} />
      </div>
    </section>
  );
}

function CardsContainer({ cards, isMobile, handleBuyNow }: any) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <div ref={containerRef} className="flex flex-col md:grid md:grid-cols-3 gap-10 md:gap-6 lg:gap-8 relative mt-8 pb-10 md:pb-0">
      {cards.map((cat: any, idx: number) => (
        <CardWrapper key={idx} cat={cat} idx={idx} isMobile={isMobile} handleBuyNow={handleBuyNow} containerProgress={scrollYProgress} />
      ))}
    </div>
  );
}

function CardWrapper({ cat, idx, isMobile, handleBuyNow, containerProgress }: any) {
  // We use the parent container's scroll progress. 
  // idx=0 scales down from progress 0 to 0.33
  // idx=1 scales down from progress 0.33 to 0.66
  // idx=2 doesn't scale
  const start = idx * 0.33;
  // We want a smooth continuous scale down as subsequent cards scroll over
  const scale = useTransform(containerProgress, [start, 1], [1, 1 - (2 - idx) * 0.04]);

  return (
    <MotionLink
      href={cat.link}
      className="flex flex-col w-full rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300 sticky md:relative group/card"
      style={isMobile ? {
        top: `calc(70px + ${idx * 15}px)`,
        zIndex: idx + 1,
        scale: isMobile ? scale : 1,
        transformOrigin: 'top center'
      } : {}}
    >
      {/* Top Image Section */}
      <div
        className="w-full aspect-square relative flex items-center justify-center"
        style={{ backgroundColor: cat.topBg }}
      >
        <div className="w-full h-full relative">
          <Image
            src={cat.image}
            alt={cat.title}
            fill
            className="object-cover group-hover/card:scale-105 transition-transform duration-500"
          />
        </div>
      </div>

      {/* Bottom Content Section */}
      <div
        className="w-full flex-1 flex flex-col items-center text-center px-6 py-8"
        style={{ backgroundColor: cat.bottomBg }}
      >
        {cat.subtitle && (
          <p className="text-[13px] md:text-[15px] font-medium text-[#4A4A4A] mb-2">
            {cat.subtitle}
          </p>
        )}
        <h3 className="text-[20px] md:text-[24px] font-bold text-[#1A1A1A] mb-6 tracking-tight">
          {cat.title}
        </h3>

        <button
          onClick={(e) => handleBuyNow(e, cat)}
          className="mt-auto inline-flex items-center justify-between gap-4 bg-white/50 border border-black/10 text-brand-green pl-5 pr-1 py-1 rounded-full transition-all group hover:bg-brand-green hover:text-white hover:border-brand-green"
        >
          <span className="font-bold text-[14px] md:text-[16px]">Buy Now</span>
          <div className="w-8 h-8 md:w-9 md:h-9 bg-brand-green group-hover:bg-white rounded-full flex items-center justify-center text-white group-hover:text-brand-green transition-colors">
            <ArrowRight size={16} strokeWidth={3} />
          </div>
        </button>
      </div>
    </MotionLink>
  );
}

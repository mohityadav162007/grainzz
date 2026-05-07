'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { getPoweredByCards, getProductById } from '@/lib/api';

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
}

export default function PoweredBy() {
  const [cards, setCards] = useState<ResolvedCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCards = async () => {
      try {
        const rawCards: PoweredByCard[] = await getPoweredByCards();
        if (!rawCards || rawCards.length === 0) { setLoading(false); return; }

        // Resolve product data for each card
        const resolved = await Promise.all(
          rawCards.slice(0, 3).map(async (card) => {
            let productData: any = null;
            if (card.product_id) {
              productData = await getProductById(card.product_id).catch(() => null);
            }

            // custom_image_url overrides product image — NEVER mutates product.images
            const image = card.custom_image_url || card.image_url || productData?.images?.[0] || '/Rectangle-10@2x.png';
            const title = productData?.name || card.title || 'Product';
            const link = productData ? `/products/${productData.slug}` : card.link || '#';

            return {
              title,
              subtitle: card.subtitle || '',
              topBg: card.top_bg_color || '#C68356',
              bottomBg: card.bottom_bg_color || '#FDECE7',
              image,
              link,
              price: productData?.price,
              mrp: productData?.mrp,
            };
          })
        );

        setCards(resolved);
      } catch (err) {
        console.error('PoweredBy load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCards();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white w-full">
        <div className="max-w-[1100px] mx-auto px-4 md:px-10">
          <div className="h-8 w-64 bg-gray-100 rounded-lg mx-auto mb-10 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-xl overflow-hidden shadow-sm">
                <div className="aspect-square bg-gray-100 animate-pulse" />
                <div className="p-6 bg-gray-50"><div className="h-6 bg-gray-100 rounded mb-2 animate-pulse" /><div className="h-4 bg-gray-100 rounded w-24 animate-pulse" /></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (cards.length === 0) return null;

  return (
    <section className="py-16 bg-white w-full">
      <div className="max-w-[1100px] mx-auto px-4 md:px-10">

        <h2 className="text-[32px] md:text-[38px] font-semibold text-[#1A1A1A] text-center mb-10 font-sans tracking-tight">
          Powered by Real Grains
        </h2>

        <div className="flex flex-col md:grid md:grid-cols-3 gap-6 lg:gap-8 relative">
          {cards.map((cat, idx) => (
            <div 
              key={idx} 
              className="flex flex-col w-[88%] max-w-[340px] mx-auto md:w-full md:max-w-none rounded-3xl md:rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-shadow duration-300 md:relative sticky"
              style={{ 
                top: `calc(100px + ${idx * 16}px)`,
                zIndex: idx 
              }}
            >
              {/* Top Image Section */}
              <div
                className="w-full aspect-[4/5] md:aspect-auto md:h-[280px] lg:h-[320px] relative flex flex-col justify-end items-center pt-8 pb-4"
                style={{ backgroundColor: cat.topBg }}
              >
                 <div className="h-[90%] w-full relative">
                   <Image
                     src={cat.image}
                     alt={cat.title}
                     fill
                     className="object-contain drop-shadow-2xl"
                   />
                 </div>
              </div>

              {/* Bottom Content Section */}
              <div
                className="w-full flex flex-col items-center text-center px-6 py-6 md:py-6 rounded-b-2xl md:rounded-b-none border-t border-black/5"
                style={{ backgroundColor: cat.bottomBg }}
              >
                {cat.subtitle && (
                  <p className="text-[14px] font-medium text-[#4A4A4A] mb-1.5">
                    {cat.subtitle}
                  </p>
                )}
                <h3 className="text-[22px] lg:text-[22px] font-bold text-[#1A1A1A] mb-4 tracking-tight">
                  {cat.title}
                </h3>
                
                {cat.price && (
                  <div className="flex items-center gap-2 mb-3 hidden md:flex">
                    <span className="text-[16px] font-bold text-[#1E5E28]">₹{cat.price}</span>
                    {cat.mrp && cat.mrp > cat.price && (
                      <span className="text-[13px] text-[#999] line-through">₹{cat.mrp}</span>
                    )}
                  </div>
                )}

                <Link
                  href={cat.link}
                  className="inline-flex items-center justify-between w-[150px] border border-[#a8a8a8] bg-transparent pl-5 pr-1.5 py-1.5 rounded-full hover:bg-black/5 transition-colors group"
                >
                  <span className="font-bold text-[15px] text-[#2A2A2A]">Buy Now</span>
                  <div className="w-9 h-9 bg-[#1a5b23] rounded-full flex items-center justify-center text-white shrink-0 group-hover:bg-[#15461c] transition-colors">
                    <ArrowRight size={18} strokeWidth={2.5}/>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

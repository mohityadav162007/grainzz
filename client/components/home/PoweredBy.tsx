'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { getPoweredByCards, getProductById } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';

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

export default function PoweredBy() {
  const [cards, setCards] = useState<ResolvedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();
  const router = useRouter();

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

            // Favor product images from the database over legacy image_url fields
            const image = card.custom_image_url || productData?.images?.[0] || card.image_url || '/Rectangle-10@2x.png';
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
              product: productData,
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

  const [windowWidth, setWindowWidth] = useState(0);
  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleBuyNow = (e: React.MouseEvent, card: ResolvedCard) => {
    e.preventDefault();
    e.stopPropagation();
    if (card.product) {
      addItem(card.product);
      router.push('/checkout');
    } else {
      router.push(card.link);
    }
  };

  const isMobile = windowWidth > 0 && windowWidth < 768;

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

        <h2 className="text-[32px] md:text-[38px] font-semibold text-[#1A1A1A] text-center mb-4 font-sans tracking-tight">
          Powered by Real Grains
        </h2>

        <div className="flex flex-col md:grid md:grid-cols-3 gap-10 md:gap-6 lg:gap-8 relative mt-8 pb-10 md:pb-0">
          {cards.map((cat, idx) => (
            <Link 
              key={idx} 
              href={cat.link}
              className="flex flex-col w-full rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300 sticky md:relative group/card"
              style={isMobile ? { 
                top: `calc(100px + ${idx * 30}px)`,
                zIndex: idx + 1,
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
                    <ArrowRight size={16} strokeWidth={3}/>
                  </div>
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

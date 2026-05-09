'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronRight, ChevronLeft, Plus } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useCartStore } from '@/store/cartStore';

// ─────────────────────────────────────────────────────────────────────────────
// HARDCODED HOMEPAGE REVIEWS
// To change a product: replace the `product_id` UUID with a different product's ID.
// To find product IDs: go to Admin → Products → click Edit on any product → the ID is in the URL.
// ─────────────────────────────────────────────────────────────────────────────
const HOMEPAGE_REVIEWS = [
  {
    text: "Loved the flavour and crunch. It does not feel like regular oily chips, which is exactly why I tried it again.",
    author: 'Aarav Mehta',
    role: 'Delhi',
    rating: 5,
    product_id: '9fb17378-0edd-4f8f-a7ca-f23ad2d3b049', // 
  },
  {
    text: "Perfect for evening snacking. Light, tasty and much easier to keep reaching for than namkeen.",
    author: 'Ritika Sharma',
    role: 'Gurugram',
    rating: 5,
    product_id: 'a769b834-3673-40ed-87c7-b1c19717d0e1', // 
  },
  {
    text: "I bought these out of curiosity but ended up loving them. Great if you want something different from standard chips.",
    author: 'Sneha Nair',
    role: 'Bengaluru',
    rating: 5,
    product_id: 'f8ae529c-83b8-4216-8259-178564e9d41c', // 
  },
  {
    text: "Did not expect quinoa snacks to taste this good. These have become my work desk snack now.",
    author: 'Kunal Arora',
    role: 'Noida',
    rating: 5,
    product_id: 'a9c352ce-99e3-4496-83bc-7904a7128c8a', // 
  },
  {
    text: "The combo is the best way to try Grainzz because everyone at home ends up liking a different one.",
    author: 'Priya Bansal',
    role: 'Jaipur',
    rating: 5,
    product_id: '62b4eb79-8d83-4648-8304-1264fcc6a74d', // 
  },
  {
    text: "Very easy to snack on at night. Light, flavourful and much better than random fried snacks.",
    author: 'Nidhi Kapoor',
    role: 'Mumbai',
    rating: 5,
    product_id: 'c19020a7-b8e4-4459-a062-a47480935c87', // 
  },
];

import ProductCard from '@/components/products/ProductCard';

export default function TestimonialsSection() {
  const [reviews, setReviews] = useState<any[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { addItem } = useCartStore();

  useEffect(() => {
    let cancelled = false;
    const productIds = HOMEPAGE_REVIEWS.map(r => r.product_id);

    supabase
      .from('products')
      .select('*')
      .in('id', productIds)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) { console.error('Testimonials error:', error); setReviews([]); return; }

        const productMap = new Map((data || []).map(p => [p.id, p]));
        const resolved = HOMEPAGE_REVIEWS.map(review => ({
          ...review,
          product: productMap.get(review.product_id) || null,
        }));
        setReviews(resolved);
      });
    return () => { cancelled = true; };
  }, []);

  const reviewCount = reviews?.length || 0;
  const nextSlide = useCallback(() => {
    if (reviewCount <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % reviewCount);
  }, [reviewCount]);

  const prevSlide = useCallback(() => {
    if (reviewCount <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + reviewCount) % reviewCount);
  }, [reviewCount]);

  if (reviews === null) {
    return (
      <section className="w-full min-h-[600px] bg-[#f4f2eb] animate-pulse" />
    );
  }

  if (reviews.length === 0) return null;

  const current = reviews[currentIndex];
  if (!current) return null;
  
  // Inject the section-specific subtitle into the product data
  const product = current.product ? {
    ...current.product,
    subtitle: current.product.subtitle || 'High-Fibre | No Palm Oil | Baked Crunch'
  } : null;

  return (
    <section className="relative w-full min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Blur */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/Product-Background@2x.png"
          alt="Background"
          fill
          className="object-cover blur-[10px] scale-110 opacity-90"
        />
        <div className="absolute inset-0 bg-white/5" />
      </div>

      <div className="relative z-10 max-w-[1440px] w-full mx-auto px-0 md:px-[60px] lg:px-[100px] flex flex-col md:flex-row items-stretch justify-between min-h-[600px]">
        
        {/* Left: Product Card */}
        <div className="w-full md:w-[45%] lg:w-[400px] flex items-center justify-center md:justify-start py-10 md:py-20 px-4 md:px-0">
          <div className="w-full max-w-[340px] bg-white rounded-[24px] p-4 md:p-2 shadow-[0_24px_50px_rgba(0,0,0,0.1)]">
            {product ? (
              <ProductCard product={product} />
            ) : (
              <div className="aspect-[4/5] bg-white/20 backdrop-blur-md rounded-[24px]" />
            )}
          </div>
        </div>

        {/* Right: Testimonial Box */}
        <div className="w-full md:w-[50%] lg:w-[540px] bg-[#EEFBDC]/95 backdrop-blur-md px-6 py-10 md:p-14 lg:p-16 flex flex-col justify-between shadow-2xl">
          <div>
            <h4 className="text-[13px] md:text-[15px] font-semibold text-[#1A1A1A] mb-10 opacity-70 tracking-wide uppercase">
              What people are saying about Grainzz
            </h4>

            <div className="min-h-[180px] mb-10">
              <h2 className="text-[20px] md:text-[26px] lg:text-[28px] font-bold text-[#1A1A1A] leading-[1.6] tracking-tight">
                &quot;{current.text}&quot;
              </h2>
            </div>

            <div className="flex items-center gap-5 mb-12">
              <div className="w-[68px] h-[68px] rounded-full overflow-hidden border-2 border-white shadow-md">
                <Image
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(current.author)}&background=1A5B23&color=fff`}
                  alt={current.author}
                  width={68}
                  height={68}
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[19px] font-bold text-[#1A1A1A]">{current.author}</span>
                <span className="text-[14px] text-[#4A4A4A] font-medium opacity-80">{current.role}</span>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-[28px]">
            <button onClick={prevSlide} className="text-[#888888] hover:text-[#1A5B23] transition-all active:scale-90">
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>

            <div className="flex items-center gap-[12px]">
              {reviews.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-[10px] rounded-full cursor-pointer transition-all duration-500 ${idx === currentIndex ? 'w-[36px] bg-[#1A5B23]' : 'w-[10px] bg-[#D4E8B7]'}`}
                />
              ))}
            </div>

            <button onClick={nextSlide} className="text-[#888888] hover:text-[#1A5B23] transition-all active:scale-90">
              <ChevronRight size={24} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

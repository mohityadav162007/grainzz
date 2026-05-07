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

export default function TestimonialsSection() {
  const [reviews, setReviews] = useState<any[] | null>(null); // null = loading
  const [currentIndex, setCurrentIndex] = useState(0);
  const { addItem } = useCartStore();

  // Fetch linked products for each hardcoded review
  useEffect(() => {
    let cancelled = false;
    const productIds = HOMEPAGE_REVIEWS.map(r => r.product_id);

    supabase
      .from('products')
      .select('*')
      .in('id', productIds)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) { console.error('Testimonials product fetch error:', error); setReviews([]); return; }

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

  const handleAddToCart = useCallback((e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      image: product.images?.[0] || '',
      quantity: 1,
      tags: product.tags,
    });
  }, [addItem]);

  // Loading
  if (reviews === null) {
    return (
      <section className="w-full flex flex-col md:flex-row min-h-[600px] bg-white">
        <div className="w-full md:w-[45%] bg-[#f4f2eb] flex items-center justify-center py-20 px-4">
          <div className="w-[302px] h-[450px] bg-white/60 rounded-[20px] animate-pulse" />
        </div>
        <div className="w-full md:w-[55%] bg-[#EEFCD3] p-10 md:p-[80px] lg:p-[100px]">
          <div className="h-4 w-48 bg-[#D4E8B7] rounded mb-16 animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 w-full bg-[#D4E8B7] rounded animate-pulse" />
            <div className="h-8 w-3/4 bg-[#D4E8B7] rounded animate-pulse" />
            <div className="h-8 w-1/2 bg-[#D4E8B7] rounded animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) return null;

  const current = reviews[currentIndex];
  if (!current) return null;
  const product = current.product;

  return (
    <section className="w-full flex flex-col md:flex-row min-h-[600px] bg-white">
      {/* Left Column */}
      <div className="w-full md:w-[45%] relative bg-[#f4f2eb] flex items-center justify-center py-20 px-4 md:px-10 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-[#E6E0D4] blur-[4px]"
          style={{ backgroundImage: 'linear-gradient(120deg, rgba(230,224,212,0.8) 0%, rgba(200,185,165,0.8) 100%)' }}
        />

        {product ? (
          <div className="relative z-10 w-[302px] bg-white rounded-[20px] shadow-[0_24px_60px_rgba(0,0,0,0.12)] flex flex-col items-center p-[16px] text-left font-sans transform hover:-translate-y-2 transition-transform duration-500">
            <div className="w-[270px] h-[280px] bg-[#FDEAE3] rounded-[16px] relative mb-2">
              {product.mrp > product.price && (
                <div className="absolute top-4 left-4 rounded-full bg-[#E51624] flex items-center justify-center py-1 px-3 z-20 text-white text-[11px] font-bold shadow-sm">
                  -{Math.round(((product.mrp - product.price) / product.mrp) * 100)}%
                </div>
              )}
              <Image
                className="w-full h-full object-cover z-10 rounded-[16px]"
                width={270}
                height={280}
                alt={product.name}
                src={product.images?.[0] || '/Rectangle-10@2x.png'}
              />
              <button
                onClick={(e) => handleAddToCart(e, product)}
                className="absolute -bottom-[18px] right-[10px] z-20 w-[42px] h-[42px] rounded-full bg-[#1A1A1A] text-white flex items-center justify-center shadow-lg cursor-pointer hover:bg-black hover:scale-110 transition-all active:scale-90"
              >
                <Plus size={24} />
              </button>
            </div>

            <div className="flex flex-col items-start w-full px-2 pb-2 mt-5">
              <div className="flex items-center gap-[10px] text-[12px] font-semibold text-[#444] mb-3">
                <span className="bg-[#FFEFC2] px-[12px] py-[4px] rounded-[6px]">{product.category || 'Jar'}</span>
                {product.weight && <span className="bg-[#FFEFC2] px-[12px] py-[4px] rounded-[6px]">{product.weight}</span>}
              </div>
              <h2 className="text-[19px] leading-[1.3] font-bold text-[#1A1A1A] mb-[4px] tracking-tight line-clamp-1">
                {product.name}
              </h2>
              <p className="text-[13px] text-[#888888] font-medium mb-4 line-clamp-1">
                {product.description || 'High-Fibre | No Palm Oil | Baked Crunch'}
              </p>
              <div className="flex items-center gap-[10px]">
                <h2 className="text-[20px] font-bold text-[#1A1A1A]">₹{product.price}</h2>
                {product.mrp > product.price && (
                  <span className="text-[13px] line-through text-[#999999] font-medium pt-1">MRP ₹{product.mrp}</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative z-10 w-[302px] h-[450px] bg-white rounded-[20px] shadow-sm flex items-center justify-center text-gray-300 italic p-10 text-center">
            Product not found. Check the product_id in the code.
          </div>
        )}
      </div>

      {/* Right Column */}
      <div className="w-full md:w-[55%] flex flex-col justify-center bg-[#EEFCD3] p-10 md:p-[80px] lg:p-[100px] relative">
        <div className="max-w-[640px]">
          <h4 className="text-[15px] font-semibold text-[#444444] mb-[60px]">
            What people are saying about Grainzz
          </h4>

          <div className="flex flex-col">
            <div className="min-h-[200px] md:min-h-[240px] lg:min-h-[280px]">
              <h2 className="text-[24px] md:text-[28px] lg:text-[32px] font-bold text-[#1A1A1A] leading-[1.4] tracking-tight mb-8">
                &quot;{current.text}&quot;
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-[56px] h-[56px] rounded-full bg-white overflow-hidden flex items-center justify-center text-brand-green font-bold text-2xl shadow-sm border border-[#D5EFA5]">
                <span className="opacity-80">{current.author?.[0] || '?'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[18px] font-bold text-[#1A1A1A]">{current.author}</span>
                <span className="text-[14px] text-[#666666] font-medium">{current.role}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-[60px]">
            <button onClick={prevSlide} className="w-[32px] h-[32px] flex items-center justify-center text-[#888888] hover:text-[#222222] transition-colors">
              <ChevronLeft size={24} strokeWidth={2} />
            </button>

            <div className="flex items-center gap-[6px]">
              {reviews.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-[6px] rounded-full cursor-pointer transition-all duration-300 ${idx === currentIndex ? 'w-[28px] bg-[#1E5E28]' : 'w-[6px] bg-[#D4E8B7] hover:bg-[#B3D493]'}`}
                />
              ))}
            </div>

            <button onClick={nextSlide} className="w-[32px] h-[32px] flex items-center justify-center text-[#888888] hover:text-[#222222] transition-colors">
              <ChevronRight size={24} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

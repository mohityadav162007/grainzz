'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { getSnackBoxItems } from '@/lib/api';

interface SnackBoxItem {
  id: string;
  title: string;
  image_url: string;
  price: number;
  original_price: number;
  description: string;
  redirect_link: string;
}

export default function EssentialSnackBox() {
  const [items, setItems] = useState<SnackBoxItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSnackBoxItems()
      .then((data) => {
        if (data && data.length > 0) setItems(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-[40px] md:py-[60px] bg-[#FCF9F2] w-full border-y border-[#EEEEEE]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[100px]">
          <div className="h-10 w-72 bg-[#EDE8DA] rounded-lg mx-auto mb-8 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map(i => (
              <div key={i} className="rounded-2xl overflow-hidden bg-white border border-[#EAEAEA]">
                <div className="aspect-[4/3] bg-[#EDE8DA] animate-pulse" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-[#EDE8DA] rounded w-48 animate-pulse" />
                  <div className="h-8 bg-[#EDE8DA] rounded w-24 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="py-[40px] md:py-[60px] bg-[#FCF9F2] w-full border-y border-[#EEEEEE]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[100px]">

        <h2 className="text-[32px] md:text-[38px] font-bold text-brand-black text-center mb-[10px] font-sans tracking-tight leading-[1.2]">
          The Essential Snack Box
        </h2>
        <p className="text-[15px] md:text-[16px] text-[#666666] text-center mb-[40px] font-sans font-medium max-w-[500px] mx-auto">
          Choose from our curated snack boxes — perfect for home, office, or gifting.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] md:gap-[32px]">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col rounded-[20px] overflow-hidden bg-white border border-[#EAEAEA] shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] transition-shadow duration-300"
            >
              {/* Image */}
              <div className="w-full aspect-[4/3] md:aspect-[16/10] relative bg-[#F9F7F3]">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[#CCC] text-sm">No Image</span>
                  </div>
                )}
                {/* Discount badge */}
                {item.original_price > item.price && (
                  <div className="absolute top-[16px] left-[16px] bg-brand-red text-white text-[12px] font-bold px-[12px] py-[4px] rounded-full shadow-sm">
                    {Math.round(((item.original_price - item.price) / item.original_price) * 100)}% OFF
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col items-start p-[24px] md:p-[28px]">
                <h3 className="text-[22px] md:text-[24px] font-bold text-brand-black leading-[1.2] tracking-tight mb-[8px]">
                  {item.title}
                </h3>

                <div className="flex items-center gap-[10px] mb-[12px]">
                  <span className="text-[28px] md:text-[32px] font-bold text-brand-black leading-[1]">₹{item.price}</span>
                  {item.original_price > item.price && (
                    <span className="text-[16px] text-[#999999] font-medium line-through">MRP ₹{item.original_price}</span>
                  )}
                </div>

                {item.description && (
                  <p className="text-[14px] leading-[1.6] text-[#666666] font-medium mb-[20px] line-clamp-3">
                    {item.description}
                  </p>
                )}

                <Link
                  href={item.redirect_link || '/products'}
                  className="inline-flex items-center justify-between gap-[16px] bg-brand-black text-white pl-[24px] pr-[6px] py-[6px] rounded-[40px] transition-all hover:bg-[#333] active:scale-95 group shadow-sm mt-auto"
                >
                  <span className="font-bold text-[14px] leading-[1] capitalize mt-[1px]">Shop Now</span>
                  <div className="w-[32px] h-[32px] bg-brand-green rounded-full flex items-center justify-center text-white transition-colors group-hover:bg-[#154617]">
                    <ArrowRight size={16} strokeWidth={2.5} className="ml-[1px]" />
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

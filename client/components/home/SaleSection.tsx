'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from '@/components/ui/OptimizedImage';
import { ChevronRight } from 'lucide-react';
import { getComboProducts, getSiteContent } from '@/lib/api';

export default function SaleSection() {
  const [products, setProducts] = useState<any[]>([]);
  const [heading, setHeading] = useState('Best Value Combos to Start With');
  const [ctaText, setCtaText] = useState('Shop Combo Offers');
  const [ctaHref, setCtaHref] = useState('/combos');

  useEffect(() => {
    getComboProducts(3).then(setProducts).catch(() => {});
    getSiteContent('combo_section').then((content) => {
      if (content) {
        if (content.heading) setHeading(content.heading);
        if (content.cta_text) setCtaText(content.cta_text);
        if (content.cta_href) setCtaHref(content.cta_href);
      }
    }).catch(() => {});
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="py-[60px] md:py-[100px] bg-white w-full border-t border-[#EEEEEE]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-[80px]">
        <h2 className="text-[32px] md:text-[45px] font-bold text-center text-brand-black mb-[44px] leading-[132%] tracking-tight font-sans">
          {heading}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px] md:gap-[36px]">
          {products.map((product: any) => {
            const discount = product.discount_percent || Math.round(((product.mrp - product.price) / product.mrp) * 100);
            return (
              <Link key={product.id} href={`/products/${product.slug}`} className="group block">
                <div className="bg-[#FFFFFF] rounded-[14px] overflow-hidden border border-[#EEEEEE] h-full flex flex-col hover:shadow-2xl hover:border-brand-green/20 transition-all duration-500">
                  
                  {/* Image area */}
                  <div className="relative aspect-square w-full p-4 md:p-6 bg-[#f7f7f7]">
                    {discount > 0 && (
                       <div className="absolute top-[16px] left-[16px] bg-brand-red text-white text-[12px] font-bold px-[12px] py-[6px] rounded-full shadow-sm z-10 font-sans">
                         Save {discount}%
                       </div>
                    )}
                    <div className="relative w-full h-full rounded-[10px] overflow-hidden shadow-sm">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-brand-light flex flex-col items-center justify-center text-center p-4">
                          <span className="font-sans text-[20px] font-black text-brand-green">GRAINZZ</span>
                          <span className="text-[10px] font-bold tracking-widest text-[#6B6B6B] mt-2 uppercase">VALUE COMBO</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-[20px] md:p-[32px] flex flex-col flex-grow gap-[16px]">
                    <div className="space-y-4">
                      <h3 className="text-[20px] md:text-[24px] font-bold text-brand-black leading-[120%] font-sans group-hover:text-brand-green transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-[12px]">
                        <span className="text-[28px] md:text-[32px] font-black text-brand-black font-sans">₹{product.price}</span>
                        {product.mrp > product.price && (
                          <span className="text-[16px] text-[#8E8E8E] font-medium line-through font-sans">₹{product.mrp}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <span className="inline-flex w-full items-center justify-center gap-2 bg-brand-green text-white text-[16px] font-bold px-6 py-4 rounded-full hover:bg-brand-green/90 transition-all font-sans active:scale-95">
                        Buy Combo Now
                        <ChevronRight size={20} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="flex justify-center mt-[44px] md:mt-[64px]">
          <Link href={ctaHref} className="inline-flex items-center gap-[10px] text-brand-green px-[32px] py-[14px] rounded-full font-bold text-[18px] border-2 border-brand-green hover:bg-brand-green hover:text-white transition-all font-sans group">
            {ctaText}
            <ChevronRight size={22} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}


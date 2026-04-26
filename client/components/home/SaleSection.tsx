'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    <section className="py-[40px] md:py-[80px] bg-white w-full border-t border-[#E4E4E4]/50">
      <div className="max-w-[1440px] mx-auto px-4 md:px-[80px]">
        <h2 className="text-[28px] md:text-[40px] font-bold text-center text-brand-black mb-[32px] md:mb-[48px] leading-tight">
          {heading}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px] md:gap-[30px]">
          {products.map((product: any) => {
            const discount = product.discount_percent || Math.round(((product.mrp - product.price) / product.mrp) * 100);
            return (
              <Link key={product.id} href={`/products/${product.slug}`} className="group block h-full">
                <div className="bg-[#FFFFFF] rounded-[24px] overflow-hidden border border-[#E4E4E4] h-full flex flex-col hover:border-brand-green/30 hover:shadow-[0_12px_24px_rgba(29,94,32,0.06)] transition-all duration-300">
                  
                  {/* Image area */}
                  <div className="relative aspect-square bg-[#F7F7F7] w-full p-4 md:p-6">
                    {discount > 0 && (
                       <div className="absolute top-[16px] md:top-[24px] left-[16px] md:left-[24px] bg-brand-red text-white text-[10px] md:text-[12px] font-bold px-[10px] md:px-[12px] py-[4px] md:py-[6px] rounded-full shadow-sm z-10">
                         Save {discount}%
                       </div>
                    )}
                    <div className="relative w-full h-full rounded-[16px] overflow-hidden bg-white shadow-sm border border-black/5">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand-light to-[#E7F6D4] flex flex-col items-center justify-center text-center p-4">
                          <span className="font-sans text-[20px] md:text-[24px] font-black text-brand-green">GRAINZZ</span>
                          <span className="text-[10px] md:text-[12px] font-bold tracking-widest text-[#6B6B6B] mt-2">VALUE COMBO</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-[16px] md:p-[24px] flex flex-col flex-grow justify-between gap-[16px] md:gap-[20px]">
                    <div>
                      <h3 className="text-[18px] md:text-[22px] font-bold text-brand-black leading-[1.3] group-hover:text-brand-green transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-[8px] md:gap-[12px] mt-[8px] md:mt-[12px]">
                        <span className="text-[24px] md:text-[28px] font-black text-brand-black">₹{product.price}</span>
                        {product.mrp > product.price && (
                          <span className="text-[14px] md:text-[16px] text-[#8E8E8E] font-medium line-through">₹{product.mrp}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <span className="inline-flex w-full items-center justify-center gap-2 bg-brand-green text-white text-[14px] md:text-[16px] font-bold px-[16px] md:px-[24px] py-[12px] md:py-[16px] rounded-full hover:bg-[#154617] hover:shadow-lg transition-all group-active:scale-[0.98]">
                        Buy Combo Now
                        <ChevronRight size={18} className="md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="flex justify-center mt-[32px] md:mt-[48px]">
          <Link href={ctaHref} className="inline-flex items-center gap-[8px] md:gap-[10px] bg-white border-2 border-brand-green text-brand-green px-[24px] md:px-[32px] py-[12px] md:py-[14px] rounded-full font-bold text-[16px] md:text-[18px] hover:bg-brand-green hover:text-white transition-all group">
            {ctaText}
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

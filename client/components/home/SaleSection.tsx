'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <h2 className="section-title mb-10">{heading}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product: any) => {
            const discount = product.discount_percent || Math.round(((product.mrp - product.price) / product.mrp) * 100);
            return (
              <Link key={product.id} href={`/products/${product.slug}`} className="group">
                <div className="bg-cream rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300">
                  {/* Image area */}
                  <div className="relative aspect-square bg-cream flex items-center justify-center overflow-hidden">
                    {product.images?.[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-4">
                        <div className="w-32 h-40 bg-gradient-to-b from-green-400 to-green-600 rounded-xl flex flex-col items-center justify-center text-white shadow-lg">
                          <span className="text-[8px] font-bold tracking-widest opacity-70">VITALICIOUS</span>
                          <span className="font-brand text-sm font-black">GRAIN<span className="text-yellow-300">ZZ</span></span>
                          <div className="w-10 h-10 bg-white/20 rounded-full mt-2" />
                          <span className="text-[7px] mt-1 opacity-70">COMBO PACK</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    {discount > 0 && (
                      <span className="text-xs text-accent font-semibold">upto {discount}% off</span>
                    )}
                    <h3 className="font-bold text-text-main text-sm mt-1 group-hover:text-primary transition-colors">{product.name}</h3>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-bold text-primary">₹{product.price}</span>
                      {product.mrp > product.price && (
                        <span className="text-xs text-text-muted line-through">MRP ₹{product.mrp}</span>
                      )}
                    </div>
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-2 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors">
                        Buy Now
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                          <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link href={ctaHref} className="btn-primary">
            {ctaText}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="ml-1">
              <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

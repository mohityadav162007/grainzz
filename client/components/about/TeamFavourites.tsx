'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { supabase } from '@/lib/supabase';

export default function TeamFavourites() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        // Find the 'Team Favourites' section
        const { data: section } = await supabase
          .from('homepage_sections')
          .select('product_ids')
          .eq('title', 'Team Favourites')
          .eq('is_active', true)
          .single();

        if (section && section.product_ids && section.product_ids.length > 0) {
          const { data } = await supabase
            .from('products')
            .select('*')
            .in('id', section.product_ids)
            .eq('is_active', true)
            .limit(4);
          
          if (data) {
             const sanitized = data.map((prod: any) => {
               if (prod && Array.isArray(prod.images)) {
                 prod.images = prod.images.map((img: string) => img.includes('placeholder.jpg') ? '/image-2@2x.png' : img);
               }
               return prod;
             });
             setProducts(sanitized);
             return;
          }
        }
        
        // Fallback if no section or products found
        const { data: fbData } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('views', { ascending: false })
          .limit(4);
          
        if (fbData) {
           const sanitized = fbData.map((prod: any) => {
               if (prod && Array.isArray(prod.images)) {
                 prod.images = prod.images.map((img: string) => img.includes('placeholder.jpg') ? '/image-2@2x.png' : img);
               }
               return prod;
             });
           setProducts(sanitized);
        }
      } catch {}
    })();
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="py-[64px] md:py-[96px] bg-[#F9F7F3] w-full">
      <div className="max-w-[1200px] mx-auto px-4 md:px-[40px] lg:px-[60px]">
        <h2 className="text-[28px] md:text-[36px] font-bold text-center text-brand-black mb-[40px] tracking-tight">
          Team Favourites
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px] md:gap-[20px]">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Products CTA */}
        <div className="flex justify-center mt-[40px]">
          <Link
            href="/products"
            className="inline-flex items-center gap-[14px] border-[1.5px] border-brand-black text-brand-black pl-[22px] pr-[5px] py-[5px] rounded-full hover:border-brand-green hover:text-brand-green transition-all group"
          >
            <span className="text-[14px] font-semibold">View All Products</span>
            <div className="w-[34px] h-[34px] bg-brand-green rounded-full flex items-center justify-center text-white group-hover:bg-[#154617] transition-colors">
              <ArrowRight size={16} strokeWidth={2.5} />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

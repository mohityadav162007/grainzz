'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { getSiteContent, getProducts } from '@/lib/api';
import { supabase } from '@/lib/supabase';

export default function TeamFavourites() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        // Fetch from store_settings (key: team_favourites)
        const config = await getSiteContent('team_favourites');
        
        if (config && config.product_ids && config.product_ids.length > 0) {
          // Fetch exact products bypassing pagination limits
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .in('id', config.product_ids)
            .eq('is_active', true);
            
          if (!error && data && data.length > 0) {
            // Sort to match the order in admin
            const sorted = config.product_ids
              .map((id: string) => data.find((p: any) => p.id === id))
              .filter(Boolean);
            
            if (sorted.length > 0) {
              // Sanitize image placeholder logic (similar to segments)
              const sanitized = sorted.map((prod: any) => {
                if (prod && Array.isArray(prod.images)) {
                  prod.images = prod.images.map((img: string) =>
                    img.includes('placeholder.jpg') ? '/image-2@2x.png' : img
                  );
                }
                return prod;
              });
              setProducts(sanitized);
              return;
            }
          }
        }
        
        // Fallback if no config found or all selected products are deleted/inactive
        const { data: fbData } = await getProducts({ limit: '4', sort: 'best-selling' });
        if (fbData) setProducts(fbData);
      } catch (err) {
        console.error('Error loading team favourites:', err);
      }
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

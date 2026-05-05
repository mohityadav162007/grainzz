'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { getSiteContent, getProducts } from '@/lib/api';

export default function TeamFavourites() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        // Fetch from store_settings (key: team_favourites)
        const config = await getSiteContent('team_favourites');
        
        if (config && config.product_ids && config.product_ids.length > 0) {
          // Use our existing getProducts or fetch manually
          // The client getProducts doesn't easily support fetching by multiple IDs yet, 
          // let's see if we can use a simpler approach or just fetch them
          const { data } = await getProducts(); // This gets active products
          if (data) {
            const filtered = data.filter((p: any) => config.product_ids.includes(p.id));
            // Sort to match the order in admin
            const sorted = config.product_ids
              .map((id: string) => filtered.find((p: any) => p.id === id))
              .filter(Boolean);
            
            if (sorted.length > 0) {
              setProducts(sorted);
              return;
            }
          }
        }
        
        // Fallback if no config found
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

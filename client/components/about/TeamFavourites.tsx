import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { getSiteContent, getProducts, getActiveOffersMap, applyOffersToProduct } from '@/lib/api';
import { supabase } from '@/lib/supabase';

export default async function TeamFavourites() {
  let products: any[] = [];
  
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
              const offersMap = await getActiveOffersMap();
              // Sanitize image placeholder logic and apply active offers pricing
              const sanitized = sorted.map((prod: any) => {
                if (prod && Array.isArray(prod.images)) {
                  prod.images = prod.images.map((img: string) =>
                    img.includes('placeholder.jpg') ? '/image-2@2x.png' : img
                  );
                }
                return applyOffersToProduct(prod, offersMap);
              });
              products = sanitized;
            }
          }
        }
        
        if (products.length === 0) {
          // Fallback if no config found or all selected products are deleted/inactive
          const { data: fbData } = await getProducts({ limit: '4', sort: 'best-selling' });
          if (fbData) products = fbData;
        }
      } catch (err) {
        console.error('Error loading team favourites:', err);
      }

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
        <div className="flex justify-center mt-[40px] md:mt-[64px]">
          <Link
            href="/products"
            className="inline-flex items-center justify-between gap-6 md:gap-10 bg-white border border-[#D1EAD3] text-brand-green pl-6 md:pl-10 pr-1 md:pr-2 py-1.5 md:py-2.5 rounded-full transition-all group hover:border-brand-green hover:bg-brand-green hover:text-white shadow-sm hover:shadow-md"
          >
            <span className="text-[16px] md:text-[20px] font-semibold leading-tight">View All Products</span>
            <div className="w-[40px] h-[40px] md:w-[52px] md:h-[52px] bg-brand-green group-hover:bg-white rounded-full flex items-center justify-center text-white group-hover:text-brand-green transition-all duration-300">
              <ArrowRight size={20} strokeWidth={2.5} className="md:w-6 md:h-6" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Heart } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { useWishlistStore } from '@/store/wishlistStore';
import { supabase } from '@/lib/supabase';

export default function WishlistPage() {
  const { items } = useWishlistStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      if (items.length > 0) {
        const { data } = await supabase
          .from('products')
          .select('*')
          .in('id', items)
          .eq('is_active', true);
        
        if (data) {
           const sanitized = data.map((prod: any) => {
             if (prod && Array.isArray(prod.images)) {
               prod.images = prod.images.map((img: string) => img.includes('placeholder.jpg') ? '/image-2@2x.png' : img);
             }
             return prod;
           });
           setProducts(sanitized);
        } else {
           setProducts([]);
        }
      } else {
        setProducts([]);
      }
      setLoading(false);
    };

    fetchWishlist();
  }, [items]);

  return (
    <div className="bg-[#FCF9F2] min-h-screen pb-[100px]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[120px] pt-[32px]">
        {/* Breadcrumb */}
        <div className="flex items-center gap-[8px] text-[13px] md:text-[14px] font-semibold text-[#8E8E8E] mb-[24px] tracking-wide">
          <Link href="/" className="hover:text-brand-green transition-colors">Home</Link>
          <ChevronRight size={14} />
          <span className="text-brand-black">Wishlist</span>
        </div>

        <h1 className="text-[32px] md:text-[45px] font-bold text-brand-black font-brand tracking-tight mb-[40px]">
          Your <span className="text-brand-red">Wishlist</span>
        </h1>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[20px] md:gap-[24px]">
             {Array(Math.min(items.length || 4, 8)).fill(0).map((_, i) => (
                <div key={i} className="bg-[#F5F5F5] rounded-[12px] aspect-[3/4] animate-pulse" />
             ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[20px] md:gap-[24px] pb-[80px]">
             {products.map((product) => (
               <ProductCard key={product.id} product={product} />
             ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-[120px] bg-white rounded-[20px] border border-[#EAEAEA] text-center px-4 shadow-sm">
             <Heart size={64} className="text-[#D9D9D9] mb-6 animate-pulse" strokeWidth={1} />
             <h3 className="text-[26px] font-bold text-brand-black mb-3">Your wishlist is currently empty</h3>
             <p className="text-[16px] text-[#707070] font-medium max-w-[400px] mb-8">
               Browse our healthy and tasty snacks and tap the heart icon to save your favorites here.
             </p>
             <Link 
               href="/products"
               className="bg-brand-red hover:bg-[#a62c16] text-white px-[32px] py-[12px] rounded-full font-bold text-[16px] transition-colors inline-block"
             >
               Start Shopping
             </Link>
          </div>
        )}
      </div>
    </div>
  );
}

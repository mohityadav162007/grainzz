import type { Metadata } from 'next';
import { getProducts } from '@/lib/api';
import ProductCard from '@/components/products/ProductCard';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sale! – Grainzz',
  description: 'Shop all sale products at Grainzz — up to 40% off on healthy grain snacks.',
};

async function getSaleProducts() {
  try {
    const res = await getProducts({ isSale: 'true', limit: '20' });
    return res.data || [];
  } catch { return []; }
}

export default async function SalePage() {
  const products = await getSaleProducts();
  return (
    <div className="bg-[#FCF9F2] min-h-screen pb-[100px]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[120px] pt-[32px]">
        {/* Breadcrumb */}
        <div className="flex items-center gap-[8px] text-[13px] md:text-[14px] font-semibold text-[#8E8E8E] mb-[24px] tracking-wide">
          <Link href="/" className="hover:text-brand-green transition-colors">Home</Link>
          <ChevronRight size={14} />
          <span className="text-brand-black">Sale</span>
        </div>

        <h1 className="text-[32px] md:text-[45px] font-bold text-brand-red font-brand tracking-tight mb-[40px]">
          Sale Offers
        </h1>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[100px] bg-white rounded-[20px] border border-[#EAEAEA] text-center px-4">
             <h3 className="text-[24px] font-bold text-brand-black mb-2">No sale products at the moment.</h3>
             <p className="text-[16px] text-[#707070] font-medium">Check back soon for amazing deals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[16px] md:gap-[32px]">
            {products.map((product: any) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </div>
    </div>
  );
}

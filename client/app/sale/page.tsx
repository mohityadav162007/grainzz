import type { Metadata } from 'next';
import { getProducts } from '@/lib/api';
import ProductCard from '@/components/products/ProductCard';

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
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      <h1 className="text-4xl font-black text-accent mb-8">Sale!</h1>
      {products.length === 0 ? (
        <p className="text-text-muted py-20 text-center">No sale products at the moment. Check back soon!</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product: any) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </div>
  );
}

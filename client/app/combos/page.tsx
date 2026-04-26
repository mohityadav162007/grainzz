import { getProducts } from '@/lib/api';
import ProductCard from '@/components/products/ProductCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Combos – Grainzz',
  description: 'Shop Grainzz combo packs — great value bundles of our best healthy snacks.',
};

async function getCombos() {
  try {
    const res = await getProducts({ category: 'Combos', limit: '20' });
    return res.data || [];
  } catch { return []; }
}

export default async function CombosPage() {
  const products = await getCombos();
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      <h1 className="text-3xl font-black text-text-main mb-8">Combos</h1>
      {products.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          <p className="text-lg font-semibold mb-2">No combos yet</p>
          <p className="text-sm">Check back soon for great bundle deals!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product: any) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </div>
  );
}

import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';

async function getSaleProducts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?isSale=true&limit=3`, {
      next: { revalidate: 300 },
    });
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export default async function SaleSection() {
  const products = await getSaleProducts();
  if (products.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <h2 className="section-title mb-10">Powered by Real Grains</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

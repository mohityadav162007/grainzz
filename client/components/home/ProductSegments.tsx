import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';

async function getFeaturedProducts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?limit=8`, {
      next: { revalidate: 300 },
    });
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

const categories = [
  { label: 'Bestsellers', value: '' },
  { label: 'Puffed Rice', value: 'Puffed Rice' },
  { label: 'Healthy Chips', value: 'Healthy Chips' },
  { label: 'Grain Puffs', value: 'Grain Puffs' },
];

export default async function ProductSegments() {
  const products = await getFeaturedProducts();

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <h2 className="section-title mb-6">Our Product Segments</h2>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              href={cat.value ? `/products?category=${cat.value}` : '/products'}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all
                ${cat.value === '' ? 'bg-primary text-white border-primary' : 'border-gray-200 text-text-muted hover:border-primary hover:text-primary'}`}
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {/* Products grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.slice(0, 8).map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-text-muted">
            <p>Products loading... Make sure the server is running.</p>
          </div>
        )}

        <div className="text-center mt-10">
          <Link href="/products" className="btn-primary">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}

import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';

const fallbackProducts = [
  {
    _id: 'fp-1', name: 'Oats Chips – Peri Peri', slug: 'oats-chips-peri-peri',
    price: 149, mrp: 199, images: [], category: 'Healthy Chips',
    stock: 100, isSale: true, tags: ['Jar', '150g'],
    nutritionInfo: 'High-Fibre | No Palm Oil | Baked Crunch',
    discountPercent: 25,
  },
  {
    _id: 'fp-2', name: 'Quinoa Puffs – Classic Salt', slug: 'quinoa-puffs-classic-salt',
    price: 149, mrp: 199, images: [], category: 'Grain Puffs',
    stock: 80, isSale: true, tags: ['Jar', '100g'],
    nutritionInfo: 'High Protein | Gluten Free',
    discountPercent: 25,
  },
  {
    _id: 'fp-3', name: 'Bajra Chips – Masala', slug: 'bajra-chips-masala',
    price: 129, mrp: 169, images: [], category: 'Healthy Chips',
    stock: 60, isSale: false, tags: ['Pouch', '120g'],
    nutritionInfo: 'Iron Rich | High Fibre',
    discountPercent: 24,
  },
  {
    _id: 'fp-4', name: 'Ragi Chips – Cheese Onion', slug: 'ragi-chips-cheese-onion',
    price: 139, mrp: 179, images: [], category: 'Healthy Chips',
    stock: 75, isSale: true, tags: ['Pouch', '130g'],
    nutritionInfo: 'Calcium Rich | High Fibre',
    discountPercent: 22,
  },
];

async function getFeaturedProducts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?limit=8`, {
      next: { revalidate: 300 },
    });
    const data = await res.json();
    return data.data?.length > 0 ? data.data : fallbackProducts;
  } catch {
    return fallbackProducts;
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
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              href={cat.value ? `/products?category=${cat.value}` : '/products'}
              className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-200
                ${cat.value === '' ? 'bg-primary text-white border-primary' : 'border-gray-200 text-text-muted hover:border-primary hover:text-primary'}`}
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 8).map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/products" className="btn-primary">
            View All Products
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="ml-1">
              <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

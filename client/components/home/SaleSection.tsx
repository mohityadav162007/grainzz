import Link from 'next/link';

const fallbackProducts = [
  {
    _id: 'sp-1', name: 'Vegetable Chips', slug: 'oats-chips-peri-peri',
    price: 149, mrp: 199, discount: 25,
    images: [], category: 'Healthy Chips', tags: ['Jar', '150g'],
  },
  {
    _id: 'sp-2', name: 'Vegetable Chips', slug: 'quinoa-puffs-classic-salt',
    price: 149, mrp: 199, discount: 25,
    images: [], category: 'Grain Puffs', tags: ['Jar', '100g'],
  },
  {
    _id: 'sp-3', name: 'Vegetable Chips', slug: 'ragi-chips-cheese-onion',
    price: 139, mrp: 179, discount: 22,
    images: [], category: 'Healthy Chips', tags: ['Pouch', '130g'],
  },
];

async function getSaleProducts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?isSale=true&limit=3`, {
      next: { revalidate: 300 },
    });
    const data = await res.json();
    return data.data?.length > 0 ? data.data : fallbackProducts;
  } catch {
    return fallbackProducts;
  }
}

export default async function SaleSection() {
  const products = await getSaleProducts();

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <h2 className="section-title mb-10">Powered by Real Grains</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product: any) => {
            const discount = product.discountPercent || product.discount || Math.round(((product.mrp - product.price) / product.mrp) * 100);
            return (
              <Link key={product._id} href={`/products/${product.slug}`} className="group">
                <div className="bg-cream rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300">
                  {/* Image area */}
                  <div className="relative aspect-square bg-cream flex items-center justify-center overflow-hidden">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-4">
                        <div className="w-32 h-40 bg-gradient-to-b from-green-400 to-green-600 rounded-xl flex flex-col items-center justify-center text-white shadow-lg">
                          <span className="text-[8px] font-bold tracking-widest opacity-70">VITALICIOUS</span>
                          <span className="font-brand text-sm font-black">GRAIN<span className="text-yellow-300">ZZ</span></span>
                          <div className="w-10 h-10 bg-white/20 rounded-full mt-2" />
                          <span className="text-[7px] mt-1 opacity-70">RAGI CHIPS</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    {discount > 0 && (
                      <span className="text-xs text-accent font-semibold">upto {discount}% off</span>
                    )}
                    <h3 className="font-bold text-text-main text-sm mt-1 group-hover:text-primary transition-colors">{product.name}</h3>
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-2 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors">
                        Buy Now
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                          <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

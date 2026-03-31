'use client';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, SlidersHorizontal } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { getProducts } from '@/lib/api';

const categories = ['Puffed Rice', 'Healthy Chips', 'Grain Puffs', 'Combos', 'Gift Packs'];
const sortOptions = [
  { label: 'Best Selling', value: 'best-selling' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Newest', value: 'newest' },
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('best-selling');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const search = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';

  useEffect(() => {
    if (categoryParam && !selectedCategories.includes(categoryParam)) {
      setSelectedCategories([categoryParam]);
    }
  }, [categoryParam]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '9', sort };
      if (selectedCategories.length === 1) params.category = selectedCategories[0];
      if (search) params.search = search;
      const res = await getProducts(params);
      if (page === 1) setProducts(res.data || []);
      else setProducts((prev) => [...prev, ...(res.data || [])]);
      setTotal(res.pagination?.total || 0);
    } catch { }
    finally { setLoading(false); }
  }, [page, sort, selectedCategories, search]);

  useEffect(() => { setPage(1); }, [sort, selectedCategories, search]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const totalPages = Math.ceil(total / 9);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-black text-text-main">
          {search ? `Search: "${search}"` : selectedCategories.length === 1 ? selectedCategories[0] : 'All Products'}
        </h1>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters (desktop) */}
        <aside className="hidden lg:block w-52 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            {/* Sort */}
            <div>
              <h3 className="text-sm font-bold mb-3">Sort by</h3>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="input-field text-xs py-2"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-sm font-bold mb-3 flex items-center justify-between">
                Categories <span className="text-xs font-normal text-primary">▲</span>
              </h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="rounded border-gray-200 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-text-muted">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div>
              <h3 className="text-sm font-bold mb-3">Availability</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-200 text-primary focus:ring-primary" />
                <span className="text-sm text-text-muted">In Stock</span>
              </label>
            </div>

            {/* Bundles */}
            <div>
              <h3 className="text-sm font-bold mb-3">Bundles</h3>
              <div className="space-y-2">
                {['Combos', 'Gift Packs'].map((b) => (
                  <label key={b} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-200 text-primary focus:ring-primary" />
                    <span className="text-sm text-text-muted">{b}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1">
          {/* Mobile sort + filter controls */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="input-field text-xs py-2 max-w-[160px]"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline text-xs py-2 flex items-center gap-1"
            >
              <SlidersHorizontal size={14} /> Filter
            </button>
          </div>

          <p className="text-sm text-text-muted mb-4">{loading ? 'Loading...' : `${total} Products`}</p>

          {/* Grid */}
          {loading && products.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array(9).fill(0).map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-text-muted">
              <p className="text-lg font-semibold">No products found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:border-primary hover:text-primary transition-colors"
              >
                Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 text-sm rounded-lg border transition-colors ${page === p ? 'bg-primary text-white border-primary' : 'border-gray-200 hover:border-primary hover:text-primary'}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:border-primary hover:text-primary transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

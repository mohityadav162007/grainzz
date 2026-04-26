'use client';
import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, SlidersHorizontal, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';
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
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-green border-t-transparent rounded-full animate-spin" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
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
      setProducts(res.data || []);
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
    <div className="bg-[#FCF9F2] min-h-screen pb-[100px]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[120px] pt-[32px]">
        {/* Breadcrumb */}
        <div className="flex items-center gap-[8px] text-[13px] md:text-[14px] font-semibold text-[#8E8E8E] mb-[24px] tracking-wide">
          <Link href="/" className="hover:text-brand-green transition-colors">Home</Link>
          <ChevronRight size={14} />
          <span className="text-brand-black">{search ? 'Search Results' : 'All Products'}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-[40px] gap-[20px]">
          <h1 className="text-[32px] md:text-[45px] font-bold text-brand-black font-brand tracking-tight m-0">
            {search ? `Search: "${search}"` : selectedCategories.length === 1 ? selectedCategories[0] : 'All Products'}
          </h1>
          <p className="text-[14px] md:text-[16px] text-[#707070] font-medium hidden md:block">
            {loading ? 'Loading...' : `Showing ${products.length} of ${total} results`}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-[48px] items-start">
          {/* Sidebar Filters (desktop) */}
          <aside className="hidden lg:block w-[240px] flex-shrink-0">
            <div className="sticky top-[120px] space-y-[32px]">
              
              {/* Filter Headers */}
              <div className="flex items-center gap-[12px] pb-[16px] border-b border-[#EAEAEA]">
                <Filter size={20} className="text-brand-black" />
                <h3 className="text-[20px] font-bold text-brand-black font-sans leading-none m-0">Filters</h3>
              </div>

              {/* Sort */}
              <div className="space-y-[16px]">
                <h3 className="text-[16px] font-bold text-brand-black uppercase tracking-wider">Sort by</h3>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full appearance-none bg-white border border-[#CCCCCC] rounded-[8px] px-[16px] py-[12px] text-[15px] font-semibold text-brand-black focus:outline-none focus:border-brand-green cursor-pointer shadow-sm"
                  >
                    {sortOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronRight size={16} className="absolute right-[16px] top-[14px] pointer-events-none transform rotate-90 text-[#707070]" />
                </div>
              </div>

              <div className="w-full h-[1px] bg-[#EAEAEA]" />

              {/* Categories */}
              <div className="space-y-[16px]">
                <h3 className="text-[16px] font-bold text-brand-black uppercase tracking-wider flex items-center justify-between">
                  Categories
                </h3>
                <div className="space-y-[12px]">
                  {categories.map((cat) => (
                    <label key={cat} className="flex items-center gap-[12px] cursor-pointer group">
                      <div className={`w-[20px] h-[20px] rounded-[4px] border ${selectedCategories.includes(cat) ? 'bg-brand-green border-brand-green' : 'bg-white border-[#CCCCCC] group-hover:border-brand-green'} flex items-center justify-center transition-colors`}>
                        {selectedCategories.includes(cat) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className={`text-[15px] font-medium transition-colors ${selectedCategories.includes(cat) ? 'text-brand-green' : 'text-[#555555]'}`}>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products Column */}
          <div className="flex-1 w-full">
            {/* Mobile filter button */}
            <div className="flex items-center justify-between mb-[24px] lg:hidden">
              <p className="text-[14px] text-[#707070] font-medium m-0">
                {loading ? 'Loading...' : `${total} Products`}
              </p>
              <button
                onClick={() => setShowFilters(true)}
                className="bg-white border border-[#EAEAEA] rounded-[8px] text-[14px] font-bold py-[10px] px-[16px] flex items-center gap-[8px] shadow-sm active:scale-95 transition-all text-brand-black"
              >
                <SlidersHorizontal size={16} /> Filters & Sort
              </button>
            </div>

            {/* Grid */}
            {loading && products.length === 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-[16px] md:gap-[32px]">
                {Array(9).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-[20px] aspect-[4/5] animate-pulse shadow-sm" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-[100px] bg-white rounded-[20px] border border-[#EAEAEA] text-center px-4">
                <div className="w-[80px] h-[80px] bg-[#EEFBDC] rounded-full flex items-center justify-center mb-[24px]">
                  <Filter className="w-10 h-10 text-brand-green opacity-50" />
                </div>
                <h3 className="text-[24px] font-bold text-brand-black mb-2">No products found</h3>
                <p className="text-[16px] text-[#707070] font-medium">Try adjusting your filters or search query.</p>
                {selectedCategories.length > 0 && (
                  <button onClick={() => setSelectedCategories([])} className="mt-[24px] text-brand-green font-bold underline">
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-[16px] md:gap-[32px]">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-[8px] mt-[64px]">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-[20px] h-[48px] font-bold text-[15px] bg-white border border-[#CCCCCC] rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:border-brand-green hover:text-brand-green transition-all shadow-sm flex items-center justify-center"
                >
                  Previous
                </button>
                <div className="flex items-center gap-[8px]">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    // Logic to show pages around current page
                    let p = i + 1;
                    if (totalPages > 5 && page > 3) {
                      p = page - 3 + i + (page + 2 > totalPages ? totalPages - page : 0);
                    }
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-[48px] h-[48px] font-bold text-[15px] rounded-full border transition-all shadow-sm flex items-center justify-center
                          ${page === p 
                            ? 'bg-brand-green text-white border-brand-green' 
                            : 'bg-white border-[#CCCCCC] text-[#555555] hover:border-brand-green hover:text-brand-green'}`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-[20px] h-[48px] font-bold text-[15px] bg-white border border-[#CCCCCC] rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:border-brand-green hover:text-brand-green transition-all shadow-sm flex items-center justify-center"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="relative w-[320px] max-w-[85vw] h-full bg-white flex flex-col pt-0 animate-slide-in-right shadow-[0_0_40px_rgba(0,0,0,0.1)]">
            
            <div className="flex items-center justify-between p-[24px] border-b border-[#EAEAEA] bg-[#FCF9F2]">
              <h3 className="text-[20px] font-bold text-brand-black m-0">Filters & Sort</h3>
              <button 
                onClick={() => setShowFilters(false)}
                className="w-[40px] h-[40px] rounded-full bg-white border border-[#EAEAEA] flex items-center justify-center hover:scale-105 transition-transform"
              >
                <X size={20} className="text-brand-black" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-[24px] space-y-[32px]">
              {/* Sort */}
              <div className="space-y-[16px]">
                <h3 className="text-[16px] font-bold text-brand-black uppercase tracking-wider">Sort by</h3>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full appearance-none bg-white border border-[#CCCCCC] rounded-[8px] px-[16px] py-[12px] text-[15px] font-semibold text-brand-black focus:outline-none focus:border-brand-green"
                  >
                    {sortOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronRight size={16} className="absolute right-[16px] top-[14px] pointer-events-none transform rotate-90 text-[#707070]" />
                </div>
              </div>

              <div className="w-full h-[1px] bg-[#EAEAEA]" />

              {/* Categories */}
              <div className="space-y-[16px]">
                <h3 className="text-[16px] font-bold text-brand-black uppercase tracking-wider">
                  Categories
                </h3>
                <div className="space-y-[16px]">
                  {categories.map((cat) => (
                    <label key={cat} className="flex items-center gap-[12px] cursor-pointer">
                      <div className={`w-[24px] h-[24px] rounded-[6px] border flex items-center justify-center transition-colors 
                        ${selectedCategories.includes(cat) ? 'bg-brand-green border-brand-green' : 'bg-[#FCF9F2] border-[#CCCCCC]'}`}>
                        {selectedCategories.includes(cat) && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className={`text-[16px] font-semibold ${selectedCategories.includes(cat) ? 'text-brand-green' : 'text-brand-black'}`}>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-[24px] border-t border-[#EAEAEA] bg-white flex gap-[12px]">
              <button 
                onClick={() => setSelectedCategories([])}
                className="flex-1 py-[16px] border border-brand-black text-brand-black rounded-full font-bold text-[16px]"
              >
                Clear
              </button>
              <button 
                onClick={() => setShowFilters(false)}
                className="flex-1 py-[16px] bg-brand-green text-white rounded-full font-bold text-[16px]"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

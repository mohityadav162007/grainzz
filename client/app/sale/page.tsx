'use client';
import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, ChevronDown, ChevronUp, X } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { getProducts } from '@/lib/api';

const productCategories = ['Puffed Rice', 'Healthy Chips', 'Grainzz Puffs'];
const bundleCategories = ['Combos', 'Gift Packs'];
const discountOptions = ['Upto 40% off', 'Upto 10% off'];
const sortOptions = [
  { label: 'Best Selling', value: 'best-selling' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Newest', value: 'newest' },
];

export default function SalePage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-green border-t-transparent rounded-full animate-spin" /></div>}>
      <SaleContent />
    </Suspense>
  );
}

function SaleContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSale, setShowSale] = useState<boolean | null>(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('best-selling');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);
  const [excludeOutOfStock, setExcludeOutOfStock] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [sortOpen, setSortOpen] = useState(true);
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [discountOpen, setDiscountOpen] = useState(true);
  const [availabilityOpen, setAvailabilityOpen] = useState(true);
  const [bundlesOpen, setBundlesOpen] = useState(true);

  const search = searchParams.get('search') || '';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Check visibility first
      const { getStoreSettings } = await import('@/lib/api');
      const settings = await getStoreSettings();
      if (settings.show_sale_page === 'false') {
        setShowSale(false);
        window.location.href = '/products';
        return;
      }
      setShowSale(true);

      const params: Record<string, string> = { page: String(page), limit: '9', sort, isSale: 'true' };
      if (selectedCategories.length === 1) params.category = selectedCategories[0];
      if (search) params.search = search;
      if (excludeOutOfStock) params.inStock = 'true';
      const res = await getProducts(params);
      let items = res.data || [];
      setProducts(items);
      setTotal(res.pagination?.total || 0);
    } catch { }
    finally { setLoading(false); }
  }, [page, sort, selectedCategories, search, excludeOutOfStock]);

  useEffect(() => { setPage(1); }, [sort, selectedCategories, search, excludeOutOfStock, selectedDiscounts]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };
  const toggleDiscount = (d: string) => {
    setSelectedDiscounts((prev) =>
      prev.includes(d) ? prev.filter((v) => v !== d) : [...prev, d]
    );
  };

  const totalPages = Math.ceil(total / 9);

  const getPaginationItems = () => {
    const items: (number | '...')[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      items.push(1);
      if (page > 3) items.push('...');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) items.push(i);
      if (page < totalPages - 2) items.push('...');
      items.push(totalPages);
    }
    return items;
  };

  const Checkbox = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) => (
    <label className="flex items-center gap-[10px] cursor-pointer group py-[2px]">
      <div
        onClick={(e) => { e.preventDefault(); onChange(); }}
        className={`w-[18px] h-[18px] rounded-[3px] border-[1.5px] flex items-center justify-center flex-shrink-0 transition-colors ${
          checked ? 'bg-brand-green border-brand-green' : 'bg-white border-[#D1D1D1] group-hover:border-[#999]'
        }`}
      >
        {checked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
      </div>
      <span className={`text-[14px] transition-colors ${checked ? 'text-brand-black font-medium' : 'text-[#555] font-normal'}`}>{label}</span>
    </label>
  );

  const SectionHeader = ({ title, open, toggle }: { title: string; open: boolean; toggle: () => void }) => (
    <button onClick={toggle} className="flex items-center justify-between w-full py-[4px] group">
      <span className="text-[15px] font-semibold text-brand-black">{title}</span>
      {open ? <ChevronUp size={16} className="text-[#999]" /> : <ChevronDown size={16} className="text-[#999]" />}
    </button>
  );

  return (
    <div className="bg-white min-h-screen pb-[80px]">
      <div className="max-w-[1280px] mx-auto px-4 md:px-[40px] lg:px-[60px] pt-[40px]">
        {/* Page Heading */}
        <h1 className="text-[28px] md:text-[36px] font-bold text-[#C41E3A] tracking-tight m-0 mb-[32px] italic">
          Sale!
        </h1>

        <div className="flex gap-[40px] lg:gap-[48px] items-start">
          {/* ─── Sidebar ─── */}
          <aside className="hidden lg:block w-[200px] flex-shrink-0">
            <div className="sticky top-[120px] space-y-[24px]">
              {/* Sort by */}
              <div>
                <SectionHeader title="Sort by" open={sortOpen} toggle={() => setSortOpen(!sortOpen)} />
                {sortOpen && (
                  <div className="mt-[12px]">
                    <div className="relative">
                      <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="w-full appearance-none bg-white border border-[#D1D1D1] rounded-[6px] px-[14px] py-[10px] text-[14px] font-medium text-brand-black focus:outline-none focus:border-brand-green cursor-pointer"
                      >
                        {sortOptions.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-[12px] top-[12px] pointer-events-none text-[#999]" />
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full h-[1px] bg-[#E8E8E8]" />

              {/* Categories */}
              <div>
                <SectionHeader title="Categories" open={categoriesOpen} toggle={() => setCategoriesOpen(!categoriesOpen)} />
                {categoriesOpen && (
                  <div className="mt-[12px] space-y-[10px]">
                    {productCategories.map((cat) => (
                      <Checkbox key={cat} checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)} label={cat} />
                    ))}
                  </div>
                )}
              </div>

              <div className="w-full h-[1px] bg-[#E8E8E8]" />

              {/* Discount */}
              <div>
                <SectionHeader title="Discount" open={discountOpen} toggle={() => setDiscountOpen(!discountOpen)} />
                {discountOpen && (
                  <div className="mt-[12px] space-y-[10px]">
                    {discountOptions.map((d) => (
                      <Checkbox key={d} checked={selectedDiscounts.includes(d)} onChange={() => toggleDiscount(d)} label={d} />
                    ))}
                  </div>
                )}
              </div>

              <div className="w-full h-[1px] bg-[#E8E8E8]" />

              {/* Availability */}
              <div>
                <SectionHeader title="Availability" open={availabilityOpen} toggle={() => setAvailabilityOpen(!availabilityOpen)} />
                {availabilityOpen && (
                  <div className="mt-[12px] space-y-[10px]">
                    <Checkbox checked={excludeOutOfStock} onChange={() => setExcludeOutOfStock(!excludeOutOfStock)} label="Exclude out of stock" />
                  </div>
                )}
              </div>

              <div className="w-full h-[1px] bg-[#E8E8E8]" />

              {/* Bundles */}
              <div>
                <SectionHeader title="Bundles" open={bundlesOpen} toggle={() => setBundlesOpen(!bundlesOpen)} />
                {bundlesOpen && (
                  <div className="mt-[12px] space-y-[10px]">
                    {bundleCategories.map((cat) => (
                      <Checkbox key={cat} checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)} label={cat} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* ─── Products Column ─── */}
          <div className="flex-1 w-full min-w-0">
            <div className="flex items-center justify-between mb-[20px]">
              <p className="text-[15px] text-[#707070] font-medium m-0">
                {loading ? 'Loading...' : `${total} Products`}
              </p>
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden bg-white border border-[#E0E0E0] rounded-[8px] text-[14px] font-semibold py-[8px] px-[14px] flex items-center gap-[6px] active:scale-95 transition-all text-brand-black"
              >
                <SlidersHorizontal size={15} /> Filters
              </button>
            </div>

            {/* Grid */}
            {loading && products.length === 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-[20px] md:gap-[24px]">
                {Array(9).fill(0).map((_, i) => (
                  <div key={i} className="bg-[#F5F5F5] rounded-[12px] aspect-[3/4] animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-[80px] text-center">
                <h3 className="text-[22px] font-bold text-brand-black mb-2">No sale products at the moment</h3>
                <p className="text-[15px] text-[#707070]">Check back soon for amazing deals!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-[20px] md:gap-[24px]">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-[4px] mt-[48px]">
                <button
                  onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={page === 1}
                  className="px-[12px] h-[36px] text-[14px] font-medium bg-transparent border-none text-[#707070] disabled:opacity-30 disabled:cursor-not-allowed hover:text-brand-black transition-colors"
                >
                  Prev
                </button>
                {getPaginationItems().map((item, idx) => (
                  item === '...' ? (
                    <span key={`dots-${idx}`} className="w-[36px] h-[36px] flex items-center justify-center text-[14px] text-[#999]">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => { setPage(item as number); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className={`w-[36px] h-[36px] text-[14px] font-medium rounded-[6px] transition-all flex items-center justify-center ${
                        page === item
                          ? 'bg-brand-green text-white'
                          : 'bg-transparent text-[#555] hover:bg-[#F0F0F0]'
                      }`}
                    >
                      {item}
                    </button>
                  )
                ))}
                <button
                  onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={page === totalPages}
                  className="px-[12px] h-[36px] text-[14px] font-medium bg-transparent border-none text-[#707070] disabled:opacity-30 disabled:cursor-not-allowed hover:text-brand-black transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Mobile Filters Drawer ─── */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="relative w-[300px] max-w-[85vw] h-full bg-white flex flex-col animate-slide-in-right shadow-xl">
            <div className="flex items-center justify-between p-[20px] border-b border-[#E8E8E8]">
              <h3 className="text-[18px] font-bold text-brand-black m-0">Filters & Sort</h3>
              <button onClick={() => setShowFilters(false)} className="w-[36px] h-[36px] rounded-full bg-[#F5F5F5] flex items-center justify-center">
                <X size={18} className="text-brand-black" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-[20px] space-y-[24px]">
              <div>
                <span className="text-[15px] font-semibold text-brand-black block mb-[10px]">Sort by</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full appearance-none bg-white border border-[#D1D1D1] rounded-[6px] px-[14px] py-[10px] text-[14px] font-medium text-brand-black focus:outline-none focus:border-brand-green">
                  {sortOptions.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                </select>
              </div>
              <div className="w-full h-[1px] bg-[#E8E8E8]" />
              <div>
                <span className="text-[15px] font-semibold text-brand-black block mb-[10px]">Categories</span>
                <div className="space-y-[10px]">
                  {productCategories.map((cat) => (<Checkbox key={cat} checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)} label={cat} />))}
                </div>
              </div>
              <div className="w-full h-[1px] bg-[#E8E8E8]" />
              <div>
                <span className="text-[15px] font-semibold text-brand-black block mb-[10px]">Discount</span>
                <div className="space-y-[10px]">
                  {discountOptions.map((d) => (<Checkbox key={d} checked={selectedDiscounts.includes(d)} onChange={() => toggleDiscount(d)} label={d} />))}
                </div>
              </div>
              <div className="w-full h-[1px] bg-[#E8E8E8]" />
              <div>
                <span className="text-[15px] font-semibold text-brand-black block mb-[10px]">Availability</span>
                <Checkbox checked={excludeOutOfStock} onChange={() => setExcludeOutOfStock(!excludeOutOfStock)} label="Exclude out of stock" />
              </div>
              <div className="w-full h-[1px] bg-[#E8E8E8]" />
              <div>
                <span className="text-[15px] font-semibold text-brand-black block mb-[10px]">Bundles</span>
                <div className="space-y-[10px]">
                  {bundleCategories.map((cat) => (<Checkbox key={cat} checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)} label={cat} />))}
                </div>
              </div>
            </div>
            <div className="p-[20px] border-t border-[#E8E8E8] flex gap-[10px]">
              <button onClick={() => { setSelectedCategories([]); setSelectedDiscounts([]); setExcludeOutOfStock(false); }} className="flex-1 py-[12px] border border-brand-black text-brand-black rounded-full font-bold text-[14px]">Clear</button>
              <button onClick={() => setShowFilters(false)} className="flex-1 py-[12px] bg-brand-green text-white rounded-full font-bold text-[14px]">Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

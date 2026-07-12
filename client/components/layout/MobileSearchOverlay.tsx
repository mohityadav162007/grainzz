'use client';
import { useState, useEffect, useRef } from 'react';
import Image from '@/components/ui/OptimizedImage';
import Link from 'next/link';
import { X, Search as SearchIcon, ShoppingCart } from 'lucide-react';
import { getProducts } from '@/lib/api';
import ProductCard from '@/components/products/ProductCard';
import { useCartStore } from '@/store/cartStore';

interface MobileSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSearchOverlay({ isOpen, onClose }: MobileSearchOverlayProps) {
  const { items, itemCount, openCart } = useCartStore();
  const [count, setCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setCount(itemCount()); }, [items, itemCount]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Only apply overflow hidden and focus stealing if it's actually mobile view
    const isMobile = window.innerWidth < 1024;
    
    if (isOpen) {
      if (isMobile) {
        document.body.style.overflow = 'hidden';
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } else {
      document.body.style.overflow = '';
      setSearchQuery('');
      setResults([]);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await getProducts({ search: searchQuery.trim(), limit: '10' });
        setResults(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#FBF5EB] flex flex-col lg:hidden animate-fade-in pb-4">
      {/* Header */}
      <div className="flex w-full h-[64px] px-4 items-center justify-between flex-shrink-0">
        <div className="flex items-center flex-1">
          <button onClick={onClose} className="p-1 -ml-1 text-[#222222]">
            <X size={24} strokeWidth={2} />
          </button>
        </div>
        <Link href="/" onClick={onClose} className="flex-shrink-0 flex items-center justify-center flex-[2]">
          <Image src="/image-2@2x.png" alt="Grainzz Logo" width={140} height={40} className="object-contain h-[32px]" priority />
        </Link>
        <div className="flex items-center justify-end gap-5 flex-1">
          <button className="text-[#222222]">
            <SearchIcon size={24} strokeWidth={2} />
          </button>
          <button onClick={() => { onClose(); openCart(); }} className="text-[#222222] relative pb-1">
            <ShoppingCart size={24} strokeWidth={2} />
            {count > 0 && <span className="absolute -top-1.5 -right-2 bg-brand-red text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{count}</span>}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 mt-2 flex-shrink-0">
        <div className="w-full h-[46px] bg-white rounded-full border border-[#E0E0E0] shadow-sm flex items-center px-4 focus-within:border-brand-green transition-colors">
          <SearchIcon size={18} strokeWidth={2.5} className="text-[#707070] mr-2" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for .."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-full bg-transparent border-none outline-none text-[15px] text-[#222222] placeholder:text-[#A0A0A0]"
          />
        </div>
      </div>

      {/* Results Area */}
      {searchQuery.trim() && (
        <div className="flex-1 overflow-y-auto px-4 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-brand-black">Top Results for {searchQuery}</h3>
            <span className="text-[13px] text-[#8E8E8E] font-medium">{results.length} results</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 pb-10">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-white/50 rounded-[12px] h-[300px] animate-pulse shadow-sm border border-[#E0E0E0]" />
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 pb-20">
              {results.map((product) => (
                <div key={product.id} onClick={onClose}>
                   {/* Wrapping with a div to intercept clicks and close search when a product is clicked */}
                   <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#707070] text-[15px]">No products found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


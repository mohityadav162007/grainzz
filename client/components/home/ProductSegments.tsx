'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';
import ProductCardSkeleton from '@/components/products/ProductCardSkeleton';
import { supabase } from '@/lib/supabase';
import { getHomepageProductTabs, getSiteContent, getActiveOffersMap, applyOffersToProduct } from '@/lib/api';
import { ChevronRight, ArrowRight } from 'lucide-react';

interface TabData {
  title: string;
  product_ids: string[];
}

export default function ProductSegments() {
  const [tabs, setTabs] = useState<TabData[]>([]);
  const [activeTab, setActiveTab] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [heading, setHeading] = useState('Our Product Segments');

  // Fetch tabs + heading on mount
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        // Fetch heading
        getSiteContent('product_tabs_heading').then((content) => {
          if (content?.heading) setHeading(content.heading);
        }).catch(() => {});

        // Fetch product tabs from DB
        const tabsData = await getHomepageProductTabs();
        if (tabsData.length > 0) {
          setTabs(tabsData);
          setActiveTab(tabsData[0].title);
        }
      } catch {
        setTabs([]);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Fetch products when active tab changes
  useEffect(() => {
    if (!activeTab || tabs.length === 0) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const currentTab = tabs.find((t) => t.title === activeTab);
        if (!currentTab || !currentTab.product_ids || currentTab.product_ids.length === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .in('id', currentTab.product_ids)
          .eq('is_active', true);

        if (error) throw error;

        const offersMap = await getActiveOffersMap();

        // Sanitize placeholder links and apply active offers pricing
        const sanitized = (data || []).map((prod: any) => {
          if (prod && Array.isArray(prod.images)) {
            prod.images = prod.images.map((img: string) =>
              img.includes('placeholder.jpg') ? '/image-2@2x.png' : img
            );
          }
          return applyOffersToProduct(prod, offersMap);
        });

        setProducts(sanitized);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeTab, tabs]);

  const [activeIndex, setActiveIndex] = useState(0);

  // Tab icon helper
  const getTabIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('bestseller')) return '⭐';
    if (t.includes('rice')) return '☁️';
    if (t.includes('chip')) return '🥔';
    if (t.includes('puff')) return '🟡';
    return '✨';
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    if (maxScroll <= 0) {
      if (activeIndex !== 0) setActiveIndex(0);
      return;
    }
    const progress = Math.max(0, Math.min(1, scrollLeft / maxScroll));
    const newIndex = Math.round(progress * (products.length - 1));
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  // Don't render section if no tabs configured
  if (!loading && tabs.length === 0) return null;

  return (
    <section className="py-[40px] md:py-[60px] bg-white w-full overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[100px]">
        <h2 className="text-[24px] md:text-[32px] font-semibold text-center text-brand-black mb-[24px] md:mb-[48px] tracking-tight font-sans">
          {heading}
        </h2>

        {/* Category tabs */}
        <div className="flex flex-wrap items-center justify-center gap-[10px] md:gap-[16px] mb-[32px] md:mb-[48px]">
          {tabs.map((tab) => (
            <button
              key={tab.title}
              onClick={() => { setActiveTab(tab.title); setActiveIndex(0); }}
              className={`flex items-center gap-2 px-[16px] md:px-[32px] py-[8px] md:py-[12px] rounded-full text-[13px] md:text-[16px] font-semibold transition-all duration-300 border-[1.5px]
                ${activeTab === tab.title
                  ? 'bg-brand-green text-white border-brand-green shadow-md'
                  : 'bg-transparent text-[#666666] border-transparent hover:bg-brand-light hover:text-brand-green hover:border-brand-green'
                }`}
            >
              <span className="text-lg leading-none">{getTabIcon(tab.title)}</span>
              {tab.title}
            </button>
          ))}
        </div>

        {/* Products grid / slider */}
        {loading ? (
          <div className="flex items-stretch md:grid md:grid-cols-3 lg:grid-cols-4 gap-[12px] md:gap-[32px] overflow-x-auto pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="min-w-[45vw] w-[45vw] md:w-auto md:min-w-0 h-auto">
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-[#999999] text-[16px]">No snacks found in this category.</div>
        ) : (
          <div className="relative w-full">
            <div 
              onScroll={handleScroll}
              className="flex items-stretch md:grid md:grid-cols-3 lg:grid-cols-4 gap-[12px] md:gap-[32px] overflow-x-auto snap-x snap-mandatory pb-4 md:pb-0 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {products.map((product: any) => (
                <div key={product.id} className="min-w-[45vw] w-[45vw] md:w-auto md:min-w-0 snap-start shrink-0 h-auto">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* Mobile Pagination Indicators */}
            <div className="flex md:hidden items-center justify-center gap-3 mt-4 mb-2">
              <button 
                onClick={() => {
                  const el = document.querySelector('.hide-scrollbar');
                  if (el) el.scrollBy({ left: -window.innerWidth * 0.75, behavior: 'smooth' });
                }}
                className="text-gray-400 p-1"
              >
                <ChevronRight size={16} className="rotate-180" />
              </button>
              
              <div className="flex items-center gap-2">
                {products.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-2 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-6 bg-[#1a5b23]' : 'w-2 bg-gray-200'}`}
                  />
                ))}
              </div>

              <button 
                onClick={() => {
                  const el = document.querySelector('.hide-scrollbar');
                  if (el) el.scrollBy({ left: window.innerWidth * 0.75, behavior: 'smooth' });
                }}
                className="text-gray-400 p-1"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* View All Button */}
        <div className="flex justify-center mt-[32px] md:mt-[64px]">
          <Link 
            href="/products" 
            className="inline-flex items-center justify-between gap-4 md:gap-8 bg-white border border-[#D1EAD3] text-brand-green pl-6 md:pl-10 pr-1 md:pr-2 py-1 md:py-2 rounded-full transition-all group hover:border-brand-green hover:bg-brand-green hover:text-white"
          >
            <span className="font-semibold text-[14px] md:text-[20px] leading-[132%]">View All Products</span>
            <div className="w-8 h-8 md:w-12 md:h-12 bg-brand-green group-hover:bg-white rounded-full flex items-center justify-center text-white group-hover:text-brand-green transition-colors">
              <ArrowRight size={18} strokeWidth={2.5} className="md:w-6 md:h-6" />
            </div>
          </Link>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </section>
  );
}

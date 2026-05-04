'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';
import { supabase } from '@/lib/supabase';
import { getHomepageProductTabs, getSiteContent } from '@/lib/api';
import { ChevronRight } from 'lucide-react';

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

        // Sanitize placeholder links
        const sanitized = (data || []).map((prod: any) => {
          if (prod && Array.isArray(prod.images)) {
            prod.images = prod.images.map((img: string) =>
              img.includes('placeholder.jpg') ? '/image-2@2x.png' : img
            );
          }
          return prod;
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

  // Don't render section if no tabs configured
  if (!loading && tabs.length === 0) return null;

  return (
    <section className="py-[40px] md:py-[60px] bg-white w-full">
      <div className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[100px]">
        <h2 className="text-[24px] md:text-[32px] font-bold text-center text-brand-black mb-[32px] md:mb-[48px] tracking-tight font-sans">
          {heading}
        </h2>

        {/* Category tabs */}
        <div className="flex flex-wrap items-center justify-center gap-[12px] md:gap-[16px] mb-[48px]">
          {tabs.map((tab) => (
            <button
              key={tab.title}
              onClick={() => setActiveTab(tab.title)}
              className={`px-[24px] py-[10px] md:px-[32px] md:py-[12px] rounded-full text-[14px] md:text-[16px] font-bold transition-all duration-300 border-[1.5px]
                ${activeTab === tab.title
                  ? 'bg-brand-green text-white border-brand-green shadow-md'
                  : 'bg-transparent text-[#666666] border-[#CCCCCC] hover:border-brand-black hover:text-brand-black'
                }`}
            >
              {tab.title}
            </button>
          ))}
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="h-[300px] flex items-center justify-center text-[#999999] text-[16px] animate-pulse">Gathering bestsellers...</div>
        ) : products.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-[#999999] text-[16px]">No snacks found in this category.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[20px] md:gap-[32px]">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="flex justify-center mt-[48px] md:mt-[64px]">
          <Link 
            href="/products" 
            className="inline-flex items-center justify-between gap-[24px] md:gap-[34px] bg-transparent border-[1.5px] border-brand-green text-brand-green hover:bg-brand-green hover:text-white pl-[24px] md:pl-[38px] pr-[6px] md:pr-[8px] py-[6px] md:py-[8px] rounded-[40px] transition-all group"
          >
            <span className="font-bold text-[16px] md:text-[20px] leading-[132%] capitalize">Load More</span>
            <div className="w-[40px] h-[40px] md:w-[50px] md:h-[50px] bg-brand-green group-hover:bg-white rounded-full flex items-center justify-center text-white group-hover:text-brand-green transition-colors">
              <ChevronRight size={24} strokeWidth={2.5} />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

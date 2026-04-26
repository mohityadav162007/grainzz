'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';
import { supabase } from '@/lib/supabase';
import { getSiteContent } from '@/lib/api';
import { ChevronRight } from 'lucide-react';

const tabs = [
  { label: 'Bestsellers', value: '' },
  { label: 'Jar Combos', value: 'Combos' },
  { label: 'Puffed Rice Combos', value: 'Puffed Rice' },
  { label: 'Shop All Jars', value: 'all-jars' },
];

export default function ProductSegments() {
  const [activeTab, setActiveTab] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [heading, setHeading] = useState('Explore the Grainzz Snack Range');
  const [subheading, setSubheading] = useState('From supergrain jars to puffed rice packets and value-packed combos, discover snacks made for every craving and every kind of muncher.');

  // Fetch heading content
  useEffect(() => {
    getSiteContent('product_tabs_heading').then((content) => {
      if (content) {
        if (content.heading) setHeading(content.heading);
        if (content.subheading) setSubheading(content.subheading);
      }
    }).catch(() => {});
  }, []);

  // Fetch products based on tab
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('products')
          .select('*')
          .eq('is_active', true);

        if (activeTab === '') {
          // Bestsellers - sort by views/popularity
          query = query.order('views', { ascending: false });
        } else if (activeTab === 'all-jars') {
          // All jars - filter categories that are jars (Healthy Chips, Grain Puffs)
          query = query.in('category', ['Healthy Chips', 'Grain Puffs']);
        } else {
          query = query.eq('category', activeTab);
        }

        query = query.limit(8);

        const { data, error } = await query;
        if (error) throw error;
        setProducts(data || []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeTab]);

  return (
    <section className="py-[40px] md:py-[80px] bg-white w-full">
      <div className="max-w-[1440px] mx-auto px-4 md:px-[80px]">
        <h2 className="text-[28px] md:text-[40px] font-bold text-center text-brand-black mb-[12px] md:mb-[16px] leading-tight tracking-tight">
          {heading}
        </h2>
        <p className="text-center text-[#6B6B6B] text-[14px] md:text-[18px] max-w-3xl mx-auto mb-[32px] md:mb-[40px] leading-[1.4]">
          {subheading}
        </p>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-[12px] md:gap-[16px] justify-center mb-[32px] md:mb-[48px]">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.value)}
              className={`px-[16px] py-[8px] md:px-[24px] md:py-[12px] rounded-full text-[14px] md:text-[16px] font-semibold transition-all duration-200 border
                ${activeTab === tab.value
                  ? 'bg-brand-green text-white border-brand-green shadow-md'
                  : 'bg-[#F7F7F7] text-[#6B6B6B] border-transparent hover:border-brand-green hover:text-brand-green'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="h-[200px] md:h-[300px] flex items-center justify-center text-[#6B6B6B] text-[16px] md:text-[18px]">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="h-[200px] md:h-[300px] flex items-center justify-center text-[#6B6B6B] text-[16px] md:text-[18px]">No products found in this category</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[16px] md:gap-[30px]">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="flex justify-center mt-[32px] md:mt-[48px]">
          <Link href="/products" className="inline-flex items-center gap-[8px] md:gap-[10px] bg-white border-2 border-brand-green text-brand-green px-[24px] py-[12px] md:px-[32px] md:py-[14px] rounded-full font-bold text-[16px] md:text-[18px] hover:bg-brand-green hover:text-white transition-all group">
            View All Products
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

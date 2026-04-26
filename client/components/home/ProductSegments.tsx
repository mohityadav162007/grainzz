'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';
import { supabase } from '@/lib/supabase';
import { getSiteContent } from '@/lib/api';

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
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <h2 className="section-title mb-3">{heading}</h2>
        <p className="text-center text-text-muted text-sm md:text-base max-w-2xl mx-auto mb-8">{subheading}</p>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.value)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-200
                ${activeTab === tab.value
                  ? 'bg-primary text-white border-primary'
                  : 'border-gray-200 text-text-muted hover:border-primary hover:text-primary'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="h-64 flex items-center justify-center text-text-muted">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-text-muted">No products found in this category</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

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

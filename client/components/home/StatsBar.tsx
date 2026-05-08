'use client';
import { useState, useEffect } from 'react';
import { Heart, ShieldCheck, Package, MapPin, Leaf, Star, Flame, Award } from 'lucide-react';
import { getTrustMetrics } from '@/lib/api';

const iconMap: Record<string, any> = {
  Heart, ShieldCheck, Package, MapPin, Leaf, Star, Flame, Award,
};

export default function StatsBar() {
  const [stats, setStats] = useState<any[] | null>(null); // null = loading

  useEffect(() => {
    let cancelled = false;
    getTrustMetrics()
      .then((data) => {
        if (cancelled) return;
        setStats(data && data.length > 0 ? data : []);
      })
      .catch(() => { if (!cancelled) setStats([]); });
    return () => { cancelled = true; };
  }, []);

  // Loading — skeleton
  if (stats === null) {
    return (
      <section className="bg-white py-[60px] md:py-[100px] w-full">
        <div className="max-w-[1440px] mx-auto px-4 md:px-[120px]">
          <div className="h-10 w-72 bg-gray-100 rounded-lg mx-auto mb-[48px] animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[24px] md:gap-[32px]">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex flex-col items-center justify-center text-center rounded-[20px] py-[40px] px-[20px] md:py-[56px] border border-[#EEEEEE]">
                <div className="w-[64px] h-[64px] md:w-[80px] md:h-[80px] bg-gray-100 rounded-full mb-[24px] animate-pulse" />
                <div className="h-12 w-28 bg-gray-100 rounded mb-[12px] animate-pulse" />
                <div className="h-4 w-36 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Hardcoded fallback stats matching the reference
  const fallbackStats = [
    { label: 'customers served', value: '5000+', icon: 'Heart' },
    { label: 'products sold', value: '30,000+', icon: 'Package' },
    { label: 'packets sold', value: '15,000+', icon: 'ShieldCheck' }, // Using ShieldCheck as a bag fallback if needed, or Package
    { label: 'Indian states served', value: '29+', icon: 'MapPin' },
  ];

  const displayStats = stats && stats.length > 0 ? stats : fallbackStats;

  if (stats === null) {
    // Keep loading state until we know if DB has data or we use fallback
    return (
      <section className="bg-white py-[40px] md:py-[100px] w-full">
        <div className="max-w-[1440px] mx-auto px-4 md:px-[120px]">
          <div className="h-10 w-72 bg-gray-100 rounded-lg mx-auto mb-[48px] animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[24px] md:gap-[32px]">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex flex-col items-center justify-center text-center rounded-[20px] py-[40px] px-[20px] md:py-[56px] border border-[#EEEEEE]">
                <div className="w-[64px] h-[64px] md:w-[80px] md:h-[80px] bg-gray-100 rounded-full mb-[24px] animate-pulse" />
                <div className="h-12 w-28 bg-gray-100 rounded mb-[12px] animate-pulse" />
                <div className="h-4 w-36 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#FFFBF0] py-[40px] md:py-[60px] w-full">
      <div className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[100px]">
        <h2 className="text-[28px] md:text-[40px] font-semibold text-center text-[#1A1A1A] mb-[32px] md:mb-[48px] leading-[1.2] font-sans tracking-tight">
          Our Numbers Talk
        </h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[24px] md:gap-[32px]">
          {displayStats.map((stat) => {
            return (
              <div 
                key={stat.label} 
                className="flex flex-col items-center justify-center text-center"
              >
                <span className="text-[28px] md:text-[42px] font-bold text-[#1A5B23] leading-[1] mb-[4px] md:mb-[8px] font-sans tracking-tight">
                  {stat.value}
                </span>
                <span className="text-[13px] md:text-[15px] font-medium text-[#4A4A4A] tracking-normal font-sans">
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

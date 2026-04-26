'use client';
import { useState, useEffect } from 'react';
import { Heart, ShieldCheck, Package, MapPin, Leaf, Star, Flame, Award } from 'lucide-react';
import { getTrustMetrics } from '@/lib/api';

const iconMap: Record<string, any> = {
  Heart, ShieldCheck, Package, MapPin, Leaf, Star, Flame, Award,
};

const fallbackStats = [
  { value: '5000+', label: 'customers served', icon: 'Heart' },
  { value: '30,000+', label: 'products sold', icon: 'Package' },
  { value: '15,000+', label: 'packets sold', icon: 'ShieldCheck' },
  { value: '29+', label: 'Indian states served', icon: 'MapPin' },
];

export default function StatsBar() {
  const [stats, setStats] = useState(fallbackStats);

  useEffect(() => {
    getTrustMetrics()
      .then((data) => {
        if (data.length > 0) setStats(data);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="bg-brand-light py-[40px] md:py-[80px] border-y border-[#E4E4E4]/50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-brand-yellow/10 rounded-full blur-[60px] md:blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[150px] h-[150px] md:w-[300px] md:h-[300px] bg-brand-green/5 rounded-full blur-[40px] md:blur-[80px] pointer-events-none" />
      
      <div className="max-w-[1440px] mx-auto px-4 md:px-[80px] relative z-10">
        <h2 className="text-[28px] md:text-[40px] font-bold text-center text-brand-black mb-[32px] md:mb-[48px] leading-tight max-w-[600px] mx-auto">
          Our Numbers Talk
        </h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[16px] md:gap-[32px]">
          {stats.map((stat) => {
            const Icon = iconMap[stat.icon] || Heart;
            return (
              <div key={stat.label} className="flex flex-col items-center text-center bg-white rounded-[16px] md:rounded-[24px] py-[24px] px-[12px] md:py-[40px] md:px-[24px] border border-[#E4E4E4] hover:shadow-[0_12px_24px_rgba(29,94,32,0.06)] hover:border-brand-green/30 transition-all duration-300 group">
                <div className="w-[48px] h-[48px] md:w-[64px] md:h-[64px] bg-[#EEFBDC] border border-brand-green/20 rounded-[12px] md:rounded-[16px] flex items-center justify-center mb-[16px] md:mb-[24px] group-hover:bg-brand-green group-hover:border-brand-green transition-colors duration-300">
                  <Icon className="text-brand-green w-6 h-6 md:w-8 md:h-8 group-hover:text-white transition-colors duration-300" strokeWidth={2} />
                </div>
                <span className="text-[24px] md:text-[40px] font-black text-brand-black leading-none mb-[4px] md:mb-[8px]">{stat.value}</span>
                <span className="text-[12px] md:text-[16px] mt-[4px] font-bold text-[#6B6B6B] uppercase tracking-wider">{stat.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

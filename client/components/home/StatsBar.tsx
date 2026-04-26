'use client';
import { useState, useEffect } from 'react';
import { Heart, ShieldCheck, Package, MapPin, Leaf, Star, Flame, Award } from 'lucide-react';
import { getTrustMetrics } from '@/lib/api';

const iconMap: Record<string, any> = {
  Heart, ShieldCheck, Package, MapPin, Leaf, Star, Flame, Award,
};

const fallbackStats = [
  { value: '5000+', label: 'Customers Served', icon: 'Heart' },
  { value: '30,000+', label: 'Products Sold', icon: 'Package' },
  { value: '15,000+', label: 'Packets Sold', icon: 'ShieldCheck' },
  { value: '29+', label: 'Indian States Served', icon: 'MapPin' },
];

export default function StatsBar() {
  const [stats, setStats] = useState(fallbackStats);

  useEffect(() => {
    getTrustMetrics()
      .then((data) => {
        if (data && data.length > 0) setStats(data);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="bg-white py-[60px] md:py-[100px] w-full">
      <div className="max-w-[1440px] mx-auto px-4 md:px-[120px]">
        <h2 className="text-[32px] md:text-[44px] font-bold text-center text-brand-black mb-[48px] md:mb-[64px] leading-[1.2] font-sans tracking-tight">
          Our Numbers Talk
        </h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[24px] md:gap-[32px]">
          {stats.map((stat) => {
            const Icon = iconMap[stat.icon] || Heart;
            return (
              <div 
                key={stat.label} 
                className="flex flex-col items-center justify-center text-center bg-white rounded-[20px] py-[40px] px-[20px] md:py-[56px] border border-[#EEEEEE] hover:border-brand-green/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 group"
              >
                <div className="w-[64px] h-[64px] md:w-[80px] md:h-[80px] bg-[#EEFBDC] rounded-full flex items-center justify-center mb-[24px] transition-transform duration-500 group-hover:scale-110">
                  <Icon className="text-brand-green w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />
                </div>
                <span className="text-[36px] md:text-[48px] font-black text-brand-black leading-[1] mb-[12px] font-sans tracking-tight">
                  {stat.value}
                </span>
                <span className="text-[14px] md:text-[16px] font-bold text-[#666666] tracking-wider uppercase font-sans">
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

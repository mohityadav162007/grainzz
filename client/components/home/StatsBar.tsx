'use client';
import { Heart, ShieldCheck, Package, MapPin } from 'lucide-react';

const stats = [
  { value: '5000+', label: 'customers served', icon: Heart },
  { value: '30,000+', label: 'products sold', icon: Package },
  { value: '15,000+', label: 'packets sold', icon: ShieldCheck },
  { value: '29+', label: 'Indian states served', icon: MapPin },
];

export default function StatsBar() {
  return (
    <section className="bg-white py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <h2 className="section-title mb-8">Our Numbers Talk</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.value} className="flex flex-col items-center text-center bg-cream-100 rounded-2xl py-6 px-4 border border-gray-100">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <Icon size={20} className="text-primary" />
                </div>
                <span className="text-2xl md:text-3xl font-black text-text-main">{stat.value}</span>
                <span className="text-sm text-text-muted mt-1">{stat.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

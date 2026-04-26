'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

const categories = [
  { 
    title: 'Vegetable Chips', 
    subtitle: 'upto 40% off', 
    topBg: 'bg-[#C68356]', // Earthy warm color 
    bottomBg: 'bg-[#FDECE7]', // Light peach
    image: '/Rectangle-10@2x.png',
    link: '/collections/vegetable-chips'
  },
  { 
    title: 'Vegetable Chips', 
    subtitle: 'upto 40% off', 
    topBg: 'bg-[#C68356]', 
    bottomBg: 'bg-[#EEFCD3]', // Light pale green
    image: '/Rectangle-10@2x.png',
    link: '/collections/popped-chips'
  },
  { 
    title: 'Vegetable Chips', 
    subtitle: 'upto 40% off', 
    topBg: 'bg-[#C68356]', 
    bottomBg: 'bg-[#FDECE7]', // Light peach
    image: '/Rectangle-10@2x.png',
    link: '/collections/grain-puffs'
  }
];

export default function PoweredBy() {
  return (
    <section className="py-16 bg-white w-full">
      <div className="max-w-[1100px] mx-auto px-4 md:px-10">
        
        <h2 className="text-[32px] md:text-[38px] font-semibold text-[#1A1A1A] text-center mb-10 font-sans tracking-tight">
          Powered by Real Grains
        </h2>
      
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {categories.map((cat, idx) => (
            <div key={idx} className="flex flex-col w-full rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-shadow duration-300">
              {/* Top Image Section */}
              <div className={`w-full aspect-square md:aspect-auto md:h-[280px] lg:h-[320px] relative flex flex-col justify-end items-center ${cat.topBg} pt-8 pb-4`}>
                 <div className="h-[90%] w-full relative">
                   <Image 
                     src={cat.image} 
                     alt={cat.title} 
                     fill
                     className="object-contain drop-shadow-xl"
                   />
                 </div>
              </div>

              {/* Bottom Content Section */}
              <div className={`w-full flex flex-col items-center text-center px-6 py-6 ${cat.bottomBg}`}>
                <p className="text-[13px] font-medium text-[#7A7A7A] mb-1">
                  {cat.subtitle}
                </p>
                <h3 className="text-[20px] lg:text-[22px] font-bold text-[#2A2A2A] mb-5 tracking-tight">
                  {cat.title}
                </h3>
                
                <Link 
                  href={cat.link}
                  className="inline-flex items-center justify-between w-[140px] border border-[#a8a8a8] bg-transparent pl-4 pr-1 py-1 rounded-full hover:bg-black/5 transition-colors group"
                >
                  <span className="font-bold text-[13px] text-[#444444]">Buy Now</span>
                  <div className="w-8 h-8 bg-[#1E5E28] rounded-full flex items-center justify-center text-white shrink-0 group-hover:bg-[#15461c] transition-colors">
                    <ArrowRight size={16} strokeWidth={2.5}/>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

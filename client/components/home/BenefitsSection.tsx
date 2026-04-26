'use client';
import { useState, useEffect } from 'react';
import { Leaf, Flame, Star, Flag, Droplets, Wheat, Feather, Heart, ShieldCheck, Check } from 'lucide-react';
import { getBenefits, getAvailabilityLogos, getSiteContent } from '@/lib/api';

const iconMap: Record<string, any> = {
  Leaf, Flame, Star, Flag, Droplets, Wheat, Feather, Heart, ShieldCheck,
};

const fallbackBenefits = [
  { icon: 'Droplets', title: 'No Palm Oil. No Compromise.', description: 'We skip palm oil for cleaner, lighter snacks. Every bite is free from the heavy, greasy feeling you get with conventional chips.' },
  { icon: 'Wheat', title: 'Powered by Real Millets & Grains', description: 'Ragi, bajra, quinoa, jowar, and oats — we use real supergrains for more substance, more fibre, and more nutrition in every pack.' },
  { icon: 'Flame', title: 'Bold Indian Flavours', description: 'Modern takes on beloved desi flavours — Royal Mint, Tandoori Masala, and Zesty Chilli — that make healthy snacking genuinely exciting.' },
  { icon: 'Feather', title: 'Lightness You Can Feel', description: 'No heavy after-feeling. Just light, crunchy snacks designed for whenever hunger strikes — guilt-free from the first bite to the last.' },
];

export default function BenefitsSection() {
  const [benefits, setBenefits] = useState(fallbackBenefits);
  const [heading, setHeading] = useState('Healthy Snacking With Benefits That Truly Matter');
  const [intro, setIntro] = useState('Every Grainzz snack is built to give you bold flavour, better ingredients and a lighter snacking experience — without making healthy feel boring.');
  const [logos, setLogos] = useState<any[]>([
    { name: 'Amazon', href: 'https://www.amazon.in' },
    { name: 'Blinkit', href: 'https://blinkit.com' },
    { name: 'MyStore', href: 'https://mystore.in' },
  ]);

  useEffect(() => {
    getBenefits().then((data) => { if (data.length > 0) setBenefits(data); }).catch(() => {});
    getAvailabilityLogos().then((data) => { if (data.length > 0) setLogos(data); }).catch(() => {});
    getSiteContent('benefits_heading').then((content) => {
      if (content) {
        if (content.heading) setHeading(content.heading);
        if (content.intro) setIntro(content.intro);
      }
    }).catch(() => {});
  }, []);

  return (
    <>
      <section className="py-[40px] md:py-[80px] bg-brand-light">
        <div className="max-w-[1440px] mx-auto px-4 md:px-[80px]">
          <div className="grid md:grid-cols-2 gap-[40px] md:gap-[60px] lg:gap-[100px] items-center">
            
            {/* Image Replacement Area */}
            <div className="relative w-full max-w-[340px] mx-auto md:max-w-none aspect-square md:aspect-auto md:h-[600px] bg-white rounded-[24px] md:rounded-[32px] shadow-sm flex flex-col items-center justify-center p-6 md:p-8 overflow-hidden border border-[#E4E4E4]/50">
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-brand-yellow/20 via-brand-light/30 to-white pointer-events-none" />
               <div className="relative z-10 w-full max-w-[240px] md:max-w-[300px] aspect-[3/4] bg-gradient-to-tr from-brand-green to-[#2d7a31] rounded-[24px] shadow-[0_20px_40px_rgba(29,94,32,0.2)] flex flex-col items-center justify-center text-white transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                  <span className="text-[10px] md:text-[12px] font-bold tracking-[0.2em] mb-2 opacity-80 backdrop-blur-sm bg-white/10 px-3 md:px-4 py-1 rounded-full border border-white/20">VITALICIOUS</span>
                  <span className="font-sans text-[36px] md:text-[48px] font-black tracking-tight leading-none mt-2">GRAIN<span className="text-brand-yellow">ZZ</span></span>
                  <div className="w-[60px] h-[60px] md:w-[80px] md:h-[80px] bg-white/10 rounded-full mt-6 md:mt-8 border-2 border-white/20 shadow-inner flex items-center justify-center">
                    <Leaf size={28} className="text-white/80 md:w-8 md:h-8" />
                  </div>
                  <span className="text-[12px] md:text-[14px] mt-4 md:mt-6 opacity-90 font-bold uppercase tracking-wider">Premium Series</span>
               </div>
               
               {/* Claims Floating */}
               <div className="relative z-10 flex flex-wrap gap-[8px] md:gap-[12px] mt-[24px] md:mt-[40px] justify-center px-2 md:px-4">
                  {['No Palm Oil', 'Gluten-Free', 'Zero Cholesterol'].map((claim) => (
                    <span key={claim} className="bg-white text-brand-green text-[12px] md:text-[14px] font-bold px-[12px] py-[6px] md:px-[16px] md:py-[8px] rounded-full border border-brand-green/20 shadow-sm flex items-center gap-1 md:gap-2 hover:bg-brand-green hover:text-white transition-colors cursor-default">
                      <Check size={14} strokeWidth={3} className="md:w-4 md:h-4" />
                      {claim}
                    </span>
                  ))}
               </div>
            </div>

            {/* Benefits Content */}
            <div className="flex flex-col">
              <h2 className="text-[28px] md:text-[40px] font-bold text-brand-black mb-[12px] md:mb-[16px] leading-[1.2] tracking-tight text-center md:text-left">
                {heading}
              </h2>
              <p className="text-[14px] md:text-[18px] text-[#6B6B6B] leading-[1.6] mb-[32px] md:mb-[48px] text-center md:text-left">
                {intro}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-[32px] md:gap-y-[40px] gap-x-[32px]">
                {benefits.map((benefit) => {
                  const Icon = iconMap[benefit.icon] || Leaf;
                  return (
                    <div key={benefit.title} className="flex flex-col gap-[12px] md:gap-[16px] items-center text-center md:items-start md:text-left">
                      <div className="w-[48px] h-[48px] md:w-[56px] md:h-[56px] bg-white shadow-sm border border-brand-green/10 rounded-[12px] md:rounded-[16px] flex items-center justify-center flex-shrink-0 group hover:bg-brand-green transition-colors duration-300">
                        <Icon size={24} className="text-brand-green group-hover:text-white transition-colors duration-300 md:w-7 md:h-7" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="text-[18px] md:text-[20px] font-bold text-brand-black mb-[4px] md:mb-[8px] leading-[1.3]">{benefit.title}</h3>
                        <p className="text-[14px] md:text-[15px] font-medium text-[#6B6B6B] leading-[1.5]">{benefit.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Also Available on strip */}
      <div className="bg-[#FFFFFF] border-y border-[#E4E4E4]">
        <div className="max-w-[1440px] mx-auto w-full min-h-[80px] h-auto px-4 md:px-[80px] flex items-center justify-center py-4 md:py-0">
          <div className="flex flex-col md:flex-row items-center gap-[16px] md:gap-[40px] overflow-x-auto w-full justify-center scrollbar-hide py-2">
            <span className="text-[16px] md:text-[18px] font-semibold text-brand-black whitespace-nowrap">Also Available on :</span>
            <div className="flex flex-wrap justify-center gap-[24px] md:gap-[32px] items-center">
              {logos.map((logo) => (
                <a
                  key={logo.name}
                  href={logo.href || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center opacity-80 hover:opacity-100 hover:scale-105 transition-all"
                >
                  {logo.logo_url ? (
                    <img src={logo.logo_url} alt={logo.name} className="h-[32px] md:h-[40px] object-contain grayscale hover:grayscale-0 transition-all duration-300" />
                  ) : (
                    <span className="font-bold text-[16px] md:text-[20px] text-[#6B6B6B] uppercase tracking-wider">{logo.name}</span>
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Droplets, Wheat, ShieldCheck, Heart } from 'lucide-react';

const fallbackBenefits = [
  { icon: 'Droplets', title: 'Clean Snacking', description: 'We\'ve removed the "bad stuff". Our snacks are crafted with zero palm oil, zero trans fat, and no added preservatives.' },
  { icon: 'Wheat', title: 'Powered by Supergrains', description: 'We skip refined flour (maida). Instead, we use a base of nutrient-dense millets and grains like Jowar, Bajra, Quinoa, and Oats.' },
  { icon: 'Heart', title: 'Roasted, Not Deep-Fried', description: 'We believe great taste shouldn\'t come at the cost of your heart health. That\'s why we use roasting techniques instead of deep-frying.' },
  { icon: 'ShieldCheck', title: 'Bold, Authentic & Indian', description: 'We refuse to let "healthy" mean "bland." We use real spices and natural seasonings to bring you the nostalgic zing of Indian food.' },
];

const iconMap: Record<string, any> = {
  Droplets, Wheat, Heart, ShieldCheck
};

export default function BenefitsSection() {
  const [benefits] = useState(fallbackBenefits);
  const heading = 'Healthy Snacking With\nBenefits Beyond The Ordinary';

  return (
    <>
      <section className="py-[40px] md:py-[60px] bg-[#EEFBDC] w-full">
        <div className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[100px]">
          <div className="flex flex-col lg:flex-row items-stretch gap-[32px] md:gap-[60px]">
            
            {/* Visual Box */}
            <div className="w-full lg:w-[480px] relative rounded-[16px] overflow-hidden flex-shrink-0 min-h-[360px] md:min-h-[500px]">
              <Image 
                src="/benefits-image.png" 
                alt="Enjoying Grainzz Bajra Puffs"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 480px"
              />
            </div>

            {/* Text & Grid Content */}
            <div className="flex-1 flex flex-col items-start w-full py-[16px]">
              <h2 className="text-[28px] md:text-[36px] font-semibold text-brand-black mb-[32px] md:mb-[40px] leading-[1.2] whitespace-pre-line tracking-tight">
                {heading}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[32px] gap-y-[32px] md:gap-y-[48px] w-full">
                {benefits.map((benefit) => {
                  const Icon = iconMap[benefit.icon] || Heart;
                  return (
                    <div key={benefit.title} className="flex flex-col gap-[16px] items-start max-w-[280px]">
                      <div className="w-[50px] h-[50px] bg-white rounded-full text-brand-green flex items-center justify-center flex-shrink-0 shadow-sm border border-[#EAEAEA]">
                        <Icon size={22} strokeWidth={2} />
                      </div>
                      <div className="flex flex-col gap-[10px]">
                        <h3 className="text-[18px] md:text-[20px] font-semibold text-brand-black leading-[1.3] tracking-tight">{benefit.title}</h3>
                        <p className="text-[14px] md:text-[15px] font-medium text-[#4A4A4A] leading-[1.6]">{benefit.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Marquee Also Available On */}
      <div className="bg-brand-green w-full overflow-hidden border-b border-[#0f3d13]">
        <div className="py-[12px] md:py-[16px] flex whitespace-nowrap animate-marquee items-center min-w-max text-white" style={{ animationDuration: '60s' }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex items-center">
              <span className="text-[16px] md:text-[18px] font-bold tracking-wide mr-[16px]">Also Available on:</span>
              <div className="flex items-center gap-[24px] mx-[16px]">
                <a href="https://www.amazon.in/stores/GRAINZZ/page/D592ACFC-CB1C-4ED5-9636-89B17E7C955C?lp_asin=B0G1TKBT28&ref_=cm_sw_r_ud_ast_store_XFZ37JTDT6VE7CQS5HQH&store_ref=bl_ast_dp_brandlogo_sto" target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform cursor-pointer block">
                  <img src="/Amazon-logo-1.svg" alt="Amazon" className="h-[28px] md:h-[32px] object-contain invert brightness-0" />
                </a>
                <a href="https://blinkit.com/prn/x/prid/766665" target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform cursor-pointer block">
                  <img src="/blinkit-logo.svg" alt="Blinkit" className="h-[28px] md:h-[32px] object-contain" />
                </a>
              </div>
              <span className="mx-[24px] text-[18px] md:text-[24px] text-white">✦</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

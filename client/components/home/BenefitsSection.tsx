import Image from 'next/image';
import { Droplets, Wheat, ShieldCheck, Heart } from 'lucide-react';

const fallbackBenefits = [
  { icon: 'Droplets', title: 'Real Grains. No Palm Oil. No Maida.', description: 'No palm oil. No maida. 0g trans fat. Zero cholesterol. Across every chip, puff and puffed-rice pack. The kind of label you actually want your kids reading.' },
  { icon: 'Wheat', title: 'Powered by Supergrains', description: 'Every Grainzz snack is built on Indian supergrains — ragi, bajra, jowar, quinoa and oats. Ragi alone delivers about 344mg of calcium per 100g of grain (ICMR-NIN), one of the highest of any cereal. You are snacking on real grain nutrition, not refined flour.' },
  { icon: 'Heart', title: 'Roasted, Never Fried', description: 'Grainzz grain puffs (bajra, jowar, quinoa) and flavoured puffed rice are roasted, never deep-fried. Roasting crisps with heat instead of an oil bath, which keeps fat low and lets the grain do the work.' },
  { icon: 'ShieldCheck', title: 'Bold, Authentic & Indian', description: 'We use real Indian spices and natural seasonings to deliver the authentic zing of Indian flavours — without the guilt. Healthy snacking should never be bland.' },
];

const iconMap: Record<string, any> = {
  Droplets, Wheat, Heart, ShieldCheck
};

export default function BenefitsSection() {
  const benefits = fallbackBenefits;
  const heading = 'Healthy Snacking With Benefits Beyond The Ordinary';
  const subLine = 'Grainzz makes millet-based snacks for honest, everyday Indian snacking — millet chips, roasted grain puffs, and roasted flavoured puffed rice. No palm oil. No maida. 0g trans fat. Zero cholesterol. Shipped across India.';

  return (
    <>
      <section className="py-[40px] md:py-[60px] bg-[#EEFBDC] w-full">
        <div className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[100px]">
          <div className="flex flex-col lg:flex-row items-stretch gap-[32px] md:gap-[60px]">
            
            {/* Visual Box */}
            <div className="w-full lg:w-[480px] relative rounded-[16px] overflow-hidden flex-shrink-0 min-h-[360px] md:min-h-[500px]">
              <Image 
                src="/benefits-image.webp" 
                alt="Enjoying Grainzz Bajra Puffs"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 480px"
              />
            </div>

            {/* Text & Grid Content */}
            <div className="flex-1 flex flex-col items-start w-full py-[16px]">
              <h2 className="text-[28px] md:text-[36px] font-semibold text-brand-black mb-[16px] md:mb-[20px] leading-[1.2] whitespace-pre-line tracking-tight">
                {heading}
              </h2>
              <p className="text-[14px] md:text-[16px] text-[#4A4A4A] leading-[1.65] mb-[32px] md:mb-[40px] max-w-[600px] font-normal">
                {subLine}
              </p>
              
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

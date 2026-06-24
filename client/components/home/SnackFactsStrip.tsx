import React from 'react';

const facts = [
  {
    stat: '38%',
    label: 'India leads the world in millets.',
    detail: '~38% of global millet production comes from India (FAO, 2023).',
  },
  {
    stat: '344mg',
    label: 'Ragi is calcium-rich.',
    detail: '344mg of calcium per 100g of grain — among the highest of any cereal (ICMR-NIN).',
  },
  {
    stat: '30–40%',
    label: 'Deep-fried chips soak oil.',
    detail: 'Typical deep-fried chips contain oil at ~30–40% of their finished weight (food-science literature).',
  },
];

export default function SnackFactsStrip() {
  return (
    <section className="bg-[#1A1A1A] w-full py-[28px] md:py-[36px]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[100px]">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px] md:gap-[40px]">
          {facts.map((fact) => (
            <div key={fact.stat} className="flex flex-col gap-[6px]">
              <div className="flex items-baseline gap-[10px]">
                <span className="text-[28px] md:text-[36px] font-bold text-white leading-none">
                  {fact.stat}
                </span>
                <span className="text-[14px] md:text-[15px] font-semibold text-[#EEFBDC]">
                  {fact.label}
                </span>
              </div>
              <p className="text-[12px] md:text-[13px] text-[#888] leading-[1.5] font-normal">
                {fact.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

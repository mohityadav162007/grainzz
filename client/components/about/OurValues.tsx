'use client';
import { useState } from 'react';
import Image from '@/components/ui/AppImage';

const values = [
  {
    title: 'We are Bold',
    desc: 'We are not here to make healthy snacking feel safe, plain or forgettable. Grainzz stands for bold flavours, bold choices and the courage to give familiar grains a completely new identity.',
    image: '/value-bold.webp',
  },
  {
    title: 'We are Honest',
    desc: 'We believe people do not need complicated snack promises. They need products that taste good, feel lighter and are built with better ingredient choices. Our communication stays clear, simple and real.',
    image: '/value-authentic.webp',
  },
  {
    title: 'We are Mindful',
    desc: 'Every Grainzz product is built around everyday snacking moments. We think about what people actually eat, when they eat it and how to make that choice better without making it difficult.',
    image: '/value-mindful.webp',
  },
];

export default function OurValues() {
  const [active, setActive] = useState(0);

  return (
    <section className="py-[64px] md:py-[96px] bg-[#FBF5EB] w-full">
      <div className="max-w-[1200px] mx-auto px-4 md:px-[40px] lg:px-[60px]">
        <h2 className="text-[28px] md:text-[36px] font-bold text-center text-brand-black mb-[40px] tracking-tight">
          Our Values
        </h2>

        {/* Desktop: expanding cards */}
        <div className="hidden md:flex gap-[16px] h-[420px] lg:h-[460px]">
          {values.map((v, i) => (
            <div
              key={i}
              onMouseEnter={() => setActive(i)}
              className={`relative overflow-hidden rounded-[16px] cursor-pointer transition-all duration-500 ease-in-out ${
                active === i ? 'flex-[2.2]' : 'flex-[0.8]'
              }`}
            >
              {/* Background image */}
              <Image
                src={v.image}
                alt={v.title}
                fill
                className="object-cover"
                sizes="(max-width: 1200px) 50vw, 33vw"
              />

              {/* Gradient overlay */}
              <div className={`absolute inset-0 transition-all duration-500 ${
                active === i
                  ? 'bg-gradient-to-t from-black/70 via-black/30 to-transparent'
                  : 'bg-gradient-to-t from-black/60 via-black/20 to-transparent'
              }`} />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-[28px] lg:p-[36px]">
                <h3 className={`font-bold text-white leading-[1.2] tracking-tight transition-all duration-500 ${
                  active === i ? 'text-[24px] lg:text-[28px] mb-[12px]' : 'text-[18px] lg:text-[20px] mb-0'
                }`} style={{ fontStyle: 'italic' }}>
                  {v.title}
                </h3>
                <div className={`overflow-hidden transition-all duration-500 ${
                  active === i ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <p className="text-white/90 text-[13px] lg:text-[14px] leading-[1.65] font-normal max-w-[440px]">
                    {v.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: stacked cards */}
        <div className="md:hidden space-y-[12px]">
          {values.map((v, i) => (
            <div
              key={i}
              onClick={() => setActive(active === i ? -1 : i)}
              className="relative overflow-hidden rounded-[14px] cursor-pointer"
            >
              <div className={`relative w-full transition-all duration-500 ${
                active === i ? 'h-[280px]' : 'h-[120px]'
              }`}>
                <Image
                  src={v.image}
                  alt={v.title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
                <div className={`absolute inset-0 ${
                  active === i
                    ? 'bg-gradient-to-t from-black/70 via-black/30 to-transparent'
                    : 'bg-gradient-to-t from-black/60 via-black/20 to-transparent'
                }`} />
                <div className="absolute inset-0 flex flex-col justify-end p-[20px]">
                  <h3 className={`font-bold text-white leading-[1.2] tracking-tight transition-all duration-300 ${
                    active === i ? 'text-[22px] mb-[8px]' : 'text-[18px] mb-0'
                  }`} style={{ fontStyle: 'italic' }}>
                    {v.title}
                  </h3>
                  <div className={`overflow-hidden transition-all duration-500 ${
                    active === i ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <p className="text-white/90 text-[13px] leading-[1.6] font-normal">
                      {v.desc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


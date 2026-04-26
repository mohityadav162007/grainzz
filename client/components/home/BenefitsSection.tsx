'use client';
import { useState, useEffect } from 'react';
import { Leaf, Flame, Star, Flag, Droplets, Wheat, Feather, Heart, ShieldCheck } from 'lucide-react';
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
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative">
              <div className="bg-white rounded-3xl p-8 flex items-center justify-center min-h-[360px] shadow-sm">
                <div className="relative w-full max-w-xs mx-auto">
                  {/* Product jar visual */}
                  <div className="w-48 h-64 mx-auto bg-gradient-to-b from-green-400 to-green-600 rounded-2xl flex flex-col items-center justify-center text-white text-center shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-30" />
                    <span className="text-[10px] font-bold tracking-widest mb-1 opacity-70 relative z-10">VITALICIOUS</span>
                    <span className="font-brand text-2xl font-black tracking-tight relative z-10">GRAIN<span className="text-yellow-300">ZZ</span></span>
                    <div className="w-16 h-16 bg-white/20 rounded-full mt-3 relative z-10" />
                    <span className="text-xs mt-2 opacity-80 font-semibold relative z-10">QUINOA PUFFS</span>
                  </div>
                </div>
              </div>

              {/* Core claims as badges */}
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {['No Palm Oil', 'Gluten-Free', 'Zero Cholesterol', 'Real Ingredients'].map((claim) => (
                  <span key={claim} className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
                    ✓ {claim}
                  </span>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-text-main mb-3 leading-tight">
                {heading}
              </h2>
              <p className="text-text-muted text-sm mb-8 leading-relaxed">{intro}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {benefits.map((benefit) => {
                  const Icon = iconMap[benefit.icon] || Leaf;
                  return (
                    <div key={benefit.title} className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon size={16} className="text-primary" />
                        </div>
                        <h3 className="text-sm font-bold text-text-main">{benefit.title}</h3>
                      </div>
                      <p className="text-xs text-text-muted leading-relaxed pl-12">{benefit.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Also Available on strip */}
      <div className="bg-cream-100 border-y border-gray-100 py-4 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <span className="text-sm text-text-muted font-medium whitespace-nowrap">Also Available on:</span>
            {logos.map((logo) => (
              <a
                key={logo.name}
                href={logo.href || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                {logo.logo_url ? (
                  <img src={logo.logo_url} alt={logo.name} className="h-8 object-contain" />
                ) : (
                  <span className="font-bold text-lg text-text-main tracking-tight">{logo.name}</span>
                )}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

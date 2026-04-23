import { Leaf, Flame, Star, Flag } from 'lucide-react';

const benefits = [
  {
    icon: Leaf,
    title: 'Clean Snacking',
    description: 'We believe snacking shouldn\'t be a choice between a greasy bag of chips or a boring diet. All our products are crafted with clean ingredients.',
  },
  {
    icon: Star,
    title: 'Powered by Supergrains',
    description: 'We use the power of ancient supergrains like ragi, bajra, jowar and quinoa to bring you nutritionally dense snacks.',
  },
  {
    icon: Flame,
    title: 'Roasted, Not Deep-Fried',
    description: 'Grainzz snacks go through a roasting process instead of deep frying, delivering all the crunch without the guilt.',
  },
  {
    icon: Flag,
    title: 'Bold, Authentic & Indian',
    description: 'We celebrate Indian flavors fiercely. Our snacks are "desi" at heart, bringing traditional Indian flavors to the modern health-conscious snacker.',
  },
];

export default function BenefitsSection() {
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
            </div>

            {/* Benefits */}
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-text-main mb-8 leading-tight">
                Healthy Snacking With<br />Benefits Beyond The Ordinary
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {benefits.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon size={16} className="text-primary" />
                      </div>
                      <h3 className="text-sm font-bold text-text-main">{title}</h3>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed pl-12">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Also Available on Amazon strip */}
      <div className="bg-cream-100 border-y border-gray-100 py-3 overflow-hidden">
        <div className="marquee-container">
          <div className="marquee-content">
            {Array(8).fill(null).map((_, i) => (
              <div key={i} className="flex items-center gap-6 mx-8">
                <span className="text-sm text-text-muted font-medium whitespace-nowrap">Also Available on:</span>
                <span className="font-bold text-lg text-text-main whitespace-nowrap tracking-tight">amazon</span>
                <span className="text-2xl">🛒</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

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
    <section className="py-16 bg-cream">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative">
            <div className="bg-primary/10 rounded-3xl p-8 flex items-center justify-center min-h-[320px]">
              <div className="text-center">
                <div className="text-8xl mb-4">🫙</div>
                <p className="text-primary font-bold text-xl">Quinoa Puffs</p>
                <p className="text-text-muted text-sm mt-1">Premium Grain Snacks</p>
              </div>
            </div>
            {/* Amazon pill */}
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full px-4 py-2 text-xs font-medium flex items-center gap-2">
              <span>Available on</span>
              <span className="font-bold text-orange-500">amazon</span>
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
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon size={16} className="text-primary" />
                    </div>
                    <h3 className="text-sm font-bold">{title}</h3>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed pl-10">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

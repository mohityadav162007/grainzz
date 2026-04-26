import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'About Us – Grainzz',
  description: 'Learn about Grainzz — India\'s premium healthy grain snacks brand built on real supergrains.',
};

const story = [
  {
    icon: '🌾',
    title: 'From Sidekick to Superhero',
    desc: 'Puffed rice has been a staple of Indian pantries. But it has always been hidden away as a "filler" to traditional preparations. Grainzz saw its hidden potential and gave this low-calorie grain the spotlight it deserves.',
  },
  {
    icon: '🍲',
    title: 'Solving the Flavor Gap',
    desc: 'We noticed that when people made the leap towards puffed grains, they were bored of the plain. We created a bridge for that gap with authentic bold Indian flavors.',
  },
  {
    icon: '✨',
    title: 'Redefining the "Crunch"',
    desc: 'We believe snacking shouldn\'t be a choice between a greasy bag of chips or a boring diet. By perfecting a roasted process, we created a snack that is fun, functional & 100% guilt-free.',
  },
];

const values = [
  { title: 'We are Bold', desc: 'We refuse to settle for bland flavors or traditional deep-frying methods. We are bold about what goes into our snacks.' },
  { title: 'We are Authentic', desc: 'We celebrate Indian roots. Our recipes are inspired by traditional grains that have powered generations.' },
  { title: 'We are Mindful', desc: 'Every ingredient, every process, every pack is thoughtfully designed for your health and the planet.' },
];

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="relative bg-[#B00912] text-white py-[80px] md:py-[120px] px-4 overflow-hidden w-full">
        <div className="absolute inset-0 bg-[#A0000A] opacity-20" />
        <div className="relative max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[120px] grid md:grid-cols-2 gap-[48px] items-center">
          <div>
            <div className="flex gap-[12px] mb-[24px]">
              <span className="text-[14px] font-bold bg-white text-[#B00912] px-[16px] py-[6px] rounded-full uppercase tracking-wider shadow-sm">About Us</span>
              <span className="text-[14px] font-bold bg-brand-green text-white px-[16px] py-[6px] rounded-full uppercase tracking-wider shadow-sm">Made in India ❤️</span>
            </div>
            <h1 className="text-[40px] md:text-[64px] font-bold leading-[1.1] mb-[24px] font-brand tracking-tight">
              We are more than just a Snacking Brand
            </h1>
            <p className="text-white/90 text-[18px] md:text-[22px] leading-[1.5] mb-[40px] font-sans max-w-[500px]">
              Get the power packed shakti of ragi, bajra and jowar now in snack form.
            </p>
            <Link href="/contact" className="bg-brand-green text-white font-bold px-[32px] py-[16px] rounded-full inline-flex items-center gap-[12px] hover:bg-white hover:text-brand-green transition-all text-[18px] shadow-xl group tracking-wide">
              Contact Us <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="hidden md:flex justify-end">
             <div className="w-[400px] h-[400px] border-4 border-white/20 rounded-[40px] flex items-center justify-center text-[180px] rotate-12">
               🌾
             </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-[80px] md:py-[120px] bg-[#FCF9F2] w-full">
        <div className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[120px]">
          <h2 className="text-[36px] md:text-[48px] font-bold text-center text-brand-black mb-[64px] font-brand tracking-tight">
            The Grainzz Story
          </h2>
          <div className="grid md:grid-cols-3 gap-[24px] md:gap-[32px]">
            {story.map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-[24px] p-[40px] border border-[#EAEAEA] shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300">
                <div className="w-[80px] h-[80px] bg-[#EEFBDC] rounded-full flex items-center justify-center text-[40px] mb-[24px]">
                  {icon}
                </div>
                <h3 className="text-[24px] font-bold mb-[16px] text-brand-black font-sans leading-[1.2] tracking-tight">{title}</h3>
                <p className="text-[16px] text-[#666666] leading-[1.6] font-medium font-sans">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="py-[80px] md:py-[120px] bg-brand-green text-white w-full">
        <div className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[120px] grid md:grid-cols-2 gap-[64px] items-center">
          <div>
            <h2 className="text-[36px] md:text-[56px] font-bold mb-[32px] font-brand leading-[1.1] tracking-tight text-white">Meet The Founders</h2>
            <p className="text-white/90 text-[18px] md:text-[20px] leading-[1.6] mb-[24px] font-medium font-sans">
              GRAINZZ was founded by Vibhor Kataria (Operations Specialist) and Rishee Puri (Branding & Marketing Strategist).
              Together, they are building India's next big healthy snacking brand: a homegrown company turning traditional puffed
              rice into a structured, premium snack category.
            </p>
            <p className="text-white/90 text-[18px] md:text-[20px] leading-[1.6] font-medium font-sans">
              They believe every Indian deserves access to snacks that are bold, nutritious, and authentically Indian.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-[400px] aspect-square bg-[#EEFBDC]/10 rounded-[40px] border-2 border-white/20 flex flex-col items-center justify-center pt-8 hover:bg-[#EEFBDC]/20 transition-colors cursor-pointer">
               <div className="text-[120px] mb-4">🤝</div>
               <span className="text-[20px] font-bold tracking-widest uppercase">Vibhor & Rishee</span>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-[80px] md:py-[120px] bg-white w-full border-t border-[#EAEAEA]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[120px]">
          <h2 className="text-[36px] md:text-[48px] font-bold text-center text-brand-black mb-[64px] font-brand tracking-tight">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-[24px] md:gap-[32px]">
            {values.map(({ title, desc }, i) => (
              <div key={title} className={`rounded-[24px] p-[40px] text-white flex flex-col justify-end min-h-[300px] relative overflow-hidden group 
                ${i === 0 ? 'bg-brand-green' : i === 1 ? 'bg-[#D72638]' : 'bg-[#1D1D1D]'}`}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                <div className="relative z-10 transform transition-transform duration-500 group-hover:-translate-y-2">
                  <h3 className="text-[28px] font-bold mb-[16px] font-sans tracking-tight">{title}</h3>
                  <p className="text-white/90 text-[16px] leading-[1.6] font-medium font-sans">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import TeamFavourites from '@/components/about/TeamFavourites';
import OurValues from '@/components/about/OurValues';
import CustomerTestimonials from '@/components/about/CustomerTestimonials';

export const metadata: Metadata = {
  title: 'About Us – Grainzz',
  description: 'Learn about Grainzz — India\'s premium healthy grain snacks brand built on real supergrains.',
};

const story = [
  {
    emoji: '🦸',
    title: 'From Sidekick to Superhero',
    desc: 'Puffed rice is a staple in 90% of Indian homes, yet it has always been hidden away as a "filler" in bhel or namkeens. We felt this humble, light, and low-calorie grain deserved the spotlight.',
  },
  {
    emoji: '🍜',
    title: 'Solving the Flavor Gap',
    desc: 'We realized that while people love the lightness of puffed grains, they were bored of the plain, bland options available. We stepped in to bridge that gap with authentic Indian flavors.',
  },
  {
    emoji: '🍪',
    title: 'Redefining the "Crunch"',
    desc: 'We believe snacking shouldn\'t be a choice between a greasy bag of chips or a boring diet. By perfecting a roasted process, we created a snack that is fun, functional, & 100% guilt-free.',
  },
];



export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="w-full">
        <div className="flex flex-col md:flex-row min-h-[420px] md:min-h-[560px]">
          {/* Left — Image */}
          <div className="w-full md:w-[50%] relative overflow-hidden bg-[#C24A2B]">
            <Image
              src="/about-hero.jpg"
              alt="Grainzz snack products on a table"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Right — Content */}
          <div className="w-full md:w-[50%] bg-[#FBF5EB] flex items-center">
            <div className="w-full px-[32px] md:px-[56px] lg:px-[80px] py-[48px] md:py-[64px] relative">
              {/* Made in India badge */}
              <div className="absolute top-[32px] md:top-[40px] right-[32px] md:right-[56px] lg:right-[80px]">
                <span className="inline-flex items-center gap-[6px] bg-[#A01A1A] text-white text-[12px] md:text-[13px] font-semibold px-[14px] py-[7px] rounded-full shadow-sm">
                  Made in India with love <span className="text-[14px]">❤️</span>
                </span>
              </div>

              {/* About Us label */}
              <span className="text-[14px] md:text-[15px] font-semibold text-brand-green tracking-wide block mb-[16px]">
                About Us
              </span>

              {/* Heading */}
              <h1 className="text-[32px] md:text-[40px] lg:text-[48px] font-bold text-brand-black leading-[1.12] tracking-tight mb-[16px] md:mb-[20px] max-w-[480px]">
                We are more than just a Snacking Brand
              </h1>

              {/* Subtitle */}
              <p className="text-[15px] md:text-[16px] text-[#555] leading-[1.6] mb-[28px] md:mb-[36px] max-w-[440px] font-normal">
                Get the power packed shakti of ragi, bajra and jowar now in snack form.
              </p>

              {/* CTA */}
              <Link
                href="/contact"
                className="inline-flex items-center gap-[16px] border-[1.5px] border-brand-black text-brand-black pl-[24px] pr-[6px] py-[6px] rounded-full hover:border-brand-green hover:text-brand-green transition-all group"
              >
                <span className="text-[15px] font-semibold">Contact Us</span>
                <div className="w-[36px] h-[36px] bg-brand-green rounded-full flex items-center justify-center text-white group-hover:bg-[#154617] transition-colors">
                  <ArrowRight size={18} strokeWidth={2.5} />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-[64px] md:py-[96px] bg-white w-full">
        <div className="max-w-[1200px] mx-auto px-4 md:px-[40px] lg:px-[60px]">
          <h2 className="text-[28px] md:text-[36px] font-bold text-center text-brand-black mb-[48px] tracking-tight">
            The Grainzz Story
          </h2>
          <div className="grid md:grid-cols-3 gap-[20px] md:gap-[24px]">
            {story.map(({ emoji, title, desc }) => (
              <div key={title} className="bg-[#F5F3EF] rounded-[16px] px-[28px] py-[36px] text-center flex flex-col items-center">
                <div className="text-[72px] mb-[20px] leading-none">
                  {emoji}
                </div>
                <h3 className="text-[18px] md:text-[20px] font-bold text-brand-black leading-[1.3] tracking-tight mb-[12px]">{title}</h3>
                <p className="text-[13px] md:text-[14px] text-[#555] leading-[1.65] font-normal">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="py-[64px] md:py-[96px] bg-[#1D5E20] text-white w-full overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 md:px-[40px] lg:px-[60px] grid md:grid-cols-[1fr_auto] gap-[48px] md:gap-[64px] items-center">
          <div className="max-w-[520px]">
            <h2 className="text-[32px] md:text-[42px] font-bold mb-[28px] leading-[1.15] tracking-tight text-white">Meet The Founders</h2>
            <p className="text-white/85 text-[15px] md:text-[16px] leading-[1.7] mb-[20px] font-normal">
              GRAINZZ was founded by Vibhor Kataria (Operations Specialist) and Rishel Puri (Branding &amp; Marketing Strategist).
            </p>
            <p className="text-white/85 text-[15px] md:text-[16px] leading-[1.7] mb-[28px] font-normal">
              Together, they are building India&apos;s next big healthy snacking brand, a homegrown company turning traditional puffed rice into a structured, premium snack category.
            </p>
            <p className="text-white/85 text-[15px] md:text-[16px] leading-[1.7] mb-[20px] font-normal">
              GRAINZZ was founded by Vibhor Kataria (Operations Specialist) and Rishel Puri (Branding &amp; Marketing Strategist).
            </p>
            <p className="text-white/85 text-[15px] md:text-[16px] leading-[1.7] font-normal">
              Together, they are building India&apos;s next big healthy snacking brand, a homegrown company turning traditional puffed rice into a structured, premium snack category.
            </p>
          </div>
          {/* Polaroid-style tilted photo */}
          <div className="flex justify-center md:justify-end">
            <div className="relative w-[280px] md:w-[340px] rotate-[4deg] hover:rotate-[2deg] transition-transform duration-500">
              <div className="bg-white p-[10px] pb-[40px] rounded-[4px] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-[2px]">
                  <Image
                    src="/founders.jpg"
                    alt="Grainzz Founders"
                    fill
                    className="object-cover"
                    sizes="340px"
                  />
                </div>
                <p className="text-center text-[12px] text-[#666] mt-[10px] italic font-medium">Ab hamein ye saare boxes pack karne the..</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Favourites */}
      <TeamFavourites />

      {/* Values */}
      <OurValues />

      {/* Customer Testimonials */}
      <CustomerTestimonials />
    </div>
  );
}

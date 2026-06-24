import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import TeamFavourites from '@/components/about/TeamFavourites';
import OurValues from '@/components/about/OurValues';
import CustomerTestimonials from '@/components/about/CustomerTestimonials';
import FAQSection from '@/components/home/FAQSection';

import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'About Us | Grainzz — Healthy Grain Snack Brand from India',
  description: 'Learn about Grainzz, India\'s healthy grain snack brand. Founded by Vibhor Kataria and Rishel Puri, we craft roasted millet snacks with real grains and no palm oil.',
  path: '/about',
  image: '/about-hero.jpg',
  keywords: ['grainzz founders', 'healthy Indian snack brand', 'millet snacks India', 'grain based snacks', 'roasted snacks brand India', 'no palm oil snacks'],
});

const story = [
  {
    image: '/story-1.png',
    title: 'From Ingredient to Hero',
    desc: 'Puffed rice has lived in Indian homes for generations, but mostly as a side ingredient in bhel, namkeen or mixtures. Grainzz was created to give this light, familiar grain the spotlight it always deserved.',
  },
  {
    image: '/story-2.png',
    title: 'The Taste Gap We Saw',
    desc: 'We noticed a simple problem: tasty snacks often felt too heavy, while healthier snacks often felt too boring. Grainzz was built to bring both sides together: bold flavour and better ingredients in one snack.',
  },
  {
    image: '/story-3.png',
    title: 'Snacking, Reimagined',
    desc: 'From ragi and bajra to jowar, oats, quinoa, beetroot and puffed rice, we are turning familiar grains into modern snacks made for office breaks, IPL nights, chai time and everyday cravings.',
  },
];



export default function AboutPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://www.grainzzindia.com/about",
        "url": "https://www.grainzzindia.com/about",
        "name": "About Us | Grainzz",
        "description": "Learn about Grainzz and our mission to create healthier snacks made with real grains and clean ingredients.",
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://www.grainzzindia.com"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "About Us",
              "item": "https://www.grainzzindia.com/about"
            }
          ]
        }
      }
    ]
  };

  return (
    <div className="bg-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Hero */}
      <section className="w-full">
        <div className="flex flex-col md:flex-row min-h-[420px] md:min-h-[560px]">
          {/* Left — Image */}
          <div className="w-full md:w-[50%] relative overflow-hidden bg-[#C24A2B]">
            <Image
              src="/about section cover.png"
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
            {story.map(({ image, title, desc }) => (
              <div key={title} className="bg-[#FBF5EB] rounded-[16px] px-[28px] py-[48px] text-center flex flex-col items-center border-b-4 border-transparent hover:border-[#A01A1A] transition-all duration-300">
                <div className="relative w-[72px] h-[72px] mb-[24px]">
                  <Image 
                    src={image} 
                    alt={title} 
                    fill 
                    className="object-contain" 
                  />
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
        <div className="max-w-[1440px] mx-auto px-4 md:px-[60px] lg:px-[100px] grid md:grid-cols-[1.2fr_auto] gap-[48px] md:gap-[80px] items-center">
          <div className="max-w-[800px]">
            <h2 className="text-[36px] md:text-[48px] font-semibold mb-[28px] leading-[1.15] tracking-tight text-white">Meet The Founders</h2>
            <div className="space-y-6">
              <p className="text-white/90 text-[16px] md:text-[18px] leading-[1.6] font-normal">
                Grainzz was started in Delhi by Vibhor Kataria and Rishel Puri after one frustrating realisation — every &quot;tasty&quot; Indian snack on the shelf was fried in palm oil and built on maida. The grain on the pack was usually a marketing line. We made the opposite: millet-based chips, roasted grain puffs and roasted flavoured puffed rice, where the ingredient list reads like real food. We say what we mean. No palm oil. No maida. No empty claims.
              </p>
            </div>
          </div>

          {/* Single Polaroid photo — matches reference exactly */}
          <div className="flex justify-center md:justify-end">
            <div className="relative w-[300px] md:w-[380px] rotate-[5deg] hover:rotate-[2deg] transition-transform duration-500">
              <div className="bg-white p-[16px] rounded-[2px] shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                <div className="relative w-full aspect-[4/5] overflow-hidden rounded-[1px]">
                  <Image
                    src="/founders.png"
                    alt="Grainzz Founders"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 300px, 380px"
                  />
                </div>
                {/* No bottom text as requested */}
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

      {/* FAQs */}
      <FAQSection />
    </div>
  );
}

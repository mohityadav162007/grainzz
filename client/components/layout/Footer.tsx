'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram, Send, ChevronDown } from 'lucide-react';

export default function Footer() {
  const [openSection, setOpenSection] = useState<string | null>('Quick Links');

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const footerLinks = {
    'Quick Links': [
      { name: 'Home', href: '/' },
      { name: 'About Us', href: '/about' },
      { name: 'FAQs', href: '/faqs' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'My Account', href: '/account' },
    ],
    'Shop': [
      { name: 'All Products', href: '/products' },
      { name: 'Combos', href: '/combos' },
      { name: 'Sale!', href: '/sale' },
    ],
    'Policies': [
      { name: 'Shipping', href: '/shipping' },
      { name: 'Return/exchange', href: '/returns' },
      { name: 'Terms & Conditions', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
    ],
  };

  return (
    <footer className="w-full font-sans">
      <div className="bg-[#1D5E20] text-white">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-[120px] py-[60px] lg:py-[80px]">
          
          {/* Desktop Layout -> 5 Columns. Mobile Layout -> Stacked with Accordions */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.5fr] gap-8 lg:gap-12">
            
            {/* 1. Brand & Contact (Always visible) */}
            <div className="flex flex-col gap-6 items-start">
              <Link href="/" className="inline-block transition-transform hover:scale-105 mb-2">
                <Image 
                  src="/image-2@2x.png" 
                  alt="Grainzz Logo" 
                  width={200} 
                  height={56} 
                  className="object-contain h-[45px] lg:h-[56px] w-auto brightness-0 invert"
                />
              </Link>
              <div className="flex flex-col gap-4 text-[14px] lg:text-[15px] font-medium text-white/90">
                <div className="flex items-start gap-4">
                  <Phone size={20} className="shrink-0 text-white/80" strokeWidth={1.5} />
                  <span>96262425 , 93756546</span>
                </div>
                <div className="flex items-start gap-4">
                  <Mail size={20} className="shrink-0 text-white/80" strokeWidth={1.5} />
                  <span>katariavibhor9@gmail.com</span>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin size={20} className="shrink-0 text-white/80 mt-1" strokeWidth={1.5} />
                  <span className="leading-[1.4]">B-291, MIG Flats, East of Loni road, Delhi, Delhi<br/>- 110093, India</span>
                </div>
              </div>
            </div>

            {/* Desktop Links / Mobile Accordions */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title} className="flex flex-col border-b border-white/10 lg:border-none pb-4 lg:pb-0">
                <button 
                  onClick={() => toggleSection(title)}
                  className="flex items-center justify-between lg:cursor-default w-full text-left"
                >
                  <h4 className="text-[18px] lg:text-[20px] font-semibold text-white tracking-wide">{title}</h4>
                  <ChevronDown 
                    size={20} 
                    className={`lg:hidden transition-transform duration-300 ${openSection === title ? 'rotate-180' : ''}`} 
                  />
                </button>
                <div className={`mt-4 lg:mt-6 flex-col gap-[14px] lg:flex ${openSection === title ? 'flex' : 'hidden'}`}>
                  {links.map((link) => (
                    <Link key={link.name} href={link.href} className="text-[14px] lg:text-[15px] font-medium text-white/80 hover:text-white transition-colors block">
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {/* Subscribe & Social */}
            <div className="flex flex-col gap-6 lg:gap-8 pt-4 lg:pt-0">
              <div className="flex flex-col gap-4">
                <h4 className="text-[18px] lg:text-[20px] font-semibold text-white">Subscribe to get latest offers</h4>
                <div className="relative w-full max-w-[320px]">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="w-full h-[48px] bg-transparent border border-white/40 rounded-[6px] px-4 pr-12 text-[15px] text-white placeholder:text-white/60 focus:outline-none focus:border-white transition-colors"
                  />
                  <button className="absolute right-3 top-[14px] text-white/80 hover:text-white transition-colors flex items-center justify-center">
                    <Send size={20} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-[12px]">
                {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                  <a key={i} href="#" className="w-[36px] h-[36px] bg-white text-[#1D5E20] rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                    <Icon size={18} strokeWidth={2} fill="currentColor" />
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* Copyright Strip */}
      <div className="bg-[#FCF9F2] w-full py-[20px]">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-[120px] text-center lg:text-left">
          <p className="m-0 text-[14px] font-medium text-[#444444]">
            Copyright © 2026 Grainzz by Vitalicious
          </p>
        </div>
      </div>
    </footer>
  );
}

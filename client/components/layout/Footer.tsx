'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram, Send, ChevronDown } from 'lucide-react';
import { getStoreSettings } from '@/lib/api';

export default function Footer() {
  const [openSection, setOpenSection] = useState<string | null>('Quick Links');
  const [settings, setSettings] = useState<Record<string, string>>({
    contact_phone: '96262425 , 93756546',
    contact_email: 'katariavibhor9@gmail.com',
    contact_address: 'B-291, MIG Flats, East of Loni road, Delhi, Delhi - 110093, India',
    social_instagram: '#',
    social_facebook: '#',
    social_twitter: '#',
    social_linkedin: '#',
    about_text: 'Subscribe to get latest offers'
  });

  useEffect(() => {
    getStoreSettings().then(data => {
      if (data) setSettings(prev => ({ ...prev, ...data }));
    }).catch(console.error);
  }, []);

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
      ...(settings.show_sale_page !== 'false' ? [{ name: 'Sale!', href: '/sale' }] : []),
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
        <div className="max-w-[1440px] mx-auto px-4 lg:px-[40px] py-[60px] lg:py-[80px]">
          
          {/* Desktop Layout -> 5 Columns. Mobile Layout -> Stacked with Accordions */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_0.7fr_0.7fr_0.7fr_2fr] gap-8 lg:gap-4">
            
            {/* 1. Brand & Contact */}
            <div className="flex flex-col gap-8 items-start">
              <Link href="/" className="inline-block transition-transform hover:scale-105">
                <Image 
                  src="/image-2@2x.png" 
                  alt="Grainzz Logo" 
                  width={240} 
                  height={64} 
                  className="object-contain h-[56px] lg:h-[72px] w-auto brightness-0 invert"
                />
              </Link>
              <div className="flex flex-col gap-6 text-[15px] lg:text-[16px] font-medium text-white/90">
                <div className="flex items-center gap-4">
                  <Phone size={22} className="shrink-0 text-white" strokeWidth={1.5} />
                  <div className="flex flex-wrap items-center gap-1">
                    {settings.contact_phone.split(',').map((num, i, arr) => (
                      <div key={i} className="flex items-center gap-1">
                        <a href={`tel:${num.trim()}`} className="hover:text-white transition-colors">{num.trim()}</a>
                        {i < arr.length - 1 && <span>,</span>}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Mail size={22} className="shrink-0 text-white" strokeWidth={1.5} />
                  <a href={`mailto:${(settings.contact_email || '').trim()}`} className="hover:text-white transition-colors break-all">
                    {(settings.contact_email || '').trim()}
                  </a>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin size={22} className="shrink-0 text-white mt-1" strokeWidth={1.5} />
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.contact_address)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="leading-[1.5] hover:text-white transition-colors"
                  >
                    {settings.contact_address}
                  </a>
                </div>
              </div>
            </div>

            {/* Desktop Links / Mobile Accordions */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title} className="flex flex-col border-b border-white/10 lg:border-none pb-4 lg:pb-0 lg:pl-2">
                <button 
                  onClick={() => toggleSection(title)}
                  className="flex items-center justify-between lg:cursor-default w-full text-left"
                >
                  <h4 className="text-[18px] lg:text-[20px] font-semibold text-white tracking-wide whitespace-nowrap">{title}</h4>
                  <ChevronDown 
                    size={20} 
                    className={`lg:hidden transition-transform duration-300 ${openSection === title ? 'rotate-180' : ''}`} 
                  />
                </button>
                <div className={`mt-4 lg:mt-6 flex-col gap-[14px] lg:flex ${openSection === title ? 'flex' : 'hidden'}`}>
                  {links.map((link) => (
                    <Link key={link.name} href={link.href} className="text-[14px] lg:text-[15px] font-medium text-white/80 hover:text-white hover:underline decoration-2 underline-offset-8 transition-all block whitespace-nowrap">
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {/* 5. Subscribe & Social */}
            <div className="flex flex-col gap-6 lg:gap-8 pt-4 lg:pt-0 lg:pl-4">
              <div className="flex flex-col gap-4">
                <h4 className="text-[18px] lg:text-[20px] font-medium text-white">{settings.about_text}</h4>
                <div className="relative w-full max-w-[320px]">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="w-full h-[48px] bg-transparent border border-white/60 rounded-[12px] px-4 pr-12 text-[15px] text-white placeholder:text-white/60 focus:outline-none focus:border-white transition-colors"
                  />
                  <button className="absolute right-3 top-[12px] text-white/80 hover:text-white transition-colors flex items-center justify-center">
                    <Send size={20} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-[12px]">
                <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform block">
                  <Image src="/Icon-1.svg" alt="Facebook" width={36} height={36} />
                </a>
                <a href={settings.social_twitter} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform block">
                  <Image src="/Icon-5.svg" alt="X" width={36} height={36} />
                </a>
                <a href={settings.social_linkedin} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform block">
                  <Image src="/Icon-3.svg" alt="LinkedIn" width={36} height={36} />
                </a>
                <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform block">
                  <Image src="/Icon-4.svg" alt="Instagram" width={36} height={36} />
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* Copyright Strip */}
      <div className="bg-[#FCF9F2] w-full py-[20px]">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-[120px] text-center">
          <p className="m-0 text-[14px] font-medium text-[#444444]">
            Copyright © 2026 Grainzz by Vitalicious
          </p>
        </div>
      </div>
    </footer>
  );
}

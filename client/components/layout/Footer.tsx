'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram, Send } from 'lucide-react';
import { getSiteContent } from '@/lib/api';

export default function Footer() {
  const [subscribeHeading, setSubscribeHeading] = useState('Get First Access to Offers, New Launches and Snack Deals');

  useEffect(() => {
    getSiteContent('footer_subscribe').then((content) => {
      if (content?.heading) setSubscribeHeading(content.heading);
    }).catch(() => {});
  }, []);

  return (
    <footer className="bg-brand-green text-white w-full border-t border-[#154617]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-[80px] py-[60px] md:py-[80px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-[40px] md:gap-[60px] lg:gap-[40px]">
          
          {/* Brand & Contact */}
          <div className="lg:col-span-2 pr-0 lg:pr-[40px]">
            <div className="flex flex-col text-white mb-[24px] md:mb-[32px]">
              <span className="text-[10px] md:text-[12px] font-bold tracking-[0.2em] mb-1 opacity-80">VITALICIOUS</span>
              <span className="font-sans text-[36px] md:text-[40px] font-black tracking-tight leading-none">GRAIN<span className="text-brand-yellow">ZZ</span></span>
            </div>
            <p className="text-[14px] md:text-[16px] text-white/80 leading-[1.6] mb-[24px] md:mb-[32px] max-w-[400px]">
              Crafting premium, healthy, and bold snacks using authentic Indian supergrains. Zero palm oil, 100% flavour.
            </p>
            <div className="space-y-[12px] md:space-y-[16px] text-[14px] md:text-[16px] text-white/90 font-medium">
              <div className="flex items-center gap-[12px] hover:text-brand-yellow transition-colors cursor-pointer">
                <div className="w-[32px] h-[32px] rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Phone size={14} />
                </div>
                <span>96262425 , 9375 6546</span>
              </div>
              <div className="flex items-center gap-[12px] hover:text-brand-yellow transition-colors cursor-pointer">
                <div className="w-[32px] h-[32px] rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Mail size={14} />
                </div>
                <span>katariavibhor9@gmail.com</span>
              </div>
              <div className="flex items-start gap-[12px] hover:text-brand-yellow transition-colors cursor-pointer group">
                <div className="w-[32px] h-[32px] rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-yellow group-hover:text-brand-green transition-colors">
                  <MapPin size={14} />
                </div>
                <span className="leading-[1.5] max-w-[300px]">B-291, MIG Flats, East of Loni road, Delhi, Delhi – 110093, India</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col">
            <h4 className="text-[18px] md:text-[20px] font-bold mb-[16px] md:mb-[24px] tracking-wide">Quick Links</h4>
            <ul className="space-y-[12px] md:space-y-[16px] text-[14px] md:text-[16px] text-white/80 font-medium">
              {['Home', 'About Us', 'FAQs', 'Contact Us'].map((item) => (
                <li key={item}>
                  <Link href={item === 'Home' ? '/' : `/${item.toLowerCase().replace(/\s+/g, '-')}`}
                    className="hover:text-brand-yellow hover:translate-x-1 inline-block transition-all">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop */}
          <div className="flex flex-col">
            <h4 className="text-[18px] md:text-[20px] font-bold mb-[16px] md:mb-[24px] tracking-wide">Shop</h4>
            <ul className="space-y-[12px] md:space-y-[16px] text-[14px] md:text-[16px] text-white/80 font-medium">
              {[
                { label: 'All Products', href: '/products' },
                { label: 'Combos', href: '/combos' },
                { label: 'Sale!', href: '/sale' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-brand-yellow hover:translate-x-1 inline-block transition-all">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div className="flex flex-col">
            <h4 className="text-[18px] md:text-[20px] font-bold mb-[16px] md:mb-[24px] tracking-wide">Policies</h4>
            <ul className="space-y-[12px] md:space-y-[16px] text-[14px] md:text-[16px] text-white/80 font-medium">
              {['Shipping', 'Return/exchange', 'Terms & Conditions', 'Privacy Policy'].map((item) => (
                <li key={item}>
                  <Link href={`/policies/${item.toLowerCase().replace(/[\/\s]+/g, '-')}`}
                    className="hover:text-brand-yellow hover:translate-x-1 inline-block transition-all">{item}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Brand Divider */}
        <div className="h-px w-full bg-white/20 my-[32px] md:my-[48px]" />

        {/* Subscribe & Socials */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-[32px] md:gap-[40px]">
          <div className="flex-1 max-w-[500px] w-full text-center lg:text-left">
            <h4 className="text-[16px] md:text-[18px] font-bold mb-[16px]">{subscribeHeading}</h4>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex bg-white/5 items-center h-[48px] md:h-[56px] border border-white/30 rounded-full overflow-hidden focus-within:border-brand-yellow focus-within:bg-white/10 transition-colors w-full"
            >
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 bg-transparent px-[20px] md:px-[24px] py-0 h-full text-[14px] md:text-[16px] font-medium text-white placeholder:text-white/50 border-none outline-none focus:outline-none focus:ring-0 shadow-none min-w-[50px]"
              />
              <button type="submit" className="h-full px-[16px] md:px-[24px] bg-brand-yellow text-brand-black hover:bg-white font-bold transition-colors flex items-center gap-2 whitespace-nowrap text-[14px] md:text-[16px]">
                <span className="hidden sm:inline">Subscribe</span> <Send size={16} />
              </button>
            </form>
          </div>

          <div className="flex flex-col items-center lg:items-end">
            <span className="text-[14px] md:text-[16px] font-bold mb-[16px]">Follow our journey</span>
            <div className="flex items-center gap-[12px] md:gap-[16px]">
              {[
                { Icon: Facebook, href: '#' },
                { Icon: Twitter, href: '#' },
                { Icon: Linkedin, href: '#' },
                { Icon: Instagram, href: 'https://instagram.com/grainzzbyvitalicious' },
              ].map(({ Icon, href }, i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                  className="w-[40px] h-[40px] md:w-[48px] md:h-[48px] border border-white/20 rounded-full flex items-center justify-center hover:bg-brand-yellow hover:text-brand-black hover:border-brand-yellow hover:scale-110 transition-all duration-300 shadow-sm">
                  <Icon className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-[#0D3810] text-[#A2C2A5] text-center text-[12px] md:text-[14px] font-medium py-[16px] md:py-[20px] w-full border-t border-[#125016] px-4">
        Copyright © 2026 Grainzz by Vitalicious. All rights reserved.
      </div>
    </footer>
  );
}

'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Search, ShoppingCart, User, Menu, X, ChevronDown, Heart } from 'lucide-react';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import clsx from 'clsx';
import MobileSearchOverlay from './MobileSearchOverlay';

const navLinks = [
  { label: 'Shop All', href: '/products', dropdown: [
      { label: 'All Products', href: '/products' },
      { label: 'Healthy Chips', href: '/products?category=Healthy%20Chips' },
      { label: 'Grain Puffs', href: '/products?category=Grain%20Puffs' },
      { label: 'Combos', href: '/combos' },
  ]},
  { label: 'Combos', href: '/combos' },
  { label: 'Sale!', href: '/sale', className: 'text-brand-red font-semibold' },
  { label: 'About Us', href: '/about' },
  { label: 'FAQs', href: '/faqs' },
  { label: 'Contact Us', href: '/contact' },
];

const HEADER_CSS = `
.hdr-layer{position:absolute;inset:0;display:flex;align-items:center;padding:0 100px;transition:opacity 250ms ease,transform 250ms ease}
.hdr-expanded{opacity:1;transform:translateY(0);pointer-events:auto}
[data-compact="true"] .hdr-expanded{opacity:0;transform:translateY(-5px);pointer-events:none}
.hdr-compact{opacity:0;transform:translateY(5px);pointer-events:none}
[data-compact="true"] .hdr-compact{opacity:1;transform:translateY(0);pointer-events:auto}
@media(max-width:1023px){.hdr-layer{display:none!important}}
`;

export default function Navbar() {
  const { items, itemCount, openCart } = useCartStore();
  const { user, setAuthModalOpen } = useAuthStore();
  const [count, setCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => { setCount(itemCount()); }, [items]);

  // Scroll listener — sets data attribute directly, zero re-renders
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    if (pathname !== '/') { el.dataset.compact = 'true'; return; }
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        el.dataset.compact = window.scrollY > 80 ? 'true' : 'false';
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  const handleAccountClick = (e: React.MouseEvent) => {
    if (!user) { e.preventDefault(); setAuthModalOpen(true); }
    setMobileOpen(false);
  };

  const searchSubmit = () => {
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: HEADER_CSS }} />

      <header
        ref={headerRef}
        data-compact="false"
        className="sticky top-0 z-40 bg-white w-full"
        style={{ borderBottom: '1px solid #EAEAEA', transform: 'translateZ(0)' }}
      >
        {/* ── Mobile (always 64px) ─────────────────────────────── */}
        <div className="flex lg:hidden w-full h-[64px] px-4 md:px-[60px] items-center justify-between">
          <div className="flex items-center flex-1">
            <button className="p-1 -ml-1 text-[#222]" onClick={() => setMobileOpen(true)}>
              <Menu size={28} strokeWidth={2.5} />
            </button>
          </div>
          <Link href="/" className="flex-shrink-0 flex items-center justify-center flex-[2]">
            <Image src="/image-2@2x.png" alt="Grainzz" width={140} height={40} className="object-contain h-[32px]" priority />
          </Link>
          <div className="flex items-center justify-end gap-5 flex-1">
            <button className="text-[#222]" onClick={() => setIsSearchOpen(true)}><Search size={24} strokeWidth={2} /></button>
            <button onClick={openCart} className="text-[#222] relative pb-1">
              <ShoppingCart size={24} strokeWidth={2} />
              {count > 0 && <span className="absolute -top-1.5 -right-2 bg-brand-red text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{count}</span>}
            </button>
          </div>
        </div>

        {/* ── Desktop: fixed 80px with two cross-fading layers ── */}
        <div className="hidden lg:block w-full">
          <div className="max-w-[1440px] mx-auto h-[80px] relative">

            {/* LAYER 1 — Expanded: Logo left | Search center | Icons right */}
            <div className="hdr-layer hdr-expanded">
              <Link href="/" className="shrink-0 flex items-center">
                <Image src="/image-2@2x.png" alt="Grainzz" width={180} height={50} className="object-contain h-[42px] w-auto" priority />
              </Link>
              <div className="flex-1 flex justify-center px-8">
                <div className="w-full max-w-[460px] h-[46px] border border-[#CCC] rounded-full flex items-center px-5 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] focus-within:border-primary">
                  <Search size={18} strokeWidth={2} className="text-[#888] shrink-0" />
                  <input
                    type="text" placeholder="Search for.."
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchSubmit()}
                    className="w-full h-full pl-3 bg-transparent text-[15px] text-[#222] placeholder:text-[#999] focus:outline-none"
                  />
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-7">
                <Link href="/wishlist" className="text-[#222] hover:text-brand-red transition-colors"><Heart size={24} strokeWidth={2} /></Link>
                <Link href="/account" onClick={handleAccountClick} className="text-[#222] hover:text-primary transition-colors"><User size={24} strokeWidth={2} /></Link>
                <button onClick={openCart} className="relative text-[#222] hover:text-primary transition-colors">
                  <ShoppingCart size={24} strokeWidth={2} />
                  {count > 0 && <span className="absolute -top-2 -right-2 bg-brand-red text-white text-[11px] rounded-full w-5 h-5 flex items-center justify-center font-bold ring-2 ring-white">{count}</span>}
                </button>
              </div>
            </div>

            {/* LAYER 2 — Compact: Nav left | Logo center | Icons right */}
            <div className="hdr-layer hdr-compact">
              <div className="shrink-0 flex items-center gap-10">
                <div className="relative group">
                  <div className="flex items-center gap-1 cursor-pointer text-[#222] group-hover:text-primary transition-colors py-2">
                    <Link href="/products" className="text-[15px] font-medium tracking-wide">Shop</Link>
                    <ChevronDown size={14} className="mt-px transition-transform group-hover:rotate-180" />
                  </div>
                  <div className="absolute top-full left-0 mt-0 w-48 bg-white shadow-lg rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden border border-[#EAEAEA]">
                    <Link href="/products" className="block px-4 py-3 text-[#222] hover:bg-brand-light hover:text-primary transition-colors text-[14px] font-medium border-b border-[#f5f5f5]">All Products</Link>
                    <Link href="/products?category=Healthy%20Chips" className="block px-4 py-3 text-[#222] hover:bg-brand-light hover:text-primary transition-colors text-[14px] font-medium border-b border-[#f5f5f5]">Healthy Chips</Link>
                    <Link href="/products?category=Grain%20Puffs" className="block px-4 py-3 text-[#222] hover:bg-brand-light hover:text-primary transition-colors text-[14px] font-medium border-b border-[#f5f5f5]">Grain Puffs</Link>
                    <Link href="/combos" className="block px-4 py-3 text-[#222] hover:bg-brand-light hover:text-primary transition-colors text-[14px] font-medium">Combos</Link>
                  </div>
                </div>
                <Link href="/about" className="text-[15px] font-medium text-[#222] hover:text-primary transition-colors">About Us</Link>
                <Link href="/contact" className="text-[15px] font-medium text-[#222] hover:text-primary transition-colors">Contact Us</Link>
              </div>
              <div className="flex-1 flex justify-center">
                <Link href="/" className="flex items-center">
                  <Image src="/image-2@2x.png" alt="Grainzz" width={180} height={50} className="object-contain h-[42px] w-auto" priority />
                </Link>
              </div>
              <div className="shrink-0 flex items-center gap-7">
                <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-[#222] hover:text-primary transition-colors"><Search size={24} strokeWidth={2} /></button>
                <Link href="/account" onClick={handleAccountClick} className="text-[#222] hover:text-primary transition-colors"><User size={24} strokeWidth={2} /></Link>
                <button onClick={openCart} className="relative text-[#222] hover:text-primary transition-colors">
                  <ShoppingCart size={24} strokeWidth={2} />
                  {count > 0 && <span className="absolute -top-2 -right-2 bg-brand-red text-white text-[11px] rounded-full w-5 h-5 flex items-center justify-center font-bold ring-2 ring-white">{count}</span>}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating search panel (compact toggle) */}
        <div
          className={clsx(
            'absolute top-full left-0 w-full bg-white border-b border-[#EAEAEA] shadow-md z-[35] hidden lg:flex items-center justify-center overflow-hidden px-4',
            isSearchOpen ? 'h-[76px] opacity-100' : 'h-0 opacity-0 pointer-events-none'
          )}
          style={{ transition: 'height 250ms ease, opacity 200ms ease' }}
        >
          <div className="relative w-full max-w-[580px] h-[46px] border border-[#CCC] rounded-full flex items-center px-4 bg-[#FAFAFA] focus-within:border-primary focus-within:bg-white transition-colors">
            <Search size={18} strokeWidth={2} className="text-[#999] shrink-0" />
            <input type="text" placeholder="Search for grainzz products..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchSubmit()}
              className="w-full h-full pl-3 bg-transparent text-[15px] text-[#222] placeholder:text-[#999] focus:outline-none"
              autoFocus={isSearchOpen} />
            <button onClick={() => setIsSearchOpen(false)} className="text-[#AAA] hover:text-[#222] transition-colors p-1"><X size={18} strokeWidth={2.5} /></button>
          </div>
        </div>
      </header>

      {/* ── Nav row (homepage only) — normal flow, scrolls away ── */}
      {pathname === '/' && (
        <div className="hidden lg:block bg-white border-b border-[#EAEAEA] w-full">
          <div className="max-w-[1440px] mx-auto px-[60px] lg:px-[100px]">
            <nav className="flex items-center justify-center gap-[48px] h-[60px]">
              {navLinks.map((link) => (
                <div key={link.href} className="relative group flex items-center h-full">
                  <div className="flex items-center gap-1 cursor-pointer group-hover:text-primary transition-colors">
                    <Link href={link.href} className={clsx('text-[15px] font-medium tracking-wide transition-colors py-4', link.className || 'text-[#222]')}>
                      {link.label}
                    </Link>
                    {link.dropdown && <ChevronDown size={14} className="mt-px transition-transform group-hover:rotate-180" />}
                  </div>
                  {link.dropdown && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-48 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden border border-[#EAEAEA]">
                      {link.dropdown.map((drop, idx) => (
                        <Link key={drop.href} href={drop.href} className={clsx('block px-4 py-3 text-[#222] hover:bg-brand-light hover:text-primary transition-colors text-[14px] font-medium', idx < link.dropdown!.length - 1 && 'border-b border-[#f5f5f5]')}>
                          {drop.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      <MobileSearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-[#FBF5EB] animate-fade-in">
          <div className="flex w-full h-[64px] px-4 items-center justify-between flex-shrink-0">
            <div className="flex items-center flex-1">
              <button onClick={() => setMobileOpen(false)} className="p-1 -ml-1 text-[#222]"><X size={24} strokeWidth={2} /></button>
            </div>
            <Link href="/" onClick={() => setMobileOpen(false)} className="flex-shrink-0 flex items-center justify-center flex-[2]">
              <Image src="/image-2@2x.png" alt="Grainzz" width={140} height={40} className="object-contain h-[32px]" priority />
            </Link>
            <div className="flex items-center justify-end gap-5 flex-1">
              <button className="text-[#222]" onClick={() => { setMobileOpen(false); setIsSearchOpen(true); }}><Search size={24} strokeWidth={2} /></button>
              <button onClick={() => { setMobileOpen(false); openCart(); }} className="text-[#222] relative pb-1">
                <ShoppingCart size={24} strokeWidth={2} />
                {count > 0 && <span className="absolute -top-1.5 -right-2 bg-brand-red text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{count}</span>}
              </button>
            </div>
          </div>
          <nav className="flex flex-col px-4 mt-2">
            <Link href="/products" onClick={() => setMobileOpen(false)} className="py-4 text-[15px] font-medium text-[#222] border-b border-[#E5DFCC]">Shop All</Link>
            <Link href="/combos" onClick={() => setMobileOpen(false)} className="py-4 text-[15px] font-medium text-[#222] border-b border-[#E5DFCC]">Combos</Link>
            <Link href="/sale" onClick={() => setMobileOpen(false)} className="py-4 text-[15px] font-semibold text-brand-red border-b border-[#E5DFCC]">Sales!</Link>
            <Link href="/about" onClick={() => setMobileOpen(false)} className="py-4 text-[15px] font-medium text-[#222] border-b border-[#E5DFCC]">About Us</Link>
            <Link href="/faqs" onClick={() => setMobileOpen(false)} className="py-4 text-[15px] font-medium text-[#222] border-b border-[#E5DFCC]">FAQs</Link>
            <Link href="/account" onClick={handleAccountClick} className="py-4 text-[15px] font-medium text-[#222] border-b border-[#E5DFCC]">My account</Link>
            <Link href="/contact" onClick={() => setMobileOpen(false)} className="py-4 text-[15px] font-medium text-[#222]">Contact Us</Link>
          </nav>
        </div>
      )}
    </>
  );
}

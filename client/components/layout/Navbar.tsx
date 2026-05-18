'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Search, ShoppingCart, User, Menu, X, ChevronDown, Heart, Home } from 'lucide-react';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import clsx from 'clsx';
import MobileSearchOverlay from './MobileSearchOverlay';

const navLinks = [
  { label: 'Shop All', href: '/products' },
  { label: 'Combos', href: '/combos' },
  { label: 'B2B Partnership', href: '/b2b' },
  { label: 'Sale!', href: '/sale', className: 'text-brand-red font-semibold' },
  { label: 'About Us', href: '/about' },
  { label: 'FAQs', href: '/faqs' },
  { label: 'Contact Us', href: '/contact' },
];

const HEADER_CSS = `
.hdr-layer{position:absolute;inset:0;display:flex;align-items:center;padding:0 100px;transition:opacity 250ms ease,transform 250ms ease}
[data-no-transition="true"] .hdr-layer{transition:none!important}
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
  const [showSale, setShowSale] = useState(true);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    import('@/lib/api').then(({ getStoreSettings }) => {
      getStoreSettings().then((settings: any) => {
        if (settings.show_sale_page === 'false') {
          setShowSale(false);
        }
      }).catch(() => {});
    });
  }, []);

  const filteredNavLinks = navLinks.filter(link => link.href !== '/sale' || showSale);

  useEffect(() => { setCount(itemCount()); }, [items]);

  // Scroll listener — sets data attribute directly, zero re-renders
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    
    if (pathname !== '/') { 
      el.dataset.noTransition = 'true';
      el.dataset.compact = 'true'; 
      return; 
    } else {
      el.dataset.noTransition = 'false';
      el.dataset.compact = 'false';
    }

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
            <Link href="/" className="text-[#222]"><Home size={24} strokeWidth={2} /></Link>
            <button className="text-[#222]" onClick={() => setIsSearchOpen(true)}><Search size={24} strokeWidth={2} /></button>
            <button onClick={openCart} className="header-cart-icon-btn text-[#222] relative pb-1">
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
                <button onClick={openCart} className="header-cart-icon-btn relative text-[#222] hover:text-primary transition-colors">
                  <ShoppingCart size={24} strokeWidth={2} />
                  {count > 0 && <span className="absolute -top-2 -right-2 bg-brand-red text-white text-[11px] rounded-full w-5 h-5 flex items-center justify-center font-bold ring-2 ring-white">{count}</span>}
                </button>
              </div>
            </div>

            {/* LAYER 2 — Compact: Nav left | Logo center | Icons right */}
            <div className="hdr-layer hdr-compact">
              <div className="flex-1 flex items-center justify-start gap-8">
                <Link href="/" className={clsx('text-[#222] hover:text-brand-green transition-colors', pathname === '/' && 'text-brand-green')}>
                  <Home size={22} strokeWidth={2.5} />
                </Link>
                <Link href="/products" className={clsx('text-[15px] font-medium transition-all relative group', pathname === '/products' ? 'text-brand-green underline decoration-2 underline-offset-8' : 'text-[#222] hover:underline decoration-2 underline-offset-8')}>Shop All</Link>
                <Link href="/b2b" className={clsx('text-[15px] font-medium transition-all relative group', pathname === '/b2b' ? 'text-brand-green underline decoration-2 underline-offset-8' : 'text-[#222] hover:underline decoration-2 underline-offset-8')}>B2B</Link>
                <Link href="/about" className={clsx('text-[15px] font-medium transition-all relative group', pathname === '/about' ? 'text-brand-green underline decoration-2 underline-offset-8' : 'text-[#222] hover:underline decoration-2 underline-offset-8')}>About Us</Link>
                <Link href="/contact" className={clsx('text-[15px] font-medium transition-all relative group', pathname === '/contact' ? 'text-brand-green underline decoration-2 underline-offset-8' : 'text-[#222] hover:underline decoration-2 underline-offset-8')}>Contact Us</Link>
              </div>
              <div className="shrink-0 flex justify-center">
                <Link href="/" className="flex items-center">
                  <Image src="/image-2@2x.png" alt="Grainzz" width={180} height={50} className="object-contain h-[42px] w-auto" priority />
                </Link>
              </div>
              <div className="flex-1 flex items-center justify-end gap-7">
                <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-[#222] hover:text-primary transition-colors"><Search size={24} strokeWidth={2} /></button>
                <Link href="/account" onClick={handleAccountClick} className="text-[#222] hover:text-primary transition-colors"><User size={24} strokeWidth={2} /></Link>
                <button onClick={openCart} className="header-cart-icon-btn relative text-[#222] hover:text-primary transition-colors">
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
              {filteredNavLinks.map((link) => (
                <div key={link.href} className="relative group flex items-center h-full">
                  <div className="flex items-center gap-1 cursor-pointer group-hover:text-primary transition-colors">
                    <Link 
                      href={link.href} 
                      className={clsx(
                        'text-[15px] font-medium tracking-wide transition-colors py-4',
                        pathname === link.href 
                          ? 'text-brand-green underline decoration-2 underline-offset-8' 
                          : 'text-[#222] hover:underline decoration-2 underline-offset-8',
                        link.className
                      )}
                    >
                      {link.label}
                    </Link>
                  </div>
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
              <button onClick={() => { setMobileOpen(false); openCart(); }} className="header-cart-icon-btn text-[#222] relative pb-1">
                <ShoppingCart size={24} strokeWidth={2} />
                {count > 0 && <span className="absolute -top-1.5 -right-2 bg-brand-red text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{count}</span>}
              </button>
            </div>
          </div>
          <nav className="flex flex-col px-4 mt-2">
            <Link href="/" onClick={() => setMobileOpen(false)} className={clsx('py-4 text-[15px] font-medium border-b border-[#E5DFCC] flex items-center gap-3', pathname === '/' ? 'text-brand-green underline underline-offset-8 decoration-2' : 'text-[#222] hover:underline underline-offset-8 decoration-2')}>
              <Home size={18} /> Home
            </Link>
            <Link href="/products" onClick={() => setMobileOpen(false)} className={clsx('py-4 text-[15px] font-medium border-b border-[#E5DFCC]', pathname === '/products' ? 'text-brand-green underline underline-offset-8 decoration-2' : 'text-[#222] hover:underline underline-offset-8 decoration-2')}>Shop All</Link>
            <Link href="/combos" onClick={() => setMobileOpen(false)} className={clsx('py-4 text-[15px] font-medium border-b border-[#E5DFCC]', pathname === '/combos' ? 'text-brand-green underline underline-offset-8 decoration-2' : 'text-[#222] hover:underline underline-offset-8 decoration-2')}>Combos</Link>
            <Link href="/b2b" onClick={() => setMobileOpen(false)} className={clsx('py-4 text-[15px] font-medium border-b border-[#E5DFCC]', pathname === '/b2b' ? 'text-brand-green underline underline-offset-8 decoration-2' : 'text-[#222] hover:underline underline-offset-8 decoration-2')}>B2B Partnership</Link>
            {showSale && (
              <Link href="/sale" onClick={() => setMobileOpen(false)} className={clsx('py-4 text-[15px] font-semibold border-b border-[#E5DFCC]', pathname === '/sale' ? 'text-brand-green underline underline-offset-8 decoration-2' : 'text-brand-red hover:underline underline-offset-8 decoration-2')}>Sales!</Link>
            )}
            <Link href="/about" onClick={() => setMobileOpen(false)} className={clsx('py-4 text-[15px] font-medium border-b border-[#E5DFCC]', pathname === '/about' ? 'text-brand-green underline underline-offset-8 decoration-2' : 'text-[#222] hover:underline underline-offset-8 decoration-2')}>About Us</Link>
            <Link href="/faqs" onClick={() => setMobileOpen(false)} className={clsx('py-4 text-[15px] font-medium border-b border-[#E5DFCC]', pathname === '/faqs' ? 'text-brand-green underline underline-offset-8 decoration-2' : 'text-[#222] hover:underline underline-offset-8 decoration-2')}>FAQs</Link>
            <Link href="/account" onClick={handleAccountClick} className={clsx('py-4 text-[15px] font-medium border-b border-[#E5DFCC]', pathname === '/account' ? 'text-brand-green underline underline-offset-8 decoration-2' : 'text-[#222] hover:underline underline-offset-8 decoration-2')}>My account</Link>
            <Link href="/contact" onClick={() => setMobileOpen(false)} className={clsx('py-4 text-[15px] font-medium', pathname === '/contact' ? 'text-brand-green underline underline-offset-8 decoration-2' : 'text-[#222] hover:underline underline-offset-8 decoration-2')}>Contact Us</Link>
          </nav>
        </div>
      )}
    </>
  );
}

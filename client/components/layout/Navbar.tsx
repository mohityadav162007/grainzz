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
  { 
    label: 'Shop All', 
    href: '/products',
    dropdown: [
      { label: 'All Products', href: '/products' },
      { label: 'Healthy Chips', href: '/products?category=Healthy%20Chips' },
      { label: 'Grain Puffs', href: '/products?category=Grain%20Puffs' },
      { label: 'Combos', href: '/combos' },
    ]
  },
  { label: 'Combos', href: '/combos' },
  { label: 'Sale!', href: '/sale', className: 'text-brand-red font-semibold' },
  { label: 'About Us', href: '/about' },
  { label: 'FAQs', href: '/faqs' },
  { label: 'Contact Us', href: '/contact' },
];

export default function Navbar() {
  const { items, itemCount, openCart } = useCartStore();
  const { user, setAuthModalOpen } = useAuthStore();
  const [count, setCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const scrolledRef = useRef(false);

  useEffect(() => { setCount(itemCount()); }, [items]);

  useEffect(() => {
    const handleScroll = () => {
      const shouldBeCompact = window.scrollY > 80;
      // Only trigger re-render if value actually changed
      if (shouldBeCompact !== scrolledRef.current) {
        scrolledRef.current = shouldBeCompact;
        setScrolled(shouldBeCompact);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isCompact = scrolled || pathname !== '/';

  const handleAccountClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setAuthModalOpen(true);
    }
    setMobileOpen(false);
  };

  return (
    <>
      <header 
        className={clsx(
          "bg-white sticky top-0 z-40 w-full flex flex-col items-center",
          isCompact ? "shadow-md" : "shadow-sm"
        )}
        style={{ willChange: 'auto' }}
      >
        {/* Mobile View (Always Minimal Style) */}
        <div className="flex lg:hidden w-full h-[64px] px-4 md:px-[60px] items-center justify-between border-b border-[#EAEAEA]">
          <div className="flex items-center flex-1">
            <button className="p-1 -ml-1 text-[#222222]" onClick={() => setMobileOpen(true)}>
              <Menu size={28} strokeWidth={2.5} />
            </button>
          </div>
          <Link href="/" className="flex-shrink-0 flex items-center justify-center flex-[2]">
            <Image src="/image-2@2x.png" alt="Grainzz Logo" width={140} height={40} className="object-contain h-[32px]" priority />
          </Link>
          <div className="flex items-center justify-end gap-5 flex-1">
            <button className="text-[#222222]" onClick={() => setIsSearchOpen(!isSearchOpen)}><Search size={24} strokeWidth={2} /></button>
            <button onClick={openCart} className="text-[#222222] relative pb-1">
              <ShoppingCart size={24} strokeWidth={2} />
              {count > 0 && <span className="absolute -top-1.5 -right-2 bg-brand-red text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{count}</span>}
            </button>
          </div>
        </div>

        {/* Desktop View (Morphing Header) */}
        <div className="hidden lg:block w-full max-w-[1440px]">
          
          <div 
            className={clsx(
              "w-full flex items-center justify-between px-[60px] lg:px-[100px] relative",
              isCompact ? "h-[80px]" : "h-[98px]"
            )}
            style={{ transition: 'height 280ms cubic-bezier(0.4,0,0.2,1)' }}
          >
            
            {/* Left Nav (Compact only) */}
            <div 
              className={clsx(
                "flex-1 flex items-center justify-start gap-[40px]",
                 !isCompact && "opacity-0 pointer-events-none -translate-x-4" 
              )}
              style={{ transition: 'opacity 250ms ease, transform 250ms ease', willChange: 'opacity, transform' }}
            >
              <div className="relative group">
                <div className="flex items-center gap-1 cursor-pointer text-[#222222] group-hover:text-primary transition-colors py-2">
                  <Link href="/products" className="text-[16px] font-medium tracking-wide" tabIndex={isCompact ? 0 : -1}>Shop</Link>
                  <ChevronDown size={16} className="mt-[2px] transition-transform group-hover:rotate-180" />
                </div>
                <div className="absolute top-full left-0 mt-0 w-48 bg-white shadow-lg rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden border border-[#EAEAEA]">
                  <Link href="/products" className="block px-4 py-3 text-[#222222] hover:bg-brand-light hover:text-primary transition-colors text-[15px] font-medium border-b border-[#f5f5f5]" tabIndex={isCompact ? 0 : -1}>All Products</Link>
                  <Link href="/products?category=Healthy%20Chips" className="block px-4 py-3 text-[#222222] hover:bg-brand-light hover:text-primary transition-colors text-[15px] font-medium border-b border-[#f5f5f5]" tabIndex={isCompact ? 0 : -1}>Healthy Chips</Link>
                  <Link href="/products?category=Grain%20Puffs" className="block px-4 py-3 text-[#222222] hover:bg-brand-light hover:text-primary transition-colors text-[15px] font-medium border-b border-[#f5f5f5]" tabIndex={isCompact ? 0 : -1}>Grain Puffs</Link>
                  <Link href="/combos" className="block px-4 py-3 text-[#222222] hover:bg-brand-light hover:text-primary transition-colors text-[15px] font-medium" tabIndex={isCompact ? 0 : -1}>Combos</Link>
                </div>
              </div>
              <Link href="/about" className="text-[16px] font-medium tracking-wide text-[#222222] hover:text-primary transition-colors" tabIndex={isCompact ? 0 : -1}>About Us</Link>
              <Link href="/contact" className="text-[16px] font-medium tracking-wide text-[#222222] hover:text-primary transition-colors" tabIndex={isCompact ? 0 : -1}>Contact Us</Link>
            </div>

            {/* Logo (Centered when compact, left-aligned when expanded) */}
            <Link 
              href="/" 
              className={clsx(
                "absolute transition-all duration-300 ease-in-out will-change-transform flex items-center",
                isCompact 
                  ? "left-1/2 -translate-x-1/2 scale-95" 
                  : "left-[60px] lg:left-[100px] translate-x-0 scale-100"
              )}
            >
              <Image src="/image-2@2x.png" alt="Grainzz Logo" width={180} height={50} className="object-contain h-[42px] w-auto" priority />
            </Link>


            {/* Search Bar (Expanded mode) */}
            <div 
              className={clsx(
                "absolute left-1/2 -translate-x-1/2 flex items-center justify-center",
                isCompact ? "w-0 opacity-0 pointer-events-none" : "w-[400px] xl:w-[500px] opacity-100 pointer-events-auto"
              )}
              style={{ transition: 'width 280ms cubic-bezier(0.4,0,0.2,1), opacity 200ms ease', willChange: 'width, opacity' }}
            >
              <div className="relative w-full h-[48px] border border-[#CCCCCC] rounded-full flex items-center px-5 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] focus-within:border-primary">
                <Search size={20} strokeWidth={2} className="text-[#666666] shrink-0" />
                <input
                  type="text"
                  placeholder="Search for.."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
                    }
                  }}
                  className="w-full h-full pl-3 bg-transparent text-[16px] text-[#222222] placeholder:text-[#888888] font-medium focus:outline-none"
                  tabIndex={isCompact ? -1 : 0}
                />
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex-1 flex items-center justify-end gap-[30px]">
              
              {/* Search Icon button (Compact only) */}
              <div 
                className={clsx(
                  "flex items-center justify-center overflow-hidden",
                  isCompact ? "w-[26px] opacity-100 scale-100 pointer-events-auto" : "w-0 opacity-0 scale-75 pointer-events-none"
                )}
                style={{ transition: 'width 250ms ease, opacity 200ms ease, transform 200ms ease', willChange: 'opacity, transform' }}
              >
                <button className="group" onClick={() => setIsSearchOpen(!isSearchOpen)}>
                  <Search size={26} strokeWidth={2} className="text-[#222222] group-hover:text-primary transition-colors hover:scale-110" />
                </button>
              </div>

              <Link href="/wishlist" className="flex items-center group transition-transform hover:scale-110">
                <Heart size={26} strokeWidth={2} className="text-[#222222] group-hover:text-brand-red transition-colors" />
              </Link>
              <Link 
                href="/account" 
                onClick={handleAccountClick}
                className="flex items-center group transition-transform hover:scale-110"
              >
                <User size={26} strokeWidth={2} className="text-[#222222] group-hover:text-primary transition-colors" />
              </Link>
              <button onClick={openCart} className="flex items-center relative group transition-transform hover:scale-110">
                <ShoppingCart size={26} strokeWidth={2} className="text-[#222222] group-hover:text-primary transition-colors" />
                {count > 0 && <span className="absolute -top-2 -right-2 bg-brand-red text-white text-[12px] rounded-full w-5 h-5 flex items-center justify-center font-bold ring-2 ring-white animate-count-up">{count}</span>}
              </button>
            </div>
          </div>

          {/* Full Navigation Row (Expanded only) */}
          <div 
            className={clsx(
              "w-full flex items-center justify-center overflow-hidden origin-top border-[#EAEAEA]",
              isCompact ? "h-0 opacity-0 border-t-0" : "h-[62px] opacity-100 border-t"
            )}
            style={{ transition: 'height 280ms cubic-bezier(0.4,0,0.2,1), opacity 220ms ease', willChange: 'height, opacity' }}
          >
            <nav className="flex items-center gap-[52px]">
              {navLinks.map((link) => (
                <div key={link.href} className="relative group flex items-center h-full">
                  <div className="flex items-center gap-1 cursor-pointer py-4 group-hover:text-primary transition-colors">
                    <Link 
                      href={link.href} 
                      className={clsx(
                        "text-[16px] font-medium tracking-wide transition-all",
                        link.className || 'text-[#222222]'
                      )}
                      tabIndex={isCompact ? -1 : 0}
                    >
                      {link.label}
                    </Link>
                    {link.dropdown && <ChevronDown size={16} className="mt-[2px] transition-transform group-hover:rotate-180" />}
                  </div>
                  {link.dropdown && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-48 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden border border-[#EAEAEA]">
                      {link.dropdown.map((drop, idx) => (
                        <Link 
                          key={drop.href} 
                          href={drop.href} 
                          className={clsx(
                            "block px-4 py-3 text-[#222222] hover:bg-brand-light hover:text-primary transition-colors text-[15px] font-medium",
                            idx !== link.dropdown!.length - 1 && "border-b border-[#f5f5f5]"
                          )}
                          tabIndex={isCompact ? -1 : 0}
                        >
                          {drop.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Floating Toggleable Search Bar (Desktop Only) */}
          <div 
            className={clsx(
              "absolute top-full left-0 w-full bg-white border-b border-[#EAEAEA] shadow-md z-[35] hidden lg:flex items-center justify-center overflow-hidden transition-all duration-300 ease-in-out px-4",
              isSearchOpen ? "h-[80px] opacity-100" : "h-0 opacity-0 pointer-events-none"
            )}
          >
            <div className="relative w-full max-w-[600px] h-[48px] border border-[#CCCCCC] rounded-full flex items-center px-4 bg-[#FAFAFA] focus-within:border-primary focus-within:bg-white transition-colors">
              <Search size={20} strokeWidth={2} className="text-[#888888] shrink-0" />
              <input
                type="text"
                placeholder="Search for grainzz products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    setIsSearchOpen(false);
                    window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
                  }
                }}
                className="w-full h-full pl-3 bg-transparent text-[16px] text-[#222222] placeholder:text-[#888888] font-medium focus:outline-none"
                autoFocus={isSearchOpen}
              />
              <button onClick={() => setIsSearchOpen(false)} className="text-[#A1A1A1] hover:text-[#222222] transition-colors p-1">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileSearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Mobile Full-Screen Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-[#FBF5EB] animate-fade-in">
          {/* Header */}
          <div className="flex w-full h-[64px] px-4 items-center justify-between flex-shrink-0">
            <div className="flex items-center flex-1">
              <button onClick={() => setMobileOpen(false)} className="p-1 -ml-1 text-[#222222]">
                <X size={24} strokeWidth={2} />
              </button>
            </div>
            <Link href="/" onClick={() => setMobileOpen(false)} className="flex-shrink-0 flex items-center justify-center flex-[2]">
              <Image src="/image-2@2x.png" alt="Grainzz Logo" width={140} height={40} className="object-contain h-[32px]" priority />
            </Link>
            <div className="flex items-center justify-end gap-5 flex-1">
              <button 
                className="text-[#222222]" 
                onClick={() => { setMobileOpen(false); setIsSearchOpen(true); }}
              >
                <Search size={24} strokeWidth={2} />
              </button>
              <button 
                onClick={() => { setMobileOpen(false); openCart(); }} 
                className="text-[#222222] relative pb-1"
              >
                <ShoppingCart size={24} strokeWidth={2} />
                {count > 0 && <span className="absolute -top-1.5 -right-2 bg-brand-red text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{count}</span>}
              </button>
            </div>
          </div>

          {/* Links */}
          <nav className="flex flex-col px-4 mt-2">
            <Link href="/products" onClick={() => setMobileOpen(false)} className="py-[16px] text-[15px] font-medium text-[#222222] border-b border-[#E5DFCC] w-full">Shop All</Link>
            <Link href="/combos" onClick={() => setMobileOpen(false)} className="py-[16px] text-[15px] font-medium text-[#222222] border-b border-[#E5DFCC] w-full">Combos</Link>
            <Link href="/sale" onClick={() => setMobileOpen(false)} className="py-[16px] text-[15px] font-semibold text-brand-red border-b border-[#E5DFCC] w-full">Sales!</Link>
            <Link href="/about" onClick={() => setMobileOpen(false)} className="py-[16px] text-[15px] font-medium text-[#222222] border-b border-[#E5DFCC] w-full">About Us</Link>
            <Link href="/faqs" onClick={() => setMobileOpen(false)} className="py-[16px] text-[15px] font-medium text-[#222222] border-b border-[#E5DFCC] w-full">FAQs</Link>
            <Link href="/account" onClick={handleAccountClick} className="py-[16px] text-[15px] font-medium text-[#222222] border-b border-[#E5DFCC] w-full">My account</Link>
            <Link href="/contact" onClick={() => setMobileOpen(false)} className="py-[16px] text-[15px] font-medium text-[#222222] w-full">Contact Us</Link>
          </nav>
        </div>
      )}
    </>
  );
}

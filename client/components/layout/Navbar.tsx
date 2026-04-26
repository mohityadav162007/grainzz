'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

const navLinks = [
  { label: 'Shop All', href: '/products' },
  { label: 'Combos', href: '/combos' },
  { label: 'Sale!', href: '/sale', className: 'text-brand-red font-semibold' },
  { label: 'About Us', href: '/about' },
  { label: 'FAQs', href: '/faqs' },
  { label: 'Contact Us', href: '/contact' },
];

export default function Navbar() {
  const { items, itemCount, openCart } = useCartStore();
  const [count, setCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Hydration fix for cart count
  useEffect(() => { setCount(itemCount()); }, [items]);

  return (
    <>
      <header className="bg-white sticky top-0 z-40 w-full flex flex-col items-center">
        {/* Top Navbar Container (98px Height, 80px PX, Center aligned contents) */}
        <div className="w-full max-w-[1440px] h-[98px] px-4 md:px-[80px] flex items-center justify-between gap-6 md:gap-[100px]">
          {/* Mobile: Hamburger */}
          <button className="lg:hidden p-2 text-brand-black" onClick={() => setMobileOpen(true)}>
            <Menu size={28} />
          </button>

          {/* Logo Placeholder */}
          <Link href="/" className="flex-shrink-0 flex items-center h-[50px]">
            <span className="text-[32px] font-black tracking-tight text-brand-black font-sans">
              GRAIN<span className="text-brand-red">ZZ</span>
            </span>
          </Link>

          {/* Search Bar - Flex 1 */}
          <div className="hidden lg:flex flex-1 items-center justify-center">
            <div className="relative w-full max-w-[452px] h-[50px] border border-[#8E8E8E] rounded-full flex items-center px-6">
              <Search size={24} className="text-brand-black absolute left-[22px]" />
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
                className="w-full h-full pl-[36px] bg-transparent text-[18px] text-brand-black placeholder:text-[#707070] focus:outline-none"
              />
            </div>
          </div>

          {/* Icons Context (User, Cart) */}
          <div className="flex items-center gap-[12px]">
            <button className="lg:hidden p-2 text-brand-black" onClick={() => {
              // Mobile search toggle could go here, omitting for layout simplicity
            }}>
              <Search size={28} />
            </button>
            <div className="hidden lg:flex w-[50px] h-[50px] items-center justify-center">
              <Link href="/account" className="text-brand-black hover:text-brand-green transition-colors">
                <User size={34} strokeWidth={1.5} />
              </Link>
            </div>
            <div className="w-[50px] h-[50px] flex items-center justify-center relative">
              <button
                id="cart-btn"
                onClick={openCart}
                className="text-brand-black hover:text-brand-green transition-colors relative"
              >
                <ShoppingCart size={34} strokeWidth={1.5} />
                {count > 0 && (
                  <span className="absolute -top-1 -right-2 bg-brand-red text-white text-[12px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Banner (Links) / Height: 64px */}
        <div className="hidden lg:flex w-full border-y border-[#E4E4E4]">
          <div className="max-w-[1440px] mx-auto w-full h-[64px] px-[80px] flex items-center justify-center">
            <nav className="flex items-center gap-[44px]">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[18px] font-medium transition-colors hover:text-brand-green ${
                    link.className || 'text-brand-black'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl animate-slide-in-right flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="text-xl font-black text-brand-black">GRAIN<span className="text-brand-red">ZZ</span></span>
              <button onClick={() => setMobileOpen(false)}><X size={22} className="text-brand-black" /></button>
            </div>
            <nav className="flex flex-col py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-6 py-3 text-[18px] font-medium hover:bg-brand-light transition-colors ${link.className || 'text-brand-black'}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

const navLinks = [
  { label: 'Shop All', href: '/products' },
  { label: 'Combos', href: '/combos' },
  { label: 'Sale!', href: '/sale', className: 'text-accent font-semibold' },
  { label: 'About Us', href: '/about' },
  { label: 'FAQs', href: '/faqs' },
  { label: 'Contact Us', href: '/contact' },
];

export default function Navbar() {
  const { items, itemCount, openCart } = useCartStore();
  const [count, setCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Hydration fix for cart count
  useEffect(() => { setCount(itemCount()); }, [items]);

  return (
    <>
      {/* Desktop Navbar */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          {/* Top Row */}
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Mobile: Hamburger */}
            <button className="lg:hidden p-2" onClick={() => setMobileOpen(true)}>
              <Menu size={22} />
            </button>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-black tracking-tight">
                GRAIN<span className="text-accent">ZZ</span>
              </span>
            </Link>

            {/* Search Bar (desktop) */}
            <div className="hidden lg:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2" onClick={() => setSearchOpen(!searchOpen)}>
                <Search size={20} />
              </button>
              <Link href="/account" className="hidden lg:flex p-2 hover:text-primary transition-colors">
                <User size={22} />
              </Link>
              <button
                id="cart-btn"
                onClick={openCart}
                className="relative p-2 hover:text-primary transition-colors"
              >
                <ShoppingCart size={22} />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          {searchOpen && (
            <div className="lg:hidden pb-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search for.."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
                    }
                  }}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          )}

          {/* Nav Links (desktop) */}
          <nav className="hidden lg:flex items-center justify-center gap-8 pb-3 border-t border-gray-100 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium hover:text-primary transition-colors ${link.className || 'text-text-main'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl animate-slide-in-right flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="text-xl font-black">GRAIN<span className="text-accent">ZZ</span></span>
              <button onClick={() => setMobileOpen(false)}><X size={22} /></button>
            </div>
            <nav className="flex flex-col py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-6 py-3 text-base font-medium hover:bg-cream transition-colors ${link.className || 'text-text-main'}`}
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

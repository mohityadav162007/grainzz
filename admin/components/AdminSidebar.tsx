'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, Tag, Star, LogOut, Menu, X, Home, BarChart3, MessageSquare, Settings, Ticket, Inbox, Truck, Filter } from 'lucide-react';
import { useState } from 'react';
import { adminLogout } from '@/lib/api';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Products', href: '/dashboard/products', icon: Package },
  { label: 'Orders', href: '/dashboard/orders', icon: ShoppingBag },
  { label: 'Shipments', href: '/dashboard/shipments', icon: Truck },
  { label: 'Categories', href: '/dashboard/categories', icon: Tag },
  { label: 'Filter Management', href: '/dashboard/filters', icon: Filter },
  { label: 'Coupons', href: '/dashboard/coupons', icon: Ticket },
  { label: 'Product Reviews', href: '/dashboard/reviews', icon: MessageSquare },
  { label: 'Inquiries', href: '/dashboard/inquiries', icon: Inbox },
  { label: 'Offers', href: '/dashboard/offers', icon: Star },
  { label: 'Related Products', href: '/dashboard/related-products', icon: Package },
  { label: 'Homepage', href: '/dashboard/homepage', icon: Home },
  { label: 'Analytics', href: '/dashboard/export', icon: BarChart3 },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await adminLogout();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-md rounded-lg p-2"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-sidebar flex flex-col transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="px-6 py-6 border-b border-white/10">
          <div className="text-xl font-black text-white">GRAIN<span className="text-red-400">ZZ</span></div>
          <p className="text-white/40 text-xs mt-0.5">Admin Dashboard</p>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors mx-2 rounded-lg mb-0.5 ${isActive ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 rounded-lg w-full transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Backdrop mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
    </>
  );
}

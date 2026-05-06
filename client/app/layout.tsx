import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';

import AuthInitializer from '@/components/auth/AuthInitializer';
import AuthModal from '@/components/auth/AuthModal';
import GuestPopupTrigger from '@/components/auth/GuestPopupTrigger';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], display: 'swap', adjustFontFallback: false });

export const metadata: Metadata = {
  title: 'Grainzz – Power of Real Grains for Better Gainzz',
  description:
    'Grainzz is a healthy Indian snacks brand crafting guilt-free, roasted, grain-based snacks. Shop Oats Chips, Quinoa Puffs, Ragi Chips & more. Shipping PAN India.',
  keywords: 'healthy snacks, grainzz, oats chips, quinoa puffs, ragi chips, millet snacks, D2C snacks India',
  openGraph: {
    title: 'Grainzz – Power of Real Grains',
    description: 'Healthy, roasted, guilt-free grain snacks. Shop now.',
    type: 'website',
  },
};

import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script src="https://mercury.phonepe.com/web/bundle/checkout.js" strategy="lazyOnload" />
      </head>
      <body className={`${jakarta.className} bg-white text-brand-black`}>
        <AuthInitializer />
        <GuestPopupTrigger />
        <AnnouncementBar />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <CartDrawer />
        <AuthModal />
      </body>
    </html>
  );
}

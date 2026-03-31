import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AnnouncementBar />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}

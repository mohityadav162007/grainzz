import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';

import AuthInitializer from '@/components/auth/AuthInitializer';
import AuthModal from '@/components/auth/AuthModal';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], display: 'swap', adjustFontFallback: false });

import { constructMetadata, generateOrganizationSchema } from '@/lib/seo';

export const metadata: Metadata = {
  ...constructMetadata({
    title: 'Grainzz – Power of Real Grains for Better Gainzz',
    description: 'Grainzz is a healthy Indian snacks brand crafting guilt-free, roasted, grain-based snacks. Shop Oats Chips, Quinoa Puffs, Ragi Chips & more. Shipping PAN India.',
  }),
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      msvalidate: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ? [process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION] : [],
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script src="https://mercury.phonepe.com/web/bundle/checkout.js" strategy="lazyOnload" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateOrganizationSchema()) }}
        />
      </head>
      <body className={`${jakarta.className} bg-white text-brand-black`}>
        <AuthInitializer />
        <AnnouncementBar />
        <Navbar />
        <main className="min-h-screen overflow-x-clip">{children}</main>
        <Footer />
        <CartDrawer />
        <AuthModal />
      </body>
    </html>
  );
}

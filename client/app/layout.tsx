import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import CouponNotificationToast from '@/components/cart/CouponNotificationToast';

import AuthInitializer from '@/components/auth/AuthInitializer';
import AuthModal from '@/components/auth/AuthModal';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], display: 'swap', adjustFontFallback: false });

import { constructMetadata, generateOrganizationSchema, generateWebSiteSchema } from '@/lib/seo';

export const metadata: Metadata = {
  ...constructMetadata({
    title: 'GRAINZZ – Healthy Millet Snacks Made with Real Grains',
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
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_IMAGEKIT_URL || "https://ik.imagekit.io"} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_IMAGEKIT_URL || "https://ik.imagekit.io"} />
        <Script src="https://mercury.phonepe.com/web/bundle/checkout.js" strategy="lazyOnload" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: `[${JSON.stringify(generateOrganizationSchema())},${JSON.stringify(generateWebSiteSchema())}]`
          }}
        />
        {/* Google tag (gtag.js) */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-BJ9E64E63N"
          strategy="lazyOnload"
        />
        <Script
          id="google-analytics"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-BJ9E64E63N');
            `,
          }}
        />
        {/* Meta Pixel Code */}
        <Script
          id="meta-pixel"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1028722326482306');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1028722326482306&ev=PageView&noscript=1"
          />
        </noscript>
        {/* End Meta Pixel Code */}
      </head>
      <body className={`${jakarta.className} bg-white text-brand-black`}>
        <AuthInitializer />
        <CouponNotificationToast />
        <AnnouncementBar />
        <Navbar />
        <main className="min-h-[100dvh] overflow-x-clip">{children}</main>
        <Footer />
        <CartDrawer />
        <AuthModal />
      </body>
    </html>
  );
}

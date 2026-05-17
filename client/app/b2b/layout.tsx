import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...constructMetadata({
    title: 'B2B Wholesale & Corporate Orders | Grainzz',
    description: 'Partner with Grainzz for office pantry supplies, corporate gifting, event snacks, and bulk wholesale orders of healthy grain-based snacks across India.',
    path: '/b2b',
  }),
};

export default function B2BLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

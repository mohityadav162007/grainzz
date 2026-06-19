import type { Metadata } from 'next';

import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Shop Healthy Grain Snacks | Grainzz',
  description: 'Buy Ragi Chips, Bajra Puffs, Oats Chips, Quinoa Puffs, Jowar Puffs & more healthy millet snacks from Grainzz. No palm oil, roasted not fried. PAN India delivery.',
  path: '/products',
  keywords: ['ragi chips', 'bajra puffs', 'oats chips', 'quinoa puffs', 'jowar puffs', 'healthy millet snacks', 'grain snacks India', 'buy healthy snacks online'],
});

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

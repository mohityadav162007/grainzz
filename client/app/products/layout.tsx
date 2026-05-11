import type { Metadata } from 'next';

import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'All Products – Grainzz',
  description: 'Shop all Grainzz healthy grain snacks – Oats Chips, Quinoa Puffs, Ragi Chips and more.',
  path: '/products',
});

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

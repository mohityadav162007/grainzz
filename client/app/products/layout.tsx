import type { Metadata } from 'next';

import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'All Products | Grainzz',
  description: 'Explore the complete range of healthy grain-based snacks from Grainzz, including ragi chips, puffs, and nutritious everyday snacking options.',
  path: '/products',
});

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

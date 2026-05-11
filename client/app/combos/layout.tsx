import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Combos & Gift Packs – Grainzz',
  description: 'Shop Grainzz combo packs and gift boxes. Healthy, roasted snacks perfect for gifting or stocking up.',
  path: '/combos',
});

export default function CombosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

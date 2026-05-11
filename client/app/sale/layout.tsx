import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Sale & Offers – Grainzz',
  description: 'Shop discounted healthy grain snacks from Grainzz. Limited time offers on Oats Chips, Quinoa Puffs, and more.',
  path: '/sale',
});

export default function SaleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

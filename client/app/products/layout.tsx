import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Products – Grainzz',
  description: 'Shop all Grainzz healthy grain snacks – Oats Chips, Quinoa Puffs, Ragi Chips and more.',
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

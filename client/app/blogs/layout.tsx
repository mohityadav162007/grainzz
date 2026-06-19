import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Healthy Snacking Blog | Grainzz',
  description: 'Read expert articles and tips on healthy snacking, nutrition, grains, and wellness from Grainzz. Discover recipes, ingredient guides, and clean eating insights.',
  path: '/blogs',
  keywords: ['healthy snacking blog', 'millet recipes', 'grain nutrition', 'clean eating India', 'healthy snack tips', 'ragi benefits', 'bajra nutrition'],
});

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

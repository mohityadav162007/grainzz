import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Healthy Snacking Blog | Grainzz',
  description: 'Read expert articles and tips on healthy snacking, nutrition, grains, and wellness from Grainzz.',
  path: '/blogs',
});

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

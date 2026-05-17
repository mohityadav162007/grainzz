import type { Metadata } from 'next';

import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Contact Us | Grainzz',
  description: 'Get in touch with Grainzz for product enquiries, orders, partnerships, and customer support.',
  path: '/contact',
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

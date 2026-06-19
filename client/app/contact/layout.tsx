import type { Metadata } from 'next';

import { constructMetadata } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Contact Us | Grainzz',
  description: 'Get in touch with Grainzz for product enquiries, bulk orders, corporate gifting, and customer support. We respond within 24 hours.',
  path: '/contact',
  keywords: ['contact grainzz', 'grainzz customer support', 'grainzz bulk order', 'grainzz corporate gifting enquiry'],
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

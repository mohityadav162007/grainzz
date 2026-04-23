import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us – Grainzz',
  description: 'Get in touch with Grainzz. We are here to help with orders, shipping, returns, and more.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

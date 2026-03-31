import type { Metadata } from 'next';
import FAQSection from '@/components/home/FAQSection';

export const metadata: Metadata = {
  title: 'FAQs – Grainzz',
  description: 'Find answers to frequently asked questions about Grainzz snacks, shipping, returns, and more.',
};

export default function FAQsPage() {
  return (
    <div className="py-8">
      <div className="bg-cream py-12 text-center mb-4">
        <h1 className="text-3xl md:text-4xl font-black text-text-main">Frequently Asked Questions</h1>
        <p className="text-text-muted mt-2 text-sm">Everything you need to know about Grainzz</p>
      </div>
      <FAQSection />
    </div>
  );
}

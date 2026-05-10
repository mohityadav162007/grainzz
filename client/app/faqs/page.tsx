import type { Metadata } from 'next';
import FAQSection from '@/components/home/FAQSection';

export const metadata: Metadata = {
  title: 'FAQs – Grainzz',
  description: 'Find answers to frequently asked questions about Grainzz snacks, shipping, returns, and more.',
};

export default function FAQsPage() {
  return (
    <div className="bg-[#FBF5EB] min-h-screen">
      <FAQSection full={true} variant="page" />
    </div>
  );
}

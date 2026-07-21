import type { Metadata } from 'next';
import FAQSection from '@/components/home/FAQSection';
import { FAQS } from '@/lib/faqs';
import { constructMetadata, generateFAQSchema } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'FAQs – Grainzz',
  description: 'Find answers to frequently asked questions about Grainzz snacks, shipping, returns, and more.',
  path: '/faqs',
});

export default function FAQsPage() {
  return (
    <div className="bg-[#FBF5EB] min-h-[100dvh]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFAQSchema(FAQS)),
        }}
      />
      <FAQSection full={true} variant="page" />
    </div>
  );
}

import type { Metadata } from 'next';
import FAQSection from '@/components/home/FAQSection';

export const metadata: Metadata = {
  title: 'FAQs – Grainzz',
  description: 'Find answers to frequently asked questions about Grainzz snacks, shipping, returns, and more.',
};

export default function FAQsPage() {
  return (
    <div className="bg-white min-h-screen pb-[100px]">
      <div className="bg-[#FCF9F2] py-[80px] text-center w-full border-b border-[#EAEAEA]">
        <h1 className="text-[40px] md:text-[56px] font-bold text-brand-black font-brand tracking-tight">Frequently Asked Questions</h1>
        <p className="text-[#666666] mt-[16px] text-[18px] font-medium font-sans">Everything you need to know about Grainzz</p>
      </div>
      <div className="pt-[40px]">
        <FAQSection />
      </div>
    </div>
  );
}

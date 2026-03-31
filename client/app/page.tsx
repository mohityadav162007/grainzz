import { Suspense } from 'react';
import HeroSection from '@/components/home/HeroSection';
import StatsBar from '@/components/home/StatsBar';
import ProductSegments from '@/components/home/ProductSegments';
import BenefitsSection from '@/components/home/BenefitsSection';
import SaleSection from '@/components/home/SaleSection';
import EssentialSnackBox from '@/components/home/EssentialSnackBox';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import InstagramSection from '@/components/home/InstagramSection';
import FAQSection from '@/components/home/FAQSection';

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <StatsBar />
      <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading products...</div>}>
        <ProductSegments />
      </Suspense>
      <BenefitsSection />
      <Suspense fallback={null}>
        <SaleSection />
      </Suspense>
      <EssentialSnackBox />
      <TestimonialsSection />
      <InstagramSection />
      <FAQSection />
    </div>
  );
}

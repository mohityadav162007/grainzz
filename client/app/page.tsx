import HeroSection from '@/components/home/HeroSection';
import StatsBar from '@/components/home/StatsBar';
import ProductSegments from '@/components/home/ProductSegments';
import BenefitsSection from '@/components/home/BenefitsSection';
import PoweredBy from '@/components/home/PoweredBy';


import EssentialSnackBox from '@/components/home/EssentialSnackBox';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import InstagramSection from '@/components/home/InstagramSection';
import FAQSection from '@/components/home/FAQSection';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <ProductSegments />
      <StatsBar />
      <BenefitsSection />
      <PoweredBy />

      <EssentialSnackBox />
      <TestimonialsSection />
      <InstagramSection />
      <FAQSection />
    </div>
  );
}

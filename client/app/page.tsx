import dynamic from 'next/dynamic';
import HeroSection from '@/components/home/HeroSection';
import StatsBar from '@/components/home/StatsBar';
import ProductSegments from '@/components/home/ProductSegments';

const BenefitsSection = dynamic(() => import('@/components/home/BenefitsSection'));
const PoweredBy = dynamic(() => import('@/components/home/PoweredBy'));
const EssentialSnackBox = dynamic(() => import('@/components/home/EssentialSnackBox'));
const TestimonialsSection = dynamic(() => import('@/components/home/TestimonialsSection'));
const InstagramSection = dynamic(() => import('@/components/home/InstagramSection'));
const FAQSection = dynamic(() => import('@/components/home/FAQSection'));

import {
  getHeroSlides,
  getTrustMetrics,
  getHomepageProductTabs,
  getPoweredByCards,
  getSnackBoxItems,
  getInstagramPosts,
  getSiteContent,
  getActiveOffersMap,
} from '@/lib/api';
import { supabase } from '@/lib/supabase';

// ISR: re-generate the page at most once every 60 seconds.
export const revalidate = 60;

const HOMEPAGE_REVIEW_IDS = [
  '9fb17378-0edd-4f8f-a7ca-f23ad2d3b049',
  'a769b834-3673-40ed-87c7-b1c19717d0e1',
  'f8ae529c-83b8-4216-8259-178564e9d41c',
  'a9c352ce-99e3-4496-83bc-7904a7128c8a',
  '62b4eb79-8d83-4648-8304-1264fcc6a74d',
  'c19020a7-b8e4-4459-a062-a47480935c87',
];

const HOMEPAGE_REVIEWS_META = [
  { text: "Loved the flavour and crunch. It does not feel like regular oily chips, which is exactly why I tried it again.", author: 'Aarav Mehta', role: 'Delhi', rating: 5, product_id: '9fb17378-0edd-4f8f-a7ca-f23ad2d3b049' },
  { text: "Perfect for evening snacking. Light, tasty and much easier to keep reaching for than namkeen.", author: 'Ritika Sharma', role: 'Gurugram', rating: 5, product_id: 'a769b834-3673-40ed-87c7-b1c19717d0e1' },
  { text: "I bought these out of curiosity but ended up loving them. Great if you want something different from standard chips.", author: 'Sneha Nair', role: 'Bengaluru', rating: 5, product_id: 'f8ae529c-83b8-4216-8259-178564e9d41c' },
  { text: "Did not expect quinoa snacks to taste this good. These have become my work desk snack now.", author: 'Kunal Arora', role: 'Noida', rating: 5, product_id: 'a9c352ce-99e3-4496-83bc-7904a7128c8a' },
  { text: "The combo is the best way to try Grainzz because everyone at home ends up liking a different one.", author: 'Priya Bansal', role: 'Jaipur', rating: 5, product_id: '62b4eb79-8d83-4648-8304-1264fcc6a74d' },
  { text: "Very easy to snack on at night. Light, flavourful and much better than random fried snacks.", author: 'Nidhi Kapoor', role: 'Mumbai', rating: 5, product_id: 'c19020a7-b8e4-4459-a062-a47480935c87' },
];

export default async function HomePage() {
  // ── Fetch ALL data in ONE parallel round-trip ─────────────────────────────
  const [
    heroSlides,
    trustMetrics,
    tabs,
    rawPoweredByCards,
    snackBoxData,
    instagramPosts,
    instagramSection,
    instagramConfig,
    productTabsHeading,
    offersMap,
    testimonialProductsResult,
  ] = await Promise.all([
    getHeroSlides().catch(() => []),
    getTrustMetrics().catch(() => []),
    getHomepageProductTabs().catch(() => []),
    getPoweredByCards().catch(() => []),
    getSnackBoxItems().catch(() => null),
    getInstagramPosts().catch(() => []),
    getSiteContent('instagram_section').catch(() => null),
    getSiteContent('instagram_config').catch(() => null),
    getSiteContent('product_tabs_heading').catch(() => null),
    getActiveOffersMap().catch(() => ({})),
    // Fetch testimonial products in one batch query
    (async () => {
      try {
        const { data } = await supabase
          .from('products')
          .select('*')
          .in('id', HOMEPAGE_REVIEW_IDS)
          .eq('is_active', true);
        return data || [];
      } catch {
        return [];
      }
    })(),
  ]);

  // ── Collect all product IDs we need in one go ─────────────────────────────
  const poweredBySlice = (rawPoweredByCards as any[]).slice(0, 3);
  const poweredByProductIds = poweredBySlice
    .filter((c: any) => c.product_id)
    .map((c: any) => c.product_id);

  const firstTab = (tabs as any[])[0];
  const firstTabProductIds: string[] = firstTab?.product_ids?.length > 0
    ? firstTab.product_ids
    : [];

  // ── Batch fetch remaining product data in ONE query ───────────────────────
  const allNeededIds = Array.from(new Set([...poweredByProductIds, ...firstTabProductIds]));

  const batchProducts: any[] = allNeededIds.length > 0
    ? await (async () => {
        try {
          const { data } = await supabase
            .from('products')
            .select('*')
            .in('id', allNeededIds)
            .eq('is_active', true);
          return (data || []).map((p: any) => {
            if (p?.images) p.images = p.images.map((img: string) => img.includes('placeholder.jpg') ? '/image-2@2x.png' : img);
            return p;
          });
        } catch {
          return [];
        }
      })()
    : [];

  const batchMap = new Map(batchProducts.map((p: any) => [p.id, p]));

  // ── Build PoweredBy cards from batch map ──────────────────────────────────
  const poweredByCards = poweredBySlice.map((card: any) => {
    const productData = card.product_id ? batchMap.get(card.product_id) || null : null;
    const image = card.custom_image_url || productData?.images?.[0] || card.image_url || '/Rectangle-10@2x.webp';
    const title = productData?.name || card.title || 'Product';
    const link = productData ? `/products/${productData.slug}` : card.link || '#';
    return { title, subtitle: card.subtitle || '', topBg: card.top_bg_color || '#C68356', bottomBg: card.bottom_bg_color || '#FDECE7', image, link, price: productData?.price, mrp: productData?.mrp, product: productData };
  });

  // ── Build Testimonials from batch map ─────────────────────────────────────
  const productMap = new Map((testimonialProductsResult as any[]).map((p: any) => [p.id, p]));
  const reviews = HOMEPAGE_REVIEWS_META
    .map(r => ({ ...r, product: productMap.get(r.product_id) || null }))
    .filter(r => r.product !== null);

  // ── First tab products from batch map ─────────────────────────────────────
  const firstTabProducts = firstTabProductIds
    .map(id => batchMap.get(id))
    .filter(Boolean);

  return (
    <div>
      <HeroSection initialSlides={heroSlides} />
      <ProductSegments
        initialTabs={tabs as any}
        initialProducts={firstTabProducts}
        initialHeading={(productTabsHeading as any)?.heading}
        offersMap={offersMap}
      />
      <StatsBar initialStats={trustMetrics} />
      <BenefitsSection />
      <PoweredBy initialCards={poweredByCards} />
      <EssentialSnackBox initialData={snackBoxData} />
      <TestimonialsSection initialReviews={reviews} />
      <InstagramSection
        initialPosts={instagramPosts}
        initialSection={instagramSection}
        initialConfig={instagramConfig}
      />
      <FAQSection />
    </div>
  );
}

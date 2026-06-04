import { Metadata } from 'next';
import { getProductBySlug, getProductReviews, getSeedReviewsByProductId } from '@/lib/api';
import { constructMetadata, generateProductSchema, generateBreadcrumbSchema } from '@/lib/seo';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const res = await getProductBySlug(params.slug);
    if (!res?.data) return constructMetadata({ title: 'Product Not Found' });

    const product = res.data;
    const url = `/products/${product.slug}`;

    return constructMetadata({
      title: `${product.name} – Grainzz`,
      description: product.short_description || product.description,
      image: product.images?.[0],
      path: url,
    });
  } catch (error) {
    return constructMetadata({ title: 'Product – Grainzz' });
  }
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  let product = null;
  let reviews: any[] = [];
  let seedReviews: any[] = [];
  try {
    const res = await getProductBySlug(params.slug);
    product = res?.data;
    if (product) {
      const [revs, seeds] = await Promise.all([
        getProductReviews(product.id).catch(() => []),
        getSeedReviewsByProductId(product.id).catch(() => []),
      ]);
      reviews = revs;
      seedReviews = seeds;
    }
  } catch (error) {
    console.error('Error fetching product or reviews for layout schema:', error);
  }

  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.grainzz.com'}/products/${params.slug}`;

  return (
    <>
      {product && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateProductSchema(product, url, reviews, seedReviews)) }}
        />
      )}
      {product && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              generateBreadcrumbSchema([
                { name: 'Home', item: '/' },
                { name: product.category || 'Products', item: `/products?category=${product.category?.toLowerCase().replace(/\s+/g, '-') || 'all'}` },
                { name: product.name, item: `/products/${product.slug}` },
              ])
            ),
          }}
        />
      )}
      {children}
    </>
  );
}

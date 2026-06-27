import { getProductBySlug, getProductReviews, getSeedReviewsByProductId, getPublicBlogs, getProducts } from '@/lib/api';
import Link from 'next/link';
import ProductDetailPageClient from './ProductDetailPageClient';

// ISR: re-generate at most once every 5 minutes — product changes are visible quickly without a redeploy
export const revalidate = 300;

interface PageProps {
  params: {
    slug: string;
  };
}

// Pre-render all known product slugs at build time
export async function generateStaticParams() {
  try {
    const res = await getProducts({ limit: '200' });
    return (res.data || []).map((p: any) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

function getRelevantBlogs(product: any, blogs: any[]): any[] {
  if (!blogs || blogs.length === 0) return [];
  const searchTerms = new Set<string>();
  
  if (product.name) {
    product.name.split(/\s+/).forEach((w: string) => {
      const clean = w.replace(/[^a-zA-Z]/g, '').toLowerCase();
      if (clean.length > 3) searchTerms.add(clean);
    });
  }
  if (product.category) {
    searchTerms.add(product.category.toLowerCase());
  }
  if (product.tags) {
    product.tags.forEach((t: string) => searchTerms.add(t.toLowerCase()));
  }

  const termList = Array.from(searchTerms);
  const matches = blogs.filter(b => {
    const titleLower = b.title?.toLowerCase() || '';
    const keywordsLower = b.meta_keywords?.toLowerCase() || '';
    const contentLower = b.content?.toLowerCase() || '';
    return termList.some(term =>
      titleLower.includes(term) || keywordsLower.includes(term) || contentLower.includes(term)
    );
  });

  if (matches.length > 0) {
    return matches.slice(0, 3);
  }
  
  return blogs.slice(0, 3);
}

export default async function ProductDetailPage({ params }: PageProps) {
  let product = null;
  let reviews: any[] = [];
  let seedReviews: any[] = [];
  let relatedBlogs: any[] = [];

  try {
    const res = await getProductBySlug(params.slug);
    product = res?.data;

    if (product) {
      const [revs, seeds, blogsRes] = await Promise.all([
        getProductReviews(product.id).catch(() => []),
        getSeedReviewsByProductId(product.id).catch(() => []),
        getPublicBlogs().catch(() => ({ data: [] })),
      ]);
      reviews = revs;
      seedReviews = seeds;
      
      const blogs = blogsRes.data || [];
      relatedBlogs = getRelevantBlogs(product, blogs);
    }
  } catch (error) {
    console.error('Failed to load product page details on server:', error);
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FCF9F2] px-4 text-center">
        <h1 className="text-4xl font-black text-gray-900 mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been moved.</p>
        <Link href="/products" className="bg-[#1D5E20] text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <ProductDetailPageClient
      initialProduct={product}
      initialReviews={reviews}
      initialSeedReviews={seedReviews}
      relatedBlogs={relatedBlogs}
    />
  );
}

import { getBlogBySlug, getProducts } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import ShareButtonsClient from '../ShareButtonsClient';
import ProductCard from '@/components/products/ProductCard';
import { Metadata } from 'next';
import { constructMetadata, generateBlogSchema, siteConfig } from '@/lib/seo';
import Image from '@/components/ui/AppImage';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  let blog = null;
  try {
    const res = await getBlogBySlug(params.slug);
    blog = res?.data;
  } catch (error) {
    console.error('Error generating metadata:', error);
  }

  if (!blog) {
    return constructMetadata({
      title: 'Blog Not Found | Grainzz',
      noIndex: true,
    });
  }

  const keywords = blog.meta_keywords ? blog.meta_keywords.split(',').map((k: string) => k.trim()) : undefined;
  const canonicalPath = blog.canonical_url || `/blogs/${blog.slug}`;
  const title = blog.seo_title || blog.og_title || blog.title;
  
  // Description fallback chain
  let description = blog.meta_description || blog.og_description || blog.excerpt || '';
  if (!description && blog.content) {
    // strip HTML and truncate
    const strippedContent = blog.content.replace(/<[^>]*>/g, ' ');
    description = strippedContent.length > 150 ? strippedContent.substring(0, 150) + '...' : strippedContent;
  }
  
  const image = blog.og_image_url || blog.featured_image_url || siteConfig.ogImage;
  const ogTitle = blog.og_title || title;
  const ogDescription = blog.og_description || description;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath.startsWith('/') ? canonicalPath : '/' + canonicalPath}`,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: `${siteConfig.url}${canonicalPath.startsWith('/') ? canonicalPath : '/' + canonicalPath}`,
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [image],
      creator: '@grainzz',
    },
    robots: {
      index: blog.is_indexable !== false,
      follow: true,
    },
  };
}

function getRelevantProducts(blog: any, products: any[]): any[] {
  if (!products || products.length === 0) return [];
  const searchTerms = new Set<string>();
  
  if (blog.meta_keywords) {
    blog.meta_keywords.split(',').forEach((k: string) => searchTerms.add(k.trim().toLowerCase()));
  }
  if (blog.title) {
    blog.title.split(/\s+/).forEach((w: string) => {
      const clean = w.replace(/[^a-zA-Z]/g, '').toLowerCase();
      if (clean.length > 3) searchTerms.add(clean);
    });
  }

  const termList = Array.from(searchTerms);
  const matches = products.filter(p => {
    const nameLower = p.name?.toLowerCase() || '';
    const descLower = p.description?.toLowerCase() || '';
    const catLower = p.category?.toLowerCase() || '';
    return termList.some(term =>
      nameLower.includes(term) || descLower.includes(term) || catLower.includes(term)
    );
  });

  if (matches.length > 0) {
    return matches.slice(0, 3);
  }
  
  return products.slice(0, 3);
}

export default async function BlogDetailPage({ params }: PageProps) {
  let blog = null;
  try {
    const res = await getBlogBySlug(params.slug);
    blog = res?.data;
  } catch (error) {
    console.error('Failed to load blog by slug:', error);
  }

  if (!blog) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#FCF9F2] px-4 text-center">
        <h1 className="text-4xl font-black text-gray-900 mb-4">Blog Not Found</h1>
        <p className="text-gray-600 mb-8">The article you're looking for doesn't exist or has been moved.</p>
        <Link href="/blogs" className="bg-[#1D5E20] text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform">
          Back to Blogs
        </Link>
      </div>
    );
  }

  // Fetch products and identify relevant ones
  let relevantProducts: any[] = [];
  try {
    const productsRes = await getProducts({ limit: '100' });
    if (productsRes.success && productsRes.data) {
      relevantProducts = getRelevantProducts(blog, productsRes.data);
    }
  } catch (error) {
    console.error('Failed to fetch products for internal linking:', error);
  }

  const canonicalPath = blog.canonical_url || `/blogs/${blog.slug}`;
  const schema = generateBlogSchema(blog, `${siteConfig.url}${canonicalPath.startsWith('/') ? canonicalPath : '/' + canonicalPath}`);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema),
        }}
      />
      <main className="bg-[#FCF9F2] min-h-[100dvh] pb-20">
        {/* Header / Breadcrumb */}
        <div className="max-w-[900px] mx-auto px-4 pt-12 pb-8">
          <Link href="/blogs" className="inline-flex items-center gap-2 text-[#1D5E20] font-bold hover:gap-3 transition-all mb-8">
            <ArrowLeft size={20} />
            <span>Back to Articles</span>
          </Link>
          
          <h1 className="text-3xl lg:text-5xl font-black text-gray-900 leading-tight mb-6">
            {blog.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 font-medium border-b border-gray-200 pb-8">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-[#1D5E20]" />
              <span>{new Date(blog.created_at).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-[#1D5E20]" />
              <span>5 min read</span>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {blog.featured_image_url && (
          <div className="max-w-[1100px] mx-auto px-4 mb-12">
            <div className="aspect-[21/9] rounded-[32px] overflow-hidden shadow-2xl relative">
            <Image 
              src={blog.featured_image_url} 
              alt={blog.title}
              fill
              sizes="(max-width: 1100px) 100vw, 1100px"
              priority
              className="object-cover"
            />
          </div>
          </div>
        )}

        {/* Content */}
        <div className="max-w-[900px] mx-auto px-4 mb-16">
          <div className="bg-white rounded-[40px] p-8 lg:p-16 shadow-sm border border-gray-100">
            <div 
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
            
            <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <span className="font-bold text-gray-900">Share this:</span>
                <ShareButtonsClient blogTitle={blog.title} />
              </div>
              
              <Link href="/products" className="text-[#1D5E20] font-black underline underline-offset-8 hover:text-[#164618] transition-colors">
                Explore Our Products
              </Link>
            </div>
          </div>
        </div>

        {/* Relevant Products Section */}
        {relevantProducts.length > 0 && (
          <section className="max-w-[1100px] mx-auto px-4 mt-16 pt-16 border-t border-gray-200">
            <div className="text-center md:text-left mb-10">
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Related Wholesome Snacks</h3>
              <p className="text-gray-500 font-medium">Snacks that pair perfectly with the healthy insights in this article.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {relevantProducts.map((product) => (
                <div key={product.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}

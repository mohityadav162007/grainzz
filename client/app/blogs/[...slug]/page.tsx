// Always fetch fresh — ensures blog content/image edits appear without redeploy
export const revalidate = 0;

import { getBlogBySlug, getProducts } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import ShareButtonsClient from '../ShareButtonsClient';
import ProductCard from '@/components/products/ProductCard';

interface PageProps {
  params: {
    slug: string[];
  };
}

async function fetchBlogWithFallback(slugArray: string[]) {
  if (!slugArray || slugArray.length === 0) return null;

  const fullSlug = slugArray.join('/');
  const lastSegment = slugArray[slugArray.length - 1];
  
  // 1. Try exact match
  let res = await getBlogBySlug(fullSlug);
  
  // 2. Try with leading slash
  if (!res?.data) {
    res = await getBlogBySlug('/' + fullSlug);
  }

  // 3. Try stripping "blog/" prefix
  if (!res?.data && fullSlug.startsWith('blog/')) {
    const stripped = fullSlug.replace('blog/', '');
    res = await getBlogBySlug(stripped);
    if (!res?.data) res = await getBlogBySlug('/' + stripped);
  }

  // 4. Ultimate Fallback
  if (!res?.data && slugArray.length > 1) {
    res = await getBlogBySlug(lastSegment);
    if (!res?.data) res = await getBlogBySlug('/' + lastSegment);
  }

  return res?.data;
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
  const blog = await fetchBlogWithFallback(params.slug);

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FCF9F2] px-4 text-center">
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

  return (
    <main className="bg-[#FCF9F2] min-h-screen pb-20">
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
          <div className="aspect-[21/9] rounded-[32px] overflow-hidden shadow-2xl">
            <img 
              src={blog.featured_image_url} 
              alt={blog.title}
              className="w-full h-full object-cover"
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
  );
}

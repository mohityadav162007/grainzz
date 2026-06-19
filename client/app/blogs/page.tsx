// Always fetch fresh — ensures blog edits appear immediately without a redeploy
export const revalidate = 0;

import { getPublicBlogs } from '@/lib/api';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default async function BlogsPage() {
  let blogs: any[] = [];
  try {
    const res = await getPublicBlogs();
    blogs = res.data || [];
  } catch (error) {
    console.error('Failed to load public blogs:', error);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.grainzzindia.com';
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/blogs`,
        "url": `${siteUrl}/blogs`,
        "name": "Healthy Snacking Blog | Grainzz",
        "description": "Read expert articles and tips on healthy snacking, nutrition, grains, and wellness from Grainzz.",
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": siteUrl
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Blog",
              "item": `${siteUrl}/blogs`
            }
          ]
        }
      }
    ]
  };

  return (
    <main className="min-h-screen bg-[#FCF9F2]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Hero Section */}
      <section className="bg-[#1D5E20] py-16 lg:py-24 text-white text-center">
        <div className="max-w-[1440px] mx-auto px-4">
          <h1 className="text-4xl lg:text-6xl font-black mb-4">Our Blog</h1>
          <p className="text-white/80 text-lg lg:text-xl max-w-2xl mx-auto">
            Discover tips, recipes, and insights into healthy living and wholesome grains.
          </p>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 lg:px-[40px] py-16">
        {blogs.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-800">No blog posts yet.</h2>
            <p className="text-gray-500 mt-2">Check back soon for exciting updates!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {blogs.map((blog) => (
              <Link 
                key={blog.id} 
                href={`/blogs/${blog.slug.startsWith('/') ? blog.slug.substring(1) : blog.slug}`}
                className="group flex flex-col bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 h-full"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-gray-50 flex items-center justify-center">
                  {blog.featured_image_url ? (
                    <img 
                      src={blog.featured_image_url} 
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-300">
                      <ChevronRight size={48} className="opacity-20" />
                      <span className="text-xs font-bold uppercase tracking-widest opacity-40">Grainzz Blog</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[12px] font-bold text-[#1D5E20] shadow-sm">
                    {new Date(blog.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                
                <div className="p-6 lg:p-8 flex flex-col flex-1">
                  <h2 className="text-xl lg:text-2xl font-black text-gray-900 mb-3 group-hover:text-[#1D5E20] transition-colors leading-tight">
                    {blog.title}
                  </h2>
                  <p className="text-gray-600 text-sm lg:text-base mb-6 line-clamp-3 leading-relaxed">
                    {blog.excerpt || 'Read the full story to discover more about this exciting topic.'}
                  </p>
                  
                  <div className="mt-auto flex items-center gap-2 text-[#1D5E20] font-bold text-sm lg:text-base">
                    <span>Read Article</span>
                    <div className="w-8 h-8 rounded-full bg-[#1D5E20]/5 flex items-center justify-center group-hover:bg-[#1D5E20] group-hover:text-white transition-all duration-300">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

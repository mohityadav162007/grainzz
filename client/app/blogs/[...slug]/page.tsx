'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBlogBySlug } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Facebook, Twitter, Link as LinkIcon, Loader2 } from 'lucide-react';

export default function BlogDetailPage() {
  const params = useParams();
  const slugArray = params.slug as string[];
  
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slugArray || slugArray.length === 0) return;

    // Join all segments to handle nested paths
    const fullSlug = slugArray.join('/');
    const lastSegment = slugArray[slugArray.length - 1];
    
    const attemptFetch = async () => {
      try {
        // 1. Try exact match (joined)
        let res = await getBlogBySlug(fullSlug);
        
        // 2. Try with leading slash
        if (!res.data) {
          res = await getBlogBySlug('/' + fullSlug);
        }

        // 3. Try stripping "blog/" prefix if it exists
        if (!res.data && fullSlug.startsWith('blog/')) {
          const stripped = fullSlug.replace('blog/', '');
          res = await getBlogBySlug(stripped);
          if (!res.data) res = await getBlogBySlug('/' + stripped);
        }

        // 4. Ultimate Fallback: Try just the last segment of the URL
        // This handles cases where the user navigates to /blogs/blog/slug 
        // but the DB only has "slug" or "/slug".
        if (!res.data && slugArray.length > 1) {
          res = await getBlogBySlug(lastSegment);
          if (!res.data) res = await getBlogBySlug('/' + lastSegment);
        }

        if (!res.data) setError(true);
        else setBlog(res.data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    attemptFetch();
  }, [slugArray]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCF9F2]">
        <Loader2 className="animate-spin text-[#1D5E20]" size={48} />
      </div>
    );
  }

  if (error || !blog) {
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

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(blog.title)}`, '_blank');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

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
      <div className="max-w-[900px] mx-auto px-4">
        <div className="bg-white rounded-[40px] p-8 lg:p-16 shadow-sm border border-gray-100">
          <div 
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
          
          <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="font-bold text-gray-900">Share this:</span>
              <div className="flex gap-3">
                <button 
                  onClick={shareOnFacebook}
                  className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  title="Share on Facebook"
                >
                  <Facebook size={18}/>
                </button>
                <button 
                  onClick={shareOnTwitter}
                  className="w-10 h-10 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all shadow-sm"
                  title="Share on Twitter"
                >
                  <Twitter size={18}/>
                </button>
                <button 
                  onClick={copyToClipboard}
                  className="w-10 h-10 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-gray-600 hover:text-white transition-all shadow-sm"
                  title="Copy Link"
                >
                  <LinkIcon size={18}/>
                </button>
              </div>
            </div>
            
            <Link href="/products" className="text-[#1D5E20] font-black underline underline-offset-8 hover:text-[#164618] transition-colors">
              Explore Our Products
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

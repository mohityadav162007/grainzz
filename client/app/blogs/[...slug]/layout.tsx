// ISR: re-generate at most once every 5 minutes — blog edits appear quickly without hammering the DB
export const revalidate = 300;

import { Metadata } from 'next';
import { getBlogBySlug } from '@/lib/api';
import { constructMetadata, generateBlogSchema, siteConfig } from '@/lib/seo';

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

export async function generateMetadata({ params }: { params: { slug: string[] } }): Promise<Metadata> {
  const blog = await fetchBlogWithFallback(params.slug);

  if (!blog) {
    return constructMetadata({
      title: 'Blog Not Found | Grainzz',
      noIndex: true,
    });
  }

  const keywords = blog.meta_keywords ? blog.meta_keywords.split(',').map((k: string) => k.trim()) : undefined;
  const canonicalPath = blog.canonical_url || `/blogs/${blog.slug}`;
  const title = blog.seo_title || blog.og_title || blog.title;
  
  let description = blog.meta_description || blog.og_description || blog.excerpt || '';
  if (!description && blog.content) {
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

export default async function BlogLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string[] };
}) {
  const blog = await fetchBlogWithFallback(params.slug);
  const currentPath = `/blogs/${params.slug.join('/')}`;
  const canonicalPath = blog?.canonical_url || `/blogs/${blog?.slug}`;

  return (
    <>
      {blog && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              generateBlogSchema(blog, `${siteConfig.url}${canonicalPath.startsWith('/') ? canonicalPath : '/' + canonicalPath}`)
            ),
          }}
        />
      )}
      {children}
    </>
  );
}

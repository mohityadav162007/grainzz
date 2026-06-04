import { MetadataRoute } from 'next';
import { getProducts, getCategories } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.grainzzindia.com';

  const staticPages = [
    '',
    '/products',
    '/combos',
    '/sale',
    '/about',
    '/faqs',
    '/contact',
    '/privacy',
    '/terms',
    '/returns',
    '/shipping',
    '/b2b',
    '/blogs',
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Fetch products
  let productsMap: any[] = [];
  try {
    const res = await getProducts({ limit: '1000' });
    if (res.success && res.data) {
      productsMap = res.data.map((product) => ({
        url: `${siteUrl}/products/${product.slug}`,
        lastModified: new Date(product.updated_at || product.created_at || Date.now()).toISOString(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      }));
    }
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
  }

  // Fetch categories
  let categoriesMap: any[] = [];
  try {
    const res = await getCategories();
    if (res.success && res.data) {
      categoriesMap = res.data.map((cat) => ({
        url: `${siteUrl}/products?category=${cat.slug}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
  }

  // Fetch blogs
  let blogsMap: any[] = [];
  try {
    const { getPublicBlogs } = await import('@/lib/api');
    const res = await getPublicBlogs();
    if (res.success && res.data) {
      blogsMap = res.data.map((blog) => {
        // Handle slug with leading slash
        const cleanSlug = blog.slug.startsWith('/') ? blog.slug.substring(1) : blog.slug;
        return {
          url: `${siteUrl}/blogs/${cleanSlug}`,
          lastModified: new Date(blog.updated_at || blog.created_at || Date.now()).toISOString(),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        };
      });
    }
  } catch (error) {
    console.error('Error fetching blogs for sitemap:', error);
  }

  return [...staticPages, ...productsMap, ...categoriesMap, ...blogsMap];
}

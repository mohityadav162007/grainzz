import { Metadata } from 'next';

export const siteConfig = {
  name: 'Grainzz',
  description: 'GRAINZZ – Healthy Millet Snacks Made with Real Grains.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.grainzzindia.com',
  ogImage: '/og-image.jpg',
  links: {
    instagram: 'https://www.instagram.com/grainzbyvitalicious/',
    facebook: 'https://www.facebook.com/grainzzbyvitalicious',
    amazon: 'https://www.amazon.in/stores/GRAINZZ/page/D592ACFC-CB1C-4ED5-9636-89B17E7C955C',
    blinkit: 'https://blinkit.com/prn/x/prid/766665',
  },
};

/**
 * Helper to generate Next.js Metadata
 */
export function constructMetadata({
  title = siteConfig.name,
  description = siteConfig.description,
  image = siteConfig.ogImage,
  icons = '/favicon-image.png',
  noIndex = false,
  path = '',
  keywords,
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
  path?: string;
  keywords?: string[];
} = {}): Metadata {
  const canonicalUrl = `${siteConfig.url}${path}`;
  
  return {
    title,
    description,
    keywords: keywords || ['healthy snacks', 'grainzz', 'roasted snacks', 'guilt-free snacks', 'indian snacks'],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@grainzz',
    },
    icons,
    metadataBase: new URL(siteConfig.url),
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * Structured Data (JSON-LD) Generators
 */

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/favicon-image.png`,
    sameAs: Object.values(siteConfig.links),
  };
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/products?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

export function generateProductSchema(product: any, url: string, reviews: any[] = [], seedReviews: any[] = []) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.short_description || `Buy ${product.name} at Grainzz`,
    image: product.images?.[0] ? (product.images[0].startsWith('http') ? product.images[0] : `${siteConfig.url}${product.images[0]}`) : siteConfig.ogImage,
    brand: {
      '@type': 'Brand',
      name: siteConfig.name,
    },
    sku: product.sku || product.id,
    offers: {
      '@type': 'Offer',
      url: url,
      priceCurrency: 'INR',
      price: product.price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  const realReviewCount = reviews?.length || 0;
  const seedReviewCount = product?.seed_review_count || 0;
  const totalReviews = realReviewCount + seedReviewCount;

  if (totalReviews > 0) {
    const sumRealRatings = (reviews || []).reduce((acc: number, r: any) => acc + (r.rating || 0), 0);
    const sumSeedRatings = Number(product?.seed_rating || 5) * seedReviewCount;
    const avgRating = (sumRealRatings + sumSeedRatings) / totalReviews;

    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: avgRating.toFixed(1),
      reviewCount: totalReviews,
      bestRating: '5',
      worstRating: '1',
    };

    const combinedReviews = [
      ...(reviews || []).map((r: any) => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: r.reviewer_name || 'Anonymous',
        },
        datePublished: r.created_at,
        reviewBody: r.review_text || '',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: r.rating || 5,
        },
      })),
      ...(seedReviews || []).map((r: any) => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: r.customer_name || 'Anonymous',
        },
        datePublished: r.review_date || new Date().toISOString(),
        reviewBody: r.review_message || '',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: r.rating || 5,
        },
      }))
    ];

    schema.review = combinedReviews.slice(0, 5);
  }

  return schema;
}

export function generateBreadcrumbSchema(items: { name: string; item: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.item}`,
    })),
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateBlogSchema(blog: any, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.seo_title || blog.title,
    description: blog.meta_description || blog.excerpt,
    image: blog.og_image_url || blog.featured_image_url || siteConfig.ogImage,
    datePublished: new Date(blog.created_at).toISOString(),
    dateModified: new Date(blog.updated_at || blog.created_at).toISOString(),
    author: {
      '@type': 'Organization',
      name: siteConfig.name,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/favicon-image.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };
}

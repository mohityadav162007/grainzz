import { Metadata } from 'next';

export const siteConfig = {
  name: 'Grainzz',
  description: 'Grainzz is a healthy Indian snacks brand crafting guilt-free, roasted, grain-based snacks.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.grainzz.com',
  ogImage: '/og-image.jpg',
  links: {
    instagram: 'https://instagram.com/grainzz',
    facebook: 'https://facebook.com/grainzz',
    amazon: 'https://www.amazon.in/stores/GRAINZZ/page/D592ACFC-CB1C-4ED5-9636-89B17E7C955C',
    blinkit: 'https://blinkit.com/dc/?collection_uuid=',
  },
};

/**
 * Helper to generate Next.js Metadata
 */
export function constructMetadata({
  title = siteConfig.name,
  description = siteConfig.description,
  image = siteConfig.ogImage,
  icons = '/image-2@2x.png',
  noIndex = false,
  path = '',
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
  path?: string;
} = {}): Metadata {
  const canonicalUrl = `${siteConfig.url}${path}`;
  
  return {
    title,
    description,
    keywords: ['healthy snacks', 'grainzz', 'roasted snacks', 'guilt-free snacks', 'indian snacks'],
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
    logo: `${siteConfig.url}/image-2@2x.png`,
    sameAs: Object.values(siteConfig.links),
  };
}

export function generateProductSchema(product: any, url: string, reviews?: any[]) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.short_description || `Buy ${product.name} at Grainzz`,
    image: product.images?.[0] ? `${siteConfig.url}${product.images[0]}` : siteConfig.ogImage,
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

  if (reviews && reviews.length > 0) {
    const totalRating = reviews.reduce((acc: number, rev: any) => acc + (rev.rating || 0), 0);
    const avgRating = totalRating / reviews.length;

    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: avgRating.toFixed(1),
      reviewCount: reviews.length,
      bestRating: '5',
      worstRating: '1',
    };

    schema.review = reviews.slice(0, 5).map((rev: any) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: rev.name || 'Anonymous',
      },
      datePublished: rev.created_at,
      reviewBody: rev.text || '',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: rev.rating || 5,
      },
    }));
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

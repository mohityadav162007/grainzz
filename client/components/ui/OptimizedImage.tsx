'use client';

import React, { useState } from 'react';
import NextImage, { ImageProps } from 'next/image';

const imageKitLoader = ({ src, width, quality }: { src: string | any; width: number; quality?: number }) => {
  if (typeof src !== 'string') return src?.src || src;
  if (src.startsWith('data:') || src.startsWith('blob:') || src.startsWith('/')) {
    // If it's a relative path (local asset) or data URI, do not use ImageKit. 
    // Wait, we can use ImageKit for local assets if we sync them, but usually S3 is what we proxy.
    // Let's only use ImageKit for absolute URLs (S3).
    if (src.startsWith('/')) return src; // Next.js default loader will handle local images
    return src;
  }
  
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL;
  if (!urlEndpoint) return src;

  let path = src;
  if (src.includes('amazonaws.com')) {
     const url = new URL(src);
     path = url.pathname;
  } else {
     // We shouldn't reach here if we only apply loader to S3 images, but fallback safely
     const sep = src.includes('?') ? '&' : '?';
     return `${src}${sep}w=${width}`;
  }

  if (path[0] !== '/') path = `/${path}`;

  // Transformations for WebP/AVIF, responsive, quality
  const params = [`w-${width}`, `f-auto`, `pr-true`];
  if (quality) params.push(`q-${quality}`);
  else params.push('q-80'); // Default high quality but compressed

  const tr = params.join(',');
  if (urlEndpoint.endsWith('/')) {
    return `${urlEndpoint}tr:${tr}${path}`;
  }
  return `${urlEndpoint}/tr:${tr}${path}`;
};

export default function OptimizedImage(props: ImageProps) {
  const [error, setError] = useState(false);

  // Only proxy S3 URLs to ImageKit. All other images (local, external avatars) 
  // use standard Next.js image optimization.
  const isS3 = typeof props.src === 'string' && props.src.includes('amazonaws.com');

  if (error || !process.env.NEXT_PUBLIC_IMAGEKIT_URL || !isS3) {
    return <NextImage {...props} />;
  }

  return (
    <NextImage
      loader={imageKitLoader}
      onError={() => setError(true)}
      {...props}
    />
  );
}

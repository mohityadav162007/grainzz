/**
 * Centralized Image Service for Grainzz Application
 * Handles automatic S3 to ImageKit URL conversion with optimal transformations,
 * responsive sizing, format optimization (WebP/AVIF), and graceful fallbacks.
 */

export const DEFAULT_FALLBACK_IMAGE = '/image-2@2x.png';
const DEFAULT_IMAGEKIT_ENDPOINT = 'https://ik.imagekit.io/mohityadav162009';

export interface ImageTransformationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'avif';
  raw?: string;
}

export const ImageService = {
  isS3Url(src: string): boolean {
    if (!src || typeof src !== 'string') return false;
    return src.includes('amazonaws.com');
  },

  isImageKitUrl(src: string): boolean {
    if (!src || typeof src !== 'string') return false;
    return src.includes('ik.imagekit.io');
  },

  getS3Path(s3Url: string): string {
    try {
      const url = new URL(s3Url);
      const pathname = url.pathname;
      return pathname.startsWith('/') ? pathname.slice(1) : pathname;
    } catch {
      return '';
    }
  },

  getImageKitUrl(src: string, options?: ImageTransformationOptions): string {
    if (!src || typeof src !== 'string') {
      return DEFAULT_FALLBACK_IMAGE;
    }

    const endpoint = (process.env.NEXT_PUBLIC_IMAGEKIT_URL || DEFAULT_IMAGEKIT_ENDPOINT).replace(/\/$/, '');

    // 1. If it's an S3 URL, convert to ImageKit URL format
    if (this.isS3Url(src)) {
      const objectPath = this.getS3Path(src);
      if (!objectPath) return src;

      // Build transformation string
      const trParts: string[] = ['f-auto', 'pr-true', 'q-auto', 'dpr-auto'];
      if (options?.width) trParts.push(`w-${options.width}`);
      if (options?.height) trParts.push(`h-${options.height}`);
      if (options?.quality) trParts.push(`q-${options.quality}`);
      if (options?.raw) trParts.push(options.raw);

      const trString = trParts.join(',');
      return `${endpoint}/${objectPath}?tr=${trString}`;
    }

    // 2. If it's already an ImageKit URL, ensure transformation params exist
    if (this.isImageKitUrl(src)) {
      if (!src.includes('tr=')) {
        const separator = src.includes('?') ? '&' : '?';
        return `${src}${separator}tr=f-auto,pr-true,q-auto,dpr-auto`;
      }
      return src;
    }

    // 3. Fallback for local assets or other external URLs
    return src;
  },

  getResponsiveSizes(fill?: boolean, sizes?: string): string | undefined {
    if (fill && !sizes) {
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
    }
    return sizes;
  },

  getFallbackUrl(src: string, hasError: boolean, isS3: boolean, fallbackSrc: string = DEFAULT_FALLBACK_IMAGE): string {
    if (hasError) {
      return isS3 ? src : fallbackSrc;
    }
    return src || fallbackSrc;
  },

  // A standalone loader that can be passed to Next.js Image component
  imageKitLoader(hasError: boolean) {
    return ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
      if (hasError) return src;
      
      if (ImageService.isS3Url(src) || ImageService.isImageKitUrl(src)) {
        return ImageService.getImageKitUrl(src, { width, quality });
      }
      
      // Satisfy Next.js requirement that custom loaders must implement width
      if (src.startsWith('/')) {
        return `${src}?w=${width}&q=${quality || 75}`;
      }
      
      return src;
    };
  },

  shouldBypassNextOptimization(src: string): boolean {
    return this.isS3Url(src) || this.isImageKitUrl(src);
  }
};

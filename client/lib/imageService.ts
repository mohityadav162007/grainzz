/**
 * Centralized Image Service for Grainzz Application
 * Handles automatic S3 to ImageKit URL conversion with optimal transformations,
 * responsive sizing, format optimization (WebP/AVIF), and graceful fallbacks.
 */

const DEFAULT_IMAGEKIT_ENDPOINT = 'https://ik.imagekit.io/mohityadav162009';
export const DEFAULT_FALLBACK_IMAGE = '/image-2@2x.png';

export interface ImageTransformationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'avif';
  raw?: string;
}

/**
 * Checks if a given string is an AWS S3 URL
 */
export function isS3Url(src: string): boolean {
  if (!src || typeof src !== 'string') return false;
  return src.includes('amazonaws.com');
}

/**
 * Checks if a given string is an ImageKit URL
 */
export function isImageKitUrl(src: string): boolean {
  if (!src || typeof src !== 'string') return false;
  return src.includes('ik.imagekit.io');
}

/**
 * Extracts object path from S3 URL
 * e.g. https://grainzz-media-prod.s3.ap-south-1.amazonaws.com/products/1720-file.jpg
 * returns: products/1720-file.jpg
 */
export function getS3Path(s3Url: string): string {
  try {
    const url = new URL(s3Url);
    const pathname = url.pathname;
    return pathname.startsWith('/') ? pathname.slice(1) : pathname;
  } catch {
    return '';
  }
}

/**
 * Converts an S3 URL to a fully transformed ImageKit URL
 */
export function getImageKitUrl(
  src: string,
  options?: ImageTransformationOptions
): string {
  if (!src || typeof src !== 'string') {
    return DEFAULT_FALLBACK_IMAGE;
  }

  const endpoint = (process.env.NEXT_PUBLIC_IMAGEKIT_URL || DEFAULT_IMAGEKIT_ENDPOINT).replace(/\/$/, '');

  // 1. If it's an S3 URL, convert to ImageKit URL format
  if (isS3Url(src)) {
    const objectPath = getS3Path(src);
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
  if (isImageKitUrl(src)) {
    if (!src.includes('tr=')) {
      const separator = src.includes('?') ? '&' : '?';
      return `${src}${separator}tr=f-auto,pr-true,q-auto,dpr-auto`;
    }
    return src;
  }

  // 3. Fallback for local assets or other external URLs
  return src;
}

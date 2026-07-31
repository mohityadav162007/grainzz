'use client';

import React, { useState, useEffect } from 'react';
import NextImage, { ImageProps } from 'next/image';
import { getImageKitUrl, isS3Url, DEFAULT_FALLBACK_IMAGE } from '@/lib/imageService';

export interface AppImageProps extends Omit<ImageProps, 'src'> {
  src: string | any;
  fallbackSrc?: string;
}

export default function AppImage({
  src,
  alt = 'Grainzz Product Image',
  fallbackSrc = DEFAULT_FALLBACK_IMAGE,
  className = '',
  sizes,
  priority = false,
  onError,
  ...restProps
}: AppImageProps) {
  // Determine raw src string
  const rawSrc = typeof src === 'string' ? src : (src?.src || '');
  const [currentSrc, setCurrentSrc] = useState<string>(() => {
    if (!rawSrc) return fallbackSrc;
    if (isS3Url(rawSrc)) return getImageKitUrl(rawSrc);
    return rawSrc;
  });

  const [hasError, setHasError] = useState(false);

  // Update src if prop changes
  useEffect(() => {
    if (!rawSrc) {
      setCurrentSrc(fallbackSrc);
      return;
    }
    if (isS3Url(rawSrc)) {
      setCurrentSrc(getImageKitUrl(rawSrc));
    } else {
      setCurrentSrc(rawSrc);
    }
    setHasError(false);
  }, [rawSrc, fallbackSrc]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      setHasError(true);
      // If primary ImageKit URL failed and original was S3, fall back to raw S3 URL
      if (isS3Url(rawSrc) && currentSrc !== rawSrc) {
        setCurrentSrc(rawSrc);
      } else {
        // Otherwise fall back to local placeholder
        setCurrentSrc(fallbackSrc);
      }
    }
    if (onError) {
      onError(e);
    }
  };

  // Set default sizes if fill is used and sizes is missing to optimize performance
  const responsiveSizes = restProps.fill && !sizes
    ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
    : sizes;

  return (
    <NextImage
      {...restProps}
      src={currentSrc}
      alt={alt}
      sizes={responsiveSizes}
      priority={priority}
      onError={handleError}
      className={className}
    />
  );
}

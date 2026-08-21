'use client';

import React, { useState } from 'react';
import NextImage, { ImageProps } from 'next/image';
import { ImageService, DEFAULT_FALLBACK_IMAGE } from '@/lib/imageService';

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
  const rawSrc = typeof src === 'string' ? src : (src?.src || '');
  const [hasError, setHasError] = useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [rawSrc]);

  const isS3 = ImageService.isS3Url(rawSrc);
  let currentSrc = ImageService.getFallbackUrl(rawSrc, hasError, isS3, fallbackSrc);
  const responsiveSizes = ImageService.getResponsiveSizes(restProps.fill, sizes);
  const shouldBypass = ImageService.shouldBypassNextOptimization(rawSrc);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) setHasError(true);
    if (onError) onError(e);
  };

  const loader = shouldBypass ? ImageService.imageKitLoader(hasError) : undefined;

  return (
    <NextImage
      {...restProps}
      src={currentSrc}
      alt={alt}
      sizes={responsiveSizes}
      priority={priority}
      onError={handleError}
      className={className}
      loader={loader}
      unoptimized={hasError || (!shouldBypass && rawSrc.endsWith('.svg'))}
    />
  );
}

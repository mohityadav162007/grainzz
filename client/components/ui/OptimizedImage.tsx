'use client';

import React, { useState } from 'react';
import NextImage, { ImageProps } from 'next/image';
import { Image as IKImage } from '@imagekit/next';

export default function OptimizedImage(props: ImageProps) {
  const [error, setError] = useState(false);
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL;

  // Only proxy S3 URLs to ImageKit.
  const isS3 = typeof props.src === 'string' && props.src.includes('amazonaws.com');

  if (error || !urlEndpoint || !isS3) {
    return <NextImage {...props} onError={() => setError(true)} />;
  }

  // Extract path from S3 URL
  let path = props.src as string;
  try {
    const url = new URL(path);
    path = url.pathname;
  } catch (e) {
    // ignore
  }

  return (
    <IKImage
      {...props}
      src={path}
      urlEndpoint={urlEndpoint}
      onError={() => setError(true)}
      transformation={[
        {
          // We can use the raw parameter to ensure ImageKit best practices are applied
          // if they are not already default in the dashboard
          raw: "f-auto,pr-true,q-auto,dpr-auto"
        }
      ]}
    />
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

const BUCKET = process.env.APP_AWS_S3_BUCKET_NAME || '';
const REGION = process.env.APP_AWS_S3_REGION || 'ap-south-1';

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY || '',
  },
});

/**
 * Extract the S3 object key from a full S3 URL.
 * Handles both path-style and virtual-hosted-style URLs.
 */
function extractKeyFromUrl(urlOrKey: string): string {
  // If it's already a key (no http), return as-is
  if (!urlOrKey.startsWith('http')) {
    return urlOrKey;
  }

  try {
    const url = new URL(urlOrKey);
    // Virtual-hosted style: https://bucket.s3.region.amazonaws.com/key
    // Path style: https://s3.region.amazonaws.com/bucket/key
    const pathname = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;

    // If using path style, the first segment is the bucket name
    if (url.hostname.startsWith('s3.') || url.hostname.startsWith('s3-')) {
      const parts = pathname.split('/');
      // Remove bucket name from path
      return parts.slice(1).join('/');
    }

    // Virtual-hosted style — pathname IS the key
    return pathname;
  } catch {
    return urlOrKey;
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!BUCKET || !process.env.APP_AWS_ACCESS_KEY_ID || !process.env.APP_AWS_SECRET_ACCESS_KEY) {
      return NextResponse.json(
        { error: 'AWS S3 is not configured.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { urlOrKey } = body;

    if (!urlOrKey) {
      return NextResponse.json(
        { error: 'urlOrKey is required' },
        { status: 400 }
      );
    }

    const key = extractKeyFromUrl(urlOrKey);

    const command = new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });

    await s3.send(command);

    return NextResponse.json({ success: true, deletedKey: key });
  } catch (error: any) {
    console.error('[S3 Delete API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete object from S3' },
      { status: 500 }
    );
  }
}

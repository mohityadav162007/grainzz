import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
 * Generate a unique filename to prevent collisions.
 */
function generateKey(folder: string, originalName: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 10);
  // Sanitize filename: replace spaces, special chars
  const sanitized = originalName
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-');
  return `${folder}/${timestamp}-${randomStr}-${sanitized}`;
}

export async function POST(req: NextRequest) {
  try {
    if (!BUCKET || !process.env.APP_AWS_ACCESS_KEY_ID || !process.env.APP_AWS_SECRET_ACCESS_KEY) {
      return NextResponse.json(
        { error: 'AWS S3 is not configured. Please set APP_AWS_S3_BUCKET_NAME, APP_AWS_ACCESS_KEY_ID, and APP_AWS_SECRET_ACCESS_KEY.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { fileName, fileType, folder = 'misc' } = body;

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'fileName and fileType are required' },
        { status: 400 }
      );
    }

    const key = generateKey(folder, fileName);

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: fileType,
    });

    // Generate pre-signed URL valid for 5 minutes
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    // Construct the public URL
    const publicUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;

    return NextResponse.json({ uploadUrl, publicUrl, key });
  } catch (error: any) {
    console.error('[S3 Upload API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}

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

function generateKey(folder: string, originalName: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 10);
  const sanitized = originalName
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-');
  return `${folder}/${timestamp}-${randomStr}-${sanitized}`;
}

// Only allow uploads to the 'reviews' folder from the client site
const ALLOWED_FOLDERS = ['reviews'];

export async function POST(req: NextRequest) {
  try {
    if (!BUCKET || !process.env.APP_AWS_ACCESS_KEY_ID || !process.env.APP_AWS_SECRET_ACCESS_KEY) {
      return NextResponse.json(
        { error: 'AWS S3 is not configured.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { fileName, fileType, folder = 'reviews' } = body;

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'fileName and fileType are required' },
        { status: 400 }
      );
    }

    // Security: only allow specific folders from the client-facing site
    if (!ALLOWED_FOLDERS.includes(folder)) {
      return NextResponse.json(
        { error: 'Upload to this folder is not permitted' },
        { status: 403 }
      );
    }

    const key = generateKey(folder, fileName);

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    const publicUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;

    return NextResponse.json({ uploadUrl, publicUrl, key });
  } catch (error: any) {
    console.error('[S3 Upload API - Client] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}

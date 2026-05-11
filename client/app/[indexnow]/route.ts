import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { indexnow: string } }
) {
  const key = process.env.INDEXNOW_KEY;
  
  if (!key) {
    return new NextResponse('IndexNow key not configured', { status: 404 });
  }

  // Check if the requested file matches {key}.txt
  if (params.indexnow === `${key}.txt`) {
    return new NextResponse(key, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }

  return new NextResponse('Not found', { status: 404 });
}

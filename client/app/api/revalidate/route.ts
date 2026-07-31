import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  try {
    const { paths, tags, token } = await request.json();

    const secureToken = process.env.REVALIDATION_TOKEN || 'GrainzzRevalidationToken2026';

    if (token !== secureToken) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401, headers: CORS_HEADERS });
    }

    const revalidatedPaths: string[] = [];
    const revalidatedTags: string[] = [];

    if (paths && Array.isArray(paths)) {
      for (const path of paths) {
        try {
          revalidatePath(path, 'page');
          revalidatePath(path, 'layout');
          revalidatedPaths.push(path);
        } catch (e) {
          console.error(`Error revalidating path ${path}:`, e);
        }
      }
    }

    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        try {
          revalidateTag(tag);
          revalidatedTags.push(tag);
        } catch (e) {
          console.error(`Error revalidating tag ${tag}:`, e);
        }
      }
    } else {
      // Default tag invalidation for product changes
      try {
        revalidateTag('products');
        revalidatedTags.push('products');
      } catch (e) {
        // ignore
      }
    }

    console.log(`[Revalidation] Purged paths: ${revalidatedPaths.join(', ')} | tags: ${revalidatedTags.join(', ')}`);

    return NextResponse.json({
      revalidated: true,
      paths: revalidatedPaths,
      tags: revalidatedTags,
      now: Date.now(),
    }, { headers: CORS_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}

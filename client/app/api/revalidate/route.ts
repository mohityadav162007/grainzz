import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const { paths, token } = await request.json();

    const secureToken = process.env.REVALIDATION_TOKEN || 'GrainzzRevalidationToken2026';

    if (token !== secureToken) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    if (!paths || !Array.isArray(paths)) {
      return NextResponse.json({ message: 'paths must be an array of strings' }, { status: 400 });
    }

    for (const path of paths) {
      revalidatePath(path);
    }

    return NextResponse.json({ revalidated: true, paths, now: Date.now() });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

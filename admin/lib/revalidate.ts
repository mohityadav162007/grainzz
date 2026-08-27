export async function revalidateClientPaths(paths: string[]) {
  // Determine target client site URL
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        siteUrl = 'http://localhost:3000';
      } else {
        siteUrl = 'https://www.grainzzindia.com';
      }
    } else {
      // In server-side Node.js context, check environment
      if (process.env.NODE_ENV !== 'production') {
        siteUrl = 'http://localhost:3000';
      } else {
        siteUrl = 'https://www.grainzzindia.com';
      }
    }
  }

  // Remove trailing slash if present
  siteUrl = siteUrl.replace(/\/$/, '');

  const token = process.env.NEXT_PUBLIC_REVALIDATION_TOKEN || 'GrainzzRevalidationToken2026';

  try {
    const response = await fetch(`${siteUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paths,
        token,
        tags: ['products', 'homepage', 'categories'],
      }),
    });

    if (!response.ok) {
      console.error(`Revalidation request failed: ${response.status} ${response.statusText}`);
    } else {
      const data = await response.json();
      console.log('Successfully revalidated paths on client:', data.paths);
    }
  } catch (error) {
    console.error('Error triggering client revalidation:', error);
  }
}

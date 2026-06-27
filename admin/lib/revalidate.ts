export async function revalidateClientPaths(paths: string[]) {
  // Try to use NEXT_PUBLIC_SITE_URL, or determine based on hostname
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    if (typeof window !== 'undefined') {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        siteUrl = 'http://localhost:3000';
      } else {
        siteUrl = 'https://www.grainzz.com';
      }
    } else {
      siteUrl = 'https://www.grainzz.com';
    }
  }

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
      }),
    });

    if (!response.ok) {
      console.error(`Revalidation request failed: ${response.statusText}`);
    } else {
      const data = await response.json();
      console.log('Successfully revalidated paths on client:', data.paths);
    }
  } catch (error) {
    console.error('Error triggering revalidation:', error);
  }
}

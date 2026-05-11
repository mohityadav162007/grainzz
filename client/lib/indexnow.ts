export async function submitToIndexNow(urls: string[]) {
  const host = process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || 'www.grainzz.com';
  const key = process.env.INDEXNOW_KEY;

  if (!key) {
    console.warn('IndexNow key not configured. Skipping submission.');
    return;
  }

  const keyLocation = process.env.INDEXNOW_KEY_LOCATION || `https://${host}/${key}.txt`;

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host,
        key,
        keyLocation,
        urlList: urls,
      }),
    });

    if (!response.ok) {
      console.error(`IndexNow submission failed: ${response.statusText}`);
    } else {
      console.log(`Successfully submitted ${urls.length} URLs to IndexNow`);
    }
  } catch (error) {
    console.error('Error submitting to IndexNow:', error);
  }
}

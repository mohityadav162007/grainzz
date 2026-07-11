/**
 * Client-side S3 Image Upload Module
 * ====================================
 * Used for customer-facing uploads (e.g., review images).
 * Uses a Next.js API route for pre-signed URL generation.
 */

/**
 * Upload a review image to S3 via the API route.
 * @param file - The image file to upload
 * @returns The public URL of the uploaded image
 */
export const uploadReviewImage = async (file: File): Promise<string> => {
  // Step 1: Get a pre-signed upload URL from our API
  const presignRes = await fetch('/api/s3/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      folder: 'reviews',
    }),
  });

  if (!presignRes.ok) {
    const errData = await presignRes.json().catch(() => ({}));
    throw new Error(errData?.error || 'Failed to get upload URL');
  }

  const { uploadUrl, publicUrl } = await presignRes.json();

  // Step 2: Upload the file directly to S3
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error('Failed to upload image');
  }

  return publicUrl;
};

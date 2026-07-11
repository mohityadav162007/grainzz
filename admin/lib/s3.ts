/**
 * AWS S3 Image Upload & Management Module
 * =========================================
 * Replaces Cloudinary with Amazon S3 for all image storage operations.
 * Uses unsigned (pre-signed) uploads via a Next.js API route for security.
 *
 * Environment variables required:
 *   APP_AWS_S3_BUCKET_NAME       — The S3 bucket name
 *   APP_AWS_S3_REGION            — The AWS region (e.g. ap-south-1)
 *   APP_AWS_ACCESS_KEY_ID        — IAM user access key
 *   APP_AWS_SECRET_ACCESS_KEY    — IAM user secret key
 */

// ─── S3 Folder Constants ─────────────────────────────────────────────────────

export const S3_FOLDERS = {
  PRODUCTS: 'products',
  BLOGS: 'blogs',
  CATEGORIES: 'categories',
  HOMEPAGE: 'homepage',
  HERO: 'homepage/hero',
  INSTAGRAM: 'instagram',
  TESTIMONIALS: 'testimonials',
  LOGOS: 'logos',
  ICONS: 'icons',
  POWERED_BY: 'homepage/powered-by',
  SNACK_BOX: 'homepage/snack-box',
  B2B: 'b2b',
  REVIEWS: 'reviews',
  MISC: 'misc',
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────

interface UploadResponse {
  url: string;
  key: string;
}

// ─── Core Upload Function ────────────────────────────────────────────────────

/**
 * Upload a file to S3 via the /api/s3/upload endpoint.
 * The API route handles pre-signed URL generation and returns the public URL.
 *
 * @param file   - The File object to upload
 * @param folder - The S3 folder/prefix to organize the file under
 * @returns      - The public URL of the uploaded file
 */
export const uploadToS3 = async (
  file: File,
  folder: string = S3_FOLDERS.MISC
): Promise<string> => {
  // Step 1: Get a pre-signed upload URL from our API
  const presignRes = await fetch('/api/s3/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      folder,
    }),
  });

  if (!presignRes.ok) {
    const errData = await presignRes.json().catch(() => ({}));
    throw new Error(errData?.error || 'Failed to get upload URL from S3');
  }

  const { uploadUrl, publicUrl, key } = await presignRes.json();

  // Step 2: Upload the file directly to S3 using the pre-signed URL
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error(`S3 upload failed (HTTP ${uploadRes.status})`);
  }

  return publicUrl;
};

// ─── Delete Function ─────────────────────────────────────────────────────────

/**
 * Delete an object from S3 by its public URL or key.
 *
 * @param urlOrKey - The full S3 URL or the object key
 */
export const deleteFromS3 = async (urlOrKey: string): Promise<void> => {
  const res = await fetch('/api/s3/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urlOrKey }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error || 'Failed to delete image from S3');
  }
};

// ─── Convenience Upload Functions ────────────────────────────────────────────
// These mirror the old Cloudinary helper signatures for easy migration.

export const uploadProductImage = async (file: File): Promise<string> => {
  return uploadToS3(file, S3_FOLDERS.PRODUCTS);
};

export const uploadHeroImage = async (file: File): Promise<string> => {
  return uploadToS3(file, S3_FOLDERS.HERO);
};

export const uploadInstagramImage = async (file: File): Promise<string> => {
  return uploadToS3(file, S3_FOLDERS.INSTAGRAM);
};

export const uploadBlogImage = async (file: File): Promise<string> => {
  return uploadToS3(file, S3_FOLDERS.BLOGS);
};

export const uploadPoweredByImage = async (file: File): Promise<string> => {
  return uploadToS3(file, S3_FOLDERS.POWERED_BY);
};

export const uploadSnackBoxImage = async (file: File): Promise<string> => {
  return uploadToS3(file, S3_FOLDERS.SNACK_BOX);
};

export const uploadB2BImage = async (file: File): Promise<string> => {
  return uploadToS3(file, S3_FOLDERS.B2B);
};

export const uploadReviewImage = async (file: File): Promise<string> => {
  return uploadToS3(file, S3_FOLDERS.REVIEWS);
};

export const uploadCategoryImage = async (file: File): Promise<string> => {
  return uploadToS3(file, S3_FOLDERS.CATEGORIES);
};

export const uploadTestimonialImage = async (file: File): Promise<string> => {
  return uploadToS3(file, S3_FOLDERS.TESTIMONIALS);
};

export const uploadLogoImage = async (file: File): Promise<string> => {
  return uploadToS3(file, S3_FOLDERS.LOGOS);
};

export const uploadIconImage = async (file: File): Promise<string> => {
  return uploadToS3(file, S3_FOLDERS.ICONS);
};

export const uploadMiscImage = async (file: File): Promise<string> => {
  return uploadToS3(file, S3_FOLDERS.MISC);
};

// ─── Replace Function ────────────────────────────────────────────────────────

/**
 * Replace an existing image: upload the new one, then delete the old one.
 * If deletion of the old image fails, the new URL is still returned (non-blocking).
 *
 * @param newFile   - The new File to upload
 * @param oldUrl    - The URL of the old image to delete
 * @param folder    - The S3 folder for the new image
 * @returns         - The public URL of the newly uploaded image
 */
export const replaceImage = async (
  newFile: File,
  oldUrl: string,
  folder: string = S3_FOLDERS.MISC
): Promise<string> => {
  // Upload the new image first
  const newUrl = await uploadToS3(newFile, folder);

  // Delete old image (non-blocking — don't fail if old deletion fails)
  if (oldUrl && !oldUrl.includes('placeholder')) {
    try {
      await deleteFromS3(oldUrl);
    } catch (err) {
      console.warn('[S3] Failed to delete old image (non-fatal):', oldUrl, err);
    }
  }

  return newUrl;
};

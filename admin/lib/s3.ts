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

const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve) => {
    // Only attempt compression in browser environments
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return resolve(file);
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      
      const MAX_WIDTH = 1920;
      const MAX_HEIGHT = 1920;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(file);

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);
          const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
          const newFile = new File([blob], newFileName, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(newFile);
        },
        'image/jpeg',
        0.85
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Fallback: If image fails to load (e.g. native HEIC not supported in this browser without conversion)
      // just return the original file, but normalize its type if empty.
      if (!file.type) {
        const fallbackFile = new File([file], file.name, { type: 'application/octet-stream' });
        resolve(fallbackFile);
      } else {
        resolve(file);
      }
    };

    img.src = objectUrl;
  });
};

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
  let finalFile = file;

  // Attempt client-side compression/normalization for large images or missing MIME types
  try {
    const isImage = file.type.startsWith('image/') || !file.type || file.name.match(/\.(jpg|jpeg|png|webp|heic)$/i);
    const isLarge = file.size > 2 * 1024 * 1024; // > 2MB
    
    if (isImage && (isLarge || !file.type || file.type.includes('heic'))) {
      finalFile = await compressImage(file);
    }
  } catch (err) {
    console.warn('[S3] Image compression skipped', err);
  }

  // Ensure fileType is never empty (fixes AWS Signature mismatch if browser omits it)
  const fileType = finalFile.type || 'application/octet-stream';

  // Step 1: Get a pre-signed upload URL from our API
  let presignRes;
  try {
    presignRes = await fetch('/api/s3/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: finalFile.name,
        fileType: fileType,
        folder,
      }),
    });
  } catch (err: any) {
    throw new Error(`[Network Error] Could not connect to API to request upload URL: ${err.message}`);
  }

  if (!presignRes.ok) {
    const errData = await presignRes.json().catch(() => ({}));
    throw new Error(`[API Error] Failed to generate upload URL: ${errData?.error || presignRes.statusText}`);
  }

  const { uploadUrl, publicUrl, key } = await presignRes.json();

  // Step 2: Upload the file directly to S3 using the pre-signed URL
  let uploadRes;
  try {
    uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': fileType,
      },
      body: finalFile,
    });
  } catch (err: any) {
    // This catches browser network errors like CORS preflight failure or cellular timeout
    if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
      throw new Error(`[Upload Error] Network/CORS failure while uploading to S3. This might be due to a poor connection or unsupported file type.`);
    }
    throw new Error(`[Upload Error] ${err.message}`);
  }

  if (!uploadRes.ok) {
    throw new Error(`[S3 Error] Upload rejected by S3 (HTTP ${uploadRes.status}: ${uploadRes.statusText})`);
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

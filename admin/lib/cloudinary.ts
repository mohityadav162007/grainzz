const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

/**
 * Upload an image file to Cloudinary.
 * Returns the secure URL of the uploaded image.
 */
export const uploadToCloudinary = async (
  file: File,
  folder: string = 'grainzz'
): Promise<string> => {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary credentials are not configured');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Cloudinary upload failed');
  }

  const data = await response.json();
  return data.secure_url;
};

/**
 * Upload a hero banner image to Cloudinary.
 */
export const uploadHeroImageCloudinary = async (file: File): Promise<string> => {
  return uploadToCloudinary(file, 'grainzz/hero');
};

/**
 * Upload an Instagram cover image to Cloudinary.
 */
export const uploadInstagramImageCloudinary = async (file: File): Promise<string> => {
  return uploadToCloudinary(file, 'grainzz/instagram');
};

/**
 * Upload a product image to Cloudinary.
 */
export const uploadProductImageCloudinary = async (file: File): Promise<string> => {
  return uploadToCloudinary(file, 'grainzz/products');
};

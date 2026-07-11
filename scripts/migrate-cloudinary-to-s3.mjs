import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load admin .env.local file to get variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../admin/.env.local') });

// Setup Supabase and S3 clients
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET = process.env.APP_AWS_S3_BUCKET_NAME;
const REGION = process.env.APP_AWS_S3_REGION || 'ap-south-1';
const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Uploads an image Buffer to S3 and returns the new public URL
 */
async function uploadToS3(buffer, contentType, folder, originalFilename) {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 10);
  const sanitized = originalFilename.toLowerCase().replace(/[^a-z0-9._-]/g, '-');
  const key = `${folder}/${timestamp}-${randomStr}-${sanitized}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
    Body: buffer,
  });

  await s3.send(command);
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
}

/**
 * Downloads a Cloudinary image to a buffer
 */
async function downloadImage(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = response.headers.get('content-type') || 'image/jpeg';
  return { buffer, contentType };
}

/**
 * Migrates a single Cloudinary URL to S3
 */
async function migrateUrl(url, folder) {
  if (!url || !url.includes('res.cloudinary.com')) return url; // Skip if empty or already S3

  try {
    console.log(`[Downloading] ${url}`);
    const { buffer, contentType } = await downloadImage(url);
    
    // Extract filename from URL (e.g. "image.jpg")
    const parts = url.split('/');
    const filename = parts[parts.length - 1];

    console.log(`[Uploading to S3] ${folder}/${filename}`);
    const newUrl = await uploadToS3(buffer, contentType, folder, filename);
    
    console.log(`[Success] Migrated -> ${newUrl}`);
    return newUrl;
  } catch (error) {
    console.error(`[Error] Failed to migrate ${url}:`, error.message);
    return url; // Return original on failure
  }
}

async function migrateProducts() {
  console.log('--- Migrating Products ---');
  const { data: products, error } = await supabase.from('products').select('*');
  if (error) throw error;

  for (const product of products) {
    let updated = false;
    const newImages = [];

    // Products store images as a JSON string array or raw array
    let images = [];
    if (typeof product.images === 'string') {
        try { images = JSON.parse(product.images); } catch(e) {}
    } else if (Array.isArray(product.images)) {
        images = product.images;
    }

    for (const url of images) {
      if (url.includes('res.cloudinary.com')) {
        const newUrl = await migrateUrl(url, 'products');
        newImages.push(newUrl);
        updated = true;
      } else {
        newImages.push(url);
      }
    }

    if (updated) {
      await supabase.from('products').update({ images: JSON.stringify(newImages) }).eq('id', product.id);
      console.log(`Updated product ID: ${product.id}`);
    }
  }
}

async function migrateCategories() {
  console.log('--- Migrating Categories ---');
  const { data: cats, error } = await supabase.from('categories').select('*');
  if (error) throw error;

  for (const cat of cats) {
    if (cat.image_url && cat.image_url.includes('res.cloudinary.com')) {
      const newUrl = await migrateUrl(cat.image_url, 'categories');
      await supabase.from('categories').update({ image_url: newUrl }).eq('id', cat.id);
      console.log(`Updated category ID: ${cat.id}`);
    }
  }
}

async function run() {
  if (!process.env.APP_AWS_S3_BUCKET_NAME || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error("Missing environment variables. Make sure your admin/.env.local file is configured.");
    process.exit(1);
  }

  console.log("Starting Cloudinary -> S3 Image Migration...");
  
  try {
    await migrateCategories();
    await migrateProducts();
    
    // Note: You can expand this script to migrate blogs, hero_slides, and site_content if needed.
    // by following the same pattern above.
    
    console.log("Migration Complete!");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

run();

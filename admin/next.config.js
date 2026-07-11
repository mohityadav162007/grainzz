/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.s3.*.amazonaws.com' },
      { protocol: 'https', hostname: '*.s3.amazonaws.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' }, // Keep for existing images during migration
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
};

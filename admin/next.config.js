/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'grainzz-media-prod.s3.ap-south-1.amazonaws.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
};

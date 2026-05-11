import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Grainzz',
    short_name: 'Grainzz',
    description: 'Grainzz is a healthy Indian snacks brand crafting guilt-free, roasted, grain-based snacks.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1D5E20',
    icons: [
      {
        src: '/image-2@2x.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/image-2@2x.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}

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
        src: '/favicon-image.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };
}

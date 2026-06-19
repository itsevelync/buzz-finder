import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BuzzFinder',
    short_name: 'BuzzFinder',
    description: 'Reconnecting people with lost items.',
    start_url: '/map',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#262626',
    orientation: 'portrait',
    // icons: [
    //   {
    //     src: '/icon-192x192.png',
    //     sizes: '192x192',
    //     type: 'image/png',
    //   },
    //   {
    //     src: '/icon-512x512.png',
    //     sizes: '512x512',
    //     type: 'image/png',
    //   },
    // ],
  }
}
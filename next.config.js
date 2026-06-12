/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Cache all images in the icons directory for 1 year
        source: '/icons/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
      {
        // Cache the master sprite sheet
        source: '/icons_sprite.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
      {
        // Cache the massive 10MB opencv.js file for 1 year
        source: '/opencv.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
      {
        // Cache JSON files (like manifest and database) for 1 hour, allowing stale while revalidating
        source: '/:path*.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          }
        ],
      }
    ];
  },
};

module.exports = nextConfig;

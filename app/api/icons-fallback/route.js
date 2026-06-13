import { NextResponse } from 'next/server';

// 1x1 transparent PNG image (base64 encoded)
const transparentPixel = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

export async function GET() {
  // Return a 1x1 transparent pixel with ultra-aggressive edge caching.
  // This intercepts old rogue browsers requesting missing icons,
  // preventing massive 404 errors and caching the "missing" state at the Vercel Edge for 1 year.
  return new NextResponse(transparentPixel, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, s-maxage=31536000, immutable',
    },
  });
}

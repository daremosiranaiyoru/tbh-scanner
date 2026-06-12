import { NextResponse } from 'next/server';

export async function GET() {
  // Return a dummy 200 OK response to silently absorb requests from old client sessions
  // This prevents Vercel from logging 404s and wasting compute on the not-found fallback page.
  // Old client browsers that haven't refreshed are still running a while(isMounted) fetch loop to this endpoint.
  return NextResponse.json({ status: 'ok', message: 'Endpoint retired, please refresh your browser' }, {
    status: 200,
    headers: {
      'Cache-Control': 'public, s-maxage=31536000'
    }
  });
}

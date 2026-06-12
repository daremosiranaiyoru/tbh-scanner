import { NextResponse } from 'next/server';

export async function GET() {
  // Return a dummy 200 OK response to silently absorb requests from external cron services
  // This prevents Vercel from logging 404s and wasting compute on the not-found fallback page.
  return NextResponse.json({ status: 'ok', message: 'Cron endpoint retired' }, { status: 200 });
}

import { NextResponse } from 'next/server';

export function GET(request) {
    const country = request.headers.get('x-vercel-ip-country') || 'Unknown';
    return NextResponse.json({ country });
}

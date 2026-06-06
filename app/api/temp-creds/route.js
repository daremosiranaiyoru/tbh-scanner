import { NextResponse } from 'next/server'; export async function GET() { return NextResponse.json({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN }); }

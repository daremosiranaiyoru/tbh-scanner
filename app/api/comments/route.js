import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// Local Fallback Cache for development
let localComments = [
  { id: 1, text: "Welcome to the anonymous comment section! / 匿名コメント欄へようこそ！", timestamp: Date.now() }
];

export async function GET() {
  if (process.env.KV_REST_API_URL) {
    try {
      const comments = await kv.lrange('tbh_comments', 0, 499) || [];
      return NextResponse.json(comments);
    } catch (e) {
      console.error("KV Error (Comments GET):", e);
    }
  }
  
  // Fallback
  return NextResponse.json(localComments);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const text = body.text?.trim();

    if (!text || text.length === 0) {
      return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 });
    }
    if (text.length > 100) {
      return NextResponse.json({ error: 'Comment too long (max 100 characters)' }, { status: 400 });
    }

    const newComment = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      text: text,
      timestamp: Date.now()
    };

    if (process.env.KV_REST_API_URL) {
      // Add to the front of the list
      await kv.lpush('tbh_comments', newComment);
      // Keep only the latest 500 comments
      await kv.ltrim('tbh_comments', 0, 499);
      
      return NextResponse.json(newComment);
    } else {
      // Local fallback
      localComments.unshift(newComment);
      if (localComments.length > 500) localComments = localComments.slice(0, 500);
      return NextResponse.json(newComment);
    }

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

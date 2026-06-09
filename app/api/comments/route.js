import { NextResponse } from 'next/server';

// Local Fallback Cache for development
let localComments = [
  { id: 1, text: "Welcome to the anonymous comment section! / 匿名コメント欄へようこそ！", timestamp: Date.now() }
];

export async function GET() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (url && token) {
    try {
      // LRANGE tbh_comments 0 499
      const res = await fetch(`${url}/lrange/tbh_comments/0/499`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      });
      const data = await res.json();
      if (data.result) {
        // Upstash returns strings for JSON objects stored in lists if added via REST, or objects. 
        // We ensure they are parsed properly.
        const comments = data.result.map(item => typeof item === 'string' ? JSON.parse(item) : item);
        return NextResponse.json(comments);
      }
    } catch (e) {
      console.error("Upstash Error (Comments GET):", e);
    }
  }
  
  // Fallback
  return NextResponse.json(localComments);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const text = body.text?.trim();

    const adminSecret = body.adminSecret;

    if (!text || text.length === 0) {
      return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 });
    }
    if (text.length > 100) {
      return NextResponse.json({ error: 'Comment too long (max 100 characters)' }, { status: 400 });
    }

    const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin_password_123';
    const isAdmin = adminSecret === ADMIN_SECRET;

    const newComment = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      text: text,
      timestamp: Date.now(),
      ...(isAdmin && { isAdmin: true })
    };

    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

    if (url && token) {
      // LPUSH tbh_comments newComment
      await fetch(`${url}/lpush/tbh_comments`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newComment)
      });
      
      // LTRIM tbh_comments 0 499 (Keep only latest 500)
      await fetch(`${url}/ltrim/tbh_comments/0/499`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const secret = searchParams.get('secret');

    const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin_password_123';

    if (secret !== ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing comment ID' }, { status: 400 });
    }

    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

    if (url && token) {
      // Fetch the list to find the exact string to remove
      const res = await fetch(`${url}/lrange/tbh_comments/0/499`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      });
      const data = await res.json();
      
      if (data.result) {
        // Find the exact JSON string
        const targetStr = data.result.find(item => {
          try {
            const parsed = typeof item === 'string' ? JSON.parse(item) : item;
            return parsed.id === id;
          } catch(e) { return false; }
        });

        if (targetStr) {
          // LREM tbh_comments 0 <targetStr> (0 means remove all occurrences)
          const lremRes = await fetch(url, {
            method: 'POST',
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(["LREM", "tbh_comments", 0, typeof targetStr === 'object' ? JSON.stringify(targetStr) : targetStr])
          });
          const lremData = await lremRes.json();
          return NextResponse.json({ success: true, removed: lremData.result });
        }
      }
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    } else {
      // Local fallback
      localComments = localComments.filter(c => c.id !== id);
      return NextResponse.json({ success: true });
    }

  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

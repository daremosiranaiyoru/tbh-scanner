import { NextResponse } from 'next/server';

// Local Fallback Cache for development
let localComments = [
  { id: 1, text: "Welcome to the anonymous comment section! / 匿名コメント欄へようこそ！", timestamp: Date.now() }
];

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = null; // Temporarily disabled to let Upstash recover
  const token = null;

  if (url && token) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      // LRANGE tbh_comments 0 499
      const res = await fetch(`${url}/lrange/tbh_comments/0/499`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
        signal: controller.signal
      });
      const data = await res.json();
      
      if (data.result) {
        // Upstash returns strings for JSON objects stored in lists if added via REST, or objects. 
        const comments = data.result.map(item => typeof item === 'string' ? JSON.parse(item) : item);
        return NextResponse.json(comments);
      } else {
        console.error("Upstash Error (Comments GET data missing):", data);
        return NextResponse.json([]);
      }
    } catch (e) {
      console.error("Upstash Error (Comments GET):", e);
      return NextResponse.json([]);
    }
  }
  
  // Fallback for local development
  return NextResponse.json(localComments);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const text = body.text?.trim();

    const adminSecret = body.adminSecret;
    const parentId = body.parentId; // Optional ID of comment being replied to

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
      ...(isAdmin && { isAdmin: true }),
      ...(parentId && { parentId: parentId })
    };

    const url = null; // Temporarily disabled
    const token = null;

    if (url && token) {
      if (parentId) {
        // Fetch current list to insert reply below parent
        const getRes = await fetch(`${url}/lrange/tbh_comments/0/499`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store'
        });
        const getData = await getRes.json();
        let commentsList = [];
        if (getData.result) {
          commentsList = getData.result.map(item => typeof item === 'string' ? JSON.parse(item) : item);
        }
        
        const parentIdx = commentsList.findIndex(c => c.id === parentId);
        if (parentIdx !== -1) {
          // Insert immediately after parent
          commentsList.splice(parentIdx + 1, 0, newComment);
        } else {
          // Fallback if parent not found
          commentsList.unshift(newComment);
        }
        
        // Save new list
        if (commentsList.length > 500) commentsList = commentsList.slice(0, 500);
        await fetch(`${url}/pipeline`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify([
            ["DEL", "tbh_comments"],
            ["RPUSH", "tbh_comments", ...commentsList.map(c => JSON.stringify(c))]
          ])
        });
      } else {
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
      }
      
      return NextResponse.json(newComment);
    } else {
      // Local fallback
      if (parentId) {
        const parentIdx = localComments.findIndex(c => c.id === parentId);
        if (parentIdx !== -1) {
          localComments.splice(parentIdx + 1, 0, newComment);
        } else {
          localComments.unshift(newComment);
        }
      } else {
        localComments.unshift(newComment);
      }
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

    const url = null; // Temporarily disabled
    const token = null;

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

export async function PUT(request) {
  try {
    const body = await request.json();
    const { comments, adminSecret } = body;

    const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin_password_123';

    if (adminSecret !== ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!Array.isArray(comments)) {
      return NextResponse.json({ error: 'Invalid comments data' }, { status: 400 });
    }

    const url = null; // Temporarily disabled
    const token = null;

    if (url && token) {
      // Create pipeline to DEL existing list and RPUSH all comments in order
      // (Since we want index 0 to be the first in UI, but UI fetches them, we just replace it)
      // Actually, to push multiple items at once to a list, we can use a REST pipeline or a single RPUSH command
      
      const p = await fetch(`${url}/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([
          ["DEL", "tbh_comments"],
          ["RPUSH", "tbh_comments", ...comments.map(c => JSON.stringify(c))]
        ])
      });
      
      const result = await p.json();
      return NextResponse.json({ success: true });
    } else {
      // Local fallback
      localComments = comments;
      return NextResponse.json({ success: true });
    }

  } catch (error) {
    console.error("PUT Reorder Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

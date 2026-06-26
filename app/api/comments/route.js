export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

function getS3Client() {
    const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
    const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
    const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
    if (!ACCOUNT_ID || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) return null;
    return new S3Client({
        region: 'auto',
        endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: ACCESS_KEY_ID,
            secretAccessKey: SECRET_ACCESS_KEY,
        },
    });
}
const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'taskbarhero-data';

// Local Fallback Cache for development
let localComments = [
  { id: 1, text: "Welcome to the anonymous comment section! / 匿名コメント欄へようこそ！", timestamp: Date.now() }
];

export const dynamic = 'force-dynamic';

async function getComments() {
    const client = getS3Client();
    if (!client) return localComments;
    try {
        const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: 'comments.json' });
        const response = await client.send(command);
        const text = await response.Body.transformToString();
        return JSON.parse(text);
    } catch (e) {
        if (e.name === 'NoSuchKey') return [];
        console.error("R2 GetObject Error:", e);
        return localComments;
    }
}

async function setComments(comments) {
    const client = getS3Client();
    if (!client) {
        localComments = comments;
        return;
    }
    try {
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: 'comments.json',
            Body: JSON.stringify(comments),
            ContentType: 'application/json',
        });
        await client.send(command);
    } catch (e) {
        console.error("R2 PutObject Error:", e);
    }
}

export async function GET() {
  const comments = await getComments();
  return NextResponse.json(comments);
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

    let commentsList = await getComments();

    if (parentId) {
      const parentIdx = commentsList.findIndex(c => c.id === parentId);
      if (parentIdx !== -1) {
        commentsList.splice(parentIdx + 1, 0, newComment);
      } else {
        commentsList.unshift(newComment);
      }
    } else {
      commentsList.unshift(newComment);
    }

    if (commentsList.length > 500) commentsList = commentsList.slice(0, 500);

    await setComments(commentsList);
    
    return NextResponse.json(newComment);

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

    let commentsList = await getComments();
    const initialLength = commentsList.length;
    commentsList = commentsList.filter(c => c.id !== id);

    if (commentsList.length < initialLength) {
      await setComments(commentsList);
      return NextResponse.json({ success: true, removed: initialLength - commentsList.length });
    }

    return NextResponse.json({ error: 'Comment not found' }, { status: 404 });

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

    await setComments(comments);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("PUT Reorder Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

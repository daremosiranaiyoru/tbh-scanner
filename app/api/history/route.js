import fs from 'fs/promises';
import path from 'path';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const item = searchParams.get('item');

  if (!item) {
    return new Response(JSON.stringify({ error: 'Item parameter is required' }), { status: 400 });
  }

  try {
    const dataPath = path.join(process.cwd(), 'app', 'data', 'history.json');
    const fileContents = await fs.readFile(dataPath, 'utf8');
    const historyData = JSON.parse(fileContents);

    const itemHistory = historyData[item] || [];

    return new Response(JSON.stringify({ history: itemHistory }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Failed to read history data:', error);
    return new Response(JSON.stringify({ error: 'Failed to load history data' }), { status: 500 });
  }
}

import { NextResponse } from 'next/server';

export const revalidate = 3600; // Cache the Steam response for 1 hour at Vercel Edge

export async function GET(request, { params }) {
  const { name } = await params;
  if (!name) return NextResponse.json({ error: 'Missing item name' }, { status: 400 });

  const encodedName = encodeURIComponent(decodeURIComponent(name));
  const overviewUrl = `https://steamcommunity.com/market/priceoverview/?appid=3678970&currency=1&market_hash_name=${encodedName}`;

  try {
    const res = await fetch(overviewUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      next: { revalidate: 3600 } // explicitly cache the fetch
    });

    if (!res.ok) {
      if (res.status === 429) {
        return NextResponse.json({ error: 'Steam Rate Limit' }, { status: 429 });
      }
      return NextResponse.json({ error: 'Steam Market Error' }, { status: res.status });
    }

    const data = await res.json();
    if (data && data.success) {
      let medianCents = null;
      let lowestCents = null;

      if (data.median_price) {
        const parsed = parseFloat(data.median_price.replace(/[^0-9.]/g, ''));
        if (!isNaN(parsed)) medianCents = Math.round(parsed * 100);
      }
      if (data.lowest_price) {
        const parsed = parseFloat(data.lowest_price.replace(/[^0-9.]/g, ''));
        if (!isNaN(parsed)) lowestCents = Math.round(parsed * 100);
      }

      return NextResponse.json({
        priceCents: medianCents,
        medianCents,
        lowestCents,
        qty: data.volume ? parseInt(data.volume.replace(/[^0-9]/g, '')) : null
      });
    }

    return NextResponse.json({ error: 'Item not found on Steam' }, { status: 404 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

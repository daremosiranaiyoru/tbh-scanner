import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const APP_ID = '3678970';
const PAGE_SIZE = 100;
const MAX_ITEMS = 2000;

export async function GET(request) {
    if (!process.env.KV_REST_API_URL) {
        return NextResponse.json({ error: 'KV not configured' }, { status: 500 });
    }

    try {
        const now = Date.now();
        const lastRun = await kv.get('steam_cron_lock') || 0;
        if (now - lastRun < 4000) {
            return NextResponse.json({ skipped: true, message: 'Rate limited' });
        }
        await kv.set('steam_cron_lock', now);

        let cursor = await kv.get('steam_market_cursor');
        if (typeof cursor !== 'number') {
            cursor = 0;
        }

        const url = `https://steamcommunity.com/market/search/render/?query=&start=${cursor}&count=${PAGE_SIZE}&search_descriptions=0&sort_column=popular&sort_dir=desc&appid=${APP_ID}&currency=1&norender=1`;
        const res = await fetch(url);
        
        if (!res.ok) {
            return NextResponse.json({ error: 'Steam API error', status: res.status }, { status: 500 });
        }
        
        const data = await res.json();
        
        if (data.results && data.results.length > 0) {
            let existingCache = await kv.get('steam_prices') || {};
            let queue = await kv.get('steam_items_queue') || [];
            let updatedCount = 0;

            for (const item of data.results) {
                // Add to queue if not present, so local updater can fetch its detailed price
                if (!queue.includes(item.hash_name)) {
                    queue.push(item.hash_name);
                }

                // Use sell_price directly (includes Steam fees) so it matches the median_price format
                let lowestCents = item.sell_price;

                if (!existingCache[item.hash_name]) {
                    existingCache[item.hash_name] = {
                        lowestCents: lowestCents,
                        qty: item.sell_listings
                    };
                } else {
                    existingCache[item.hash_name].lowestCents = lowestCents;
                    existingCache[item.hash_name].qty = item.sell_listings;
                }
                updatedCount++;
            }

            await kv.set('steam_prices', existingCache);
            await kv.set('steam_items_queue', queue);
            await kv.set('steam_last_fetch', Date.now());
            
            let newCursor = cursor + data.results.length;
            if (newCursor >= MAX_ITEMS || (data.total_count && newCursor >= data.total_count)) {
                newCursor = 0; // Reset
                try {
                    const fxRes = await fetch('https://open.er-api.com/v6/latest/USD');
                    if (fxRes.ok) {
                        const fxData = await fxRes.json();
                        if (fxData && fxData.rates) await kv.set('steam_rates', fxData.rates);
                    }
                } catch(e) {}
            }
            
            await kv.set('steam_market_cursor', newCursor);

            return NextResponse.json({ success: true, fetched: updatedCount, nextCursor: newCursor });
        } else {
            await kv.set('steam_market_cursor', 0);
            return NextResponse.json({ success: true, message: 'End of results, reset cursor' });
        }

    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

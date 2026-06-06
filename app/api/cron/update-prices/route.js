import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const APP_ID = '3678970';
const PAGE_SIZE = 100;
const MAX_ITEMS = 2000;

export async function GET(request) {
    // Basic security for manual triggers (Vercel Cron automatically adds a secure header we could check)
    // For now, let's keep it simple.

    if (!process.env.KV_REST_API_URL) {
        return NextResponse.json({ error: 'KV not configured' }, { status: 500 });
    }

    try {
        // 1. Get current pagination cursor
        let cursor = await kv.get('steam_market_cursor');
        if (typeof cursor !== 'number') {
            cursor = 0;
        }

        // 2. Fetch one page from Steam Market
        const url = `https://steamcommunity.com/market/search/render/?query=&start=${cursor}&count=${PAGE_SIZE}&search_descriptions=0&sort_column=popular&sort_dir=desc&appid=${APP_ID}&currency=1&norender=1`;
        const res = await fetch(url);
        
        if (!res.ok) {
            console.error("Steam API error:", res.status);
            return NextResponse.json({ error: 'Steam API error', status: res.status }, { status: 500 });
        }
        
        const data = await res.json();
        
        if (data.results && data.results.length > 0) {
            // Get existing cached items so we can merge
            let existingCache = await kv.get('steam_prices') || {};
            let updatedCount = 0;

            for (const item of data.results) {
                let cents = item.sell_price;
                if (item.sale_price_text) {
                    const parsed = parseFloat(item.sale_price_text.replace(/[^0-9.]/g, ''));
                    if (!isNaN(parsed)) {
                        cents = Math.round(parsed * 100);
                    }
                }
                
                existingCache[item.hash_name] = {
                    priceCents: cents,
                    qty: item.sell_listings
                };
                updatedCount++;
            }

            // Save merged cache back to KV
            await kv.set('steam_prices', existingCache);
            await kv.set('steam_last_fetch', Date.now());
            
            // Update cursor
            let newCursor = cursor + data.results.length;
            if (newCursor >= MAX_ITEMS || (data.total_count && newCursor >= data.total_count)) {
                newCursor = 0; // Reset to start
                
                // Fetch fresh exchange rates when restarting loop
                try {
                    const fxRes = await fetch('https://open.er-api.com/v6/latest/USD');
                    if (fxRes.ok) {
                        const fxData = await fxRes.json();
                        if (fxData && fxData.rates) {
                            await kv.set('steam_rates', fxData.rates);
                        }
                    }
                } catch(e) {
                    console.error("Exchange rate fetch failed", e);
                }
            }
            
            await kv.set('steam_market_cursor', newCursor);

            return NextResponse.json({ 
                success: true, 
                fetched: updatedCount, 
                nextCursor: newCursor 
            });
        } else {
            // Reached the end early
            await kv.set('steam_market_cursor', 0);
            return NextResponse.json({ success: true, message: 'End of results, reset cursor' });
        }

    } catch (e) {
        console.error("Cron failed:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

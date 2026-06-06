import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const APP_ID = '3678970';
const PAGE_SIZE = 100;

export async function GET(request) {
    if (!process.env.KV_REST_API_URL) {
        return NextResponse.json({ error: 'KV not configured' }, { status: 500 });
    }

    try {
        // Concurrency lock to prevent hammering Steam
        const now = Date.now();
        const lastRun = await kv.get('steam_cron_lock') || 0;
        if (now - lastRun < 2000) {
            return NextResponse.json({ skipped: true, message: 'Rate limited' });
        }
        await kv.set('steam_cron_lock', now);

        // State machine: Check if queue has items
        let queue = await kv.get('steam_items_queue') || [];
        
        // State 1: If queue is empty, fetch a batch of names from search/render API
        if (queue.length === 0) {
            let cursor = await kv.get('steam_market_cursor') || 0;
            const url = `https://steamcommunity.com/market/search/render/?query=&start=${cursor}&count=${PAGE_SIZE}&search_descriptions=0&sort_column=popular&sort_dir=desc&appid=${APP_ID}&currency=1&norender=1`;
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });
            
            if (!res.ok) {
                return NextResponse.json({ error: 'Steam API error', status: res.status }, { status: 500 });
            }
            
            const data = await res.json();
            
            if (data.results && data.results.length > 0) {
                let existingCache = await kv.get('steam_prices') || {};
                
                queue = [];
                for (const item of data.results) {
                    queue.push(item.hash_name);
                    
                    // Set baseline price if it doesn't exist at all
                    if (!existingCache[item.hash_name]) {
                        let cents = item.sell_price;
                        if (item.sale_price_text) {
                            const parsed = parseFloat(item.sale_price_text.replace(/[^0-9.]/g, ''));
                            if (!isNaN(parsed)) cents = Math.round(parsed * 100);
                        }
                        existingCache[item.hash_name] = {
                            priceCents: cents,
                            qty: item.sell_listings
                        };
                    }
                }
                
                await kv.set('steam_prices', existingCache);
                await kv.set('steam_items_queue', queue);
                
                // Update cursor
                let newCursor = cursor + data.results.length;
                if (data.total_count && newCursor >= data.total_count) {
                    newCursor = 0; // Reset to start
                    
                    // Fetch fresh exchange rates when restarting loop
                    try {
                        const fxRes = await fetch('https://open.er-api.com/v6/latest/USD');
                        if (fxRes.ok) {
                            const fxData = await fxRes.json();
                            if (fxData && fxData.rates) await kv.set('steam_rates', fxData.rates);
                        }
                    } catch(e) {}
                }
                await kv.set('steam_market_cursor', newCursor);
                
                return NextResponse.json({ success: true, message: 'Queue populated', count: queue.length });
            } else {
                await kv.set('steam_market_cursor', 0);
                return NextResponse.json({ success: true, message: 'End of results, reset cursor' });
            }
        }
        
        // State 2: If queue has items, pop ONE item and fetch its priceoverview
        const itemName = queue.shift();
        await kv.set('steam_items_queue', queue); // Save updated queue
        
        const encodedName = encodeURIComponent(itemName);
        const overviewUrl = `https://steamcommunity.com/market/priceoverview/?appid=${APP_ID}&currency=1&market_hash_name=${encodedName}`;
        
        const overviewRes = await fetch(overviewUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        if (!overviewRes.ok) {
            return NextResponse.json({ error: `Overview fetch failed for ${itemName}`, status: overviewRes.status });
        }
        
        const overviewData = await overviewRes.json();
        
        if (overviewData && overviewData.success) {
            let existingCache = await kv.get('steam_prices') || {};
            
            // Extract median price (Recent Sold), fallback to lowest price
            const priceStr = overviewData.median_price || overviewData.lowest_price;
            let cents = 0;
            if (priceStr) {
                const parsed = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
                if (!isNaN(parsed)) {
                    cents = Math.round(parsed * 100);
                }
            }
            
            let prevData = existingCache[itemName] || {};
            let qty = prevData.qty || 0;
            if (overviewData.volume) {
                qty = parseInt(overviewData.volume.replace(/[^0-9]/g, '')) || qty;
            }
            
            // Overwrite with accurate recent sold price
            existingCache[itemName] = {
                priceCents: cents > 0 ? cents : (prevData.priceCents || 0),
                qty: qty
            };
            
            await kv.set('steam_prices', existingCache);
            await kv.set('steam_last_fetch', Date.now());
            
            return NextResponse.json({ 
                success: true, 
                fetchedItem: itemName, 
                priceCents: cents,
                remainingInQueue: queue.length 
            });
        }
        
        return NextResponse.json({ success: false, message: `Invalid data for ${itemName}` });

    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const APP_ID = '3678970';
const CACHE_DURATION_MS = 30 * 60 * 1000;

// Local Fallback Cache (for local development without KV)
let localPriceCache = {};
let localExchangeRates = { USD: 1, JPY: 150 };
let localLastFetchTime = 0;
let isFetching = false;

async function fetchLocalSteamMarketItems() {
    if (isFetching) return;
    isFetching = true;
    try {
        let start = 0;
        let totalCount = Infinity;
        let newCache = {};
        
        while (start < totalCount && start < 2000) {
            const url = `https://steamcommunity.com/market/search/render/?query=&start=${start}&count=100&search_descriptions=0&sort_column=popular&sort_dir=desc&appid=${APP_ID}&currency=1&norender=1`;
            const res = await fetch(url);
            if (!res.ok) break;
            
            const data = await res.json();
            if (data.total_count) totalCount = data.total_count;
            
            if (data.results && data.results.length > 0) {
                for (const item of data.results) {
                    let cents = item.sell_price;
                    if (item.sale_price_text) {
                        const parsed = parseFloat(item.sale_price_text.replace(/[^0-9.]/g, ''));
                        if (!isNaN(parsed)) cents = Math.round(parsed * 100);
                    }
                    newCache[item.hash_name] = { priceCents: cents, qty: item.sell_listings };
                }
                start += data.results.length;
            } else {
                break;
            }
            await new Promise(r => setTimeout(r, 2000));
        }
        
        if (Object.keys(newCache).length > 0) {
            localPriceCache = newCache;
            try {
                const fxRes = await fetch('https://open.er-api.com/v6/latest/USD');
                if (fxRes.ok) {
                    const fxData = await fxRes.json();
                    if (fxData && fxData.rates) localExchangeRates = fxData.rates;
                }
            } catch(e) {}
            localLastFetchTime = Date.now();
        }
    } catch (e) {
    } finally {
        isFetching = false;
    }
}

export async function GET() {
    // Check if Vercel KV is configured
    if (process.env.KV_REST_API_URL) {
        try {
            const items = await kv.get('steam_prices') || {};
            const rates = await kv.get('steam_rates') || { USD: 1, JPY: 150 };
            const cachedAt = await kv.get('steam_last_fetch') || 0;
            const queue = await kv.get('steam_items_queue') || [];
            
            return NextResponse.json({
                cachedAt,
                items,
                rates,
                queueLength: queue.length
            });
        } catch (e) {
            console.error("KV Error:", e);
            // Fallback to local
        }
    }
    
    // --- LOCAL FALLBACK (No KV) ---
    const now = Date.now();
    if (Object.keys(localPriceCache).length === 0 && !isFetching) {
        await fetchLocalSteamMarketItems();
    } else if (now - localLastFetchTime > CACHE_DURATION_MS) {
        fetchLocalSteamMarketItems(); // Fire and forget
    }
    
    return NextResponse.json({
        cachedAt: localLastFetchTime,
        items: localPriceCache,
        rates: localExchangeRates
    });
}

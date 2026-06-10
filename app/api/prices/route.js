import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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
    const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (kvUrl && kvToken) {
        try {
            // Manually fetch using REST API to support both Vercel KV and Upstash variable names
            const fetchKv = async (key, defaultValue) => {
                const res = await fetch(`https://${kvUrl.replace(/^https?:\/\//, '')}/get/${key}`, {
                    headers: { Authorization: `Bearer ${kvToken}` },
                    cache: 'no-store'
                });
                if (!res.ok) return defaultValue;
                const data = await res.json();
                if (data.result === null || data.result === undefined) return defaultValue;
                if (typeof data.result === 'string') {
                    try { return JSON.parse(data.result); } catch(e) { return data.result; }
                }
                return data.result;
            };

            const items = await fetchKv('steam_prices', {});
            let rates = await fetchKv('steam_rates', { USD: 1, JPY: 150 });
            
            // If rates doesn't include KRW or CNY, fetch real-time rates
            if (!rates.KRW || !rates.CNY) {
                try {
                    const fxRes = await fetch('https://open.er-api.com/v6/latest/USD');
                    if (fxRes.ok) {
                        const fxData = await fxRes.json();
                        if (fxData && fxData.rates) rates = fxData.rates;
                    }
                } catch(e) { }
            }
            
            const cachedAt = await fetchKv('steam_last_fetch', 0);
            const queue = await fetchKv('steam_items_queue', []);
            
            return NextResponse.json({
                cachedAt,
                items,
                rates,
                queueLength: queue.length || 0
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

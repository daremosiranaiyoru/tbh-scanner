import { NextResponse } from 'next/server';

const APP_ID = 3678970;

// In-memory cache for item_nameid to avoid fetching HTML pages repeatedly
const itemIdCache = {};

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const hashName = searchParams.get('hash_name');
    
    if (!hashName) {
        return NextResponse.json({ error: "Missing hash_name parameter" }, { status: 400 });
    }
    
    try {
        let itemId = itemIdCache[hashName];
        
        // 1. Fetch item_nameid from HTML if not cached
        if (!itemId) {
            const htmlUrl = `https://steamcommunity.com/market/listings/${APP_ID}/${encodeURIComponent(hashName)}`;
            const htmlRes = await fetch(htmlUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            if (!htmlRes.ok) throw new Error("Failed to fetch HTML page");
            
            const html = await htmlRes.text();
            const match = html.match(/Market_LoadOrderSpread\(\s*(\d+)\s*\)/);
            if (match && match[1]) {
                itemId = match[1];
                itemIdCache[hashName] = itemId; // Cache it
            } else {
                throw new Error("Could not find item_nameid in HTML");
            }
        }
        
        // 2. Fetch the histogram data using item_nameid
        const histUrl = `https://steamcommunity.com/market/itemordershistogram?country=US&language=english&currency=1&item_nameid=${itemId}`;
        const histRes = await fetch(histUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        if (!histRes.ok) throw new Error("Failed to fetch histogram");
        
        const histData = await histRes.json();
        
        if (histData.success !== 1 && histData.success !== true) {
            throw new Error("Histogram API returned success = false");
        }
        
        // Extract highest buy order and lowest sell order (in cents)
        const highestBuyOrderCents = histData.highest_buy_order ? parseInt(histData.highest_buy_order, 10) : 0;
        const lowestSellOrderCents = histData.lowest_sell_order ? parseInt(histData.lowest_sell_order, 10) : 0;
        
        return NextResponse.json({
            buyOrderCents: highestBuyOrderCents,
            sellOrderCents: lowestSellOrderCents,
            buyOrderFormatted: histData.buy_order_price,
            sellOrderFormatted: histData.sell_order_price
        });
        
    } catch (error) {
        console.error("Buy order fetch error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

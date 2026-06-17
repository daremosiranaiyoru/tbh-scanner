import { NextResponse } from 'next/server';

export const revalidate = 60;

export async function GET() {
    try {
        let rates = { USD: 1, JPY: 150 };
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            const fxRes = await fetch('https://open.er-api.com/v6/latest/USD', { signal: controller.signal });
            clearTimeout(timeoutId);
            if (fxRes.ok) {
                const fxData = await fxRes.json();
                if (fxData && fxData.rates) rates = fxData.rates;
            }
        } catch (e) {}

        const mergedItems = {};

        // Merge recent transaction price from history.json
        try {
            const fs = require('fs');
            const path = require('path');
            const historyPath = path.join(process.cwd(), 'app', 'data', 'history.json');
            if (fs.existsSync(historyPath)) {
                const historyData = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
                for (const itemName in historyData) {
                    const itemHist = historyData[itemName];
                    if (Array.isArray(itemHist) && itemHist.length > 0) {
                        const lastTx = itemHist[itemHist.length - 1]; // [date, price, volume]
                        if (lastTx && typeof lastTx[1] === 'number') {
                            const txTime = new Date(lastTx[0]).getTime();
                            const cutoff = new Date('2026-06-03T00:00:00Z').getTime();
                            if (txTime >= cutoff) {
                                const recentCents = Math.round(lastTx[1] * 100);
                                if (!mergedItems[itemName]) mergedItems[itemName] = {};
                                mergedItems[itemName].recentPriceCents = recentCents;
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.error("Failed to merge history prices:", e);
        }

        return NextResponse.json({
            cachedAt: Date.now(),
            items: mergedItems,
            rates,
            queueLength: 0
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
            }
        });
    } catch (e) {
        console.error("Prices API Error:", e);
        return NextResponse.json({ error: "API Error", cachedAt: 0, items: {}, rates: { USD: 1, JPY: 150 } }, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600'
            }
        });
    }
}

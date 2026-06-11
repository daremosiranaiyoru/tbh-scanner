import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const revalidate = 0; // Disable static caching completely

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

        let prices = {};
        let buyOrders = {};

        try {
            const pricesData = await fs.readFile(path.join(process.cwd(), 'app/data/prices.json'), 'utf8');
            prices = JSON.parse(pricesData);
        } catch (e) {
            console.error("Failed to read prices.json", e);
        }

        try {
            const buyOrdersData = await fs.readFile(path.join(process.cwd(), 'app/data/buy_orders.json'), 'utf8');
            buyOrders = JSON.parse(buyOrdersData);
        } catch (e) {
            console.error("Failed to read buy_orders.json", e);
        }

        // Merge buy_orders.json data into prices.json data
        const mergedItems = { ...prices };
        for (const itemName in buyOrders) {
            if (!mergedItems[itemName]) {
                mergedItems[itemName] = {};
            }
            mergedItems[itemName] = {
                ...mergedItems[itemName],
                ...buyOrders[itemName]
            };
        }

        return NextResponse.json({
            cachedAt: Date.now(),
            items: mergedItems,
            rates,
            queueLength: 0
        });
    } catch (e) {
        console.error("Prices API Error:", e);
        return NextResponse.json({ error: "API Error", cachedAt: 0, items: {}, rates: { USD: 1, JPY: 150 } });
    }
}

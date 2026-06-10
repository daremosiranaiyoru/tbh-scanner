import { NextResponse } from 'next/server';
import prices from '../../data/prices.json';

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

        return NextResponse.json({
            cachedAt: Date.now(),
            items: prices || {},
            rates,
            queueLength: 0
        });
    } catch (e) {
        console.error("Prices API Error:", e);
        return NextResponse.json({ error: "API Error", cachedAt: 0, items: {}, rates: { USD: 1, JPY: 150 } });
    }
}

import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        
        // Simple admin secret to prevent unauthorized updates
        if (body.adminSecret !== (process.env.ADMIN_SECRET || 'admin_password_123')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
        const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

        if (!kvUrl || !kvToken) {
            return NextResponse.json({ error: 'No KV configured on server' }, { status: 500 });
        }

        // Save prices
        if (body.prices) {
            const priceRes = await fetch(`https://${kvUrl.replace(/^https?:\/\//, '')}/set/steam_prices`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${kvToken}` },
                body: JSON.stringify(body.prices)
            });
            if (!priceRes.ok) {
                const errText = await priceRes.text();
                return NextResponse.json({ error: 'Failed to set prices', details: errText }, { status: 500 });
            }
        }
        
        // Save queue
        if (body.queue) {
            await fetch(`https://${kvUrl.replace(/^https?:\/\//, '')}/set/steam_items_queue`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${kvToken}` },
                body: JSON.stringify(body.queue)
            });
        }
        
        // Update last fetch time
        await fetch(`https://${kvUrl.replace(/^https?:\/\//, '')}/set/steam_last_fetch`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${kvToken}` },
            body: Date.now().toString()
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

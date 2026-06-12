const fs = require('fs');

async function migrate() {
    const OLD_URL = "https://proven-stag-36687.upstash.io";
    const OLD_TOKEN = "AY9PAAIgcDEwYTk1NmNhMjg3OWM0MWNlYThlOWNjNGQyYzhjMWY2Yw";
    
    const NEW_URL = "https://primary-wasp-120502.upstash.io";
    const NEW_TOKEN = "gQAAAAAAAda2AAIgcDEyYTZiN2FhNGE5MDQ0Y2UyOTUyYzBiODU2NjU3ODllMw";
    
    console.log('Fetching comments from OLD database...');
    
    const oldRes = await fetch(`${OLD_URL}/lrange/tbh_comments/0/499`, {
        headers: { Authorization: `Bearer ${OLD_TOKEN}` }
    });
    
    const oldData = await oldRes.json();
    const rawStrings = oldData.result;
    
    if (!rawStrings || rawStrings.length === 0) {
        console.log('No comments found in old DB.');
        return;
    }
    
    console.log(`Found ${rawStrings.length} comments to migrate.`);
    
    // Construct pipeline request
    const pipeline = [];
    
    // First, clear any existing data in the new list just in case
    pipeline.push(["DEL", "tbh_comments"]);
    
    // Then RPUSH all comments
    pipeline.push(["RPUSH", "tbh_comments", ...rawStrings]);
    
    console.log('Pushing comments to NEW database...');
    const res = await fetch(`${NEW_URL}/pipeline`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${NEW_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(pipeline)
    });
    
    const result = await res.json();
    console.log('Migration result:', result);
    console.log('✅ Migration complete!');
}

migrate().catch(console.error);

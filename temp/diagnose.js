const URL = 'https://laqcnqhyhvtawzvmxlkw.supabase.co';
const KEY = 'sb_publishable_xV0mj5rXsvJb9qgW2fSANQ_5D4OJaFz';

async function testFetch() {
    console.log("Fetching from Supabase...");
    try {
        const res = await fetch(`${URL}/rest/v1/properties?select=*`, {
            headers: {
                'apikey': KEY,
                'Authorization': `Bearer ${KEY}`
            }
        });
        const text = await res.text();
        console.log("STATUS:", res.status);
        console.log("RESPONSE:", text);
    } catch(e) {
        console.error("ERROR:", e);
    }
}
testFetch();

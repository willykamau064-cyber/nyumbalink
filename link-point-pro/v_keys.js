const CONSUMER_KEY = 'S9TnrELYZPAXhpSs2uM0cVO2wUAAKeyN';
const CONSUMER_SECRET = 'fTAuEsAtEQ3hdZO51SsB13hn8uoaGYLANpg0bhG29XzXMKcazIz5XqbOgKHZLQBaMCs8KNKppmrrAiuN';
async function test() {
    try {
        const auth = Buffer.from(CONSUMER_KEY + ':' + CONSUMER_SECRET).toString('base64');
        const r1 = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
            headers: { Authorization: 'Basic ' + auth }
        });
        const d1 = await r1.text();
        console.log('Result:', d1);
    } catch(e) { console.error('Error:', e); }
}
test();

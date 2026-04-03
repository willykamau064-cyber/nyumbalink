const CONSUMER_KEY = 'S9TnrELYZPAXhpSs2uM0cVO2wUAAKeyN';
const CONSUMER_SECRET = 'fTAuEsAtEQ3hdZO51SsB13hn8uoaGYLANpg0bhG29XzXMKcazIz5XqbOgKHZLQBa';
const SHORTCODE = '174379';
const PASSKEY = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';

async function test() {
    try {
        const auth = Buffer.from(CONSUMER_KEY + ':' + CONSUMER_SECRET).toString('base64');
        const r1 = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
            headers: { Authorization: `Basic ${auth}` }
        });
        const d1 = await r1.text();
        console.log("Auth Response:", d1);
        
        let token;
        try {
            token = JSON.parse(d1).access_token;
        } catch(e) {}
        if (!token) return console.log("Failed to get token");

        const ts = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
        const pwd = Buffer.from(SHORTCODE + PASSKEY + ts).toString('base64');
        const p = '254708374149';
        
        const r2 = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                BusinessShortCode: SHORTCODE,
                Password: pwd,
                Timestamp: ts,
                TransactionType: 'CustomerPayBillOnline',
                Amount: 1,
                PartyA: p,
                PartyB: SHORTCODE,
                PhoneNumber: p,
                CallBackURL: 'https://sandbox.safaricom.co.ke/',
                AccountReference: 'LinkPointHub',
                TransactionDesc: 'Test Payment'
            })
        });
        const d2 = await r2.text();
        console.log("STK Response:", d2);
    } catch(e) {
        console.error("Node Error:", e);
    }
}
test();

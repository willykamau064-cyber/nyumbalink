const fs = require('fs');
async function test() {
    const auth = Buffer.from('S9TnrELYZPAXhpSs2uM0cVO2wUAAKeyN:fTAuEsAtEQ3hdZO51SsB13hn8uoaGYLANpg0bhG29XzXMKcazIz5XqbOgKHZLQBa').toString('base64');
    const r1 = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
        headers: { Authorization: Basic " + auth + "" }
    });
    const d1 = await r1.text();
    fs.writeFileSync('saf_test.json', d1);
}
test();

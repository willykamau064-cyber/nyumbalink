async function test() {
    const auth = Buffer.from('S9TnrELYZPAXhpSs2uM0cVO2wUAAKeyN:fTAuEsAtEQ3hdZO5').toString('base64');
    try {
        const r = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
            headers: { Authorization: 'Basic ' + auth }
        });
        const t = await r.text();
        console.log("SANDBOX STATUS:", r.status);
        console.log("SANDBOX RES:", t);
        
        const r2 = await fetch('https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
            headers: { Authorization: 'Basic ' + auth }
        });
        const t2 = await r2.text();
        console.log("PROD STATUS:", r2.status);
        console.log("PROD RES:", t2);
    } catch(e) {}
}
test();

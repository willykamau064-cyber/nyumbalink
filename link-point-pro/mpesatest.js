async function test() {
    const auth = Buffer.from('S9TnrELYZPAXhpSs2uM0cVO2wUAAKeyN:fTAuEsAtEQ3hdZO5').toString('base64');
    try {
        const r = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
            headers: { Authorization: 'Basic ' + auth }
        });
        const d = await r.json();
        console.log("RESPONSE:", d);
    } catch(e) {
        console.log("ERROR:", e.message);
    }
}
test();

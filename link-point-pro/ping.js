const http = require('http');

async function test() {
    try {
        const res = await fetch('http://localhost:5000/api/pay', {
            method: 'POST',
            body: JSON.stringify({phone: '0712345678'})
        });
        const text = await res.text();
        console.log('STATUS:', res.status, text);
    } catch(e) {
        console.error('SERVER IS DOWN:', e.message);
    }
}
test();

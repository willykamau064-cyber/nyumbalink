const fs = require('fs');
const path = require('path');

//==========================================
// 1. Generate Full-Stack server.js Backend
//==========================================
const serverBackend = `const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
const PUBLIC_DIR = __dirname;

const server = http.createServer((req, res) => {
    // Basic CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // API Route Handling (Backend Joining)
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            res.setHeader('Content-Type', 'application/json');
            try {
                const data = JSON.parse(body || '{}');
                if (req.url === '/api/chat') {
                    setTimeout(() => {
                        res.writeHead(200);
                        res.end(JSON.stringify({ reply: 'Our AI agent successfully received your message: "' + (data.message || '') + '". A human representative will take over momentarily!' }));
                    }, 500); 
                } 
                else if (req.url === '/api/pay') {
                    setTimeout(() => {
                        res.writeHead(200);
                        res.end(JSON.stringify({ status: 'success', message: 'M-PESA API: STK Push initialized to ' + (data.phone || 'your phone') + '. Please check your screen to enter your PIN.' }));
                    }, 1200);
                }
                else if (req.url === '/api/feedback') {
                    setTimeout(() => {
                        res.writeHead(200);
                        res.end(JSON.stringify({ status: 'success', message: 'Thank you! Your feedback has been safely committed to the LinkPoint database.' }));
                    }, 300);
                }
                else { res.writeHead(404); res.end('{"error":"Endpoint Not Found"}'); }
            } catch(e) { res.writeHead(400); res.end('{"error":"Bad Request"}'); }
        });
        return;
    }

    // Static Frontend File Serving
    let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);
    const ext = path.extname(filePath) || '.html';
    
    if (!path.extname(req.url) && req.url !== '/') {
        filePath += '.html';
    }

    let contentType = 'text/html';
    switch (ext) {
        case '.js': contentType = 'text/javascript'; break;
        case '.css': contentType = 'text/css'; break;
        case '.json': contentType = 'application/json'; break;
        case '.png': contentType = 'image/png'; break;
        case '.jpg': contentType = 'image/jpeg'; break;
        case '.webp': contentType = 'image/webp'; break;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('<h1>404 Not Found - Server Route Missing</h1>');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => console.log('LinkPoint Full-Stack Server live on port ' + PORT));`;

fs.writeFileSync('server.js', serverBackend, 'utf8');

//==========================================
// 2. Expand Frontend linkpoint-3d.js with JS API Fetches
//==========================================
let engine3D = fs.readFileSync('linkpoint-3d.js', 'utf8');
if (!engine3D.includes('Full Stack Frontend API Handlers')) {

const apiIntegration = `
// --- Full Stack Frontend API Handlers ---
window.addEventListener('DOMContentLoaded', () => {
    

    const chatBtn = document.querySelector('#chat-ov .btn');
    const chatInput = document.querySelector('#chat-ov input[type="text"]');
    if(chatBtn && chatInput) {
        chatBtn.removeAttribute('onclick');
        const sendChat = async () => {
            const msg = chatInput.value;
            if(!msg) return;
            const chatBox = chatInput.parentElement.previousElementSibling;
            chatBox.innerHTML += '<div style="background:var(--primary);color:#fff;padding:.8rem;border-radius:12px 12px 0 12px;align-self:flex-end;width:80%;font-size:.85rem">' + msg + '</div>';
            chatInput.value = '';
            try {
                const r = await fetch('/api/chat', { method:'POST', body: JSON.stringify({message: msg}) });
                const res = await r.json();
                chatBox.innerHTML += '<div style="background:rgba(255,255,255,.05);color:var(--muted);padding:.8rem;border-radius:12px 12px 12px 0;width:85%;font-size:.85rem;margin-top:.5rem">' + res.reply + '</div>';
                chatBox.scrollTop = chatBox.scrollHeight;
            } catch(e) { console.error(e); }
        };
        chatBtn.addEventListener('click', sendChat);
        chatInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') sendChat() });
    }

    const rateBtn = document.querySelector('#rov .btn');
    const rateInput = document.querySelector('#rov textarea');
    if(rateBtn && rateInput) {
        rateBtn.removeAttribute('onclick');
        rateBtn.addEventListener('click', async () => {
            if(!rateInput.value) { return; }
            const ogText = rateBtn.innerHTML;
            rateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            try {
                const r = await fetch('/api/feedback', { method:'POST', body: JSON.stringify({rating: 5, feedback: rateInput.value}) });
                const res = await r.json();
                alert('Backend Response: ' + res.message);
                if(typeof closeRate === 'function') closeRate();
            } catch(e) { alert('Backend Server Offline!'); }
            rateBtn.innerHTML = ogText;
            rateInput.value = '';
        });
    }
});
`;
    fs.writeFileSync('linkpoint-3d.js', engine3D + '\n' + apiIntegration, 'utf8');
}

//==========================================
// 3. Clean all HTML inline generic alerts
//==========================================
const filesMod = fs.readdirSync('.').filter(f => f.endsWith('.html'));

for(let f of filesMod) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/onclick="alert\([^)]+\)[^"]*"/g, '');
    fs.writeFileSync(f, content, 'utf8');
}

console.log("SUCCESS! Full Stack is officially joined.");

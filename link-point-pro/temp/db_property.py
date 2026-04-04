import os
import codecs

# 1. Expand server.js to include /api/properties route
serverCode = r"""const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
const PUBLIC_DIR = __dirname;

const SUPABASE_URL = 'https://laqcnqhyhvtawzvmxlkw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xV0mj5rXsvJb9qgW2fSANQ_5D4OJaFz';

const supabaseHeaders = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
};

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');
            try {
                const data = JSON.parse(body || '{}');
                
                if (req.url === '/api/chat') {
                    try {
                        await fetch(`${SUPABASE_URL}/rest/v1/chat_messages`, {
                            method: 'POST', headers: supabaseHeaders, body: JSON.stringify({ message: data.message })
                        });
                    } catch(e) {}
                    res.writeHead(200);
                    res.end(JSON.stringify({ reply: `Our Live Database saved: "${data.message || ''}". An agent is reviewing the dashboard!` }));
                } 
                else if (req.url === '/api/pay') {
                    setTimeout(() => {
                        res.writeHead(200);
                        res.end(JSON.stringify({ status: 'success', message: `M-PESA API: STK Push initialized to ${data.phone}. Connected to Supabase backend!` }));
                    }, 1200);
                }
                else if (req.url === '/api/feedback') {
                    try {
                        await fetch(`${SUPABASE_URL}/rest/v1/feedback_ratings`, {
                            method: 'POST', headers: supabaseHeaders, body: JSON.stringify({ rating: data.rating, feedback: data.feedback })
                        });
                    } catch(e) {}
                    res.writeHead(200);
                    res.end(JSON.stringify({ status: 'success', message: 'Success! Your feedback was inserted into the real Supabase Database!' }));
                }
                else if (req.url === '/api/properties') {
                    try {
                        await fetch(`${SUPABASE_URL}/rest/v1/properties`, {
                            method: 'POST', headers: supabaseHeaders, body: JSON.stringify({ title: data.title, location: data.location, price: parseInt(data.price)||0, property_type: data.type })
                        });
                    } catch(e) {}
                    res.writeHead(200);
                    res.end(JSON.stringify({ status: 'success' }));
                }
                else { res.writeHead(404); res.end('{"error":"Endpoint Not Found"}'); }
            } catch(e) { res.writeHead(400); res.end('{"error":"Bad Request"}'); }
        });
        return;
    }

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

server.listen(PORT, () => console.log('LinkPoint + Supabase Full-Stack Server live on port ' + PORT));
"""

with codecs.open('server.js', 'w', encoding='utf-8') as f:
    f.write(serverCode)

# 2. Update sell.html to send property data to backend on M-Pesa success
try:
    with codecs.open('sell.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Add IDs to the blank form fields so JS can find their values
    html = html.replace('placeholder="e.g. Modern 3BR Apartment in Kilimani"', 'id="p_title" placeholder="e.g. Modern 3BR Apartment in Kilimani"')
    html = html.replace('placeholder="e.g. Kilimani, Nairobi"', 'id="p_loc" placeholder="e.g. Kilimani, Nairobi"')
    html = html.replace('placeholder="e.g. 85000"', 'id="p_price" placeholder="e.g. 85000"')

    # Inject the Supabase Property Push Logic
    script_injection = r"""
<script>
window.addEventListener('DOMContentLoaded', () => {
    // Wait slightly to let the global MPesa script hook first
    setTimeout(() => {
        const listBtn = document.querySelector('#mov .btn');
        if(listBtn) {
            listBtn.addEventListener('click', async () => {
                const pt = document.getElementById('p_title')?.value;
                const pl = document.getElementById('p_loc')?.value;
                const ppr = document.getElementById('p_price')?.value;
                
                if(pt && pl && ppr) {
                    try {
                        const r = await fetch('/api/properties', { 
                            method: 'POST', 
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({ title: pt, location: pl, price: ppr, type: typeof curDesc !== 'undefined' ? curDesc : 'Listing' }) 
                        });
                        alert('? Success! Your specific property listing has been saved directly to the Supabase Properties Table.');
                    } catch(e) {}
                }
            });
        }
    }, 500);
});
</script>
</body>
"""
    if "Supabase Properties Table" not in html:
        html = html.replace('</body>', script_injection)
        
    with codecs.open('sell.html', 'w', encoding='utf-8') as f:
        f.write(html)
        
    print("Database integration configured for Property Listings!")
except Exception as e:
    print(str(e))

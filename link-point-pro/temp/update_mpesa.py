
import os, re

dir_path = r'C:\Users\wilson\.geminintigravityraine5545a-9da3-47a6-abb5-4e0329fe46ac'

mpesa_js_content = """
const mpesaCSS = `
.mpesa-bg { background: linear-gradient(rgba(17,24,39,0.9),rgba(17,24,39,0.9)), url('mpesa-bg.jpg'); background-size: cover; background-position: center; border-color: rgba(16,185,129,0.4); }
.mpesa-header { font-family: var(--serif, "Playfair Display", serif); font-size: 2rem; color: #34d399; text-align: center; margin-bottom: 0.5rem; text-shadow: 0 2px 10px rgba(16,185,129,0.2); }
`;

function injectMpesaModal() {
    if (document.getElementById('mov')) return;

    const style = document.createElement('style');
    style.innerHTML = mpesaCSS;
    document.head.appendChild(style);

    const modalHTML = `
        <div class="auth-ov" id="mov">
            <div class="auth-box mpesa-bg">
                <button class="acl" onclick="closeMpesa()"><i class="fas fa-times"></i></button>
                <div style="text-align:center;margin-bottom:1.5rem">
                    <div style="width:60px;height:60px;background:#10b981;border-radius:12px;margin:0 auto 1rem;display:flex;align-items:center;justify-content:center;font-size:1.8rem;color:#fff;box-shadow:0 0 20px rgba(16,185,129,0.4)">
                        <i class="fas fa-mobile-alt"></i>
                    </div>
                    <h2 class="mpesa-header">M-Pesa Escrow</h2>
                    <p style="color:var(--muted);font-size:.87rem" id="mdesc">Secure payment prompt</p>
                </div>
                <div style="display:flex;flex-direction:column;gap:1rem">
                    <div class="fgroup" style="margin-bottom:0.5rem">
                        <label style="color:#34d399;font-weight:600;display:block;margin-bottom:.4rem;font-size:0.79rem">Total Amount</label>
                        <div id="mamt" style="font-size:1.8rem;font-weight:800;color:#fff" data-amt="0">KSh 0</div>
                    </div>
                    <div class="fgroup">
                        <label style="color:rgba(255,255,255,0.6);font-weight:600;display:block;margin-bottom:.4rem;font-size:0.79rem">Safaricom Number</label>
                        <input type="tel" id="mpesa-phone" placeholder="2547XXXXXXXX" style="width:100%;padding:.85rem 1rem;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:12px;color:#fff;font-size:.92rem;">
                    </div>
                    <button id="mpesa-submit-btn" style="background:#10b981;color:#fff;width:100%;justify-content:center;padding:1rem;font-size:1rem;box-shadow:0 4px 15px rgba(16,185,129,0.3);border:none;border-radius:100px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:.5rem" onclick="executeSTKPush()">
                        <i class="fas fa-lock"></i> Pay Securely via M-Pesa
                    </button>
                    <div id="mpesa-status-box" style="display:none; padding:1rem; border-radius:12px; font-size:0.85rem; text-align:center; margin-top:0.5rem"></div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

window.openMpesa = function(amt, desc) {
    injectMpesaModal();
    const mamt = document.getElementById('mamt');
    mamt.innerText = 'KSh ' + amt;
    mamt.dataset.amt = amt;
    document.getElementById('mdesc').innerText = desc;
    document.getElementById('mov').classList.add('open');
    document.getElementById('mov').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

window.closeMpesa = function() {
    const mov = document.getElementById('mov');
    if (mov) mov.style.display = 'none';
    document.body.style.overflow = '';
}

window.executeSTKPush = async function() {
    const phoneInput = document.getElementById('mpesa-phone').value.trim();
    const amountRaw = document.getElementById('mamt').dataset.amt || '10';
    const amount = amountRaw.replace(/,/g, '');
    const btn = document.getElementById('mpesa-submit-btn');
    const statusBox = document.getElementById('mpesa-status-box');

    if (!phoneInput || phoneInput.length < 9) {
        statusBox.style.display = 'block';
        statusBox.style.background = 'rgba(239, 68, 68, 0.1)';
        statusBox.style.color = '#ef4444';
        statusBox.style.border = '1px solid rgba(239, 68, 68, 0.3)';
        statusBox.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please enter a valid number (e.g., 254712345678)';
        return;
    }

    const ogText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    btn.disabled = true;
    
    statusBox.style.display = 'block';
    statusBox.style.background = 'rgba(59, 130, 246, 0.1)';
    statusBox.style.color = '#60a5fa';
    statusBox.style.border = '1px solid rgba(59, 130, 246, 0.3)';
    statusBox.innerHTML = '<i class="fas fa-info-circle"></i> Connecting to Safaricom Daraja...';

    try {
        const res = await fetch('/api/mpesa/stk-push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: phoneInput, amount: amount })
        });
        
        const data = await res.json();
        
        if (data.status === 'success') {
            statusBox.style.background = 'rgba(16, 185, 129, 0.1)';
            statusBox.style.color = '#10b981';
            statusBox.style.border = '1px solid rgba(16, 185, 129, 0.3)';
            statusBox.innerHTML = '<i class="fas fa-check-circle"></i> STK Push sent! Please check your phone and enter your PIN.';
            
            setTimeout(() => {
                closeMpesa();
            }, 6000);
        } else {
            throw new Error(data.message || 'STK Push failed to initiate.');
        }
    } catch (e) {
        statusBox.style.background = 'rgba(239, 68, 68, 0.1)';
        statusBox.style.color = '#ef4444';
        statusBox.style.border = '1px solid rgba(239, 68, 68, 0.3)';
        statusBox.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ' + e.message;
    } finally {
        btn.innerHTML = ogText;
        btn.disabled = false;
    }
}
"""

with open(os.path.join(dir_path, 'mpesa.js'), 'w', encoding='utf-8') as f:
    f.write(mpesa_js_content)

server_path = os.path.join(dir_path, 'server.js')
with open(server_path, 'r', encoding='utf-8') as f:
    srv = f.read()

insert_block = """
        if (req.url === '/api/mpesa/stk-push') {
            try {
                const phone = json.phone;
                const amt = json.amount || 1;
                const token = await getAccessToken();
                
                const dDate = new Date();
                const ts = dDate.getFullYear() + ('0'+(dDate.getMonth()+1)).slice(-2) + ('0'+dDate.getDate()).slice(-2) + ('0'+dDate.getHours()).slice(-2) + ('0'+dDate.getMinutes()).slice(-2) + ('0'+dDate.getSeconds()).slice(-2);
                const pwd = Buffer.from(SHORTCODE + PASSKEY + ts).toString('base64');
                
                const payload = {
                    BusinessShortCode: SHORTCODE,
                    Password: pwd,
                    Timestamp: ts,
                    TransactionType: 'CustomerPayBillOnline',
                    Amount: amt,
                    PartyA: phone,
                    PartyB: SHORTCODE,
                    PhoneNumber: phone,
                    CallBackURL: 'https://webhook.site/placeholder',
                    AccountReference: 'LinkPointHub',
                    TransactionDesc: 'Payment for LinkPoint Services'
                };
                
                const stk = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const stkRes = await stk.json();
                
                if (stkRes.ResponseCode === '0') {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({status: 'success', data: stkRes}));
                } else {
                    res.writeHead(400, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({status: 'error', message: stkRes.errorMessage || stkRes.customerMessage || 'Failed to initiate STK Push'}));
                }
            } catch(e) {
                res.writeHead(500, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({status: 'error', message: e.message}));
            }
            return;
        }
"""

if '/api/mpesa/stk-push' not in srv:
    srv = srv.replace("if (req.url === '/api/properties') {", insert_block + "\n        if (req.url === '/api/properties') {")
    with open(server_path, 'w', encoding='utf-8') as f:
        f.write(srv)

for r, d, files in os.walk(dir_path):
    if '.git' in r or 'node_modules' in r: continue
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(r, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            orig = content
            
            def replace_btn(m):
                # Only matched the inner text part, we prepend openMpesa
                return 'onclick="openMpesa(\'500\', \'Secure M-Pesa Payment\')">' + m.group(1)
            
            content = re.sub(r'onclick="openAuth\(\)">([^<]*(?:Access|Unlock|List Property|Owner Contacts|Seller Contacts|Host Contacts|Access Homes|Access Rentals)[^<]*)</button>', replace_btn, content)
            
            if '<script src="mpesa.js"></script>' not in content:
                content = content.replace('</body>', '<script src="mpesa.js"></script>\n</body>')
                
            if content != orig:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print("Updated HTML:", file)

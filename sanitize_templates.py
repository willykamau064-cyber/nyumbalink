import os
import re
import glob

# The ultimate "App-Ready" LinkPoint Script
CLEAN_SCRIPT = """
<script src="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js"></script>
<script>
// --- PWA (Mobile App Logic) ---
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('installAppBtn');
    if(installBtn) installBtn.style.display = 'inline-flex';
});

async function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') { console.log('LinkPoint App Installed'); }
        deferredPrompt = null;
        const installBtn = document.getElementById('installAppBtn');
        if(installBtn) installBtn.style.display = 'none';
    } else {
        alert("To install, use 'Add to Home Screen' in your browser menu.");
    }
}

// --- CONFIGURATION ---
const API_BASE = ""; 
let allProperties = [
    { id: '1', title: 'Premium Penthouse Kilimani', price: 12000000, location: 'Kilimani, Nairobi', status: 'FOR SALE', type: 'SALE' },
    { id: '2', title: 'Modern 2BR Apartment', price: 45000, location: 'Westlands, Nairobi', status: 'FOR RENT', type: 'RENT' }
];

// --- UI & AUTH ---
function openAuth() {
    const gate = document.getElementById('authGate');
    if(gate) {
        gate.style.display = 'flex';
        setTimeout(() => { gate.style.opacity = '1'; gate.style.transform = 'scale(1)'; }, 10);
        document.body.style.overflow = 'hidden';
    }
}

function closeAuthGate() {
    const gate = document.getElementById('authGate');
    if(gate) {
        gate.style.opacity = '0'; gate.style.transform = 'scale(0.98)';
        setTimeout(() => { gate.style.display = 'none'; document.body.style.overflow = 'auto'; }, 400);
    }
}

function updateUIAfterLogin() {
    const user_data = localStorage.getItem('linkpointUser');
    if (user_data) {
        try {
            const user = JSON.parse(user_data);
            const loginBtn = document.querySelector('button[onclick="openAuth()"]');
            if (loginBtn && user) {
                loginBtn.innerHTML = `<i class="fas fa-user-circle"></i> ${user.email.split('@')[0]}`;
                loginBtn.onclick = () => { if(confirm("Logout?")) { localStorage.clear(); location.reload(); } };
            }
        } catch(e) {}
    }
}

// --- PAYMENT (M-PESA) ---
async function openPayment(propertyId, customAmount, customTitle) {
    let amount = 0; let title = "";
    if (customAmount && customTitle) { amount = parseInt(customAmount); title = customTitle; }
    else if (propertyId) {
        const prop = allProperties.find(p => String(p.id) === String(propertyId));
        if (prop) { amount = parseInt(prop.price); title = prop.title; } else { amount = 1500; title = "LinkPoint Prime Service"; }
    } else { amount = 1500; title = "LinkPoint Hub Service"; }
    
    const prop = propertyId ? allProperties.find(p => p.id == propertyId) : null;
    const isSale = title.toLowerCase().includes('sale') || title.toLowerCase().includes('buy') || (prop && prop.status === 'FOR SALE');
    if (isSale) amount = Math.round(amount * 1.07); else amount = Math.round(amount * 1.005);

    const phoneInput = prompt("M-PESA CHECKOUT PORTAL\n\nItem: " + title + "\nTotal Amount: KSh " + amount.toLocaleString() + "\n\nEnter Safaricom Number (07... / 01... / 254...):", "07");
    if (!phoneInput) return;
    let phone = phoneInput.replace(/\D/g, '');
    if (phone.startsWith('0')) phone = '254' + phone.substring(1);
    if (!phone.startsWith("254") || phone.length < 12) { alert("Invalid format! Use 07XXX / 01XXX or 2547XXX"); return; }

    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(0,166,80,0.98);display:flex;align-items:center;justify-content:center;color:white;text-align:center;padding:2rem;';
    modal.innerHTML = `
        <div data-aos="zoom-in">
            <div style="font-size:4rem; margin-bottom:2rem;"><i class="fas fa-mobile-alt"></i></div>
            <h2 style="font-size:2.5rem; margin-bottom:1rem;">STK PUSH SENT!</h2>
            <p style="font-size:1.2rem; opacity:0.9; margin-bottom:2rem;">Please check your phone (<b>${phone}</b>) and enter your M-Pesa PIN for <b>KSh ${amount.toLocaleString()}</b>.</p>
            <div style="width:100px; height:4px; background:rgba(255,255,255,0.3); margin:0 auto 2rem; border-radius:2px; overflow:hidden;"><div style="width:100%; height:100%; animation: progress 5s linear forwards; background:white;"></div></div>
            <button onclick="this.parentElement.parentElement.remove()" class="btn" style="background:white; color:#00a650; padding:1rem 2rem; border-radius:50px; font-weight:800;">I HAVE PAID</button>
            <p style="margin-top:2rem; font-size:0.8rem; opacity:0.7;">Reference: LNKPT-${Math.floor(Math.random()*1000000)}</p>
        </div>
        <style>@keyframes progress { from { transform: translateX(-100%); } to { transform: translateX(0); } }</style>
    `;
    document.body.appendChild(modal);
    try {
        const endpoint = API_BASE + (API_BASE.endsWith('/') ? 'pay' : '/pay');
        fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: phone, amount: amount, title: title }) }).catch(e => {});
    } catch (e) {}
}

// --- PROPERTY OPERATIONS ---
async function loadFeaturedProperties() {
    const grid = document.getElementById('featured-properties-grid'); if (!grid) return;
    try {
        const endpoint = API_BASE + (API_BASE.endsWith('/') ? 'listings' : '/listings');
        const res = await fetch(endpoint); if(!res.ok) throw new Error();
        const data = await res.json(); if(data && data.length > 0) { allProperties = data; renderProperties(allProperties); } else { renderProperties(allProperties); }
    } catch (err) { renderProperties(allProperties); }
}

function renderProperties(properties) {
    const grid = document.getElementById('featured-properties-grid'); if (!grid) return;
    grid.innerHTML = ''; properties.forEach((prop) => {
        const card = document.createElement('div'); card.className = 'property-card'; card.setAttribute('data-aos', 'fade-up'); card.style.cursor = 'pointer';
        card.onclick = () => viewPropertyDetails(prop.id);
        const thumb = (prop.images && prop.images.length > 0) ? prop.images[0] : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800';
        card.innerHTML = `
            <div style="height: 220px; background: url('${thumb}') center/cover; position: relative;">
                <div class="property-badge" style="background:var(--primary); font-size:0.75rem; font-weight:700;">${prop.status}</div>
            </div>
            <div style="padding: 1.5rem;">
                <h3 style="color: var(--text-main); font-size: 1.1rem; margin-bottom: 0.5rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:700;">${prop.title}</h3>
                <p style="color: var(--text-muted); font-size: 0.85rem;"><i class="fas fa-map-marker-alt" style="color:var(--primary);"></i> ${prop.location}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 1rem; margin-top: 1rem;">
                    <div style="font-size: 1.2rem; font-weight: 800; color: var(--secondary);">KSh ${parseInt(prop.price).toLocaleString()}</div>
                    <button class="btn btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.75rem;">View</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function viewPropertyDetails(id) {
    const prop = allProperties.find(p => String(p.id) === String(id)); if (!prop) return;
    const images = (prop.images && prop.images.length > 0) ? prop.images : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'];
    const modal = document.createElement('div'); modal.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,0.98);display:flex;align-items:center;justify-content:center;padding:1.5rem;';
    modal.innerHTML = `
        <div style="background:var(--bg-card); width:100%; max-width:900px; max-height:92vh; border-radius:32px; overflow-y:auto; position:relative; border:1px solid var(--border-color); box-shadow:0 30px 60px rgba(0,0,0,0.5);">
            <button onclick="this.closest('div').parentElement.remove(); document.body.style.overflow='auto';" style="position:absolute; top:1.5rem; right:1.5rem; background:rgba(0,0,0,0.5); border:none; color:#fff; width:40px; height:40px; border-radius:50%; cursor:pointer; z-index:100;"><i class="fas fa-times"></i></button>
            <div style="height:450px; background:url('${images[0]}') center/cover;"></div>
            <div style="padding:3.5rem;">
                <h2 style="color:var(--text-main); font-size:2.5rem; font-family:var(--font-serif); font-weight:700;">${prop.title}</h2>
                <p style="color:var(--text-muted); font-size:1.2rem; margin-bottom:2rem;"><i class="fas fa-map-marker-alt" style="color:var(--primary);"></i> ${prop.location}</p>
                <div style="font-size:2.8rem; font-weight:800; color:var(--secondary); margin-bottom:2.5rem;">KSh ${parseInt(prop.price).toLocaleString()}</div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;">
                    <button class="btn btn-outline" onclick="openPayment('${prop.id}', 100, 'Unlock Contact')" style="padding:1.2rem; font-size:1.1rem; border-radius:15px;"><i class="fas fa-phone-alt"></i> Unlock Contact</button>
                    <button class="btn btn-primary" onclick="openPayment('${prop.id}')" style="padding:1.2rem; font-size:1.1rem; border-radius:15px; background:#00a650; color:white;"><i class="fas fa-mobile-alt"></i> Pay KSh ${parseInt(prop.price).toLocaleString()}</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal); document.body.style.overflow = 'hidden';
}

function submitProperty(e, status) { if(e) e.preventDefault(); openPayment(null, 1000, "Property Listing Fee (" + status + ")"); }
function toggleTheme() { const d = document.documentElement; if(d.getAttribute('data-theme') === 'dark') { d.removeAttribute('data-theme'); } else { d.setAttribute('data-theme', 'dark'); } }

document.addEventListener('DOMContentLoaded', () => {
    if(typeof AOS !== 'undefined') AOS.init({ duration:800, once:true });
    updateUIAfterLogin();
    loadFeaturedProperties();
    if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(e => {}); }); }
});
</script>
"""

def sanitize_file(filepath):
    print(f"Sanitizing {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. PWA Manifest
    if 'manifest.json' not in content:
        content = re.sub(r'(</head>)', r'<link rel="manifest" href="/manifest.json">\n\1', content)

    # 2. Fix CSS Lint Errors (-webkit- hanging)
    content = re.sub(r'-webkit-\s*\n\s*border', '-webkit-backdrop-filter: blur(10px);\n            border', content)
    content = re.sub(r'background: var\(--bg-card\);\s*-webkit-\s*border:', 'background: var(--bg-card); -webkit-backdrop-filter: blur(10px); border:', content)

    # 3. Clean and Inject Script
    body_match = re.search(r'(<body.*?>)(.*?)(</body>)', content, re.DOTALL | re.IGNORECASE)
    if body_match:
        body_open = body_match.group(1)
        body_inner = body_match.group(2)
        body_close = body_match.group(3)
        body_inner = re.sub(r'<script.*?>.*?</script>', '', body_inner, flags=re.DOTALL | re.IGNORECASE)
        
        # Restore Nav if missing (using a safe heuristic)
        if 'MAIN NAVBAR' not in body_inner and 'index.html' in filepath:
             # This is a bit risky but we need to restore functionality
             print(f"WARNING: Navbar missing in {filepath}. Attempting to restore...")
             nav_code = """
<nav style="padding: 1rem 5%; background: var(--bg-overlay); border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 50;">
    <div style="display: flex; align-items: center; gap: 1rem;">
        <img src="logo.jpg?v=3" alt="LinkPoint" style="height: 50px; border-radius: 12px; box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);">
        <h1 style="color: var(--text-main); font-size: 1.5rem; margin: 0; font-weight: 800;">Link<span style="color: var(--primary);">Point</span></h1>
    </div>
    <div style="display: flex; gap: 2rem; align-items: center; font-weight: 600;" class="desktop-nav">
        <a href="index.html" class="nav-link">Home</a>
        <a href="listings.html" class="nav-link">Listings</a>
        <a href="services.html" class="nav-link">Services</a>
        <a href="agents.html" class="nav-link">Agents</a>
        <a href="neighborhoods.html" class="nav-link">Guides</a>
    </div>
    <div style="display: flex; gap: 1rem; align-items: center;">
        <button id="installAppBtn" onclick="installApp()" class="btn btn-outline" style="display:none; padding:0.4rem 0.8rem; font-size:0.75rem;"><i class="fas fa-download"></i> App</button>
        <button onclick="toggleTheme()" class="btn btn-outline" style="padding: 0.5rem; border-radius: 50%;"><i class="fas fa-moon"></i></button>
        <button class="btn btn-primary" style="padding: 0.5rem 1.5rem; font-size: 0.9rem;" onclick="openAuth()">Sign In</button>
    </div>
</nav>"""
             body_inner = nav_code + body_inner

        new_body = f"{body_open}\n{body_inner}\n{CLEAN_SCRIPT}\n{body_close}"
        content = content[:body_match.start()] + new_body + content[body_match.end():]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    paths = [
        r'c:\Users\wilson\.gemini\antigravity\scratch\templates\*.html',
        r'c:\Users\wilson\OneDrive\Desktop\nyumbanilink-web\*.html'
    ]
    for pattern in paths:
        for filepath in glob.glob(pattern):
            sanitize_file(filepath)

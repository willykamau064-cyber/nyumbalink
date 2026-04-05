// LinkPoint 3D Advanced Parallax Engine - v2.0 (Kinetic & Holographic)
const init3D = () => {
    // 1. INJECT ADVANCED 3D STYLES
    const style = document.createElement('style');
    style.innerHTML = `
        /* Global 3D Preparation */
        /* 3D Warp Mesh Background */
        #warp-mesh {
            position: fixed; inset: 0; z-index: -2;
            background: 
                linear-gradient(90deg, rgba(255,107,53,0.03) 1px, transparent 1px),
                linear-gradient(rgba(255,107,53,0.03) 1px, transparent 1px);
            background-size: 50px 50px;
            perspective: 1000px;
            transform-style: preserve-3d;
            pointer-events: none;
        }

        /* 3D HUD Cursor */
        #hud-cursor {
            position: fixed; top: 0; left: 0;
            width: 40px; height: 40px;
            border: 2px solid var(--primary);
            border-radius: 50%;
            pointer-events: none; z-index: 10000;
            mix-blend-mode: difference;
            transform: translate(-50%, -50%) translateZ(100px);
            transition: width 0.3s, height 0.3s, border-width 0.3s;
        }
        #hud-cursor::after {
            content: ''; position: absolute; inset: -10px;
            border: 1px solid rgba(255,107,53,0.3);
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2); opacity: 0; } }

        /* Z-Elevation Reveal */
        .reveal.visible {
            transform: translateZ(0px) rotateX(0) !important;
            opacity: 1 !important;
        }
        .reveal {
            transform: translateZ(-200px) rotateX(10deg);
            opacity: 0;
            transition: transform 1s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 1s ease;
        }

        .pc, .scard, .card, .stat-card, .stat { 
            transform-style: preserve-3d !important; 
            will-change: transform; 
            transition: box-shadow 0.4s ease, transform 0.1s ease-out !important; 
            overflow: visible !important; 
            position: relative;
        }
        .pc *, .scard *, .card *, .stat-card *, .stat * { transform-style: preserve-3d !important; pointer-events: none; }
        .pc a, .scard a, .card a, .stat-card a, .stat a { pointer-events: auto; }

        /* Multi-Layer Pop-out Depths */
        .pi, .sci { transform: translateZ(30px); transition: transform 0.4s var(--ease) !important; border-radius: 20px 20px 0 0 !important; }
        .pbadge, .scbadge { transform: translateZ(90px) translateX(10px); filter: drop-shadow(0 10px 15px rgba(0,0,0,0.5)); }
        .pbd, .scb { transform: translateZ(50px); background: rgba(15, 23, 41, 0.8) !important; backdrop-filter: blur(15px) !important; border-radius: 0 0 20px 20px !important; }
        .ppr, .sct { transform: translateZ(70px); color: var(--primary) !important; text-shadow: 0 5px 15px rgba(255,107,53,0.3); }
        .ptit, .scd, .st-label, .st-value { transform: translateZ(40px); }
        .amenity-btn, .st-icon { transform: translateZ(60px); }

        /* Holographic Scan Animation */
        @keyframes holoScan {
            0% { transform: translateY(-100%) rotateX(0deg); opacity: 0; }
            50% { opacity: 0.5; }
            100% { transform: translateY(200%) rotateX(20deg); opacity: 0; }
        }
        .h-scan {
            position: absolute; inset: 0;
            background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.2), transparent);
            height: 40%; width: 100%;
            pointer-events: none; z-index: 10;
            opacity: 0;
        }
        .pc:hover .h-scan, .scard:hover .h-scan, .stat-card:hover .h-scan {
            animation: holoScan 2s infinite linear;
        }

        /* 3D Floating Elements */
        .floater {
            position: fixed; pointer-events: none; z-index: -1;
            opacity: 0.15; filter: blur(1px);
            will-change: transform;
        }
        
        .hero { perspective: 2000px; transform-style: preserve-3d; }
        .pano-bg { transform: translateZ(-200px) scale(1.4); }
        .hc { transform: translateZ(150px); }
    `;
    document.head.appendChild(style);

    // 2. CREATE KINETIC FLOATING ELEMENTS
    const createFloaters = () => {
        const container = document.body;
        for (let i = 0; i < 12; i++) {
            const f = document.createElement('div');
            f.className = 'floater';
            const size = Math.random() * 60 + 20;
            const isCircle = Math.random() > 0.5;
            
            f.style.width = `${size}px`;
            f.style.height = `${size}px`;
            f.style.border = `2px solid ${Math.random() > 0.5 ? 'var(--primary)' : 'rgba(255,255,255,0.4)'}`;
            f.style.borderRadius = isCircle ? '50%' : '4px';
            f.style.left = `${Math.random() * 100}vw`;
            f.style.top = `${Math.random() * 100}vh`;
            f.dataset.speed = Math.random() * 0.05 + 0.01;
            f.dataset.z = Math.random() * 200 - 100;
            
            container.appendChild(f);
        }
    };
    createFloaters();

    // 3. APPLY 3D LOGIC
    function apply3D(el) {
        if(el.dataset.tiltActive) return;
        el.dataset.tiltActive = true;

        // Add Holographic Scan Line
        const scan = document.createElement('div');
        scan.className = 'h-scan';
        el.appendChild(scan);

        // Glare Effect
        let glareWrap = document.createElement('div');
        glareWrap.style.cssText = 'position:absolute;inset:0;overflow:hidden;border-radius:inherit;pointer-events:none;z-index:9;transform:translateZ(1px);';
        let glare = document.createElement('div');
        glare.style.cssText = 'position:absolute;top:50%;left:50%;width:200%;height:200%;background:radial-gradient(circle at center, rgba(255,255,255,0.4) 0%, transparent 60%);transform:translate(-50%, -50%);opacity:0;mix-blend-mode:overlay;transition:opacity 0.3s';
        glareWrap.appendChild(glare);
        el.appendChild(glareWrap);

        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -15; // Controlled tilt
            const rotateY = ((x - centerX) / centerX) * 15;
            
            el.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05) translateZ(20px)`;
            
            // Pop out internal elements further
            const img = el.querySelector('.pi, .sci');
            if(img) img.style.transform = `translateZ(60px) scale(1.1)`;
            
            const glareX = (x / rect.width) * 100;
            const glareY = (y / rect.height) * 100;
            glare.style.opacity = '1';
            glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.6) 0%, transparent 70%)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateZ(0px)';
            const img = el.querySelector('.pi, .sci');
            if(img) img.style.transform = `translateZ(30px) scale(1)`;
            glare.style.opacity = '0';
        });
    }

    // Global Mouse Tracker for Floating Elements & Hero
    window.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        // Move Floaters
        document.querySelectorAll('.floater').forEach(f => {
            const speed = parseFloat(f.dataset.speed);
            const z = parseFloat(f.dataset.z);
            const moveX = (mouseX - window.innerWidth / 2) * speed;
            const moveY = (mouseY - window.innerHeight / 2) * speed;
            f.style.transform = `translate3d(${moveX}px, ${moveY}px, ${z}px) rotate(${moveX * 0.1}deg)`;
        });

        // Hero Parallax
        const hero = document.querySelector('.hero');
        if(hero) {
            const hx = (mouseX / window.innerWidth - 0.5) * 30;
            const hy = (mouseY / window.innerHeight - 0.5) * -30;
            const hc = hero.querySelector('.hc');
            const pano = hero.querySelector('.pano-bg');
            if(hc) hc.style.transform = `translateZ(150px) rotateX(${hy}deg) rotateY(${hx}deg)`;
            if(pano) pano.style.transform = `translateZ(-200px) scale(1.4) translate(${hx * -1.5}px, ${hy * 1.5}px)`;
        }

        // Warp Mesh Distortion
        const mesh = document.getElementById('warp-mesh');
        if(mesh) {
            const mx = (mouseX / window.innerWidth - 0.5) * 50;
            const my = (mouseY / window.innerHeight - 0.5) * 50;
            mesh.style.transform = `rotateX(${my}deg) rotateY(${mx}deg) translateZ(-100px)`;
        }

        // HUD Cursor
        const cursor = document.getElementById('hud-cursor');
        if(cursor) {
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
            const dx = (mouseX - window.innerWidth/2) * 0.05;
            const dy = (mouseY - window.innerHeight/2) * 0.05;
            cursor.style.transform = `translate(-50%, -50%) translateZ(100px) rotateX(${dy}deg) rotateY(${dx}deg)`;
        }
    });

    // Create Mesh & Cursor
    if(!document.getElementById('warp-mesh')) {
        const m = document.createElement('div'); m.id = 'warp-mesh';
        document.body.prepend(m);
    }
    if(!document.getElementById('hud-cursor')) {
        const c = document.createElement('div'); c.id = 'hud-cursor';
        document.body.appendChild(c);
        window.addEventListener('mousedown', () => { c.style.width = '20px'; c.style.height = '20px'; c.style.borderWidth = '5px'; });
        window.addEventListener('mouseup', () => { c.style.width = '40px'; c.style.height = '40px'; c.style.borderWidth = '2px'; });
    }

    // Observer for dynamic content
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                    if (node.classList.contains('pc') || node.classList.contains('scard') || node.classList.contains('stat-card')) apply3D(node);
                    node.querySelectorAll('.pc, .scard, .stat-card').forEach(el => apply3D(el));
                }
            });
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    document.querySelectorAll('.pc, .scard, .card, .stat-card, .stat').forEach(el => apply3D(el));
};

init3D();

// --- API Sync (Preserve existing logic) ---
window.addEventListener('DOMContentLoaded', () => {
    const chatBtn = document.querySelector('#chat-ov .btn');
    const chatInput = document.querySelector('#chat-ov input[type="text"]');
    if(chatBtn && chatInput) {
        const sendChat = async () => {
            const msg = chatInput.value; if(!msg) return;
            const chatBox = chatInput.parentElement.previousElementSibling;
            chatBox.innerHTML += `<div style="background:var(--primary);color:#fff;padding:.8rem;border-radius:12px 12px 0 12px;align-self:flex-end;width:80%;font-size:.85rem;margin-left:auto">${msg}</div>`;
            chatInput.value = '';
            try {
                const r = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({message: msg}) });
                const res = await r.json();
                chatBox.innerHTML += `<div style="background:rgba(255,255,255,.05);color:var(--muted);padding:.8rem;border-radius:12px 12px 12px 0;width:85%;font-size:.85rem;margin-top:.5rem">${res.reply}</div>`;
                chatBox.scrollTop = chatBox.scrollHeight;
            } catch(e) { console.error('Chat API error'); }
        };
        chatBtn.onclick = sendChat;
        chatInput.onkeypress = (e) => { if(e.key === 'Enter') sendChat() };
    }
});


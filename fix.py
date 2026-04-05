import os
import codecs

content = r"""// LinkPoint 3D Advanced Parallax Engine
const init3D = () => {
    const style = document.createElement('style');
    style.innerHTML = `
        .pc, .scard, .card { transform-style: preserve-3d !important; will-change: transform; transition: box-shadow 0.3s !important; }
        .pc *, .scard *, .card * { transform-style: preserve-3d; }
        .pc:hover, .scard:hover, .card:hover { transform: none !important; box-shadow: 0 40px 80px rgba(0,0,0,0.6) !important; }
        
        .pbd { transform: translateZ(50px); padding-bottom: 2rem !important; }
        .pi { transform: translateZ(25px) scale(1.05); transform-origin: center; transition: transform 0.3s; }
        .pc:hover .pi { transform: translateZ(40px) scale(1.1); }
        .scb { transform: translateZ(50px); }
        .sci { transform: translateZ(30px) scale(1.05); }
        .scard:hover .sci { transform: translateZ(45px) scale(1.1); }
        
        .hero { perspective: 1500px; transform-style: preserve-3d; overflow: hidden; }
        .hov { transform: translateZ(-20px) scale(1.05); }
        .pano-bg { transform: translateZ(-100px) scale(1.1); }
        .hc { transform-style: preserve-3d; transition: transform 0.2s cubic-bezier(0.2,0.8,0.2,1); }
        .ht { transform: translateZ(60px); text-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .hs { transform: translateZ(40px); }
        .hb { transform: translateZ(70px); }
    `;
    document.head.appendChild(style);

    const cards = document.querySelectorAll('.pc, .scard, .card');
    cards.forEach(el => {
        let glareWrap = document.createElement('div');
        glareWrap.style.cssText = 'position:absolute;inset:0;overflow:hidden;border-radius:inherit;pointer-events:none;z-index:9;transform:translateZ(1px);transition:opacity 0.4s';
        let glare = document.createElement('div');
        glare.style.cssText = 'position:absolute;top:50%;left:50%;width:200%;height:200%;background:radial-gradient(circle at center, rgba(255,107,53,0.35) 0%, transparent 60%);transform:translate(-50%, -50%);opacity:0;pointer-events:none;mix-blend-mode:color-dodge';
        glareWrap.appendChild(glare);
        el.appendChild(glareWrap);

        el.addEventListener('mouseenter', () => {
            el.style.transition = 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            glare.style.opacity = '1';
        });

        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -18;
            const rotateY = ((x - centerX) / centerX) * 18;
            
            el.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
            
            const glareX = (x / rect.width) * 100;
            const glareY = (y / rect.height) * 100;
            glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.3) 0%, transparent 60%)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transition = 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            el.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            glare.style.opacity = '0';
            setTimeout(() => { el.style.transition = ''; }, 800);
        });
    });

    const hero = document.querySelector('.hero');
    if(hero) {
        hero.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 30;
            const y = (e.clientY / window.innerHeight - 0.5) * -30;
            const hc = hero.querySelector('.hc');
            if(hc) {
                requestAnimationFrame(() => {
                    hc.style.transform = `translateZ(80px) rotateX(${y}deg) rotateY(${x}deg)`;
                });
            }
        });
        
        hero.addEventListener('mouseleave', () => {
            const hc = hero.querySelector('.hc');
            if(hc) hc.style.transform = 'translateZ(80px) rotateX(0deg) rotateY(0deg)';
        });
    }
};

if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init3D);
} else {
    init3D();
}

// --- Full Stack Frontend API Handlers ---
window.addEventListener('DOMContentLoaded', () => {
    // 1. M-Pesa API Join
    

    // 2. Chat API Join
    const chatBtn = document.querySelector('#chat-ov .btn');
    const chatInput = document.querySelector('#chat-ov input[type="text"]');
    if(chatBtn && chatInput) {
        chatBtn.removeAttribute('onclick');
        const sendChat = async () => {
            const msg = chatInput.value;
            if(!msg) return;
            const chatBox = chatInput.parentElement.previousElementSibling;
            chatBox.innerHTML += `<div style="background:var(--primary);color:#fff;padding:.8rem;border-radius:12px 12px 0 12px;align-self:flex-end;width:80%;font-size:.85rem">${msg}</div>`;
            chatInput.value = '';
            try {
                const r = await fetch('/api/chat', { method:'POST', body: JSON.stringify({message: msg}) });
                const res = await r.json();
                chatBox.innerHTML += `<div style="background:rgba(255,255,255,.05);color:var(--muted);padding:.8rem;border-radius:12px 12px 12px 0;width:85%;font-size:.85rem;margin-top:.5rem">${res.reply}</div>`;
                chatBox.scrollTop = chatBox.scrollHeight;
            } catch(e) { console.error('API backend offline'); }
        };
        chatBtn.addEventListener('click', sendChat);
        chatInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') sendChat() });
    }

    // 3. Feedback API Join
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
"""

with codecs.open('linkpoint-3d.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Safely overwrote 3d.js with clean syntax!")

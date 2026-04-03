// LinkPoint 3D Advanced Parallax Engine
const init3D = () => {
    const style = document.createElement('style');
    style.innerHTML = `
        /* Remove overflow:hidden globally so 3D elements can actually break out of the flat layer */
        .pc, .scard, .card { transform-style: preserve-3d !important; will-change: transform; transition: box-shadow 0.3s !important; overflow: visible !important; }
        .pc *, .scard *, .card * { transform-style: preserve-3d !important; }
        
        /* Fix the rounded corners on the images independently since the parent isn't clipping them anymore */
        .sci { border-radius: 20px 20px 0 0 !important; }
        .pi { border-radius: 20px 20px 0 0 !important; }
        .scb { border-radius: 0 0 20px 20px !important; background: var(--glass) !important; backdrop-filter: blur(10px) !important; }
        .pbd { border-radius: 0 0 20px 20px !important; background: var(--glass) !important; backdrop-filter: blur(10px) !important; padding-bottom: 2rem !important; transform: translateZ(50px); }

        .pc:hover, .scard:hover, .card:hover { transform: none !important; box-shadow: 0 40px 100px rgba(0,0,0,0.8) !important; z-index: 100; }
        
        /* Extreme 3D Popouts for Images and Text! */
        .pi { transform: translateZ(40px) scale(1.05); transform-origin: center; transition: transform 0.3s cubic-bezier(0.2,0.8,0.2,1) !important; }
        .pc:hover .pi { transform: translateZ(75px) scale(1.15) !important; box-shadow: 0 20px 30px rgba(0,0,0,0.5); }
        
        .scb { transform: translateZ(60px); }
        .sci { transform: translateZ(40px) scale(1.05); transition: transform 0.3s cubic-bezier(0.2,0.8,0.2,1) !important; }
        .scard:hover .sci { transform: translateZ(80px) scale(1.15) !important; box-shadow: 0 20px 30px rgba(0,0,0,0.5); }
        
        .hero { perspective: 1200px; transform-style: preserve-3d; overflow: hidden; }
        .hov { transform: translateZ(-20px) scale(1.05); }
        .pano-bg { transform: translateZ(-150px) scale(1.2); }
        .hc { transform-style: preserve-3d; transition: transform 0.1s linear; }
        .ht { transform: translateZ(100px); text-shadow: 0 25px 40px rgba(0,0,0,0.6); }
        .hs { transform: translateZ(60px); }
        .hb { transform: translateZ(80px); }
    `;
    document.head.appendChild(style);

        // 3D Engine Observer for Dynamic Content (Supabase Live Feed)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && (node.classList.contains('pc') || node.classList.contains('scard'))) {
                    apply3D(node);
                } else if (node.nodeType === 1) {
                    node.querySelectorAll('.pc, .scard').forEach(el => apply3D(el));
                }
            });
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Extract apply3D function
    function apply3D(el) {
        if(el.dataset.tiltActive) return;
        el.dataset.tiltActive = true;
        let glareWrap = document.createElement('div');
        glareWrap.style.cssText = 'position:absolute;inset:0;overflow:hidden;border-radius:inherit;pointer-events:none;z-index:9;transform:translateZ(1px);transition:opacity 0.4s';
        let glare = document.createElement('div');
        glare.style.cssText = 'position:absolute;top:50%;left:50%;width:200%;height:200%;background:radial-gradient(circle at center, rgba(255,255,255,0.4) 0%, transparent 60%);transform:translate(-50%, -50%);opacity:0;pointer-events:none;mix-blend-mode:overlay';
        glareWrap.appendChild(glare);
        el.appendChild(glareWrap);

        el.addEventListener('mouseenter', () => {
            el.style.transition = 'transform 0.1s ease-out';
            glare.style.opacity = '1';
        });

        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -25;
            const rotateY = ((x - centerX) / centerX) * 25;
            el.style.transform = \perspective(1000px) rotateX(\deg) rotateY(\deg) scale3d(1.1, 1.1, 1.1)\;
            const glareX = (x / rect.width) * 100;
            const glareY = (y / rect.height) * 100;
            glare.style.background = \
adial-gradient(circle at \% \%, rgba(255,255,255,0.5) 0%, transparent 60%)\;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transition = 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            glare.style.opacity = '0';
        });
    }

        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Much stronger Multi-Axis Rotation
            const rotateX = ((y - centerY) / centerY) * -25;
            const rotateY = ((x - centerX) / centerX) * 25;
            
            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.1, 1.1, 1.1)`;
            
            const glareX = (x / rect.width) * 100;
            const glareY = (y / rect.height) * 100;
            glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.5) 0%, transparent 60%)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transition = 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            glare.style.opacity = '0';
            setTimeout(() => { el.style.transition = ''; }, 800);
        });
    });

    const hero = document.querySelector('.hero');
    if(hero) {
        hero.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 40;
            const y = (e.clientY / window.innerHeight - 0.5) * -40;
            const hc = hero.querySelector('.hc');
            if(hc) {
                requestAnimationFrame(() => {
                    hc.style.transform = `translateZ(100px) rotateX(${y}deg) rotateY(${x}deg)`;
                });
            }
        });
        
        hero.addEventListener('mouseleave', () => {
            const hc = hero.querySelector('.hc');
            if(hc) hc.style.transform = 'translateZ(100px) rotateX(0deg) rotateY(0deg)';
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



const fs = require('fs');
const glob = require('fs').readdirSync('.');
const files = glob.filter(f => f.endsWith('.html'));

const engineCode = 
// LinkPoint 3D Advanced Parallax Engine
const init3D = () => {
    // Inject required global 3D CSS
    const style = document.createElement('style');
    style.innerHTML = \\\
        .pc, .scard, .card { transform-style: preserve-3d !important; will-change: transform; transition: box-shadow 0.3s !important; }
        .pc *, .scard *, .card * { transform-style: preserve-3d; }
        .pc:hover, .scard:hover, .card:hover { transform: none !important; box-shadow: 0 40px 80px rgba(0,0,0,0.6) !important; }
        
        /* 3D internal components pop out */
        .pbd { transform: translateZ(50px); padding-bottom: 2rem !important; }
        .pi { transform: translateZ(25px) scale(1.05); transform-origin: center; transition: transform 0.3s; }
        .pc:hover .pi { transform: translateZ(40px) scale(1.1); }
        .scb { transform: translateZ(50px); }
        .sci { transform: translateZ(30px) scale(1.05); }
        .scard:hover .sci { transform: translateZ(45px) scale(1.1); }
        
        /* Hero 3D Parallax styling */
        .hero { perspective: 1500px; transform-style: preserve-3d; overflow: hidden; }
        .hov { transform: translateZ(-20px) scale(1.05); }
        .pano-bg { transform: translateZ(-100px) scale(1.1); }
        .hc { transform-style: preserve-3d; transition: transform 0.2s cubic-bezier(0.2,0.8,0.2,1); }
        .ht { transform: translateZ(60px); text-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .hs { transform: translateZ(40px); }
        .hb { transform: translateZ(70px); }
    \\\;
    document.head.appendChild(style);

    // Apply interactive holographic tilt to all cards
    const cards = document.querySelectorAll('.pc, .scard, .card');
    cards.forEach(el => {
        // Holographic Glare Element
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
            
            // X-Y rotations based on mouse position
            const rotateX = ((y - centerY) / centerY) * -18; // 18 degrees max tilt
            const rotateY = ((x - centerX) / centerX) * 18;
            
            el.style.transform = \\\perspective(1200px) rotateX(\\\deg) rotateY(\\\deg) scale3d(1.05, 1.05, 1.05)\\\;
            
            // Sync glare highlight inverse to mouse
            const glareX = (x / rect.width) * 100;
            const glareY = (y / rect.height) * 100;
            glare.style.background = \\\adial-gradient(circle at \\\% \\\%, rgba(255,255,255,0.3) 0%, transparent 60%)\\\;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transition = 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            el.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            glare.style.opacity = '0';
            setTimeout(() => { el.style.transition = ''; }, 800);
        });
    });

    // Highly Immersive Hero 3D Tracking
    const hero = document.querySelector('.hero');
    if(hero) {
        hero.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 30; // 15deg tilt max
            const y = (e.clientY / window.innerHeight - 0.5) * -30;
            const hc = hero.querySelector('.hc');
            if(hc) {
                requestAnimationFrame(() => {
                    hc.style.transform = \\\	ranslateZ(80px) rotateX(\\\deg) rotateY(\\\deg)\\\;
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
;

fs.writeFileSync('linkpoint-3d.js', engineCode, 'utf8');

for (let f of files) {
  let c = fs.readFileSync(f, 'utf8');
  if(!c.includes('linkpoint-3d.js')) {
    c = c.replace('</body>', '<script src="linkpoint-3d.js"></script>\\n</body>');
    if(c.charCodeAt(0) === 0xFEFF) c = c.slice(1);
    fs.writeFileSync(f, c, 'utf8');
    console.log("Injected 3D into " + f);
  }
}

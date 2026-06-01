/**
 * LinkPoint 3D Interactive UI Engine v3
 * Features: Cinematic lighting, star particles, grid, mouse parallax,
 *           three-floor exploded view, wood-slat + dark-aluminium materials,
 *           and glassmorphism hotspots.
 */

(function () {
    'use strict';

    // ── Config ──────────────────────────────────────────────────────────────
    const CONFIG = {
        containerId:  'hero-3d-canvas',
        hotspotCtnId: 'hotspot-container',
        colors: {
            primary:   0xFF6B35,
            accent:    0x10b981,
            navy:      0x080d1a,
            wallLight: 0xe8e4de,   // warm concrete
            wallDark:  0x111827,   // dark aluminium frame
            glass:     0x93c5fd,
            wood:      0x8b5a2b,   // rich teak
            roofTile:  0x1f2937,
            green:     0x059669,
            gridLine:  0x1e3050,
        }
    };

    // ── State ────────────────────────────────────────────────────────────────
    let scene, camera, renderer, clock;
    let mainGroup, houseGroup, gridHelper;
    let mouse        = { x: 0, y: 0 };
    let targetRot    = { x: 0, y: 0 };
    let hotspots     = [];
    let isInHero     = false;
    let isExploded   = false;
    let explodeProgress = 0;
    let floors       = [];   // { group, originalY, targetY }

    // ── Init ─────────────────────────────────────────────────────────────────
    function init() {
        const container = document.getElementById(CONFIG.containerId);
        if (!container || typeof THREE === 'undefined') {
            console.warn('LinkPoint 3D: missing container or Three.js');
            return;
        }

        scene = new THREE.Scene();
        scene.background = new THREE.Color(CONFIG.colors.navy);
        scene.fog = new THREE.FogExp2(CONFIG.colors.navy, 0.018);

        // Use window size — the container is position:absolute so clientWidth/Height may be 0
        const W = window.innerWidth;
        const H = window.innerHeight;

        camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 800);
        camera.position.set(2, 10, 30);  // move camera closer and center it more
        camera.lookAt(1, 2, 0);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(W, H);
        renderer.shadowMap.enabled   = true;
        renderer.shadowMap.type      = THREE.PCFSoftShadowMap;
        renderer.toneMapping         = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
        // Make the canvas fill the container absolutely
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.inset     = '0';
        renderer.domElement.style.width     = '100%';
        renderer.domElement.style.height    = '100%';
        container.appendChild(renderer.domElement);

        clock = new THREE.Clock();

        mainGroup = new THREE.Group();
        scene.add(mainGroup);

        buildLights();
        buildStarfield();
        buildPlatform();
        buildGrid();
        buildHouse();   // also calls buildTrees() internally
        buildHotspots();
        buildFireflies();

        window.addEventListener('resize', onResize);
        document.addEventListener('mousemove', onMouse);

        const hero = document.getElementById('hero-3d');
        if (hero) {
            new IntersectionObserver(([e]) => { isInHero = e.isIntersecting; }, { threshold: 0.1 }).observe(hero);
        }

        initReveal();
        initCardTilt();

        // Force matrix updates so hotspot projection is correct from frame 0
        scene.updateMatrixWorld(true);

        animate();
        console.log('✨ LinkPoint 3D Engine v3 – online');
    }

    // ── Lights ───────────────────────────────────────────────────────────────
    function buildLights() {
        scene.add(new THREE.AmbientLight(0xffffff, 0.45));

        const key = new THREE.DirectionalLight(CONFIG.colors.primary, 1.8);
        key.position.set(-18, 30, 20);
        key.castShadow = true;
        key.shadow.mapSize.set(1024, 1024);
        key.shadow.camera.left = key.shadow.camera.bottom = -20;
        key.shadow.camera.right = key.shadow.camera.top  =  20;
        key.shadow.camera.near = 1; key.shadow.camera.far = 100;
        key.shadow.bias = -0.002;
        scene.add(key);

        const fill = new THREE.DirectionalLight(0x6b8cff, 0.7);
        fill.position.set(20, 15, -10);
        scene.add(fill);

        scene.add(Object.assign(new THREE.DirectionalLight(0xffffff, 0.35), {
            position: new THREE.Vector3(0, -10, -30)
        }));

        const glow = new THREE.PointLight(CONFIG.colors.primary, 2.5, 35);
        glow.position.set(0, -1, 0);
        mainGroup.add(glow);

        const garden = new THREE.PointLight(CONFIG.colors.accent, 1.2, 20);
        garden.position.set(6, 4, 5);
        mainGroup.add(garden);
    }

    // ── Starfield ────────────────────────────────────────────────────────────
    function buildStarfield() {
        const count = 1200;
        const pos   = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i*3]   = (Math.random()-0.5)*300;
            pos[i*3+1] = (Math.random()-0.5)*200;
            pos[i*3+2] = (Math.random()-0.5)*300;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, transparent: true, opacity: 0.7 })));

        const pos2 = new Float32Array(400*3);
        for (let i = 0; i < 400; i++) {
            pos2[i*3]   = (Math.random()-0.5)*200;
            pos2[i*3+1] = Math.random()*50-10;
            pos2[i*3+2] = (Math.random()-0.5)*200;
        }
        const geo2 = new THREE.BufferGeometry();
        geo2.setAttribute('position', new THREE.BufferAttribute(pos2, 3));
        scene.add(new THREE.Points(geo2, new THREE.PointsMaterial({ color: CONFIG.colors.primary, size: 0.06, transparent: true, opacity: 0.35 })));
    }

    // ── Platform ─────────────────────────────────────────────────────────────
    function buildPlatform() {
        const slab = new THREE.Mesh(
            new THREE.BoxGeometry(28, 1.2, 32),
            new THREE.MeshStandardMaterial({ color: 0x0d1628, metalness: 0.6, roughness: 0.3 })
        );
        slab.position.y = -2.5;
        slab.receiveShadow = true;
        mainGroup.add(slab);

        const edge = new THREE.Mesh(
            new THREE.BoxGeometry(28.2, 0.14, 32.2),
            new THREE.MeshBasicMaterial({ color: CONFIG.colors.primary, transparent: true, opacity: 0.55 })
        );
        edge.position.y = -1.9;
        mainGroup.add(edge);

        const screen = new THREE.Mesh(
            new THREE.PlaneGeometry(27, 31),
            new THREE.MeshStandardMaterial({ color: 0x111f38, metalness: 0.2, roughness: 0.5, emissive: 0x0a1530, emissiveIntensity: 0.4, transparent: true, opacity: 0.85 })
        );
        screen.rotation.x = -Math.PI / 2;
        screen.position.y = -1.88;
        mainGroup.add(screen);
    }

    // ── Grid ─────────────────────────────────────────────────────────────────
    function buildGrid() {
        gridHelper = new THREE.GridHelper(28, 14, CONFIG.colors.gridLine, CONFIG.colors.gridLine);
        gridHelper.position.y = -1.87;
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.35;
        mainGroup.add(gridHelper);
    }

    // ── House ────────────────────────────────────────────────────────────────
    function buildHouse() {
        houseGroup = new THREE.Group();
        mainGroup.add(houseGroup);

        // Materials
        const wMat   = new THREE.MeshStandardMaterial({ color: CONFIG.colors.wallLight, roughness: 0.72 });
        const wDark  = new THREE.MeshStandardMaterial({ color: CONFIG.colors.wallDark,  roughness: 0.5, metalness: 0.15 });
        const gMat   = new THREE.MeshStandardMaterial({ color: CONFIG.colors.glass, transparent: true, opacity: 0.38, roughness: 0.05, metalness: 0.9 });
        const rMat   = new THREE.MeshStandardMaterial({ color: CONFIG.colors.roofTile, roughness: 0.8 });
        const woodMt = new THREE.MeshStandardMaterial({ color: CONFIG.colors.wood, roughness: 0.85 });
        const concMt = new THREE.MeshStandardMaterial({ color: 0xb0b8c8, roughness: 0.95 });
        const solarMt= new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.2, metalness: 0.8 });

        // Helper to create a mesh and add it to a group
        function mesh(geo, mat, group, px=0, py=0, pz=0) {
            const m = new THREE.Mesh(geo, mat);
            m.position.set(px, py, pz);
            m.castShadow = true;
            m.receiveShadow = true;
            group.add(m);
            return m;
        }

        // ── FLOOR 0 – Ground ─────────────────────────────────────────────
        const f0 = new THREE.Group();
        houseGroup.add(f0);
        floors.push({ group: f0, originalY: 0, targetY: 0 });

        mesh(new THREE.BoxGeometry(11, 4, 9),    wMat,   f0,  0, 2,   0);      // main body
        mesh(new THREE.BoxGeometry(6, 3.2, 0.12), gMat,  f0,  0, 2,   4.56);  // glass facade
        mesh(new THREE.BoxGeometry(0.12, 2.5, 4), gMat,  f0,  5.56, 2.2, 0);  // side window
        mesh(new THREE.BoxGeometry(0.12, 2.5, 4), gMat,  f0, -5.56, 2.2, 0);
        mesh(new THREE.BoxGeometry(1.8, 2.8, 0.14), wDark, f0, 0, 1.4, 4.57); // door
        // Steps
        for (let s = 0; s < 3; s++) {
            mesh(new THREE.BoxGeometry(3.5, 0.25, 0.7), concMt, f0, 0, -0.5 + s*0.25, 5.1 + s*0.7);
        }
        // Trees (planted in f0 so they stay grounded)
        buildTrees(f0, woodMt);

        // ── FLOOR 1 – First Floor ────────────────────────────────────────
        const f1 = new THREE.Group();
        houseGroup.add(f1);
        floors.push({ group: f1, originalY: 0, targetY: 6 });

        mesh(new THREE.BoxGeometry(7, 3.2, 8), wDark,  f1, -1.5, 5.6,  0.4);  // body
        mesh(new THREE.BoxGeometry(11.4, 0.35, 9.4), rMat, f1, 0, 4.18, 0);   // ground-floor roof slab
        // Balcony
        mesh(new THREE.BoxGeometry(7.4, 0.22, 2.8), concMt, f1, -1.5, 4.22, 5.5);
        for (let i = -3; i <= 3; i++) {
            mesh(new THREE.BoxGeometry(0.1, 1.0, 0.1), wDark, f1, -1.5 + i*0.9, 4.75, 6.8);
        }
        mesh(new THREE.BoxGeometry(7.2, 0.1, 0.1), wDark, f1, -1.5, 5.3, 6.85);
        // ✨ Wood slats (Brise de Madeira) — warm teak vertical fins
        for (let i = 0; i < 14; i++) {
            mesh(new THREE.BoxGeometry(0.12, 3.2, 0.2), woodMt, f1, -4.8 + i*0.7, 5.6, 4.41);
        }

        // ── FLOOR 2 – Penthouse ──────────────────────────────────────────
        const f2 = new THREE.Group();
        houseGroup.add(f2);
        floors.push({ group: f2, originalY: 0, targetY: 12 });

        mesh(new THREE.BoxGeometry(4, 2.2, 5), wMat,   f2,  2.8, 8.3,  -1);   // penthouse body
        mesh(new THREE.BoxGeometry(7.4, 0.35, 8.4), rMat, f2, -1.5, 7.28, 0.4); // first-floor roof
        mesh(new THREE.BoxGeometry(4.4, 0.35, 5.4), rMat, f2,  2.8, 9.5,  -1);  // penthouse roof
        mesh(new THREE.BoxGeometry(3.5, 0.15, 1.8), solarMt, f2, 2.8, 9.72, -1); // solar panels
        mesh(new THREE.BoxGeometry(0.9, 2.2, 0.9), rMat, f2,  3.5, 10.3, -2.5);  // chimney
        
        // Scale up the entire house to make it massive and prominent!
        houseGroup.scale.set(1.4, 1.4, 1.4);
        houseGroup.position.set(4, -1.5, 2); // Shift it slightly right and down to frame perfectly
    }

    // ── Trees ────────────────────────────────────────────────────────────────
    function buildTrees(parentGroup, woodMt) {
        const fol1 = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.95 });
        const fol2 = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.9 });

        function tree(px, pz, h, r, mat) {
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, h*0.55, 7), woodMt);
            trunk.position.set(px, h*0.55/2 - 1.87, pz);
            trunk.castShadow = true;
            parentGroup.add(trunk);
            for (let l = 0; l < 3; l++) {
                const cr = r * (1 - l*0.18);
                const cy = h*0.35 + l*r*0.55 - 1.87;
                const c = new THREE.Mesh(new THREE.SphereGeometry(cr, 9, 7), l===1 ? fol2 : mat);
                c.position.set(px, cy, pz);
                c.castShadow = true;
                parentGroup.add(c);
            }
        }

        tree( 8,  5, 3.5, 1.4, fol1);
        tree( 9, -2, 4.2, 1.6, fol2);
        tree(-8,  6, 3.0, 1.2, fol1);
        tree(-9, -3, 3.8, 1.4, fol2);
        tree( 5,  8, 2.5, 1.0, fol1);
    }

    // ── Hotspots ─────────────────────────────────────────────────────────────
    function buildHotspots() {
        const data = [
            { pos: {x:0,  y:5, z:5 }, icon:'🏠', title:'KES 45,000,000', sub:'Click to explore layout', action:'explode' },
            { pos: {x:-3, y:9, z:1 }, icon:'✨', title:'Smart Home',      sub:'Full automation' },
            { pos: {x:8,  y:2, z:4 }, icon:'🌿', title:'Private Garden',  sub:'0.25 acre lot' },
        ];

        const ctn = document.getElementById(CONFIG.hotspotCtnId);
        if (!ctn) return;

        data.forEach(item => {
            const el = document.createElement('div');
            el.className = 'hotspot';
            el.style.pointerEvents = 'auto';
            el.innerHTML = `${item.icon}<div class="hotspot-label"><strong>${item.title}</strong>${item.sub}</div>`;

            if (item.action === 'explode') {
                el.title = 'Click to explode / collapse floors';
                el.addEventListener('click', () => { isExploded = !isExploded; });
            }

            ctn.appendChild(el);
            hotspots.push({ el, pos: new THREE.Vector3(item.pos.x, item.pos.y, item.pos.z) });
        });
    }

    // ── Fireflies ────────────────────────────────────────────────────────────
    function buildFireflies() {
        const ctn = document.getElementById('fireflies-container');
        if (!ctn) return;
        for (let i = 0; i < 16; i++) {
            const f = document.createElement('div');
            f.className = 'firefly';
            f.style.left = Math.random()*100 + '%';
            f.style.top  = Math.random()*100 + '%';
            f.style.setProperty('--dx', (Math.random()-0.5)*240 + 'px');
            f.style.setProperty('--dy', (Math.random()-0.5)*200 + 'px');
            f.style.animationDelay    = Math.random()*18 + 's';
            f.style.animationDuration = (14 + Math.random()*10) + 's';
            f.style.opacity = (Math.random()*0.6 + 0.2).toString();
            ctn.appendChild(f);
        }
    }

    // ── Hotspot updater ───────────────────────────────────────────────────────
    function updateHotspots() {
        hotspots.forEach(h => {
            const world = h.pos.clone();
            world.applyMatrix4(mainGroup.matrixWorld);
            world.project(camera);
            const x = ( world.x*0.5 + 0.5) * renderer.domElement.clientWidth;
            const y = (-world.y*0.5 + 0.5) * renderer.domElement.clientHeight;
            h.el.style.left    = x + 'px';
            h.el.style.top     = y + 'px';
            h.el.style.display = world.z > 1 ? 'none' : 'flex';
        });
    }

    // ── Events ────────────────────────────────────────────────────────────────
    function onMouse(e) {
        if (!isInHero) return;
        mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight)  * 2 + 1;
        targetRot.x =  mouse.y * 0.12;
        targetRot.y =  mouse.x * 0.20;
    }

    function onResize() {
        const W = window.innerWidth, H = window.innerHeight;
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
        renderer.setSize(W, H);
    }

    // ── Scroll-reveal ─────────────────────────────────────────────────────────
    function initReveal() {
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
        }, { threshold: 0.1 });
        window.obs = obs;
        document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    }

    // ── 3D Card Tilt ──────────────────────────────────────────────────────────
    function initCardTilt() {
        document.querySelectorAll('[data-tilt]').forEach(wrap => {
            wrap.addEventListener('mousemove', e => {
                const r  = wrap.getBoundingClientRect();
                const rx = ((e.clientY - r.top)  / r.height - 0.5) * -16;
                const ry = ((e.clientX - r.left) / r.width  - 0.5) *  16;
                wrap.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(8px)`;
            });
            wrap.addEventListener('mouseleave', () => {
                wrap.style.transform = 'perspective(1200px) rotateX(0) rotateY(0) translateZ(0)';
            });
        });
    }

    // ── Animate ───────────────────────────────────────────────────────────────
    function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        // Parallax
        mainGroup.rotation.x += (targetRot.x - mainGroup.rotation.x) * 0.04;
        mainGroup.rotation.y += (targetRot.y - mainGroup.rotation.y) * 0.04;

        // Idle float
        mainGroup.position.y = Math.sin(t * 0.6) * 0.18;
        if (houseGroup) houseGroup.position.y = Math.sin(t * 0.9 + 1) * 0.12;

        // Exploded view animation (smooth lerp)
        const target = isExploded ? 1 : 0;
        explodeProgress += (target - explodeProgress) * 0.04;
        floors.forEach(f => {
            f.group.position.y = f.originalY + f.targetY * explodeProgress;
        });

        // Spin starfield slowly
        scene.children.forEach(c => { if (c.type === 'Points') c.rotation.y += 0.00012; });

        // Grid pulse
        if (gridHelper) gridHelper.material.opacity = 0.28 + Math.sin(t * 0.5) * 0.08;

        updateHotspots();
        renderer.render(scene, camera);
    }

    // ── Nav scroll ────────────────────────────────────────────────────────────
    if (!window._lp_navScroll) {
        window._lp_navScroll = true;
        window.addEventListener('scroll', () => {
            const nav = document.getElementById('nav');
            if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
        }, { passive: true });
    }

    // Expose explode toggle globally so HTML button can call it
    window._lp3d_explode = function() {
        isExploded = !isExploded;
        const btn = document.getElementById('explode-btn');
        if (btn) {
            btn.innerHTML = isExploded
                ? '<i class="fas fa-compress-arrows-alt"></i> Collapse View'
                : '<i class="fas fa-layer-group"></i> Explore Floor Plan';
        }
    };

    // ── Start ─────────────────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

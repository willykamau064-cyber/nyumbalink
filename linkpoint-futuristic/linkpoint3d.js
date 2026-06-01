// ====================================================
// LinkPoint Hero Cityscape Engine + Cinematic Cursor
// Powered by Three.js + GSAP ScrollTrigger
// ====================================================

(function () {
    'use strict';

    // ── Cursor ──────────────────────────────────────────
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');

    if (dot && ring) {
        let mouseX = 0, mouseY = 0;
        let ringX = 0, ringY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
        });

        function animateCursor() {
            ringX += (mouseX - ringX) * 0.12;
            ringY += (mouseY - ringY) * 0.12;
            ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Expand ring on hoverable elements
        document.querySelectorAll('a, button, .property-card, .room-btn, .hud-btn').forEach(el => {
            el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
            el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
        });
    }

    // ── Hero Canvas Setup ────────────────────────────────
    const container = document.getElementById('canvas-3d-main-container');
    if (!container) return;

    let scene, camera, renderer, clock;

    // City geometry groups
    let cityGroup, particleSystem, windowLightsGroup;

    // Mouse tracking for parallax camera shift
    let mouseNormX = 0, mouseNormY = 0;
    let smoothMouseX = 0, smoothMouseY = 0;

    document.addEventListener('mousemove', (e) => {
        // Normalize mouse to -1..1 range
        mouseNormX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseNormY = (e.clientY / window.innerHeight) * 2 - 1;
    });

    // Camera orbit state
    let orbitAngle = 0;
    const ORBIT_RADIUS = 90;
    const ORBIT_HEIGHT = 55;
    const ORBIT_SPEED = 0.08; // radians per second
    const MOUSE_SHIFT_X = 12;  // max pixels shift from mouse
    const MOUSE_SHIFT_Y = 6;

    // Camera path keyframes (position + target) for scroll-bound fly-through
    const CAM_PATH = [
        // Hero: wide aerial city view (orbit handles this when scrollProgress ≈ 0)
        { pos: { x: 0,   y: 60,  z: 100 }, look: { x: 0, y: 0, z: 0 } },
        // Dive down toward cityscape
        { pos: { x: 10,  y: 30,  z: 60  }, look: { x: 0, y: 5, z: 0 } },
        // Fly through streets level
        { pos: { x: -15, y: 8,   z: 20  }, look: { x: 0, y: 4, z: -10 } },
        // Pull up to neighborhood overview
        { pos: { x: 5,   y: 25,  z: -10 }, look: { x: 0, y: 0, z: -40 } },
        // Final resting frame
        { pos: { x: 0,   y: 50,  z: 80  }, look: { x: 0, y: 0, z: 0 } },
    ];

    // Scroll progress -> path lerp index
    let scrollProgress = 0;
    const camPos = new THREE.Vector3();
    const camLook = new THREE.Vector3();

    // ── Init ─────────────────────────────────────────────
    function init() {
        clock = new THREE.Clock();

        scene = new THREE.Scene();
        // scene.background = new THREE.Color(0x0D0D0D); // Removed to allow background image
        scene.fog = new THREE.FogExp2(0x0D0D0D, 0.006);

        // Camera
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera = new THREE.PerspectiveCamera(55, w / h, 0.5, 800);
        camera.position.set(0, ORBIT_HEIGHT, ORBIT_RADIUS);

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        renderer.shadowMap.enabled = false;
        container.appendChild(renderer.domElement);

        // Lighting
        buildLights();

        // City
        cityGroup = new THREE.Group();
        scene.add(cityGroup);
        windowLightsGroup = new THREE.Group();
        scene.add(windowLightsGroup);
        buildCity();

        // Particles
        buildParticles();

        // Ground grid
        buildGroundGrid();

        // GSAP scroll binding
        bindGSAP();

        // Window resize
        window.addEventListener('resize', onResize);

        // Render loop
        animate();

        console.log('🏙️ LinkPoint Hero Cityscape: Online');
    }

    // ── Lighting ──────────────────────────────────────────
    function buildLights() {
        // Gentle ambient
        scene.add(new THREE.AmbientLight(0xffffff, 0.04));

        // Warm directional (subtle moonlight)
        const sun = new THREE.DirectionalLight(0xFF9955, 0.25);
        sun.position.set(30, 80, 40);
        scene.add(sun);

        // Orange accent glow at city center
        const glow1 = new THREE.PointLight(0xFF6B00, 6, 140);
        glow1.position.set(0, 12, 0);
        scene.add(glow1);

        // Secondary orange for depth
        const glow1b = new THREE.PointLight(0xFF6B00, 3, 80);
        glow1b.position.set(20, 5, -20);
        scene.add(glow1b);

        // Cyan accent far
        const glow2 = new THREE.PointLight(0x00DDFF, 2, 60);
        glow2.position.set(50, 20, -40);
        scene.add(glow2);

        // Purple accent
        const glow3 = new THREE.PointLight(0x8800FF, 1.8, 55);
        glow3.position.set(-45, 15, -25);
        scene.add(glow3);

        // Ground-level orange wash
        const groundGlow = new THREE.PointLight(0xFF6B00, 2, 100);
        groundGlow.position.set(0, 1, 0);
        scene.add(groundGlow);
    }

    // ── City Builder ──────────────────────────────────────
    function buildCity() {
        const GRID_SIZE = 18;
        const BLOCK_SPACING = 6.5;
        const STREET_W = 2.5;

        // Dark building body materials
        const matPool = [
            new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.15, metalness: 0.95, emissive: 0xFF6B00, emissiveIntensity: 0.02 }),
            new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.25, metalness: 0.85, emissive: 0xFF6B00, emissiveIntensity: 0.015 }),
            new THREE.MeshStandardMaterial({ color: 0x080810, roughness: 0.1,  metalness: 0.99, emissive: 0x8800FF, emissiveIntensity: 0.015 }),
        ];

        for (let ix = -GRID_SIZE / 2; ix < GRID_SIZE / 2; ix++) {
            for (let iz = -GRID_SIZE / 2; iz < GRID_SIZE / 2; iz++) {
                const dist = Math.sqrt(ix * ix + iz * iz);
                if (dist < 1.8) continue; // leave center for landmark

                // Random building dimensions
                const w = 1.2 + Math.random() * 3;
                const h = 2 + Math.pow(Math.random(), 1.6) * 38;
                const d = 1.2 + Math.random() * 3;

                const geo = new THREE.BoxGeometry(w, h, d);
                const mat = matPool[Math.floor(Math.random() * matPool.length)];
                const mesh = new THREE.Mesh(geo, mat);

                const posX = ix * (BLOCK_SPACING + STREET_W) + (Math.random() - 0.5) * 2.5;
                const posZ = iz * (BLOCK_SPACING + STREET_W) + (Math.random() - 0.5) * 2.5;

                mesh.position.set(posX, h / 2, posZ);
                cityGroup.add(mesh);

                // ── Glowing Orange Windows ──
                // Add window rows to taller buildings
                if (h > 5) {
                    addWindowsToBuilding(posX, posZ, w, h, d);
                }

                // Neon edge wireframe on tall buildings
                if (h > 18) {
                    const edges = new THREE.EdgesGeometry(geo);
                    const edgeMat = new THREE.LineBasicMaterial({
                        color: Math.random() > 0.6 ? 0xFF6B00 : 0x00DDFF,
                        transparent: true,
                        opacity: 0.06 + Math.random() * 0.08
                    });
                    const line = new THREE.LineSegments(edges, edgeMat);
                    line.position.copy(mesh.position);
                    cityGroup.add(line);
                }

                // Rooftop orange glow beacon on some buildings
                if (Math.random() > 0.85) {
                    const beacon = new THREE.PointLight(0xFF6B00, 0.6 + Math.random() * 0.8, 15);
                    beacon.position.set(posX, h + 1.5, posZ);
                    cityGroup.add(beacon);
                }
            }
        }

        // Central landmark tower
        buildLandmark();
    }

    // ── Add Glowing Windows to a Building ─────────────────
    function addWindowsToBuilding(bx, bz, bw, bh, bd) {
        const windowMat = new THREE.MeshBasicMaterial({
            color: 0xFF6B00,
            transparent: true,
            opacity: 0.0 // will be randomized per window
        });

        const floorHeight = 2.5;
        const numFloors = Math.floor(bh / floorHeight);
        const windowSize = 0.35;
        const windowGap = 0.8;

        // Calculate number of windows per row on each face
        const numWindowsW = Math.max(1, Math.floor((bw - 0.4) / windowGap));
        const numWindowsD = Math.max(1, Math.floor((bd - 0.4) / windowGap));

        for (let floor = 0; floor < numFloors; floor++) {
            const y = floor * floorHeight + 1.5;

            // Front and back faces (along Z axis)
            for (let wi = 0; wi < numWindowsW; wi++) {
                const wx = bx - (numWindowsW - 1) * windowGap / 2 + wi * windowGap;

                // Front face
                if (Math.random() > 0.35) {
                    const winGeo = new THREE.PlaneGeometry(windowSize, windowSize * 0.7);
                    const winMat = windowMat.clone();
                    winMat.opacity = 0.25 + Math.random() * 0.65;
                    const win = new THREE.Mesh(winGeo, winMat);
                    win.position.set(wx, y, bz + bd / 2 + 0.02);
                    windowLightsGroup.add(win);
                }

                // Back face
                if (Math.random() > 0.45) {
                    const winGeo = new THREE.PlaneGeometry(windowSize, windowSize * 0.7);
                    const winMat2 = windowMat.clone();
                    winMat2.opacity = 0.2 + Math.random() * 0.55;
                    const win = new THREE.Mesh(winGeo, winMat2);
                    win.position.set(wx, y, bz - bd / 2 - 0.02);
                    win.rotation.y = Math.PI;
                    windowLightsGroup.add(win);
                }
            }

            // Left and right faces (along X axis)
            for (let wi = 0; wi < numWindowsD; wi++) {
                const wz = bz - (numWindowsD - 1) * windowGap / 2 + wi * windowGap;

                // Right face
                if (Math.random() > 0.4) {
                    const winGeo = new THREE.PlaneGeometry(windowSize, windowSize * 0.7);
                    const winMat3 = windowMat.clone();
                    winMat3.opacity = 0.2 + Math.random() * 0.6;
                    const win = new THREE.Mesh(winGeo, winMat3);
                    win.position.set(bx + bw / 2 + 0.02, y, wz);
                    win.rotation.y = Math.PI / 2;
                    windowLightsGroup.add(win);
                }

                // Left face
                if (Math.random() > 0.5) {
                    const winGeo = new THREE.PlaneGeometry(windowSize, windowSize * 0.7);
                    const winMat4 = windowMat.clone();
                    winMat4.opacity = 0.15 + Math.random() * 0.5;
                    const win = new THREE.Mesh(winGeo, winMat4);
                    win.position.set(bx - bw / 2 - 0.02, y, wz);
                    win.rotation.y = -Math.PI / 2;
                    windowLightsGroup.add(win);
                }
            }
        }
    }

    function buildLandmark() {
        // Main spire
        const spireGeo = new THREE.CylinderGeometry(0.4, 2.2, 55, 8);
        const spireMat = new THREE.MeshStandardMaterial({
            color: 0x111111, roughness: 0.05, metalness: 1.0,
            emissive: 0xFF6B00, emissiveIntensity: 0.15
        });
        const spire = new THREE.Mesh(spireGeo, spireMat);
        spire.position.set(0, 27.5, 0);
        spire.name = 'landmark_spire';
        cityGroup.add(spire);

        // Spire edges
        const spireEdges = new THREE.EdgesGeometry(spireGeo);
        const spireEdgeMat = new THREE.LineBasicMaterial({ color: 0xFF6B00, transparent: true, opacity: 0.6 });
        const spireLines = new THREE.LineSegments(spireEdges, spireEdgeMat);
        spireLines.position.set(0, 27.5, 0);
        cityGroup.add(spireLines);

        // Rotating rings around landmark
        const ringGeo = new THREE.TorusGeometry(5.5, 0.08, 8, 48);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xFF6B00, transparent: true, opacity: 0.5 });

        for (let i = 0; i < 3; i++) {
            const ring = new THREE.Mesh(ringGeo, ringMat.clone());
            ring.position.set(0, 12 + i * 12, 0);
            ring.rotation.x = (i * Math.PI) / 5;
            ring.name = 'landmark_ring_' + i;
            cityGroup.add(ring);
        }

        // Bright apex light
        const apexLight = new THREE.PointLight(0xFF6B00, 10, 80);
        apexLight.position.set(0, 57, 0);
        cityGroup.add(apexLight);

        // Additional orange glow around spire base
        const baseGlow = new THREE.PointLight(0xFF6B00, 4, 30);
        baseGlow.position.set(0, 3, 0);
        cityGroup.add(baseGlow);
    }

    // ── Particle Field ────────────────────────────────────
    function buildParticles() {
        const count = 3200;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3 + 0] = (Math.random() - 0.5) * 280;
            positions[i * 3 + 1] = Math.random() * 100;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 280;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.PointsMaterial({
            color: 0xFF6B00,
            size: 0.18,
            transparent: true,
            opacity: 0.55,
            sizeAttenuation: true
        });

        particleSystem = new THREE.Points(geo, mat);
        scene.add(particleSystem);
    }

    // ── Ground Grid ───────────────────────────────────────
    function buildGroundGrid() {
        // Street level grid
        const grid = new THREE.GridHelper(350, 70, 0xFF6B00, 0x151515);
        grid.position.y = 0.05;
        grid.material.transparent = true;
        grid.material.opacity = 0.15;
        scene.add(grid);

        // Dark ground plane
        const groundGeo = new THREE.PlaneGeometry(350, 350);
        const groundMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 1, metalness: 0 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        scene.add(ground);
    }

    // ── GSAP Scroll Binding ───────────────────────────────
    function bindGSAP() {
        if (!window.gsap || !window.ScrollTrigger) return;

        gsap.registerPlugin(ScrollTrigger);

        ScrollTrigger.create({
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 2.5,
            onUpdate: (self) => {
                scrollProgress = self.progress;
            }
        });
    }

    // ── Camera Path Interpolation ─────────────────────────
    function applyCameraPath(t) {
        const segments = CAM_PATH.length - 1;
        const scaledT = t * segments;
        const segIdx = Math.min(Math.floor(scaledT), segments - 1);
        const segT = scaledT - segIdx;

        const a = CAM_PATH[segIdx];
        const b = CAM_PATH[segIdx + 1] || a;

        // Smooth ease within segment using smoothstep
        const ease = segT * segT * (3 - 2 * segT);

        camPos.set(
            a.pos.x + (b.pos.x - a.pos.x) * ease,
            a.pos.y + (b.pos.y - a.pos.y) * ease,
            a.pos.z + (b.pos.z - a.pos.z) * ease
        );

        camLook.set(
            a.look.x + (b.look.x - a.look.x) * ease,
            a.look.y + (b.look.y - a.look.y) * ease,
            a.look.z + (b.look.z - a.look.z) * ease
        );

        camera.position.lerp(camPos, 0.035);
        camera.lookAt(camLook);
    }

    // ── Window Flicker System ─────────────────────────────
    let flickerTimer = 0;
    function flickerWindows(t) {
        // Flicker a random subset of windows every ~2 seconds
        if (t - flickerTimer > 2.0) {
            flickerTimer = t;
            const children = windowLightsGroup.children;
            const numToFlicker = Math.floor(children.length * 0.04);
            for (let i = 0; i < numToFlicker; i++) {
                const idx = Math.floor(Math.random() * children.length);
                const win = children[idx];
                if (win && win.material) {
                    // Toggle between lit and dim
                    if (win.material.opacity > 0.3) {
                        win.material.opacity = 0.05 + Math.random() * 0.1;
                    } else {
                        win.material.opacity = 0.3 + Math.random() * 0.6;
                    }
                }
            }
        }
    }

    // ── Animation Loop ────────────────────────────────────
    function animate() {
        requestAnimationFrame(animate);

        const t = clock.getElapsedTime();

        // Smooth mouse lerp for parallax
        smoothMouseX += (mouseNormX - smoothMouseX) * 0.03;
        smoothMouseY += (mouseNormY - smoothMouseY) * 0.03;

        // When near top of page (scrollProgress < 0.05), use orbit camera
        // Otherwise use scroll-driven camera path
        if (scrollProgress < 0.05) {
            // Slow orbit around city center
            orbitAngle += ORBIT_SPEED * clock.getDelta() || ORBIT_SPEED * 0.016;
            const ox = Math.sin(orbitAngle) * ORBIT_RADIUS;
            const oz = Math.cos(orbitAngle) * ORBIT_RADIUS;
            const oy = ORBIT_HEIGHT + Math.sin(t * 0.3) * 3;

            // Apply mouse parallax shift
            const targetX = ox + smoothMouseX * MOUSE_SHIFT_X;
            const targetY = oy - smoothMouseY * MOUSE_SHIFT_Y;
            const targetZ = oz;

            camera.position.lerp(
                new THREE.Vector3(targetX, targetY, targetZ),
                0.025
            );
            camera.lookAt(0, 8, 0);
        } else {
            // Apply scroll-driven camera path
            applyCameraPath(scrollProgress);
        }

        // Rotate landmark rings
        for (let i = 0; i < 3; i++) {
            const ring = cityGroup.getObjectByName('landmark_ring_' + i);
            if (ring) {
                ring.rotation.z = t * (0.3 + i * 0.15);
                ring.rotation.x = (i * Math.PI) / 5 + t * 0.1;
            }
        }

        // Slow spire breathing glow
        const spire = cityGroup.getObjectByName('landmark_spire');
        if (spire) {
            spire.material.emissiveIntensity = 0.1 + Math.sin(t * 1.5) * 0.08;
        }

        // Drift particles very slowly
        if (particleSystem) {
            particleSystem.rotation.y = t * 0.01;
            particleSystem.position.y = Math.sin(t * 0.3) * 2;
        }

        // Flicker some windows for realism
        flickerWindows(t);

        renderer.render(scene, camera);
    }

    // ── Resize ────────────────────────────────────────────
    function onResize() {
        if (!renderer || !camera) return;
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }

    // ── Boot ──────────────────────────────────────────────
    window.addEventListener('load', init);

})();

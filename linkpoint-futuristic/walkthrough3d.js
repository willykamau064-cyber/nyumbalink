// LinkPoint 3D Walkthrough Engine (Holographic Cyber-Loft)

(function() {
    'use strict';

    let scene, camera, renderer;
    let container;
    let clock;
    
    // Animation Targets for Transitions
    let camTargetPos = new THREE.Vector3(0.1, 2, 8);
    let camTargetLookAt = new THREE.Vector3(0, 1.5, 0);
    let camCurrentLookAt = new THREE.Vector3(0, 1.5, 0);
    
    // Drag & Orbit Control variables
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let cameraRotation = { yaw: 0, pitch: 0 }; // relative offsets
    
    // Room Configurations
    const ROOMS = {
        living: {
            center: new THREE.Vector3(0, 0, 0),
            camPos: new THREE.Vector3(0.1, 2.2, 7.5),
            lookAt: new THREE.Vector3(0, 1.5, 0),
            hotspots: [
                { room: 'kitchen', pos: new THREE.Vector3(-4.5, 1.2, -4.5), label: 'Walk to Kitchen' },
                { room: 'balcony', pos: new THREE.Vector3(4.5, 1.2, -3.5), label: 'Walk to Balcony' }
            ]
        },
        kitchen: {
            center: new THREE.Vector3(-18, 0, -15),
            camPos: new THREE.Vector3(-17.9, 2.2, -8.5),
            lookAt: new THREE.Vector3(-18, 1.8, -15),
            hotspots: [
                { room: 'living', pos: new THREE.Vector3(-13.5, 1.2, -10.5), label: 'Return to Living Room' }
            ]
        },
        balcony: {
            center: new THREE.Vector3(18, 1, -12),
            camPos: new THREE.Vector3(18.1, 3.2, -5.5),
            lookAt: new THREE.Vector3(18, 2.2, -18),
            hotspots: [
                { room: 'living', pos: new THREE.Vector3(13.5, 2.2, -8.5), label: 'Return to Living Room' }
            ]
        }
    };
    
    let currentRoomKey = 'living';
    let hotspotsGroup;
    let raycaster, mouse;
    let interactiveHotspots = [];
    
    // 1. Initializer
    function init() {
        container = document.getElementById('walkthrough-canvas-container');
        if (!container) return;
        
        clock = new THREE.Clock();
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();
        
        // Scene Setup
        scene = new THREE.Scene();
        // scene.background = new THREE.Color(0x060606); // Removed to allow background image
        scene.fog = new THREE.FogExp2(0x060606, 0.035);
        
        // Camera Setup
        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || 500;
        camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
        camera.position.copy(ROOMS.living.camPos);
        
        // Renderer Setup
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        container.appendChild(renderer.domElement);
        
        // Lights
        buildLights();
        
        // Cyber Infrastructure
        buildCyberInfrastructure();
        
        // Rooms
        buildLivingRoom();
        buildKitchen();
        buildBalcony();
        
        // Hotspots
        hotspotsGroup = new THREE.Group();
        scene.add(hotspotsGroup);
        spawnRoomHotspots('living');
        
        // Event Listeners
        container.addEventListener('mousedown', onMouseDown);
        container.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        container.addEventListener('touchstart', onTouchStart, { passive: true });
        container.addEventListener('touchmove', onTouchMove, { passive: true });
        window.addEventListener('touchend', onMouseUp);
        container.addEventListener('click', onClick);
        window.addEventListener('resize', onResize);
        
        // Start Render Loop
        animate();
        
        console.log('✨ LinkPoint 3D Walkthrough: Online');
    }
    
    // 2. Lighting Setup
    function buildLights() {
        scene.add(new THREE.AmbientLight(0xffffff, 0.08));
        
        // Ambient neon glows
        const orangeGlow = new THREE.PointLight(0xFF6B00, 3, 35);
        orangeGlow.position.set(0, 6, 0);
        scene.add(orangeGlow);
        
        const purpleGlow = new THREE.PointLight(0x6D00FF, 2.5, 40);
        purpleGlow.position.set(-18, 5, -15);
        scene.add(purpleGlow);
        
        const blueGlow = new THREE.PointLight(0x00FFDD, 2, 35);
        blueGlow.position.set(18, 6, -12);
        scene.add(blueGlow);
    }
    
    // 3. Cyber/Holographic Grids
    function buildCyberInfrastructure() {
        // Grid helper on floor
        const mainGrid = new THREE.GridHelper(80, 40, 0xFF6B00, 0x1f1f1f);
        mainGrid.position.y = 0.01;
        mainGrid.material.transparent = true;
        mainGrid.material.opacity = 0.12;
        scene.add(mainGrid);
    }
    
    // 4. ROOM BUILDERS (Using Stylized Neon Outlines and Furniture)
    
    // Living Room (Center: 0, 0, 0)
    function buildLivingRoom() {
        const center = ROOMS.living.center;
        
        // Room Enclosure (Wireframe Grid)
        const wallGeo = new THREE.BoxGeometry(16, 6, 16);
        const wallMat = new THREE.MeshBasicMaterial({
            color: 0x333333,
            wireframe: true,
            transparent: true,
            opacity: 0.05
        });
        const walls = new THREE.Mesh(wallGeo, wallMat);
        walls.position.copy(center).y += 3;
        scene.add(walls);
        
        // Room Border Glows
        const outlineGeo = new THREE.BoxGeometry(16.1, 0.05, 16.1);
        const outlineMat = new THREE.MeshBasicMaterial({ color: 0xFF6B00, transparent: true, opacity: 0.2 });
        const outline = new THREE.Mesh(outlineGeo, outlineMat);
        outline.position.copy(center);
        scene.add(outline);
        
        // Holographic Couch
        const couchC = new THREE.Mesh(
            new THREE.BoxGeometry(6, 0.6, 2.2),
            new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.5, metalness: 0.9 })
        );
        couchC.position.set(0, 0.3, -2);
        scene.add(couchC);
        
        // Couch Glowing Line
        const couchNeon = new THREE.Mesh(
            new THREE.BoxGeometry(6.1, 0.05, 2.3),
            new THREE.MeshBasicMaterial({ color: 0xFF6B00 })
        );
        couchNeon.position.set(0, 0.6, -2);
        scene.add(couchNeon);
        
        // Center Plasma Fireplace (Rotating cyber columns)
        const fireGeo = new THREE.CylinderGeometry(0.5, 0.5, 3, 8, 3, true);
        const fireMat = new THREE.MeshBasicMaterial({
            color: 0xFF6B00,
            wireframe: true,
            transparent: true,
            opacity: 0.5
        });
        const fireplace = new THREE.Mesh(fireGeo, fireMat);
        fireplace.position.set(0, 1.5, 2);
        fireplace.name = "plasma_core";
        scene.add(fireplace);
        
        // Plasma core point light
        const fireLight = new THREE.PointLight(0xFF6B00, 1.5, 8);
        fireLight.position.set(0, 1.5, 2);
        scene.add(fireLight);
    }
    
    // Kitchen (Center: -18, 0, -15)
    function buildKitchen() {
        const center = ROOMS.kitchen.center;
        
        // Room Enclosure
        const walls = new THREE.Mesh(
            new THREE.BoxGeometry(12, 6, 12),
            new THREE.MeshBasicMaterial({ color: 0x333333, wireframe: true, transparent: true, opacity: 0.05 })
        );
        walls.position.copy(center).y += 3;
        scene.add(walls);
        
        // Neon bottom outline
        const outline = new THREE.Mesh(
            new THREE.BoxGeometry(12.1, 0.05, 12.1),
            new THREE.MeshBasicMaterial({ color: 0x6D00FF, transparent: true, opacity: 0.25 })
        );
        outline.position.copy(center);
        scene.add(outline);
        
        // Kitchen Island
        const island = new THREE.Mesh(
            new THREE.BoxGeometry(4, 1.2, 1.8),
            new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2, metalness: 0.8 })
        );
        island.position.set(center.x, 0.6, center.z);
        scene.add(island);
        
        // Island Neon Top Rim
        const islandTop = new THREE.Mesh(
            new THREE.BoxGeometry(4.05, 0.05, 1.85),
            new THREE.MeshBasicMaterial({ color: 0x6D00FF })
        );
        islandTop.position.set(center.x, 1.2, center.z);
        scene.add(islandTop);
        
        // Floating kitchen display
        const displayGeo = new THREE.PlaneGeometry(3, 1.6);
        const displayMat = new THREE.MeshBasicMaterial({
            color: 0x6D00FF,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const display = new THREE.Mesh(displayGeo, displayMat);
        display.position.set(center.x, 2.5, center.z - 3.5);
        scene.add(display);
    }
    
    // Balcony (Center: 18, 1, -12)
    function buildBalcony() {
        const center = ROOMS.balcony.center;
        
        // Platform floor
        const deck = new THREE.Mesh(
            new THREE.BoxGeometry(14, 0.4, 10),
            new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.8 })
        );
        deck.position.copy(center).y -= 0.2;
        scene.add(deck);
        
        // Neon edge
        const outline = new THREE.Mesh(
            new THREE.BoxGeometry(14.1, 0.05, 10.1),
            new THREE.MeshBasicMaterial({ color: 0x00FFDD, transparent: true, opacity: 0.3 })
        );
        outline.position.copy(center);
        scene.add(outline);
        
        // Glass railing
        const railGeo = new THREE.BoxGeometry(14, 1.1, 0.1);
        const railMat = new THREE.MeshStandardMaterial({
            color: 0x00FFDD,
            transparent: true,
            opacity: 0.25,
            roughness: 0.1,
            metalness: 0.9
        });
        const rail = new THREE.Mesh(railGeo, railMat);
        rail.position.set(center.x, center.y + 0.55, center.z + 4.9);
        scene.add(rail);
        
        // Rail neon support bar
        const bar = new THREE.Mesh(
            new THREE.BoxGeometry(14, 0.06, 0.14),
            new THREE.MeshBasicMaterial({ color: 0x00FFDD })
        );
        bar.position.set(center.x, center.y + 1.1, center.z + 4.9);
        scene.add(bar);
        
        // Procedural wireframe city skyline in background
        const skylineGroup = new THREE.Group();
        scene.add(skylineGroup);
        
        for (let i = 0; i < 15; i++) {
            const w = 1.5 + Math.random() * 2;
            const h = 8 + Math.random() * 15;
            const d = 1.5 + Math.random() * 2;
            
            const bMat = new THREE.MeshBasicMaterial({
                color: 0x050515,
                wireframe: true,
                transparent: true,
                opacity: 0.06
            });
            const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bMat);
            b.position.set(
                center.x - 20 + i * 3.5,
                center.y - h/2 + 2,
                center.z - 25 - Math.random() * 10
            );
            skylineGroup.add(b);
        }
    }
    
    // 5. HOTSPOTS SPAWNER & INTERACTION
    function spawnRoomHotspots(roomKey) {
        // Clear previous
        interactiveHotspots.forEach(h => hotspotsGroup.remove(h));
        interactiveHotspots = [];
        
        const roomConfig = ROOMS[roomKey];
        if (!roomConfig) return;
        
        roomConfig.hotspots.forEach(item => {
            // Create a gorgeous rotating 3D Ring/Torus hotspot
            const geo = new THREE.TorusGeometry(0.24, 0.04, 8, 24);
            const mat = new THREE.MeshBasicMaterial({
                color: 0xFF6B00,
                side: THREE.DoubleSide
            });
            const torus = new THREE.Mesh(geo, mat);
            torus.position.copy(item.pos);
            torus.rotation.x = Math.PI / 2;
            
            // Add reference
            torus.userData = { roomToLoad: item.room, label: item.label };
            
            hotspotsGroup.add(torus);
            interactiveHotspots.push(torus);
        });
    }
    
    // 6. EVENT HANDLERS FOR DRAG & RAYCAST CLICKS
    
    function onMouseDown(e) {
        isDragging = true;
        previousMousePosition = {
            x: e.clientX,
            y: e.clientY
        };
    }
    
    function onMouseMove(e) {
        if (!isDragging) return;
        
        const deltaMove = {
            x: e.clientX - previousMousePosition.x,
            y: e.clientY - previousMousePosition.y
        };
        
        // Calculate Drag Yaw/Pitch angles
        cameraRotation.yaw -= deltaMove.x * 0.0035;
        cameraRotation.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, cameraRotation.pitch + deltaMove.y * 0.0035));
        
        previousMousePosition = {
            x: e.clientX,
            y: e.clientY
        };
    }
    
    function onTouchStart(e) {
        if (e.touches.length === 1) {
            isDragging = true;
            previousMousePosition = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        }
    }
    
    function onTouchMove(e) {
        if (!isDragging || e.touches.length !== 1) return;
        
        const deltaMove = {
            x: e.touches[0].clientX - previousMousePosition.x,
            y: e.touches[0].clientY - previousMousePosition.y
        };
        
        cameraRotation.yaw -= deltaMove.x * 0.0045;
        cameraRotation.pitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, cameraRotation.pitch + deltaMove.y * 0.0045));
        
        previousMousePosition = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    }
    
    function onMouseUp() {
        isDragging = false;
    }
    
    function onClick(e) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactiveHotspots);
        
        if (intersects.length > 0) {
            const hitHotspot = intersects[0].object;
            const targetRoom = hitHotspot.userData.roomToLoad;
            
            // Trigger UI button highlight in app.js
            const btns = document.querySelectorAll(".room-btn");
            btns.forEach(btn => {
                if (btn.getAttribute("data-room") === targetRoom) {
                    btn.click();
                }
            });
        }
    }
    
    function onResize() {
        if (!renderer || !camera || !container) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
    
    // 7. ANIMATION AND LERP LOOP
    function animate() {
        requestAnimationFrame(animate);
        
        const t = clock.getElapsedTime();
        
        // 7.1 Spin the rotating fire fireplace core
        const fireplace = scene.getObjectByName("plasma_core");
        if (fireplace) {
            fireplace.rotation.y = t * 0.8;
            fireplace.rotation.x = Math.sin(t * 0.4) * 0.15;
        }
        
        // 7.2 Animate interactive 3D hotspots
        interactiveHotspots.forEach((h, index) => {
            h.rotation.z = t * 1.5 + index; // spin
            h.position.y = ROOMS[currentRoomKey].hotspots[index].pos.y + Math.sin(t * 3.5 + index) * 0.08; // float
            
            // Hover scaling pulse
            h.scale.setScalar(1 + Math.sin(t * 2) * 0.08);
        });
        
        // 7.3 Smooth yaw/pitch camera look target calculations
        const lookDir = new THREE.Vector3(
            Math.sin(cameraRotation.yaw) * Math.cos(cameraRotation.pitch),
            Math.sin(cameraRotation.pitch),
            -Math.cos(cameraRotation.yaw) * Math.cos(cameraRotation.pitch)
        );
        
        // Final look target sum: center + looking offsets
        const targetFocus = new THREE.Vector3().copy(camTargetLookAt).add(lookDir.multiplyScalar(5));
        
        // Smoothly fly camera position to target room coordinates
        camera.position.lerp(camTargetPos, 0.04);
        
        // Smoothly interpolate look target vector
        camCurrentLookAt.lerp(targetFocus, 0.05);
        camera.lookAt(camCurrentLookAt);
        
        renderer.render(scene, camera);
    }
    
    // 8. GLOBAL EXPOSED WALKTHROUGH CONTROLLERS
    
    window._lp_changeWalkthroughRoom = function(roomKey) {
        const roomConfig = ROOMS[roomKey];
        if (!roomConfig) return;
        
        currentRoomKey = roomKey;
        
        // Update interpolation vector targets
        camTargetPos = roomConfig.camPos;
        camTargetLookAt = roomConfig.lookAt;
        
        // Reset rotational looking offsets
        cameraRotation.yaw = 0;
        cameraRotation.pitch = 0;
        
        // Update status UI
        document.getElementById('viewport-status-text').innerText = `Syncing coordinates to ${roomKey.toUpperCase()}...`;
        
        setTimeout(() => {
            document.getElementById('viewport-status-text').innerText = `Sector Stable · 3D Active`;
        }, 1200);
        
        // Spawn next hotspots
        spawnRoomHotspots(roomKey);
    };
    
    // Load property scan
    window._lp_loadWalkthroughProperty = function(propertyId) {
        // Here we simulate loading different mock properties.
        // We can slightly shift colors/accent tones depending on the listing for visual variety!
        const colors = {
            'cyber-loft': 0xFF6B00,  // orange
            'crystal-villa': 0x00FFDD, // aqua cyan
            'orbital-plaza': 0x6D00FF, // purple
            'smart-glass': 0xFF0055,   // hot pink
            'tek-mansion': 0x00FF66,   // neon green
            'skyline-suite': 0x3b82f6  // blue
        };
        
        const c = colors[propertyId] || 0xFF6B00;
        
        // Find existing ambient point light to change color
        scene.traverse(node => {
            if (node instanceof THREE.PointLight) {
                node.color.setHex(c);
            }
            if (node.name === "plasma_core") {
                node.material.color.setHex(c);
            }
        });
        
        // Fly camera back to living room on reload
        window._lp_changeWalkthroughRoom('living');
    };
    
    // Zoom / Reset Controls Bindings
    document.getElementById('wt-zoom-in')?.addEventListener('click', () => {
        camera.fov = Math.max(30, camera.fov - 5);
        camera.updateProjectionMatrix();
    });
    
    document.getElementById('wt-zoom-out')?.addEventListener('click', () => {
        camera.fov = Math.min(80, camera.fov + 5);
        camera.updateProjectionMatrix();
    });
    
    document.getElementById('wt-reset')?.addEventListener('click', () => {
        camera.fov = 55;
        camera.updateProjectionMatrix();
        cameraRotation.yaw = 0;
        cameraRotation.pitch = 0;
        camTargetPos.copy(ROOMS[currentRoomKey].camPos);
    });
    
    // Initialize Walkthrough Canvas on load
    window.addEventListener('load', init);

})();

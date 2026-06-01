// LinkPoint 3D Neighborhood Map Engine

(function() {
    'use strict';

    let scene, camera, renderer;
    let container;
    let clock;
    
    // Camera Orbit State
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let cameraOrbit = { radius: 18, theta: Math.PI / 4, phi: Math.PI / 3.5 };
    let targetCameraOrbit = { radius: 18, theta: Math.PI / 4, phi: Math.PI / 3.5 };
    let cameraFocusTarget = new THREE.Vector3(0, 0, 0);
    let targetCameraFocusTarget = new THREE.Vector3(0, 0, 0);
    
    // Buildings Database (Spawning Coordinates)
    const CITY_BUILDINGS = [
        { id: "cyber-loft", x: -4, z: -4, h: 5.5, label: "Cyber-Loft Tower", clickable: true },
        { id: "crystal-villa", x: -6, z: 6, h: 2.5, label: "Crystal Marina", clickable: true },
        { id: "orbital-plaza", x: 0, z: 0, h: 7.2, label: "Orbital Plaza", clickable: true },
        { id: "smart-glass", x: 6, z: -6, h: 4.8, label: "Smart Glass Suites", clickable: true },
        { id: "tek-mansion", x: 7, z: 4, h: 3.0, label: "Tek Runda Estate", clickable: true },
        { id: "skyline-suite", x: 4, z: 7, h: 5.0, label: "Skyline Mombasa", clickable: true },
        
        // Decorative/Non-clickable buildings to fill the landscape
        { id: "dec-1", x: -8, z: -8, h: 4.5, clickable: false },
        { id: "dec-2", x: -2, z: -9, h: 6.0, clickable: false },
        { id: "dec-3", x: 9, z: -2, h: 5.5, clickable: false },
        { id: "dec-4", x: -9, z: 1, h: 3.5, clickable: false },
        { id: "dec-5", x: 2, z: -5, h: 8.5, clickable: false },
        { id: "dec-6", x: -2, z: 5, h: 4.0, clickable: false },
        { id: "dec-7", x: 8, z: 8, h: 6.5, clickable: false },
        { id: "dec-8", x: -6, z: -1, h: 5.2, clickable: false },
        { id: "dec-9", x: 5, z: 1, h: 4.2, clickable: false }
    ];
    
    let buildingMeshes = [];
    let raycaster, mouse;
    let hoverObject = null;
    let scaleProgress = 0.0;
    
    // 1. Initializer
    function init() {
        container = document.getElementById('map-canvas-container');
        if (!container) return;
        
        clock = new THREE.Clock();
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();
        
        // Scene Setup
        scene = new THREE.Scene();
        // scene.background = new THREE.Color(0x060606); // Removed to allow background image
        scene.fog = new THREE.FogExp2(0x060606, 0.04);
        
        // Camera Setup
        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || 500;
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        updateCameraPosition();
        
        // Renderer Setup
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);
        
        // Lights
        buildLights();
        
        // City Grid Base
        buildCityFloor();
        
        // Spawn Buildings
        spawnBuildings();
        
        // Event Listeners
        container.addEventListener('mousedown', onMouseDown);
        container.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        container.addEventListener('touchstart', onTouchStart, { passive: true });
        container.addEventListener('touchmove', onTouchMove, { passive: true });
        window.addEventListener('touchend', onMouseUp);
        container.addEventListener('click', onClick);
        
        // Mousewheel zoom hook
        container.addEventListener('wheel', onWheel, { passive: false });
        
        window.addEventListener('resize', onResize);
        
        // Start Render Loop
        animate();
        
        console.log('✨ LinkPoint 3D Neighborhood Map: Online');
    }
    
    // 2. Lights
    function buildLights() {
        scene.add(new THREE.AmbientLight(0xffffff, 0.05));
        
        const keyLight = new THREE.DirectionalLight(0xffffff, 0.4);
        keyLight.position.set(10, 20, 15);
        scene.add(keyLight);
        
        // Neon point light guides
        const orangeGlow = new THREE.PointLight(0xFF6B00, 2.5, 30);
        orangeGlow.position.set(0, 4, 0);
        scene.add(orangeGlow);
        
        const blueGlow = new THREE.PointLight(0x6D00FF, 2, 25);
        blueGlow.position.set(5, 3, -5);
        scene.add(blueGlow);
    }
    
    // 3. City Platform
    function buildCityFloor() {
        const floorGeo = new THREE.PlaneGeometry(28, 28);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,
            roughness: 0.8,
            metalness: 0.5
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        scene.add(floor);
        
        // Sub-grids for plots
        const cityGrid = new THREE.GridHelper(26, 26, 0x333333, 0x1a1a1a);
        cityGrid.position.y = 0.02;
        cityGrid.material.transparent = true;
        cityGrid.material.opacity = 0.45;
        scene.add(cityGrid);
        
        // Glowing orange center hub
        const hubGeo = new THREE.BoxGeometry(1.2, 0.05, 1.2);
        const hubMat = new THREE.MeshBasicMaterial({ color: 0xFF6B00 });
        const hub = new THREE.Mesh(hubGeo, hubMat);
        hub.position.y = 0.03;
        scene.add(hub);
    }
    
    // 4. SPAWN DYNAMIC 3D BUILDINGS
    function spawnBuildings() {
        CITY_BUILDINGS.forEach(b => {
            const buildingGroup = new THREE.Group();
            buildingGroup.position.set(b.x, 0, b.z);
            
            // Wall body
            const bodyGeo = new THREE.BoxGeometry(1.5, b.h, 1.5);
            
            let bodyMat;
            if (b.clickable) {
                // Interactive glassmorphic building
                bodyMat = new THREE.MeshStandardMaterial({
                    color: 0x111111,
                    roughness: 0.1,
                    metalness: 0.9,
                    transparent: true,
                    opacity: 0.65,
                    emissive: 0xFF6B00,
                    emissiveIntensity: 0.05
                });
            } else {
                // Dim decorative outline building
                bodyMat = new THREE.MeshStandardMaterial({
                    color: 0x050505,
                    roughness: 0.6,
                    metalness: 0.4,
                    transparent: true,
                    opacity: 0.25,
                    emissive: 0x333333,
                    emissiveIntensity: 0.02
                });
            }
            
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.y = b.h / 2; // sit on floor
            buildingGroup.add(body);
            
            // Glowing wireframe border
            const edgesGeo = new THREE.EdgesGeometry(bodyGeo);
            const edgesMat = new THREE.LineBasicMaterial({
                color: b.clickable ? 0xFF6B00 : 0x444444,
                transparent: true,
                opacity: b.clickable ? 0.6 : 0.2
            });
            const wireframe = new THREE.LineSegments(edgesGeo, edgesMat);
            wireframe.position.y = b.h / 2;
            buildingGroup.add(wireframe);
            
            // If clickable, add a floating holographic locator marker above
            if (b.clickable) {
                const markerGeo = new THREE.SphereGeometry(0.15, 8, 8);
                const markerMat = new THREE.MeshBasicMaterial({ color: 0xFF9E00 });
                const marker = new THREE.Mesh(markerGeo, markerMat);
                marker.position.y = b.h + 0.6;
                marker.name = "hover_pin";
                buildingGroup.add(marker);
                
                // Keep references for clicking/hovering
                body.userData = { propertyId: b.id, height: b.h, label: b.label, group: buildingGroup };
                buildingMeshes.push(body);
            }
            
            // Set initial scale to Y=0 for rise animation
            buildingGroup.scale.set(1, 0.01, 1);
            scene.add(buildingGroup);
            b.meshGroup = buildingGroup; // bind
        });
    }
    
    // 5. MOUSE AND TOUCH EVENT BINDINGS
    
    function onMouseDown(e) {
        isDragging = true;
        previousMousePosition = {
            x: e.clientX,
            y: e.clientY
        };
    }
    
    function onMouseMove(e) {
        // 5.1 Drag Orbit Calculation
        if (isDragging) {
            const deltaMove = {
                x: e.clientX - previousMousePosition.x,
                y: e.clientY - previousMousePosition.y
            };
            
            targetCameraOrbit.theta -= deltaMove.x * 0.006;
            targetCameraOrbit.phi = Math.max(0.1, Math.min(Math.PI / 2.1, targetCameraOrbit.phi + deltaMove.y * 0.006));
            
            previousMousePosition = {
                x: e.clientX,
                y: e.clientY
            };
            return;
        }
        
        // 5.2 Hover Raycasting
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(buildingMeshes);
        
        if (intersects.length > 0) {
            const hitObj = intersects[0].object;
            
            if (hoverObject !== hitObj) {
                // Reset previous
                resetHover();
                
                // Apply hover glow
                hoverObject = hitObj;
                document.body.style.cursor = 'pointer';
                hoverObject.material.emissiveIntensity = 0.5;
                
                // Pulse the hovering pin inside building group
                const pin = hoverObject.userData.group.getObjectByName("hover_pin");
                if (pin) pin.scale.setScalar(1.5);
            }
        } else {
            resetHover();
        }
    }
    
    function resetHover() {
        if (hoverObject) {
            hoverObject.material.emissiveIntensity = 0.05;
            const pin = hoverObject.userData.group.getObjectByName("hover_pin");
            if (pin) pin.scale.setScalar(1.0);
            hoverObject = null;
            document.body.style.cursor = 'default';
        }
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
        
        targetCameraOrbit.theta -= deltaMove.x * 0.007;
        targetCameraOrbit.phi = Math.max(0.1, Math.min(Math.PI / 2.1, targetCameraOrbit.phi + deltaMove.y * 0.007));
        
        previousMousePosition = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    }
    
    function onMouseUp() {
        isDragging = false;
    }
    
    function onWheel(e) {
        e.preventDefault();
        targetCameraOrbit.radius = Math.max(8, Math.min(30, targetCameraOrbit.radius + e.deltaY * 0.015));
    }
    
    function onClick(e) {
        // Only trigger clicks when not dragging
        if (isDragging) return;
        
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(buildingMeshes);
        
        if (intersects.length > 0) {
            const hitObj = intersects[0].object;
            const pId = hitObj.userData.propertyId;
            
            // Animate camera target directly over the building
            const groupPos = hitObj.userData.group.position;
            targetCameraFocusTarget.set(groupPos.x, hitObj.userData.height / 2, groupPos.z);
            targetCameraOrbit.radius = 10; // zoom in closer
            
            // Fire global highlight function in app.js
            if (window._lp_selectPropertyFromMap) {
                window._lp_selectPropertyFromMap(pId);
            }
        } else {
            // Clicked empty space: reset focus target back to center
            targetCameraFocusTarget.set(0, 0, 0);
            targetCameraOrbit.radius = 18;
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
    
    // 6. UPDATE CAMERA POSITION BINDINGS
    function updateCameraPosition() {
        // Calculate coordinates spherical -> Cartesian coordinates
        const x = cameraFocusTarget.x + cameraOrbit.radius * Math.sin(cameraOrbit.phi) * Math.sin(cameraOrbit.theta);
        const y = cameraFocusTarget.y + cameraOrbit.radius * Math.cos(cameraOrbit.phi);
        const z = cameraFocusTarget.z + cameraOrbit.radius * Math.sin(cameraOrbit.phi) * Math.cos(cameraOrbit.theta);
        
        camera.position.set(x, y, z);
        camera.lookAt(cameraFocusTarget);
    }
    
    // 7. DYNAMIC ANIMATE LOOP
    function animate() {
        requestAnimationFrame(animate);
        
        const t = clock.getElapsedTime();
        
        // 7.1 Rise scale animation for buildings on load
        if (scaleProgress < 1.0) {
            scaleProgress += 0.02;
            CITY_BUILDINGS.forEach(b => {
                if (b.meshGroup) {
                    // Smooth bounce scale
                    const sY = Math.min(1.0, scaleProgress * 1.1);
                    b.meshGroup.scale.set(1, sY, 1);
                }
            });
        }
        
        // 7.2 Smooth LERP camera movement calculations
        cameraOrbit.radius += (targetCameraOrbit.radius - cameraOrbit.radius) * 0.08;
        cameraOrbit.theta += (targetCameraOrbit.theta - cameraOrbit.theta) * 0.08;
        cameraOrbit.phi += (targetCameraOrbit.phi - cameraOrbit.phi) * 0.08;
        
        cameraFocusTarget.lerp(targetCameraFocusTarget, 0.08);
        updateCameraPosition();
        
        // 7.3 Float and rotate pins above buildings
        buildingMeshes.forEach(b => {
            const pin = b.userData.group.getObjectByName("hover_pin");
            if (pin) {
                pin.position.y = b.userData.height + 0.6 + Math.sin(t * 3.5 + b.position.x) * 0.08;
                pin.rotation.y = t * 1.2;
            }
        });
        
        renderer.render(scene, camera);
    }
    
    // Initialize Map Canvas on load
    window.addEventListener('load', init);

})();

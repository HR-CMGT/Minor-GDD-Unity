// ==========================================
// CLASS 6 INTERACTIVE SIMULATORS
// Modern Unity 6: 3D Prototyping, Kinematics & AI Navigation
// ==========================================

// --------------------------------------------------
// 1. Jump Arc & Metric Clearance Sandbox (Slide 5)
// --------------------------------------------------
let jumpSimState = {
    jumpHeight: 2.0,      // meters
    gravity: 20.0,        // m/s^2 (game physics)
    moveSpeed: 6.0,       // m/s
    wallHeight: 1.5,      // meters
    wallDistance: 3.0,    // meters from launch
    gapWidth: 4.0,        // meters pit width
    wallEnabled: true,
    gapEnabled: true,
    isJumping: false,
    animTime: 0,
    animRaf: null,
    playerX: 0,
    playerY: 0
};

let jump3d = {
    renderer: null,
    scene: null,
    camera: null,
    controls: null,
    playerMesh: null,
    wallMesh: null,
    gapMesh: null,
    trajLine: null,
    apexMarker: null,
    animRaf: null,
    initialized: false
};

function initJumpSandbox() {
    init3dJumpSandbox();
    updateJumpTelemetry();
    update3dJumpGeometry();
}

function init3dJumpSandbox() {
    const container = document.getElementById('sim3dJumpContainer');
    if (!container || typeof THREE === 'undefined') return;

    const w = container.clientWidth || 480;
    const h = container.clientHeight || 260;

    if (!jump3d.initialized || !jump3d.renderer) {
        jump3d.scene = new THREE.Scene();
        jump3d.scene.background = new THREE.Color(0x050b14);

        jump3d.camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
        jump3d.camera.position.set(4.5, 3.8, 8.5);

        jump3d.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        jump3d.renderer.setSize(w, h);
        jump3d.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        container.innerHTML = '';
        container.appendChild(jump3d.renderer.domElement);

        if (typeof THREE.OrbitControls !== 'undefined') {
            jump3d.controls = new THREE.OrbitControls(jump3d.camera, jump3d.renderer.domElement);
            jump3d.controls.target.set(3.5, 1.2, 0);
            jump3d.controls.enableDamping = true;
            jump3d.controls.dampingFactor = 0.08;
            jump3d.controls.maxPolarAngle = Math.PI / 2 + 0.05;
        }

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        jump3d.scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
        dirLight.position.set(6, 12, 8);
        jump3d.scene.add(dirLight);

        // 3D Metric Grid (12m x 6m)
        const gridHelper = new THREE.GridHelper(14, 14, 0x0284c7, 0x1e293b);
        gridHelper.position.set(5, 0, 0);
        jump3d.scene.add(gridHelper);

        // Ground platform (Launch)
        const launchGeo = new THREE.BoxGeometry(2, 0.4, 3.6);
        const launchMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.2 });
        const launchMesh = new THREE.Mesh(launchGeo, launchMat);
        launchMesh.position.set(-1, -0.2, 0);
        jump3d.scene.add(launchMesh);

        // Landing platform
        const landGeo = new THREE.BoxGeometry(10, 0.4, 3.6);
        const landMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
        const landMesh = new THREE.Mesh(landGeo, landMat);
        landMesh.position.set(9, -0.2, 0);
        jump3d.scene.add(landMesh);

        // Gap Hazard Lines
        const gapGeo = new THREE.PlaneGeometry(4, 3.6);
        gapGeo.rotateX(-Math.PI / 2);
        const gapMat = new THREE.MeshBasicMaterial({ color: 0x7f1d1d, transparent: true, opacity: 0.35 });
        jump3d.gapMesh = new THREE.Mesh(gapGeo, gapMat);
        jump3d.gapMesh.position.set(2, 0.01, 0);
        jump3d.scene.add(jump3d.gapMesh);

        // Wall Obstacle Mesh
        const wallGeo = new THREE.BoxGeometry(0.3, 1.5, 3.2);
        const wallMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
        jump3d.wallMesh = new THREE.Mesh(wallGeo, wallMat);
        jump3d.wallMesh.position.set(jumpSimState.wallDistance, 0.75, 0);
        jump3d.scene.add(jump3d.wallMesh);

        // Character Capsule Mesh (height 1.8m, radius 0.35m)
        const capGroup = new THREE.Group();
        const capBodyGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.1, 16);
        const capTopGeo = new THREE.SphereGeometry(0.35, 16, 8);
        const capMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.1 });
        const bodyMesh = new THREE.Mesh(capBodyGeo, capMat);
        bodyMesh.position.y = 0.9;
        const topMesh = new THREE.Mesh(capTopGeo, capMat);
        topMesh.position.y = 1.45;
        const botMesh = new THREE.Mesh(capTopGeo, capMat);
        botMesh.position.y = 0.35;
        
        // Visor
        const visorGeo = new THREE.BoxGeometry(0.25, 0.15, 0.2);
        const visorMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const visorMesh = new THREE.Mesh(visorGeo, visorMat);
        visorMesh.position.set(0.28, 1.45, 0);
        
        capGroup.add(bodyMesh);
        capGroup.add(topMesh);
        capGroup.add(botMesh);
        capGroup.add(visorMesh);
        jump3d.playerMesh = capGroup;
        jump3d.playerMesh.position.set(0, 0, 0);
        jump3d.scene.add(jump3d.playerMesh);

        // Apex Indicator Sphere
        const apexGeo = new THREE.SphereGeometry(0.12, 12, 12);
        const apexMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        jump3d.apexMarker = new THREE.Mesh(apexGeo, apexMat);
        jump3d.scene.add(jump3d.apexMarker);

        // Trajectory Line
        const trajMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 3 });
        const trajGeo = new THREE.BufferGeometry();
        jump3d.trajLine = new THREE.Line(trajGeo, trajMat);
        jump3d.scene.add(jump3d.trajLine);

        jump3d.initialized = true;

        if (jump3d.animRaf) cancelAnimationFrame(jump3d.animRaf);
        const animate3d = () => {
            jump3d.animRaf = requestAnimationFrame(animate3d);
            if (jump3d.controls) jump3d.controls.update();
            if (jump3d.renderer && jump3d.scene && jump3d.camera) {
                jump3d.renderer.render(jump3d.scene, jump3d.camera);
            }
        };
        animate3d();
    } else {
        if (!container.contains(jump3d.renderer.domElement)) {
            container.innerHTML = '';
            container.appendChild(jump3d.renderer.domElement);
        }
        jump3d.renderer.setSize(w, h);
        jump3d.camera.aspect = w / h;
        jump3d.camera.updateProjectionMatrix();
    }

    update3dJumpGeometry();
}

function update3dJumpGeometry() {
    if (!jump3d.initialized || !jump3d.scene) return;

    // Update Wall
    if (jump3d.wallMesh) {
        jump3d.wallMesh.visible = jumpSimState.wallEnabled;
        jump3d.wallMesh.scale.set(1, jumpSimState.wallHeight / 1.5, 1);
        jump3d.wallMesh.position.set(jumpSimState.wallDistance, jumpSimState.wallHeight / 2, 0);
    }

    // Update Gap Hazard
    if (jump3d.gapMesh) {
        jump3d.gapMesh.visible = jumpSimState.gapEnabled;
        jump3d.gapMesh.scale.set(jumpSimState.gapWidth / 4.0, 1, 1);
        jump3d.gapMesh.position.set(jumpSimState.gapWidth / 2, 0.01, 0);
    }

    // Update Trajectory Arc
    const phys = calcJumpPhysics();
    const points = [];
    const steps = 50;
    for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * phys.tTotal;
        const x = phys.vx * t;
        const y = Math.max(0, (phys.vy0 * t) - (0.5 * phys.g * t * t));
        points.push(new THREE.Vector3(x, y, 0));
    }
    jump3d.trajLine.geometry.setFromPoints(points);

    // Apex marker
    const apexX = phys.vx * phys.tApex;
    const apexY = phys.h;
    jump3d.apexMarker.position.set(apexX, apexY, 0);

    // Update player position
    if (jump3d.playerMesh && !jumpSimState.isJumping) {
        jump3d.playerMesh.position.set(jumpSimState.playerX, jumpSimState.playerY, 0);
    }
}

function updateJumpParam(param, val) {
    const num = parseFloat(val);
    if (isNaN(num)) return;
    jumpSimState[param] = num;
    
    const labelMap = {
        jumpHeight: { id: 'jumpHeightVal', suffix: ' m' },
        gravity: { id: 'jumpGravityVal', suffix: ' m/s²' },
        moveSpeed: { id: 'jumpSpeedVal', suffix: ' m/s' },
        wallHeight: { id: 'jumpWallHeightVal', suffix: ' m' },
        wallDistance: { id: 'jumpWallDistVal', suffix: ' m' },
        gapWidth: { id: 'jumpGapWidthVal', suffix: ' m' }
    };
    
    if (labelMap[param]) {
        const el = document.getElementById(labelMap[param].id);
        if (el) el.textContent = num.toFixed(1) + labelMap[param].suffix;
    }
    
    updateJumpTelemetry();
    update3dJumpGeometry();
}

function setJumpPreset(preset) {
    if (preset === 'realistic') {
        updateJumpParam('jumpHeight', 1.0);
        updateJumpParam('gravity', 9.8);
        updateJumpParam('moveSpeed', 4.5);
    } else if (preset === 'platformer') {
        updateJumpParam('jumpHeight', 2.0);
        updateJumpParam('gravity', 20.0);
        updateJumpParam('moveSpeed', 6.0);
    } else if (preset === 'lowgrav') {
        updateJumpParam('jumpHeight', 3.5);
        updateJumpParam('gravity', 8.0);
        updateJumpParam('moveSpeed', 5.0);
    }
    
    const hSlider = document.getElementById('sliderJumpHeight');
    const gSlider = document.getElementById('sliderJumpGravity');
    const sSlider = document.getElementById('sliderJumpSpeed');
    if (hSlider) hSlider.value = jumpSimState.jumpHeight;
    if (gSlider) gSlider.value = jumpSimState.gravity;
    if (sSlider) sSlider.value = jumpSimState.moveSpeed;
    
    updateJumpTelemetry();
    update3dJumpGeometry();
}

function toggleJumpObstacle(type) {
    if (type === 'wall') {
        jumpSimState.wallEnabled = !jumpSimState.wallEnabled;
        const btn = document.getElementById('btnToggleWall');
        if (btn) {
            btn.style.background = jumpSimState.wallEnabled ? '#0369a1' : '#334155';
            btn.textContent = jumpSimState.wallEnabled ? 'Wall: ON' : 'Wall: OFF';
        }
    } else if (type === 'gap') {
        jumpSimState.gapEnabled = !jumpSimState.gapEnabled;
        const btn = document.getElementById('btnToggleGap');
        if (btn) {
            btn.style.background = jumpSimState.gapEnabled ? '#0369a1' : '#334155';
            btn.textContent = jumpSimState.gapEnabled ? 'Pit: ON' : 'Pit: OFF';
        }
    }
    updateJumpTelemetry();
    update3dJumpGeometry();
}

function calcJumpPhysics() {
    const h = Math.max(0.1, jumpSimState.jumpHeight);
    const g = Math.max(1.0, jumpSimState.gravity);
    const vx = Math.max(0.1, jumpSimState.moveSpeed);
    
    const vy0 = Math.sqrt(2 * g * h);
    const tApex = vy0 / g;
    const tTotal = 2 * tApex;
    const maxDist = vx * tTotal;
    
    return { vy0, tApex, tTotal, maxDist, h, g, vx };
}

function updateJumpTelemetry() {
    const phys = calcJumpPhysics();
    
    const elVy = document.getElementById('telemetryVy');
    const elTapex = document.getElementById('telemetryTapex');
    const elThang = document.getElementById('telemetryThang');
    const elMaxDist = document.getElementById('telemetryMaxDist');
    const elStatus = document.getElementById('telemetryClearanceStatus');
    
    if (elVy) elVy.textContent = phys.vy0.toFixed(2) + ' m/s';
    if (elTapex) elTapex.textContent = phys.tApex.toFixed(2) + ' s';
    if (elThang) elThang.textContent = phys.tTotal.toFixed(2) + ' s';
    if (elMaxDist) elMaxDist.textContent = phys.maxDist.toFixed(2) + ' m';
    
    if (elStatus) {
        let wallPass = true;
        let gapPass = true;
        let reasons = [];
        
        if (jumpSimState.wallEnabled) {
            const tWall = jumpSimState.wallDistance / phys.vx;
            if (tWall <= phys.tTotal) {
                const yWall = (phys.vy0 * tWall) - (0.5 * phys.g * tWall * tWall);
                if (yWall < jumpSimState.wallHeight) {
                    wallPass = false;
                    reasons.push('Hits wall (trajectory ' + yWall.toFixed(2) + 'm < wall ' + jumpSimState.wallHeight.toFixed(2) + 'm)');
                } else {
                    reasons.push('Clears wall (+' + (yWall - jumpSimState.wallHeight).toFixed(2) + 'm margin)');
                }
            } else {
                wallPass = false;
                reasons.push('Lands before reaching wall');
            }
        }
        
        if (jumpSimState.gapEnabled) {
            if (phys.maxDist < jumpSimState.gapWidth) {
                gapPass = false;
                reasons.push('Falls in pit (short by ' + (jumpSimState.gapWidth - phys.maxDist).toFixed(2) + 'm)');
            } else {
                reasons.push('Clears pit (+' + (phys.maxDist - jumpSimState.gapWidth).toFixed(2) + 'm margin)');
            }
        }
        
        if (wallPass && gapPass) {
            elStatus.style.background = '#064e3b';
            elStatus.style.borderColor = '#10b981';
            elStatus.style.color = '#a7f3d0';
            elStatus.innerHTML = '<strong>STATUS: PASS</strong> - ' + (reasons.length > 0 ? reasons.join(' | ') : 'Clear terrain trajectory');
        } else {
            elStatus.style.background = '#7f1d1d';
            elStatus.style.borderColor = '#ef4444';
            elStatus.style.color = '#fecaca';
            elStatus.innerHTML = '<strong>STATUS: FAIL</strong> - ' + reasons.join(' | ');
        }
    }
}

function launchJumpSimulation() {
    if (jumpSimState.isJumping) return;
    jumpSimState.isJumping = true;
    jumpSimState.animTime = 0;
    
    const phys = calcJumpPhysics();
    const startTime = performance.now();
    
    const animate = (currentTime) => {
        const elapsed = (currentTime - startTime) / 1000;
        jumpSimState.animTime = elapsed;
        
        const t = Math.min(elapsed, phys.tTotal);
        const x = phys.vx * t;
        const y = Math.max(0, (phys.vy0 * t) - (0.5 * phys.g * t * t));
        
        jumpSimState.playerX = x;
        jumpSimState.playerY = y;
        
        if (jump3d.playerMesh) {
            jump3d.playerMesh.position.set(x, y, 0);
        }
        
        if (elapsed < phys.tTotal) {
            jumpSimState.animRaf = requestAnimationFrame(animate);
        } else {
            jumpSimState.isJumping = false;
            jumpSimState.playerX = phys.maxDist;
            jumpSimState.playerY = 0;
            if (jump3d.playerMesh) {
                jump3d.playerMesh.position.set(phys.maxDist, 0, 0);
            }
        }
    };
    
    jumpSimState.animRaf = requestAnimationFrame(animate);
}

function resetJumpSimulation() {
    if (jumpSimState.animRaf) {
        cancelAnimationFrame(jumpSimState.animRaf);
    }
    jumpSimState.isJumping = false;
    jumpSimState.animTime = 0;
    jumpSimState.playerX = 0;
    jumpSimState.playerY = 0;
    if (jump3d.playerMesh) {
        jump3d.playerMesh.position.set(0, 0, 0);
    }
}


// --------------------------------------------------
// 2. Camera-Relative Vector Math Inspector (Slide 9)
// --------------------------------------------------
let camVecState = {
    camYaw: 45,           // degrees
    inputX: 0,            // -1 to 1 (A/D)
    inputY: 1,            // -1 to 1 (W/S)
    flattenY: true
};

let camVec3d = {
    renderer: null,
    scene: null,
    camera: null,
    controls: null,
    camProxy: null,
    arrowFwd: null,
    arrowRight: null,
    arrowMove: null,
    playerMesh: null,
    animRaf: null,
    initialized: false
};

function initCamVecInspector() {
    init3dCamVecInspector();
    update3dCamVec();
}

function init3dCamVecInspector() {
    const container = document.getElementById('sim3dCamVecContainer');
    if (!container || typeof THREE === 'undefined') return;

    const w = container.clientWidth || 480;
    const h = container.clientHeight || 260;

    if (!camVec3d.initialized || !camVec3d.renderer) {
        camVec3d.scene = new THREE.Scene();
        camVec3d.scene.background = new THREE.Color(0x050b14);

        camVec3d.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
        camVec3d.camera.position.set(0, 6.0, 7.0);

        camVec3d.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        camVec3d.renderer.setSize(w, h);
        camVec3d.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        container.innerHTML = '';
        container.appendChild(camVec3d.renderer.domElement);

        if (typeof THREE.OrbitControls !== 'undefined') {
            camVec3d.controls = new THREE.OrbitControls(camVec3d.camera, camVec3d.renderer.domElement);
            camVec3d.controls.target.set(0, 0.6, 0);
            camVec3d.controls.enableDamping = true;
            camVec3d.controls.dampingFactor = 0.08;
        }

        // Lights
        const amb = new THREE.AmbientLight(0xffffff, 0.8);
        camVec3d.scene.add(amb);
        const dir = new THREE.DirectionalLight(0x38bdf8, 1.3);
        dir.position.set(5, 12, 6);
        camVec3d.scene.add(dir);

        // Ground Compass & Grid
        const grid = new THREE.GridHelper(8, 8, 0x0284c7, 0x1e293b);
        camVec3d.scene.add(grid);

        // Compass Ring
        const ringGeo = new THREE.RingGeometry(3.15, 3.25, 32);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x334155, side: THREE.DoubleSide });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.y = 0.01;
        camVec3d.scene.add(ringMesh);

        // Character Mesh in Center
        const charGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 16);
        const charMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 });
        camVec3d.playerMesh = new THREE.Mesh(charGeo, charMat);
        camVec3d.playerMesh.position.set(0, 0.6, 0);
        camVec3d.scene.add(camVec3d.playerMesh);

        // Camera Proxy Indicator (Box + Lens Cone)
        const camGroup = new THREE.Group();
        const camBoxGeo = new THREE.BoxGeometry(0.4, 0.3, 0.5);
        const camBoxMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8 });
        const camBox = new THREE.Mesh(camBoxGeo, camBoxMat);
        const camLensGeo = new THREE.ConeGeometry(0.2, 0.3, 12);
        camLensGeo.rotateX(Math.PI / 2);
        const camLensMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
        const camLens = new THREE.Mesh(camLensGeo, camLensMat);
        camLens.position.z = 0.35;
        camGroup.add(camBox);
        camGroup.add(camLens);
        camVec3d.camProxy = camGroup;
        camVec3d.scene.add(camVec3d.camProxy);

        // Vector Arrows
        const origin = new THREE.Vector3(0, 0.1, 0);
        camVec3d.arrowFwd = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), origin, 2.2, 0x38bdf8, 0.4, 0.2);
        camVec3d.arrowRight = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, 1.8, 0xfb923c, 0.35, 0.18);
        camVec3d.arrowMove = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), origin, 2.5, 0x10b981, 0.5, 0.25);
        
        camVec3d.scene.add(camVec3d.arrowFwd);
        camVec3d.scene.add(camVec3d.arrowRight);
        camVec3d.scene.add(camVec3d.arrowMove);

        camVec3d.initialized = true;

        if (camVec3d.animRaf) cancelAnimationFrame(camVec3d.animRaf);
        const animate3d = () => {
            camVec3d.animRaf = requestAnimationFrame(animate3d);
            if (camVec3d.controls) camVec3d.controls.update();
            if (camVec3d.renderer && camVec3d.scene && camVec3d.camera) {
                camVec3d.renderer.render(camVec3d.scene, camVec3d.camera);
            }
        };
        animate3d();
    } else {
        if (!container.contains(camVec3d.renderer.domElement)) {
            container.innerHTML = '';
            container.appendChild(camVec3d.renderer.domElement);
        }
        camVec3d.renderer.setSize(w, h);
        camVec3d.camera.aspect = w / h;
        camVec3d.camera.updateProjectionMatrix();
    }

    update3dCamVec();
}

function update3dCamVec() {
    if (!camVec3d.initialized || !camVec3d.scene) return;

    const yawRad = (camVecState.camYaw * Math.PI) / 180;
    const fwdX = Math.sin(yawRad);
    const fwdZ = Math.cos(yawRad);

    const rightX = Math.cos(yawRad);
    const rightZ = -Math.sin(yawRad);

    // Camera proxy position & pitch
    const camDist = 3.2;
    const camHeight = 1.6;
    camVec3d.camProxy.position.set(-fwdX * camDist, camHeight, -fwdZ * camDist);
    camVec3d.camProxy.lookAt(0, 0.6, 0);

    // Camera Forward & Right Arrows
    let fwdVecY = 0;
    if (!camVecState.flattenY) {
        // Without flattening, camera forward pitches downward toward target
        fwdVecY = -0.4;
    }
    const fwdVec = new THREE.Vector3(fwdX, fwdVecY, fwdZ).normalize();
    const rightVec = new THREE.Vector3(rightX, 0, rightZ).normalize();

    camVec3d.arrowFwd.setDirection(fwdVec);
    camVec3d.arrowRight.setDirection(rightVec);

    // World Move Vector
    const ix = camVecState.inputX;
    const iy = camVecState.inputY;
    let moveX = (fwdVec.x * iy) + (rightVec.x * ix);
    let moveY = (fwdVec.y * iy) + (rightVec.y * ix);
    let moveZ = (fwdVec.z * iy) + (rightVec.z * ix);
    const mag = Math.hypot(moveX, moveY, moveZ);

    if (mag > 0.001) {
        camVec3d.arrowMove.visible = true;
        camVec3d.arrowMove.setDirection(new THREE.Vector3(moveX / mag, moveY / mag, moveZ / mag));
        camVec3d.arrowMove.setLength(2.4);
    } else {
        camVec3d.arrowMove.visible = false;
    }

    // Update Live C# Code Breakdown UI
    const elCode = document.getElementById('camVecCodeBreakdown');
    if (elCode) {
        const yawDeg = camVecState.camYaw;
        const normX = mag > 0.001 ? (moveX / mag).toFixed(2) : '0.00';
        const normY = mag > 0.001 ? (moveY / mag).toFixed(2) : '0.00';
        const normZ = mag > 0.001 ? (moveZ / mag).toFixed(2) : '0.00';
        
        elCode.innerHTML = `<code><span class="r-cm">// 1. Read camera basis vectors &amp; project horizontally</span>
Vector3 camFwd = cameraTransform.forward;
${camVecState.flattenY ? 'camFwd.y = 0f; camFwd.Normalize(); <span class="r-cm">// Correct horizontal plane</span>' : '<span style="color:#ef4444; font-weight: bold;">// MISSING camFwd.y = 0f (Vector points into floor!)</span>'}
Vector3 camRight = cameraTransform.right;
${camVecState.flattenY ? 'camRight.y = 0f; camRight.Normalize();' : '<span style="color:#ef4444; font-weight: bold;">// MISSING camRight.y = 0f</span>'}

<span class="r-cm">// 2. Construct move vector from inputs (${ix}, ${iy})</span>
Vector3 move = (camFwd * ${iy}f + camRight * ${ix}f).normalized;
<span class="r-cm">// Resulting World Vector: (${normX}, ${normY}, ${normZ}) at Cam Yaw ${yawDeg}°</span></code>`;
    }
}

function setCamYawSlider(val) {
    camVecState.camYaw = parseFloat(val) || 0;
    const el = document.getElementById('camYawValue');
    if (el) el.textContent = camVecState.camYaw.toFixed(0) + '°';
    update3dCamVec();
}

function setCamYawPreset(deg) {
    setCamYawSlider(deg);
    const slider = document.getElementById('sliderCamYaw');
    if (slider) slider.value = deg;
}

function setRawInput(ix, iy) {
    camVecState.inputX = ix;
    camVecState.inputY = iy;
    
    const btnMap = {
        'W': { active: iy === 1 && ix === 0, id: 'btnInputW' },
        'S': { active: iy === -1 && ix === 0, id: 'btnInputS' },
        'A': { active: ix === -1 && iy === 0, id: 'btnInputA' },
        'D': { active: ix === 1 && iy === 0, id: 'btnInputD' },
        'WA': { active: iy === 1 && ix === -1, id: 'btnInputWA' },
        'WD': { active: iy === 1 && ix === 1, id: 'btnInputWD' }
    };
    
    for (let k in btnMap) {
        const el = document.getElementById(btnMap[k].id);
        if (el) {
            el.style.background = btnMap[k].active ? '#0284c7' : '#1e293b';
            el.style.borderColor = btnMap[k].active ? '#38bdf8' : '#334155';
        }
    }
    
    update3dCamVec();
}

function toggleFlattenY() {
    camVecState.flattenY = !camVecState.flattenY;
    const btn = document.getElementById('btnToggleFlatten');
    if (btn) {
        btn.textContent = camVecState.flattenY ? 'Y-Axis Flattening: ON (Correct)' : 'Y-Axis Flattening: OFF (Flawed)';
        btn.style.background = camVecState.flattenY ? '#059669' : '#dc2626';
    }
    update3dCamVec();
}


// --------------------------------------------------
// 3. Practice Challenge Timers & Solution Lock (Slide 12 & Slide 18)
// --------------------------------------------------
const challengeState = {
    1: { timerSec: 600, lockSec: 60, timerInt: null, lockInt: null },
    2: { timerSec: 600, lockSec: 60, timerInt: null, lockInt: null }
};

function formatChallengeTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return m + ':' + s;
}

function startChallengeTimer(id) {
    const cs = challengeState[id];
    if (!cs || cs.timerInt) return;

    cs.timerInt = setInterval(() => {
        if (cs.timerSec > 0) {
            cs.timerSec--;
            const el = document.getElementById('challengeTimer' + id);
            if (el) el.textContent = formatChallengeTime(cs.timerSec);
        } else {
            clearInterval(cs.timerInt);
            cs.timerInt = null;
        }
    }, 1000);

    if (!cs.lockInt && cs.lockSec > 0) {
        cs.lockInt = setInterval(() => {
            if (cs.lockSec > 0) {
                cs.lockSec--;
                const lockEl = document.getElementById('solutionLockTimer' + id);
                if (lockEl) lockEl.textContent = formatChallengeTime(cs.lockSec);
            } else {
                clearInterval(cs.lockInt);
                cs.lockInt = null;
                unlockSolution(id);
            }
        }, 1000);
    }
}

function pauseChallengeTimer(id) {
    const cs = challengeState[id];
    if (!cs) return;
    if (cs.timerInt) {
        clearInterval(cs.timerInt);
        cs.timerInt = null;
    }
    if (cs.lockInt) {
        clearInterval(cs.lockInt);
        cs.lockInt = null;
    }
}

function resetChallengeTimer(id) {
    pauseChallengeTimer(id);
    const cs = challengeState[id];
    if (!cs) return;
    cs.timerSec = 600;
    cs.lockSec = 60;

    const el = document.getElementById('challengeTimer' + id);
    if (el) el.textContent = '10:00';

    const lockEl = document.getElementById('solutionLockTimer' + id);
    if (lockEl) lockEl.textContent = '01:00';

    const banner = document.getElementById('solutionLockBanner' + id);
    if (banner) {
        banner.style.display = 'block';
        banner.style.background = '#fef2f2';
        banner.style.borderColor = '#fca5a5';
        banner.style.color = '#991b1b';
        banner.innerHTML = '[LOCKED] Solution unlocks in: <strong id="solutionLockTimer' + id + '">01:00</strong> (Implement code first)';
    }

    const sol = document.getElementById('solutionDetails' + id);
    if (sol) {
        sol.style.pointerEvents = 'none';
        sol.style.opacity = '0.5';
        sol.removeAttribute('open');
    }
}

function unlockSolution(id) {
    const banner = document.getElementById('solutionLockBanner' + id);
    if (banner) {
        banner.style.background = '#ecfdf5';
        banner.style.borderColor = '#86efac';
        banner.style.color = '#065f46';
        banner.innerHTML = '<strong>[UNLOCKED] Solution Available:</strong> Click below to verify your implementation.';
    }

    const sol = document.getElementById('solutionDetails' + id);
    if (sol) {
        sol.style.pointerEvents = 'auto';
        sol.style.opacity = '1';
    }
}

// Window resize listener to keep Three.js viewports crisp
window.addEventListener('resize', () => {
    if (jump3d.renderer && jump3d.camera && document.getElementById('sim3dJumpContainer')) {
        const c = document.getElementById('sim3dJumpContainer');
        const w = c.clientWidth || 480;
        const h = c.clientHeight || 260;
        jump3d.renderer.setSize(w, h);
        jump3d.camera.aspect = w / h;
        jump3d.camera.updateProjectionMatrix();
    }
    if (camVec3d.renderer && camVec3d.camera && document.getElementById('sim3dCamVecContainer')) {
        const c = document.getElementById('sim3dCamVecContainer');
        const w = c.clientWidth || 480;
        const h = c.clientHeight || 260;
        camVec3d.renderer.setSize(w, h);
        camVec3d.camera.aspect = w / h;
        camVec3d.camera.updateProjectionMatrix();
    }
});

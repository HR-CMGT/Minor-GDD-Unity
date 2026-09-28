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
    playerY: 0,
    trail: []
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
    initialized: false
};

function initJumpSandbox() {
    init3dJumpSandbox();
    updateJumpTelemetry();
    drawJumpSandbox();
}

function init3dJumpSandbox() {
    const container = document.getElementById('sim3dJumpContainer');
    if (!container || typeof THREE === 'undefined') return;

    const w = container.clientWidth || 480;
    const h = container.clientHeight || 260;

    if (!jump3d.initialized) {
        jump3d.scene = new THREE.Scene();
        jump3d.scene.background = new THREE.Color(0x050b14);

        jump3d.camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
        jump3d.camera.position.set(4.5, 3.2, 7.5);

        jump3d.renderer = new THREE.WebGLRenderer({ antialias: true });
        jump3d.renderer.setSize(w, h);
        jump3d.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        jump3d.scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
        dirLight.position.set(5, 10, 7);
        jump3d.scene.add(dirLight);

        // 3D Metric Grid (10m x 4m)
        const gridHelper = new THREE.GridHelper(12, 12, 0x0284c7, 0x1e293b);
        gridHelper.position.set(5, 0, 0);
        jump3d.scene.add(gridHelper);

        // Ground platform (Launch)
        const launchGeo = new THREE.BoxGeometry(2, 0.4, 3);
        const launchMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.2 });
        const launchMesh = new THREE.Mesh(launchGeo, launchMat);
        launchMesh.position.set(-1, -0.2, 0);
        jump3d.scene.add(launchMesh);

        // Landing platform
        const landGeo = new THREE.BoxGeometry(8, 0.4, 3);
        const landMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
        const landMesh = new THREE.Mesh(landGeo, landMat);
        landMesh.position.set(7, -0.2, 0);
        jump3d.scene.add(landMesh);

        // Wall Obstacle Mesh
        const wallGeo = new THREE.BoxGeometry(0.3, 1.5, 2.8);
        const wallMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
        jump3d.wallMesh = new THREE.Mesh(wallGeo, wallMat);
        jump3d.wallMesh.position.set(jumpSimState.wallDistance, 0.75, 0);
        jump3d.scene.add(jump3d.wallMesh);

        // Character Capsule Mesh
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
        capGroup.add(bodyMesh);
        capGroup.add(topMesh);
        capGroup.add(botMesh);
        jump3d.playerMesh = capGroup;
        jump3d.playerMesh.position.set(0, 0, 0);
        jump3d.scene.add(jump3d.playerMesh);

        // Apex Indicator Sphere
        const apexGeo = new THREE.SphereGeometry(0.12, 12, 12);
        const apexMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        jump3d.apexMarker = new THREE.Mesh(apexGeo, apexMat);
        jump3d.scene.add(jump3d.apexMarker);

        // Trajectory Line
        const trajMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
        const trajGeo = new THREE.BufferGeometry();
        jump3d.trajLine = new THREE.Line(trajGeo, trajMat);
        jump3d.scene.add(jump3d.trajLine);

        jump3d.initialized = true;

        const animate3d = () => {
            requestAnimationFrame(animate3d);
            if (jump3d.controls) jump3d.controls.update();
            if (jump3d.renderer && jump3d.scene && jump3d.camera) {
                jump3d.renderer.render(jump3d.scene, jump3d.camera);
            }
        };
        animate3d();
    } else {
        jump3d.renderer.setSize(w, h);
        jump3d.camera.aspect = w / h;
        jump3d.camera.updateProjectionMatrix();
    }

    update3dJumpGeometry();
}

function update3dJumpGeometry() {
    if (!jump3d.initialized) return;

    // Update Wall
    if (jump3d.wallMesh) {
        jump3d.wallMesh.visible = jumpSimState.wallEnabled;
        jump3d.wallMesh.scale.set(1, jumpSimState.wallHeight / 1.5, 1);
        jump3d.wallMesh.position.set(jumpSimState.wallDistance, jumpSimState.wallHeight / 2, 0);
    }

    // Update Trajectory Arc
    const phys = calcJumpPhysics();
    const points = [];
    const steps = 40;
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
    if (jump3d.playerMesh) {
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
    if (!jumpSimState.isJumping) {
        drawJumpSandbox();
    }
}

function setJumpPreset(preset) {
    if (preset === 'realistic') {
        updateJumpParam('jumpHeight', 1.0);
        updateJumpParam('gravity', 9.8);
        updateJumpParam('moveSpeed', 4.5);
    } else if (preset === 'platformer') {
        updateJumpParam('jumpHeight', 2.0);
        updateJumpParam('gravity', 22.0);
        updateJumpParam('moveSpeed', 6.5);
    } else if (preset === 'lowgrav') {
        updateJumpParam('jumpHeight', 3.5);
        updateJumpParam('gravity', 7.0);
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
    drawJumpSandbox();
}

function toggleJumpObstacle(type) {
    if (type === 'wall') {
        jumpSimState.wallEnabled = !jumpSimState.wallEnabled;
        const btn = document.getElementById('btnToggleWall');
        if (btn) {
            btn.style.background = jumpSimState.wallEnabled ? '#0369a1' : '#334155';
            btn.textContent = jumpSimState.wallEnabled ? 'Wall Obstacle: ON' : 'Wall Obstacle: OFF';
        }
    } else if (type === 'gap') {
        jumpSimState.gapEnabled = !jumpSimState.gapEnabled;
        const btn = document.getElementById('btnToggleGap');
        if (btn) {
            btn.style.background = jumpSimState.gapEnabled ? '#0369a1' : '#334155';
            btn.textContent = jumpSimState.gapEnabled ? 'Gap Pit: ON' : 'Gap Pit: OFF';
        }
    }
    updateJumpTelemetry();
    update3dJumpGeometry();
    drawJumpSandbox();
}

function calcJumpPhysics() {
    const h = jumpSimState.jumpHeight;
    const g = jumpSimState.gravity;
    const vx = jumpSimState.moveSpeed;
    
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
                reasons.push('Clears gap (+' + (phys.maxDist - jumpSimState.gapWidth).toFixed(2) + 'm margin)');
            }
        }
        
        if (wallPass && gapPass) {
            elStatus.style.background = '#064e3b';
            elStatus.style.borderColor = '#10b981';
            elStatus.style.color = '#a7f3d0';
            elStatus.innerHTML = '<strong>STATUS: PASS</strong> - ' + (reasons.length > 0 ? reasons.join(' | ') : 'Clear terrain path');
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
    jumpSimState.trail = [];
    
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
        jumpSimState.trail.push({ x, y });
        
        if (jump3d.playerMesh) {
            jump3d.playerMesh.position.set(x, y, 0);
        }
        
        drawJumpSandbox();
        
        if (elapsed < phys.tTotal) {
            jumpSimState.animRaf = requestAnimationFrame(animate);
        } else {
            jumpSimState.isJumping = false;
            jumpSimState.playerX = phys.maxDist;
            jumpSimState.playerY = 0;
            if (jump3d.playerMesh) {
                jump3d.playerMesh.position.set(phys.maxDist, 0, 0);
            }
            drawJumpSandbox();
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
    jumpSimState.trail = [];
    if (jump3d.playerMesh) {
        jump3d.playerMesh.position.set(0, 0, 0);
    }
    drawJumpSandbox();
}

function drawJumpSandbox() {
    const canvas = document.getElementById('jumpSimCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    
    ctx.clearRect(0, 0, w, h);
    
    const originX = 50;
    const originY = h - 50;
    const scaleX = (w - 80) / 10.0;
    const scaleY = (h - 80) / 4.5;
    
    // Grid
    ctx.lineWidth = 1;
    for (let mx = 0; mx <= 10; mx++) {
        const px = originX + mx * scaleX;
        ctx.strokeStyle = mx % 2 === 0 ? '#334155' : '#1e293b';
        ctx.beginPath();
        ctx.moveTo(px, 20);
        ctx.lineTo(px, originY);
        ctx.stroke();
        
        ctx.fillStyle = '#64748b';
        ctx.font = '10px monospace';
        ctx.fillText(mx + 'm', px - 8, originY + 16);
    }
    
    for (let my = 0; my <= 4; my++) {
        const py = originY - my * scaleY;
        ctx.strokeStyle = my % 2 === 0 ? '#334155' : '#1e293b';
        ctx.beginPath();
        ctx.moveTo(originX, py);
        ctx.lineTo(originX + 10 * scaleX, py);
        ctx.stroke();
        
        ctx.fillStyle = '#64748b';
        ctx.font = '10px monospace';
        ctx.fillText(my + 'm', originX - 28, py + 4);
    }
    
    // Platforms
    const launchPadWidth = 1.0 * scaleX;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(originX - 30, originY, launchPadWidth + 30, 40);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(originX - 30, originY);
    ctx.lineTo(originX + launchPadWidth, originY);
    ctx.stroke();
    
    if (jumpSimState.gapEnabled) {
        const pitStartX = originX + launchPadWidth;
        const pitWidthPx = jumpSimState.gapWidth * scaleX;
        
        ctx.fillStyle = '#090d16';
        ctx.fillRect(pitStartX, originY, pitWidthPx, 40);
        ctx.strokeStyle = '#ef4444';
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(pitStartX, originY, pitWidthPx, 35);
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#ef4444';
        ctx.font = '11px sans-serif';
        ctx.fillText('PIT HAZARD (' + jumpSimState.gapWidth.toFixed(1) + 'm)', pitStartX + pitWidthPx / 2 - 45, originY + 22);
        
        const landingX = pitStartX + pitWidthPx;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(landingX, originY, w - landingX - 20, 40);
        ctx.strokeStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(landingX, originY);
        ctx.lineTo(originX + 10 * scaleX, originY);
        ctx.stroke();
    } else {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(originX, originY, 10 * scaleX, 40);
        ctx.strokeStyle = '#475569';
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(originX + 10 * scaleX, originY);
        ctx.stroke();
    }
    
    // Wall
    if (jumpSimState.wallEnabled) {
        const wallPx = originX + jumpSimState.wallDistance * scaleX;
        const wallHeightPx = jumpSimState.wallHeight * scaleY;
        const wallThickness = 14;
        
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(wallPx - wallThickness / 2, originY - wallHeightPx, wallThickness, wallHeightPx);
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.strokeRect(wallPx - wallThickness / 2, originY - wallHeightPx, wallThickness, wallHeightPx);
        
        ctx.fillStyle = '#fbbf24';
        ctx.font = '10px sans-serif';
        ctx.fillText('WALL (' + jumpSimState.wallHeight.toFixed(1) + 'm)', wallPx - 25, originY - wallHeightPx - 8);
    }
    
    // Arc
    const phys = calcJumpPhysics();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * phys.tTotal;
        const px = originX + (phys.vx * t) * scaleX;
        const py = originY - ((phys.vy0 * t) - (0.5 * phys.g * t * t)) * scaleY;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Apex
    const apexPx = originX + (phys.vx * phys.tApex) * scaleX;
    const apexPy = originY - phys.h * scaleY;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(apexPx, apexPy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '10px sans-serif';
    ctx.fillText('Apex (' + phys.h.toFixed(1) + 'm)', apexPx - 25, apexPy - 8);
    
    // Capsule
    const charPx = originX + jumpSimState.playerX * scaleX;
    const charPy = originY - jumpSimState.playerY * scaleY;
    const capRadius = 0.4 * scaleX;
    const capHeight = 1.8 * scaleY;
    
    ctx.fillStyle = '#0284c7';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.arc(charPx, charPy - capHeight + capRadius, capRadius, Math.PI, 0, false);
    ctx.arc(charPx, charPy - capRadius, capRadius, 0, Math.PI, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(charPx, charPy, 3, 0, Math.PI * 2);
    ctx.fill();
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
    arrowInput: null,
    arrowMove: null,
    playerMesh: null,
    initialized: false
};

function initCamVecInspector() {
    init3dCamVecInspector();
    drawCamVecInspector();
}

function init3dCamVecInspector() {
    const container = document.getElementById('sim3dCamVecContainer');
    if (!container || typeof THREE === 'undefined') return;

    const w = container.clientWidth || 480;
    const h = container.clientHeight || 260;

    if (!camVec3d.initialized) {
        camVec3d.scene = new THREE.Scene();
        camVec3d.scene.background = new THREE.Color(0x050b14);

        camVec3d.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
        camVec3d.camera.position.set(0, 5.5, 6.0);

        camVec3d.renderer = new THREE.WebGLRenderer({ antialias: true });
        camVec3d.renderer.setSize(w, h);
        camVec3d.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.innerHTML = '';
        container.appendChild(camVec3d.renderer.domElement);

        if (typeof THREE.OrbitControls !== 'undefined') {
            camVec3d.controls = new THREE.OrbitControls(camVec3d.camera, camVec3d.renderer.domElement);
            camVec3d.controls.target.set(0, 0.5, 0);
            camVec3d.controls.enableDamping = true;
            camVec3d.controls.dampingFactor = 0.08;
        }

        // Lights
        const amb = new THREE.AmbientLight(0xffffff, 0.7);
        camVec3d.scene.add(amb);
        const dir = new THREE.DirectionalLight(0x38bdf8, 1.2);
        dir.position.set(5, 10, 5);
        camVec3d.scene.add(dir);

        // Ground Compass & Grid
        const grid = new THREE.GridHelper(8, 8, 0x0284c7, 0x1e293b);
        camVec3d.scene.add(grid);

        // Character Mesh in Center
        const charGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 16);
        const charMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 });
        camVec3d.playerMesh = new THREE.Mesh(charGeo, charMat);
        camVec3d.playerMesh.position.set(0, 0.6, 0);
        camVec3d.scene.add(camVec3d.playerMesh);

        // Camera Proxy Indicator
        const camBoxGeo = new THREE.ConeGeometry(0.3, 0.6, 4);
        camBoxGeo.rotateX(Math.PI / 2);
        const camBoxMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8 });
        camVec3d.camProxy = new THREE.Mesh(camBoxGeo, camBoxMat);
        camVec3d.scene.add(camVec3d.camProxy);

        // Vector Arrows
        const origin = new THREE.Vector3(0, 0.1, 0);
        camVec3d.arrowFwd = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), origin, 2.0, 0x38bdf8, 0.4, 0.2);
        camVec3d.arrowRight = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, 1.6, 0xfb923c, 0.35, 0.18);
        camVec3d.arrowMove = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), origin, 2.4, 0x10b981, 0.5, 0.25);
        
        camVec3d.scene.add(camVec3d.arrowFwd);
        camVec3d.scene.add(camVec3d.arrowRight);
        camVec3d.scene.add(camVec3d.arrowMove);

        camVec3d.initialized = true;

        const animate3d = () => {
            requestAnimationFrame(animate3d);
            if (camVec3d.controls) camVec3d.controls.update();
            if (camVec3d.renderer && camVec3d.scene && camVec3d.camera) {
                camVec3d.renderer.render(camVec3d.scene, camVec3d.camera);
            }
        };
        animate3d();
    } else {
        camVec3d.renderer.setSize(w, h);
        camVec3d.camera.aspect = w / h;
        camVec3d.camera.updateProjectionMatrix();
    }

    update3dCamVec();
}

function update3dCamVec() {
    if (!camVec3d.initialized) return;

    const yawRad = (camVecState.camYaw * Math.PI) / 180;
    const fwdX = Math.sin(yawRad);
    const fwdZ = Math.cos(yawRad);

    const rightX = Math.cos(yawRad);
    const rightZ = -Math.sin(yawRad);

    // Camera proxy position
    const camDist = 3.2;
    camVec3d.camProxy.position.set(-fwdX * camDist, 1.4, -fwdZ * camDist);
    camVec3d.camProxy.lookAt(0, 0.6, 0);

    // Camera Forward & Right Arrows
    camVec3d.arrowFwd.setDirection(new THREE.Vector3(fwdX, 0, fwdZ).normalize());
    camVec3d.arrowRight.setDirection(new THREE.Vector3(rightX, 0, rightZ).normalize());

    // World Move Vector
    const ix = camVecState.inputX;
    const iy = camVecState.inputY;
    let moveX = (fwdX * iy) + (rightX * ix);
    let moveZ = (fwdZ * iy) + (rightZ * ix);
    const mag = Math.hypot(moveX, moveZ);

    if (mag > 0.001) {
        camVec3d.arrowMove.visible = true;
        camVec3d.arrowMove.setDirection(new THREE.Vector3(moveX / mag, 0, moveZ / mag));
        camVec3d.arrowMove.setLength(2.4);
    } else {
        camVec3d.arrowMove.visible = false;
    }
}

function setCamYawSlider(val) {
    camVecState.camYaw = parseFloat(val) || 0;
    const el = document.getElementById('camYawValue');
    if (el) el.textContent = camVecState.camYaw.toFixed(0) + '°';
    update3dCamVec();
    drawCamVecInspector();
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
    drawCamVecInspector();
}

function toggleFlattenY() {
    camVecState.flattenY = !camVecState.flattenY;
    const btn = document.getElementById('btnToggleFlatten');
    if (btn) {
        btn.textContent = camVecState.flattenY ? 'Y-Axis Flattening: ON (Correct)' : 'Y-Axis Flattening: OFF (Flawed)';
        btn.style.background = camVecState.flattenY ? '#059669' : '#dc2626';
    }
    update3dCamVec();
    drawCamVecInspector();
}

function drawCamVecInspector() {
    const canvas = document.getElementById('camVecCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    
    ctx.clearRect(0, 0, w, h);
    
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.38;
    
    // Compass Ring
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.fillText('+Z (Forward / North)', cx - 55, cy - radius - 8);
    ctx.fillText('+X (Right / East)', cx + radius + 8, cy + 4);
    ctx.fillText('-Z (South)', cx - 25, cy + radius + 18);
    ctx.fillText('-X (West)', cx - radius - 55, cy + 4);
    
    ctx.strokeStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(cx - radius, cy); ctx.lineTo(cx + radius, cy);
    ctx.moveTo(cx, cy - radius); ctx.lineTo(cx, cy + radius);
    ctx.stroke();
    
    const yawRad = (camVecState.camYaw - 90) * (Math.PI / 180);
    const fwdX = Math.cos(yawRad);
    const fwdZ = Math.sin(yawRad);
    
    const rightRad = yawRad + Math.PI / 2;
    const rightX = Math.cos(rightRad);
    const rightZ = Math.sin(rightRad);
    
    const camDist = radius * 0.85;
    const camPx = cx - fwdX * camDist;
    const camPy = cy - fwdZ * camDist;
    
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(camPx, camPy, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.font = '10px sans-serif';
    ctx.fillText('Camera', camPx - 18, camPy + 18);
    
    // Frustum
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.beginPath();
    ctx.moveTo(camPx, camPy);
    ctx.lineTo(cx + fwdX * 40 - rightX * 50, cy + fwdZ * 40 - rightZ * 50);
    ctx.lineTo(cx + fwdX * 40 + rightX * 50, cy + fwdZ * 40 + rightZ * 50);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    const vecLen = radius * 0.65;
    drawArrow(ctx, cx, cy, cx + fwdX * vecLen, cy + fwdZ * vecLen, '#38bdf8', 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('cam.forward', cx + fwdX * vecLen + 5, cy + fwdZ * vecLen + 5);
    
    drawArrow(ctx, cx, cy, cx + rightX * (vecLen * 0.7), cy + rightZ * (vecLen * 0.7), '#fb923c', 2);
    ctx.fillStyle = '#fb923c';
    ctx.fillText('cam.right', cx + rightX * (vecLen * 0.7) + 5, cy + rightZ * (vecLen * 0.7) + 5);
    
    const ix = camVecState.inputX;
    const iy = camVecState.inputY;
    let rawMoveX = (fwdX * iy) + (rightX * ix);
    let rawMoveZ = (fwdZ * iy) + (rightZ * ix);
    const mag = Math.sqrt(rawMoveX * rawMoveX + rawMoveZ * rawMoveZ);
    
    let normMoveX = 0;
    let normMoveZ = 0;
    if (mag > 0.001) {
        normMoveX = rawMoveX / mag;
        normMoveZ = rawMoveZ / mag;
    }
    
    if (mag > 0.001) {
        drawArrow(ctx, cx, cy, cx + normMoveX * vecLen, cy + normMoveZ * vecLen, '#10b981', 3.5);
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('moveDirection (World)', cx + normMoveX * vecLen + 8, cy + normMoveZ * vecLen + 8);
    }
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    const elCode = document.getElementById('camVecCodeBreakdown');
    if (elCode) {
        const yawDeg = camVecState.camYaw;
        const normX = normMoveX.toFixed(2);
        const normZ = normMoveZ.toFixed(2);
        
        elCode.innerHTML = `<code><span class="r-cm">// 1. Read flattened camera basis vectors</span>
Vector3 camFwd = cameraTransform.forward;
${camVecState.flattenY ? 'camFwd.y = 0f; camFwd.Normalize(); <span class="r-cm">// Clean horizontal projection</span>' : '<span class="r-kw" style="color:#ef4444;">// MISSING camFwd.y = 0f (Character moves into floor!)</span>'}
Vector3 camRight = cameraTransform.right;
${camVecState.flattenY ? 'camRight.y = 0f; camRight.Normalize();' : '<span class="r-kw" style="color:#ef4444;">// MISSING camRight.y = 0f</span>'}

<span class="r-cm">// 2. Construct move vector from inputs (${ix}, ${iy})</span>
Vector3 move = (camFwd * ${iy}f + camRight * ${ix}f).normalized;
<span class="r-cm">// Resulting World Vector: (${normX}, 0.00, ${normZ}) at Cam Yaw ${yawDeg}°</span></code>`;
    }
}

function drawArrow(ctx, fromX, fromY, toX, toY, color, width) {
    const headLen = 9;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
}


// --------------------------------------------------
// 3. NavMesh Agent Pathfinding & Carving Simulator (Slide 15)
// --------------------------------------------------
let navSimState = {
    carveEnabled: true,
    agentMode: 'patrol',
    agentX: 60,
    agentY: 60,
    targetX: 380,
    targetY: 260,
    speed: 4.0,           // m/s
    stoppingDist: 15,     // px
    waypointIndex: 0,
    waypoints: [
        { x: 60, y: 60 },
        { x: 380, y: 60 },
        { x: 380, y: 260 },
        { x: 60, y: 260 }
    ],
    path: [],
    pathPending: false,
    carvedObstacle: { x: 190, y: 110, w: 90, h: 90 },
    staticWalls: [
        { x: 0, y: 0, w: 460, h: 10 },
        { x: 0, y: 310, w: 460, h: 10 },
        { x: 0, y: 0, w: 10, h: 320 },
        { x: 450, y: 0, w: 10, h: 320 },
        { x: 140, y: 0, w: 16, h: 120 },
        { x: 310, y: 200, w: 16, h: 120 }
    ],
    animRaf: null,
    lastTime: 0
};

let nav3d = {
    renderer: null,
    scene: null,
    camera: null,
    controls: null,
    agentMesh: null,
    targetMesh: null,
    obstacleMesh: null,
    pathLine: null,
    initialized: false
};

function initNavMeshSimulator() {
    init3dNavMeshSimulator();
    recalculateNavPath();
    startNavLoop();
    
    const canvas = document.getElementById('navMeshCanvas');
    if (canvas) {
        canvas.onclick = onNavCanvasClick;
    }
}

function init3dNavMeshSimulator() {
    const container = document.getElementById('sim3dNavMeshContainer');
    if (!container || typeof THREE === 'undefined') return;

    const w = container.clientWidth || 480;
    const h = container.clientHeight || 260;

    if (!nav3d.initialized) {
        nav3d.scene = new THREE.Scene();
        nav3d.scene.background = new THREE.Color(0x050b14);

        nav3d.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
        nav3d.camera.position.set(0, 8.5, 7.5);

        nav3d.renderer = new THREE.WebGLRenderer({ antialias: true });
        nav3d.renderer.setSize(w, h);
        nav3d.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.innerHTML = '';
        container.appendChild(nav3d.renderer.domElement);

        if (typeof THREE.OrbitControls !== 'undefined') {
            nav3d.controls = new THREE.OrbitControls(nav3d.camera, nav3d.renderer.domElement);
            nav3d.controls.target.set(0, 0, 0);
            nav3d.controls.enableDamping = true;
            nav3d.controls.dampingFactor = 0.08;
        }

        // Lighting
        const amb = new THREE.AmbientLight(0xffffff, 0.7);
        nav3d.scene.add(amb);
        const dir = new THREE.DirectionalLight(0x38bdf8, 1.2);
        dir.position.set(5, 12, 5);
        nav3d.scene.add(dir);

        // Walkable NavMesh Floor (Translucent Cyan)
        const floorGeo = new THREE.PlaneGeometry(9.2, 6.4);
        floorGeo.rotateX(-Math.PI / 2);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x0284c7,
            roughness: 0.5,
            metalness: 0.1,
            transparent: true,
            opacity: 0.35
        });
        const floorMesh = new THREE.Mesh(floorGeo, floorMat);
        nav3d.scene.add(floorMesh);

        const grid = new THREE.GridHelper(10, 10, 0x0284c7, 0x1e293b);
        grid.position.y = 0.01;
        nav3d.scene.add(grid);

        // Static Walls
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
        const wall1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.0, 2.4), wallMat);
        wall1.position.set(-2.0, 0.5, -1.8);
        nav3d.scene.add(wall1);

        const wall2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.0, 2.4), wallMat);
        wall2.position.set(2.0, 0.5, 1.8);
        nav3d.scene.add(wall2);

        // Dynamic Carved Obstacle
        const obGeo = new THREE.BoxGeometry(1.8, 1.0, 1.8);
        const obMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 });
        nav3d.obstacleMesh = new THREE.Mesh(obGeo, obMat);
        nav3d.obstacleMesh.position.set(0, 0.5, 0);
        nav3d.scene.add(nav3d.obstacleMesh);

        // NavMesh Agent Capsule
        const agentGroup = new THREE.Group();
        const agentGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.8, 16);
        const agentMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.2 });
        const agentBody = new THREE.Mesh(agentGeo, agentMat);
        agentBody.position.y = 0.4;
        agentGroup.add(agentBody);
        nav3d.agentMesh = agentGroup;
        nav3d.scene.add(nav3d.agentMesh);

        // Target Marker
        const targetGeo = new THREE.CylinderGeometry(0.2, 0.05, 0.6, 12);
        const targetMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
        nav3d.targetMesh = new THREE.Mesh(targetGeo, targetMat);
        nav3d.targetMesh.position.set(2.5, 0.3, 1.5);
        nav3d.scene.add(nav3d.targetMesh);

        // Path Line
        const pathMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2.5 });
        const pathGeo = new THREE.BufferGeometry();
        nav3d.pathLine = new THREE.Line(pathGeo, pathMat);
        nav3d.scene.add(nav3d.pathLine);

        nav3d.initialized = true;

        const animate3d = () => {
            requestAnimationFrame(animate3d);
            if (nav3d.controls) nav3d.controls.update();
            if (nav3d.renderer && nav3d.scene && nav3d.camera) {
                nav3d.renderer.render(nav3d.scene, nav3d.camera);
            }
        };
        animate3d();
    } else {
        nav3d.renderer.setSize(w, h);
        nav3d.camera.aspect = w / h;
        nav3d.camera.updateProjectionMatrix();
    }
}

function update3dNavAgentPosition() {
    if (!nav3d.initialized) return;

    // Convert 2D canvas coordinates (0..460, 0..320) to 3D world (-4.6..4.6, -3.2..3.2)
    const scale = 0.02;
    const ax = (navSimState.agentX - 230) * scale;
    const az = (navSimState.agentY - 160) * scale;
    const tx = (navSimState.targetX - 230) * scale;
    const tz = (navSimState.targetY - 160) * scale;

    if (nav3d.agentMesh) {
        nav3d.agentMesh.position.set(ax, 0, az);
    }
    if (nav3d.targetMesh) {
        nav3d.targetMesh.position.set(tx, 0.3, tz);
    }

    // Update Path Line
    if (nav3d.pathLine && navSimState.path.length > 0) {
        const points = navSimState.path.map(p => new THREE.Vector3((p.x - 230) * scale, 0.08, (p.y - 160) * scale));
        nav3d.pathLine.geometry.setFromPoints(points);
    }
}

function setNavAgentMode(mode) {
    navSimState.agentMode = mode;
    const btnP = document.getElementById('btnNavModePatrol');
    const btnC = document.getElementById('btnNavModeChase');
    
    if (btnP) btnP.style.background = mode === 'patrol' ? '#0369a1' : '#1e293b';
    if (btnC) btnC.style.background = mode === 'chase' ? '#0369a1' : '#1e293b';
    
    if (mode === 'patrol') {
        navSimState.waypointIndex = 0;
        navSimState.targetX = navSimState.waypoints[0].x;
        navSimState.targetY = navSimState.waypoints[0].y;
    }
    recalculateNavPath();
}

function toggleNavCarving() {
    navSimState.carveEnabled = !navSimState.carveEnabled;
    const btn = document.getElementById('btnNavCarve');
    if (btn) {
        btn.textContent = navSimState.carveEnabled ? 'Dynamic Carving: ON' : 'Dynamic Carving: OFF';
        btn.style.background = navSimState.carveEnabled ? '#059669' : '#dc2626';
    }
    if (nav3d.obstacleMesh) {
        nav3d.obstacleMesh.material.color.setHex(navSimState.carveEnabled ? 0xd97706 : 0x475569);
    }
    recalculateNavPath();
}

function onNavCanvasClick(e) {
    const rect = e.target.getBoundingClientRect();
    navSimState.targetX = e.clientX - rect.left;
    navSimState.targetY = e.clientY - rect.top;
    navSimState.agentMode = 'manual';
    
    const btnP = document.getElementById('btnNavModePatrol');
    const btnC = document.getElementById('btnNavModeChase');
    const btnM = document.getElementById('btnNavTargetManual');
    if (btnP) btnP.style.background = '#1e293b';
    if (btnC) btnC.style.background = '#1e293b';
    if (btnM) btnM.style.background = '#0369a1';
    
    recalculateNavPath();
}

function recalculateNavPath() {
    const sx = navSimState.agentX;
    const sy = navSimState.agentY;
    const tx = navSimState.targetX;
    const ty = navSimState.targetY;
    
    const path = [{ x: sx, y: sy }];
    const ob = navSimState.carvedObstacle;
    
    const lineIntersectsObstacle = navSimState.carveEnabled && lineRectIntersect(sx, sy, tx, ty, ob.x - 12, ob.y - 12, ob.w + 24, ob.h + 24);
    
    if (lineIntersectsObstacle) {
        const topCorner = { x: ob.x + ob.w / 2, y: ob.y - 20 };
        const bottomCorner = { x: ob.x + ob.w / 2, y: ob.y + ob.h + 20 };
        
        const distTop = Math.hypot(sx - topCorner.x, sy - topCorner.y) + Math.hypot(tx - topCorner.x, ty - topCorner.y);
        const distBottom = Math.hypot(sx - bottomCorner.x, sy - bottomCorner.y) + Math.hypot(tx - bottomCorner.x, ty - bottomCorner.y);
        
        if (distTop < distBottom) {
            path.push(topCorner);
        } else {
            path.push(bottomCorner);
        }
    }
    
    path.push({ x: tx, y: ty });
    navSimState.path = path;
    updateNavTelemetry();
    update3dNavAgentPosition();
}

function lineRectIntersect(x1, y1, x2, y2, rx, ry, rw, rh) {
    const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
    if (maxX < rx || minX > rx + rw || maxY < ry || minY > ry + rh) return false;
    return true;
}

function startNavLoop() {
    if (navSimState.animRaf) cancelAnimationFrame(navSimState.animRaf);
    
    navSimState.lastTime = performance.now();
    const step = (currentTime) => {
        const dt = (currentTime - navSimState.lastTime) / 1000;
        navSimState.lastTime = currentTime;
        
        updateNavAgentMovement(dt);
        drawNavMeshSimulator();
        update3dNavAgentPosition();
        
        navSimState.animRaf = requestAnimationFrame(step);
    };
    navSimState.animRaf = requestAnimationFrame(step);
}

function updateNavAgentMovement(dt) {
    if (navSimState.path.length < 2) return;
    
    const nextWaypoint = navSimState.path[1];
    const dx = nextWaypoint.x - navSimState.agentX;
    const dy = nextWaypoint.y - navSimState.agentY;
    const dist = Math.hypot(dx, dy);
    
    const movePx = navSimState.speed * 40 * dt;
    
    if (dist <= movePx || dist < 6) {
        navSimState.agentX = nextWaypoint.x;
        navSimState.agentY = nextWaypoint.y;
        navSimState.path.shift();
        
        if (navSimState.path.length <= 1) {
            if (navSimState.agentMode === 'patrol') {
                navSimState.waypointIndex = (navSimState.waypointIndex + 1) % navSimState.waypoints.length;
                navSimState.targetX = navSimState.waypoints[navSimState.waypointIndex].x;
                navSimState.targetY = navSimState.waypoints[navSimState.waypointIndex].y;
                recalculateNavPath();
            }
        }
    } else {
        navSimState.agentX += (dx / dist) * movePx;
        navSimState.agentY += (dy / dist) * movePx;
    }
    
    updateNavTelemetry();
}

function updateNavTelemetry() {
    const elRem = document.getElementById('navTelemetryRemaining');
    const elState = document.getElementById('navTelemetryState');
    const elCorners = document.getElementById('navTelemetryCorners');
    
    const totalDistPx = navSimState.path.reduce((acc, curr, idx, arr) => {
        if (idx === 0) return acc;
        return acc + Math.hypot(curr.x - arr[idx - 1].x, curr.y - arr[idx - 1].y);
    }, 0);
    
    const totalMeters = (totalDistPx / 40).toFixed(1);
    
    if (elRem) elRem.textContent = totalMeters + ' m';
    if (elCorners) elCorners.textContent = navSimState.path.length + ' points';
    if (elState) {
        if (navSimState.agentMode === 'patrol') {
            elState.textContent = 'Patrol Loop (WP ' + (navSimState.waypointIndex + 1) + '/4)';
        } else if (navSimState.agentMode === 'chase') {
            elState.textContent = 'Chasing Player Target';
        } else {
            elState.textContent = totalDistPx < 10 ? 'Destination Reached' : 'Navigating to Point';
        }
    }
}

function drawNavMeshSimulator() {
    const canvas = document.getElementById('navMeshCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    
    ctx.clearRect(0, 0, w, h);
    
    // Walkable NavMesh
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);
    
    ctx.fillStyle = 'rgba(2, 132, 199, 0.18)';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1;
    ctx.fillRect(10, 10, w - 20, h - 20);
    ctx.strokeRect(10, 10, w - 20, h - 20);
    
    // Static Walls
    ctx.fillStyle = '#334155';
    navSimState.staticWalls.forEach(wall => {
        ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    });
    
    // Dynamic Obstacle
    const ob = navSimState.carvedObstacle;
    if (navSimState.carveEnabled) {
        ctx.fillStyle = '#090d16';
        ctx.fillRect(ob.x - 8, ob.y - 8, ob.w + 16, ob.h + 16);
        ctx.strokeStyle = '#ef4444';
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(ob.x - 8, ob.y - 8, ob.w + 16, ob.h + 16);
        ctx.setLineDash([]);
    }
    
    ctx.fillStyle = '#d97706';
    ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(ob.x, ob.y, ob.w, ob.h);
    
    ctx.fillStyle = '#fef3c7';
    ctx.font = '10px sans-serif';
    ctx.fillText(navSimState.carveEnabled ? 'Carved Box' : 'Obstacle (No Carve)', ob.x + 4, ob.y + ob.h / 2 + 3);
    
    // Waypoints
    navSimState.waypoints.forEach((wp, idx) => {
        ctx.fillStyle = idx === navSimState.waypointIndex ? '#38bdf8' : '#475569';
        ctx.beginPath();
        ctx.arc(wp.x, wp.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.fillText('WP' + (idx + 1), wp.x - 8, wp.y - 8);
    });
    
    // Calculated Path
    if (navSimState.path.length > 1) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        navSimState.path.forEach((pt, idx) => {
            if (idx === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#38bdf8';
        navSimState.path.forEach(pt => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    // Target
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(navSimState.targetX, navSimState.targetY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Agent
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(navSimState.agentX, navSimState.agentY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#6ee7b7';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // FOV
    if (navSimState.path.length > 1) {
        const nextPt = navSimState.path[1];
        const angle = Math.atan2(nextPt.y - navSimState.agentY, nextPt.x - navSimState.agentX);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
        ctx.beginPath();
        ctx.moveTo(navSimState.agentX, navSimState.agentY);
        ctx.arc(navSimState.agentX, navSimState.agentY, 28, angle - Math.PI / 4, angle + Math.PI / 4);
        ctx.closePath();
        ctx.fill();
    }
}


// --------------------------------------------------
// 4. Practice Challenge Timers & Solution Lock (Slide 12 & Slide 18)
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

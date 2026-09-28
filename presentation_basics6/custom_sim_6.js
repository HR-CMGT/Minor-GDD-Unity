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

function initJumpSandbox() {
    const canvas = document.getElementById('jumpSimCanvas');
    if (!canvas) return;
    updateJumpTelemetry();
    drawJumpSandbox();
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
    
    // Sync UI sliders
    const hSlider = document.getElementById('sliderJumpHeight');
    const gSlider = document.getElementById('sliderJumpGravity');
    const sSlider = document.getElementById('sliderJumpSpeed');
    if (hSlider) hSlider.value = jumpSimState.jumpHeight;
    if (gSlider) gSlider.value = jumpSimState.gravity;
    if (sSlider) sSlider.value = jumpSimState.moveSpeed;
    
    updateJumpTelemetry();
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
        
        drawJumpSandbox();
        
        if (elapsed < phys.tTotal) {
            jumpSimState.animRaf = requestAnimationFrame(animate);
        } else {
            jumpSimState.isJumping = false;
            jumpSimState.playerX = phys.maxDist;
            jumpSimState.playerY = 0;
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
    drawJumpSandbox();
}

function drawJumpSandbox() {
    const canvas = document.getElementById('jumpSimCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    
    ctx.clearRect(0, 0, w, h);
    
    // Background & Coordinate System
    // Metric bounds: X: 0 to 10m, Y: 0 to 5m
    const originX = 50;
    const originY = h - 50;
    const scaleX = (w - 80) / 10.0; // pixels per meter
    const scaleY = (h - 80) / 4.5;  // pixels per meter
    
    // Draw Metric Grid (1m steps)
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
    
    // Draw Ground Platform (Launch Pad)
    const launchPadWidth = 1.0 * scaleX;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(originX - 30, originY, launchPadWidth + 30, 40);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(originX - 30, originY);
    ctx.lineTo(originX + launchPadWidth, originY);
    ctx.stroke();
    
    // Draw Gap Pit if enabled
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
        
        // Landing platform after gap
        const landingX = pitStartX + pitWidthPx;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(landingX, originY, w - landingX - 20, 40);
        ctx.strokeStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(landingX, originY);
        ctx.lineTo(originX + 10 * scaleX, originY);
        ctx.stroke();
    } else {
        // Continuous ground
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(originX, originY, 10 * scaleX, 40);
        ctx.strokeStyle = '#475569';
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(originX + 10 * scaleX, originY);
        ctx.stroke();
    }
    
    // Draw Wall Obstacle if enabled
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
    
    // Draw Theoretical Parabolic Arc
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
    
    // Apex marker
    const apexPx = originX + (phys.vx * phys.tApex) * scaleX;
    const apexPy = originY - phys.h * scaleY;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(apexPx, apexPy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '10px sans-serif';
    ctx.fillText('Apex (' + phys.h.toFixed(1) + 'm)', apexPx - 25, apexPy - 8);
    
    // Draw Active Trail during jump
    if (jumpSimState.trail.length > 1) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        jumpSimState.trail.forEach((pt, idx) => {
            const px = originX + pt.x * scaleX;
            const py = originY - pt.y * scaleY;
            if (idx === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        });
        ctx.stroke();
    }
    
    // Draw Character Capsule
    const charPx = originX + jumpSimState.playerX * scaleX;
    const charPy = originY - jumpSimState.playerY * scaleY;
    const capRadius = 0.4 * scaleX;
    const capHeight = 1.8 * scaleY;
    
    ctx.fillStyle = '#0284c7';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    
    // Draw capsule body
    ctx.beginPath();
    ctx.arc(charPx, charPy - capHeight + capRadius, capRadius, Math.PI, 0, false);
    ctx.arc(charPx, charPy - capRadius, capRadius, 0, Math.PI, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Ground origin dot
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

function initCamVecInspector() {
    drawCamVecInspector();
}

function setCamYawSlider(val) {
    camVecState.camYaw = parseFloat(val) || 0;
    const el = document.getElementById('camYawValue');
    if (el) el.textContent = camVecState.camYaw.toFixed(0) + '°';
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
    
    // Update button states
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
    
    drawCamVecInspector();
}

function toggleFlattenY() {
    camVecState.flattenY = !camVecState.flattenY;
    const btn = document.getElementById('btnToggleFlatten');
    if (btn) {
        btn.textContent = camVecState.flattenY ? 'Y-Axis Flattening: ON (Correct)' : 'Y-Axis Flattening: OFF (Flawed)';
        btn.style.background = camVecState.flattenY ? '#059669' : '#dc2626';
    }
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
    
    // Draw Compass Ring & Grid
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Cardinal labels (North = +Z forward, East = +X right)
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.fillText('+Z (Forward / North)', cx - 55, cy - radius - 8);
    ctx.fillText('+X (Right / East)', cx + radius + 8, cy + 4);
    ctx.fillText('-Z (South)', cx - 25, cy + radius + 18);
    ctx.fillText('-X (West)', cx - radius - 55, cy + 4);
    
    // Crosshair
    ctx.strokeStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(cx - radius, cy); ctx.lineTo(cx + radius, cy);
    ctx.moveTo(cx, cy - radius); ctx.lineTo(cx, cy + radius);
    ctx.stroke();
    
    // Angle conversions
    const yawRad = (camVecState.camYaw - 90) * (Math.PI / 180); // 0 deg is North (-Y in canvas screen space)
    const fwdX = Math.cos(yawRad);
    const fwdZ = Math.sin(yawRad); // points in canvas coords
    
    // Right vector is perpendicular (+90 deg)
    const rightRad = yawRad + Math.PI / 2;
    const rightX = Math.cos(rightRad);
    const rightZ = Math.sin(rightRad);
    
    // Camera Position (orbital point)
    const camDist = radius * 0.85;
    const camPx = cx - fwdX * camDist;
    const camPy = cy - fwdZ * camDist;
    
    // Draw Camera Icon & Frustum
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(camPx, camPy, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.font = '10px sans-serif';
    ctx.fillText('Camera', camPx - 18, camPy + 18);
    
    // Frustum cone
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.beginPath();
    ctx.moveTo(camPx, camPy);
    ctx.lineTo(cx + fwdX * 40 - rightX * 50, cy + fwdZ * 40 - rightZ * 50);
    ctx.lineTo(cx + fwdX * 40 + rightX * 50, cy + fwdZ * 40 + rightZ * 50);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Draw Camera Forward Vector (Cyan)
    const vecLen = radius * 0.65;
    drawArrow(ctx, cx, cy, cx + fwdX * vecLen, cy + fwdZ * vecLen, '#38bdf8', 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('cam.forward', cx + fwdX * vecLen + 5, cy + fwdZ * vecLen + 5);
    
    // Draw Camera Right Vector (Orange)
    drawArrow(ctx, cx, cy, cx + rightX * (vecLen * 0.7), cy + rightZ * (vecLen * 0.7), '#fb923c', 2);
    ctx.fillStyle = '#fb923c';
    ctx.fillText('cam.right', cx + rightX * (vecLen * 0.7) + 5, cy + rightZ * (vecLen * 0.7) + 5);
    
    // Compute Resulting Movement Vector
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
    
    // Draw Calculated World Move Vector (Bright Green)
    if (mag > 0.001) {
        drawArrow(ctx, cx, cy, cx + normMoveX * vecLen, cy + normMoveZ * vecLen, '#10b981', 3.5);
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('moveDirection (World)', cx + normMoveX * vecLen + 8, cy + normMoveZ * vecLen + 8);
    }
    
    // Draw Player Capsule Center
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Update Math Code Breakdown in DOM
    const elCode = document.getElementById('camVecCodeBreakdown');
    if (elCode) {
        const yawDeg = camVecState.camYaw;
        const normX = normMoveX.toFixed(2);
        const normZ = normMoveZ.toFixed(2);
        
        elCode.innerHTML = `<code><span class="r-cm">// 1. Read flattened camera basis vectors</span>
Vector3 camFwd = cameraTransform.forward;
${camVecState.flattenY ? 'camFwd.y = 0f; camFwd.Normalize(); <span class="r-cm">// Clean horizontal projection</span>' : '<span class="r-kw" style="color:#ef4444;">// MISSING camFwd.y = 0f (Character will move into floor!)</span>'}
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
    agentMode: 'patrol', // 'patrol' or 'chase' or 'manual'
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

function initNavMeshSimulator() {
    recalculateNavPath();
    startNavLoop();
}

function setNavAgentMode(mode) {
    navSimState.agentMode = mode;
    const btnP = document.getElementById('btnNavPatrol');
    const btnC = document.getElementById('btnNavChase');
    const btnM = document.getElementById('btnNavManual');
    
    if (btnP) btnP.style.background = mode === 'patrol' ? '#0369a1' : '#1e293b';
    if (btnC) btnC.style.background = mode === 'chase' ? '#0369a1' : '#1e293b';
    if (btnM) btnM.style.background = mode === 'manual' ? '#0369a1' : '#1e293b';
    
    if (mode === 'patrol') {
        navSimState.targetX = navSimState.waypoints[navSimState.waypointIndex].x;
        navSimState.targetY = navSimState.waypoints[navSimState.waypointIndex].y;
    }
    
    recalculateNavPath();
}

function toggleNavCarving() {
    navSimState.carveEnabled = !navSimState.carveEnabled;
    const btn = document.getElementById('btnToggleCarve');
    if (btn) {
        btn.textContent = navSimState.carveEnabled ? 'Dynamic Obstacle Carve: ON' : 'Dynamic Obstacle Carve: OFF';
        btn.style.background = navSimState.carveEnabled ? '#059669' : '#dc2626';
    }
    recalculateNavPath();
    drawNavMeshSimulator();
}

function onNavCanvasClick(e) {
    const canvas = document.getElementById('navMeshCanvas');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    navSimState.agentMode = 'manual';
    navSimState.targetX = Math.max(20, Math.min(440, clickX));
    navSimState.targetY = Math.max(20, Math.min(300, clickY));
    
    const btnP = document.getElementById('btnNavPatrol');
    const btnC = document.getElementById('btnNavChase');
    const btnM = document.getElementById('btnNavManual');
    if (btnP) btnP.style.background = '#1e293b';
    if (btnC) btnC.style.background = '#1e293b';
    if (btnM) btnM.style.background = '#0369a1';
    
    recalculateNavPath();
}

function recalculateNavPath() {
    // Simple 2D geometric waypoint pathfinding with obstacle avoidance
    const sx = navSimState.agentX;
    const sy = navSimState.agentY;
    const tx = navSimState.targetX;
    const ty = navSimState.targetY;
    
    const path = [{ x: sx, y: sy }];
    const ob = navSimState.carvedObstacle;
    
    // Check if straight line intersects dynamic obstacle
    const lineIntersectsObstacle = navSimState.carveEnabled && lineRectIntersect(sx, sy, tx, ty, ob.x - 12, ob.y - 12, ob.w + 24, ob.h + 24);
    
    if (lineIntersectsObstacle) {
        // Path around carved obstacle via corners
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
}

function lineRectIntersect(x1, y1, x2, y2, rx, ry, rw, rh) {
    // Check bounding box intersection
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
            // Reached target
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
    
    // Draw Walkable NavMesh (Cyan tinted polygon)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);
    
    ctx.fillStyle = 'rgba(2, 132, 199, 0.18)';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1;
    ctx.fillRect(10, 10, w - 20, h - 20);
    ctx.strokeRect(10, 10, w - 20, h - 20);
    
    // Draw Static Walls
    ctx.fillStyle = '#334155';
    navSimState.staticWalls.forEach(wall => {
        ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    });
    
    // Draw Dynamic Carved Obstacle
    const ob = navSimState.carvedObstacle;
    if (navSimState.carveEnabled) {
        // Cut out hole in NavMesh visualization
        ctx.fillStyle = '#090d16';
        ctx.fillRect(ob.x - 8, ob.y - 8, ob.w + 16, ob.h + 16);
        ctx.strokeStyle = '#ef4444';
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(ob.x - 8, ob.y - 8, ob.w + 16, ob.h + 16);
        ctx.setLineDash([]);
    }
    
    // Obstacle block
    ctx.fillStyle = '#d97706';
    ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(ob.x, ob.y, ob.w, ob.h);
    
    ctx.fillStyle = '#fef3c7';
    ctx.font = '10px sans-serif';
    ctx.fillText(navSimState.carveEnabled ? 'Carved Box' : 'Obstacle (No Carve)', ob.x + 4, ob.y + ob.h / 2 + 3);
    
    // Draw Waypoints
    navSimState.waypoints.forEach((wp, idx) => {
        ctx.fillStyle = idx === navSimState.waypointIndex ? '#38bdf8' : '#475569';
        ctx.beginPath();
        ctx.arc(wp.x, wp.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.fillText('WP' + (idx + 1), wp.x - 8, wp.y - 8);
    });
    
    // Draw Calculated Path (Cyan dashed polyline)
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
        
        // Corner vertices
        ctx.fillStyle = '#38bdf8';
        navSimState.path.forEach(pt => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    // Draw Target Marker
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(navSimState.targetX, navSimState.targetY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw Agent Capsule
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(navSimState.agentX, navSimState.agentY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#6ee7b7';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Field of view cone
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

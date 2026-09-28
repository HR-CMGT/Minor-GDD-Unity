// ==========================================
// CLASS 6 INTERACTIVE TOOLS & SIMULATORS
// Modern Unity 6: 3D Prototyping & Camera Kinematics
// ==========================================

// --------------------------------------------------
// 1. Camera-Relative Vector Math Inspector (Slide 9)
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
// 2. Practice Challenge Timers & Solution Lock (Slide 12 & Slide 18)
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
    if (camVec3d.renderer && camVec3d.camera && document.getElementById('sim3dCamVecContainer')) {
        const c = document.getElementById('sim3dCamVecContainer');
        const w = c.clientWidth || 480;
        const h = c.clientHeight || 260;
        camVec3d.renderer.setSize(w, h);
        camVec3d.camera.aspect = w / h;
        camVec3d.camera.updateProjectionMatrix();
    }
});

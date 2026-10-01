// ==========================================
// CLASS 6 INTERACTIVE TOOLS & SIMULATORS
// Modern Unity 6: 3D Prototyping & Camera Kinematics
// ==========================================

// --------------------------------------------------
// 0. Left-Handed Cartesian Coordinate Inspector (Slide 2)
// --------------------------------------------------
let handCoordState = {
    system: 'left',       // 'left' (Unity) | 'right' (OpenGL / Blender)
    autoRotate: false,
    highlightAxis: null   // 'x' | 'y' | 'z' | null
};

let handCoord3d = {
    renderer: null,
    scene: null,
    camera: null,
    controls: null,
    handGroup: null,
    gridHelper: null,
    arrowX: null,
    arrowY: null,
    arrowZ: null,
    spriteX: null,
    spriteY: null,
    spriteZ: null,
    axisMeshes: {
        x: [],
        y: [],
        z: []
    },
    animRaf: null,
    initialized: false
};

function makeTextSprite(message, colorStr) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.font = 'Bold 22px "JetBrains Mono", Consolas, monospace';
    ctx.fillStyle = colorStr || '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(message, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(1.4, 0.35, 1.0);
    return sprite;
}

function buildHandGeometry(isLeft) {
    const group = new THREE.Group();
    handCoord3d.axisMeshes = { x: [], y: [], z: [] };

    const skinMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.35,
        metalness: 0.25
    });
    const jointMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        roughness: 0.2,
        metalness: 0.5
    });
    const redMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0x7f1d1d,
        emissiveIntensity: 0.35,
        roughness: 0.3
    });
    const greenMat = new THREE.MeshStandardMaterial({
        color: 0x22c55e,
        emissive: 0x14532d,
        emissiveIntensity: 0.35,
        roughness: 0.3
    });
    const blueMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0369a1,
        emissiveIntensity: 0.35,
        roughness: 0.3
    });

    // 1. Forearm & Wrist Base
    const wristGeo = new THREE.CylinderGeometry(0.32, 0.36, 0.7, 16);
    const wrist = new THREE.Mesh(wristGeo, skinMat);
    wrist.position.set(0, -0.75, 0);
    group.add(wrist);

    const wristJointGeo = new THREE.SphereGeometry(0.34, 16, 16);
    const wristJoint = new THREE.Mesh(wristJointGeo, jointMat);
    wristJoint.position.set(0, -0.4, 0);
    group.add(wristJoint);

    // 2. Palm Box
    const palmGeo = new THREE.BoxGeometry(0.85, 0.8, 0.38);
    const palm = new THREE.Mesh(palmGeo, skinMat);
    palm.position.set(0, 0, 0);
    group.add(palm);

    // Origin Glow Sphere at Center (0,0,0)
    const originGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const originMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const originSphere = new THREE.Mesh(originGeo, originMat);
    originSphere.position.set(0, 0, 0);
    group.add(originSphere);

    // 3. Thumb (+X Axis - Red)
    const thumbRoot = new THREE.Group();
    thumbRoot.position.set(0.42, -0.2, 0.08);

    const thumbJoint1 = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), jointMat);
    thumbRoot.add(thumbJoint1);

    const tSeg1Geo = new THREE.CylinderGeometry(0.12, 0.13, 0.45, 12);
    tSeg1Geo.rotateZ(-Math.PI / 2.5);
    const tSeg1 = new THREE.Mesh(tSeg1Geo, skinMat);
    tSeg1.position.set(0.24, 0.08, 0.02);
    thumbRoot.add(tSeg1);

    const thumbJoint2 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), jointMat);
    thumbJoint2.position.set(0.48, 0.16, 0.04);
    thumbRoot.add(thumbJoint2);

    const tSeg2Geo = new THREE.CylinderGeometry(0.10, 0.11, 0.45, 12);
    tSeg2Geo.rotateZ(-Math.PI / 2);
    const tSeg2 = new THREE.Mesh(tSeg2Geo, redMat);
    tSeg2.position.set(0.72, 0.16, 0.04);
    thumbRoot.add(tSeg2);
    handCoord3d.axisMeshes.x.push(tSeg2);

    const thumbTip = new THREE.Mesh(new THREE.SphereGeometry(0.10, 12, 12), redMat);
    thumbTip.position.set(0.95, 0.16, 0.04);
    thumbRoot.add(thumbTip);
    handCoord3d.axisMeshes.x.push(thumbTip);

    group.add(thumbRoot);

    // 4. Index Finger (+Y Axis - Green)
    const indexRoot = new THREE.Group();
    indexRoot.position.set(0.22, 0.4, 0.08);

    const iJoint1 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), jointMat);
    indexRoot.add(iJoint1);

    const iSeg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.11, 0.45, 12), skinMat);
    iSeg1.position.set(0, 0.24, 0);
    indexRoot.add(iSeg1);

    const iJoint2 = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), jointMat);
    iJoint2.position.set(0, 0.48, 0);
    indexRoot.add(iJoint2);

    const iSeg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.10, 0.45, 12), greenMat);
    iSeg2.position.set(0, 0.72, 0);
    indexRoot.add(iSeg2);
    handCoord3d.axisMeshes.y.push(iSeg2);

    const indexTip = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), greenMat);
    indexTip.position.set(0, 0.95, 0);
    indexRoot.add(indexTip);
    handCoord3d.axisMeshes.y.push(indexTip);

    group.add(indexRoot);

    // 5. Middle Finger (Z Axis - Blue)
    // Left-Handed (Unity): points forward (+Z into screen)
    // Right-Handed (OpenGL): points backward (-Z toward viewer)
    const middleRoot = new THREE.Group();
    middleRoot.position.set(-0.06, 0.38, 0.08);

    const mJoint1 = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), jointMat);
    middleRoot.add(mJoint1);

    const zSign = isLeft ? 1 : -1;

    const mSeg1Geo = new THREE.CylinderGeometry(0.11, 0.12, 0.48, 12);
    mSeg1Geo.rotateX(Math.PI / 2 * zSign);
    const mSeg1 = new THREE.Mesh(mSeg1Geo, skinMat);
    mSeg1.position.set(0, 0, 0.24 * zSign);
    middleRoot.add(mSeg1);

    const mJoint2 = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), jointMat);
    mJoint2.position.set(0, 0, 0.48 * zSign);
    middleRoot.add(mJoint2);

    const mSeg2Geo = new THREE.CylinderGeometry(0.095, 0.105, 0.48, 12);
    mSeg2Geo.rotateX(Math.PI / 2 * zSign);
    const mSeg2 = new THREE.Mesh(mSeg2Geo, blueMat);
    mSeg2.position.set(0, 0, 0.72 * zSign);
    middleRoot.add(mSeg2);
    handCoord3d.axisMeshes.z.push(mSeg2);

    const middleTip = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 12), blueMat);
    middleTip.position.set(0, 0, 0.96 * zSign);
    middleRoot.add(middleTip);
    handCoord3d.axisMeshes.z.push(middleTip);

    group.add(middleRoot);

    // 6. Curled Ring & Pinky Fingers
    const curledRoot = new THREE.Group();

    // Ring finger curled
    const rRoot = new THREE.Group();
    rRoot.position.set(-0.28, 0.35, 0.08);
    const rJoint = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), jointMat);
    rRoot.add(rJoint);
    const rCurlGeo = new THREE.TorusGeometry(0.16, 0.08, 8, 16, Math.PI);
    rCurlGeo.rotateY(Math.PI / 2);
    rCurlGeo.rotateZ(-Math.PI / 2);
    const rCurl = new THREE.Mesh(rCurlGeo, skinMat);
    rCurl.position.set(0, -0.05, 0.14);
    rRoot.add(rCurl);
    curledRoot.add(rRoot);

    // Pinky finger curled
    const pRoot = new THREE.Group();
    pRoot.position.set(-0.48, 0.25, 0.08);
    const pJoint = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), jointMat);
    pRoot.add(pJoint);
    const pCurlGeo = new THREE.TorusGeometry(0.13, 0.07, 8, 16, Math.PI);
    pCurlGeo.rotateY(Math.PI / 2);
    pCurlGeo.rotateZ(-Math.PI / 2);
    const pCurl = new THREE.Mesh(pCurlGeo, skinMat);
    pCurl.position.set(0, -0.05, 0.12);
    pRoot.add(pCurl);
    curledRoot.add(pRoot);

    group.add(curledRoot);

    // 7. Prominent 3D Coordinate Arrows
    const origin = new THREE.Vector3(0, 0, 0);
    handCoord3d.arrowX = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, 2.3, 0xef4444, 0.4, 0.2);
    handCoord3d.arrowY = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), origin, 2.3, 0x22c55e, 0.4, 0.2);
    handCoord3d.arrowZ = new THREE.ArrowHelper(new THREE.Vector3(0, 0, zSign), origin, 2.3, 0x38bdf8, 0.4, 0.2);

    group.add(handCoord3d.arrowX);
    group.add(handCoord3d.arrowY);
    group.add(handCoord3d.arrowZ);

    // 8. 3D Billboard Text Labels
    handCoord3d.spriteX = makeTextSprite("+X: Thumb (Right)", "#ef4444");
    handCoord3d.spriteX.position.set(2.6, 0.1, 0);
    group.add(handCoord3d.spriteX);

    handCoord3d.spriteY = makeTextSprite("+Y: Index (Up)", "#22c55e");
    handCoord3d.spriteY.position.set(0.2, 2.6, 0);
    group.add(handCoord3d.spriteY);

    const zLabelText = isLeft ? "+Z: Middle (Forward)" : "-Z: Middle (Back/Out)";
    handCoord3d.spriteZ = makeTextSprite(zLabelText, "#38bdf8");
    handCoord3d.spriteZ.position.set(-0.06, 0.4, 2.6 * zSign);
    group.add(handCoord3d.spriteZ);

    return group;
}

function initHandCoordInspector() {
    init3dHandCoordInspector();
    update3dHandCoord();
}

function init3dHandCoordInspector() {
    const container = document.getElementById('sim3dHandContainer');
    if (!container || typeof THREE === 'undefined') return;

    const w = container.clientWidth || 480;
    const h = container.clientHeight || 270;

    if (!handCoord3d.initialized || !handCoord3d.renderer) {
        handCoord3d.scene = new THREE.Scene();
        handCoord3d.scene.background = new THREE.Color(0x050b14);

        handCoord3d.camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
        handCoord3d.camera.position.set(3.6, 2.8, 4.4);

        handCoord3d.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        handCoord3d.renderer.setSize(w, h);
        handCoord3d.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        container.innerHTML = '';
        container.appendChild(handCoord3d.renderer.domElement);

        if (typeof THREE.OrbitControls !== 'undefined') {
            handCoord3d.controls = new THREE.OrbitControls(handCoord3d.camera, handCoord3d.renderer.domElement);
            handCoord3d.controls.target.set(0.2, 0.5, 0.2);
            handCoord3d.controls.enableDamping = true;
            handCoord3d.controls.dampingFactor = 0.08;
            handCoord3d.controls.autoRotate = handCoordState.autoRotate;
            handCoord3d.controls.autoRotateSpeed = 1.8;
        }

        // Lights
        const amb = new THREE.AmbientLight(0xffffff, 0.85);
        handCoord3d.scene.add(amb);

        const dir1 = new THREE.DirectionalLight(0x38bdf8, 1.4);
        dir1.position.set(6, 10, 8);
        handCoord3d.scene.add(dir1);

        const dir2 = new THREE.DirectionalLight(0x94a3b8, 0.7);
        dir2.position.set(-6, -4, -6);
        handCoord3d.scene.add(dir2);

        // Ground Reference Grid
        handCoord3d.gridHelper = new THREE.GridHelper(6, 6, 0x0284c7, 0x1e293b);
        handCoord3d.gridHelper.position.y = -1.15;
        handCoord3d.scene.add(handCoord3d.gridHelper);

        // Build Initial Left-Hand Mesh
        handCoord3d.handGroup = buildHandGeometry(true);
        handCoord3d.scene.add(handCoord3d.handGroup);

        handCoord3d.initialized = true;

        if (handCoord3d.animRaf) cancelAnimationFrame(handCoord3d.animRaf);
        const animateHand = () => {
            handCoord3d.animRaf = requestAnimationFrame(animateHand);
            if (handCoord3d.controls) handCoord3d.controls.update();
            if (handCoord3d.renderer && handCoord3d.scene && handCoord3d.camera) {
                handCoord3d.renderer.render(handCoord3d.scene, handCoord3d.camera);
            }
        };
        animateHand();
    } else {
        if (!container.contains(handCoord3d.renderer.domElement)) {
            container.innerHTML = '';
            container.appendChild(handCoord3d.renderer.domElement);
        }
        handCoord3d.renderer.setSize(w, h);
        handCoord3d.camera.aspect = w / h;
        handCoord3d.camera.updateProjectionMatrix();
    }

    update3dHandCoord();
}

function update3dHandCoord() {
    if (!handCoord3d.initialized || !handCoord3d.scene) return;

    const isLeft = handCoordState.system === 'left';

    // Rebuild hand geometry for current handedness
    if (handCoord3d.handGroup) {
        handCoord3d.scene.remove(handCoord3d.handGroup);
    }
    handCoord3d.handGroup = buildHandGeometry(isLeft);
    handCoord3d.scene.add(handCoord3d.handGroup);

    // Apply axis highlight if active
    if (handCoordState.highlightAxis && handCoord3d.axisMeshes[handCoordState.highlightAxis]) {
        handCoord3d.axisMeshes[handCoordState.highlightAxis].forEach(m => {
            if (m.material) {
                m.material.emissiveIntensity = 0.9;
            }
        });
    }

    // Update UI Buttons State
    const btnLeft = document.getElementById('btnHandLeft');
    const btnRight = document.getElementById('btnHandRight');
    if (btnLeft && btnRight) {
        if (isLeft) {
            btnLeft.style.background = '#0284c7';
            btnLeft.style.borderColor = '#38bdf8';
            btnLeft.style.color = '#ffffff';
            btnRight.style.background = '#1e293b';
            btnRight.style.borderColor = '#334155';
            btnRight.style.color = '#94a3b8';
        } else {
            btnRight.style.background = '#0284c7';
            btnRight.style.borderColor = '#38bdf8';
            btnRight.style.color = '#ffffff';
            btnLeft.style.background = '#1e293b';
            btnLeft.style.borderColor = '#334155';
            btnLeft.style.color = '#94a3b8';
        }
    }

    // Update Telemetry Panel
    const telemetryTitle = document.getElementById('handTelemetryTitle');
    const telemetryFormula = document.getElementById('handTelemetryFormula');
    const telemetryZDesc = document.getElementById('handTelemetryZDesc');

    if (telemetryTitle) {
        telemetryTitle.innerHTML = isLeft 
            ? '<strong>System:</strong> Unity 6 (Left-Handed Y-Up)' 
            : '<strong>System:</strong> OpenGL / Blender Standard (Right-Handed)';
    }

    if (telemetryFormula) {
        telemetryFormula.innerHTML = isLeft
            ? '<code>Thumb (+X) &times; Index (+Y) = Middle (+Z Forward)</code>'
            : '<code>Thumb (+X) &times; Index (+Y) = Middle (+Z Outward / -Z Forward)</code>';
    }

    if (telemetryZDesc) {
        telemetryZDesc.innerHTML = isLeft
            ? '<strong style="color: #38bdf8;">+Z (Middle):</strong> Forward into the screen (North)'
            : '<strong style="color: #38bdf8;">-Z (Middle):</strong> Forward depth (-Z in OpenGL camera space)';
    }
}

function setHandCoordSystem(system) {
    handCoordState.system = system;
    update3dHandCoord();
}

function setHandCameraPreset(preset) {
    if (!handCoord3d.camera || !handCoord3d.controls) return;

    if (preset === 'orbit') {
        handCoord3d.camera.position.set(3.6, 2.8, 4.4);
    } else if (preset === 'front') {
        handCoord3d.camera.position.set(0.2, 0.5, 5.2);
    } else if (preset === 'top') {
        handCoord3d.camera.position.set(0.2, 5.5, 0.21);
    } else if (preset === 'side') {
        handCoord3d.camera.position.set(5.2, 0.5, 0.2);
    }

    handCoord3d.controls.target.set(0.2, 0.5, 0.2);
    handCoord3d.controls.update();
}

function toggleHandAutoRotate() {
    handCoordState.autoRotate = !handCoordState.autoRotate;
    if (handCoord3d.controls) {
        handCoord3d.controls.autoRotate = handCoordState.autoRotate;
    }
    const btn = document.getElementById('btnToggleHandRotate');
    if (btn) {
        btn.textContent = handCoordState.autoRotate ? 'Auto-Rotate: ON' : 'Auto-Rotate: OFF';
        btn.style.background = handCoordState.autoRotate ? '#059669' : '#1e293b';
    }
}

function highlightHandAxis(axis) {
    handCoordState.highlightAxis = (handCoordState.highlightAxis === axis) ? null : axis;
    update3dHandCoord();
}

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
    if (handCoord3d.renderer && handCoord3d.camera && document.getElementById('sim3dHandContainer')) {
        const c = document.getElementById('sim3dHandContainer');
        const w = c.clientWidth || 480;
        const h = c.clientHeight || 270;
        handCoord3d.renderer.setSize(w, h);
        handCoord3d.camera.aspect = w / h;
        handCoord3d.camera.updateProjectionMatrix();
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

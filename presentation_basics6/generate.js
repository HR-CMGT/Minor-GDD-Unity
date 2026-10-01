const fs = require('fs');
const path = require('path');

// Read presentation 4 as the base HTML shell
const p4Content = fs.readFileSync('presentation_basics4/presentation_unity6_basics4.html', 'utf8');

// Extract CSS and UI Chrome (before script)
const beforeScript = p4Content.substring(0, p4Content.indexOf('<script>'));

// Customise title, Three.js includes, and header in HTML
let customBeforeScript = beforeScript
    .replace(
        /<title>.*?<\/title>/,
        '<title>Dev - Basics 6: 3D Block Prototyping &amp; Greyboxing</title>\n    <script src="three.min.js"></script>\n    <script src="OrbitControls.js"></script>'
    )
    .replace(
        /<span>Lesson 04:.*?<\/span>/s,
        '<span>Lesson 06: 3D Block Prototyping &amp; Greyboxing &bull; <strong>Modern Unity 6</strong></span>\n            <a href="../index.html" class="portal-nav-btn" style="color: #94a3b8; text-decoration: none; font-size: 0.78rem; font-weight: 700; background: #14141e; border: 1px solid #28283c; padding: 4px 10px; border-radius: 6px; display: inline-flex; align-items: center; gap: 5px; transition: all 0.15s ease; margin-left: 10px;">&larr; Course Portal</a>'
    )
    .replace(
        '<form id="teacherPinForm" onsubmit="handleTeacherPinSubmit(event)"',
        '<form id="teacherPinForm" action="javascript:void(0);" onsubmit="handleTeacherPinSubmit(event)"'
    )
    .replace(
        'scroll-behavior: smooth;',
        'scroll-behavior: auto !important;\n            overscroll-behavior-y: contain;'
    )
    .replace(
        'title="Student flags: click to clear"',
        'title="Pace flags: click to clear"'
    )
    .replace(
        '</style>',
        `        /* Universal Button Scaling & Overflow Prevention across all viewports and font sizes */
        button, .sim-action-btn, .nav-btn, .portal-nav-btn, .interactive-action-btn {
            box-sizing: border-box !important;
            height: auto !important;
            min-height: fit-content !important;
            white-space: normal !important;
            word-break: normal !important;
            overflow-wrap: break-word !important;
            line-height: 1.35 !important;
        }

        .sim-action-btn {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            width: 100% !important;
            box-sizing: border-box !important;
            white-space: normal !important;
            word-break: normal !important;
            overflow-wrap: break-word !important;
            line-height: 1.35 !important;
            font-size: 0.74rem;
            font-weight: 700 !important;
            padding: 0.55em 0.85em !important;
            min-height: 2.2em !important;
            height: auto !important;
            border-radius: 6px !important;
            cursor: pointer !important;
            transition: all 0.15s ease !important;
        }
        .sim-action-btn:hover:not(:disabled) {
            filter: brightness(1.15) !important;
            transform: translateY(-1px) !important;
        }
        .sim-action-btn:active:not(:disabled) {
            transform: translateY(1px) scale(0.98) !important;
        }

        .portal-nav-btn {
            box-sizing: border-box !important;
            white-space: normal !important;
            word-break: normal !important;
            overflow-wrap: break-word !important;
            line-height: 1.35 !important;
            height: auto !important;
            min-height: 2.2em !important;
            padding: 0.55em 0.9em !important;
        }

        /* Unity Inspector Mockup System */
        .unity-inspector {
            background: #282828;
            border: 1px solid #1a1a1a;
            border-radius: 6px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            font-size: 0.76rem;
            color: #c4c4c4;
            margin-top: 10px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .unity-inspector-header {
            background: #3c3c3c;
            padding: 6px 10px;
            border-bottom: 1px solid #202020;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-weight: 700;
            color: #e0e0e0;
        }
        .unity-inspector-body {
            padding: 8px 10px;
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        .unity-prop-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            font-size: 0.75rem;
        }
        .unity-prop-label {
            color: #b0b0b0;
            flex: 1 1 45%;
            font-weight: 500;
        }
        .unity-prop-val {
            flex: 1 1 55%;
            background: #1e1e1e;
            border: 1px solid #383838;
            border-radius: 3px;
            padding: 2px 6px;
            color: #f1f5f9;
            font-family: monospace;
            font-size: 0.73rem;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .unity-vec3 {
            display: flex;
            gap: 3px;
            width: 100%;
        }
        .unity-vec3-field {
            flex: 1;
            background: #1e1e1e;
            border: 1px solid #383838;
            border-radius: 3px;
            padding: 2px 4px;
            font-family: monospace;
            font-size: 0.70rem;
            display: flex;
            align-items: center;
            gap: 3px;
        }
        .unity-badge-x { color: #f87171; font-weight: 800; font-size: 0.68rem; }
        .unity-badge-y { color: #4ade80; font-weight: 800; font-size: 0.68rem; }
        .unity-badge-z { color: #60a5fa; font-weight: 800; font-size: 0.68rem; }
    </style>`
    );

// Extract clean engine code
const engineStart = p4Content.indexOf('let currentSlide = 0;');
const simIdx = p4Content.indexOf('// CLASS 4 INTERACTIVE SIMULATORS');
if (engineStart === -1 || simIdx === -1) {
    throw new Error('Could not extract engineCode from base presentation template');
}
const bannerStart = p4Content.lastIndexOf('// ==========================================', simIdx);
let engineCode = p4Content.substring(engineStart, bannerStart > -1 ? bannerStart : simIdx).trim();

// Harden engineCode against file:/// and cross-frame security origin exceptions
const targetHashCheck = "try { if (window.location && window.location.protocol && window.location.protocol.startsWith('http')) { if (window.self === window.top) { window.location.hash = '#slide-' + (currentSlide + 1); } } } catch(e) {}";
const safeHashCheck = "try { if (window.location && (window.location.protocol === 'http:' || window.location.protocol === 'https:')) { window.location.hash = '#slide-' + (currentSlide + 1); } } catch(e) {}";
engineCode = engineCode.replace(targetHashCheck, safeHashCheck);

engineCode = engineCode.replace(
    "setTimeout(autoFitSlideElements, 20);",
    `setTimeout(autoFitSlideElements, 20);
            if (typeof checkInitSimulators === 'function') {
                checkInitSimulators(currentSlide);
            }`
);

// Define 19 Comprehensive Slides for Lesson 06
const slides = [
  // Slide 1: Hero
  {
    isHero: true,
    title: "Dev - Basics 6: 3D Block Prototyping & Greyboxing",
    subtitle: "Minor Game Design & Development - Hogeschool Rotterdam (Modern Unity 6)",
    topics: [
      "1. From 2D Pixels to 3D World Space (Left-Handed Y-up, 1 Unit = 1 Meter)",
      "2. Level Design Metrics Standard (Doorways, Corridors, Stairs & Cover)",
      "3. Greybox Color Paletting & Landmark Readability",
      "4. ProBuilder Geometry Editing & Snapping Mechanics (Grid vs Vertex)",
      "5. CharacterController vs Rigidbody 3D & Camera-Relative Movement",
      "6. Modern AI Navigation: NavMeshSurface & Dynamic Obstacle Carving"
    ],
    labDeepDive: `<div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">
                FOUNDATIONS
            </span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            Transitioning from 2D sprites to 3D spaces requires treating geometry as physical spatial architecture. Before placing art assets, textures, or lighting, every jump gap, doorway clearance, and camera angle must be mathematically validated in greybox primitives. If a level is not fun in untextured grey blocks, visual fidelity will not fix structural design flaws.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">What is What:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    <strong>Greyboxing (Blockout):</strong> Constructing level layouts with simple geometric primitives to validate gameplay metrics, sightlines, and movement physics.<br>
                    <strong>Metric Validation:</strong> Establishing strict dimensional standards (1 unit = 1 meter) so player controller, physics, and AI navigation interact consistently.
                </div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Key Architectural Pillars:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    <strong>ProBuilder:</strong> In-engine mesh generation and rapid prototyping tool.<br>
                    <strong>CharacterController:</strong> Non-physics kinematic displacement with built-in slope/step handling.<br>
                    <strong>NavMeshSurface:</strong> Unity 6 AI Navigation package for fast polygon-based pathfinding.
                </div>
            </div>
        </div>

        <div class="unity-inspector">
            <div class="unity-inspector-header">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="display: inline-block; width: 14px; height: 14px; background: #505050; border-radius: 2px; text-align: center; line-height: 14px; font-size: 10px; font-weight: 900; color: #ffffff;">#</span>
                    <span>Project Settings &bull; Physics (3D Simulation Core)</span>
                </div>
                <span style="font-size: 0.68rem; background: #2b2b2b; color: #8bc34a; padding: 2px 6px; border-radius: 3px; border: 1px solid #383838;">Unity 6 Engine Default</span>
            </div>
            <div class="unity-inspector-body">
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Gravity</span>
                    <div class="unity-vec3">
                        <div class="unity-vec3-field"><span class="unity-badge-x">X</span> 0.00</div>
                        <div class="unity-vec3-field"><span class="unity-badge-y">Y</span> -20.00</div>
                        <div class="unity-vec3-field"><span class="unity-badge-z">Z</span> 0.00</div>
                    </div>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Default Solver Iterations</span>
                    <span class="unity-prop-val">8</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Default Solver Velocity Iterations</span>
                    <span class="unity-prop-val">2</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Auto Simulation / Auto Sync Transforms</span>
                    <span class="unity-prop-val">[X] Enabled / [X] Enabled</span>
                </div>
            </div>
        </div>

        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-top: 12px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Anti-Pattern:</div>
            Importing detailed 3D environment art before verifying player metrics and camera clearance. This leads to costly rework when players get stuck in narrow corridors or jump heights mismatch ledge positions.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Build, playtest, and tune your level layout in greybox blocks first. Only begin final 3D asset modeling once the gameplay metrics are locked.
        </div>
    </div>`,
    notes: "Welcome to Lesson 06: 3D Block Prototyping & Greyboxing. Today we transition from 2D mechanics to 3D world space. Emphasize that greyboxing is the industry standard approach to validating level design and gameplay feel before any artistic asset production begins."
  },

  // Slide 2: 3D Spatial Architecture & Coordinate System
  {
    title: "From 2D Pixels to 3D World Space: Coordinate Systems & Scaling",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">Left-Handed Y-Up Coordinate System</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Unity operates on a <strong>Left-Handed Cartesian System</strong> where:
                    </p>
                    <ul style="font-size: 0.82rem; color: #475569; margin-top: 8px; line-height: 1.45; padding-left: 16px;">
                        <li><strong>+X (Thumb):</strong> Points Right (Horizontal East).</li>
                        <li><strong>+Y (Index):</strong> Points Up (Vertical Altitude).</li>
                        <li><strong>+Z (Middle):</strong> Points Forward (Depth into screen / North).</li>
                    </ul>
                    <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 8px 10px; margin-top: 10px; font-size: 0.80rem; color: #0f172a;">
                        <strong>Vector Reference:</strong><br>
                        <code>Vector3.forward = (0, 0, 1)</code><br>
                        <code>Vector3.right = (1, 0, 0)</code><br>
                        <code>Vector3.up = (0, 1, 0)</code>
                    </div>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card primary" style="border-left-color: #059669;">
                <div class="card-title core" style="color: #047857;">The 1 Unity Unit = 1 Meter Standard</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Unity physics, lighting, and audio attenuation are calibrated to real-world meters:
                    </p>
                    <ul style="font-size: 0.82rem; color: #065f46; margin-top: 8px; line-height: 1.45; padding-left: 16px;">
                        <li><strong>Rigidbodies:</strong> Gravity at <code>-9.81 m/s²</code> feels floaty on tiny objects if scales are off.</li>
                        <li><strong>NavMesh:</strong> Agent radius (0.5m) and step height (0.4m) assume human meter scale.</li>
                        <li><strong>Light Attenuation:</strong> Inverse-square light dropoff requires accurate room dimensions.</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">COORDINATES &amp; WORLD SPACE</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            World Space is the global coordinate grid where the entire level resides. Local Space is the relative offset from a parent GameObject. Always verify whether a script is querying <code>transform.position</code> (World) or <code>transform.localPosition</code> (Relative Parent Space).
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">World vs Local Space:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    <strong>World Space:</strong> Absolute origin at <code>(0,0,0)</code>. Used for physics raycasts, NavMesh paths, and distances between independent entities.<br>
                    <strong>Local Space:</strong> Relative to parent. Moving a parent vehicle moves all child passengers automatically.
                </div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Handedness in 3D Engines:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    <strong>Unity:</strong> Left-Handed (+Y Up, +Z Forward).<br>
                    <strong>Blender / Unreal:</strong> Right-Handed (Blender: +Z Up, Unreal: Left-Handed Z-Up). Unity automatically flips coordinates on FBX import, but manual procedural meshes must respect Unity's Left-Handed winding order.
                </div>
            </div>
        </div>

        <div class="unity-inspector">
            <div class="unity-inspector-header">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="display: inline-block; width: 14px; height: 14px; background: #505050; border-radius: 2px; text-align: center; line-height: 14px; font-size: 10px; font-weight: 900; color: #ffffff;">#</span>
                    <span>Transform Component &bull; World Anchor Definition</span>
                </div>
                <span style="font-size: 0.68rem; background: #2b2b2b; color: #8bc34a; padding: 2px 6px; border-radius: 3px; border: 1px solid #383838;">Inspector Standard</span>
            </div>
            <div class="unity-inspector-body">
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Position (World Coordinates)</span>
                    <div class="unity-vec3">
                        <div class="unity-vec3-field"><span class="unity-badge-x">X</span> 0.00</div>
                        <div class="unity-vec3-field"><span class="unity-badge-y">Y</span> 0.00</div>
                        <div class="unity-vec3-field"><span class="unity-badge-z">Z</span> 0.00</div>
                    </div>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Rotation (Euler Angles)</span>
                    <div class="unity-vec3">
                        <div class="unity-vec3-field"><span class="unity-badge-x">X</span> 0.00</div>
                        <div class="unity-vec3-field"><span class="unity-badge-y">Y</span> 0.00</div>
                        <div class="unity-vec3-field"><span class="unity-badge-z">Z</span> 0.00</div>
                    </div>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Scale (Unit Ratio 1:1)</span>
                    <div class="unity-vec3">
                        <div class="unity-vec3-field"><span class="unity-badge-x">X</span> 1.00</div>
                        <div class="unity-vec3-field"><span class="unity-badge-y">Y</span> 1.00</div>
                        <div class="unity-vec3-field"><span class="unity-badge-z">Z</span> 1.00</div>
                    </div>
                </div>
            </div>
        </div>

        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-top: 12px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Scaling parent GameObjects non-uniformly (e.g. <code>(1, 2.5, 0.4)</code>). Non-uniform parent scales distort child BoxColliders and cause CharacterController physics sweeps to glitch against wall edges.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Keep Transform Scale at <code>(1, 1, 1)</code> for all parent root containers. Change geometry dimensions inside the mesh or collider, never by stretching the parent root scale.
        </div>
    </div>`,
    notes: "Explain the coordinate system differences. Point out that 1 unit = 1 meter is not arbitrary; physics gravity, NavMesh defaults, and lighting dropoff all rely on it."
  },

  // Slide 3: Level Design Metrics Standard
  {
    title: "Level Design Metrics: Architectural Standards & Player Clearance",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">Standard Humanoid Character Metrics</div>
                <div class="card-body">
                    <table style="width: 100%; font-size: 0.80rem; border-collapse: collapse; text-align: left;">
                        <tr style="border-bottom: 1.5px solid #cbd5e1; color: #0f172a;">
                            <th style="padding: 4px 6px;">Metric Feature</th>
                            <th style="padding: 4px 6px;">Standard Dimension</th>
                            <th style="padding: 4px 6px;">Rationale</th>
                        </tr>
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 4px 6px;"><strong>Player Height</strong></td>
                            <td style="padding: 4px 6px; color: #0284c7; font-weight: 700;">1.8m - 2.0m</td>
                            <td style="padding: 4px 6px;">Standard humanoid capsule.</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 4px 6px;"><strong>Player Radius</strong></td>
                            <td style="padding: 4px 6px; color: #0284c7; font-weight: 700;">0.35m - 0.45m</td>
                            <td style="padding: 4px 6px;">Shoulder width (0.8m diameter).</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 4px 6px;"><strong>Eye Height</strong></td>
                            <td style="padding: 4px 6px; color: #0284c7; font-weight: 700;">1.6m - 1.7m</td>
                            <td style="padding: 4px 6px;">First-person camera horizon.</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 6px;"><strong>Step Climb</strong></td>
                            <td style="padding: 4px 6px; color: #0284c7; font-weight: 700;">0.3m - 0.4m</td>
                            <td style="padding: 4px 6px;">Max step height without jumping.</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card primary" style="border-left-color: #d97706;">
                <div class="card-title core" style="color: #b45309;">Spatial Architecture Standards</div>
                <div class="card-body">
                    <table style="width: 100%; font-size: 0.80rem; border-collapse: collapse; text-align: left;">
                        <tr style="border-bottom: 1.5px solid #cbd5e1; color: #0f172a;">
                            <th style="padding: 4px 6px;">Element</th>
                            <th style="padding: 4px 6px;">Metric Clearance</th>
                            <th style="padding: 4px 6px;">Buffer Margin</th>
                        </tr>
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 4px 6px;"><strong>Doorways</strong></td>
                            <td style="padding: 4px 6px; color: #d97706; font-weight: 700;">1.2m W x 2.4m H</td>
                            <td style="padding: 4px 6px;">+0.4m clearance to prevent snags.</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 4px 6px;"><strong>Corridors</strong></td>
                            <td style="padding: 4px 6px; color: #d97706; font-weight: 700;">2.5m - 3.0m Wide</td>
                            <td style="padding: 4px 6px;">Allows 3rd-person camera orbit.</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 4px 6px;"><strong>Full Cover</strong></td>
                            <td style="padding: 4px 6px; color: #d97706; font-weight: 700;">1.8m - 2.0m High</td>
                            <td style="padding: 4px 6px;">Completely conceals standing player.</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 6px;"><strong>Half Cover / Vault</strong></td>
                            <td style="padding: 4px 6px; color: #d97706; font-weight: 700;">1.0m - 1.1m High</td>
                            <td style="padding: 4px 6px;">Allows crouching cover &amp; vaulting.</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">METRIC ARCHITECTURE</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            Game metrics are physical contracts between the player controller, camera rig, and environment geometry. If a door is 2.0m high and the player is 2.0m high, any micro-bounce from movement physics will collide with the lintel and stop the player cold. Always add 20-30% buffer margin to architectural clearances.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Stairs vs Ramps:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    Visual stairs with individual step colliders produce jittery camera movement. In production greyboxing, stair visual meshes are paired with an invisible <strong>smooth ramp collider (angle &lt;= 45 deg)</strong> for silky-smooth character traversal.
                </div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Corridor Width vs 3rd Person Camera:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    A 1.5m hallway is realistic in real life, but in a 3rd-person game, a camera orbiting 3m behind the player will collide with the side walls, zooming aggressively into the player's skull. Minimum 3rd-person corridor width is 2.5m - 3.0m.
                </div>
            </div>
        </div>

        <div class="unity-inspector">
            <div class="unity-inspector-header">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="display: inline-block; width: 14px; height: 14px; background: #505050; border-radius: 2px; text-align: center; line-height: 14px; font-size: 10px; font-weight: 900; color: #ffffff;">#</span>
                    <span>BoxCollider &bull; Metric Doorway Frame Clearance</span>
                </div>
                <span style="font-size: 0.68rem; background: #2b2b2b; color: #8bc34a; padding: 2px 6px; border-radius: 3px; border: 1px solid #383838;">Unity 6 Metric Component</span>
            </div>
            <div class="unity-inspector-body">
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Is Trigger</span>
                    <span class="unity-prop-val">[ ] False</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Material</span>
                    <span class="unity-prop-val">None (PhysicMaterial)</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Center</span>
                    <div class="unity-vec3">
                        <div class="unity-vec3-field"><span class="unity-badge-x">X</span> 0.00</div>
                        <div class="unity-vec3-field"><span class="unity-badge-y">Y</span> 1.20</div>
                        <div class="unity-vec3-field"><span class="unity-badge-z">Z</span> 0.00</div>
                    </div>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Size (Clearance Standard)</span>
                    <div class="unity-vec3">
                        <div class="unity-vec3-field"><span class="unity-badge-x">X</span> 1.20</div>
                        <div class="unity-vec3-field"><span class="unity-badge-y">Y</span> 2.40</div>
                        <div class="unity-vec3-field"><span class="unity-badge-z">Z</span> 0.20</div>
                    </div>
                </div>
            </div>
        </div>

        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-top: 12px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Building doorways that match real-world house doors (0.8m wide, 2.0m high). In 3D games with camera lag and character inertia, narrow doors feel claustrophobic and cause frequent snagging.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Make doorways at least 1.2m wide and 2.4m tall. Use 1.0m half-cover and 2.0m full-cover heights across all arenas.
        </div>
    </div>`,
    notes: "Walk through the architectural metric table. Point out why video games exaggerate real-world scale: cameras require clearance and player movement inertia needs generous corridors."
  },

  // Slide 4: Greybox Color Paletting & Readability
  {
    title: "Functional Color Paletting: 5-Tone Readability Standard",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">The 5-Tone Functional Palette</div>
                <div class="card-body">
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <div style="display: flex; align-items: center; gap: 10px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 10px;">
                            <div style="width: 22px; height: 22px; background: #e2e8f0; border: 1px solid #94a3b8; border-radius: 4px;"></div>
                            <div style="font-size: 0.82rem; color: #0f172a;"><strong>Light Grey (#e2e8f0):</strong> Walkable Ground &amp; Floors.</div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 10px;">
                            <div style="width: 22px; height: 22px; background: #64748b; border: 1px solid #334155; border-radius: 4px;"></div>
                            <div style="font-size: 0.82rem; color: #0f172a;"><strong>Slate Dark Grey (#64748b):</strong> Non-traversable Obstacles &amp; Boundary Walls.</div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 10px;">
                            <div style="width: 22px; height: 22px; background: #d97706; border: 1px solid #b45309; border-radius: 4px;"></div>
                            <div style="font-size: 0.82rem; color: #0f172a;"><strong>Orange (#d97706):</strong> Cover Objects &amp; Vaultable Mantles.</div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 10px;">
                            <div style="width: 22px; height: 22px; background: #ef4444; border: 1px solid #b91c1c; border-radius: 4px;"></div>
                            <div style="font-size: 0.82rem; color: #0f172a;"><strong>Crimson Red (#ef4444):</strong> Hazards, Pits &amp; Lethal Killzones.</div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 10px;">
                            <div style="width: 22px; height: 22px; background: #10b981; border: 1px solid #047857; border-radius: 4px;"></div>
                            <div style="font-size: 0.82rem; color: #0f172a;"><strong>Emerald Green (#10b981):</strong> Objectives, Keycards &amp; Exit Portals.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card primary" style="border-left-color: #059669;">
                <div class="card-title core" style="color: #047857;">Orientation &amp; Landmarks (Weenie Principle)</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        A player placed in a blockout arena must instinctively know their heading without a minimap:
                    </p>
                    <ul style="font-size: 0.82rem; color: #1e293b; margin-top: 8px; line-height: 1.45; padding-left: 16px;">
                        <li><strong>Major Landmark (The Weenie):</strong> A tall tower, distinct statue, or glowing gateway visible from 80% of the arena.</li>
                        <li><strong>Lighting Contrast:</strong> Bright key light pools on objectives, subdued fill light in secondary side paths.</li>
                        <li><strong>Framing:</strong> Align doorways and arches to frame the destination ahead.</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">VISUAL READABILITY</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            In greybox testing, visual clarity is a functional mechanic. Players process color and value contrast in milliseconds. If walkable floors and lethal hazards share the same uniform grey tone, playtesters will die randomly and blame the game. Color coding provides instant affordance.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Checkered Prototyping Texture:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    Apply a 1-meter checkered grid texture to all greybox materials. This enables instant spatial measurement: developers and testers can immediately see how many meters wide a room or jump gap is.
                </div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Visual Value Hierarchy:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    Keep walkable paths high-value (light grey), perimeter boundaries low-value (dark slate), and interactive entities saturated (orange, green, red). High contrast guides the player's eye naturally.
                </div>
            </div>
        </div>

        <div class="unity-inspector">
            <div class="unity-inspector-header">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="display: inline-block; width: 14px; height: 14px; background: #505050; border-radius: 2px; text-align: center; line-height: 14px; font-size: 10px; font-weight: 900; color: #ffffff;">#</span>
                    <span>MeshRenderer &bull; URP Lit Material (Greybox Prototype Setup)</span>
                </div>
                <span style="font-size: 0.68rem; background: #2b2b2b; color: #8bc34a; padding: 2px 6px; border-radius: 3px; border: 1px solid #383838;">URP Material</span>
            </div>
            <div class="unity-inspector-body">
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Shader</span>
                    <span class="unity-prop-val">Universal Render Pipeline/Lit</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Base Map</span>
                    <span class="unity-prop-val">T_Grid_1m_Checkered (Texture2D)</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Base Color</span>
                    <span class="unity-prop-val">#64748B (Slate Obstacle)</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Metallic / Smoothness</span>
                    <span class="unity-prop-val">0.00 / 0.10 (Matte Non-Reflective)</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Cast Shadows / Receive Shadows</span>
                    <span class="unity-prop-val">On / [X] True</span>
                </div>
            </div>
        </div>

        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-top: 12px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Using a single uniform default grey material for everything in the scene. Without tone differentiation, 3D depth perception collapses, and playtesters cannot distinguish climbable ledges from lethal pits.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Create 5 distinct URP materials for your 5-tone palette in a <code>Materials/Greybox</code> folder on Day 1. Never leave a level untextured in flat default white.
        </div>
    </div>`,
    notes: "Review the 5-tone palette. Emphasize that greyboxing is not about making ugly levels; it is about communicating spatial hierarchy clearly so playtesters test the game mechanics, not their navigation confusion."
  },

  // Slide 5: 3D Level Metrics: Jump Arcs & Clearance Formulas
  {
    title: "3D Level Metrics: Jump Arcs & Clearance Formulas",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">Ballistic Kinematics: Computing Launch Velocity</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Rather than guessing impulse forces, professional 3D action games compute exact vertical velocity from desired height:
                    </p>
                    <div class="code-box" style="font-size: 0.72rem; line-height: 1.35; margin: 8px 0;">
                        <pre><code><span class="r-cm">// 1. Compute exact vertical velocity for target height (h)</span>
float initialJumpVelocity = Mathf.Sqrt(2f * gravity * jumpHeight);

<span class="r-cm">// 2. Compute flight duration for metric gap validation</span>
float timeToApex = initialJumpVelocity / gravity;
float totalHangTime = 2f * timeToApex;
float maxJumpDistance = horizontalSpeed * totalHangTime;</code></pre>
                    </div>
                    <ul style="font-size: 0.80rem; color: #475569; line-height: 1.4; padding-left: 16px;">
                        <li><strong>Height (h = 2.0m):</strong> Player jumps exactly onto 2m elevated ledges.</li>
                        <li><strong>Gravity (g = 20-25 m/s²):</strong> Snappy 0.4s apex prevents floatiness.</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card primary" style="border-left-color: #059669;">
                <div class="card-title core" style="color: #047857;">Standard Metric Clearances in Greybox</div>
                <div class="card-body">
                    <ul style="font-size: 0.82rem; color: #065f46; line-height: 1.45; padding-left: 16px;">
                        <li><strong>Standard Vault Ledge:</strong> <code>1.0m - 1.2m</code> (reachable without full jump).</li>
                        <li><strong>Standard Jump Platform:</strong> <code>1.8m - 2.2m</code> (clean single-jump clearance).</li>
                        <li><strong>Walking Gap Pit:</strong> <code>2.0m - 3.0m</code> (cleared at standard 6.0 m/s run speed).</li>
                        <li><strong>Sprint Leap Chasm:</strong> <code>4.0m - 5.5m</code> (requires 9.0 m/s sprint velocity).</li>
                        <li><strong>Ceiling Headroom:</strong> Minimum <code>3.5m</code> clearance above floors to prevent camera clipping.</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">JUMP BALLISTICS</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            Jump physics in game development are solved backwards. Rather than applying an arbitrary impulse force, designers specify the desired jump height (h) and time to apex (tApex). The engine computes launch velocity: <code>vy0 = sqrt(2 * g * h)</code>.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Physics Equations for Kinematic Jumps:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    <code>vy0 = Math.Sqrt(2f * gravity * jumpHeight)</code><br>
                    <code>tApex = vy0 / gravity</code><br>
                    <code>tHang = 2f * tApex</code><br>
                    <code>maxJumpDistance = horizontalSpeed * tHang</code>
                </div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Snappy Action vs Floaty Simulation:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    Real-world Earth gravity (<code>9.81 m/s²</code>) feels slow and floaty in third-person games. Double or triple gravity (<code>20.0 - 25.0 m/s²</code>) gives immediate responsiveness and athletic weight.
                </div>
            </div>
        </div>

        <div class="unity-inspector">
            <div class="unity-inspector-header">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="display: inline-block; width: 14px; height: 14px; background: #505050; border-radius: 2px; text-align: center; line-height: 14px; font-size: 10px; font-weight: 900; color: #ffffff;">#</span>
                    <span>PlayerController3D &bull; Kinematic Jump &amp; Gravity Configuration</span>
                </div>
                <span style="font-size: 0.68rem; background: #2b2b2b; color: #8bc34a; padding: 2px 6px; border-radius: 3px; border: 1px solid #383838;">Inspector Configuration</span>
            </div>
            <div class="unity-inspector-body">
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Move Speed / Sprint Multiplier</span>
                    <span class="unity-prop-val">6.00 m/s / 1.50x</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Jump Height</span>
                    <span class="unity-prop-val">2.00 m</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Gravity</span>
                    <span class="unity-prop-val">22.00 m/s² (Snappy Action)</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Ground Check Radius / Offset</span>
                    <span class="unity-prop-val">0.28 m / -0.85 m (SphereCast)</span>
                </div>
            </div>
        </div>

        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-top: 12px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Using realistic Earth gravity (<code>9.81 m/s²</code>). The character lingers in the air for over a full second, making platforming precision impossible.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Set gravity to <code>20.0 - 25.0 m/s²</code> and compute jump launch velocity using <code>Mathf.Sqrt(2f * gravity * jumpHeight)</code>.
        </div>
    </div>`,
    notes: "Review ballistic jump equations. Explain why game gravity must be 2x-3x Earth gravity for responsive platforming feel."
  },

  // Slide 6: ProBuilder In-Engine Mesh Editing
  {
    title: "ProBuilder Geometry Editing: In-Engine Rapid Blockouts",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">Sub-Object Element Modes</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        ProBuilder adds in-editor mesh modeling directly inside Unity's Scene view:
                    </p>
                    <ul style="font-size: 0.82rem; color: #475569; margin-top: 8px; line-height: 1.45; padding-left: 16px;">
                        <li><strong>Object Mode:</strong> Selects and transforms entire GameObjects.</li>
                        <li><strong>Vertex Mode:</strong> Move individual vertex coordinates to tweak slopes.</li>
                        <li><strong>Edge Mode:</strong> Select edges to bevel, chamfer, or insert edge loops.</li>
                        <li><strong>Face Mode:</strong> Extrude, inset, or delete polygon faces.</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card primary" style="border-left-color: #059669;">
                <div class="card-title core" style="color: #047857;">Core ProBuilder Modeling Operations</div>
                <div class="card-body">
                    <ul style="font-size: 0.82rem; color: #065f46; line-height: 1.45; padding-left: 16px;">
                        <li><strong>Shift + Extrude:</strong> Holding Shift while dragging a face creates an instant connected room or hallway segment.</li>
                        <li><strong>Connect Edges:</strong> Select two opposing edges and click Connect to insert a clean divider edge loop.</li>
                        <li><strong>Bevel:</strong> Rounds sharp 90-degree corner edges into smooth beveled angles.</li>
                        <li><strong>Subdivide:</strong> Increases polygon density uniformly across selected faces.</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">GEOMETRY TOOLING</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            ProBuilder turns Unity into an architectural sketching sandbox. Instead of jumping back and forth to external DCC tools (Blender / Maya) for minor metric adjustments, you sculpt and test rooms directly in the scene viewport.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">ProBuilder Mesh Lifecycle:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    ProBuilder meshes contain internal authoring data. In final release builds, meshes can be exported to standard <code>.obj</code> or <code>.asset</code> static meshes with zero runtime memory overhead.
                </div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Automatic Collider Generation:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    ProBuilder automatically recalculates and updates the attached <code>MeshCollider</code> every time a face is extruded or modified, maintaining immediate physics synchronization.
                </div>
            </div>
        </div>

        <div class="unity-inspector">
            <div class="unity-inspector-header">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="display: inline-block; width: 14px; height: 14px; background: #505050; border-radius: 2px; text-align: center; line-height: 14px; font-size: 10px; font-weight: 900; color: #ffffff;">#</span>
                    <span>ProBuilder Mesh &bull; Component &amp; Mode Toolbar</span>
                </div>
                <span style="font-size: 0.68rem; background: #2b2b2b; color: #8bc34a; padding: 2px 6px; border-radius: 3px; border: 1px solid #383838;">Unity 6 Package</span>
            </div>
            <div class="unity-inspector-body">
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Active Element Mode</span>
                    <span class="unity-prop-val">[Object] [Vertex] [Edge] [<strong>Face</strong>]</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Extrude Face Distance</span>
                    <span class="unity-prop-val">1.00 m (Shortcut: Shift + Drag)</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Bevel Edges</span>
                    <span class="unity-prop-val">0.05 m (1 Iteration)</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Collider Type</span>
                    <span class="unity-prop-val">Mesh Collider (Auto-Updated)</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Submesh Materials</span>
                    <span class="unity-prop-val">Size: 2 (M_Greybox_Floor, M_Greybox_Wall)</span>
                </div>
            </div>
        </div>

        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-top: 12px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Inverting face normals accidentally during complex extrusions. When face normals point inward, backface culling makes walls invisible from the outside and physics raycasts pass straight through them.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Install ProBuilder via the Unity Package Manager. Use <code>Shift + Drag</code> on faces with 1-meter grid snapping to extrude seamless level geometry without gaps.
        </div>
    </div>`,
    notes: "Introduce ProBuilder. Show students how to open Tools -> ProBuilder -> ProBuilder Window and demonstrate the four selection modes: Object, Vertex, Edge, and Face."
  },

  // Slide 7: Snapping Mechanics: Grid Snapping vs Vertex Snapping
  {
    title: "Precision Geometry: Grid Snapping vs Vertex Snapping",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">Grid Snapping (Ctrl + G / Increment Snap)</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Locks movement transformations to strict discrete metric intervals:
                    </p>
                    <ul style="font-size: 0.82rem; color: #475569; margin-top: 8px; line-height: 1.45; padding-left: 16px;">
                        <li><strong>1.0m Grid:</strong> For main room walls, floor tiles, and corridors.</li>
                        <li><strong>0.5m Grid:</strong> For doorways, windows, and cover blockouts.</li>
                        <li><strong>0.25m Grid:</strong> For stair risers and detailed obstacle ledges.</li>
                        <li><strong>Shortcut:</strong> Hold <code>Ctrl</code> while dragging gizmos to snap to increments.</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card primary" style="border-left-color: #059669;">
                <div class="card-title core" style="color: #047857;">Vertex Snapping (V-Key Pivot Align)</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Pins two meshes corner-to-corner with zero sub-millimeter gap:
                    </p>
                    <ul style="font-size: 0.82rem; color: #065f46; margin-top: 8px; line-height: 1.45; padding-left: 16px;">
                        <li><strong>Step 1:</strong> Select the mesh you want to move.</li>
                        <li><strong>Step 2:</strong> Hold the <code>V</code> key to reveal vertex anchor handles.</li>
                        <li><strong>Step 3:</strong> Click and drag the desired corner vertex onto the target corner vertex of another object.</li>
                        <li><strong>Result:</strong> Zero light leaks, zero physics seam snags.</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">PRECISION SNAPPING</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            Imagine building a house with LEGO bricks. If the bricks are not snapped tightly into the studs, microscopic gaps accumulate. When lighting is baked, light bleeds through tiny 0.001m cracks, and player colliders catch on internal seam edges.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Light Leaks on Seams:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    When meshes are placed manually without vertex snapping, sub-millimeter gaps allow directional sunlight to bleed into fully enclosed indoor rooms during shadow mapping and light baking.
                </div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Physics Ghost Collisions:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    If two floor boxes overlap unevenly by <code>0.02m</code>, a player moving across the seam hits an invisible micro-ledge and halts abruptly. Snapping eliminates ghost collisions.
                </div>
            </div>
        </div>

        <div class="unity-inspector">
            <div class="unity-inspector-header">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="display: inline-block; width: 14px; height: 14px; background: #505050; border-radius: 2px; text-align: center; line-height: 14px; font-size: 10px; font-weight: 900; color: #ffffff;">#</span>
                    <span>Grid &amp; Snap Settings &bull; Unity 6 Editor Precision Window</span>
                </div>
                <span style="font-size: 0.68rem; background: #2b2b2b; color: #8bc34a; padding: 2px 6px; border-radius: 3px; border: 1px solid #383838;">Editor Settings</span>
            </div>
            <div class="unity-inspector-body">
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Grid Size (World Meter Units)</span>
                    <div class="unity-vec3">
                        <div class="unity-vec3-field"><span class="unity-badge-x">X</span> 1.00</div>
                        <div class="unity-vec3-field"><span class="unity-badge-y">Y</span> 1.00</div>
                        <div class="unity-vec3-field"><span class="unity-badge-z">Z</span> 1.00</div>
                    </div>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Increment Snap - Move</span>
                    <span class="unity-prop-val">1.00 m (Toggle: Hold Ctrl)</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Increment Snap - Rotate</span>
                    <span class="unity-prop-val">15.00 deg</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Increment Snap - Scale</span>
                    <span class="unity-prop-val">1.00</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Vertex Snapping</span>
                    <span class="unity-prop-val">[V] Key Active &bull; Corner to Corner</span>
                </div>
            </div>
        </div>

        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-top: 12px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Dragging objects by eye without snapping. Coordinate values in the Inspector end up as dirty floats like <code>3.00412</code> or <code>-1.9987</code>, making metric alignment and modular tile reuse impossible.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Keep Grid Snap enabled at 1.0m. Use the <code>V</code> key (Vertex Snapping) for placing modular wall corners and stairs.
        </div>
    </div>`,
    notes: "Demonstrate Vertex Snapping live: press V, hover over a corner vertex, and snap it to another mesh corner. Remind students never to position level geometry with freehand dragging."
  },

  // Slide 8: 3D Kinematics: CharacterController vs Rigidbody 3D
  {
    title: "3D Kinematics: CharacterController vs Rigidbody 3D",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">CharacterController (Kinematic Displacement)</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Specialized swept-capsule for arcade and action character movement:
                    </p>
                    <ul style="font-size: 0.82rem; color: #475569; margin-top: 8px; line-height: 1.45; padding-left: 16px;">
                        <li><strong>No Dynamic Physics:</strong> Immune to unwanted tipping, torque, or friction sticking.</li>
                        <li><strong>Built-in Step Offset:</strong> Automatically steps over curbs and stairs up to <code>0.4m</code>.</li>
                        <li><strong>Slope Handling:</strong> Slides down slopes steeper than <code>Slope Limit (45 deg)</code>.</li>
                        <li><strong>Displacement Method:</strong> <code>controller.Move(velocity * Time.deltaTime);</code>.</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card primary" style="border-left-color: #d97706;">
                <div class="card-title core" style="color: #b45309;">Rigidbody 3D (PhysX Dynamic Simulation)</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Full PhysX simulation driven by forces, momentum, and collisions:
                    </p>
                    <ul style="font-size: 0.82rem; color: #b45309; margin-top: 8px; line-height: 1.45; padding-left: 16px;">
                        <li><strong>Physics Interaction:</strong> Pushes crates, rides realistic moving elevators, bounces.</li>
                        <li><strong>Requires FixedUpdate:</strong> Must be updated in <code>FixedUpdate</code> via <code>rb.linearVelocity</code> or <code>rb.AddForce</code>.</li>
                        <li><strong>Constraints Needed:</strong> Must freeze X and Z rotation to prevent the capsule from toppling over.</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">KINEMATICS COMPARISON</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            A CharacterController is like a motorized bulldozer: it computes swept geometry sweeps every frame and moves exactly where code dictates. A Rigidbody is like a marble rolling down a slope: it is subject to all PhysX environmental forces, friction, and impacts.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">When to Use CharacterController:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    First-person shooters, 3rd-person action games, and platformers where responsive, instant input responsiveness and precise stair climbing are paramount.
                </div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">When to Use Rigidbody 3D:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    Physics puzzle games, vehicles, ragdoll simulations, or games where external forces (explosions, conveyor belts) dictate character momentum.
                </div>
            </div>
        </div>

        <div class="unity-inspector">
            <div class="unity-inspector-header">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="display: inline-block; width: 14px; height: 14px; background: #505050; border-radius: 2px; text-align: center; line-height: 14px; font-size: 10px; font-weight: 900; color: #ffffff;">#</span>
                    <span>CharacterController vs Rigidbody 3D Inspector Comparison</span>
                </div>
                <span style="font-size: 0.68rem; background: #2b2b2b; color: #8bc34a; padding: 2px 6px; border-radius: 3px; border: 1px solid #383838;">Architecture Trade-Off</span>
            </div>
            <div class="unity-inspector-body">
                <div class="unity-prop-row">
                    <span class="unity-prop-label">CharacterController</span>
                    <span class="unity-prop-val">Slope: 45° &bull; Step: 0.4m &bull; Skin: 0.08m &bull; Kinematic Sweep</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Rigidbody 3D</span>
                    <span class="unity-prop-val">Mass: 70kg &bull; Drag: 0 &bull; Interpolate: On &bull; Freeze Rot X/Y/Z</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Movement Loop</span>
                    <span class="unity-prop-val">Update() -> controller.Move() vs FixedUpdate() -> rb.linearVelocity</span>
                </div>
            </div>
        </div>

        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-top: 12px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Attaching BOTH a <code>CharacterController</code> and a <code>Rigidbody</code> to the same GameObject without disabling kinematic mode. The two physics components fight over Transform ownership, causing high-frequency jitter.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> For standard 3D character movement, use a standalone <code>CharacterController</code> component. Handle custom gravity and jumping mathematically in code.
        </div>
    </div>`,
    notes: "Clarify the difference between CharacterController and Rigidbody. Emphasize that CharacterController is not a physics body; it is a swept-capsule query system designed for arcade responsiveness."
  },

  // Slide 9: Camera-Relative Vector Math Inspector
  {
    title: "Interactive Simulator: Camera-Relative Vector Math Inspector",
    content: `<div style="background: #090d16; border: 1.5px solid #1e293b; border-radius: 10px; padding: 14px; color: #f8fafc;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 8px; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
            <div style="font-weight: 900; color: #38bdf8; font-size: 0.96rem;">Camera-Relative Vector Math Inspector (3D Three.js WebGL)</div>
            <div style="font-size: 0.76rem; color: #94a3b8;">Transforming 2D Input (WASD) relative to Camera Orbit Yaw</div>
        </div>
        
        <div style="display: grid; grid-template-columns: minmax(calc(240px * var(--font-scale, 1)), calc(300px * var(--font-scale, 1))) 1fr minmax(calc(240px * var(--font-scale, 1)), calc(320px * var(--font-scale, 1))); gap: 12px; align-items: stretch;">
            <!-- Left: Inputs & Camera Controls -->
            <div style="background: #111827; border: 1px solid #374151; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 8px;">
                <div style="font-weight: 800; color: #60a5fa; font-size: 0.84rem;">CAMERA ORBIT YAW</div>
                
                <div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.74rem; color: #94a3b8;">
                        <span>Camera Yaw Angle:</span> <strong id="camYawValue" style="color: #38bdf8;">45°</strong>
                    </div>
                    <input id="sliderCamYaw" type="range" min="0" max="360" step="5" value="45" style="width: 100%;" oninput="setCamYawSlider(this.value)">
                </div>

                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px;">
                    <button class="sim-action-btn" style="background: #1e293b; border: 1px solid #334155; color: #fff; font-size: 0.68rem;" onclick="setCamYawPreset(0)">0° (N)</button>
                    <button class="sim-action-btn" style="background: #1e293b; border: 1px solid #334155; color: #fff; font-size: 0.68rem;" onclick="setCamYawPreset(45)">45° (NE)</button>
                    <button class="sim-action-btn" style="background: #1e293b; border: 1px solid #334155; color: #fff; font-size: 0.68rem;" onclick="setCamYawPreset(90)">90° (E)</button>
                    <button class="sim-action-btn" style="background: #1e293b; border: 1px solid #334155; color: #fff; font-size: 0.68rem;" onclick="setCamYawPreset(180)">180° (S)</button>
                </div>

                <div style="border-top: 1px solid #1f2937; padding-top: 6px; font-weight: 800; color: #fbbf24; font-size: 0.78rem;">KEYBOARD INPUT (WASD)</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px;">
                    <div></div>
                    <button id="btnInputW" class="sim-action-btn" style="background: #0284c7; border: 1px solid #38bdf8; color: #fff; font-size: 0.74rem; font-weight: 800;" onclick="setRawInput(0, 1)">W (Fwd)</button>
                    <div></div>
                    <button id="btnInputA" class="sim-action-btn" style="background: #1e293b; border: 1px solid #334155; color: #fff; font-size: 0.74rem; font-weight: 800;" onclick="setRawInput(-1, 0)">A (Left)</button>
                    <button id="btnInputS" class="sim-action-btn" style="background: #1e293b; border: 1px solid #334155; color: #fff; font-size: 0.74rem; font-weight: 800;" onclick="setRawInput(0, -1)">S (Back)</button>
                    <button id="btnInputD" class="sim-action-btn" style="background: #1e293b; border: 1px solid #334155; color: #fff; font-size: 0.74rem; font-weight: 800;" onclick="setRawInput(1, 0)">D (Right)</button>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-top: 2px;">
                    <button id="btnInputWA" class="sim-action-btn" style="background: #1e293b; border: 1px solid #334155; color: #fff; font-size: 0.70rem;" onclick="setRawInput(-1, 1)">W + A (Diag)</button>
                    <button id="btnInputWD" class="sim-action-btn" style="background: #1e293b; border: 1px solid #334155; color: #fff; font-size: 0.70rem;" onclick="setRawInput(1, 1)">W + D (Diag)</button>
                </div>

                <div style="border-top: 1px solid #1f2937; padding-top: 6px;">
                    <button id="btnToggleFlatten" class="sim-action-btn" style="background: #059669; border: 1px solid #34d399; color: #fff; font-size: 0.72rem; font-weight: 800;" onclick="toggleFlattenY()">Y-Axis Flattening: ON (Correct)</button>
                </div>
            </div>

            <!-- Center: 3D Three.js Viewport with Canvas Fallback -->
            <div style="background: #050b14; border: 1px solid #1e293b; border-radius: 8px; padding: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;">
                <div id="sim3dCamVecContainer" style="width: 100%; height: 260px; position: relative; border-radius: 4px; overflow: hidden;"></div>
                <canvas id="camVecCanvas" width="460" height="260" style="display: none;"></canvas>
            </div>

            <!-- Right: Code Calculation Breakdown -->
            <div style="background: #111827; border: 1px solid #374151; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 6px;">
                <div style="font-weight: 800; color: #34d399; font-size: 0.84rem;">C# VECTOR MATH DECONSTRUCTION</div>
                
                <div id="camVecCodeBreakdown" class="code-box" style="margin: 0; font-size: 0.72rem; line-height: 1.35; padding: 8px; flex: 1;">
                    <code><span class="r-cm">// 1. Read flattened camera basis vectors</span>
Vector3 camFwd = cameraTransform.forward;
camFwd.y = 0f; camFwd.Normalize();
Vector3 camRight = cameraTransform.right;
camRight.y = 0f; camRight.Normalize();

<span class="r-cm">// 2. Construct move vector from inputs (0, 1)</span>
Vector3 move = (camFwd * 1f + camRight * 0f).normalized;
<span class="r-cm">// Resulting World Vector: (0.71, 0.00, 0.71) at Cam Yaw 45°</span></code>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">VECTOR MATHEMATICS</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            When a player pushes the 'W' key, their intuitive expectation is "Move in the direction the camera is currently looking". Pushing 'D' means "Move right relative to the camera screen". To translate this into 3D world coordinates, we project the camera's forward and right basis vectors onto the horizontal XZ plane.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Why Flatten Y (camFwd.y = 0f):</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    Cameras in 3rd-person games tilt downward (pitch &gt; 0). If you do not zero out <code>camFwd.y</code>, pressing 'W' tries to push the character diagonally down into the ground, losing speed to floor friction.
                </div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Diagonal Normalization:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    Pressing 'W' and 'D' simultaneously gives an input vector of <code>(1, 1)</code> with magnitude <code>1.414</code>. Calling <code>.normalized</code> clamps diagonal movement to <code>1.0</code>, preventing diagonal speed exploiting.
                </div>
            </div>
        </div>

        <div class="unity-inspector">
            <div class="unity-inspector-header">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="display: inline-block; width: 14px; height: 14px; background: #505050; border-radius: 2px; text-align: center; line-height: 14px; font-size: 10px; font-weight: 900; color: #ffffff;">#</span>
                    <span>PlayerMovement3D &bull; Camera Reference &amp; Vector Pipeline</span>
                </div>
                <span style="font-size: 0.68rem; background: #2b2b2b; color: #8bc34a; padding: 2px 6px; border-radius: 3px; border: 1px solid #383838;">Inspector Configuration</span>
            </div>
            <div class="unity-inspector-body">
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Camera Transform</span>
                    <span class="unity-prop-val">MainCamera (Transform)</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Move Speed / Sprint Multiplier</span>
                    <span class="unity-prop-val">6.00 m/s / 1.50x</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Rotation Smooth Time (Slerp)</span>
                    <span class="unity-prop-val">0.10 s</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Flatten Y Basis Vectors</span>
                    <span class="unity-prop-val">[X] True (camFwd.y = 0; camRight.y = 0)</span>
                </div>
            </div>
        </div>

        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-top: 12px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Transforming move vectors using <code>transform.TransformDirection</code> instead of the Camera's basis vectors. The character ends up moving relative to their own forward heading, making orbital camera navigation completely uncontrollable.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Always cache <code>Camera.main.transform</code>, zero out its Y component, normalize it, and construct world move vectors using camera-relative basis math.
        </div>
    </div>`,
    notes: "Demonstrate the Camera-Relative Vector Math simulator. Rotate the camera yaw slider and click WASD buttons to show how the resulting green world vector rotates in lockstep with the camera heading."
  },

  // Slide 10: PlayerController3D: Complete CharacterController Implementation
  {
    title: "PlayerController3D: Complete CharacterController Implementation",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">PlayerController3D.cs (Locomotion &amp; Jump)</div>
                <div class="card-body">
                    <div class="code-box" style="font-size: 0.72rem; line-height: 1.35;">
                        <pre><code>using UnityEngine;

[RequireComponent(typeof(CharacterController))]
public class PlayerController3D : MonoBehaviour
{
    [Header("Locomotion")]
    [SerializeField] private float moveSpeed = 6.0f;
    [SerializeField] private float rotationSpeed = 12.0f;
    [SerializeField] private Transform cameraTransform;

    [Header("Jumping & Gravity")]
    [SerializeField] private float jumpHeight = 2.0f;
    [SerializeField] private float gravity = 20.0f;
    [SerializeField] private LayerMask groundMask;

    private CharacterController controller;
    private float verticalVelocity;
    private bool isGrounded;

    private void Awake()
    {
        controller = GetComponent&lt;CharacterController&gt;();
        if (cameraTransform == null && Camera.main != null)
            cameraTransform = Camera.main.transform;
    }

    private void Update()
    {
        CheckGrounded();
        HandleMovement();
        HandleJumpAndGravity();
    }
}</code></pre>
                    </div>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card primary" style="border-left-color: #059669;">
                <div class="card-title core" style="color: #047857;">Kinematic Move &amp; Rotation Slerp</div>
                <div class="card-body">
                    <div class="code-box" style="font-size: 0.72rem; line-height: 1.35;">
                        <pre><code>private void HandleMovement()
{
    float h = Input.GetAxisRaw("Horizontal");
    float v = Input.GetAxisRaw("Vertical");
    Vector3 input = new Vector3(h, 0f, v).normalized;

    if (input.magnitude &gt; 0.05f)
    {
        Vector3 camFwd = cameraTransform.forward;
        camFwd.y = 0f; camFwd.Normalize();
        Vector3 camRight = cameraTransform.right;
        camRight.y = 0f; camRight.Normalize();

        Vector3 moveDir = (camFwd * input.z + camRight * input.x).normalized;
        controller.Move(moveDir * moveSpeed * Time.deltaTime);

        Quaternion targetRot = Quaternion.LookRotation(moveDir);
        transform.rotation = Quaternion.Slerp(transform.rotation, targetRot, rotationSpeed * Time.deltaTime);
    }
}

private void HandleJumpAndGravity()
{
    if (isGrounded && verticalVelocity &lt; 0f)
        verticalVelocity = -2f; <span class="r-cm">// Snap firmly to ground</span>

    if (isGrounded && Input.GetButtonDown("Jump"))
        verticalVelocity = Mathf.Sqrt(2f * gravity * jumpHeight);

    verticalVelocity -= gravity * Time.deltaTime;
    controller.Move(Vector3.up * verticalVelocity * Time.deltaTime);
}

private void CheckGrounded()
{
    Vector3 spherePos = transform.position + Vector3.up * 0.1f;
    isGrounded = Physics.CheckSphere(spherePos, 0.28f, groundMask, QueryTriggerInteraction.Ignore);
}</code></pre>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">PLAYER CONTROLLER SCRIPT</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            The <code>PlayerController3D</code> script isolates horizontal displacement (controlled by camera orientation and user input) from vertical displacement (governed by ballistic gravity and jump impulses). Both components are fed into <code>controller.Move()</code> to yield rock-solid 3D locomotion.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Why verticalVelocity = -2f:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    When walking down gentle slopes or stairs, setting vertical velocity to exactly <code>0</code> causes the character to float airborne for a fraction of a second. A small negative force (<code>-2.0f</code>) keeps the capsule glued firmly to slopes.
                </div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">CheckSphere Grounding vs controller.isGrounded:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    Unity's built-in <code>controller.isGrounded</code> flag can flicker when moving quickly over polygon seams. An auxiliary <code>Physics.CheckSphere</code> check against a dedicated <code>Ground</code> LayerMask guarantees 100% reliable jump triggers.
                </div>
            </div>
        </div>

        <div class="unity-inspector">
            <div class="unity-inspector-header">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="display: inline-block; width: 14px; height: 14px; background: #505050; border-radius: 2px; text-align: center; line-height: 14px; font-size: 10px; font-weight: 900; color: #ffffff;">#</span>
                    <span>PlayerController3D (Script Component) &bull; Inspector Reference</span>
                </div>
                <span style="font-size: 0.68rem; background: #2b2b2b; color: #8bc34a; padding: 2px 6px; border-radius: 3px; border: 1px solid #383838;">Script Inspector</span>
            </div>
            <div class="unity-inspector-body">
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Camera Transform</span>
                    <span class="unity-prop-val">MainCamera (Transform)</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Move Speed / Rotation Speed</span>
                    <span class="unity-prop-val">6.00 m/s / 12.00 rad/s</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Jump Height / Gravity</span>
                    <span class="unity-prop-val">2.00 m / 20.00 m/s²</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Ground Mask</span>
                    <span class="unity-prop-val">Layer: Ground (Bitmask 1 &lt;&lt; 6)</span>
                </div>
            </div>
        </div>

        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-top: 12px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Forgetting to assign the <code>Ground</code> layer to level geometry. <code>Physics.CheckSphere</code> returns false, preventing the player from ever jumping.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Create a dedicated <code>Ground</code> Layer in Project Settings and assign all walkable ProBuilder floors to it.
        </div>
    </div>`,
    notes: "Review the PlayerController3D script. Highlight the three core methods: CheckGrounded, HandleMovement, and HandleJumpAndGravity."
  },

  // Slide 11: Cinemachine 3.x in Unity 6: CinemachineCamera & Orbital Follow
  {
    title: "Cinemachine 3.x in Unity 6: CinemachineCamera & Orbital Follow",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">Cinemachine 3.x Architecture in Unity 6</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        In Unity 6, Cinemachine has been streamlined into <code>CinemachineCamera</code>:
                    </p>
                    <ul style="font-size: 0.82rem; color: #475569; margin-top: 8px; line-height: 1.45; padding-left: 16px;">
                        <li><strong>CinemachineBrain:</strong> Attached to Main Camera. Controls camera blending and cuts.</li>
                        <li><strong>Tracking Target:</strong> Drag the player's <code>Transform</code> into Tracking Target.</li>
                        <li><strong>Position Control (Body):</strong> Set to <code>CinemachineOrbitalFollow</code> for 3rd-person mouse orbit.</li>
                        <li><strong>Damping:</strong> Smooths out camera hitching during quick player accelerations.</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card primary" style="border-left-color: #059669;">
                <div class="card-title core" style="color: #047857;">Collision Deocclusion &amp; Input Binding</div>
                <div class="card-body">
                    <ul style="font-size: 0.82rem; color: #065f46; line-height: 1.45; padding-left: 16px;">
                        <li><strong>CinemachineDeocclusion (Collider):</strong> Prevents the camera from clipping through level walls by performing raycasts and pulling the camera forward.</li>
                        <li><strong>Input Axis Controller:</strong> Binds Mouse X/Y or Gamepad Right Stick to orbit yaw and pitch.</li>
                        <li><strong>Vertical Damping vs Horizontal:</strong> Set higher vertical damping to keep the horizon stable while running over stairs.</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">CAMERA ARCHITECTURE</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            Cinemachine decouples the physical camera from the player hierarchy. Instead of parenting the camera directly under the character (which causes nauseating camera jitter when the player turns), Cinemachine acts as an invisible robotic camera crane tracking the player with procedural spring damping and obstacle avoidance.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Unity 6 Naming Change:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    In older tutorials, virtual cameras were named <code>CinemachineVirtualCamera</code>. In Unity 6 Cinemachine 3.x, the unified component is <code>CinemachineCamera</code> with modular pipeline extensions.
                </div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Deocclusion Layer Mask:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    Always configure <code>CinemachineDeocclusion</code> to ignore the Player Layer and Transparent FX. If the camera collides with the player capsule itself, it zooms inside the player model.
                </div>
            </div>
        </div>

        <div class="unity-inspector">
            <div class="unity-inspector-header">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="display: inline-block; width: 14px; height: 14px; background: #505050; border-radius: 2px; text-align: center; line-height: 14px; font-size: 10px; font-weight: 900; color: #ffffff;">#</span>
                    <span>CinemachineCamera &bull; Orbital 3rd-Person Follow Rig</span>
                </div>
                <span style="font-size: 0.68rem; background: #2b2b2b; color: #8bc34a; padding: 2px 6px; border-radius: 3px; border: 1px solid #383838;">Cinemachine 3.x</span>
            </div>
            <div class="unity-inspector-body">
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Tracking Target</span>
                    <span class="unity-prop-val">Player_CharacterController (Transform)</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Position Control (Body)</span>
                    <span class="unity-prop-val">CinemachineOrbitalFollow</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Orbit Radius / Height</span>
                    <span class="unity-prop-val">5.00 m / 1.80 m</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Damping (X, Y, Z)</span>
                    <div class="unity-vec3">
                        <div class="unity-vec3-field"><span class="unity-badge-x">X</span> 0.10</div>
                        <div class="unity-vec3-field"><span class="unity-badge-y">Y</span> 0.25</div>
                        <div class="unity-vec3-field"><span class="unity-badge-z">Z</span> 0.10</div>
                    </div>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Extension &bull; Deocclusion</span>
                    <span class="unity-prop-val">Collide &bull; Obstacle Layer: Default | Ground</span>
                </div>
            </div>
        </div>

        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-top: 12px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Parenting the Main Camera directly under the rotating player Transform. Every time the player turns 5 degrees, the entire screen spins violently, causing severe motion sickness.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Always keep Main Camera and CinemachineCamera as standalone root GameObjects in the scene hierarchy. Use <code>Tracking Target</code> to follow the player smoothly.
        </div>
    </div>`,
    notes: "Explain Cinemachine 3.x setup in Unity 6. Show students how adding CinemachineOrbitalFollow creates an immediate commercial-feeling 3rd person camera rig."
  },

  // Slide 12: Practice Challenge 1: 3D Metric Whitebox Gym & Character Controller
  {
    title: "Practice Challenge 1: Metric Whitebox Gym & Character Controller",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">Challenge Brief: 10-Minute Sprint</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Construct a metric validation gym scene and implement 3D camera-relative movement:
                    </p>
                    <ol style="font-size: 0.82rem; color: #475569; margin-top: 8px; line-height: 1.45; padding-left: 18px;">
                        <li><strong>ProBuilder Gym:</strong> Build a 20m x 20m floor, a 2.4m doorway, a 1.5m wall, and a 3.5m pit gap using 1.0m grid snapping.</li>
                        <li><strong>Player Rig:</strong> Attach <code>CharacterController</code> and <code>PlayerController3D</code> to a capsule.</li>
                        <li><strong>Cinemachine:</strong> Set up a <code>CinemachineCamera</code> with Orbital Follow.</li>
                        <li><strong>Verification:</strong> Walk through the doorway, jump the 3.5m pit, and clear the 1.5m wall smoothly.</li>
                    </ol>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card primary" style="border-left-color: #d97706;">
                <div class="card-title core" style="color: #b45309;">Sprint Timer &amp; Solution Lock</div>
                <div class="card-body">
                    <div style="text-align: center; margin-bottom: 8px;">
                        <div id="challengeTimer1" style="font-size: 2.0rem; font-weight: 900; color: #0284c7; font-family: monospace;">10:00</div>
                        <div style="font-size: 0.74rem; color: #64748b;">10-Minute Guided Sprint</div>
                    </div>
                    <div style="display: flex; gap: 6px; justify-content: center;">
                        <button class="sim-action-btn" style="background: #059669; border: 1px solid #10b981; color: #fff; font-size: 0.74rem;" onclick="startChallengeTimer(1)">Start Sprint</button>
                        <button class="sim-action-btn" style="background: #d97706; border: 1px solid #f59e0b; color: #fff; font-size: 0.74rem;" onclick="pauseChallengeTimer(1)">Pause</button>
                        <button class="sim-action-btn" style="background: #475569; border: 1px solid #64748b; color: #fff; font-size: 0.74rem;" onclick="resetChallengeTimer(1)">Reset</button>
                    </div>
                    <div id="solutionLockBanner1" style="margin-top: 10px; padding: 6px 10px; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 6px; font-size: 0.76rem; color: #991b1b; text-align: center;">
                        [LOCKED] Solution unlocks in: <strong id="solutionLockTimer1">01:00</strong> (Implement code first)
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <details id="solutionDetails1" class="tier-accordion adv" style="margin-top: 12px; pointer-events: none; opacity: 0.5;">
        <summary class="accordion-header">
            <span>[Solution Reference] PlayerController3D Architecture</span>
            <span style="font-size:0.75rem;">Expand</span>
        </summary>
        <div class="accordion-body">
            <div class="code-box" style="font-size: 0.72rem; line-height: 1.35;">
                <pre><code><span class="r-cm">// Complete verified PlayerController3D implementation</span>
using UnityEngine;

[RequireComponent(typeof(CharacterController))]
public class PlayerController3D : MonoBehaviour
{
    [SerializeField] private float moveSpeed = 6.0f;
    [SerializeField] private float jumpHeight = 2.0f;
    [SerializeField] private float gravity = 20.0f;
    [SerializeField] private LayerMask groundMask;

    private CharacterController controller;
    private Transform cam;
    private float verticalVelocity;

    private void Awake()
    {
        controller = GetComponent&lt;CharacterController&gt;();
        cam = Camera.main.transform;
    }

    private void Update()
    {
        bool isGrounded = Physics.CheckSphere(transform.position + Vector3.up * 0.1f, 0.28f, groundMask, QueryTriggerInteraction.Ignore);
        if (isGrounded && verticalVelocity &lt; 0f) verticalVelocity = -2f;

        float h = Input.GetAxisRaw("Horizontal");
        float v = Input.GetAxisRaw("Vertical");
        Vector3 input = new Vector3(h, 0f, v).normalized;

        if (input.magnitude &gt; 0.05f)
        {
            Vector3 fwd = cam.forward; fwd.y = 0f; fwd.Normalize();
            Vector3 right = cam.right; right.y = 0f; right.Normalize();
            Vector3 move = (fwd * input.z + right * input.x).normalized;
            controller.Move(move * moveSpeed * Time.deltaTime);
            transform.rotation = Quaternion.Slerp(transform.rotation, Quaternion.LookRotation(move), 12f * Time.deltaTime);
        }

        if (isGrounded && Input.GetButtonDown("Jump"))
            verticalVelocity = Mathf.Sqrt(2f * gravity * jumpHeight);

        verticalVelocity -= gravity * Time.deltaTime;
        controller.Move(Vector3.up * verticalVelocity * Time.deltaTime);
    }
}</code></pre>
            </div>
        </div>
    </details>

    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">CHALLENGE 1: GYM &amp; CONTROLLER</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            The Metric Gym is your physics calibration laboratory. Before designing gameplay levels, all core mechanics (run speed, jump clearance, camera collision, stair stepping) must be proven and locked in this single test scene.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Test Suite Checklist:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    1. Doorway Traversal (Zero head bumping at 2.4m height).<br>
                    2. 3.5m Pit Gap Jump (Lands safely with 0.5m margin).<br>
                    3. 1.5m Wall Clearance (Apex reaches 2.0m height).<br>
                    4. Orbit Camera (Smooth 360-degree rotation without clipping walls).
                </div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Layer &amp; Tag Matrix:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    Layer 6: <code>Ground</code> (All walkable ProBuilder floor polygons).<br>
                    Layer 7: <code>Obstacles</code> (Static boundary walls).<br>
                    Layer 8: <code>Player</code> (Character capsule).
                </div>
            </div>
        </div>

        <div class="unity-inspector">
            <div class="unity-inspector-header">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="display: inline-block; width: 14px; height: 14px; background: #505050; border-radius: 2px; text-align: center; line-height: 14px; font-size: 10px; font-weight: 900; color: #ffffff;">#</span>
                    <span>Scene Hierarchy &bull; Metric Validation Gym Structure</span>
                </div>
                <span style="font-size: 0.68rem; background: #2b2b2b; color: #8bc34a; padding: 2px 6px; border-radius: 3px; border: 1px solid #383838;">Hierarchy Reference</span>
            </div>
            <div class="unity-inspector-body">
                <div class="unity-prop-row">
                    <span class="unity-prop-label">[Gym_MetricArena]</span>
                    <span class="unity-prop-val">Root Anchor (0, 0, 0)</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label"> &bull; [Geometry_Static_Floors]</span>
                    <span class="unity-prop-val">Layer: Ground &bull; Static: [X]</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label"> &bull; [Player_Rig]</span>
                    <span class="unity-prop-val">CharacterController + PlayerController3D</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label"> &bull; [Cinemachine_OrbitalRig]</span>
                    <span class="unity-prop-val">CinemachineCamera &bull; Target: Player_Rig</span>
                </div>
            </div>
        </div>

        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-top: 12px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Starting level blockout before testing the controller in the gym scene. If jump heights change later, every single platform across all your levels will have to be repositioned manually.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Save your metric gym scene as <code>Scenes/Gym_MetricCalibration.unity</code> and keep it in your repository throughout the entire semester.
        </div>
    </div>`,
    notes: "Launch Practice Challenge 1. Give students 10 minutes to assemble their metric gym, attach the controller, and tune their jump arc and camera orbit."
  },

  // Slide 13: Modern AI Navigation in Unity 6: NavMeshSurface
  {
    title: "Modern AI Navigation in Unity 6: NavMeshSurface & Baking",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">Unity 6 AI Navigation Package (com.unity.ai.navigation)</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Legacy Unity baked global navigation windows. Unity 6 uses component-based <code>NavMeshSurface</code>:
                    </p>
                    <ul style="font-size: 0.82rem; color: #475569; margin-top: 8px; line-height: 1.45; padding-left: 16px;">
                        <li><strong>Component-Based:</strong> Attach <code>NavMeshSurface</code> directly to level roots or floor meshes.</li>
                        <li><strong>Multiple Agent Types:</strong> Bake distinct NavMeshes for Small Humanoids vs Large Boss Monsters.</li>
                        <li><strong>Runtime Baking:</strong> Call <code>surface.BuildNavMesh()</code> at runtime for procedurally generated dungeons.</li>
                        <li><strong>Layer Filtering:</strong> Include or exclude specific layers during bake.</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card primary" style="border-left-color: #059669;">
                <div class="card-title core" style="color: #047857;">Agent Baking Parameters</div>
                <div class="card-body">
                    <table style="width: 100%; font-size: 0.80rem; border-collapse: collapse; text-align: left;">
                        <tr style="border-bottom: 1.5px solid #cbd5e1; color: #0f172a;">
                            <th style="padding: 4px 6px;">Parameter</th>
                            <th style="padding: 4px 6px;">Value</th>
                            <th style="padding: 4px 6px;">Function</th>
                        </tr>
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 4px 6px;"><strong>Agent Radius</strong></td>
                            <td style="padding: 4px 6px; color: #0284c7; font-weight: 700;">0.5m</td>
                            <td style="padding: 4px 6px;">Wall setback distance.</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 4px 6px;"><strong>Agent Height</strong></td>
                            <td style="padding: 4px 6px; color: #0284c7; font-weight: 700;">2.0m</td>
                            <td style="padding: 4px 6px;">Ceiling clearance check.</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 4px 6px;"><strong>Max Slope</strong></td>
                            <td style="padding: 4px 6px; color: #0284c7; font-weight: 700;">45.0°</td>
                            <td style="padding: 4px 6px;">Steepest walkable ramp.</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 6px;"><strong>Step Height</strong></td>
                            <td style="padding: 4px 6px; color: #0284c7; font-weight: 700;">0.4m</td>
                            <td style="padding: 4px 6px;">Max climbable ledge.</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">AI NAVIGATION PACKAGE</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            A Navigation Mesh (NavMesh) is a 2D polygonal blueprint of walkable floor space overlaid across 3D environment geometry. Instead of performing expensive 3D physics raycasts every frame, AI agents run fast 2D A* pathfinding on these pre-computed convex polygons.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Agent Radius Wall Setback:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    The NavMesh bake automatically cuts back <code>Agent Radius (0.5m)</code> from all obstacle walls. This prevents the agent capsule from scraping against wall geometry while turning corners.
                </div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Voxelization &amp; Region Merging:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    Unity rasterizes geometry into solid voxels, extracts walkable surfaces, and simplifies them into large convex 2D polygons for maximum runtime pathfinding throughput.
                </div>
            </div>
        </div>

        <div class="unity-inspector">
            <div class="unity-inspector-header">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="display: inline-block; width: 14px; height: 14px; background: #505050; border-radius: 2px; text-align: center; line-height: 14px; font-size: 10px; font-weight: 900; color: #ffffff;">#</span>
                    <span>NavMeshSurface &bull; Component Inspector (Unity 6 AI Navigation)</span>
                </div>
                <span style="font-size: 0.68rem; background: #2b2b2b; color: #8bc34a; padding: 2px 6px; border-radius: 3px; border: 1px solid #383838;">Unity 6 Component</span>
            </div>
            <div class="unity-inspector-body">
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Agent Type</span>
                    <span class="unity-prop-val">Humanoid (Radius: 0.5m, Height: 2.0m)</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Default Area</span>
                    <span class="unity-prop-val">Walkable (Cost: 1.0)</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Collect Objects / Include Layers</span>
                    <span class="unity-prop-val">All GameObjects &bull; Default | Ground | Obstacles</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Use Geometry</span>
                    <span class="unity-prop-val">Render Meshes (or Physics Colliders)</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Bake Control</span>
                    <span class="unity-prop-val"><strong style="color: #38bdf8;">[Bake NavMesh]</strong> &bull; Status: Baked</span>
                </div>
            </div>
        </div>

        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-top: 12px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Forgetting to click [Bake] after moving level geometry. The NavMesh remains at the old coordinates, causing AI enemies to walk through new walls or float over relocated floor plates.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Install <code>com.unity.ai.navigation</code> via Package Manager. Attach <code>NavMeshSurface</code> to the environment root and re-bake whenever geometry changes.
        </div>
    </div>`,
    notes: "Demonstrate NavMeshSurface in Unity 6. Explain that the old Window -> AI -> Navigation workflow is deprecated in favor of component-based NavMeshSurface."
  },

  // Slide 14: NavMeshAgent Pathfinding & Steering
  {
    title: "NavMeshAgent Steering: Pathfinding, Velocity & Waypoint Traversal",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">NavMeshAgent C# API</div>
                <div class="card-body">
                    <div class="code-box" style="font-size: 0.72rem; line-height: 1.35;">
                        <pre><code>using UnityEngine;
using UnityEngine.AI;

[RequireComponent(typeof(NavMeshAgent))]
public class AgentSteering : MonoBehaviour
{
    private NavMeshAgent agent;

    private void Awake()
    {
        agent = GetComponent&lt;NavMeshAgent&gt;();
    }

    public void MoveToTarget(Vector3 destination)
    {
        agent.SetDestination(destination);
    }

    public bool HasReachedDestination()
    {
        if (agent.pathPending) return false;
        return agent.remainingDistance &lt;= agent.stoppingDistance;
    }
}</code></pre>
                    </div>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card primary" style="border-left-color: #059669;">
                <div class="card-title core" style="color: #047857;">Path Query Lifecycle &amp; Corner Nodes</div>
                <div class="card-body">
                    <ul style="font-size: 0.82rem; color: #065f46; line-height: 1.45; padding-left: 16px;">
                        <li><strong>SetDestination():</strong> Triggers an asynchronous A* path query across NavMesh polygons.</li>
                        <li><strong>agent.pathPending:</strong> True while the background thread computes the path corridor.</li>
                        <li><strong>agent.corners:</strong> Array of <code>Vector3</code> waypoints along the calculated corridor.</li>
                        <li><strong>agent.stoppingDistance:</strong> Distance threshold before the agent decelerates to a complete stop.</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">AGENT STEERING</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            <code>NavMeshAgent</code> combines high-level path planning (A* global corridor computation) with low-level steering (local avoidance, acceleration, angular turning, and deceleration). It moves the GameObject directly along the path without requiring manual Transform translation.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">The pathPending Race Condition:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    When <code>SetDestination()</code> is called, <code>remainingDistance</code> reads <code>0</code> on that exact frame because path calculation runs asynchronously on a worker thread. Always check <code>!agent.pathPending</code> before evaluating <code>remainingDistance</code>.
                </div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Auto Braking:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    When enabled, the agent smoothly decelerates as it approaches its final target. When disabled, the agent maintains full speed through intermediate waypoints in continuous patrol loops.
                </div>
            </div>
        </div>

        <div class="unity-inspector">
            <div class="unity-inspector-header">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="display: inline-block; width: 14px; height: 14px; background: #505050; border-radius: 2px; text-align: center; line-height: 14px; font-size: 10px; font-weight: 900; color: #ffffff;">#</span>
                    <span>NavMeshAgent &bull; Component Steering Inspector</span>
                </div>
                <span style="font-size: 0.68rem; background: #2b2b2b; color: #8bc34a; padding: 2px 6px; border-radius: 3px; border: 1px solid #383838;">Unity 6 Built-in</span>
            </div>
            <div class="unity-inspector-body">
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Agent Type / Base Offset</span>
                    <span class="unity-prop-val">Humanoid / 0.00</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Speed / Angular Speed</span>
                    <span class="unity-prop-val">4.50 m/s / 360.00 deg/s</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Acceleration</span>
                    <span class="unity-prop-val">12.00 m/s²</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Stopping Distance</span>
                    <span class="unity-prop-val">0.50 m</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Auto Braking / Quality</span>
                    <span class="unity-prop-val">[X] True / High Quality</span>
                </div>
            </div>
        </div>

        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-top: 12px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Checking <code>if (agent.remainingDistance == 0)</code> to detect destination arrival. Due to floating-point imprecision and agent stopping radius, <code>remainingDistance</code> rarely reaches exactly <code>0.0f</code>.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Always check <code>if (!agent.pathPending && agent.remainingDistance &lt;= agent.stoppingDistance)</code> to determine when an AI agent has arrived.
        </div>
    </div>`,
    notes: "Review the NavMeshAgent API. Highlight the importance of checking agent.pathPending to avoid the single-frame zero distance bug."
  },

  // Slide 15: NavMesh Pathfinding: Corridor Queries & Waypoint Navigation
  {
    title: "NavMesh Pathfinding: Corridor Queries & Waypoint Navigation",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">Path Query Pipeline &amp; Arrival Logic</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        <code>NavMeshAgent</code> separates path calculation from physical locomotion:
                    </p>
                    <div class="code-box" style="font-size: 0.72rem; line-height: 1.35; margin: 8px 0;">
                        <pre><code><span class="r-cm">// 1. Command agent to target position</span>
public void MoveToTarget(Vector3 targetPos)
{
    agent.SetDestination(targetPos);
}

<span class="r-cm">// 2. Robust arrival detection check</span>
public bool HasReachedDestination()
{
    <span class="r-cm">// Guard against single-frame async race condition</span>
    if (agent.pathPending) return false;

    return agent.remainingDistance &lt;= agent.stoppingDistance;
}</code></pre>
                    </div>
                    <ul style="font-size: 0.80rem; color: #475569; line-height: 1.4; padding-left: 16px;">
                        <li><strong>Asynchronous A* Corridor:</strong> Finds the polygon sequence on background worker threads.</li>
                        <li><strong>String Pulling (Funnel):</strong> Converts polygonal corridor into straight-line corner nodes (<code>agent.corners</code>).</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card primary" style="border-left-color: #059669;">
                <div class="card-title core" style="color: #047857;">Steering &amp; Local Obstacle Avoidance</div>
                <div class="card-body">
                    <ul style="font-size: 0.82rem; color: #065f46; line-height: 1.45; padding-left: 16px;">
                        <li><strong>Stopping Distance:</strong> Target clearance threshold before halting (e.g. <code>0.5m</code> for patrol, <code>1.5m</code> for melee attacks).</li>
                        <li><strong>Auto Braking:</strong> Turn ON for discrete stops. Turn OFF for smooth continuous patrol routes through waypoints.</li>
                        <li><strong>Avoidance Priority (0-99):</strong> Lower values have higher right-of-way (e.g. Heavy Boss = 10, Minions = 50).</li>
                        <li><strong>Quality (RVO):</strong> Set to <em>High Quality</em> for reciprocal velocity obstacle avoidance between multiple agents.</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">PATH CORRIDORS</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            Pathfinding in Unity 6 is a two-tier system: (1) <strong>Global Path Corridor:</strong> An A* graph search that identifies the chain of convex polygons between agent and destination. (2) <strong>Local Steering (RVO):</strong> Frame-by-frame physics velocity adjustments that push agents around other moving agents without recalculating the global polygon corridor.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Global Corridor vs Local Avoidance:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    <strong>Global Corridor:</strong> Computed once upon calling <code>SetDestination()</code>. Cheap and efficient.<br>
                    <strong>Local Avoidance:</strong> Evaluated every frame against nearby dynamic agents using Reciprocal Velocity Obstacles (RVO).
                </div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Corner Nodes (agent.corners):</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    Access <code>agent.path.corners</code> to inspect the exact world-space vertices the agent will traverse. Ideal for drawing custom debug path gizmos in Scene view.
                </div>
            </div>
        </div>

        <div class="unity-inspector">
            <div class="unity-inspector-header">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="display: inline-block; width: 14px; height: 14px; background: #505050; border-radius: 2px; text-align: center; line-height: 14px; font-size: 10px; font-weight: 900; color: #ffffff;">#</span>
                    <span>NavMeshAgent &bull; Steering &amp; Avoidance Reference</span>
                </div>
                <span style="font-size: 0.68rem; background: #2b2b2b; color: #8bc34a; padding: 2px 6px; border-radius: 3px; border: 1px solid #383838;">Inspector Configuration</span>
            </div>
            <div class="unity-inspector-body">
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Speed / Angular Speed</span>
                    <span class="unity-prop-val">4.50 m/s / 360.00 deg/s</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Acceleration / Stopping Distance</span>
                    <span class="unity-prop-val">12.00 m/s² / 0.50 m</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Auto Braking</span>
                    <span class="unity-prop-val">[X] True</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Avoidance Priority</span>
                    <span class="unity-prop-val">50 (Medium Default)</span>
                </div>
            </div>
        </div>

        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-top: 12px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Evaluating <code>if (agent.remainingDistance &lt;= 0.1f)</code> immediately on the frame <code>SetDestination()</code> is called. Since path queries run asynchronously, <code>remainingDistance</code> reads <code>0</code> on frame 1 until the worker thread returns the corridor.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Always guard distance evaluations with <code>if (!agent.pathPending &amp;&amp; agent.remainingDistance &lt;= agent.stoppingDistance)</code>.
        </div>
    </div>`,
    notes: "Review the path query pipeline. Emphasize why checking agent.pathPending is essential to avoid the initial-frame zero distance bug."
  },

  // Slide 16: Dynamic Obstacle Carving: NavMeshObstacle
  {
    title: "Dynamic Obstacle Carving: NavMeshObstacle Component",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">NavMeshObstacle Configuration</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Attach <code>NavMeshObstacle</code> to movable environment objects:
                    </p>
                    <ul style="font-size: 0.82rem; color: #475569; margin-top: 8px; line-height: 1.45; padding-left: 16px;">
                        <li><strong>Shape:</strong> <code>Box</code> or <code>Capsule</code> matching object dimensions.</li>
                        <li><strong>Carve Checkbox:</strong> When enabled, dynamically punches a cutout in the NavMesh.</li>
                        <li><strong>Move Threshold:</strong> Distance the obstacle must move before the carve hole updates (e.g. <code>0.1m</code>).</li>
                        <li><strong>Time To Stationary:</strong> Time (seconds) the object must rest before carving starts (e.g. <code>0.5s</code>).</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card primary" style="border-left-color: #059669;">
                <div class="card-title core" style="color: #047857;">Carve Only Stationary Optimization</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Why <code>Carve Only Stationary</code> is critical for production performance:
                    </p>
                    <ul style="font-size: 0.82rem; color: #065f46; margin-top: 8px; line-height: 1.45; padding-left: 16px;">
                        <li><strong>Moving Physics Crates:</strong> While a physics crate is rolling, it uses lightweight local avoidance.</li>
                        <li><strong>Once at Rest:</strong> When the crate comes to a complete stop, it carves a permanent hole in the NavMesh.</li>
                        <li><strong>Prevents CPU Spikes:</strong> Eliminates continuous per-frame NavMesh re-triangulation.</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">DYNAMIC CARVING</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            Think of a NavMesh as a carpet laid over the floor. A static obstacle has a hole cut out of the carpet permanently during manufacturing (baking). A <code>NavMeshObstacle</code> is a heavy metal stamp that cuts a dynamic square out of the carpet whenever it lands.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Closing Security Doors:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    When a blast door closes, enabling its <code>NavMeshObstacle</code> carves the doorway shut. AI agents instantly recognize the path is blocked and reroute through alternate ventilation shafts.
                </div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Physics Barricades:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    Players pushing wooden crates across hallways create dynamic chokepoints. When the crate rests, the NavMesh updates automatically.
                </div>
            </div>
        </div>

        <div class="unity-inspector">
            <div class="unity-inspector-header">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="display: inline-block; width: 14px; height: 14px; background: #505050; border-radius: 2px; text-align: center; line-height: 14px; font-size: 10px; font-weight: 900; color: #ffffff;">#</span>
                    <span>NavMeshObstacle &bull; Component Inspector Configuration</span>
                </div>
                <span style="font-size: 0.68rem; background: #2b2b2b; color: #8bc34a; padding: 2px 6px; border-radius: 3px; border: 1px solid #383838;">Unity 6 Component</span>
            </div>
            <div class="unity-inspector-body">
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Shape</span>
                    <span class="unity-prop-val">Box</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Center</span>
                    <div class="unity-vec3">
                        <div class="unity-vec3-field"><span class="unity-badge-x">X</span> 0.00</div>
                        <div class="unity-vec3-field"><span class="unity-badge-y">Y</span> 0.50</div>
                        <div class="unity-vec3-field"><span class="unity-badge-z">Z</span> 0.00</div>
                    </div>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Size</span>
                    <div class="unity-vec3">
                        <div class="unity-vec3-field"><span class="unity-badge-x">X</span> 1.50</div>
                        <div class="unity-vec3-field"><span class="unity-badge-y">Y</span> 1.00</div>
                        <div class="unity-vec3-field"><span class="unity-badge-z">Z</span> 1.50</div>
                    </div>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Carve / Carve Only Stationary</span>
                    <span class="unity-prop-val">[X] True / [X] True</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Move Threshold / Time To Stationary</span>
                    <span class="unity-prop-val">0.10 m / 0.50 s</span>
                </div>
            </div>
        </div>

        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-top: 12px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Leaving <code>Carve Only Stationary</code> unchecked on fast-moving physics props. Continuously re-carving the NavMesh 60 times per second causes massive CPU frame-time stutters.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Always enable <code>Carve Only Stationary</code> on movable props. Set <code>TimeToStationary = 0.5s</code>.
        </div>
    </div>`,
    notes: "Explain NavMeshObstacle properties. Emphasize why Carve Only Stationary is an essential performance optimization in production games."
  },

  // Slide 17: Enemy AI State Machine: Patrol, Detect, Chase, Attack
  {
    title: "Enemy AI State Machine: Patrol, Line-of-Sight Detection & Pursuit",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">EnemyNavMeshAI.cs (State Machine)</div>
                <div class="card-body">
                    <div class="code-box" style="font-size: 0.72rem; line-height: 1.35;">
                        <pre><code>using UnityEngine;
using UnityEngine.AI;

public class EnemyNavMeshAI : MonoBehaviour
{
    public enum AIState { Patrol, Chase, Attack }

    [SerializeField] private AIState currentState = AIState.Patrol;
    [SerializeField] private Transform[] waypoints;
    [SerializeField] private Transform playerTarget;
    [SerializeField] private float detectionRadius = 8.0f;
    [SerializeField] private float attackRadius = 1.5f;
    [SerializeField] private LayerMask visionObstacleMask;

    private NavMeshAgent agent;
    private int waypointIndex;

    private void Awake()
    {
        agent = GetComponent&lt;NavMeshAgent&gt;();
    }

    private void Update()
    {
        switch (currentState)
        {
            case AIState.Patrol: HandlePatrol(); break;
            case AIState.Chase:  HandleChase();  break;
            case AIState.Attack: HandleAttack(); break;
        }
    }
}</code></pre>
                    </div>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card primary" style="border-left-color: #059669;">
                <div class="card-title core" style="color: #047857;">State Transitions &amp; Raycast Vision</div>
                <div class="card-body">
                    <div class="code-box" style="font-size: 0.72rem; line-height: 1.35;">
                        <pre><code>private void HandlePatrol()
{
    if (waypoints.Length == 0) return;
    if (!agent.pathPending && agent.remainingDistance &lt;= agent.stoppingDistance)
    {
        waypointIndex = (waypointIndex + 1) % waypoints.Length;
        agent.SetDestination(waypoints[waypointIndex].position);
    }

    if (CanSeePlayer())
        currentState = AIState.Chase;
}

private void HandleChase()
{
    agent.SetDestination(playerTarget.position);
    float dist = Vector3.Distance(transform.position, playerTarget.position);

    if (dist &lt;= attackRadius)
        currentState = AIState.Attack;
    else if (dist &gt; detectionRadius * 1.5f)
        currentState = AIState.Patrol;
}

private bool CanSeePlayer()
{
    float dist = Vector3.Distance(transform.position, playerTarget.position);
    if (dist &gt; detectionRadius) return false;

    Vector3 eyePos = transform.position + Vector3.up * 1.6f;
    Vector3 targetPos = playerTarget.position + Vector3.up * 1.0f;
    Vector3 dir = (targetPos - eyePos).normalized;

    if (Physics.Raycast(eyePos, dir, dist, visionObstacleMask))
        return false; <span class="r-cm">// Wall blocks line of sight</span>

    return true;
}</code></pre>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">AI STATE MACHINE</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            An AI State Machine (FSM) structures autonomous behavior into clear, discrete states (Patrol, Chase, Attack). Transitions between states are driven by sensory queries: distance checks and physics line-of-sight raycasts.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Hysteresis in Detection:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    Detection distance is <code>8.0m</code>, but de-aggro distance is <code>12.0m (1.5x)</code>. This gap (hysteresis) prevents the AI from flickering rapidly between Patrol and Chase when the player hovers at the 8m threshold.
                </div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Eye-Level Raycasting:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    Always offset the raycast origin by <code>Vector3.up * 1.6f</code> (eye height). Raycasting from <code>transform.position</code> (feet level) causes the ray to hit floor geometry and fail line-of-sight checks.
                </div>
            </div>
        </div>

        <div class="unity-inspector">
            <div class="unity-inspector-header">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="display: inline-block; width: 14px; height: 14px; background: #505050; border-radius: 2px; text-align: center; line-height: 14px; font-size: 10px; font-weight: 900; color: #ffffff;">#</span>
                    <span>EnemyNavMeshAI (Script Component) &bull; Inspector Reference</span>
                </div>
                <span style="font-size: 0.68rem; background: #2b2b2b; color: #8bc34a; padding: 2px 6px; border-radius: 3px; border: 1px solid #383838;">AI Component</span>
            </div>
            <div class="unity-inspector-body">
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Current State</span>
                    <span class="unity-prop-val">Patrol</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Player Target</span>
                    <span class="unity-prop-val">Player_Rig (Transform)</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Detection / Attack Radius</span>
                    <span class="unity-prop-val">8.00 m / 1.50 m</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Waypoints</span>
                    <span class="unity-prop-val">Size: 4 (WP_1, WP_2, WP_3, WP_4)</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Vision Obstacle Mask</span>
                    <span class="unity-prop-val">Layer: Default | Ground | Obstacles</span>
                </div>
            </div>
        </div>

        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-top: 12px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Running line-of-sight raycasts without a LayerMask. The ray hits the AI's own collider first, permanently blocking vision to the player.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Raycast from eye height (<code>y = 1.6m</code>) and use a dedicated <code>LayerMask</code> that includes environment obstacles while ignoring the AI's own layer.
        </div>
    </div>`,
    notes: "Walk through the EnemyNavMeshAI state machine. Emphasize how clean enum states and eye-level raycasting create believable guard AI in under 80 lines of code."
  },

  // Slide 18: Practice Challenge 2: Dynamic Obstacle Arena & Guard AI
  {
    title: "Practice Challenge 2: Dynamic Obstacle Arena & Guard AI",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">Challenge Brief: 10-Minute AI Arena Sprint</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Create a patrol arena with dynamic obstacle carving and responsive guard AI:
                    </p>
                    <ol style="font-size: 0.82rem; color: #475569; margin-top: 8px; line-height: 1.45; padding-left: 18px;">
                        <li><strong>NavMesh Arena:</strong> Create a 15m x 15m arena with 4 perimeter waypoints and bake a <code>NavMeshSurface</code>.</li>
                        <li><strong>Guard Agent:</strong> Create an enemy capsule with <code>NavMeshAgent</code> and <code>EnemyNavMeshAI</code>.</li>
                        <li><strong>Dynamic Crate:</strong> Place a movable block with <code>NavMeshObstacle (Carve = True)</code> across the patrol route.</li>
                        <li><strong>Verification:</strong> Observe the guard patrol waypoints, reroute around the carved crate, and pursue the player on visual contact.</li>
                    </ol>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card primary" style="border-left-color: #d97706;">
                <div class="card-title core" style="color: #b45309;">Sprint Timer &amp; Solution Lock</div>
                <div class="card-body">
                    <div style="text-align: center; margin-bottom: 8px;">
                        <div id="challengeTimer2" style="font-size: 2.0rem; font-weight: 900; color: #0284c7; font-family: monospace;">10:00</div>
                        <div style="font-size: 0.74rem; color: #64748b;">10-Minute Guided Sprint</div>
                    </div>
                    <div style="display: flex; gap: 6px; justify-content: center;">
                        <button class="sim-action-btn" style="background: #059669; border: 1px solid #10b981; color: #fff; font-size: 0.74rem;" onclick="startChallengeTimer(2)">Start Sprint</button>
                        <button class="sim-action-btn" style="background: #d97706; border: 1px solid #f59e0b; color: #fff; font-size: 0.74rem;" onclick="pauseChallengeTimer(2)">Pause</button>
                        <button class="sim-action-btn" style="background: #475569; border: 1px solid #64748b; color: #fff; font-size: 0.74rem;" onclick="resetChallengeTimer(2)">Reset</button>
                    </div>
                    <div id="solutionLockBanner2" style="margin-top: 10px; padding: 6px 10px; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 6px; font-size: 0.76rem; color: #991b1b; text-align: center;">
                        [LOCKED] Solution unlocks in: <strong id="solutionLockTimer2">01:00</strong> (Implement code first)
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <details id="solutionDetails2" class="tier-accordion adv" style="margin-top: 12px; pointer-events: none; opacity: 0.5;">
        <summary class="accordion-header">
            <span>[Solution Reference] AI Patrol Arena Architecture</span>
            <span style="font-size:0.75rem;">Expand</span>
        </summary>
        <div class="accordion-body">
            <div class="code-box" style="font-size: 0.72rem; line-height: 1.35;">
                <pre><code><span class="r-cm">// Complete verified EnemyNavMeshAI implementation</span>
using UnityEngine;
using UnityEngine.AI;

[RequireComponent(typeof(NavMeshAgent))]
public class EnemyNavMeshAI : MonoBehaviour
{
    public enum State { Patrol, Chase }
    [SerializeField] private State state = State.Patrol;
    [SerializeField] private Transform[] waypoints;
    [SerializeField] private Transform player;
    [SerializeField] private float viewDist = 8f;
    [SerializeField] private LayerMask obstacleMask;

    private NavMeshAgent agent;
    private int wpIdx;

    private void Awake() { agent = GetComponent&lt;NavMeshAgent&gt;(); }

    private void Start()
    {
        if (waypoints.Length &gt; 0) agent.SetDestination(waypoints[0].position);
    }

    private void Update()
    {
        bool seesPlayer = CanSee();
        if (seesPlayer) state = State.Chase;
        else if (state == State.Chase && Vector3.Distance(transform.position, player.position) &gt; viewDist * 1.5f)
            state = State.Patrol;

        if (state == State.Chase) agent.SetDestination(player.position);
        else Patrol();
    }

    private void Patrol()
    {
        if (waypoints.Length == 0) return;
        if (!agent.pathPending && agent.remainingDistance &lt;= agent.stoppingDistance)
        {
            wpIdx = (wpIdx + 1) % waypoints.Length;
            agent.SetDestination(waypoints[wpIdx].position);
        }
    }

    private bool CanSee()
    {
        float d = Vector3.Distance(transform.position, player.position);
        if (d &gt; viewDist) return false;
        Vector3 eye = transform.position + Vector3.up * 1.6f;
        Vector3 target = player.position + Vector3.up * 1.0f;
        return !Physics.Raycast(eye, (target - eye).normalized, d, obstacleMask);
    }
}</code></pre>
            </div>
        </div>
    </details>

    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">CHALLENGE 2: AI ARENA</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            Dynamic AI testing requires validating the interaction between static geometry (NavMeshSurface), dynamic obstacles (NavMeshObstacle), autonomous agents (NavMeshAgent), and player kinematics (CharacterController).
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Arena Setup Checklist:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    1. 15m x 15m Baked NavMesh Surface.<br>
                    2. 4 Waypoints placed at arena corners.<br>
                    3. Dynamic Obstacle Crate positioned between Waypoint 1 and 2.<br>
                    4. Player capsule with CharacterController.
                </div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Success Criteria:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    Guard smoothly paths between waypoints, routes around the carved crate without sticking to corners, and enters Chase state immediately when player enters line-of-sight.
                </div>
            </div>
        </div>

        <div class="unity-inspector">
            <div class="unity-inspector-header">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="display: inline-block; width: 14px; height: 14px; background: #505050; border-radius: 2px; text-align: center; line-height: 14px; font-size: 10px; font-weight: 900; color: #ffffff;">#</span>
                    <span>AI Patrol Arena &bull; Hierarchy &amp; Component Verification</span>
                </div>
                <span style="font-size: 0.68rem; background: #2b2b2b; color: #8bc34a; padding: 2px 6px; border-radius: 3px; border: 1px solid #383838;">Arena Blueprint</span>
            </div>
            <div class="unity-inspector-body">
                <div class="unity-prop-row">
                    <span class="unity-prop-label">[AI_PatrolArena]</span>
                    <span class="unity-prop-val">NavMeshSurface Baked</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label"> &bull; [Carved_Crate_Dynamic]</span>
                    <span class="unity-prop-val">NavMeshObstacle &bull; Carve: [X] True</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label"> &bull; [Enemy_Guard_AI]</span>
                    <span class="unity-prop-val">NavMeshAgent + EnemyNavMeshAI</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label"> &bull; [Waypoints_Group]</span>
                    <span class="unity-prop-val">Size: 4 Transforms</span>
                </div>
            </div>
        </div>

        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-top: 12px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Placing Waypoints outside the baked NavMesh polygon boundary. <code>SetDestination()</code> fails to find a valid sample position on the mesh, causing the agent to stop moving completely.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Place waypoints slightly inside the walkable NavMesh boundary (at least 0.8m away from perimeter walls) to guarantee clean agent pathing.
        </div>
    </div>`,
    notes: "Launch Practice Challenge 2. Give students 10 minutes to set up their NavMesh arena, attach the EnemyNavMeshAI script, and test dynamic obstacle carving."
  },

  // Slide 19: Architecture Summary, Deliverables Checklist & Next Steps
  {
    title: "Lesson 06 Summary: Milestone Deliverables & Next Steps",
    content: `<div class="content-stack">
        <div class="content-card primary" style="border-left-color: #059669;">
            <div class="card-title core" style="color: #047857;">Lesson 06 Engineering Deliverables</div>
            <div class="card-body">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px;">
                    <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 10px 14px;">
                        <span style="font-weight: 800; color: #059669; font-size: 0.90rem;">1. Metric Greybox Gym</span>
                        <p style="font-size: 0.82rem; color: #475569; margin-top: 4px;">ProBuilder layout adhering strictly to 1.0m grid snapping, 2.4m doorways, and 5-tone functional palette.</p>
                    </div>
                    <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 10px 14px;">
                        <span style="font-weight: 800; color: #0284c7; font-size: 0.90rem;">2. 3D CharacterController</span>
                        <p style="font-size: 0.82rem; color: #475569; margin-top: 4px;">Camera-relative horizontal vector math, rotation slerp, and ballistic jump with SphereCast grounding.</p>
                    </div>
                    <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 10px 14px;">
                        <span style="font-weight: 800; color: #d97706; font-size: 0.90rem;">3. Cinemachine 3.x Rig</span>
                        <p style="font-size: 0.82rem; color: #475569; margin-top: 4px;">CinemachineOrbitalFollow rig with position damping, collision deocclusion, and mouse look controls.</p>
                    </div>
                    <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 10px 14px;">
                        <span style="font-weight: 800; color: #7c3aed; font-size: 0.90rem;">4. AI Navigation &amp; Carving</span>
                        <p style="font-size: 0.82rem; color: #475569; margin-top: 4px;">NavMeshSurface baking, waypoint patrol loop, line-of-sight pursuit, and dynamic obstacle carving.</p>
                    </div>
                </div>
            </div>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap;">
            <a href="../index.html" class="portal-nav-btn" style="flex: 1 1 220px; text-align: center; font-size: 0.82rem; font-weight: 700; background: #0284c7; color: #ffffff; text-decoration: none; border: 1px solid #0369a1; padding: 0.55em 0.9em; border-radius: 6px; white-space: normal; line-height: 1.35; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center;">&larr; Return to Course Portal</a>
            <button onclick="selectSlide(0)" class="portal-nav-btn" style="flex: 1 1 220px; text-align: center; font-size: 0.82rem; font-weight: 700; background: #1e293b; color: #f8fafc; border: 1px solid #475569; padding: 0.55em 0.9em; border-radius: 6px; cursor: pointer; white-space: normal; line-height: 1.35; box-sizing: border-box; height: auto;">Restart Deck &uarr;</button>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">MILESTONE DELIVERABLES</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model:</div>
            Greybox architecture is the foundation for all 3D game production. By mastering metric standards, precision vertex snapping, camera-relative locomotion, and NavMesh navigation, your team has the exact toolset required to build compelling, commercially viable 3D levels.
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Git &amp; Version Control Best Practice:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    Keep <code>Scenes/Gym_MetricCalibration.unity</code> isolated from project level scenes. When testing new controller mechanics or jump values, test them in the gym scene before merging into the main game level.
                </div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Next Sprint Roadmap:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">
                    Lesson 07 will build on this greybox foundation by introducing custom 3D shader graphs, lighting pipelines, and visual effect systems.
                </div>
            </div>
        </div>

        <div class="unity-inspector">
            <div class="unity-inspector-header">
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="display: inline-block; width: 14px; height: 14px; background: #505050; border-radius: 2px; text-align: center; line-height: 14px; font-size: 10px; font-weight: 900; color: #ffffff;">#</span>
                    <span>Project Milestone 6 Checklist &bull; Build Settings</span>
                </div>
                <span style="font-size: 0.68rem; background: #2b2b2b; color: #8bc34a; padding: 2px 6px; border-radius: 3px; border: 1px solid #383838;">Final Verification</span>
            </div>
            <div class="unity-inspector-body">
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Scenes In Build</span>
                    <span class="unity-prop-val">0: Scenes/Gym_MetricCalibration &bull; 1: Scenes/Level01_Greybox</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Physics Fixed Timestep</span>
                    <span class="unity-prop-val">0.02 s (50 Hz Simulation Rate)</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">URP Quality Tier</span>
                    <span class="unity-prop-val">Performant / High-Fidelity 3D</span>
                </div>
                <div class="unity-prop-row">
                    <span class="unity-prop-label">Milestone Status</span>
                    <span class="unity-prop-val"><strong style="color: #4ade80;">100% COMPLETE &bull; READY FOR LEVEL DESIGN</strong></span>
                </div>
            </div>
        </div>

        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-top: 12px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Trap and Why It Breaks:</div>
            Rushing into 3D asset modeling before verifying your greybox layout with real playtesters. Fixing geometry in greybox takes 2 minutes; fixing UVs and 3D meshes takes hours.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Your Project:</strong> Complete your full level layout in greybox, playtest it with 3 external users, lock the metrics, and only then begin final asset art production.
        </div>
    </div>`,
    notes: "Wrap up Lesson 06. Congratulate students on finishing the 3D block prototyping milestone. Remind teams to commit their gym scenes to GitHub and begin greyboxing their project levels."
  }
];

// Custom Simulator JavaScript Functions for Class 6
const customSimPath = path.resolve(__dirname, 'custom_sim_6.js');
const customSimJs = fs.readFileSync(customSimPath, 'utf8');

// Safe Storage and Session Shims
const safeStorageCode = `
        // Safe Storage Shim for file:/// and iframe security origins
        const safeStorage = {
            _data: {},
            getItem(k) {
                try {
                    if (window.location && window.location.protocol === 'file:') return this._data[k] || null;
                    return (typeof window.localStorage !== 'undefined') ? window.localStorage.getItem(k) : this._data[k];
                } catch (e) { return this._data[k] || null; }
            },
            setItem(k, v) {
                try {
                    this._data[k] = String(v);
                    if (window.location && window.location.protocol !== 'file:' && typeof window.localStorage !== 'undefined') {
                        window.localStorage.setItem(k, v);
                    }
                } catch (e) { this._data[k] = String(v); }
            }
        };
        const safeSession = {
            _data: {},
            getItem(k) {
                try {
                    if (window.location && window.location.protocol === 'file:') return this._data[k] || null;
                    return (typeof window.sessionStorage !== 'undefined') ? window.sessionStorage.getItem(k) : this._data[k];
                } catch (e) { return this._data[k] || null; }
            },
            setItem(k, v) {
                try {
                    this._data[k] = String(v);
                    if (window.location && window.location.protocol !== 'file:' && typeof window.sessionStorage !== 'undefined') {
                        window.sessionStorage.setItem(k, v);
                    }
                } catch (e) { this._data[k] = String(v); }
            }
        };`;

// Hook into engine slide transitions to initialize simulators when active
const simLifecycleHook = `
        function checkInitSimulators(slideIdx) {
            setTimeout(() => {
                if (slideIdx === 8) { // Slide 9 (0-indexed 8): Camera Vector Math
                    if (typeof initCamVecInspector === 'function') initCamVecInspector();
                }
            }, 30);
        }
`;

// Build final HTML
const slidesJson = JSON.stringify(slides, null, 2);
const finalHtml = customBeforeScript + '<script>\n' +
    safeStorageCode + '\n\n' +
    '        let slidesData = ' + slidesJson + ';\n\n' +
    engineCode + '\n\n' +
    customSimJs + '\n\n' +
    simLifecycleHook + '\n\n' +
    `        window.onload = function() {
            if (typeof init === 'function') init();
            checkInitSimulators(0);
        };
    </script>
</body>
</html>`;

// Target files to generate
const filesToWrite = [
    'presentation_basics6/presentation_unity6_basics6.html',
    'presentation_basics6/index.html',
    'docs/presentation_basics6/presentation_unity6_basics6.html',
    'docs/presentation_basics6/index.html'
];

filesToWrite.forEach(f => {
    const dir = path.dirname(f);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(f, finalHtml, 'utf8');
    console.log('Successfully wrote: ' + f);
});

console.log('Lesson 06 Deck generated successfully with ' + slides.length + ' slides!');

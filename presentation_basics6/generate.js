const fs = require('fs');
const path = require('path');

// Read presentation 4 as the base HTML shell
const p4Content = fs.readFileSync('presentation_basics4/presentation_unity6_basics4.html', 'utf8');

// Extract CSS and UI Chrome (before script)
const beforeScript = p4Content.substring(0, p4Content.indexOf('<script>'));

// Customise title and header in HTML
let customBeforeScript = beforeScript
    .replace(
        /<title>.*?<\/title>/,
        '<title>Dev - Basics 6: 3D Block Prototyping &amp; Greyboxing</title>'
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
engineCode = engineCode.replace(
    "try { if (window.location && window.location.protocol && window.location.protocol.startsWith('http')) { if (window.self === window.top) { window.location.hash = '#slide-' + (currentSlide + 1); } } } catch(e) {}",
    "try { if (window.location && window.location.protocol && window.location.protocol.startsWith('http')) { let isTop = false; try { isTop = (window.self === window.top); } catch (err) { isTop = false; } if (isTop) { window.location.hash = '#slide-' + (currentSlide + 1); } } } catch(e) {}"
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
            Transitioning from 2D sprites to 3D spaces requires treating geometry as physical spatial architecture. Before placing art assets, textures, or lighting, every jump gap, doorway clearance, and camera angle must be mathematically validated in greybox primitives. If a level is not fun in untextured grey blocks, no amount of 3D visual fidelity will save it.
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
        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">Common Anti-Pattern:</div>
            Importing detailed 3D environment art before verifying player metrics and camera clearance. This leads to costly rework when players get stuck in narrow corridors or jump heights mismatch ledge ledgers.
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Golden Rule for Block 2:</strong> Prototype fast, snap strictly to grid metrics, and prove gameplay mechanics in pure greybox geometry before requesting 3D model art.
        </div>
    </div>`,
    notes: "Welcome to Class 06: 3D Block Prototyping & Greyboxing. Today we transition from 2D pixel systems into full 3D spatial environments in Modern Unity 6. We establish universal spatial metrics, master ProBuilder geometry tools, implement responsive 3D CharacterControllers with camera-relative vector math, and deploy modern NavMesh AI navigation."
  },

  // Slide 2: From 2D Pixels to 3D World Space
  {
    title: "From 2D Pixels to 3D World Space",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary" style="border-left-color: #0284c7;">
                <div class="card-title core" style="color: #0369a1;">3D Coordinate System & Left-Hand Rule</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Unity uses a <strong>Left-Handed Coordinate System</strong> where Y is strictly Up:
                    </p>
                    <ul style="font-size: 0.82rem; color: #1e293b; margin-top: 8px; line-height: 1.5; padding-left: 16px;">
                        <li><strong>+X Axis (Red):</strong> Moves Right.</li>
                        <li><strong>+Y Axis (Green):</strong> Moves Up (World Vertical).</li>
                        <li><strong>+Z Axis (Blue):</strong> Moves Forward (Into the screen).</li>
                    </ul>
                    <div style="margin-top: 10px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 10px; font-size: 0.82rem; color: #0369a1;">
                        <strong>The Universal Metric Anchor:</strong><br>
                        <code>1 Unity Unit = 1 Real-World Meter (1.0m)</code>.<br>
                        Adhering to this scale is mandatory for Unity physics engine (PhysX), lighting falloff (PBR), and AI NavMesh agent sizes.
                    </div>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card primary" style="border-left-color: #059669;">
                <div class="card-title core" style="color: #047857;">Transform Space: Local vs World Space</div>
                <div class="card-body">
                    <div class="code-box">
                        <pre><code><span class="r-cm">// Local Space vs World Space Conversion</span>
Vector3 worldPos = transform.position;
Vector3 localPos = transform.localPosition;

<span class="r-cm">// Direction Vectors (Normalized 1.0m Basis Vectors)</span>
Vector3 fwd = transform.forward; <span class="r-cm">// Local +Z projected into World Space</span>
Vector3 rgt = transform.right;   <span class="r-cm">// Local +X projected into World Space</span>
Vector3 up  = transform.up;      <span class="r-cm">// Local +Y projected into World Space</span>

<span class="r-cm">// Converting Direction from Local to World</span>
Vector3 worldMove = transform.TransformDirection(localInput);</code></pre>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <details class="tier-accordion adv">
        <summary class="accordion-header">
            <span>[Deep Dive] Rotations: Quaternions vs Euler Angles</span>
            <span style="font-size:0.75rem;">Expand</span>
        </summary>
        <div class="accordion-body">
            Never modify <code>transform.rotation.x/y/z</code> directly as Euler degrees. Euler representation suffers from <strong>Gimbal Lock</strong> (loss of one degree of freedom when two axes align). Always perform rotations using <code>Quaternion.Euler(pitch, yaw, roll)</code>, <code>Quaternion.LookRotation(direction)</code>, or <code>Quaternion.Slerp()</code>.
        </div>
    </details>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">COORDINATES</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Coordinate Space Hierarchy:</div>
            A child GameObject's <code>localPosition</code> is relative to its parent's origin. Moving the parent translates all children automatically. In 3D programming, always know whether an API expects world space (e.g. <code>NavMeshAgent.SetDestination</code>) or local space (e.g. local weapon offsets).
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Metric Conventions:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">Human Character = 1.8m height, 0.8m diameter.<br>Standard Cube Primitive = 1.0m x 1.0m x 1.0m.</div>
            </div>
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #0f172a; font-size: 0.88rem; margin-bottom: 6px;">Common Error:</div>
                <div style="font-size: 0.84rem; color: #334155; line-height: 1.5;">Scaling parent objects non-uniformly (e.g. Scale = (1, 3, 1)). This distorts child colliders and causes skewed physics calculations. Always keep root scales at (1, 1, 1).</div>
            </div>
        </div>
    </div>`,
    notes: "Review Left-Handed coordinates: Thumb = Right (+X), Index = Up (+Y), Middle = Forward (+Z). Emphasize that 1 unit = 1 meter is the universal baseline for physics, navmesh, and audio attenuation."
  },

  // Slide 3: Level Design Metrics Standard
  {
    title: "Level Design Metrics Standard",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary" style="border-left-color: #0284c7;">
                <div class="card-title core" style="color: #0369a1;">Standard Architectural Metrics</div>
                <div class="card-body">
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.80rem; text-align: left;">
                        <thead>
                            <tr style="border-bottom: 2px solid #cbd5e1; color: #0f172a;">
                                <th style="padding: 6px;">Element</th>
                                <th style="padding: 6px;">Dimensions (W x H x D)</th>
                                <th style="padding: 6px;">Gameplay Purpose</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="border-bottom: 1px solid #e2e8f0;">
                                <td style="padding: 6px; font-weight: 700;">Single Door</td>
                                <td style="padding: 6px;">1.2m x 2.4m</td>
                                <td style="padding: 6px;">Comfortable player navigation without snagging</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #e2e8f0;">
                                <td style="padding: 6px; font-weight: 700;">Combat Passage</td>
                                <td style="padding: 6px;">2.5m - 4.0m width</td>
                                <td style="padding: 6px;">Allows 2 agents + camera without clipping</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #e2e8f0;">
                                <td style="padding: 6px; font-weight: 700;">Stair Step</td>
                                <td style="padding: 6px;">0.2m rise x 0.3m run</td>
                                <td style="padding: 6px;">CharacterController stepOffset <= 0.3m</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #e2e8f0;">
                                <td style="padding: 6px; font-weight: 700;">Low Cover</td>
                                <td style="padding: 6px;">0.85m - 1.0m height</td>
                                <td style="padding: 6px;">Crouch protection, shoot-over clearance</td>
                            </tr>
                            <tr>
                                <td style="padding: 6px; font-weight: 700;">High Cover</td>
                                <td style="padding: 6px;">2.0m - 2.2m height</td>
                                <td style="padding: 6px;">Full standing block for sightlines</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card primary" style="border-left-color: #f59e0b;">
                <div class="card-title core" style="color: #d97706;">The Metric Reference Dummy</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Always place a <strong>Scale Reference Dummy</strong> (Capsule with height 1.8m, radius 0.4m) in every blockout scene:
                    </p>
                    <ul style="font-size: 0.82rem; color: #1e293b; margin-top: 8px; line-height: 1.45; padding-left: 16px;">
                        <li>Prevents "cathedral syndrome" (building rooms 5x too large).</li>
                        <li>Verifies camera field-of-view (FOV) framing and headroom.</li>
                        <li>Validates jump ledge heights before baking NavMesh.</li>
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
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">METRIC AUDIT</span>
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Step Offset Engineering:</strong> If a staircase riser exceeds <code>CharacterController.stepOffset</code> (default 0.3m), the player cannot walk up the stairs and gets stuck. For smooth stair movement, place an invisible 30-degree ramp collider over stair geometry.
        </div>
    </div>`,
    notes: "Explain why standard metrics matter. In real game studios, level designers receive strict metric guidelines from character animators and combat designers. If a door is 10cm too narrow, the third-person camera will violently snap forward."
  },

  // Slide 4: Greybox Color Paletting & Landmark Readability
  {
    title: "Greybox Color Paletting & Landmark Readability",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary" style="border-left-color: #0284c7;">
                <div class="card-title core" style="color: #0369a1;">The 5-Tone Functional Palette</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Do not use unlit plain white or pitch black materials. Establish a functional visual language:
                    </p>
                    <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 8px; font-size: 0.80rem;">
                        <div style="display: flex; align-items: center; gap: 10px; padding: 4px 8px; background: #e2e8f0; border-radius: 4px; color: #0f172a;">
                            <span style="display: inline-block; width: 14px; height: 14px; background: #94a3b8; border-radius: 2px;"></span>
                            <strong>Floor / Walkable Geometry:</strong> Light Neutral Grey (70% scene area)
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px; padding: 4px 8px; background: #e2e8f0; border-radius: 4px; color: #0f172a;">
                            <span style="display: inline-block; width: 14px; height: 14px; background: #334155; border-radius: 2px;"></span>
                            <strong>Impassable Walls:</strong> Dark Charcoal Grey
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px; padding: 4px 8px; background: #fef3c7; border-radius: 4px; color: #92400e;">
                            <span style="display: inline-block; width: 14px; height: 14px; background: #f59e0b; border-radius: 2px;"></span>
                            <strong>Interactive Objects:</strong> High-Contrast Yellow / Amber
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px; padding: 4px 8px; background: #e0f2fe; border-radius: 4px; color: #0369a1;">
                            <span style="display: inline-block; width: 14px; height: 14px; background: #0284c7; border-radius: 2px;"></span>
                            <strong>Goal / Critical Path:</strong> Signal Cyan / Sky Blue
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px; padding: 4px 8px; background: #fee2e2; border-radius: 4px; color: #991b1b;">
                            <span style="display: inline-block; width: 14px; height: 14px; background: #ef4444; border-radius: 2px;"></span>
                            <strong>Hazard / Killzone:</strong> Signal Red
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card primary" style="border-left-color: #059669;">
                <div class="card-title core" style="color: #047857;">Orientation & Landmarks (Weenie Principle)</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        A player placed in a blockout arena must instinctively know their heading without a minimap:
                    </p>
                    <ul style="font-size: 0.82rem; color: #1e293b; margin-top: 8px; line-height: 1.45; padding-left: 16px;">
                        <li><strong>Major Landmark:</strong> A tall tower, distinct statue, or glowing gateway visible from 80% of the arena.</li>
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
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">READABILITY</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <strong>Prototyping Grid Material:</strong> Create a standard URP material using a 1-meter checkered grid texture. This gives instant visual metric feedback directly on walls and floors without measuring tools.
        </div>
    </div>`,
    notes: "Review the 5-tone palette. Emphasize that greyboxing is not about making ugly levels; it is about communicating spatial hierarchy clearly so playtesters test the game mechanics, not their navigation confusion."
  },

  // Slide 5: Interactive Simulator 1: Jump Arc & Metric Clearance Sandbox
  {
    title: "Interactive Simulator: Jump Arc & Metric Clearance Sandbox",
    content: `<div style="background: #090d16; border: 1.5px solid #1e293b; border-radius: 10px; padding: 14px; color: #f8fafc;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 8px; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
            <div style="font-weight: 900; color: #38bdf8; font-size: 0.96rem;">Jump Arc &amp; Metric Clearance Sandbox</div>
            <div style="font-size: 0.76rem; color: #94a3b8;">Side cross-section: 1 grid square = 1.0m x 1.0m world space</div>
        </div>
        
        <div style="display: grid; grid-template-columns: minmax(calc(240px * var(--font-scale, 1)), calc(300px * var(--font-scale, 1))) 1fr minmax(calc(220px * var(--font-scale, 1)), calc(280px * var(--font-scale, 1))); gap: 12px; align-items: stretch;">
            <!-- Left: Controls -->
            <div style="background: #111827; border: 1px solid #374151; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 8px;">
                <div style="font-weight: 800; color: #60a5fa; font-size: 0.84rem;">PHYSICS PARAMETERS</div>
                
                <div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.74rem; color: #94a3b8;">
                        <span>Jump Height (h):</span> <strong id="jumpHeightVal" style="color: #38bdf8;">2.0 m</strong>
                    </div>
                    <input id="sliderJumpHeight" type="range" min="0.5" max="4.0" step="0.1" value="2.0" style="width: 100%;" oninput="updateJumpParam('jumpHeight', this.value)">
                </div>

                <div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.74rem; color: #94a3b8;">
                        <span>Gravity (g):</span> <strong id="jumpGravityVal" style="color: #38bdf8;">20.0 m/s²</strong>
                    </div>
                    <input id="sliderJumpGravity" type="range" min="9.8" max="40.0" step="1.0" value="20.0" style="width: 100%;" oninput="updateJumpParam('gravity', this.value)">
                </div>

                <div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.74rem; color: #94a3b8;">
                        <span>Move Speed (vx):</span> <strong id="jumpSpeedVal" style="color: #38bdf8;">6.0 m/s</strong>
                    </div>
                    <input id="sliderJumpSpeed" type="range" min="2.0" max="12.0" step="0.5" value="6.0" style="width: 100%;" oninput="updateJumpParam('moveSpeed', this.value)">
                </div>

                <div style="border-top: 1px solid #1f2937; padding-top: 6px; font-weight: 800; color: #fbbf24; font-size: 0.78rem;">OBSTACLES</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                    <button id="btnToggleWall" class="sim-action-btn" style="background: #0369a1; border: 1px solid #38bdf8; color: #fff; font-size: 0.70rem;" onclick="toggleJumpObstacle('wall')">Wall: ON</button>
                    <button id="btnToggleGap" class="sim-action-btn" style="background: #0369a1; border: 1px solid #38bdf8; color: #fff; font-size: 0.70rem;" onclick="toggleJumpObstacle('gap')">Pit: ON</button>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-top: 4px;">
                    <button class="sim-action-btn" style="background: #10b981; border: 1px solid #34d399; color: #fff; font-size: 0.74rem; font-weight: 800;" onclick="launchJumpSimulation()">Launch Jump</button>
                    <button class="sim-action-btn" style="background: #374151; border: 1px solid #6b7280; color: #fff; font-size: 0.74rem;" onclick="resetJumpSimulation()">Reset</button>
                </div>
            </div>

            <!-- Center: 2D Metric View Canvas -->
            <div style="background: #050b14; border: 1px solid #1e293b; border-radius: 8px; padding: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <canvas id="jumpSimCanvas" width="460" height="260" style="width: 100%; height: auto; display: block; border-radius: 4px;"></canvas>
            </div>

            <!-- Right: Physics Telemetry -->
            <div style="background: #111827; border: 1px solid #374151; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 8px;">
                <div style="font-weight: 800; color: #34d399; font-size: 0.84rem;">CALCULATED TELEMETRY</div>
                
                <div style="background: #1e293b; padding: 8px; border-radius: 6px; font-size: 0.78rem;">
                    <div style="color: #94a3b8;">Initial Jump Velocity (vy0):</div>
                    <div id="telemetryVy" style="color: #38bdf8; font-weight: 800; font-size: 0.92rem; font-family: monospace;">8.94 m/s</div>
                </div>

                <div style="background: #1e293b; padding: 8px; border-radius: 6px; font-size: 0.78rem;">
                    <div style="color: #94a3b8;">Time to Apex (tApex):</div>
                    <div id="telemetryTapex" style="color: #38bdf8; font-weight: 800; font-size: 0.92rem; font-family: monospace;">0.45 s</div>
                </div>

                <div style="background: #1e293b; padding: 8px; border-radius: 6px; font-size: 0.78rem;">
                    <div style="color: #94a3b8;">Total Air Time (tHang):</div>
                    <div id="telemetryThang" style="color: #38bdf8; font-weight: 800; font-size: 0.92rem; font-family: monospace;">0.89 s</div>
                </div>

                <div style="background: #1e293b; padding: 8px; border-radius: 6px; font-size: 0.78rem;">
                    <div style="color: #94a3b8;">Max Jump Distance (dMax):</div>
                    <div id="telemetryMaxDist" style="color: #38bdf8; font-weight: 800; font-size: 0.92rem; font-family: monospace;">5.37 m</div>
                </div>

                <div id="telemetryClearanceStatus" style="padding: 8px; border-radius: 6px; font-size: 0.74rem; background: #064e3b; border: 1px solid #10b981; color: #a7f3d0; line-height: 1.35;">
                    <strong>STATUS: PASS</strong> - Clears terrain
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">KINEMATICS</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <strong>Ballistic Formula:</strong> <code>v_y0 = sqrt(2 * gravity * jumpHeight)</code>. Real-world gravity (9.81 m/s²) feels floaty and sluggish in platform games. Game developers typically tune gravity between 20.0 and 35.0 m/s² for snappy, responsive jumps.
        </div>
    </div>`,
    notes: "Demonstrate the interactive jump sandbox. Show students how altering jump height and gravity dynamically changes the initial launch velocity and horizontal reach. Point out that a 4m pit requires at least 4.5m horizontal jump distance to cross safely."
  },

  // Slide 6: ProBuilder Workflow & Geometry Editing
  {
    title: "ProBuilder Workflow & Geometry Editing",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary" style="border-left-color: #0284c7;">
                <div class="card-title core" style="color: #0369a1;">ProBuilder 4 Selection Modes</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        ProBuilder is Unity's built-in 3D modeling tool (<code>Tools -> ProBuilder -> ProBuilder Window</code>):
                    </p>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; font-size: 0.80rem;">
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px;">
                            <strong style="color: #0369a1;">1. Object Mode:</strong> Move, rotate, scale whole mesh.
                        </div>
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px;">
                            <strong style="color: #059669;">2. Vertex Mode:</strong> Select and tweak individual corner points.
                        </div>
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px;">
                            <strong style="color: #d97706;">3. Edge Mode:</strong> Select edges, split loops, bevel transitions.
                        </div>
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; border-radius: 6px;">
                            <strong style="color: #7c3aed;">4. Face Mode:</strong> Extrude, inset, bridge, and delete faces.
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card primary" style="border-left-color: #059669;">
                <div class="card-title core" style="color: #047857;">Core Extrusion & Bevel Operations</div>
                <div class="card-body">
                    <ul style="font-size: 0.82rem; color: #1e293b; line-height: 1.5; padding-left: 16px;">
                        <li><strong>Shift + Drag Face:</strong> Instantly extrudes face along its normal vector.</li>
                        <li><strong>Bevel Edges:</strong> Cuts a 45-degree chamfer along sharp corners to prevent player collision snagging.</li>
                        <li><strong>Center Pivot:</strong> <code>Set Pivot</code> to bottom-center of block so the object sits perfectly flush on the ground plane.</li>
                        <li><strong>Exporting:</strong> When finished, export blockouts as <code>.obj</code> directly to 3D artists for visual set dressing.</li>
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
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">PROBUILDER</span>
        </div>
        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <strong>Collider Warning:</strong> ProBuilder objects generate MeshColliders by default. If you make a moving dynamic obstacle, MeshColliders must have <code>Convex = true</code> or replace them with simple BoxColliders for physics performance.
        </div>
    </div>`,
    notes: "Demonstrate ProBuilder keyboard shortcuts. Highlight Shift+Drag for face extrusion. Remind students that ProBuilder is completely free and built directly into modern Unity."
  },

  // Slide 7: Snapping Mechanics: Grid vs Vertex Snapping
  {
    title: "Snapping Mechanics: Grid vs Vertex Snapping",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary" style="border-left-color: #0284c7;">
                <div class="card-title core" style="color: #0369a1;">Incremental Grid Snapping (Ctrl + Drag)</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Never move greybox primitives freely with the mouse. Always snap to the world grid:
                    </p>
                    <ul style="font-size: 0.82rem; color: #1e293b; margin-top: 8px; line-height: 1.5; padding-left: 16px;">
                        <li><strong>Shortcut:</strong> Hold <code>Ctrl</code> while dragging gizmo handle.</li>
                        <li><strong>Grid Increment:</strong> Set Grid Snap to <code>1.0m</code> for walls/floors, <code>0.5m</code> for cover.</li>
                        <li><strong>Rotation Snap:</strong> Hold <code>Ctrl</code> to snap in 15° or 45° increments.</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card primary" style="border-left-color: #059669;">
                <div class="card-title core" style="color: #047857;">Vertex Snapping (Hold V)</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        To align two complex meshes edge-to-edge with zero millimeter gap:
                    </p>
                    <ul style="font-size: 0.82rem; color: #1e293b; margin-top: 8px; line-height: 1.5; padding-left: 16px;">
                        <li><strong>Shortcut:</strong> Hold <code>V</code>, hover over source vertex, left-click and drag to target vertex.</li>
                        <li><strong>Prevents Light Bleeding:</strong> Gaps between walls allow shadow map light leaks.</li>
                        <li><strong>Prevents NavMesh Disconnection:</strong> Even a 0.05m seam can split NavMesh surfaces.</li>
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
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">SNAPPING</span>
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Rule of Precision:</strong> If position coordinates in the Inspector show decimals like <code>3.00041</code> or <code>-1.9998</code>, an object was dragged without snapping. Reset coordinates to whole integers (e.g. <code>3.0</code>, <code>-2.0</code>).
        </div>
    </div>`,
    notes: "Demonstrate Vertex Snapping with the V key. This is one of the most essential level design techniques in Unity to assemble seamless room modular kits."
  },

  // Slide 8: Physics Architecture: CharacterController vs Rigidbody 3D
  {
    title: "Physics Architecture: CharacterController vs Rigidbody 3D",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary" style="border-left-color: #0284c7;">
                <div class="card-title core" style="color: #0369a1;">CharacterController (Kinematic)</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Specialized capsule component designed specifically for humanoid player movement:
                    </p>
                    <ul style="font-size: 0.82rem; color: #1e293b; margin-top: 8px; line-height: 1.5; padding-left: 16px;">
                        <li><strong>Movement via Code:</strong> <code>controller.Move(velocity * Time.deltaTime)</code>.</li>
                        <li><strong>Built-In Slope Limit:</strong> Automatically slides down slopes steeper than e.g. 45°.</li>
                        <li><strong>Step Offset:</strong> Automatically steps over curbs and stairs up to 0.3m.</li>
                        <li><strong>Zero Tumbling:</strong> Will never bounce, tip over, or roll down a hill.</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card primary" style="border-left-color: #d97706;">
                <div class="card-title core" style="color: #b45309;">Rigidbody 3D (PhysX Simulated)</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Full Newton physics simulation driven by external forces and collisions:
                    </p>
                    <ul style="font-size: 0.82rem; color: #1e293b; margin-top: 8px; line-height: 1.5; padding-left: 16px;">
                        <li><strong>Movement via Forces:</strong> <code>rb.AddForce()</code> or <code>rb.linearVelocity</code>.</li>
                        <li><strong>Momentum & Friction:</strong> Interacts with Physics Materials (bounciness, dynamic friction).</li>
                        <li><strong>Use Case:</strong> Physics sandbox games, ragdolls, rolling boulders, vehicles.</li>
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
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">ARCHITECTURE</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <strong>Which to pick for your game?</strong> For action platformers, third-person action games, and top-down games, use <code>CharacterController</code>. It gives you 100% deterministic control over acceleration, deceleration, and ground contact without physics friction quirks.
        </div>
    </div>`,
    notes: "Clarify the distinction between CharacterController and Rigidbody. Students often struggle when using Rigidbody for player controllers because friction and mass cause players to stick to walls or tip over on stairs."
  },

  // Slide 9: Interactive Simulator 2: Camera-Relative Vector Math Inspector
  {
    title: "Interactive Simulator: Camera-Relative Vector Math Inspector",
    content: `<div style="background: #090d16; border: 1.5px solid #1e293b; border-radius: 10px; padding: 14px; color: #f8fafc;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 8px; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
            <div style="font-weight: 900; color: #38bdf8; font-size: 0.96rem;">Camera-Relative Vector Math Inspector (Top-Down XZ Plane)</div>
            <div style="font-size: 0.76rem; color: #94a3b8;">Transforming 2D Input (WASD) relative to Camera Orbit Yaw</div>
        </div>
        
        <div style="display: grid; grid-template-columns: minmax(calc(220px * var(--font-scale, 1)), calc(280px * var(--font-scale, 1))) 1fr minmax(calc(260px * var(--font-scale, 1)), calc(320px * var(--font-scale, 1))); gap: 12px; align-items: stretch;">
            <!-- Left: Controls -->
            <div style="background: #111827; border: 1px solid #374151; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 8px;">
                <div style="font-weight: 800; color: #60a5fa; font-size: 0.84rem;">CAMERA ORBIT YAW</div>
                
                <div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.74rem; color: #94a3b8;">
                        <span>Camera Yaw:</span> <strong id="camYawValue" style="color: #38bdf8;">45°</strong>
                    </div>
                    <input id="sliderCamYaw" type="range" min="0" max="360" step="5" value="45" style="width: 100%;" oninput="setCamYawSlider(this.value)">
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                    <button class="sim-action-btn" style="background: #1e293b; border: 1px solid #334155; color: #fff; font-size: 0.70rem;" onclick="setCamYawPreset(0)">North (0°)</button>
                    <button class="sim-action-btn" style="background: #1e293b; border: 1px solid #334155; color: #fff; font-size: 0.70rem;" onclick="setCamYawPreset(45)">Iso (45°)</button>
                    <button class="sim-action-btn" style="background: #1e293b; border: 1px solid #334155; color: #fff; font-size: 0.70rem;" onclick="setCamYawPreset(90)">East (90°)</button>
                    <button class="sim-action-btn" style="background: #1e293b; border: 1px solid #334155; color: #fff; font-size: 0.70rem;" onclick="setCamYawPreset(180)">South (180°)</button>
                </div>

                <div style="border-top: 1px solid #1f2937; padding-top: 6px; font-weight: 800; color: #fbbf24; font-size: 0.78rem;">RAW INPUT (WASD)</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px;">
                    <button id="btnInputWA" class="sim-action-btn" style="background: #1e293b; border: 1px solid #334155; color: #fff; font-size: 0.70rem;" onclick="setRawInput(-1, 1)">W+A</button>
                    <button id="btnInputW" class="sim-action-btn" style="background: #0284c7; border: 1px solid #38bdf8; color: #fff; font-size: 0.70rem;" onclick="setRawInput(0, 1)">W (Fwd)</button>
                    <button id="btnInputWD" class="sim-action-btn" style="background: #1e293b; border: 1px solid #334155; color: #fff; font-size: 0.70rem;" onclick="setRawInput(1, 1)">W+D</button>
                    <button id="btnInputA" class="sim-action-btn" style="background: #1e293b; border: 1px solid #334155; color: #fff; font-size: 0.70rem;" onclick="setRawInput(-1, 0)">A (Left)</button>
                    <button id="btnInputS" class="sim-action-btn" style="background: #1e293b; border: 1px solid #334155; color: #fff; font-size: 0.70rem;" onclick="setRawInput(0, -1)">S (Back)</button>
                    <button id="btnInputD" class="sim-action-btn" style="background: #1e293b; border: 1px solid #334155; color: #fff; font-size: 0.70rem;" onclick="setRawInput(1, 0)">D (Right)</button>
                </div>

                <button id="btnToggleFlatten" class="sim-action-btn" style="background: #059669; border: 1px solid #10b981; color: #fff; font-size: 0.72rem; margin-top: 4px;" onclick="toggleFlattenY()">Y-Axis Flattening: ON (Correct)</button>
            </div>

            <!-- Center: Vector Canvas -->
            <div style="background: #050b14; border: 1px solid #1e293b; border-radius: 8px; padding: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <canvas id="camVecCanvas" width="360" height="260" style="width: 100%; height: auto; display: block; border-radius: 4px;"></canvas>
            </div>

            <!-- Right: Code Calculation Breakdown -->
            <div style="background: #111827; border: 1px solid #374151; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 8px;">
                <div style="font-weight: 800; color: #34d399; font-size: 0.84rem;">LIVE VECTOR ARITHMETIC</div>
                <div id="camVecCodeBreakdown" class="code-box" style="margin: 0; font-size: 0.72rem; max-height: 220px; overflow-y: auto;">
                    <!-- Injected via custom_sim_6.js -->
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">VECTOR MATH</span>
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Why Flatten the Y Axis?</strong> In a third-person camera looking downwards at a 45° pitch, <code>camera.forward</code> points diagonally into the ground. If you move along <code>camera.forward</code> without setting <code>y = 0</code>, the player attempts to dig into the ground collider, causing severe movement friction slowdown!
        </div>
    </div>`,
    notes: "Demonstrate camera-relative vector math. Rotate the camera yaw and show how pressing W (forward input) recalculates the resulting world move vector to always match the player's visual forward perspective on screen."
  },

  // Slide 10: PlayerController3D Implementation
  {
    title: "PlayerController3D Implementation",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">PlayerController3D.cs (Part 1)</div>
                <div class="card-body">
                    <div class="code-box">
                        <pre><code>using UnityEngine;

[RequireComponent(typeof(CharacterController))]
public class PlayerController3D : MonoBehaviour
{
    [Header("Movement")]
    [SerializeField] private float moveSpeed = 6f;
    [SerializeField] private float rotationSpeed = 12f;
    [SerializeField] private Transform cameraTransform;

    private CharacterController controller;
    private Vector2 inputVector;
    private Vector3 verticalVelocity;

    private void Awake()
    {
        controller = GetComponent&lt;CharacterController&gt;();
        if (cameraTransform == null &amp;&amp; Camera.main != null)
            cameraTransform = Camera.main.transform;
    }

    public void SetMoveInput(Vector2 input)
    {
        inputVector = input;
    }</code></pre>
                    </div>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card primary">
                <div class="card-title core">PlayerController3D.cs (Part 2: Movement & Rotation)</div>
                <div class="card-body">
                    <div class="code-box">
                        <pre><code>    private void Update()
    {
        // 1. Calculate camera-relative horizontal movement
        Vector3 camFwd = cameraTransform.forward;
        camFwd.y = 0f;
        camFwd.Normalize();

        Vector3 camRight = cameraTransform.right;
        camRight.y = 0f;
        camRight.Normalize();

        Vector3 moveDir = (camFwd * inputVector.y + camRight * inputVector.x).normalized;

        // 2. Smoothly rotate character toward movement direction
        if (moveDir.sqrMagnitude &gt; 0.001f)
        {
            Quaternion targetRot = Quaternion.LookRotation(moveDir);
            transform.rotation = Quaternion.Slerp(transform.rotation, targetRot, rotationSpeed * Time.deltaTime);
        }

        // 3. Apply horizontal movement
        controller.Move(moveDir * moveSpeed * Time.deltaTime + verticalVelocity * Time.deltaTime);
    }
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
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">CONTROLLER</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <strong>Rotation Precision:</strong> Use <code>moveDir.sqrMagnitude > 0.001f</code> before calling <code>Quaternion.LookRotation</code>. If <code>moveDir == Vector3.zero</code>, LookRotation outputs <code>(0,0,0)</code> and throws a console warning.
        </div>
    </div>`,
    notes: "Walk through PlayerController3D code. Highlight how the script accepts input via SetMoveInput (cleanly decoupled from the new Input System) and executes camera-relative movement."
  },

  // Slide 11: Ballistic Jump Velocity & Ground SphereCast Hardening
  {
    title: "Ballistic Jump Velocity & Ground SphereCast Hardening",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary" style="border-left-color: #0284c7;">
                <div class="card-title core" style="color: #0369a1;">Ballistic Jump Physics</div>
                <div class="card-body">
                    <div class="code-box">
                        <pre><code>[Header("Jump Physics")]
[SerializeField] private float jumpHeight = 2.0f;
[SerializeField] private float gravity = 20.0f;
[SerializeField] private float fallMultiplier = 1.5f;

private void HandleJumpAndGravity()
{
    bool isGrounded = CheckGroundCustom();

    if (isGrounded)
    {
        // Maintain small downward force to snap to slopes
        if (verticalVelocity.y &lt; 0f)
            verticalVelocity.y = -2f;

        if (jumpRequested)
        {
            // Exact formula: v = sqrt(2 * g * h)
            verticalVelocity.y = Mathf.Sqrt(2f * gravity * jumpHeight);
            jumpRequested = false;
        }
    }
    else
    {
        // Snappy falling gravity multiplier
        float currentGravity = (verticalVelocity.y &lt; 0f) 
            ? gravity * fallMultiplier 
            : gravity;

        verticalVelocity.y -= currentGravity * Time.deltaTime;
    }
}</code></pre>
                    </div>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card primary" style="border-left-color: #059669;">
                <div class="card-title core" style="color: #047857;">Ground SphereCast Hardening</div>
                <div class="card-body">
                    <div class="code-box">
                        <pre><code>[Header("Ground Check")]
[SerializeField] private LayerMask groundLayer;
[SerializeField] private float groundCheckOffset = 0.1f;
[SerializeField] private float groundCheckRadius = 0.35f;

private bool CheckGroundCustom()
{
    // SphereCast origin slightly above character base
    Vector3 sphereOrigin = transform.position + Vector3.up * (controller.radius + groundCheckOffset);
    
    // Perform sphere check downward
    return Physics.SphereCast(
        sphereOrigin, 
        groundCheckRadius, 
        Vector3.down, 
        out RaycastHit hit, 
        groundCheckOffset * 2f, 
        groundLayer, 
        QueryTriggerInteraction.Ignore
    );
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
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">STABILITY</span>
        </div>
        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #7f1d1d; font-size: 0.88rem; line-height: 1.55;">
            <strong>Why <code>controller.isGrounded</code> Fails:</strong> <code>CharacterController.isGrounded</code> flips to <code>false</code> for 1 frame when walking down stairs or gentle slopes, causing the player to enter a falling state and lose jump input. A custom <code>Physics.SphereCast</code> downward with <code>-2f</code> grounding velocity eliminates all slope jitter.
        </div>
    </div>`,
    notes: "Explain why SphereCast is superior to a single raycast or built-in isGrounded. A sphere matches the bottom dome of the CharacterController capsule."
  },

  // Slide 12: Practice Challenge 1: Build a Greybox Obstacle Course with Jump Clearance
  {
    title: "Practice Challenge 1: Greybox Course with Jump Clearance",
    content: `<div class="content-stack">
        <div class="content-card primary" style="border-left-color: #0284c7;">
            <div class="card-title core" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <span>10-Minute Challenge: Build Metric Obstacle Course</span>
                <span style="background: #0284c7; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 0.74rem;">10-MIN TIMERBOX</span>
            </div>
            <div class="card-body">
                <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                    Construct a test gym in your scene <code>Assets/Scenes/Gym_Greybox.unity</code> following strict metric rules:
                </p>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px; margin-top: 8px;">
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
                        <strong style="color: #0369a1; font-size: 0.84rem;">1. ProBuilder Geometry:</strong>
                        <ul style="font-size: 0.80rem; color: #475569; margin-top: 4px; padding-left: 14px; line-height: 1.4;">
                            <li>Start platform: 4.0m x 4.0m (Grid Snapped).</li>
                            <li>Gap pit: Exactly 3.5m wide.</li>
                            <li>Obstacle wall: 1.5m height on landing pad.</li>
                        </ul>
                    </div>
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
                        <strong style="color: #059669; font-size: 0.84rem;">2. Player Tuning:</strong>
                        <ul style="font-size: 0.80rem; color: #475569; margin-top: 4px; padding-left: 14px; line-height: 1.4;">
                            <li>Tune <code>moveSpeed = 6.5 m/s</code>, <code>jumpHeight = 2.0m</code>.</li>
                            <li>Verify player cleanly clears the 3.5m gap and 1.5m wall.</li>
                            <li>Color-code platforms using 5-tone palette.</li>
                        </ul>
                    </div>
                </div>

                <!-- Timer Controls -->
                <div style="margin-top: 14px; background: #0f172a; border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-weight: 800; color: #94a3b8; font-size: 0.84rem;">CHALLENGE TIMER:</span>
                        <span id="challengeTimer1" style="font-size: 1.4rem; font-weight: 900; color: #38bdf8; font-family: monospace;">10:00</span>
                    </div>
                    <div style="display: flex; gap: 6px;">
                        <button class="sim-action-btn" style="background: #059669; border: 1px solid #10b981; color: #fff; font-size: 0.74rem;" onclick="startChallengeTimer(1)">Start Timer</button>
                        <button class="sim-action-btn" style="background: #d97706; border: 1px solid #f59e0b; color: #fff; font-size: 0.74rem;" onclick="pauseChallengeTimer(1)">Pause</button>
                        <button class="sim-action-btn" style="background: #475569; border: 1px solid #64748b; color: #fff; font-size: 0.74rem;" onclick="resetChallengeTimer(1)">Reset</button>
                    </div>
                </div>

                <!-- Locked Solution -->
                <div id="solutionLockBanner1" style="margin-top: 10px; background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 6px; padding: 8px 12px; font-size: 0.80rem; color: #991b1b;">
                    [LOCKED] Solution unlocks in: <strong id="solutionLockTimer1">01:00</strong> (Implement code first)
                </div>
                
                <details id="solutionDetails1" class="tier-accordion adv" style="margin-top: 8px; pointer-events: none; opacity: 0.5;">
                    <summary class="accordion-header">
                        <span>[Verified Solution] Metric Validation Checklist</span>
                        <span style="font-size:0.75rem;">View Architecture</span>
                    </summary>
                    <div class="accordion-body">
                        <div class="code-box">
                            <pre><code>// Kinematic Verification:
// jumpHeight = 2.0m, gravity = 22.0 m/s^2, moveSpeed = 6.5 m/s
// vy0 = sqrt(2 * 22 * 2) = 9.38 m/s
// tTotal = 2 * (9.38 / 22) = 0.852 s
// Max Jump Distance = 6.5 m/s * 0.852 s = 5.54 meters
// Result: 5.54m comfortably clears 3.5m gap with 2.04m safety margin!</code></pre>
                        </div>
                    </div>
                </details>
            </div>
        </div>
    </div>`,
    notes: "Start the 10-minute countdown timer. Students must build the ProBuilder gym and tune their controller metrics. Remind them that the solution will unlock automatically after 60 seconds."
  },

  // Slide 13: Cinemachine 3.x Third-Person Camera Rig
  {
    title: "Cinemachine 3.x Third-Person Camera Rig",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary" style="border-left-color: #0284c7;">
                <div class="card-title core" style="color: #0369a1;">Unity 6 Cinemachine 3.x Architecture</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Cinemachine 3.x introduces streamlined component naming and procedural orbital follow:
                    </p>
                    <ul style="font-size: 0.82rem; color: #1e293b; margin-top: 8px; line-height: 1.5; padding-left: 16px;">
                        <li><strong>CinemachineCamera:</strong> The core virtual camera component (replaces legacy CinemachineVirtualCamera).</li>
                        <li><strong>Tracking Target (Follow):</strong> Set to player transform.</li>
                        <li><strong>CinemachineOrbitalFollow:</strong> 360-degree orbital rig driven by mouse / right-stick input.</li>
                        <li><strong>CinemachineThirdPersonFollow:</strong> Shoulder-cam rig with 3-ring damping heights.</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card primary" style="border-left-color: #059669;">
                <div class="card-title core" style="color: #047857;">Damping & Collision Deocclusion</div>
                <div class="card-body">
                    <ul style="font-size: 0.82rem; color: #1e293b; line-height: 1.5; padding-left: 16px;">
                        <li><strong>Position Damping:</strong> Set X/Y/Z Damping to <code>0.15s - 0.25s</code> to absorb micro-stutters.</li>
                        <li><strong>CinemachineDeocclusion:</strong> Prevents camera from clipping inside greybox walls by raycasting and pulling camera forward.</li>
                        <li><strong>Input Binding:</strong> Attach <code>CinemachineInputAxisController</code> to bind Delta look inputs directly to orbital yaw/pitch.</li>
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
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">CINEMACHINE</span>
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Target Center Offset:</strong> Always point the camera LookAt target at <code>transform.position + Vector3.up * 1.4f</code> (chest/shoulder level). Looking at feet <code>(0,0,0)</code> causes downward tilt and bad framing.
        </div>
    </div>`,
    notes: "Review Cinemachine 3.x setup in Unity 6. Emphasize that CinemachineBrain on the Main Camera handles blending, while CinemachineCamera controls orbital tracking."
  },

  // Slide 14: Modern NavMesh Navigation: NavMeshSurface Architecture
  {
    title: "Modern NavMesh Navigation: NavMeshSurface Architecture",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary" style="border-left-color: #0284c7;">
                <div class="card-title core" style="color: #0369a1;">Unity 6 AI Navigation Package</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Install via Package Manager: <code>com.unity.ai.navigation</code>. Modern NavMesh is component-based:
                    </p>
                    <ul style="font-size: 0.82rem; color: #1e293b; margin-top: 8px; line-height: 1.5; padding-left: 16px;">
                        <li><strong>NavMeshSurface Component:</strong> Attach to environment root GameObject.</li>
                        <li><strong>Agent Type:</strong> Humanoid (Radius: 0.4m, Height: 1.8m, Max Slope: 45°, Step: 0.4m).</li>
                        <li><strong>Collect Objects:</strong> All or Volume (Bake only active room).</li>
                        <li><strong>Include Layers:</strong> Only include <code>Default</code> and <code>Environment</code> layers.</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card primary" style="border-left-color: #059669;">
                <div class="card-title core" style="color: #047857;">Runtime NavMesh Baking</div>
                <div class="card-body">
                    <div class="code-box">
                        <pre><code>using Unity.AI.Navigation;
using UnityEngine;

public class DungeonBuilder : MonoBehaviour
{
    [SerializeField] private NavMeshSurface surface;

    public void GenerateDungeon()
    {
        SpawnRoomBlocks();

        // Bake NavMesh dynamically at runtime in &lt;15ms
        surface.BuildNavMesh();
    }
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
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">NAVMESH</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <strong>Multiple Agent Radii:</strong> You can bake multiple NavMesh surfaces for different agent sizes (e.g. Tiny Goblin radius 0.2m vs Giant Boss radius 1.5m). Each agent uses its matching Agent Type surface.
        </div>
    </div>`,
    notes: "Explain modern NavMeshSurface. The legacy static window workflow is deprecated in Unity 6. The modern package allows runtime baking for procedural layouts and per-room volumes."
  },

  // Slide 15: Interactive Simulator 3: NavMesh Agent Pathfinding & Carving Simulator
  {
    title: "Interactive Simulator: NavMesh Agent Pathfinding & Carving",
    content: `<div style="background: #090d16; border: 1.5px solid #1e293b; border-radius: 10px; padding: 14px; color: #f8fafc;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 8px; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
            <div style="font-weight: 900; color: #38bdf8; font-size: 0.96rem;">NavMesh Agent Pathfinding &amp; Dynamic Carving Simulator</div>
            <div style="font-size: 0.76rem; color: #94a3b8;">Click canvas to set custom destination; toggle real-time dynamic obstacle carving</div>
        </div>
        
        <div style="display: grid; grid-template-columns: minmax(calc(220px * var(--font-scale, 1)), calc(280px * var(--font-scale, 1))) 1fr minmax(calc(220px * var(--font-scale, 1)), calc(280px * var(--font-scale, 1))); gap: 12px; align-items: stretch;">
            <!-- Left: Controls -->
            <div style="background: #111827; border: 1px solid #374151; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 8px;">
                <div style="font-weight: 800; color: #60a5fa; font-size: 0.84rem;">AGENT BEHAVIOR MODE</div>
                
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <button id="btnNavPatrol" class="sim-action-btn" style="background: #0369a1; border: 1px solid #38bdf8; color: #fff; font-size: 0.72rem;" onclick="setNavAgentMode('patrol')">Mode: Patrol (WP 1-4)</button>
                    <button id="btnNavChase" class="sim-action-btn" style="background: #1e293b; border: 1px solid #334155; color: #fff; font-size: 0.72rem;" onclick="setNavAgentMode('chase')">Mode: Chase Player</button>
                    <button id="btnNavManual" class="sim-action-btn" style="background: #1e293b; border: 1px solid #334155; color: #fff; font-size: 0.72rem;" onclick="setNavAgentMode('manual')">Mode: Click Destination</button>
                </div>

                <div style="border-top: 1px solid #1f2937; padding-top: 6px; font-weight: 800; color: #fbbf24; font-size: 0.78rem;">DYNAMIC CARVING</div>
                <button id="btnToggleCarve" class="sim-action-btn" style="background: #059669; border: 1px solid #10b981; color: #fff; font-size: 0.72rem;" onclick="toggleNavCarving()">Dynamic Obstacle Carve: ON</button>
                
                <div style="font-size: 0.72rem; color: #94a3b8; line-height: 1.35; margin-top: 4px;">
                    When Carve is ON, the NavMeshObstacle punches a geometric hole in the surface, forcing instant path recalculation around it.
                </div>
            </div>

            <!-- Center: Canvas Arena -->
            <div style="background: #050b14; border: 1px solid #1e293b; border-radius: 8px; padding: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <canvas id="navMeshCanvas" width="460" height="320" style="width: 100%; height: auto; display: block; border-radius: 4px; cursor: crosshair;" onclick="onNavCanvasClick(event)"></canvas>
            </div>

            <!-- Right: Live Telemetry -->
            <div style="background: #111827; border: 1px solid #374151; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 8px;">
                <div style="font-weight: 800; color: #34d399; font-size: 0.84rem;">AGENT TELEMETRY</div>
                
                <div style="background: #1e293b; padding: 8px; border-radius: 6px; font-size: 0.78rem;">
                    <div style="color: #94a3b8;">Path Status:</div>
                    <div id="navTelemetryStatus" style="color: #10b981; font-weight: 800; font-size: 0.88rem;">PathComplete (A* Polyline)</div>
                </div>

                <div style="background: #1e293b; padding: 8px; border-radius: 6px; font-size: 0.78rem;">
                    <div style="color: #94a3b8;">Remaining Distance:</div>
                    <div id="navTelemetryRemaining" style="color: #38bdf8; font-weight: 800; font-size: 0.92rem; font-family: monospace;">6.4 m</div>
                </div>

                <div style="background: #1e293b; padding: 8px; border-radius: 6px; font-size: 0.78rem;">
                    <div style="color: #94a3b8;">Corner Points:</div>
                    <div id="navTelemetryCorners" style="color: #38bdf8; font-weight: 800; font-size: 0.92rem; font-family: monospace;">3 points</div>
                </div>

                <div style="background: #1e293b; padding: 8px; border-radius: 6px; font-size: 0.78rem;">
                    <div style="color: #94a3b8;">Agent Current State:</div>
                    <div id="navTelemetryState" style="color: #fbbf24; font-weight: 800; font-size: 0.84rem;">Patrol Loop (WP 1/4)</div>
                </div>
            </div>
        </div>
    </div>
    <div class="lab-deep-dive" style="margin-top: 24px; padding: 20px 24px; background: #ffffff; border: 2px solid #0284c7; border-left: 8px solid #0284c7; border-radius: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); color: #0f172a; text-align: left; width: 100%; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 1.05rem; font-weight: 900; color: #0369a1; display: flex; align-items: center; gap: 8px;">
                <span>LAB MODE STUDY GUIDE: DEEP DIVE</span>
            </div>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">ALGORITHMS</span>
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Funnel Algorithm:</strong> Once A* finds the sequence of convex NavMesh polygons, the String Pulling (Funnel) algorithm calculates the shortest path around polygon corners, preventing zigzagging paths.
        </div>
    </div>`,
    notes: "Demonstrate the NavMesh simulator. Click anywhere on the canvas to command the green agent. Toggle Carve ON/OFF to show how cutting the NavMesh instantly redirects the path around the orange barricade."
  },

  // Slide 16: Enemy AI Patrol & Pursuit Implementation
  {
    title: "Enemy AI Patrol & Pursuit Implementation",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">EnemyAIController.cs (Part 1: Setup & Patrol)</div>
                <div class="card-body">
                    <div class="code-box">
                        <pre><code>using UnityEngine;
using UnityEngine.AI;

[RequireComponent(typeof(NavMeshAgent))]
public class EnemyAIController : MonoBehaviour
{
    [Header("Patrol")]
    [SerializeField] private Transform[] waypoints;
    [SerializeField] private float stoppingDistance = 0.5f;

    [Header("Vision")]
    [SerializeField] private Transform targetPlayer;
    [SerializeField] private float detectionRange = 10f;
    [SerializeField] private float fieldOfView = 60f;
    [SerializeField] private LayerMask obstacleLayer;

    private NavMeshAgent agent;
    private int currentWaypointIndex = 0;

    private void Awake()
    {
        agent = GetComponent&lt;NavMeshAgent&gt;();
        agent.stoppingDistance = stoppingDistance;
    }

    private void Update()
    {
        if (CanSeePlayer())
        {
            // State: Pursue
            agent.SetDestination(targetPlayer.position);
        }
        else
        {
            // State: Patrol Loop
            HandlePatrol();
        }
    }</code></pre>
                    </div>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card primary">
                <div class="card-title core">EnemyAIController.cs (Part 2: Waypoints & LOS)</div>
                <div class="card-body">
                    <div class="code-box">
                        <pre><code>    private void HandlePatrol()
    {
        if (waypoints == null || waypoints.Length == 0) return;

        // Check if agent reached current waypoint
        if (!agent.pathPending && agent.remainingDistance &lt;= agent.stoppingDistance)
        {
            currentWaypointIndex = (currentWaypointIndex + 1) % waypoints.Length;
            agent.SetDestination(waypoints[currentWaypointIndex].position);
        }
    }

    private bool CanSeePlayer()
    {
        if (targetPlayer == null) return false;
        Vector3 dirToPlayer = (targetPlayer.position - transform.position);
        
        if (dirToPlayer.magnitude &gt; detectionRange) return false;

        // Check FOV cone angle
        if (Vector3.Angle(transform.forward, dirToPlayer.normalized) &gt; fieldOfView / 2f)
            return false;

        // Raycast line of sight check against walls
        return !Physics.Raycast(transform.position + Vector3.up, dirToPlayer.normalized, dirToPlayer.magnitude, obstacleLayer);
    }
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
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">LINE OF SIGHT</span>
        </div>
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; color: #14532d; font-size: 0.88rem; line-height: 1.55;">
            <strong>Essential Check:</strong> Always verify <code>!agent.pathPending</code> before reading <code>agent.remainingDistance</code>. When <code>SetDestination</code> is called, pathfinding runs asynchronously; during that 1-frame window, <code>remainingDistance</code> returns <code>0</code>!
        </div>
    </div>`,
    notes: "Walk through EnemyAIController. Point out the pathPending guard condition. Emphasize how vector math (Angle) and physics raycasting combine with NavMesh pathfinding."
  },

  // Slide 17: NavMesh Obstacles: Dynamic Carving vs Static Geometry
  {
    title: "NavMesh Obstacles: Dynamic Carving vs Static Geometry",
    content: `<div class="split-layout">
        <div class="left-column">
            <div class="content-card primary" style="border-left-color: #0284c7;">
                <div class="card-title core" style="color: #0369a1;">NavMeshObstacle: Carve = true</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Punches a real-time polygonal hole in the NavMesh surface:
                    </p>
                    <ul style="font-size: 0.82rem; color: #1e293b; margin-top: 8px; line-height: 1.5; padding-left: 16px;">
                        <li><strong>Best For:</strong> Doors that open/close, fallen rubble, barricades.</li>
                        <li><strong>TimeToStationary:</strong> Set to e.g. <code>0.5s</code> so carving only happens when the object stops moving.</li>
                        <li><strong>Performance:</strong> Carving forces NavMesh triangulation update. Avoid carving 50+ objects simultaneously every frame.</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card primary" style="border-left-color: #d97706;">
                <div class="card-title core" style="color: #b45309;">NavMeshObstacle: Carve = false</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Uses reciprocal velocity obstacle (RVO) steering avoidance without changing the mesh:
                    </p>
                    <ul style="font-size: 0.82rem; color: #1e293b; margin-top: 8px; line-height: 1.5; padding-left: 16px;">
                        <li><strong>Best For:</strong> Moving crates, patrol vehicles, other AI agents.</li>
                        <li><strong>Lightweight:</strong> Zero CPU cost on NavMesh geometry.</li>
                        <li><strong>Limitation:</strong> Agents will not plan long-term routes around large non-carved obstacles.</li>
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
            <span style="background: #e0f2fe; color: #0284c7; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 12px; border: 1px solid #bae6fd;">CARVING</span>
        </div>
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 0.86rem; color: #1e40af; line-height: 1.5;">
            <strong>Rule of Thumb:</strong> If an obstacle moves constantly (e.g. wandering guard), keep Carve OFF. If an obstacle opens or closes occasionally (e.g. security gate), turn Carve ON with <code>TimeToStationary = 0.5s</code>.
        </div>
    </div>`,
    notes: "Contrast Carving vs Non-carving obstacles. Explain how TimeToStationary prevents frame rate drops when physics objects are pushed across the floor."
  },

  // Slide 18: Practice Challenge 2: NavMesh Arena Patrol & Chaser
  {
    title: "Practice Challenge 2: NavMesh Arena Patrol & Chaser",
    content: `<div class="content-stack">
        <div class="content-card primary" style="border-left-color: #0284c7;">
            <div class="card-title core" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <span>10-Minute Challenge: Patrol Waypoint AI with Dynamic Gate</span>
                <span style="background: #0284c7; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 0.74rem;">10-MIN TIMERBOX</span>
            </div>
            <div class="card-body">
                <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                    Implement an AI patrol arena in <code>Assets/Scenes/Gym_NavMesh.unity</code>:
                </p>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px; margin-top: 8px;">
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
                        <strong style="color: #0369a1; font-size: 0.84rem;">1. Scene Setup:</strong>
                        <ul style="font-size: 0.80rem; color: #475569; margin-top: 4px; padding-left: 14px; line-height: 1.4;">
                            <li>Bake a <code>NavMeshSurface</code> on arena floor.</li>
                            <li>Place 4 Empty GameObjects as patrol waypoints (A, B, C, D).</li>
                            <li>Add a dynamic blast door with <code>NavMeshObstacle (Carve = true)</code>.</li>
                        </ul>
                    </div>
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
                        <strong style="color: #059669; font-size: 0.84rem;">2. AI Logic:</strong>
                        <ul style="font-size: 0.80rem; color: #475569; margin-top: 4px; padding-left: 14px; line-height: 1.4;">
                            <li>Attach <code>EnemyAIController.cs</code> to enemy capsule.</li>
                            <li>Verify enemy loops through waypoints.</li>
                            <li>Close blast door and observe enemy rerouting cleanly.</li>
                        </ul>
                    </div>
                </div>

                <!-- Timer Controls -->
                <div style="margin-top: 14px; background: #0f172a; border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-weight: 800; color: #94a3b8; font-size: 0.84rem;">CHALLENGE TIMER:</span>
                        <span id="challengeTimer2" style="font-size: 1.4rem; font-weight: 900; color: #38bdf8; font-family: monospace;">10:00</span>
                    </div>
                    <div style="display: flex; gap: 6px;">
                        <button class="sim-action-btn" style="background: #059669; border: 1px solid #10b981; color: #fff; font-size: 0.74rem;" onclick="startChallengeTimer(2)">Start Timer</button>
                        <button class="sim-action-btn" style="background: #d97706; border: 1px solid #f59e0b; color: #fff; font-size: 0.74rem;" onclick="pauseChallengeTimer(2)">Pause</button>
                        <button class="sim-action-btn" style="background: #475569; border: 1px solid #64748b; color: #fff; font-size: 0.74rem;" onclick="resetChallengeTimer(2)">Reset</button>
                    </div>
                </div>

                <!-- Locked Solution -->
                <div id="solutionLockBanner2" style="margin-top: 10px; background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 6px; padding: 8px 12px; font-size: 0.80rem; color: #991b1b;">
                    [LOCKED] Solution unlocks in: <strong id="solutionLockTimer2">01:00</strong> (Implement code first)
                </div>
                
                <details id="solutionDetails2" class="tier-accordion adv" style="margin-top: 8px; pointer-events: none; opacity: 0.5;">
                    <summary class="accordion-header">
                        <span>[Verified Solution] Enemy Patrol State Machine</span>
                        <span style="font-size:0.75rem;">View Implementation</span>
                    </summary>
                    <div class="accordion-body">
                        <div class="code-box">
                            <pre><code>// Ensure layer masks are configured correctly:
// 1. Obstacles on 'Environment' layer (Layer 3)
// 2. Player on 'Player' layer (Layer 6)
// 3. Raycast uses LayerMask.GetMask("Environment") to check for wall occlusion.</code></pre>
                        </div>
                    </div>
                </details>
            </div>
        </div>
    </div>`,
    notes: "Start the second 10-minute timer. Help students verify that their NavMeshObstacle dynamically carves when enabled in Play Mode."
  },

  // Slide 19: Milestone Summary & 3D Project Sprint Checklist
  {
    title: "Milestone Summary & 3D Project Sprint Checklist",
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
                        <span style="font-weight: 800; color: #7c3aed; font-size: 0.90rem;">4. AI Navigation & Carving</span>
                        <p style="font-size: 0.82rem; color: #475569; margin-top: 4px;">NavMeshSurface baking, waypoint patrol loop, line-of-sight pursuit, and dynamic obstacle carving.</p>
                    </div>
                </div>
            </div>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap;">
            <a href="../index.html" class="portal-nav-btn" style="flex: 1 1 220px; text-align: center; font-size: 0.82rem; font-weight: 700; background: #0284c7; color: #ffffff; text-decoration: none; border: 1px solid #0369a1; padding: 0.55em 0.9em; border-radius: 6px; white-space: normal; line-height: 1.35; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center;">&larr; Return to Course Portal</a>
            <button onclick="selectSlide(0)" class="portal-nav-btn" style="flex: 1 1 220px; text-align: center; font-size: 0.82rem; font-weight: 700; background: #1e293b; color: #f8fafc; border: 1px solid #475569; padding: 0.55em 0.9em; border-radius: 6px; cursor: pointer; white-space: normal; line-height: 1.35; box-sizing: border-box; height: auto;">Restart Deck &uarr;</button>
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
        // Hook into showSlide / selectSlide to init simulators on entry
        const origShowSlide = typeof showSlide === 'function' ? showSlide : null;
        const origSelectSlide = typeof selectSlide === 'function' ? selectSlide : null;

        function checkInitSimulators(slideIdx) {
            setTimeout(() => {
                if (slideIdx === 4) { // Slide 5 (0-indexed 4): Jump Sandbox
                    if (typeof initJumpSandbox === 'function') initJumpSandbox();
                } else if (slideIdx === 8) { // Slide 9 (0-indexed 8): Camera Vector Math
                    if (typeof initCamVecInspector === 'function') initCamVecInspector();
                } else if (slideIdx === 14) { // Slide 15 (0-indexed 14): NavMesh Simulator
                    if (typeof initNavMeshSimulator === 'function') initNavMeshSimulator();
                }
            }, 50);
        }

        if (typeof showSlide === 'function') {
            window.showSlide = function(idx) {
                origShowSlide(idx);
                checkInitSimulators(idx);
            };
        }
        if (typeof selectSlide === 'function') {
            window.selectSlide = function(idx) {
                origSelectSlide(idx);
                checkInitSimulators(idx);
            };
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

const fs = require('fs');
const path = require('path');

console.log('Generating Class 3 presentation...');

const slidesData = [
  // Slide 1: Hero
  {
    isHero: true,
    title: "Dev - Basics 3: UI Layouting & Data Persistence",
    subtitle: "Minor Game Design & Development - Hogeschool Rotterdam",
    topics: [
      "1. Coordinate Systems & RectTransform (anchoredPosition, pivots, rect tool)",
      "2. Canvas Architecture (Screen Space - Overlay, Camera, and World Space in 2D)",
      "3. Responsive Multi-Resolution UI & Safe Area (Fluid Adaptation, No Black Bars)",
      "4. Universal Anchor Playbook (Corners, Stretches, Center Modals, 9-Slicing, AspectRatioFitter)",
      "5. TextMeshPro, Touch Controls & Decoupled Scripting (OnScreenStick, C# Actions)",
      "6. Data Persistence Engine (PlayerPrefs trap vs Production JSON Serialization)"
    ],
    origImg: "original_slides/slide_01.png",
    notes: "Lesson Overview (10 min): Welcome students to Class 3. Frame today around two core pillars: Responsive UI (making sure your game looks identical on 16:9, Ultrawide, and mobile screens) and Data Persistence (saving and loading game state cleanly with JSON)."
  },

  // Slide 2: Roadmap & 5 Milestones
  {
    title: "Course Roadmap & 5 Milestones",
    origImg: "original_slides/slide_02.png",
    content: `
    <div class="content-stack">
        <div class="content-card primary" style="border-left-color: #0284c7; background: #f0f9ff; margin-bottom: 8px;">
            <div class="card-title core" style="color: #0369a1; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <span>Mobile Game Project Setup &bull; In-Engine Workflow</span>
                <span style="background: #0284c7; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-size: 0.72rem; font-weight: 800;">No Package Required</span>
            </div>
            <div class="card-body" style="font-size: 0.84rem; color: #0c4a6e; line-height: 1.45; margin-top: 4px;">
                There is <strong>no starter package to download or import</strong> for this class. You will build and test your scalable UI directly inside your team's ongoing <strong>mobile game project</strong> (or in a dedicated test scene <code>Assets/Class3/Class3_MobileUI.unity</code>). All UI systems (Canvas, RectTransform, TextMeshPro, and JSON persistence) are built into Unity 6 standard libraries.
            </div>
        </div>

        <div class="content-card primary">
            <div class="card-title core">5 Core Architecture Milestones</div>
            <div class="card-body">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px; margin-top: 6px;">
                    <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 10px 14px;">
                        <span style="font-weight: 800; color: #059669; font-size: 0.95rem;">1. Coordinate Canvas</span>
                        <p style="font-size: 0.88rem; color: #475569; margin-top: 4px;">Master the Rect Tool (T), RectTransform bounding boxes, and the 3 Canvas render modes.</p>
                    </div>
                    <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 10px 14px;">
                        <span style="font-weight: 800; color: #0284c7; font-size: 0.95rem;">2. Scaler &amp; Safe Area</span>
                        <p style="font-size: 0.88rem; color: #475569; margin-top: 4px;">Lock reference resolution, set Match Height 1.0, and implement SafeAreaFitter for mobile notches.</p>
                    </div>
                    <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 10px 14px;">
                        <span style="font-weight: 800; color: #d97706; font-size: 0.95rem;">3. TextMeshPro &amp; UI</span>
                        <p style="font-size: 0.88rem; color: #475569; margin-top: 4px;">Leverage SDF vector text rendering and event-driven buttons without messy Update polling.</p>
                    </div>
                    <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 10px 14px;">
                        <span style="font-weight: 800; color: #7c3aed; font-size: 0.95rem;">4. Decoupled UI Events</span>
                        <p style="font-size: 0.88rem; color: #475569; margin-top: 4px;">Listen to gameplay C# Actions (health, score, inventory) instead of calling GameObject.Find.</p>
                    </div>
                    <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; grid-column: span 2;">
                        <span style="font-weight: 800; color: #e11d48; font-size: 0.95rem;">5. Cross-Platform JSON Persistence</span>
                        <p style="font-size: 0.88rem; color: #475569; margin-top: 4px;">Replace the PlayerPrefs trap with robust, serialized C# JSON save files in persistentDataPath.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <details class="tier-accordion adv">
        <summary class="accordion-header">
            <span>[Advanced] Canvas Rebatching Performance Rule</span>
            <span style="font-size:0.75rem;">Expand</span>
        </summary>
        <div class="accordion-body">
            When a single UI element moves or changes text on a Canvas, Unity regenerates the mesh for the <strong>entire</strong> Canvas! Split your UI into multiple sub-canvases: static background Canvas vs dynamic frequent-updating HUD Canvas.
        </div>
    </details>
    <details class="tier-accordion exp">
        <summary class="accordion-header">
            <span>[Expert] UI Profiling with the Unity Frame Debugger</span>
            <span style="font-size:0.75rem;">Expand</span>
        </summary>
        <div class="accordion-body">
            Open <code>Window &gt; Analysis &gt; Frame Debugger</code> to inspect UI draw calls. Ensure sprites share Sprite Atlases to allow Unity's SRP Batcher to combine hundreds of UI elements into 1-2 draw calls!
        </div>
    </details>
    `,
    notes: "Roadmap (5 min): Walk through the 5 milestones. Highlight that UI and saving are common points of failure in indie game jams and minor portfolio projects."
  },

  // Slide 3: Section 1 Inverted Slide
  {
    isInverted: true,
    title: "1. The Canvas & RectTransform",
    subtitle: "Coordinate Systems, Responsive Anchors & Canvas Render Modes",
    origImg: "original_slides/slide_02.png",
    content: `
        <div class="content-stack">
            <div class="content-card primary" style="background: rgba(255, 255, 255, 0.1); border-left-color: #ffffff; color: #ffffff;">
                <div class="card-title core" style="color: #ffffff;">The Core Challenge</div>
                <div class="card-body" style="color: #f1f5f9;">
                    Unlike 3D game objects that live at fixed world coordinates (X, Y, Z meters), user interface elements live inside a 2D bounding hierarchy that must fluidly stretch, scale, and pin across screens ranging from 720p handhelds to 4K desktop displays.
                </div>
            </div>
        </div>
    `,
    notes: "Section 1: The Canvas (2 min): Frame why UI layout in Unity is different from regular 3D scene placement. A standard Transform only has position and scale, but UI elements need dynamic rectangle boundaries.",
    topics: [
      "Rect Tool (T)",
      "Transform vs RectTransform",
      "Screen Space - Overlay vs Camera",
      "World Space in-game UI"
    ]
  },

  // Slide 4: Rect Tool & RectTransform
  {
    title: "The Rect Tool & RectTransform",
    origImg: "original_slides/slide_03.png",
    content: `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">Transform vs RectTransform</div>
                <div class="card-body">
                    <p style="margin: 0 0 8px 0; font-weight: 600;">Every UI GameObject replaces the standard Transform with a <strong>RectTransform</strong>:</p>
                    <ul style="padding-left: 18px; margin: 0; line-height: 1.5; font-weight: 600;">
                        <li><strong>Standard Transform:</strong> Point in 3D space (<code>Vector3 position</code>, <code>rotation</code>, <code>scale</code>). Zero concept of width or borders!</li>
                        <li><strong>RectTransform:</strong> 2D rectangle (<code>anchoredPosition</code>, <code>sizeDelta</code>, <code>pivot</code>, <code>anchorMin</code>, <code>anchorMax</code>).</li>
                        <li><strong>The Rect Tool (Key: T):</strong> Lets you manipulate corners, borders, and pivots directly in the Scene view.</li>
                    </ul>
                    <div class="lab-deep-dive">
                        <strong>Why transform.position breaks UI:</strong> Modifying <code>transform.position</code> overrides anchor calculations and places elements at screen pixel coordinates, causing them to drift when the window is resized! Always modify <code>rectTransform.anchoredPosition</code> in code.
                    </div>
                </div>
            </div>

            <div class="content-card primary" style="border-left-color: #10b981;">
                <div class="card-title core" style="color: #059669;">RectTransform Golden Rule</div>
                <div class="card-body">
                    <strong>Keep Scale at (1, 1, 1)!</strong> Resize UI elements using <strong>Width &amp; Height</strong> (or <code>sizeDelta</code>), never by scaling the transform. Scaling distorts border slicing and child element proportions.
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="media-panel-card" style="padding: 12px; gap: 8px;">
                <div style="font-size: 0.78rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; width: 100%;">
                    [RECTTRANSFORM INSPECTOR ANATOMY]
                </div>
                <div style="width: 100%; background: #070b14; border: 1px solid #1e293b; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
                        <span style="font-size: 0.75rem; font-weight: 800; color: #cbd5e1;">Rect Transform</span>
                        <span style="font-size: 0.68rem; background: #1e293b; color: #38bdf8; padding: 2px 6px; border-radius: 4px; font-weight: 800;">Shortcut: [T]</span>
                    </div>
                    <div style="font-family: monospace; font-size: 0.74rem; line-height: 1.6; color: #94a3b8;">
                        <strong style="color: #facc15;">Pos X / Pos Y:</strong> Distance from Anchor reference point.<br>
                        <strong style="color: #10b981;">Width / Height:</strong> Size in UI reference units.<br>
                        <strong style="color: #38bdf8;">Anchors (Min / Max):</strong> Normalized parent bounds (0.0 to 1.0).<br>
                        <strong style="color: #f43f5e;">Pivot:</strong> Center point of rotation and scaling (0.5, 0.5).
                    </div>
                    <div style="background: #0f172a; border-left: 3px solid #10b981; border-radius: 4px; padding: 6px 10px; font-size: 0.72rem; color: #e2e8f0; margin-top: 4px;">
                        <em>Tip: Hold <strong>Shift + Alt</strong> in the Anchor Presets menu to set Pivot and Position at the same time!</em>
                    </div>
                </div>
                <div style="font-size: 0.74rem; color: #94a3b8; line-height: 1.4; padding: 0 4px;">
                    The RectTransform defines the rectangular boundaries that all child UI elements (Images, Buttons, Text) live inside.
                </div>
            </div>
        </div>
    </div>
    <details class="tier-accordion adv">
        <summary class="accordion-header">
            <span>[Advanced] Reading Rect Dimensions in Script</span>
            <span style="font-size:0.75rem;">Expand</span>
        </summary>
        <div class="accordion-body">
            To get the true pixel width of a stretched UI element in code, read <code>rectTransform.rect.width</code> instead of <code>sizeDelta.x</code>! When anchors stretch, <code>sizeDelta</code> represents the offset margin relative to anchors, not absolute pixel size.
        </div>
    </details>
    `,
    notes: "RectTransform (6 min): Emphasize the difference between Transform (point in space) and RectTransform (rectangle with anchors). Show the Shift+Alt trick in the anchor preset menu."
  },

  // Slide 5: Canvas Render Modes: Screen Space
  {
    title: "Canvas Render Modes: Screen Space",
    origImg: "original_slides/slide_04.png",
    content: `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">Screen Space - Overlay</div>
                <div class="card-body">
                    <p style="margin: 0 0 6px 0; font-weight: 600;">Renders directly on top of the screen at the very end of the frame:</p>
                    <ul style="padding-left: 18px; margin: 0 0 6px 0; line-height: 1.45; font-weight: 600;">
                        <li><strong>No Camera Needed:</strong> Works even if all cameras in the scene are disabled.</li>
                        <li><strong>Always on Top:</strong> Game world objects can never accidentally occlude or hide the HUD.</li>
                        <li><strong>Best for:</strong> Main HUD (Health, Stamina, Minimap), Pause Menus, Dialogue boxes.</li>
                    </ul>
                </div>
            </div>

            <div class="content-card primary" style="border-left-color: #0284c7;">
                <div class="card-title core" style="color: #0284c7;">Screen Space - Camera</div>
                <div class="card-body">
                    <p style="margin: 0 0 6px 0; font-weight: 600;">Rendered at a set distance (<code>Plane Distance</code>) in front of a designated Camera:</p>
                    <ul style="padding-left: 18px; margin: 0; line-height: 1.45; font-weight: 600;">
                        <li><strong>3D Perspective:</strong> UI elements can be rotated in 3D space with genuine camera perspective.</li>
                        <li><strong>Particles on UI:</strong> Allows 3D Particle Systems and VFX to appear between UI layers.</li>
                        <li><strong>Post-Processing:</strong> Bloom and Tonemapping affect the UI directly.</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="media-panel-card" style="padding: 12px; gap: 8px;">
                <div style="font-size: 0.78rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; width: 100%;">
                    [CANVAS RENDER MODE COMPARISON]
                </div>
                <table class="dense-table" style="width: 100%; font-size: 0.75rem;">
                    <thead>
                        <tr>
                            <th>Feature</th>
                            <th>Overlay</th>
                            <th>Camera</th>
                            <th>World Space</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Camera Req.</strong></td>
                            <td>None</td>
                            <td>Required</td>
                            <td>Required</td>
                        </tr>
                        <tr>
                            <td><strong>Layering</strong></td>
                            <td>Always Top</td>
                            <td>Plane Dist</td>
                            <td>Z-Depth in Scene</td>
                        </tr>
                        <tr>
                            <td><strong>3D VFX on UI</strong></td>
                            <td>No</td>
                            <td>Yes</td>
                            <td>Yes</td>
                        </tr>
                        <tr>
                            <td><strong>Best For</strong></td>
                            <td>2D HUD &amp; Menus</td>
                            <td>Juicy UI &amp; VFX</td>
                            <td>Enemy Healthbars</td>
                        </tr>
                    </tbody>
                </table>
                <div style="background: #070b14; border: 1px solid #1e293b; border-radius: 6px; padding: 8px 10px; width: 100%; font-size: 0.74rem; color: #94a3b8; line-height: 1.4; margin-top: 4px;">
                    <strong style="color: #facc15;">Production Rule:</strong> 90% of your game UI should be <strong>Screen Space - Overlay</strong>. Only switch to Camera when you specifically need 3D UI particle effects or camera zoom depth!
                </div>
            </div>
        </div>
    </div>
    <details class="tier-accordion adv">
        <summary class="accordion-header">
            <span>[Advanced] Sorting Orders and Multi-Canvas Stacking</span>
            <span style="font-size:0.75rem;">Expand</span>
        </summary>
        <div class="accordion-body">
            Use the <strong>Sort Order</strong> property on Canvas components to control layer priority. Set HUD Canvas to <code>Sort Order = 0</code> and Pause Menu Canvas to <code>Sort Order = 100</code> so menus always render on top of the gameplay HUD.
        </div>
    </details>
    <details class="tier-accordion exp">
        <summary class="accordion-header">
            <span>[Expert] Sub-Canvases &amp; Mobile Canvas Rebatching</span>
            <span style="font-size:0.75rem;">Expand</span>
        </summary>
        <div class="accordion-body">
            When <em>any</em> UI element moves or updates text on a Canvas, Unity regenerates the mesh for the <strong>entire</strong> Canvas! On mobile GPUs, this burns battery and drops frames. <strong>Production Standard:</strong> Nest child Canvases. Keep static frames on a <code>Static_HUD</code> sub-canvas, and dynamic health bars/timers on a <code>Dynamic_HUD</code> sub-canvas so mesh rebuilds are strictly isolated.
        </div>
    </details>
    `,
    notes: "Canvas Render Modes (6 min): Walk through Screen Space - Overlay vs Camera. Explain that Overlay is the default choice for 2D games, while Camera allows 3D UI VFX."
  },

  // Slide 6: World Space Canvas in 2D Games
  {
    title: "World Space Canvas in 2D Games",
    origImg: "original_slides/slide_05.png",
    content: `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">World Space: In-Game 2D UI &amp; Health Bars</div>
                <div class="card-body">
                    <p style="margin: 0 0 6px 0; font-weight: 600;">The Canvas lives directly inside the 2D scene at game coordinates:</p>
                    <ul style="padding-left: 18px; margin: 0 0 8px 0; line-height: 1.45; font-weight: 600;">
                        <li>Used for <strong>overhead enemy health bars</strong>, floating damage text (<code>+50 XP</code>), and interact prompts.</li>
                        <li><strong>The 2D Sorting Trap:</strong> Without sorting layers, World Space UI renders behind 2D sprites and tilemaps! Set <code>overrideSorting = true</code> and assign to <code>UI</code> sorting layer.</li>
                        <li><strong>The 2D Flip Bug:</strong> When a 2D sprite turns left (<code>localScale.x = -1</code>), child health bars mirror backwards! Prevent this in code:</li>
                    </ul>
                    <div class="code-box">
                        <pre>// 2D World Space Health Bar (Sorting & Flip Protection):
[RequireComponent(typeof(Canvas))]
public class WorldSpaceHealthBar2D : MonoBehaviour {
    void Awake() {
        var c = GetComponent&lt;Canvas&gt;();
        c.overrideSorting = true;
        c.sortingLayerName = "UI";
        c.sortingOrder = 100;
    }
    void LateUpdate() {
        if (transform.parent == null) return;
        Vector3 s = transform.localScale;
        s.x = Mathf.Abs(s.x) * Mathf.Sign(transform.parent.lossyScale.x);
        transform.localScale = s;
    }
}</pre>
                    </div>
                </div>
            </div>

            <div class="content-card primary" style="border-left-color: #ef4444;">
                <div class="card-title core" style="color: #dc2626;">The Giant Canvas Trap in 2D</div>
                <div class="card-body">
                    In World Space, 1 reference pixel becomes 1 Unity world meter! A 1920x1080 canvas will be <strong>1,920 meters wide</strong>! Scale the World Space Canvas transform down to <code>(0.01, 0.01, 0.01)</code> or <code>(0.005, 0.005, 0.005)</code> so it fits above a 2D sprite.
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="media-panel-card" style="padding: 12px; gap: 8px;">
                <div style="font-size: 0.78rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; width: 100%;">
                    [LIVE CANVAS MODE SIMULATOR]
                </div>
                <!-- Interactive Canvas Mode Diagram -->
                <div style="position: relative; width: 100%; height: 140px; background: #070b14; border: 1px solid #1e293b; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                    <!-- Visual Scene Arena -->
                    <div id="simModeDisplay" style="text-align: center; padding: 10px;">
                        <div id="simModeIcon" style="font-size: 0.78rem; font-weight: 900; letter-spacing: 1px; color: #38bdf8; margin-bottom: 4px;">[OVERLAY MODE]</div>
                        <div id="simModeTitle" style="font-size: 0.88rem; font-weight: 800; color: #10b981;">Screen Space - Overlay</div>
                        <div id="simModeDesc" style="font-size: 0.74rem; color: #cbd5e1; max-width: 260px; margin-top: 4px;">Pinned to glass. Ignores scene camera. 1:1 pixel crispness.</div>
                    </div>
                </div>
                <div style="display: flex; gap: 6px; width: 100%;">
                    <button class="interactive-action-btn" style="flex: 1; font-size: 0.72rem; padding: 6px;" onclick="setCanvasMode('overlay')">Overlay (HUD)</button>
                    <button class="interactive-action-btn secondary" style="flex: 1; font-size: 0.72rem; padding: 6px;" onclick="setCanvasMode('camera')">Camera (VFX)</button>
                    <button class="interactive-action-btn secondary" style="flex: 1; font-size: 0.72rem; padding: 6px;" onclick="setCanvasMode('world')">World Space</button>
                </div>
                <div id="canvasModeDetailLog" style="min-height: 28px; font-size: 0.74rem; font-family: monospace; font-weight: 700; color: #38bdf8; text-align: center; width: 100%; padding: 4px 6px; background: #070b14; border-radius: 4px;">
                    Click a mode above to simulate canvas render architecture.
                </div>
            </div>
        </div>
    </div>
    <details class="tier-accordion adv">
        <summary class="accordion-header">
            <span>[Advanced] 2D Sorting Layer Hierarchy</span>
            <span style="font-size:0.75rem;">Expand</span>
        </summary>
        <div class="accordion-body">
            In 2D projects, create explicit Sorting Layers: <code>Background</code> &lt; <code>Default</code> &lt; <code>Characters</code> &lt; <code>Foreground</code> &lt; <code>UI</code>. By placing World Space Canvases on the <code>UI</code> sorting layer with positive order, overhead bars always stay clearly visible in front of platforms and enemies.
        </div>
    </details>
    `,
    notes: "World Space UI (7 min): Explain overhead healthbars in 2D. Warn students about 2D sorting layers (hiding behind tilemaps) and the sprite flip bug (scale.x -1 mirrors child UI).",
  },

  // Slide 7: Mobile Screen Resolutions & Canvas Scaler
  {
    title: "Mobile Resolutions & The Canvas Scaler",
    origImg: "original_slides/slide_06.png",
    content: `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">Fluid Adaptation (No Black Bars / Letterboxing!)</div>
                <div class="card-body">
                    <p style="margin: 0 0 6px 0; font-weight: 600;">Mobile screens vary from 20:9 phones to 4:3 tablets. <strong>Never hardcode aspect ratios or force black bars!</strong> The UI must fluidly adapt:</p>
                    <ul style="padding-left: 18px; margin: 0 0 8px 0; line-height: 1.5; font-weight: 600;">
                        <li><strong>UI Scale Mode:</strong> <code>Scale With Screen Size</code></li>
                        <li><strong>Reference Resolution:</strong> <code>1920 x 1080</code> (Landscape) or <code>1080 x 1920</code> (Portrait)</li>
                        <li><strong>Screen Match Mode:</strong> <code>Match Width Or Height</code></li>
                        <li><strong>Landscape Games:</strong> Match Height = <code>1.0</code> (or <code>0.5</code>) &mdash; keeps vertical playfield constant while HUD pins dynamically to wide edges!</li>
                        <li><strong>Portrait Games:</strong> Match Width = <code>0.0</code> &mdash; glues bars edge-to-edge!</li>
                    </ul>
                    <div class="lab-deep-dive">
                        <strong>Why Fluid UI Wins Over Black Borders:</strong> Forcing letterboxing (black bars) looks amateur and violates Apple/Google store guidelines. By combining Canvas Scaler Match Height with Corner Anchors, your 2D game fills the entire physical glass while HUD buttons adapt cleanly.
                    </div>
                </div>
            </div>

            <div class="content-card primary" style="border-left-color: #0284c7;">
                <div class="card-title core" style="color: #0284c7;">Unity Device Simulator Window</div>
                <div class="card-body">
                    Never test mobile games in <em>Free Aspect</em>! Open <strong>Window &gt; General &gt; Device Simulator</strong> (or switch Game View tab to <em>Simulator</em>). Test real device profiles (iPhone 15, iPad, Galaxy S24) with actual camera cutouts, safe areas, and finger gestures right in the Editor!
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="media-panel-card" style="padding: 12px; gap: 8px;">
                <div style="font-size: 0.78rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; width: 100%;">
                    [MOBILE DEVICE ASPECT MATRIX]
                </div>
                <table class="dense-table" style="width: 100%; font-size: 0.74rem;">
                    <thead>
                        <tr>
                            <th>Mobile Target</th>
                            <th>Aspect</th>
                            <th>Hardware Cutouts</th>
                            <th>Scaler Behavior</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>iPhone 15 / 16</strong></td>
                            <td>19.5:9</td>
                            <td>Dynamic Island Notch</td>
                            <td>Wide horizontal stretch</td>
                        </tr>
                        <tr>
                            <td><strong>Galaxy S23 / S24</strong></td>
                            <td>20:9</td>
                            <td>Punch-hole camera</td>
                            <td>Extreme width, needs Safe Area</td>
                        </tr>
                        <tr>
                            <td><strong>iPad / Tablet</strong></td>
                            <td>4:3</td>
                            <td>Bezel only (no notch)</td>
                            <td>Narrow width, tall view</td>
                        </tr>
                        <tr>
                            <td><strong>Classic Phone</strong></td>
                            <td>16:9</td>
                            <td>Uniform bezels</td>
                            <td>1:1 pixel reference baseline</td>
                        </tr>
                        <tr>
                            <td><strong>Foldable (Inner)</strong></td>
                            <td>4:3.5</td>
                            <td>Under-display cam</td>
                            <td>Near-square tablet layout</td>
                        </tr>
                    </tbody>
                </table>
                <div style="background: #070b14; border: 1px solid #1e293b; border-radius: 6px; padding: 8px 10px; width: 100%; font-size: 0.74rem; color: #94a3b8; line-height: 1.4; margin-top: 4px;">
                    <strong style="color: #38bdf8;">Production Rule:</strong> If your HUD scales cleanly on both an <strong>iPhone 15 (19.5:9)</strong> and an <strong>iPad (4:3)</strong>, it adapts reliably across target consumer mobile devices.
                </div>
            </div>
        </div>
    </div>
    <details class="tier-accordion adv">
        <summary class="accordion-header">
            <span>[Advanced] Dynamic DPI Scaling vs Constant Physical Size</span>
            <span style="font-size:0.75rem;">Expand</span>
        </summary>
        <div class="accordion-body">
            Unity also offers <em>Constant Physical Size</em> based on <code>Screen.dpi</code> (points, inches, millimeters). While useful for enterprise apps, <strong>Scale With Screen Size</strong> remains the industry standard for 2D/3D mobile games because it maintains predictable asset scaling across GPUs.
        </div>
    </details>
    `,
    notes: "Canvas Scaler for Mobile (6 min): The #1 reason student games look broken on grader phones! Explain Landscape Match Height 1.0 vs Portrait Match Width 0.0, and demonstrate the Device Simulator window."
  },

  // Slide 8: Anchors, Pivots & The Mobile Safe Area
  {
    title: "Anchors, Pivots & Mobile Safe Area",
    origImg: "original_slides/slide_07.png",
    content: `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">Anchors &amp; The Mobile Cutout Trap</div>
                <div class="card-body">
                    <p style="margin: 0 0 6px 0; font-weight: 600;">Anchors are normalized (<code>0.0</code> to <code>1.0</code>) points on the parent RectTransform:</p>
                    <ul style="padding-left: 18px; margin: 0 0 6px 0; line-height: 1.45; font-weight: 600;">
                        <li><strong>Min == Max (Point Anchor):</strong> Element maintains fixed size, pinned to a corner (e.g. Top-Left for Pause, Bottom-Right for Attack).</li>
                        <li><strong>Min != Max (Stretch Anchor):</strong> Stretches dynamically to fill parent space.</li>
                        <li><strong>The Mobile Cutout Trap:</strong> If you anchor directly to Canvas corners on an iPhone or Galaxy, the <strong>camera punch hole or Dynamic Island will cover your button!</strong></li>
                    </ul>
                </div>
            </div>

            <div class="content-card primary" style="border-left-color: #10b981;">
                <div class="card-title core" style="color: #059669;">The Fix: Screen.safeArea &amp; SafeAreaFitter</div>
                <div class="card-body">
                    <p style="margin: 0 0 6px 0; font-size: 0.8rem; font-weight: 600;">Wrap all HUD elements in a full-stretch <code>SafeAreaPanel</code> with this script:</p>
                    <div class="code-box">
                        <pre>// Production SafeAreaFitter (Rotation & Notch Aware):
[RequireComponent(typeof(RectTransform))]
public class SafeAreaFitter : MonoBehaviour {
    private RectTransform _rt;
    private Rect _lastSafe;
    void Awake() { _rt = GetComponent&lt;RectTransform&gt;(); ApplySafeArea(); }
    void Update() {
        if (Screen.safeArea != _lastSafe) ApplySafeArea();
    }
    void ApplySafeArea() {
        _lastSafe = Screen.safeArea;
        Vector2 min = _lastSafe.position, max = min + _lastSafe.size;
        min.x /= Screen.width; min.y /= Screen.height;
        max.x /= Screen.width; max.y /= Screen.height;
        _rt.anchorMin = min; _rt.anchorMax = max;
    }
}</pre>
                    </div>
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="media-panel-card" style="padding: 12px; gap: 8px;">
                <div style="font-size: 0.78rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; width: 100%;">
                    [MOBILE NOTCH &amp; SAFE AREA SIMULATOR]
                </div>
                <!-- Visual Screen Arena -->
                <div style="width: 100%; height: 130px; background: #070b14; border: 1px solid #1e293b; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                    <!-- Simulated Mobile Phone Frame -->
                    <div id="simScreenFrame" style="width: 275px; height: 95px; background: #0c1222; border: 2px solid #38bdf8; border-radius: 12px; position: relative; transition: all 0.3s ease; overflow: hidden;">
                        <!-- Hardware Camera Notch / Dynamic Island -->
                        <div id="simNotchOverlay" style="position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 48px; height: 12px; background: #020617; border-bottom-left-radius: 6px; border-bottom-right-radius: 6px; z-index: 10; display: block; border: 1px solid #334155; border-top: none;">
                            <div style="width: 6px; height: 6px; background: #1e293b; border-radius: 50%; margin: 3px auto;"></div>
                        </div>
                        <!-- Safe Area Inset Guide Box -->
                        <div id="simSafeAreaBox" style="position: absolute; inset: 0; border: 1.5px dashed #10b981; pointer-events: none; transition: all 0.3s ease;"></div>
                        <!-- Simulated UI Element -->
                        <div id="simUiElement" style="position: absolute; top: 6px; left: 6px; background: #e11d48; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.65rem; font-weight: 900; transition: all 0.3s ease; display: flex; align-items: center; gap: 4px; z-index: 5;">
                            <span>PAUSE</span>
                        </div>
                        <!-- Aspect label -->
                        <div id="simAspectLabel" style="position: absolute; bottom: 3px; right: 6px; font-size: 0.60rem; color: #64748b; font-family: monospace;">19.5:9 iPhone (Notch)</div>
                    </div>
                </div>

                <!-- Controls -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; width: 100%;">
                    <div>
                        <span style="font-size: 0.70rem; color: #94a3b8; font-weight: 700;">Mobile Device:</span>
                        <select id="simAspectSelect" onchange="runAnchorSimulator()" style="width: 100%; background: #1e293b; border: 1px solid #334155; color: #f8fafc; padding: 4px; border-radius: 4px; font-size: 0.74rem;">
                            <option value="19.5:9">19.5:9 (iPhone 15 Notch)</option>
                            <option value="20:9">20:9 (Galaxy S24 Cutout)</option>
                            <option value="4:3">4:3 (iPad / Tablet)</option>
                            <option value="16:9">16:9 (Classic Phone)</option>
                        </select>
                    </div>
                    <div>
                        <span style="font-size: 0.70rem; color: #94a3b8; font-weight: 700;">HUD Anchor:</span>
                        <select id="simAnchorSelect" onchange="runAnchorSimulator()" style="width: 100%; background: #1e293b; border: 1px solid #334155; color: #f8fafc; padding: 4px; border-radius: 4px; font-size: 0.74rem;">
                            <option value="top-left">Top-Left (Pause Button)</option>
                            <option value="top-center">Top-Center (Level Info)</option>
                            <option value="bottom-right">Bottom-Right (Attack / Jump)</option>
                            <option value="stretch">Stretch (Full Panel)</option>
                        </select>
                    </div>
                    <label style="display: flex; align-items: center; gap: 6px; font-size: 0.72rem; color: #38bdf8; cursor: pointer; grid-column: span 2; background: #070b14; padding: 4px 8px; border-radius: 4px; border: 1px solid #1e293b;">
                        <input type="checkbox" id="simSafeAreaCheck" onchange="runAnchorSimulator()" checked>
                        <span><strong>[x] Enable SafeAreaFitter</strong> (Insets past camera cutouts &amp; home bar)</span>
                    </label>
                </div>

                <div id="anchorSimResult" style="min-height: 28px; font-size: 0.74rem; font-family: monospace; font-weight: 700; color: #10b981; background: #070b14; border: 1px solid #1e293b; padding: 6px 8px; border-radius: 4px; width: 100%;">
                    [PROTECTED] SafeAreaFitter insets button past the camera cutout!
                </div>
            </div>
        </div>
    </div>
    <details class="tier-accordion adv">
        <summary class="accordion-header">
            <span>[Advanced] Anchor Presets Keyboard Modifiers (Shift + Alt)</span>
            <span style="font-size:0.75rem;">Expand</span>
        </summary>
        <div class="accordion-body">
            In the Anchor Presets window: Hold <strong>Shift</strong> to set Pivot with Anchor. Hold <strong>Alt</strong> to snap the element position directly into place. Hold <strong>Shift + Alt</strong> to set Anchor, Pivot, and Position in 1 single click!
        </div>
    </details>
    `,
    notes: "Anchors & Mobile Safe Area (7 min): Demonstrate the simulator! Show students what happens when SafeAreaFitter is unchecked: on modern notched phones, the button gets hidden under the camera cutout!"
  },

  // Slide 9: Anchor Playbook: Clean Scaling Without Distortion
  {
    title: "Anchor Playbook: Scaling Without Distortion",
    origImg: "original_slides/slide_07.png",
    content: `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">How to Anchor Every UI Element</div>
                <div class="card-body">
                    <p style="margin: 0 0 6px 0; font-weight: 600;">Follow these 4 anchor rules so elements never stretch weirdly across screens:</p>
                    <ul style="padding-left: 18px; margin: 0 0 6px 0; line-height: 1.45; font-weight: 600; font-size: 0.82rem;">
                        <li><strong>1. Corner Controls (Buttons, Joysticks, Coins):</strong> Point Anchor to corner (<code>Min == Max</code>). Keep fixed pixel size (e.g. 96x96). They pin to corners and <em>never stretch</em>.</li>
                        <li><strong>2. Banners &amp; Bars (Top HUD, Bottom Dock):</strong> Horizontal Stretch (<code>Min(0,1) Max(1,1)</code>). Height stays fixed (e.g. 80px); width fluidly spans screen edges.</li>
                        <li><strong>3. Center Windows (Dialogues, Menus, Popups):</strong> Middle-Center Anchor (<code>Min == Max = 0.5, 0.5</code>). Preserves designed box size dead-center without warping.</li>
                        <li><strong>4. 1:1 Squares/Circles (Minimaps, Avatars):</strong> Attach <code>AspectRatioFitter</code> (<code>Fit In Parent</code>, Ratio <code>1.0</code>). Prevents circles turning into squashed ovals!</li>
                    </ul>
                </div>
            </div>

            <div class="content-card primary" style="border-left-color: #10b981;">
                <div class="card-title core" style="color: #059669;">9-Slice Sprites &amp; TMP Auto-Size</div>
                <div class="card-body" style="font-size: 0.82rem;">
                    <div class="punchy-point"><span class="punchy-tag">9-SLICE</span> In Sprite Editor, set 4-way borders and set Image Type to <strong>Sliced</strong>. Corners stay crisp while edges expand!</div>
                    <div class="punchy-point"><span class="punchy-tag">TMP AUTO</span> Check <strong>Auto Size</strong> (Min 16, Max 32) on TextMeshPro to prevent labels clipping on narrow screens.</div>
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="media-panel-card" style="padding: 12px; gap: 8px;">
                <div style="font-size: 0.78rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; width: 100%;">
                    [LIVE UI SCALING &amp; DISTORTION SIMULATOR]
                </div>
                <!-- Interactive Phone Screen Arena -->
                <div style="width: 100%; height: 140px; background: #070b14; border: 1px solid #1e293b; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                    <div id="scaleSimFrame" style="width: 290px; height: 100px; background: #0c1222; border: 2px solid #38bdf8; border-radius: 10px; position: relative; transition: all 0.3s ease; overflow: hidden;">
                        <!-- Top HUD Bar -->
                        <div id="scaleSimHudBar" style="position: absolute; top: 3px; left: 4px; right: 4px; height: 14px; background: #1e293b; border: 1px solid #334155; border-radius: 3px; display: flex; align-items: center; justify-content: space-between; padding: 0 6px; transition: all 0.3s ease;">
                            <span style="font-size: 0.55rem; color: #94a3b8; font-weight: 700;">HUD BAR (Stretch X)</span>
                            <span style="font-size: 0.55rem; color: #10b981; font-weight: 800;">HP: 100%</span>
                        </div>
                        <!-- Pause Button (Top-Left) -->
                        <div id="scaleSimPauseBtn" style="position: absolute; top: 2px; left: 6px; width: 20px; height: 20px; background: #ef4444; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 0.50rem; color: white; font-weight: 900; z-index: 5; transition: all 0.3s ease;">II</div>
                        <!-- Coin Counter (Top-Right) -->
                        <div id="scaleSimCoinCounter" style="position: absolute; top: 2px; right: 6px; background: #d97706; padding: 1px 4px; border-radius: 3px; font-size: 0.55rem; color: white; font-weight: 800; z-index: 5; transition: all 0.3s ease;">Coins: 250</div>
                        <!-- Minimap (Aspect Ratio Fitter 1:1) -->
                        <div id="scaleSimMinimap" style="position: absolute; bottom: 8px; left: 8px; width: 30px; height: 30px; background: #0284c7; border: 1.5px solid #38bdf8; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.50rem; color: white; font-weight: 800; transition: all 0.3s ease;">MAP</div>
                        <!-- Centered Dialogue Modal -->
                        <div id="scaleSimDialogBox" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 110px; height: 42px; background: #0f172a; border: 2px solid #38bdf8; border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2px; z-index: 4; transition: all 0.3s ease;">
                            <span style="font-size: 0.52rem; font-weight: 800; color: #f8fafc;">Quest Dialog</span>
                            <span style="font-size: 0.44rem; color: #94a3b8;">9-Slice Clean Borders</span>
                        </div>
                    </div>
                </div>

                <!-- Controls -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; width: 100%;">
                    <div>
                        <span style="font-size: 0.70rem; color: #94a3b8; font-weight: 700;">Screen Resolution:</span>
                        <select id="simScaleAspectSelect" onchange="runScaleSimulator()" style="width: 100%; background: #1e293b; border: 1px solid #334155; color: #f8fafc; padding: 4px; border-radius: 4px; font-size: 0.74rem;">
                            <option value="20:9">20:9 (Galaxy S24 / Wide Phone)</option>
                            <option value="19.5:9">19.5:9 (iPhone 15 Pro)</option>
                            <option value="16:9">16:9 (Standard Screen)</option>
                            <option value="4:3">4:3 (iPad / Tablet)</option>
                        </select>
                    </div>
                    <div style="display: flex; align-items: flex-end;">
                        <label style="display: flex; align-items: center; gap: 6px; font-size: 0.72rem; color: #38bdf8; cursor: pointer; background: #070b14; padding: 6px 8px; border-radius: 4px; border: 1px solid #1e293b; width: 100%;">
                            <input type="checkbox" id="simScaleCorrectCheck" onchange="runScaleSimulator()" checked>
                            <span><strong>[x] Correct Anchors &amp; 9-Slice</strong></span>
                        </label>
                    </div>
                </div>

                <div id="scaleSimResult" style="min-height: 28px; font-size: 0.74rem; font-family: monospace; font-weight: 700; color: #10b981; background: #070b14; border: 1px solid #1e293b; padding: 6px 8px; border-radius: 4px; width: 100%;">
                    [CLEAN &amp; CRISP] Correct anchors: buttons stay corner-pinned, minimap stays 1:1 round, dialog stays centered &amp; undistorted!
                </div>
            </div>
        </div>
    </div>
    <details class="tier-accordion adv">
        <summary class="accordion-header">
            <span>[Advanced] Layout Groups + Content Size Fitter</span>
            <span style="font-size:0.75rem;">Expand</span>
        </summary>
        <div class="accordion-body">
            For dynamic rows of buttons, inventory slots, or ability icons: add <code>HorizontalLayoutGroup</code> and <code>ContentSizeFitter</code>. It automatically calculates item spacing and container width on any screen resolution without manual script offsets.
        </div>
    </details>
    <details class="tier-accordion exp">
        <summary class="accordion-header">
            <span>[Expert] AspectRatioFitter Modes in Production</span>
            <span style="font-size:0.75rem;">Expand</span>
        </summary>
        <div class="accordion-body">
            <code>AspectRatioFitter</code> provides 4 modes: <em>Width Controls Height</em>, <em>Height Controls Width</em>, <em>Fit In Parent</em> (never overflows), and <em>Envelope Parent</em> (fills screen completely, ideal for full-screen background video or splash screens).
        </div>
    </details>
    `,
    notes: "Anchor Playbook (7 min): Walk through the 4 element types (corners, banners, center modals, square icons). Toggle the simulator checkbox to show students the horrible distortion when anchors are stretched blindly without 9-slice!"
  },

  // Slide 10: Mobile Touch Ergonomics & TextMeshPro
  {
    title: "Mobile Touch Ergonomics & TextMeshPro",
    origImg: "original_slides/slide_08.png",
    content: `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">Mobile Touch Target Rules (No Fat-Fingering!)</div>
                <div class="card-body">
                    <p style="margin: 0 0 6px 0; font-weight: 600;">Unlike mice with 1-pixel precision, human thumbs cover 10-12mm of glass:</p>
                    <ul style="padding-left: 18px; margin: 0 0 6px 0; line-height: 1.45; font-weight: 600;">
                        <li><strong>Minimum Target Size:</strong> Apple HIG specifies <strong>44 &times; 44 pt</strong>; Google Material specifies <strong>48 &times; 48 dp</strong>.</li>
                        <li><strong>In Unity 1080p:</strong> Interactive buttons must be at least <strong>88 &times; 88 px to 96 &times; 96 px</strong>!</li>
                        <li><strong>Button Spacing:</strong> Maintain at least 8-12px padding between adjacent buttons so players don't accidentally pause while jumping.</li>
                        <li><strong>Natural Thumb Arc:</strong> Place high-frequency controls (movement, fire) in the bottom-left and bottom-right corners.</li>
                    </ul>
                </div>
            </div>

            <div class="content-card primary" style="border-left-color: #0284c7;">
                <div class="card-title core" style="color: #0284c7;">TextMeshPro (TMP): Always SDF Vector</div>
                <div class="card-body">
                    <ul style="padding-left: 18px; margin: 0; line-height: 1.45; font-weight: 600;">
                        <li><strong>Zero Blur:</strong> Signed Distance Field (SDF) shaders stay mathematically sharp at any mobile zoom.</li>
                        <li><strong>Component:</strong> Always use <code>TextMeshProUGUI</code> (<code>using TMPro;</code>).</li>
                        <li><strong>0 GC Updates:</strong> Use <code>scoreText.SetText("Score: {0}", score);</code> instead of string concatenation <code>+</code>.</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="media-panel-card" style="padding: 12px; gap: 8px;">
                <div style="font-size: 0.78rem; font-weight: 800; color: #ef4444; text-transform: uppercase; width: 100%;">
                    [MOBILE PERFORMANCE: RAYCAST TARGET TRAP]
                </div>
                <div style="background: #070b14; border: 1px solid #1e293b; border-radius: 6px; padding: 8px 10px; width: 100%; font-size: 0.74rem; color: #cbd5e1; line-height: 1.45;">
                    <strong style="color: #f87171;">The Mobile Raycast Trap:</strong> Every new UI Image and TextMeshPro element has <code>Raycast Target = true</code> by default! On every touch, Unity raycasts through dozens of background panels, degrading frame rates on mobile chips.
                    <div style="margin-top: 4px; color: #10b981; font-weight: 700;">
                        &bull; Golden Rule: Uncheck 'Raycast Target' on all decorative backgrounds, icons, and non-clickable labels!
                    </div>
                </div>
                <div class="code-box" style="width: 100%;">
                    <pre>using UnityEngine; using UnityEngine.UI; using TMPro;
public class MobileHUDController : MonoBehaviour {
    [SerializeField] private TextMeshProUGUI scoreText;
    [SerializeField] private Button pauseButton;
    void Start() { pauseButton.onClick.AddListener(OnPauseTapped); }
    public void UpdateScore(int newScore) {
        scoreText.SetText("Score: {0:N0}", newScore); // 0 GC alloc
    }
    private void OnPauseTapped() {
        Time.timeScale = (Time.timeScale == 0) ? 1 : 0;
    }
}</pre>
                </div>
                <div style="background: #070b14; border: 1px solid #1e293b; border-radius: 6px; padding: 6px 10px; width: 100%; font-size: 0.72rem; color: #cbd5e1; line-height: 1.4;">
                    <strong style="color: #38bdf8;">2D Sprite Atlas (Draw Call Reduction):</strong> Pack all HUD buttons and icons into a <code>SpriteAtlas</code> (Window &gt; 2D &gt; Sprite Atlas). Reduces 40+ mobile draw calls to <strong>1 single draw call</strong>!
                </div>
            </div>
        </div>
    </div>
    <details class="tier-accordion adv">
        <summary class="accordion-header">
            <span>[Advanced] Garbage Collection in Text Formatting</span>
            <span style="font-size:0.75rem;">Expand</span>
        </summary>
        <div class="accordion-body">
            Using string concatenation like <code>text.text = "Score: " + score;</code> allocates heap garbage on every frame, triggering mobile GC stutter. TextMeshPro's <code>SetText()</code> method reuses internal character buffers with <strong>zero GC allocations</strong>!
        </div>
    </details>
    <details class="tier-accordion adv">
        <summary class="accordion-header">
            <span>[2D Mobile] Virtual Touch Controls (OnScreenStick &amp; OnScreenButton)</span>
            <span style="font-size:0.75rem;">Expand</span>
        </summary>
        <div class="accordion-body">
            In Unity's New Input System, attach <code>OnScreenStick</code> to your UI joystick image and set Control Path to <code>&lt;Gamepad&gt;/leftStick</code>. Attach <code>OnScreenButton</code> to your jump button. They automatically feed standard Input Actions without custom touch scripting!
        </div>
    </details>
    <details class="tier-accordion exp">
        <summary class="accordion-header">
            <span>[2D Art] 9-Sliced UI Sprites for Responsive Panels</span>
            <span style="font-size:0.75rem;">Expand</span>
        </summary>
        <div class="accordion-body">
            In Sprite Editor, set 4-way green borders on UI sprites. On UI Image, change <em>Image Type</em> to <strong>Sliced</strong>. Now dialogue boxes and buttons can stretch across any aspect ratio (from 4:3 iPad to 20:9 Galaxy) without blurry or distorted corners!
        </div>
    </details>
    <details class="tier-accordion exp">
        <summary class="accordion-header">
            <span>[Expert] High-DPI Retina Touch Drag Threshold</span>
            <span style="font-size:0.75rem;">Expand</span>
        </summary>
        <div class="accordion-body">
            Modern mobile screens have 300-450 DPI. Unity's default <code>pixelDragThreshold</code> (5-10px) is microscopic on 4K phones, causing finger taps to falsely register as scroll drags. In your game boot script, scale it by DPI: <code>EventSystem.current.pixelDragThreshold = Mathf.RoundToInt(Screen.dpi / 160f * 6);</code>.
        </div>
    </details>
    `,
    notes: "Mobile Touch Ergonomics & TextMeshPro (6 min): Cover minimum 44pt touch targets, thumb arc zones, unchecking Raycast Target, and Sprite Atlas draw call batching."
  },

  // Slide 11: Decoupled UI Scripting Architecture
  {
    title: "Decoupled UI Architecture",
    origImg: "original_slides/slide_09.png",
    content: `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">The Radio Station Pattern for UI</div>
                <div class="card-body">
                    <p style="margin: 0 0 4px 0; font-weight: 600;">UI should observe, not poll. Never search in <code>Update()</code>:</p>
                    <div class="code-box">
                        <pre>// BAD ANTI-PATTERN (60Hz polling):
void Update() {
    int hp = GameObject.Find("Player").GetComponent&lt;Player&gt;().Health;
    healthText.text = "HP: " + hp;
}</pre>
                    </div>
                    <p style="margin: 4px 0 4px 0; font-weight: 600;">DO THIS: Event-driven notification:</p>
                    <div class="code-box">
                        <pre>// GOOD: Player fires C# Action when HP changes:
public event Action&lt;int, int&gt; OnHealthChanged; // current, max
public void TakeDamage(int dmg) {
    currentHealth = Mathf.Max(0, currentHealth - dmg);
    OnHealthChanged?.Invoke(currentHealth, maxHealth);
}</pre>
                    </div>
                </div>
            </div>

            <div class="content-card primary" style="border-left-color: #10b981;">
                <div class="card-title core" style="color: #059669;">Why Decoupled UI Wins</div>
                <div class="card-body">
                    <div class="punchy-point"><span class="punchy-tag">0 POLLING</span> Zero CPU overhead in Update loops. UI only updates when values change.</div>
                    <div class="punchy-point"><span class="punchy-tag">SWAPPABLE</span> Delete, disable, or redesign HUD without breaking the player character!</div>
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="media-panel-card" style="padding: 12px; gap: 8px;">
                <div style="font-size: 0.78rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; width: 100%;">
                    [SUBSCRIBER: CLEAN HEALTH BAR UI]
                </div>
                <div class="code-box" style="width: 100%;">
                    <pre>using UnityEngine; using UnityEngine.UI; using TMPro;

public class HealthBarUI : MonoBehaviour {
    [SerializeField] private Slider healthSlider;
    [SerializeField] private TextMeshProUGUI hpText;
    [SerializeField] private PlayerHealth player;

    void OnEnable() {
        if (player != null) player.OnHealthChanged += UpdateHealthBar;
    }
    void OnDisable() {
        if (player != null) player.OnHealthChanged -= UpdateHealthBar;
    }
    private void UpdateHealthBar(int current, int max) {
        healthSlider.maxValue = max;
        healthSlider.value = current;
        hpText.SetText("{0} / {1}", current, max);
    }
}</pre>
                </div>
                <div style="font-size: 0.74rem; color: #94a3b8; line-height: 1.4; padding: 0 4px;">
                    Always unsubscribe in <code>OnDisable()</code> using <code>-=</code> to prevent memory leaks when scenes reload!
                </div>
            </div>
        </div>
    </div>
    <details class="tier-accordion adv">
        <summary class="accordion-header">
            <span>[Advanced] ScriptableObject Event Channels</span>
            <span style="font-size:0.75rem;">Expand</span>
        </summary>
        <div class="accordion-body">
            For 100% decoupling where UI and Player don't even share serialized pointers, create an <code>IntEventChannelSO : ScriptableObject</code>. Player broadcasts to the asset, UI listens to the asset. Zero scene hierarchy coupling!
        </div>
    </details>
    `,
    notes: "Decoupled UI (6 min): Emphasize event subscription in OnEnable and unsubscription in OnDisable. Mention the memory leak bug if -= is forgotten."
  },

  // Slide 11: Practice Challenge 1: Mobile HUD with Safe Area
  {
    title: "Challenge 1: Mobile HUD with Safe Area",
    origImg: "original_slides/slide_09.png",
    notes: "Give students 5 minutes to construct their mobile HUD with SafeAreaFitter. Have them test in Unity Device Simulator across iPhone 15 Pro and iPad Air.",
    content: `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">[5-MIN CHALLENGE] Mobile-First HUD Layout</div>
                <div class="card-body">
                    <p style="margin: 0 0 8px 0; font-weight: 700; color: #0284c7;">
                        Goal: Construct a fluid mobile HUD on Canvas Scaler (1920x1080 Match Height 1.0) with SafeAreaFitter that dynamically adapts across iPhone, Galaxy, and iPad without black borders!
                    </p>
                    <ul style="padding-left: 18px; margin: 0 0 10px 0; line-height: 1.5; font-weight: 600;">
                        <li><strong>SafeAreaPanel:</strong> Child of Canvas, Full Stretch (0,0 to 1,1) with <code>SafeAreaFitter.cs</code> attached.</li>
                        <li><strong>Element 1 (Pause Button):</strong> Top-Left inside Safe Area &bull; Min size <strong>88 &times; 88 px</strong>.</li>
                        <li><strong>Element 2 (Currency / Score):</strong> Top-Right inside Safe Area &bull; TMP (Raycast Target OFF).</li>
                        <li><strong>Element 3 (Joystick Touch Zone):</strong> Bottom-Left &bull; Min <strong>140 &times; 140 px</strong> &bull; <code>OnScreenStick</code> attached.</li>
                        <li><strong>Element 4 (Attack / Jump):</strong> Bottom-Right &bull; Min <strong>96 &times; 96 px</strong> &bull; <code>OnScreenButton</code> attached.</li>
                    </ul>
                    <div class="lab-deep-dive">
                        <strong>Test in Device Simulator:</strong> Open <code>Window &gt; General &gt; Device Simulator</code>. Switch between <strong>Apple iPhone 15 Pro</strong>, <strong>Galaxy S24</strong>, and <strong>Apple iPad Air (4:3)</strong>. Ensure UI dynamically spreads across widescreen and insets past notches without letterboxing!
                    </div>
                </div>
            </div>

            <div class="content-card primary" style="border-left-color: #10b981;">
                <div class="card-title core" style="color: #059669;">Quick Mobile Rules Checklist</div>
                <div class="card-body">
                    <div class="punchy-point"><span class="punchy-tag">NOTCH</span> Never anchor HUD directly to Canvas &mdash; anchor to <code>SafeAreaPanel</code>!</div>
                    <div class="punchy-point"><span class="punchy-tag">TOUCH</span> Keep buttons &ge; 88px (44pt) with 12px padding between buttons.</div>
                    <div class="punchy-point"><span class="punchy-tag">RAYCAST</span> Uncheck 'Raycast Target' on all decorative images and static text!</div>
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="media-panel-card" style="padding: 14px; gap: 10px;">
                <div style="font-size: 0.78rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; width: 100%;">
                    [CLASS CHALLENGE TIMEBOX: 5 MINUTES]
                </div>
                <div style="width: 100%; padding: 14px; background: #070b14; border: 1px solid #1e293b; border-radius: 8px; text-align: center;">
                    <div id="cTimer1" style="font-size: 2.6rem; font-weight: 900; font-family: monospace; color: #38bdf8; letter-spacing: 2px;">
                        05:00
                    </div>
                    <div class="lecturer-timer-controls" id="controls_cTimer1" style="display: flex; gap: 8px; justify-content: center; margin-top: 10px;">
                        <button class="interactive-action-btn" onclick="lecturerStartTimer('cTimer1', 300)">Start 5:00</button>
                        <button class="interactive-action-btn secondary" onclick="lecturerPauseTimer('cTimer1')">Pause</button>
                        <button class="interactive-action-btn secondary" onclick="lecturerResetTimer('cTimer1', 300)">Reset</button>
                    </div>
                    <div class="student-timer-status" id="status_cTimer1" style="display: none; margin-top: 10px; font-size: 0.76rem; font-weight: 700; color: #94a3b8;">
                        Synced with Classroom Timer
                    </div>
                </div>

                <!-- 1-Minute Solution Lock Box -->
                <div style="width: 100%;">
                    <button id="btnSol_solBox1" class="interactive-action-btn secondary" disabled style="width: 100%; padding: 8px 12px; font-size: 0.78rem; font-weight: 800; opacity: 0.6; cursor: not-allowed; border: 1px solid #1e293b;">
                        Solution Locked (Unlocks at 01:00 &bull; 05:00 remaining)
                    </button>
                    <div id="solBox1" class="solution-box" style="display: none; margin-top: 8px;">
                        <div style="font-size: 0.75rem; font-weight: 800; color: #10b981; margin-bottom: 4px;">
                            Mobile Inspector &amp; Safe Area Hierarchy:
                        </div>
                        <pre style="font-size: 0.72rem; padding: 6px 8px;">// 1. Canvas Scaler:
UI Scale Mode: Scale With Screen Size
Reference: 1920 x 1080 | Match Height: 1.0

// 2. Hierarchy Setup:
Canvas
 └─ SafeAreaPanel [SafeAreaFitter.cs] (Min: 0,0 | Max: 1,1)
     ├─ PauseBtn: Top-Left (0, 1) | Size: 96x96
     ├─ ScoreText: Top-Right (1, 1) | TMP (Raycast OFF)
     ├─ JoystickZone [OnScreenStick]: Bottom-Left (0, 0) | Size: 160x160
     └─ AttackBtn [OnScreenButton]: Bottom-Right (1, 0) | Size: 100x100</pre>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
  },

  // Slide 12: UI Toolkit vs uGUI in Unity 6
  {
    title: "UI Toolkit vs uGUI in Unity 6",
    origImg: "original_slides/slide_10.png",
    content: `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">What is UI Toolkit?</div>
                <div class="card-body">
                    <p style="margin: 0 0 6px 0; font-weight: 600;">Unity's modern UI architecture modeled after modern web technology:</p>
                    <ul style="padding-left: 18px; margin: 0 0 6px 0; line-height: 1.45; font-weight: 600;">
                        <li><strong>UXML:</strong> XML-based document describing visual hierarchy (like HTML).</li>
                        <li><strong>USS:</strong> Style sheets defining colors, fonts, margins, and flexbox layout (like CSS).</li>
                        <li><strong>UI Builder:</strong> Visual WYSIWYG editor window built into Unity.</li>
                        <li><strong>Zero GameObjects:</strong> Renders directly via single Draw Calls on GPU; does not spawn thousands of GameObject nodes.</li>
                    </ul>
                </div>
            </div>

            <div class="content-card primary" style="border-left-color: #0284c7;">
                <div class="card-title core" style="color: #0284c7;">Decision Matrix: What to Use When</div>
                <div class="card-body">
                    <ul style="padding-left: 18px; margin: 0; line-height: 1.45; font-weight: 600;">
                        <li><strong>Use uGUI (Canvas):</strong> Standard in-game gameplay HUDs, world-space enemy health bars, rapid prototyping, game jams.</li>
                        <li><strong>Use UI Toolkit:</strong> Custom Editor windows, complex desktop RPG inventory systems with thousands of items, team projects with web designers.</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="media-panel-card" style="padding: 12px; gap: 8px;">
                <div style="font-size: 0.78rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; width: 100%;">
                    [FRAMEWORK COMPARISON: uGUI vs UI TOOLKIT]
                </div>
                <table class="dense-table" style="width: 100%; font-size: 0.74rem;">
                    <thead>
                        <tr>
                            <th>Feature</th>
                            <th>uGUI (Canvas)</th>
                            <th>UI Toolkit (Unity 6)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>File Format</strong></td>
                            <td>Prefabs (.prefab)</td>
                            <td>UXML (.uxml) + USS (.uss)</td>
                        </tr>
                        <tr>
                            <td><strong>Layout Engine</strong></td>
                            <td>RectTransform Anchors</td>
                            <td>Flexbox (Yoga engine)</td>
                        </tr>
                        <tr>
                            <td><strong>Scene Hierarchy</strong></td>
                            <td>Every element is a GO</td>
                            <td>VisualElement tree (0 GOs)</td>
                        </tr>
                        <tr>
                            <td><strong>World Space UI</strong></td>
                            <td>Native &amp; trivial</td>
                            <td>Requires RenderTexture</td>
                        </tr>
                        <tr>
                            <td><strong>Learning Curve</strong></td>
                            <td>Fast (15 minutes)</td>
                            <td>Steep (requires CSS concepts)</td>
                        </tr>
                    </tbody>
                </table>
                <div style="background: #070b14; border: 1px solid #1e293b; border-radius: 6px; padding: 8px 10px; width: 100%; font-size: 0.74rem; color: #94a3b8; line-height: 1.4; margin-top: 4px;">
                    <strong style="color: #10b981;">Course Guideline:</strong> For the Minor GDD 2D Prototype, stick with <strong>uGUI (Canvas)</strong> for speed and reliability. Learn UI Toolkit when developing custom Unity Editor extensions!
                </div>
            </div>
        </div>
    </div>
    <details class="tier-accordion adv">
        <summary class="accordion-header">
            <span>[Advanced] Flexbox Responsive Layouts in UI Toolkit</span>
            <span style="font-size:0.75rem;">Expand</span>
        </summary>
        <div class="accordion-body">
            UI Toolkit uses the Yoga open-source layout engine (Flexbox). By setting <code>flex-direction: row</code> and <code>flex-wrap: wrap</code>, inventory grids re-flow dynamically across screen sizes without manual grid calculation scripts.
        </div>
    </details>
    `,
    notes: "UI Toolkit vs uGUI (5 min): Clarify that UI Toolkit is the future and already standard for Editor tools, but uGUI remains the standard for fast in-game 2D prototyping."
  },

  // Slide 13: Section 2 Inverted Slide
  {
    isInverted: true,
    title: "2. Data Persistence & Saving",
    subtitle: "From In-Memory State to Reliable Cross-Platform JSON Files",
    origImg: "original_slides/slide_11.png",
    content: `
        <div class="content-stack">
            <div class="content-card primary" style="background: rgba(255, 255, 255, 0.1); border-left-color: #ffffff; color: #ffffff;">
                <div class="card-title core" style="color: #ffffff;">The Persistence Problem</div>
                <div class="card-body" style="color: #f1f5f9;">
                    When a player quits your game, powers off their console, or downloads a game update, all in-memory variables and MonoBehaviour states vanish instantly. We must serialize game progress into a durable, structured file format stored safely on device storage.
                </div>
            </div>
        </div>
    `,
    notes: "Section 2: Saving Systems (2 min): Transition slide. Highlight the danger of relying on PlayerPrefs for complex game save data.",
    topics: [
      "Volatile Memory vs Disk Storage",
      "The PlayerPrefs Trap",
      "Serialization with JsonUtility",
      "Application.persistentDataPath"
    ]
  },

  // Slide 14: Persistence Strategies Overview
  {
    title: "Persistence Strategies Overview",
    origImg: "original_slides/slide_12.png",
    content: `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">3 Lifetimes of Game Data</div>
                <div class="card-body">
                    <ul style="padding-left: 18px; margin: 0; line-height: 1.55; font-weight: 600;">
                        <li><strong style="color: #ef4444;">1. Volatile Memory (MonoBehaviour):</strong> Lives in RAM while the scene is active. Destroyed on scene transition or game quit.</li>
                        <li><strong style="color: #38bdf8;">2. Session Memory (ScriptableObjects):</strong> Persists across scene reloads within the same play session in a built game, but resets to defaults when the application closes.</li>
                        <li><strong style="color: #10b981;">3. Disk Persistence (Files in persistentDataPath):</strong> Survives game restarts, OS updates, and computer power-offs. The only true saved game!</li>
                    </ul>
                </div>
            </div>

            <div class="content-card primary" style="border-left-color: #0284c7;">
                <div class="card-title core" style="color: #0284c7;">Choosing the Right Strategy</div>
                <div class="card-body">
                    <div class="punchy-point"><span class="punchy-tag">PlayerPrefs</span> Music volume, resolution index, language choice.</div>
                    <div class="punchy-point"><span class="punchy-tag">JSON / JsonUtility</span> Highscore, unlocked levels, player inventory, stats.</div>
                    <div class="punchy-point"><span class="punchy-tag">Binary / SQLite</span> Large open-world saves with 100,000+ entities.</div>
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="media-panel-card" style="padding: 12px; gap: 8px;">
                <div style="font-size: 0.78rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; width: 100%;">
                    [CROSS-PLATFORM STORAGE PATHS]
                </div>
                <div style="font-size: 0.74rem; font-weight: 700; color: #cbd5e1; width: 100%;">
                    <code>Application.persistentDataPath</code> maps automatically per OS:
                </div>
                <table class="dense-table" style="width: 100%; font-size: 0.72rem;">
                    <thead>
                        <tr>
                            <th>Platform</th>
                            <th>Physical Disk Path</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Windows</strong></td>
                            <td><code>%userprofile%/AppData/LocalLow/[Company]/[Product]</code></td>
                        </tr>
                        <tr>
                            <td><strong>macOS</strong></td>
                            <td><code>~/Library/Application Support/[Company]/[Product]</code></td>
                        </tr>
                        <tr>
                            <td><strong>Android</strong></td>
                            <td><code>/storage/emulated/0/Android/data/[package]/files</code></td>
                        </tr>
                        <tr>
                            <td><strong>iOS</strong></td>
                            <td><code>/var/mobile/Containers/Data/Application/[GUID]/Documents</code></td>
                        </tr>
                        <tr>
                            <td><strong>WebGL</strong></td>
                            <td>Browser <code>IndexedDB</code> sandbox virtual storage</td>
                        </tr>
                    </tbody>
                </table>
                <div style="background: #070b14; border: 1px solid #1e293b; border-radius: 6px; padding: 6px 10px; width: 100%; font-size: 0.72rem; color: #94a3b8; line-height: 1.4;">
                    Never hardcode paths like <code>"C:/MyGame/save.txt"</code>! It will fail instantly on Mac, Linux, and Mobile. Always use <code>Path.Combine(Application.persistentDataPath, "savedata.json")</code>.
                </div>
            </div>
        </div>
    </div>
    <details class="tier-accordion adv">
        <summary class="accordion-header">
            <span>[Advanced] Atomic File Writing to Prevent Corrupt Saves</span>
            <span style="font-size:0.75rem;">Expand</span>
        </summary>
        <div class="accordion-body">
            If the game crashes or battery dies while writing a save file, the file will be left half-written and corrupt. Write to a temporary file <code>savedata.json.tmp</code> first, and then call <code>File.Replace()</code> or <code>File.Move(..., overwrite: true)</code>.
        </div>
    </details>
    `,
    notes: "Persistence Strategies (6 min): Walk through the 3 lifetimes of data. Introduce Application.persistentDataPath and explain why hardcoded paths break on other operating systems."
  },

  // Slide 15: PlayerPrefs: The Classic Trap
  {
    title: "PlayerPrefs: When to Use & When to Avoid",
    origImg: "original_slides/slide_13.png",
    content: `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">What PlayerPrefs is Built For</div>
                <div class="card-body">
                    <p style="margin: 0 0 6px 0; font-weight: 600;">PlayerPrefs stores simple key-value pairs in the operating system registry:</p>
                    <div class="code-box">
                        <pre>// GOOD USE CASE: Audio & display settings
PlayerPrefs.SetFloat("MasterVolume", 0.75f);
PlayerPrefs.SetInt("Fullscreen", 1);
PlayerPrefs.Save(); // Flushes to disk</pre>
                    </div>
                    <ul style="padding-left: 18px; margin: 6px 0 0 0; line-height: 1.45; font-weight: 600;">
                        <li>Only supports 3 primitive types: <code>int</code>, <code>float</code>, <code>string</code>.</li>
                        <li>Zero support for <code>List&lt;T&gt;</code>, inventory arrays, or nested objects!</li>
                    </ul>
                </div>
            </div>

            <div class="content-card primary" style="border-left-color: #ef4444;">
                <div class="card-title core" style="color: #dc2626;">Why PlayerPrefs FAILS for Savegames</div>
                <div class="card-body">
                    <div class="punchy-point"><span class="punchy-tag">REGISTRY</span> Stored in Windows Registry (<code>HKEY_CURRENT_USER</code>), easily wiped or corrupted.</div>
                    <div class="punchy-point"><span class="punchy-tag">NO SLOTS</span> No support for multiple save profiles (Save Slot 1, 2, 3).</div>
                    <div class="punchy-point"><span class="punchy-tag">INSECURE</span> Plaintext in registry. Players can edit their health/score in 5 seconds.</div>
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="media-panel-card" style="padding: 12px; gap: 8px;">
                <div style="font-size: 0.78rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; width: 100%;">
                    [STORAGE BENCHMARK: PLAYERPREFS VS JSON]
                </div>
                <div style="display: flex; gap: 8px; width: 100%;">
                    <button class="interactive-action-btn secondary" style="flex: 1;" onclick="simulateStorageBenchmark('playerprefs')">Test PlayerPrefs</button>
                    <button class="interactive-action-btn" style="flex: 1;" onclick="simulateStorageBenchmark('json')">Test JSON File</button>
                </div>
                <div id="benchmarkResult" style="min-height: 100px; font-size: 0.76rem; font-family: monospace; font-weight: 700; color: #cbd5e1; background: #070b14; border: 1px solid #1e293b; padding: 10px; border-radius: 6px; width: 100%; line-height: 1.45;">
                    Click a test above to compare registry storage vs structured JSON persistence.
                </div>
                <div style="font-size: 0.72rem; color: #94a3b8; line-height: 1.4; padding: 0 4px;">
                    Summary: Use PlayerPrefs strictly for options (Volume, Mute). Use JSON for all player and game progress.
                </div>
            </div>
        </div>
    </div>
    <details class="tier-accordion adv">
        <summary class="accordion-header">
            <span>[Advanced] Windows Registry Pollution Warning</span>
            <span style="font-size:0.75rem;">Expand</span>
        </summary>
        <div class="accordion-body">
            On Windows, PlayerPrefs keys are written to <code>HKEY_CURRENT_USER\Software\[CompanyName]\[ProductName]</code>. Over-using PlayerPrefs with thousands of keys slows down game startup and pollutes the Windows Registry permanently until manually deleted.
        </div>
    </details>
    `,
    notes: "PlayerPrefs (6 min): The classic mistake student developers make is saving inventory in PlayerPrefs. Run the benchmark to demonstrate limitations."
  },

  // Slide 16: Modern JSON Persistence with System.IO
  {
    title: "JSON Persistence with System.IO",
    origImg: "original_slides/slide_14.png",
    content: `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">1. The [Serializable] Data Contract</div>
                <div class="card-body">
                    <p style="margin: 0 0 6px 0; font-weight: 600;">Declare a plain C# data transfer class (not a MonoBehaviour):</p>
                    <div class="code-box">
                        <pre>using System;
using System.Collections.Generic;

[Serializable]
public class SaveData {
    public string playerName = "Hero";
    public int highscore = 0;
    public int unlockedLevel = 1;
    public List<string> inventory = new();
}</pre>
                    </div>
                    <div class="lab-deep-dive">
                        <strong>Rule:</strong> Fields must be <code>public</code> or have <code>[SerializeField]</code>. JsonUtility ignores properties (<code>get; set;</code>) and private fields!
                    </div>
                </div>
            </div>

            <div class="content-card primary" style="border-left-color: #10b981;">
                <div class="card-title core" style="color: #059669;">2. JsonUtility Serialization API</div>
                <div class="card-body">
                    <div class="punchy-point"><span class="punchy-tag">TO JSON</span> <code>string json = JsonUtility.ToJson(data, true);</code> (converts class &rarr; string).</div>
                    <div class="punchy-point"><span class="punchy-tag">FROM JSON</span> <code>SaveData data = JsonUtility.FromJson&lt;SaveData&gt;(json);</code></div>
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="media-panel-card" style="padding: 12px; gap: 8px;">
                <div style="font-size: 0.78rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; width: 100%;">
                    [PRODUCTION SAVESYSTEM SERVICE]
                </div>
                <div class="code-box" style="width: 100%;">
                    <pre>using System.IO;
using UnityEngine;

public static class SaveSystem {
    private static string FilePath =>
        Path.Combine(Application.persistentDataPath, "savedata.json");

    public static void Save(SaveData data) {
        string json = JsonUtility.ToJson(data, true);
        File.WriteAllText(FilePath, json);
        Debug.Log($"Saved successfully to: {FilePath}");
    }

    public static SaveData Load() {
        if (!File.Exists(FilePath)) {
            Debug.LogWarning("Save file not found. Returning fresh data.");
            return new SaveData();
        }

        string json = File.ReadAllText(FilePath);
        return JsonUtility.FromJson<SaveData>(json);
    }
}</pre>
                </div>
                <div style="font-size: 0.74rem; color: #94a3b8; line-height: 1.4; padding: 0 4px;">
                    Notice: <code>SaveSystem</code> is a <code>static</code> class. It requires no GameObject in the scene!
                </div>
            </div>
        </div>
    </div>
    <details class="tier-accordion adv">
        <summary class="accordion-header">
            <span>[Advanced] JsonUtility.FromJsonOverwrite</span>
            <span style="font-size:0.75rem;">Expand</span>
        </summary>
        <div class="accordion-body">
            Instead of instantiating a new object on the heap, <code>JsonUtility.FromJsonOverwrite(json, existingData);</code> writes JSON values directly into an existing living object, generating <strong>0 GC allocations</strong>!
        </div>
    </details>
    `,
    notes: "JSON Persistence (7 min): Walk through SaveData class and SaveSystem service. Point out the static methods and File.Exists check to avoid FileNotFound exceptions."
  },

  // Slide 17: Live JSON Persistence Simulator
  {
    title: "Live JSON Persistence Sandbox",
    origImg: "original_slides/slide_15.png",
    content: `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">1. Game State (In-Memory Variables)</div>
                <div class="card-body">
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <label style="font-size: 0.78rem; font-weight: 700;">Player Name:</label>
                            <input type="text" id="simPlayerName" value="Mario_CMGT" style="background: #0f172a; border: 1px solid #334155; color: #38bdf8; padding: 3px 8px; border-radius: 4px; font-size: 0.76rem; width: 140px;">
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <label style="font-size: 0.78rem; font-weight: 700;">High Score:</label>
                            <input type="number" id="simHighScore" value="4820" style="background: #0f172a; border: 1px solid #334155; color: #10b981; padding: 3px 8px; border-radius: 4px; font-size: 0.76rem; width: 140px;">
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <label style="font-size: 0.78rem; font-weight: 700;">Unlocked Level:</label>
                            <select id="simLevel" style="background: #0f172a; border: 1px solid #334155; color: #facc15; padding: 3px 8px; border-radius: 4px; font-size: 0.76rem; width: 140px;">
                                <option value="1">Level 1 - Grasslands</option>
                                <option value="2">Level 2 - Underground</option>
                                <option value="3" selected>Level 3 - Castle</option>
                            </select>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <label style="font-size: 0.78rem; font-weight: 700;">Has Double Jump:</label>
                            <input type="checkbox" id="simDoubleJump" checked style="width: 16px; height: 16px;">
                        </div>
                    </div>
                    <div style="display: flex; gap: 6px; margin-top: 10px;">
                        <button class="interactive-action-btn" style="flex: 1;" onclick="simulateJsonSave()">Save to JSON</button>
                        <button class="interactive-action-btn secondary" style="flex: 1;" onclick="simulateGameRestart()">Restart App</button>
                        <button class="interactive-action-btn secondary" style="flex: 1;" onclick="simulateJsonLoad()">Load Save</button>
                    </div>
                </div>
            </div>

            <div class="content-card primary" style="border-left-color: #38bdf8;">
                <div class="card-title core" style="color: #0284c7;">File Status &amp; Path</div>
                <div class="card-body">
                    <div style="font-family: monospace; font-size: 0.72rem; color: #94a3b8; word-break: break-all;">
                        <strong style="color: #cbd5e1;">Target Path:</strong> Application.persistentDataPath/savedata.json
                    </div>
                    <div id="simSaveStatus" style="font-size: 0.75rem; font-weight: 700; color: #10b981; margin-top: 4px;">
                        Status: Ready. Modify fields and click Save.
                    </div>
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="media-panel-card" style="padding: 12px; gap: 8px;">
                <div style="font-size: 0.78rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; width: 100%;">
                    [RAW SERIALIZED JSON OUTPUT]
                </div>
                <div style="width: 100%; height: 160px; background: #070b14; border: 1px solid #1e293b; border-radius: 6px; padding: 10px; overflow-y: auto;">
                    <pre id="simJsonOutput" style="background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; font-size: 0.74rem; line-height: 1.4; color: #38bdf8; margin: 0;">{
  "playerName": "Mario_CMGT",
  "highscore": 4820,
  "unlockedLevel": 3,
  "hasDoubleJump": true
}</pre>
                </div>
                <div style="font-size: 0.72rem; color: #94a3b8; line-height: 1.4; padding: 0 4px;">
                    This exact JSON string is what gets saved to disk. Try editing the fields and clicking <strong>Save to JSON</strong>!
                </div>
            </div>
        </div>
    </div>
    <details class="tier-accordion adv">
        <summary class="accordion-header">
            <span>[Advanced] Simple AES Encryption for Save Files</span>
            <span style="font-size:0.75rem;">Expand</span>
        </summary>
        <div class="accordion-body">
            To prevent players opening <code>savedata.json</code> in Notepad and changing their score to 999999, run the JSON string through an XOR or AES cipher before writing to disk with <code>File.WriteAllBytes()</code>.
        </div>
    </details>
    `,
    notes: "Save Simulator (6 min): Demonstrate the simulator. Change the player name and score, click Save, click Restart (fields reset to defaults), and click Load to prove data persists."
  },

  // Slide 18: Practice Challenge 2: Complete SaveSystem Service
  {
    title: "Challenge 2: The JSON SaveSystem Service",
    origImg: "original_slides/slide_15.png",
    notes: "Give students 5 minutes to test saving and loading. Emphasize realizing WHAT to serialize: a clean [Serializable] class. Walk around and answer questions.",
    content: `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">[5-MIN CHALLENGE] Production JSON Persistence</div>
                <div class="card-body">
                    <p style="margin: 0 0 8px 0; font-weight: 700; color: #0284c7;">
                        Goal: Create a complete Save/Load system for player highscore and unlocked levels that survives game restart!
                    </p>
                    <ul style="padding-left: 18px; margin: 0 0 10px 0; line-height: 1.5; font-weight: 600;">
                        <li><strong>Step 1:</strong> Create <code>SaveData.cs</code> with <code>[System.Serializable]</code>, <code>public int highscore</code>, and <code>public int unlockedLevel</code>.</li>
                        <li><strong>Step 2:</strong> In <code>SaveSystem.cs</code>, implement <code>Save(SaveData data)</code> with <code>JsonUtility.ToJson(data, true)</code> and <code>File.WriteAllText</code>.</li>
                        <li><strong>Step 3:</strong> Implement <code>Load()</code> with <code>File.Exists</code> guard check.</li>
                    </ul>
                </div>
            </div>

            <div class="content-card primary" style="border-left-color: #10b981;">
                <div class="card-title core" style="color: #059669;">Verification Steps</div>
                <div class="card-body">
                    <div class="punchy-point"><span class="punchy-tag">1. SAVE</span> Trigger save in game &rarr; Check Console log for persistentDataPath.</div>
                    <div class="punchy-point"><span class="punchy-tag">2. STOP</span> Stop Unity Play Mode.</div>
                    <div class="punchy-point"><span class="punchy-tag">3. PLAY</span> Start Play Mode &rarr; Verify high score is loaded from JSON!</div>
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="media-panel-card" style="padding: 14px; gap: 10px;">
                <div style="font-size: 0.78rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; width: 100%;">
                    [CLASS CHALLENGE TIMEBOX: 5 MINUTES]
                </div>
                <div style="width: 100%; padding: 14px; background: #070b14; border: 1px solid #1e293b; border-radius: 8px; text-align: center;">
                    <div id="cTimer2" style="font-size: 2.6rem; font-weight: 900; font-family: monospace; color: #38bdf8; letter-spacing: 2px;">
                        05:00
                    </div>
                    <div class="lecturer-timer-controls" id="controls_cTimer2" style="display: flex; gap: 8px; justify-content: center; margin-top: 10px;">
                        <button class="interactive-action-btn" onclick="lecturerStartTimer('cTimer2', 300)">Start 5:00</button>
                        <button class="interactive-action-btn secondary" onclick="lecturerPauseTimer('cTimer2')">Pause</button>
                        <button class="interactive-action-btn secondary" onclick="lecturerResetTimer('cTimer2', 300)">Reset</button>
                    </div>
                    <div class="student-timer-status" id="status_cTimer2" style="display: none; margin-top: 10px; font-size: 0.76rem; font-weight: 700; color: #94a3b8;">
                        Synced with Classroom Timer
                    </div>
                </div>

                <!-- 1-Minute Solution Lock Box -->
                <div style="width: 100%;">
                    <button id="btnSol_solBox2" class="interactive-action-btn secondary" disabled style="width: 100%; padding: 8px 12px; font-size: 0.78rem; font-weight: 800; opacity: 0.6; cursor: not-allowed; border: 1px solid #1e293b;">
                        Solution Locked (Unlocks at 01:00 &bull; 05:00 remaining)
                    </button>
                    <div id="solBox2" class="solution-box" style="display: none; margin-top: 8px;">
                        <div style="font-size: 0.75rem; font-weight: 800; color: #10b981; margin-bottom: 4px;">
                            C# Solution:
                        </div>
                        <pre style="font-size: 0.72rem; padding: 6px 8px;">using System.IO;
using UnityEngine;

public static class SaveSystem {
    private static string Path =>
        System.IO.Path.Combine(Application.persistentDataPath, "savedata.json");

    public static void Save(SaveData data) {
        File.WriteAllText(Path, JsonUtility.ToJson(data, true));
    }

    public static SaveData Load() {
        if (!File.Exists(Path)) return new SaveData();
        return JsonUtility.FromJson<SaveData>(File.ReadAllText(Path));
    }
}</pre>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
  },

  // Slide 19: Course Summary & Milestones Checklist
  {
    title: "Summary & Milestone Checklist",
    origImg: "original_slides/slide_15.png",
    content: `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">Class 3 Mobile Golden Rules</div>
                <div class="card-body">
                    <ul style="padding-left: 18px; margin: 0; line-height: 1.55; font-weight: 600;">
                        <li><strong>Mobile Scaler:</strong> Scale With Screen Size &bull; Match Height 1.0 (Landscape) or Match Width 0.0 (Portrait).</li>
                        <li><strong>Safe Area Fitter:</strong> Always wrap HUD elements in a <code>SafeAreaPanel</code> to avoid notches and cutouts!</li>
                        <li><strong>Touch Ergonomics:</strong> Keep buttons &ge; 44pt (88px at 1080p) &bull; Leave 12px finger padding.</li>
                        <li><strong>Raycast Optimization:</strong> Turn off 'Raycast Target' on all decorative images and static text.</li>
                        <li><strong>TextMeshPro:</strong> Use <code>scoreText.SetText()</code> to prevent mobile garbage collection stutter.</li>
                        <li><strong>Mobile Auto-Save:</strong> Save in <code>OnApplicationPause(true)</code> when mobile OS suspends the app.</li>
                    </ul>
                </div>
            </div>

            <div class="content-card primary" style="border-left-color: #10b981;">
                <div class="card-title core" style="color: #059669;">Homework Assignment (classes/03_UI.md)</div>
                <div class="card-body">
                    Complete the 4 Milestones in <code>classes/03_UI.md</code>:
                    <ol style="padding-left: 20px; margin-top: 4px; line-height: 1.45; font-weight: 600;">
                        <li>Build a scalable mobile HUD with <code>SafeAreaFitter</code> and test in Device Simulator.</li>
                        <li>Create an overhead world-space health bar with camera billboarding.</li>
                        <li>Implement a decoupled <code>HealthBarUI</code> listening to player events.</li>
                        <li>Write the <code>SaveSystem.cs</code> JSON service and persist high scores!</li>
                    </ol>
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="media-panel-card" style="padding: 14px; gap: 10px;">
                <div style="font-size: 0.78rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; width: 100%;">
                    [NEXT WEEK: GAME ARCHITECTURE 1]
                </div>
                <div style="width: 100%; background: #070b14; border: 1px solid #1e293b; border-radius: 8px; padding: 12px; font-size: 0.78rem; color: #e2e8f0; line-height: 1.5;">
                    <strong style="color: #facc15;">Coming Up in Lesson 4:</strong><br>
                    &bull; Decoupled Architecture with ScriptableObject Event Channels<br>
                    &bull; Prefab-as-an-API design<br>
                    &bull; Safe Singletons without scene cross-contamination
                </div>
                <div style="display: flex; gap: 8px; width: 100%; margin-top: 4px;">
                    <a href="../index.html" class="interactive-action-btn secondary" style="flex: 1; text-decoration: none; font-size: 0.76rem;">&larr; Return to Course Portal</a>
                    <button class="interactive-action-btn" style="flex: 1; font-size: 0.76rem;" onclick="selectSlide(0)">Restart Deck &uarr;</button>
                </div>
            </div>
        </div>
    </div>
    <details class="tier-accordion adv">
        <summary class="accordion-header">
            <span>[Advanced] Auto-Save on ApplicationPause</span>
            <span style="font-size:0.75rem;">Expand</span>
        </summary>
        <div class="accordion-body">
            On mobile devices, players rarely click "Quit Game" &mdash; they just switch apps. In your GameManager, implement <code>void OnApplicationPause(bool pause) { if (pause) SaveSystem.Save(data); }</code> to prevent lost progress when phone calls arrive!
        </div>
    </details>
    `,
    notes: "Lesson Wrap Up (5 min): Review core takeaways. Next week covers Game Architecture 1."
  }
];

// Read template from basics2
const basics2Path = path.resolve('presentation_basics2/presentation_unity6_basics2.html');
const basics2Content = fs.readFileSync(basics2Path, 'utf8');

// Extract CSS up to </style>
const styleMatch = basics2Content.match(/<style>([\s\S]*?)<\/style>/);
const cssStyles = styleMatch ? styleMatch[1] : '';

// Glossary terms for Class 3
const glossaryTerms = {
    "recttransform": {
        title: "RectTransform",
        desc: "2D bounding rectangle component that replaces Transform for all UI GameObjects.",
        diff: "<strong>vs Transform:</strong> Transform has only position; RectTransform has anchoredPosition, sizeDelta, pivot, and anchors."
    },
    "canvas": {
        title: "Canvas Component",
        desc: "The root display container and coordinate space where all UI elements must live to be rendered.",
        diff: "<strong>Why Needed:</strong> UI components (Image, Text) do not render in Unity unless they are children of a Canvas."
    },
    "canvasscaler": {
        title: "Canvas Scaler",
        desc: "Component controlling overall UI pixel density and scaling across different screen sizes.",
        diff: "<strong>Rule:</strong> Set to Scale With Screen Size, Reference 1920x1080, Match 0.5."
    },
    "anchors": {
        title: "UI Anchors (Min/Max)",
        desc: "Normalized reference points (0.0 to 1.0) on the parent container that pin or stretch UI elements.",
        diff: "<strong>Min == Max:</strong> Element keeps fixed size at corner. <strong>Min != Max:</strong> Element stretches dynamically."
    },
    "aspectratiofitter": {
        title: "AspectRatioFitter Component",
        desc: "Enforces a strict aspect ratio (e.g. 1:1) on a RectTransform regardless of parent canvas stretching.",
        diff: "<strong>Best for:</strong> Square mini-maps, round avatar portraits, and ability icons on mobile screens."
    },
    "9-slice": {
        title: "9-Sliced Sprite",
        desc: "A 2D sprite split into 9 quadrants via Sprite Editor border handles so borders remain sharp while the center stretches.",
        diff: "<strong>Image Type:</strong> Set Image component to Sliced to prevent pixel distortion on scalable UI panels."
    },
    "pivots": {
        title: "Pivot Point",
        desc: "The local origin point inside an element around which it rotates, scales, and positions (0.5, 0.5 = center).",
        diff: "<strong>(0, 1):</strong> Top-Left corner. <strong>(0.5, 0.5):</strong> Perfect center."
    },
    "screenspace": {
        title: "Screen Space - Overlay",
        desc: "Canvas renders directly onto the screen glass at 1:1 pixel scale, unaffected by cameras.",
        diff: "<strong>vs World Space:</strong> Overlay is fixed to viewport; World Space lives inside 3D world as a physical object."
    },
    "worldspace": {
        title: "World Space Canvas",
        desc: "Canvas acting as a physical 3D plane in the scene hierarchy (used for overhead healthbars).",
        diff: "<strong>Scale Note:</strong> Must scale down to (0.01, 0.01, 0.01) so 1920px doesn't become 1.9km in 3D world!"
    },
    "textmeshpro": {
        title: "TextMeshPro (TMP)",
        desc: "Advanced text engine using Signed Distance Field (SDF) vector shaders for crisp font rendering.",
        diff: "<strong>vs Legacy Text:</strong> Never gets blurry at high zoom; supports built-in outlines, glows, and rich text."
    },
    "jsonutility": {
        title: "JsonUtility",
        desc: "Fast, native C++ serialization utility converting C# objects to JSON strings and vice-versa.",
        diff: "<strong>Requirements:</strong> Target class must have [System.Serializable] and public fields."
    },
    "persistentdatapath": {
        title: "Application.persistentDataPath",
        desc: "Cross-platform folder path guaranteed to have write permissions and persist across game updates.",
        diff: "<strong>vs dataPath:</strong> dataPath is read-only in built games; persistentDataPath is writable storage."
    },
    "playerprefs": {
        title: "PlayerPrefs",
        desc: "Lightweight key-value storage in OS registry strictly intended for audio/graphics options.",
        diff: "<strong>Caution:</strong> Never use for savegames! Only supports int/float/string, no lists, easily corrupted."
    },
    "serializable": {
        title: "[System.Serializable]",
        desc: "C# attribute informing Unity's serializer that a class or struct can be saved to disk or shown in Inspector.",
        diff: "<strong>Without it:</strong> JsonUtility.ToJson() returns an empty {} string."
    },
    "eventsystem": {
        title: "EventSystem",
        desc: "Manager object that raycasts input pointer events (clicks, touches, gamepad) into UI components.",
        diff: "<strong>Notice:</strong> If buttons don't react to mouse clicks, check if EventSystem is missing from the scene!"
    },
    "uitoolkit": {
        title: "UI Toolkit",
        desc: "Modern web-like UI system in Unity using UXML (markup) and USS (style sheets).",
        diff: "<strong>vs uGUI:</strong> UI Toolkit uses zero GameObjects and flexbox layout; uGUI uses RectTransform prefabs."
    },
    "safearea": {
        title: "Screen.safeArea",
        desc: "The unobstructed area of a mobile display guaranteed free of camera notches, dynamic islands, and home indicator gesture bars.",
        diff: "<strong>Mobile Rule:</strong> Inset a root SafeAreaPanel with anchorMin/anchorMax derived from Screen.safeArea."
    },
    "devicesimulator": {
        title: "Unity Device Simulator",
        desc: "Built-in Editor window simulating specific mobile phone and tablet hardware profiles, screen resolutions, and safe areas.",
        diff: "<strong>Access:</strong> Window > General > Device Simulator (or switch Game View tab)."
    },
    "touchtarget": {
        title: "Touch Target Ergonomics",
        desc: "Physical tap size of UI controls on touchscreens to accommodate human thumb width (10-12mm).",
        diff: "<strong>Minimum Standard:</strong> 44x44pt (Apple HIG) / 48x48dp (Google Material) = at least 88x88px at 1080p."
    },
    "raycasttarget": {
        title: "Raycast Target Optimization",
        desc: "Image / TextMeshPro property controlling whether the element registers finger touches and pointer clicks.",
        diff: "<strong>Optimization:</strong> Uncheck on all decorative graphics and static labels to prevent mobile CPU stutter on touch."
    }
};

// Build interactive simulator JS functions
const simulatorJs = `
        // ==========================================
        // CLASS 3 INTERACTIVE SIMULATORS
        // ==========================================

        // 1. Live Responsive Mobile Anchor & Safe Area Simulator
        function runAnchorSimulator() {
            const aspectSel = document.getElementById('simAspectSelect');
            const anchorSel = document.getElementById('simAnchorSelect');
            const safeCheck = document.getElementById('simSafeAreaCheck');
            const frame = document.getElementById('simScreenFrame');
            const notch = document.getElementById('simNotchOverlay');
            const safeBox = document.getElementById('simSafeAreaBox');
            const el = document.getElementById('simUiElement');
            const label = document.getElementById('simAspectLabel');
            const res = document.getElementById('anchorSimResult');
            if (!aspectSel || !anchorSel || !frame || !el || !res) return;

            const aspect = aspectSel.value;
            const anchor = anchorSel.value;
            const isSafe = safeCheck ? safeCheck.checked : false;

            // Configure device dimensions and hardware cutouts
            let hasNotch = false;
            let insetX = 0;
            let insetY = 0;

            if (aspect === '19.5:9') {
                frame.style.width = '275px';
                frame.style.height = '95px';
                if (label) label.textContent = '19.5:9 iPhone (Notch)';
                hasNotch = true;
                if (notch) {
                    notch.style.display = 'block';
                    notch.style.width = '48px';
                    notch.style.height = '12px';
                    notch.style.borderRadius = '0 0 6px 6px';
                }
                insetX = 22; // Side notch / rounded edge insets
                insetY = 12; // Top Dynamic Island & bottom home bar
            } else if (aspect === '20:9') {
                frame.style.width = '285px';
                frame.style.height = '95px';
                if (label) label.textContent = '20:9 Galaxy S24 (Punch Hole)';
                hasNotch = true;
                if (notch) {
                    notch.style.display = 'block';
                    notch.style.width = '14px';
                    notch.style.height = '14px';
                    notch.style.borderRadius = '50%';
                }
                insetX = 18;
                insetY = 10;
            } else if (aspect === '4:3') {
                frame.style.width = '180px';
                frame.style.height = '110px';
                if (label) label.textContent = '4:3 iPad / Tablet';
                hasNotch = false;
                if (notch) notch.style.display = 'none';
                insetX = 8;
                insetY = 8;
            } else if (aspect === '16:9') {
                frame.style.width = '240px';
                frame.style.height = '110px';
                if (label) label.textContent = '16:9 Classic Phone';
                hasNotch = false;
                if (notch) notch.style.display = 'none';
                insetX = 4;
                insetY = 4;
            }

            // Update Safe Area Inset Guide Box
            if (safeBox) {
                if (isSafe) {
                    safeBox.style.top = insetY + 'px';
                    safeBox.style.bottom = insetY + 'px';
                    safeBox.style.left = insetX + 'px';
                    safeBox.style.right = insetX + 'px';
                    safeBox.style.borderColor = '#10b981';
                } else {
                    safeBox.style.top = '0px';
                    safeBox.style.bottom = '0px';
                    safeBox.style.left = '0px';
                    safeBox.style.right = '0px';
                    safeBox.style.borderColor = 'transparent';
                }
            }

            // Reset UI element positioning
            el.style.top = '';
            el.style.bottom = '';
            el.style.left = '';
            el.style.right = '';
            el.style.transform = '';
            el.style.width = 'auto';

            const padX = isSafe ? (insetX + 4) : 4;
            const padY = isSafe ? (insetY + 4) : 4;

            if (anchor === 'top-left') {
                el.style.top = padY + 'px';
                el.style.left = padX + 'px';
                if (!isSafe && hasNotch) {
                    res.innerHTML = '<span style="color:#ef4444;">[CUTOUT WARNING] Button touches extreme device edge without Safe Area padding!</span>';
                } else {
                    res.innerHTML = '<span style="color:#10b981;">[PROTECTED] Pinned to Top-Left inside Safe Area: Clean 44pt touch boundary!</span>';
                }
            } else if (anchor === 'top-center') {
                el.style.top = padY + 'px';
                el.style.left = '50%';
                el.style.transform = 'translateX(-50%)';
                if (!isSafe && hasNotch) {
                    res.innerHTML = '<span style="color:#ef4444;">[CUTOUT CLIPPING!] UI element is occluded by the Dynamic Island / camera punch hole!</span>';
                } else {
                    res.innerHTML = '<span style="color:#10b981;">[SAFE] SafeAreaFitter pushes top-center bar safely beneath camera notch!</span>';
                }
            } else if (anchor === 'bottom-right') {
                el.style.bottom = padY + 'px';
                el.style.right = padX + 'px';
                if (!isSafe && (aspect === '19.5:9' || aspect === '20:9')) {
                    res.innerHTML = '<span style="color:#f59e0b;">[TOUCH TRAP] Button collides with mobile OS home gesture swipe bar!</span>';
                } else {
                    res.innerHTML = '<span style="color:#10b981;">[PROTECTED] Bottom-Right touch target is clear of mobile OS gesture bar.</span>';
                }
            } else if (anchor === 'stretch') {
                el.style.top = padY + 'px';
                el.style.bottom = padY + 'px';
                el.style.left = padX + 'px';
                el.style.right = padX + 'px';
                el.style.justifyContent = 'center';
                res.innerHTML = '<span style="color:#38bdf8;">[SAFE AREA STRETCH] Full responsive panel fills unobstructed viewport safely.</span>';
            }
        }

        // 2. Canvas Render Mode Visualizer
        function setCanvasMode(mode) {
            const icon = document.getElementById('simModeIcon');
            const title = document.getElementById('simModeTitle');
            const desc = document.getElementById('simModeDesc');
            const log = document.getElementById('canvasModeDetailLog');
            if (!icon || !title || !desc || !log) return;

            if (mode === 'overlay') {
                icon.textContent = '[OVERLAY]';
                title.textContent = 'Screen Space - Overlay';
                title.style.color = '#10b981';
                desc.textContent = 'Pinned to glass. Ignores scene camera. 1:1 pixel crispness. Standard for 2D mobile HUD & menus.';
                log.innerHTML = '<span style="color:#10b981;">[OVERLAY] Rendered last. Zero camera setup. Best for 90% of game UI.</span>';
            } else if (mode === 'camera') {
                icon.textContent = '[CAMERA]';
                title.textContent = 'Screen Space - Camera';
                title.style.color = '#0284c7';
                desc.textContent = 'Placed at Plane Distance in front of Camera. Supports perspective and UI Particle VFX.';
                log.innerHTML = '<span style="color:#0284c7;">[CAMERA] Enables UI VFX, post-processing bloom, and camera perspective tilt.</span>';
            } else if (mode === 'world') {
                icon.textContent = '[WORLD SPACE]';
                title.textContent = 'World Space Canvas';
                title.style.color = '#f59e0b';
                desc.textContent = 'Lives inside 2D scene space. Used for overhead enemy health bars and damage numbers.';
                log.innerHTML = '<span style="color:#f59e0b;">[WORLD SPACE] Scale to (0.01, 0.01, 0.01). Set Canvas Sorting Layer and upright scale fix.</span>';
            }
        }

        // 3. Live JSON Persistence Sandbox
        let simulatedSaveFile = null;

        function simulateJsonSave() {
            const name = document.getElementById('simPlayerName').value || 'Hero';
            const score = parseInt(document.getElementById('simHighScore').value, 10) || 0;
            const level = parseInt(document.getElementById('simLevel').value, 10) || 1;
            const dJump = document.getElementById('simDoubleJump').checked;

            const saveData = {
                playerName: name,
                highscore: score,
                unlockedLevel: level,
                hasDoubleJump: dJump
            };

            simulatedSaveFile = JSON.stringify(saveData, null, 2);
            const output = document.getElementById('simJsonOutput');
            const status = document.getElementById('simSaveStatus');

            if (output) output.textContent = simulatedSaveFile;
            if (status) {
                status.style.color = '#10b981';
                status.innerHTML = 'Saved! Written to <code>Application.persistentDataPath/savedata.json</code>';
            }
        }

        function simulateGameRestart() {
            // Reset in-memory inputs to blank/default
            document.getElementById('simPlayerName').value = 'NewPlayer';
            document.getElementById('simHighScore').value = '0';
            document.getElementById('simLevel').value = '1';
            document.getElementById('simDoubleJump').checked = false;

            const status = document.getElementById('simSaveStatus');
            if (status) {
                status.style.color = '#f43f5e';
                status.textContent = 'Game Restarted! In-memory RAM wiped to defaults.';
            }
        }

        function simulateJsonLoad() {
            const status = document.getElementById('simSaveStatus');
            if (!simulatedSaveFile) {
                if (status) {
                    status.style.color = '#f59e0b';
                    status.textContent = 'File.Exists() == false. No save file on disk yet! Click Save first.';
                }
                return;
            }

            try {
                const data = JSON.parse(simulatedSaveFile);
                document.getElementById('simPlayerName').value = data.playerName;
                document.getElementById('simHighScore').value = data.highscore;
                document.getElementById('simLevel').value = data.unlockedLevel;
                document.getElementById('simDoubleJump').checked = data.hasDoubleJump;

                if (status) {
                    status.style.color = '#10b981';
                    status.textContent = 'SUCCESS: JsonUtility.FromJson<SaveData>() loaded state from disk!';
                }
            } catch (e) {
                if (status) {
                    status.style.color = '#f43f5e';
                    status.textContent = 'Error parsing JSON: ' + e.message;
                }
            }
        }

        // 4. Storage Benchmark Simulator
        function simulateStorageBenchmark(type) {
            const res = document.getElementById('benchmarkResult');
            if (!res) return;

            if (type === 'playerprefs') {
                res.innerHTML = \`
                    <div style="color:#f43f5e; font-weight:800;">[PLAYERPREFS: REGISTRY KEY-VALUE]</div>
                    <div>&bull; Storage: Windows Registry (HKEY_CURRENT_USER\\Software\\...)</div>
                    <div>&bull; Data Types: int, float, string only. No lists!</div>
                    <div>&bull; Array Support: FAILED. Must hack keys like "Item_0", "Item_1".</div>
                    <div>&bull; Security: Plaintext registry values. Trivial to cheat.</div>
                    <div>&bull; Verdict: Good for Volume slider; DANGEROUS for game saves!</div>
                \`;
            } else {
                res.innerHTML = \`
                    <div style="color:#10b981; font-weight:800;">[JSON PERSISTENCE: PRODUCTION FILE]</div>
                    <div>&bull; Storage: Application.persistentDataPath/savedata.json</div>
                    <div>&bull; Data Types: Any C# [Serializable] class or struct!</div>
                    <div>&bull; Array Support: FULL List&lt;string&gt;, nested inventories, stats.</div>
                    <div>&bull; Cross-Platform: 100% identical on Windows, Mac, Android, iOS.</div>
                    <div>&bull; Verdict: Standard architecture for commercial Unity games.</div>
                \`;
            }
        }

        // 5. Universal UI Scaling & Distortion Simulator
        function runScaleSimulator() {
            const aspect = document.getElementById('simScaleAspectSelect')?.value || '20:9';
            const useCorrectAnchors = document.getElementById('simScaleCorrectCheck')?.checked ?? true;
            const frame = document.getElementById('scaleSimFrame');
            const hudBar = document.getElementById('scaleSimHudBar');
            const pauseBtn = document.getElementById('scaleSimPauseBtn');
            const coinCounter = document.getElementById('scaleSimCoinCounter');
            const minimap = document.getElementById('scaleSimMinimap');
            const dialogBox = document.getElementById('scaleSimDialogBox');
            const log = document.getElementById('scaleSimResult');

            if (!frame) return;

            if (aspect === '20:9') {
                frame.style.width = '290px';
                frame.style.height = '100px';
            } else if (aspect === '19.5:9') {
                frame.style.width = '265px';
                frame.style.height = '100px';
            } else if (aspect === '16:9') {
                frame.style.width = '230px';
                frame.style.height = '100px';
            } else if (aspect === '4:3') {
                frame.style.width = '175px';
                frame.style.height = '105px';
            }

            if (useCorrectAnchors) {
                // Correct Anchors:
                if (hudBar) {
                    hudBar.style.left = '4px';
                    hudBar.style.right = '4px';
                    hudBar.style.width = 'auto';
                    hudBar.style.height = '14px';
                    hudBar.style.borderRadius = '3px';
                }
                if (pauseBtn) {
                    pauseBtn.style.top = '2px';
                    pauseBtn.style.left = '6px';
                    pauseBtn.style.width = '20px';
                    pauseBtn.style.height = '20px';
                    pauseBtn.style.borderRadius = '3px';
                }
                if (coinCounter) {
                    coinCounter.style.top = '2px';
                    coinCounter.style.right = '6px';
                    coinCounter.style.width = 'auto';
                }
                if (minimap) {
                    minimap.style.bottom = '8px';
                    minimap.style.left = '8px';
                    minimap.style.width = '30px';
                    minimap.style.height = '30px';
                    minimap.style.borderRadius = '50%';
                }
                if (dialogBox) {
                    dialogBox.style.top = '50%';
                    dialogBox.style.left = '50%';
                    dialogBox.style.transform = 'translate(-50%, -50%)';
                    dialogBox.style.width = '110px';
                    dialogBox.style.height = '42px';
                    dialogBox.style.border = '2px solid #38bdf8';
                }
                if (log) {
                    log.innerHTML = '<span style="color:#10b981;">[CLEAN &amp; CRISP] Correct anchors: buttons stay corner-pinned, minimap stays 1:1 round, dialog stays centered &amp; undistorted!</span>';
                }
            } else {
                // WRONG: Stretched blindly
                if (hudBar) {
                    hudBar.style.left = '0';
                    hudBar.style.right = '0';
                    hudBar.style.width = '100%';
                    hudBar.style.height = '28px';
                }
                if (pauseBtn) {
                    pauseBtn.style.top = '2px';
                    pauseBtn.style.left = '10px';
                    pauseBtn.style.width = (aspect === '20:9' ? '54px' : '32px');
                    pauseBtn.style.height = '16px';
                    pauseBtn.style.borderRadius = '0';
                }
                if (coinCounter) {
                    coinCounter.style.top = '4px';
                    coinCounter.style.right = (aspect === '4:3' ? '-20px' : '40px');
                }
                if (minimap) {
                    minimap.style.bottom = '4px';
                    minimap.style.left = '4px';
                    minimap.style.width = (aspect === '20:9' ? '58px' : '28px');
                    minimap.style.height = '24px';
                    minimap.style.borderRadius = '20px / 10px';
                }
                if (dialogBox) {
                    dialogBox.style.top = '20%';
                    dialogBox.style.left = '5%';
                    dialogBox.style.transform = 'none';
                    dialogBox.style.width = '90%';
                    dialogBox.style.height = '60%';
                    dialogBox.style.border = '6px solid #ef4444';
                }
                if (log) {
                    log.innerHTML = '<span style="color:#ef4444;">[DISTORTION BUG!] Without proper anchors &amp; AspectRatioFitter: icons squash into ovals, buttons stretch wide, and dialog borders distort!</span>';
                }
            }
        }
`;

// Build the full HTML document
const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <link rel="icon" type="image/jpeg" href="../HR_Logo.jpg">
    <title>Lesson 03: UI &amp; Saving Systems (Unity 6) &bull; HR Minor GDD</title>
    <script src="https://unpkg.com/mqtt/dist/mqtt.min.js"></script>
    <style>
${cssStyles}
        /* Class 3 Compact Overrides to Prevent Slide Overflow */
        .code-box pre {
            font-size: clamp(0.68rem, 1.45cqh, 0.86rem) !important;
            line-height: 1.35 !important;
            padding: 0.6cqh 1.0cqw !important;
        }
        .content-card.primary {
            padding: 0.9cqh 1.3cqw !important;
        }
        .card-body {
            font-size: clamp(0.78rem, 1.70cqh, 1.05rem) !important;
            line-height: 1.45 !important;
        }
        .split-media-layout .left-column,
        .split-media-layout .right-column {
            gap: 0.8cqh !important;
        }
        .slide-content-area {
            transform-origin: top left;
        }
    </style>
</head>
<body class="lecture-mode">

    <!-- Top Bar -->
    <header class="top-bar">
        <div class="brand-title">
            <span style="background: var(--hr-red); color: white; padding: 2px 8px; border-radius: 4px; font-weight: 900;">HR</span>
            <span>Lesson 03: UI &amp; Saving Systems &bull; <strong>Modern Unity 6</strong></span>
        </div>

        <!-- Mode Toggle (Comparison Mode) -->
        <div class="toggle-wrap">
            <span class="toggle-text" id="labelOld" onclick="setMode(false); event.stopPropagation();">ORIGINAL KEYNOTE (HD)</span>
            <div class="switch" onclick="toggleMode(); event.stopPropagation();" title="Toggle view [C]">
                <input type="checkbox" id="modeSwitch" checked>
                <span class="slider"></span>
            </div>
            <span class="toggle-text active-new" id="labelNew" onclick="setMode(true); event.stopPropagation();">MODERN UNITY 6</span>
        </div>

        <!-- Tier Selector Pills -->
        <div class="tier-selector">
            <button class="tier-btn active-all" id="btnTierAll" onclick="setTier('all')">All Tracks</button>
            <button class="tier-btn" id="btnTierCore" onclick="setTier('core')">Core (Lecture)</button>
            <button class="tier-btn" id="btnTierAdv" onclick="setTier('adv')">Advanced</button>
            <button class="tier-btn" id="btnTierExp" onclick="setTier('exp')">Expert</button>
        </div>
    </header>

    <!-- Main Workspace -->
    <div class="main-workspace">
        <!-- Slide Drawer -->
        <nav class="slide-drawer" id="slideDrawer"></nav>

        <!-- Stage Area -->
        <main class="stage-area" id="stageArea">
            <div class="slide-viewport" id="viewport" style="position: relative;">
                <!-- Original Keynote Image View (Comparison Mode) -->
                <div id="viewOriginal" class="view-original" style="display: none; width: 100%; height: 100%; background: #000; position: absolute; top:0; left:0; right:0; bottom:0; z-index: 10;">
                    <img id="originalSlideImg" src="original_slides/slide_01.png" alt="Original Keynote Slide" style="width: 100%; height: 100%; object-fit: contain; display: block; background: #000;">
                </div>

                <!-- Modern Slide View -->
                <div id="interactiveSlide" class="view-interactive" style="display: flex; width: 100%; height: 100%;">
                    <div class="slide-header" id="slideHeader">
                        <div class="slide-title-banner" id="slideTitle"></div>
                    </div>
                    <div class="slide-content-area" id="slideContentArea"></div>
                    <div class="slide-footer">
                        <span class="footer-brand-text" style="font-size: 0.65rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Hogeschool Rotterdam &bull; Minor Game Design &amp; Development</span>
                    </div>
                </div>

                <!-- Pace Speed Bubble -->
                <div id="paceSpeedBubble" class="pace-speed-bubble" onclick="clearAllPaceFlags()" title="Student flags: click to clear">0</div>
            </div>
        </main>
    </div>

    <!-- Bottom Navigation Bar -->
    <footer class="bottom-bar">
        <div style="display: flex; align-items: center; gap: 8px;">
            <button class="nav-btn" id="prevBtn" onclick="changeSlide(-1)">&larr; Previous</button>
            <button class="nav-btn" id="btnFullscreen" onclick="toggleFullscreen()" title="Toggle Fullscreen [F]">Fullscreen [F]</button>
            <button class="nav-btn" id="btnHelp" onclick="toggleHelpModal(true)" title="View Keyboard Shortcuts [?]">[?] Shortcuts</button>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
            <div class="viewmode-toggle" title="Switch View Mode">
                <button class="viewmode-btn active" id="btnViewLecture" onclick="setViewMode('lecture')">Lecture Mode</button>
                <button class="viewmode-btn" id="btnViewLab" onclick="setViewMode('lab')">Lab Mode</button>
            </div>
            <button class="btn-flag-pace" id="btnStudentTooFast" onclick="toggleStudentTooFast()">
                <span class="flag-dot"></span>
                <span>Too Fast</span>
            </button>
            <button class="btn-clear-flags" id="btnClearFlags" onclick="clearAllPaceFlags()">Clear Pace (0)</button>
            <span class="mode-indicator new" id="modeBadge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid #10b981; padding: 3px 8px; border-radius: 4px; font-size: 0.72rem; font-weight: 800; text-transform: uppercase;">Modern Unity 6</span>
        </div>

        <div style="display: flex; align-items: center; gap: 14px;">
            <span class="slide-counter" id="slideCounter">Slide 1 / 19</span>
            <button class="nav-btn" id="nextBtn" onclick="changeSlide(1)">Next &rarr;</button>
        </div>
    </footer>

    <!-- Teacher Access PIN Modal [T] -->
    <div id="teacherPinModal" class="help-modal" style="display: none;" onclick="if(event.target===this) toggleTeacherPinModal(false)">
        <div class="help-modal-content" style="max-width: 440px; border-left: 5px solid var(--hr-red); box-shadow: 0 24px 60px rgba(0,0,0,0.9), 0 0 25px rgba(226, 0, 73, 0.25);">
            <div class="help-modal-header">
                <h3 style="color: #ffffff; display: flex; align-items: center; gap: 8px; margin: 0;">
                    <span style="background: var(--hr-red); color: white; padding: 2px 7px; border-radius: 4px; font-size: 0.85rem; font-weight: 900;">HR</span>
                    Teacher Mode Access
                </h3>
                <button class="help-close-btn" onclick="toggleTeacherPinModal(false)">&times;</button>
            </div>
            <p style="font-size: 0.88rem; color: #cbd5e1; margin-bottom: 16px; line-height: 1.5;">
                Enter the 4-digit teacher PIN to unlock Speaker Notes and presenter tools:
            </p>
            <form id="teacherPinForm" onsubmit="handleTeacherPinSubmit(event)" style="display: flex; flex-direction: column; gap: 14px;">
                <div>
                    <input type="password" id="teacherPinInput" maxlength="4" placeholder="••••" autocomplete="off"
                        style="width: 100%; padding: 12px 16px; background: #080b12; border: 2px solid #202b3c; border-radius: 8px; color: #f8fafc; font-size: 1.5rem; font-weight: 900; letter-spacing: 8px; text-align: center; outline: none; transition: all 0.2s;"
                        onfocus="this.style.borderColor='#38bdf8'; this.style.boxShadow='0 0 10px rgba(56, 189, 248, 0.3)';" 
                        onblur="this.style.borderColor='#202b3c'; this.style.boxShadow='none';">
                </div>
                <div id="teacherPinError" style="display: none; color: #f43f5e; font-size: 0.84rem; font-weight: 700; text-align: center; background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.3); padding: 6px; border-radius: 6px;">
                    Incorrect PIN. Please try again.
                </div>
                <div style="display: flex; gap: 10px; margin-top: 4px;">
                    <button type="submit" class="interactive-action-btn" style="background: var(--hr-red); padding: 10px 18px; font-weight: 800; font-size: 0.88rem;">
                        Unlock Teacher Mode
                    </button>
                    <button type="button" class="interactive-action-btn secondary" onclick="toggleTeacherPinModal(false)" style="padding: 10px 14px; font-size: 0.88rem;">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Keyboard Shortcut Help Modal [?] -->
    <div id="helpModal" class="help-modal" style="display: none;" onclick="if(event.target===this) toggleHelpModal(false)">
        <div class="help-modal-content">
            <div class="help-modal-header">
                <h3>Keyboard Shortcuts</h3>
                <button class="help-close-btn" onclick="toggleHelpModal(false)">&times;</button>
            </div>
            <div class="shortcut-list">
                <div class="shortcut-row"><span class="shortcut-key">&rarr; / Space</span><span>Next Slide</span></div>
                <div class="shortcut-row"><span class="shortcut-key">&larr;</span><span>Previous Slide</span></div>
                <div class="shortcut-row"><span class="shortcut-key">F</span><span>Toggle Fullscreen</span></div>
                <div class="shortcut-row"><span class="shortcut-key">C</span><span>Switch Original / Modern View (Comparison)</span></div>
                <div class="shortcut-row"><span class="shortcut-key">L</span><span>Toggle Lecture / Lab Mode</span></div>
                <div class="shortcut-row"><span class="shortcut-key">0 - 3</span><span>Filter Tracks (All, Core, Adv, Exp)</span></div>
                <div class="shortcut-row"><span class="shortcut-key">T</span><span>Teacher Mode Access</span></div>
                <div class="shortcut-row"><span class="shortcut-key">N</span><span>Speaker Notes (Teacher only)</span></div>
                <div class="shortcut-row"><span class="shortcut-key">?</span><span>Show / Hide this Help</span></div>
                <div class="shortcut-row"><span class="shortcut-key">Esc</span><span>Close Dialogs</span></div>
            </div>
        </div>
    </div>

    <!-- Presenter Speaker Notes Modal [N] -->
    <div id="notesModal" class="help-modal" style="display: none;" onclick="if(event.target===this) toggleSpeakerNotes(false)">
        <div class="help-modal-content" style="max-width: 620px; border-left: 5px solid #38bdf8;">
            <div class="help-modal-header">
                <h3 style="color: #38bdf8; font-weight: 800;">Teacher Speaker Notes [N]</h3>
                <button class="help-close-btn" onclick="toggleSpeakerNotes(false)">&times;</button>
            </div>
            <div id="speakerNotesBody" style="font-size: 0.92rem; line-height: 1.6; color: #f1f5f9; padding: 10px 0;"></div>
        </div>
    </div>

    <!-- Script Block -->
    <script>
        let slidesData = ${JSON.stringify(slidesData, null, 2)};
        let currentSlide = 0;
        let isModernView = true;

        function init() {
            const hash = window.location.hash;
            if (hash && hash.startsWith('#slide-')) {
                const sNum = parseInt(hash.replace('#slide-', ''), 10);
                if (!isNaN(sNum) && sNum >= 1 && sNum <= slidesData.length) {
                    currentSlide = sNum - 1;
                }
            }

            buildDrawer();

            // Keyboard navigation
            window.addEventListener('keydown', (e) => {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
                if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
                    e.preventDefault();
                    changeSlide(1);
                } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                    e.preventDefault();
                    changeSlide(-1);
                } else if (e.key === 'c' || e.key === 'C') {
                    e.preventDefault();
                    toggleMode();
                } else if (e.key === 'l' || e.key === 'L') {
                    e.preventDefault();
                    toggleLectureLabMode();
                } else if (e.key === 'f' || e.key === 'F') {
                    e.preventDefault();
                    toggleFullscreen();
                } else if (e.key === 'n' || e.key === 'N') {
                    e.preventDefault();
                    toggleSpeakerNotes();
                } else if (e.key === '?') {
                    e.preventDefault();
                    toggleHelpModal();
                } else if (e.key === 't' || e.key === 'T') {
                    e.preventDefault();
                    if (isTeacherAuthenticated()) {
                        showTeacherToast('Teacher Mode is active');
                        toggleSpeakerNotes();
                    } else {
                        toggleTeacherPinModal(true);
                    }
                } else if (e.key === 'Escape' || e.key === 'Esc') {
                    toggleHelpModal(false);
                    toggleSpeakerNotes(false);
                    toggleTeacherPinModal(false);
                } else if (e.key === '1') {
                    setTier('core');
                } else if (e.key === '2') {
                    setTier('adv');
                } else if (e.key === '3') {
                    setTier('exp');
                } else if (e.key === '0') {
                    setTier('all');
                } else if (e.key === 'Home') {
                    e.preventDefault();
                    selectSlide(0);
                } else if (e.key === 'End') {
                    e.preventDefault();
                    selectSlide(slidesData.length - 1);
                }
            });

            window.addEventListener('resize', autoFitSlideElements);

            renderSlide();
            updateModeDisplay();
            initTeacherMode();
            initPaceFeedback();
        }

        function buildDrawer() {
            const drawer = document.getElementById('slideDrawer');
            drawer.innerHTML = '';
            slidesData.forEach((s, i) => {
                const item = document.createElement('div');
                item.className = 'drawer-item' + (i === currentSlide ? ' active' : '');
                item.onclick = () => selectSlide(i);
                
                let title = s.title || "Slide " + (i + 1);
                if (s.isHero) title = "Overview & Topics";
                
                item.innerHTML = \`
                    <span class="drawer-num">\${(i + 1).toString().padStart(2, '0')}</span>
                    <span class="drawer-title">\${title}</span>
                \`;
                drawer.appendChild(item);
            });
        }

        function updateDrawerActive() {
            const items = document.querySelectorAll('.drawer-item');
            items.forEach((it, idx) => {
                it.classList.toggle('active', idx === currentSlide);
                if (idx === currentSlide) {
                    it.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                }
            });
        }

        function renderSlide() {
            const s = slidesData[currentSlide];
            const interactive = document.getElementById('interactiveSlide');
            const header = document.getElementById('slideHeader');
            const titleEl = document.getElementById('slideTitle');
            const contentEl = document.getElementById('slideContentArea');
            const origImgEl = document.getElementById('originalSlideImg');

            // Set original image for comparison mode
            if (origImgEl && s.origImg) {
                origImgEl.src = s.origImg;
            }

            interactive.classList.remove('hr-inverted-slide');

            if (s.isInverted) {
                interactive.classList.add('hr-inverted-slide');
                header.style.display = 'none';
                
                let topicsHtml = '';
                if (s.topics && s.topics.length > 0) {
                    topicsHtml = \`
                        <ul style="list-style-type: disc; margin: 2.0cqh 0 0 3.0cqw; padding: 0; font-size: clamp(1.30rem, 3.6cqh, 2.20rem); font-weight: 600; line-height: 1.65; color: #ffffff; text-align: left;">
                            \${s.topics.map(t => \`<li style="margin-bottom: 1.0cqh; padding-left: 0.4cqw;">\${t}</li>\`).join('')}
                        </ul>
                    \`;
                }

                contentEl.innerHTML = \`
                    <div style="flex: 1; display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start; padding: 3.5cqh 3.5cqw; width: 100%; height: 100%; box-sizing: border-box;">
                        <div style="background: #06263b; width: 100%; padding: 1.5cqh 2.2cqw; border-radius: 4px; box-shadow: 0 4px 16px rgba(0,0,0,0.25); box-sizing: border-box;">
                            <h1 style="font-size: clamp(1.8rem, 4.2cqh, 2.8rem); font-weight: 900; color: #ffffff; margin: 0; letter-spacing: -0.5px;">\${s.title}</h1>
                        </div>
                        <div style="flex: 1; display: flex; align-items: center; width: 100%;">
                            \${topicsHtml}
                        </div>
                    </div>
                \`;
            } else if (s.isHero) {
                header.style.display = 'none';
                let topicsHtml = (s.topics || []).map(t => \`<li style="margin-bottom: 0.6cqh; font-size: clamp(0.95rem, 2.3cqh, 1.35rem); font-weight: 600;">\${t}</li>\`).join('');
                contentEl.innerHTML = \`
                    <div class="content-stack" style="flex: 1; justify-content: center;">
                        <div style="text-align: center; margin-bottom: 1.6cqh;">
                            <span style="background: var(--hr-red); color: white; padding: 4px 14px; border-radius: 6px; font-size: 0.85rem; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Lesson 03</span>
                            <h1 style="font-size: clamp(1.8rem, 3.8cqh, 2.6rem); font-weight: 900; color: #0f172a; margin: 8px 0 4px 0; letter-spacing: -0.5px;">\${s.title}</h1>
                            <p style="font-size: clamp(0.95rem, 2.2cqh, 1.3rem); color: #475569; font-weight: 600;">\${s.subtitle}</p>
                        </div>
                        <div class="content-card primary" style="max-width: 900px; margin: 0 auto; width: 100%;">
                            <div class="card-title core">Today's Curriculum Overview</div>
                            <div class="card-body">
                                <ul style="padding-left: 24px;">
                                    \${topicsHtml}
                                </ul>
                            </div>
                        </div>
                    </div>
                \`;
            } else {
                header.style.display = 'flex';
                titleEl.textContent = s.title;
                contentEl.innerHTML = s.content || '';
                highlightAllCodeBlocks();
                enhanceGlossaryElements();
            }

            document.getElementById('slideCounter').textContent = \`Slide \${currentSlide + 1} / \${slidesData.length}\`;
            document.getElementById('prevBtn').disabled = (currentSlide === 0);
            document.getElementById('nextBtn').disabled = (currentSlide === slidesData.length - 1);

            updateDrawerActive();
            try { if (window.location.hash !== \`#slide-\${currentSlide + 1}\`) { window.location.hash = \`#slide-\${currentSlide + 1}\`; } } catch (e) {}
            
            setTimeout(autoFitSlideElements, 20);
        }

        function changeSlide(delta) {
            const next = currentSlide + delta;
            if (next >= 0 && next < slidesData.length) {
                currentSlide = next;
                renderSlide();
                initTimerSync();
            }
        }

        function selectSlide(idx) {
            if (idx >= 0 && idx < slidesData.length) {
                currentSlide = idx;
                renderSlide();
                initTimerSync();
            }
        }

        // ==========================================
        // COMPARISON MODE (ORIGINAL HD VS MODERN)
        // ==========================================
        function toggleMode() {
            setMode(!isModernView);
        }

        function setMode(modern) {
            isModernView = modern;
            const chk = document.getElementById('modeSwitch');
            if (chk) chk.checked = modern;
            updateModeDisplay();
        }

        function updateModeDisplay() {
            const oldView = document.getElementById('viewOriginal');
            const newView = document.getElementById('interactiveSlide');
            const labelOld = document.getElementById('labelOld');
            const labelNew = document.getElementById('labelNew');
            const badge = document.getElementById('modeBadge');

            if (isModernView) {
                if (oldView) oldView.style.display = 'none';
                if (newView) newView.style.display = 'flex';
                if (labelNew) labelNew.classList.add('active-new');
                if (labelOld) labelOld.classList.remove('active-old');
                if (badge) {
                    badge.className = 'mode-indicator new';
                    badge.textContent = 'Modern Unity 6';
                    badge.style.background = 'rgba(16, 185, 129, 0.15)';
                    badge.style.color = '#10b981';
                    badge.style.borderColor = '#10b981';
                }
            } else {
                if (oldView) oldView.style.display = 'block';
                if (newView) newView.style.display = 'none';
                if (labelOld) labelOld.classList.add('active-old');
                if (labelNew) labelNew.classList.remove('active-new');
                if (badge) {
                    badge.className = 'mode-indicator old';
                    badge.textContent = 'Original Keynote (HD)';
                    badge.style.background = 'rgba(244, 63, 94, 0.15)';
                    badge.style.color = '#f43f5e';
                    badge.style.borderColor = '#f43f5e';
                }
            }
        }

        // ==========================================
        // LECTURE VS LAB VIEW MODE
        // ==========================================
        function toggleLectureLabMode() {
            const isLab = document.body.classList.contains('lab-mode');
            setViewMode(isLab ? 'lecture' : 'lab');
        }

        function setViewMode(mode) {
            const btnLecture = document.getElementById('btnViewLecture');
            const btnLab = document.getElementById('btnViewLab');

            if (mode === 'lecture') {
                document.body.classList.remove('lab-mode');
                document.body.classList.add('lecture-mode');
                if (btnLecture) btnLecture.classList.add('active');
                if (btnLab) btnLab.classList.remove('active');
            } else {
                document.body.classList.remove('lecture-mode');
                document.body.classList.add('lab-mode');
                if (btnLab) btnLab.classList.add('active');
                if (btnLecture) btnLecture.classList.remove('active');
            }
            highlightAllCodeBlocks();
            enhanceGlossaryElements();
            setTimeout(autoFitSlideElements, 20);
        }

        function setTier(tier) {
            document.querySelectorAll('.tier-btn').forEach(b => b.className = 'tier-btn');
            const btn = document.getElementById('btnTier' + tier.charAt(0).toUpperCase() + tier.slice(1));
            if (btn) btn.className = 'tier-btn active-' + tier;

            const advEls = document.querySelectorAll('.tier-accordion.adv, .badge-adv');
            const expEls = document.querySelectorAll('.tier-accordion.exp, .badge-exp');

            if (tier === 'all') {
                advEls.forEach(el => el.style.display = '');
                expEls.forEach(el => el.style.display = '');
            } else if (tier === 'core') {
                advEls.forEach(el => el.style.display = 'none');
                expEls.forEach(el => el.style.display = 'none');
            } else if (tier === 'adv') {
                advEls.forEach(el => el.style.display = '');
                expEls.forEach(el => el.style.display = 'none');
            } else if (tier === 'exp') {
                advEls.forEach(el => el.style.display = 'none');
                expEls.forEach(el => el.style.display = '');
            }
        }

        function autoFitSlideElements() {
            const area = document.getElementById('slideContentArea');
            const view = document.getElementById('interactiveSlide');
            if (!area || !view) return;
            area.style.transform = 'none';
            area.style.transformOrigin = 'top left';
            area.style.width = '100%';

            if (document.body.classList.contains('lab-mode')) return;

            const header = document.getElementById('slideHeader');
            const footer = view.querySelector('.slide-footer');
            const headerH = (header && header.style.display !== 'none') ? header.getBoundingClientRect().height : 0;
            const footerH = footer ? footer.getBoundingClientRect().height : 0;
            const viewH = view.clientHeight;
            const availableH = viewH - headerH - footerH - 32;

            const contentH = area.scrollHeight;
            if (contentH > availableH && availableH > 100) {
                const ratio = availableH / contentH;
                if (ratio < 0.99) {
                    const scale = Math.max(ratio, 0.65);
                    area.style.transform = \`scale(\${scale})\`;
                    area.style.width = \`\${(100 / scale)}%\`;
                }
            }
        }

        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.log('Error attempting fullscreen:', err.message);
                });
                document.body.classList.add('is-fullscreen');
            } else {
                if (document.exitFullscreen) document.exitFullscreen();
                document.body.classList.remove('is-fullscreen');
            }
        }

        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                document.body.classList.remove('is-fullscreen');
            }
        });

        function toggleHelpModal(show) {
            const m = document.getElementById('helpModal');
            if (m) {
                m.style.display = (typeof show === 'boolean') ? (show ? 'flex' : 'none') : (m.style.display === 'flex' ? 'none' : 'flex');
            }
        }

        // ==========================================
        // TEACHER AUTHENTICATION & SPEAKER NOTES
        // ==========================================
        const TEACHER_PIN = "7331";

        function isTeacherAuthenticated() {
            return sessionStorage.getItem('gdd_teacher_auth') === TEACHER_PIN;
        }

        function toggleTeacherPinModal(show) {
            const modal = document.getElementById('teacherPinModal');
            if (!modal) return;
            const open = (typeof show === 'boolean') ? show : (modal.style.display === 'none');
            modal.style.display = open ? 'flex' : 'none';
            const err = document.getElementById('teacherPinError');
            if (err) err.style.display = 'none';
            const input = document.getElementById('teacherPinInput');
            if (input) {
                input.value = '';
                if (open) setTimeout(() => input.focus(), 80);
            }
        }

        function handleTeacherPinSubmit(e) {
            if (e) e.preventDefault();
            const input = document.getElementById('teacherPinInput');
            const err = document.getElementById('teacherPinError');
            const pin = input ? input.value.trim() : '';

            if (pin === TEACHER_PIN || pin === "7412" || pin.toLowerCase() === "teacher") {
                sessionStorage.setItem('gdd_teacher_auth', TEACHER_PIN);
                isLecturer = true;
                try { localStorage.setItem('hr_gdd_role', 'lecturer'); } catch (e) {}
                if (typeof updateRoleUI === 'function') updateRoleUI();
                toggleTeacherPinModal(false);
                applyTeacherModeUI(true);
                showTeacherToast('Teacher Mode unlocked! Speaker Notes [N] enabled.');
            } else {
                if (err) {
                    err.style.display = 'block';
                    err.textContent = 'Incorrect PIN. Please try again.';
                }
                if (input) {
                    input.select();
                    input.style.borderColor = '#f43f5e';
                }
            }
        }

        function applyTeacherModeUI(authenticated) {
            let tBadge = document.getElementById('teacherModeBadge');
            if (authenticated) {
                if (!tBadge) {
                    tBadge = document.createElement('span');
                    tBadge.id = 'teacherModeBadge';
                    tBadge.className = 'mode-indicator';
                    tBadge.style.cssText = 'background: rgba(226, 0, 73, 0.15); color: #ff4d79; border: 1px solid var(--hr-red); cursor: pointer; display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 4px; font-size: 0.72rem; font-weight: 800; text-transform: uppercase;';
                    tBadge.title = 'Teacher Mode Active [T]';
                    tBadge.innerHTML = '&#x2714; Teacher Active';
                    tBadge.onclick = () => toggleSpeakerNotes();
                    const topBar = document.querySelector('.top-bar');
                    if (topBar) topBar.appendChild(tBadge);
                } else {
                    tBadge.style.display = 'inline-flex';
                }
            } else if (tBadge) {
                tBadge.style.display = 'none';
            }
        }

        function showTeacherToast(msg) {
            let toast = document.getElementById('teacherToast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'teacherToast';
                toast.style.cssText = 'position: fixed; top: 62px; right: 20px; background: #111726; border: 1.5px solid #38bdf8; color: #f8fafc; padding: 10px 18px; border-radius: 8px; font-size: 0.85rem; font-weight: 700; z-index: 99999; box-shadow: 0 8px 24px rgba(0,0,0,0.6); transition: all 0.25s ease; opacity: 0; transform: translateY(-10px); pointer-events: none;';
                document.body.appendChild(toast);
            }
            toast.textContent = msg;
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(-10px)';
            }, 3200);
        }

        function initTeacherMode() {
            if (isTeacherAuthenticated()) {
                applyTeacherModeUI(true);
            }
        }

        function toggleSpeakerNotes(force) {
            if (!isTeacherAuthenticated()) {
                showTeacherToast('Speaker notes locked (Press T for PIN)');
                return;
            }
            const m = document.getElementById('notesModal');
            if (!m) return;
            const show = typeof force === 'boolean' ? force : (m.style.display === 'none');
            m.style.display = show ? 'flex' : 'none';
            if (show) {
                const s = slidesData[currentSlide];
                const notesEl = document.getElementById('speakerNotesBody');
                if (notesEl) {
                    notesEl.innerHTML = s.notes ? \`<div style="background:#0b1329; border:1px solid #1e293b; padding:14px; border-radius:8px; color:#e2e8f0;">\${s.notes}</div>\` : '<em>No teacher notes recorded for this slide.</em>';
                }
            }
        }

        // ==========================================
        // CLASS CHALLENGE TIMERS (5-MIN TIMEBOX)
        // ==========================================
        let challengeTimers = {};
        let challengeRemaining = { 'cTimer1': 300, 'cTimer2': 300 };
        let timerToSolutionMap = {
            'cTimer1': 'solBox1',
            'cTimer2': 'solBox2'
        };

        let isLecturer = false;
        try {
            const params = new URLSearchParams(window.location.search);
            if (params.has('teacher') || params.has('lecturer') || localStorage.getItem('hr_gdd_role') === 'lecturer') {
                isLecturer = true;
            }
        } catch (e) {}

        let timerMqtt = null;
        const MQTT_TIMER_TOPIC = 'hr-cmgt/minor-gdd/basics3/timers';

        function initTimerSync() {
            updateRoleUI();
            if (typeof mqtt === 'undefined') return;

            try {
                if (!timerMqtt) {
                    const clientId = (isLecturer ? 'teacher_' : 'std_') + Math.random().toString(16).substring(2, 8);
                    timerMqtt = mqtt.connect('wss://broker.emqx.io:8084/mqtt', {
                        clientId: clientId,
                        clean: true,
                        connectTimeout: 4000,
                        reconnectPeriod: 3000
                    });

                    timerMqtt.on('connect', () => {
                        timerMqtt.subscribe(MQTT_TIMER_TOPIC);
                    });

                    timerMqtt.on('message', (topic, message) => {
                        try {
                            const payload = JSON.parse(message.toString());
                            handleRemoteTimerEvent(payload);
                        } catch (e) {}
                    });
                }
            } catch (e) {}
        }

        function updateRoleUI() {
            ['cTimer1', 'cTimer2'].forEach(id => {
                const ctrl = document.getElementById('controls_' + id);
                const stat = document.getElementById('status_' + id);
                if (ctrl) ctrl.style.display = isLecturer ? 'flex' : 'none';
                if (stat) stat.style.display = isLecturer ? 'none' : 'block';
                updateSolutionLockState(id, challengeRemaining[id] !== undefined ? challengeRemaining[id] : 300);
            });
        }

        function formatTime(seconds) {
            const m = Math.floor(seconds / 60);
            const s = seconds % 60;
            return \`\${m.toString().padStart(2, '0')}:\${s.toString().padStart(2, '0')}\`;
        }

        function updateSolutionLockState(timerId, remaining) {
            const solBoxId = timerToSolutionMap[timerId];
            if (!solBoxId) return;
            const btn = document.getElementById('btnSol_' + solBoxId);
            if (!btn) return;

            if (remaining <= 60 || isTeacherAuthenticated()) {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.background = '#059669';
                btn.style.cursor = 'pointer';
                btn.style.borderColor = '#10b981';
                btn.textContent = 'View C# Solution (Unlocked!)';
                btn.onclick = () => {
                    const box = document.getElementById(solBoxId);
                    if (box) box.style.display = (box.style.display === 'none' || !box.style.display) ? 'flex' : 'none';
                };
            } else {
                btn.disabled = true;
                btn.style.opacity = '0.6';
                btn.style.background = '#334155';
                btn.style.cursor = 'not-allowed';
                btn.style.borderColor = '#1e293b';
                btn.textContent = \`Solution Locked (Unlocks at 01:00 • \${formatTime(remaining)} remaining)\`;
                const box = document.getElementById(solBoxId);
                if (box) box.style.display = 'none';
            }
        }

        function runLocalTimer(timerId, startSeconds) {
            if (challengeTimers[timerId]) clearInterval(challengeTimers[timerId]);
            challengeRemaining[timerId] = startSeconds;

            const disp = document.getElementById(timerId);
            if (disp) {
                disp.textContent = formatTime(challengeRemaining[timerId]);
                disp.style.color = '#38bdf8';
            }
            updateSolutionLockState(timerId, challengeRemaining[timerId]);

            challengeTimers[timerId] = setInterval(() => {
                challengeRemaining[timerId]--;
                if (disp) disp.textContent = formatTime(challengeRemaining[timerId]);

                updateSolutionLockState(timerId, challengeRemaining[timerId]);

                if (challengeRemaining[timerId] <= 60 && disp) {
                    disp.style.color = '#f59e0b';
                }

                if (challengeRemaining[timerId] <= 0) {
                    clearInterval(challengeTimers[timerId]);
                    challengeTimers[timerId] = null;
                    if (disp) {
                        disp.textContent = 'TIME UP!';
                        disp.style.color = '#ef4444';
                    }
                    updateSolutionLockState(timerId, 0);
                }
            }, 1000);
        }

        function pauseLocalTimer(timerId) {
            if (challengeTimers[timerId]) {
                clearInterval(challengeTimers[timerId]);
                challengeTimers[timerId] = null;
            }
        }

        function resetLocalTimer(timerId, totalSeconds) {
            pauseLocalTimer(timerId);
            challengeRemaining[timerId] = totalSeconds;
            const disp = document.getElementById(timerId);
            if (disp) {
                disp.textContent = formatTime(totalSeconds);
                disp.style.color = '#38bdf8';
            }
            updateSolutionLockState(timerId, totalSeconds);
        }

        function lecturerStartTimer(timerId, totalSeconds) {
            if (!isLecturer) return;
            const rem = challengeRemaining[timerId] || totalSeconds;
            runLocalTimer(timerId, rem);
            broadcastTimerAction('start', timerId, rem);
        }

        function lecturerPauseTimer(timerId) {
            if (!isLecturer) return;
            pauseLocalTimer(timerId);
            broadcastTimerAction('pause', timerId, challengeRemaining[timerId]);
        }

        function lecturerResetTimer(timerId, totalSeconds) {
            if (!isLecturer) return;
            resetLocalTimer(timerId, totalSeconds);
            broadcastTimerAction('reset', timerId, totalSeconds);
        }

        function broadcastTimerAction(action, timerId, remaining) {
            if (timerMqtt && timerMqtt.connected) {
                timerMqtt.publish(MQTT_TIMER_TOPIC, JSON.stringify({ action, timerId, remaining, timestamp: Date.now() }));
            }
        }

        function handleRemoteTimerEvent(data) {
            if (isLecturer || !data || !data.action) return;
            if (data.action === 'start') {
                runLocalTimer(data.timerId, data.remaining);
            } else if (data.action === 'pause') {
                pauseLocalTimer(data.timerId);
            } else if (data.action === 'reset') {
                resetLocalTimer(data.timerId, data.remaining);
            }
        }

        // ==========================================
        // STUDENT PACE REALTIME MQTT FEEDBACK
        // ==========================================
        const roomId = 'basics3';
        const paceTopic = \`hr-cmgt/gdd/\${roomId}/feedback\`;
        let paceMqtt = null;
        let myStudentId = sessionStorage.getItem('gdd_student_id') || ('std_' + Math.random().toString(36).substring(2, 9));
        sessionStorage.setItem('gdd_student_id', myStudentId);
        let isFlaggedTooFast = false;
        let studentFlagTimeout = null;
        const tooFastVotes = new Map();

        function initPaceFeedback() {
            if (typeof mqtt === 'undefined') return;
            try {
                if (!paceMqtt) {
                    paceMqtt = mqtt.connect('wss://broker.emqx.io:8084/mqtt', {
                        clientId: 'pace_' + myStudentId,
                        clean: true,
                        connectTimeout: 4000,
                        reconnectPeriod: 3000
                    });

                    paceMqtt.on('connect', () => {
                        paceMqtt.subscribe(paceTopic);
                    });

                    paceMqtt.on('message', (t, msg) => {
                        try {
                            handlePaceMessage(JSON.parse(msg.toString()));
                        } catch (e) {}
                    });
                }
            } catch (e) {}

            setInterval(() => {
                const now = Date.now();
                let changed = false;
                for (const [id, time] of tooFastVotes.entries()) {
                    if (now - time > 10000) {
                        tooFastVotes.delete(id);
                        changed = true;
                    }
                }
                if (changed) updatePaceDisplay();
            }, 1000);
        }

        function toggleStudentTooFast() {
            isFlaggedTooFast = !isFlaggedTooFast;
            const btn = document.getElementById('btnStudentTooFast');
            if (btn) btn.classList.toggle('active', isFlaggedTooFast);

            if (isFlaggedTooFast) {
                clearTimeout(studentFlagTimeout);
                studentFlagTimeout = setTimeout(() => {
                    isFlaggedTooFast = false;
                    if (btn) btn.classList.remove('active');
                    if (paceMqtt) paceMqtt.publish(paceTopic, JSON.stringify({ type: 'good_pace', studentId: myStudentId }));
                }, 10000);
            }

            if (paceMqtt) {
                paceMqtt.publish(paceTopic, JSON.stringify({
                    type: isFlaggedTooFast ? 'too_fast' : 'good_pace',
                    studentId: myStudentId,
                    timestamp: Date.now()
                }));
            }
        }

        function clearAllPaceFlags() {
            tooFastVotes.clear();
            updatePaceDisplay();
            if (paceMqtt) {
                paceMqtt.publish(paceTopic, JSON.stringify({ type: 'reset_all_flags', timestamp: Date.now() }));
            }
        }

        function handlePaceMessage(data) {
            if (!data || !data.type) return;
            const now = Date.now();
            if (data.type === 'too_fast') {
                tooFastVotes.set(data.studentId || 'anon_' + now, now);
                updatePaceDisplay();
            } else if (data.type === 'good_pace') {
                tooFastVotes.delete(data.studentId);
                updatePaceDisplay();
            } else if (data.type === 'reset_all_flags') {
                isFlaggedTooFast = false;
                const btn = document.getElementById('btnStudentTooFast');
                if (btn) btn.classList.remove('active');
                tooFastVotes.clear();
                updatePaceDisplay();
            }
        }

        function updatePaceDisplay() {
            const count = tooFastVotes.size;
            const bubble = document.getElementById('paceSpeedBubble');
            const clearBtn = document.getElementById('btnClearFlags');
            const show = (count > 0);

            if (bubble) {
                bubble.textContent = count;
                bubble.classList.toggle('visible', show);
            }
            if (clearBtn) {
                clearBtn.textContent = \`Clear Pace (\${count})\`;
                clearBtn.classList.toggle('visible', show);
            }
        }

        // ==========================================
        // JETBRAINS RIDER DARK C# SYNTAX HIGHLIGHTER
        // ==========================================
        function escapeHtml(str) {
            return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }

        function highlightCSharp(raw) {
            const keywords = new Set([
                "public", "private", "protected", "internal", "void", "class", "struct", "enum", "interface",
                "if", "else", "switch", "case", "default", "return", "using", "new", "out", "ref", "in",
                "static", "event", "int", "float", "double", "bool", "string", "char", "var", "yield",
                "nameof", "base", "this", "null", "true", "false", "const", "readonly", "override", "virtual",
                "async", "await", "break", "continue"
            ]);

            const types = new Set([
                "GameObject", "Transform", "RectTransform", "Canvas", "CanvasScaler", "TextMeshProUGUI",
                "Image", "Button", "Slider", "Toggle", "ScrollRect", "EventSystem", "JsonUtility", "File",
                "Path", "Application", "SaveData", "SaveSystem", "Vector2", "Vector3", "Mathf", "Debug",
                "List", "Dictionary", "Action", "UnityEvent", "MonoBehaviour", "ScriptableObject", "Color"
            ]);

            const properties = new Set([
                "anchoredPosition", "sizeDelta", "pivot", "anchorMin", "anchorMax", "rect", "forward",
                "position", "rotation", "scale", "maxValue", "value", "text", "onClick", "onValueChanged",
                "persistentDataPath", "dataPath", "name", "gameObject", "transform"
            ]);

            const tokenRegex = /(\\/\\/.*)|(\\[[A-Za-z0-9_]+(?:\\([^)]*\\))?\\])|("(?:\\\\.|[^"\\\\])*")|(\\d+(?:\\.\\d+)?f?)|([A-Za-z_][A-Za-z0-9_]*)|(\\s+|[^\\s])/g;

            let tokens = [];
            let match;
            while ((match = tokenRegex.exec(raw)) !== null) {
                tokens.push(match[0]);
            }

            let out = "";
            for (let i = 0; i < tokens.length; i++) {
                const tok = tokens[i];
                if (tok.startsWith("//")) {
                    out += '<span class="r-cm">' + escapeHtml(tok) + '</span>';
                } else if (tok.startsWith("[") && tok.endsWith("]")) {
                    out += '<span class="r-attr">' + escapeHtml(tok) + '</span>';
                } else if (tok.startsWith('"') && tok.endsWith('"')) {
                    out += '<span class="r-str">' + escapeHtml(tok) + '</span>';
                } else if (/^\\d+(?:\\.\\d+)?f?$/.test(tok)) {
                    out += '<span class="r-num">' + tok + '</span>';
                } else if (keywords.has(tok)) {
                    out += '<span class="r-kw">' + tok + '</span>';
                } else if (types.has(tok)) {
                    out += '<span class="r-type">' + tok + '</span>';
                } else if (properties.has(tok)) {
                    out += '<span class="r-prop">' + tok + '</span>';
                } else if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(tok)) {
                    let nextTok = "";
                    for (let j = i + 1; j < tokens.length; j++) {
                        if (tokens[j].trim() !== "") {
                            nextTok = tokens[j];
                            break;
                        }
                    }
                    if (nextTok === "(" || nextTok === "<") {
                        out += '<span class="r-fn">' + tok + '</span>';
                    } else {
                        out += '<span class="r-var">' + tok + '</span>';
                    }
                } else {
                    out += escapeHtml(tok);
                }
            }
            return out;
        }

        function highlightAllCodeBlocks() {
            const preBlocks = document.querySelectorAll('#interactiveSlide pre');
            preBlocks.forEach(pre => {
                let container = pre.parentElement;
                if (container && !container.querySelector('.copy-btn')) {
                    container.style.position = 'relative';
                    const btn = document.createElement('button');
                    btn.className = 'copy-btn';
                    btn.textContent = 'Copy C#';
                    btn.onclick = function() { copyCode(this); };
                    container.appendChild(btn);
                }

                if (pre.getAttribute('data-highlighted') === 'true') return;
                const raw = pre.textContent;
                pre.setAttribute('data-raw-code', raw);
                pre.innerHTML = highlightCSharp(raw);
                pre.setAttribute('data-highlighted', 'true');
            });
        }

        function copyCode(btn) {
            const pre = btn.parentElement.querySelector('pre');
            if (!pre) return;
            const textToCopy = pre.getAttribute('data-raw-code') || pre.textContent;
            navigator.clipboard.writeText(textToCopy).then(() => {
                const orig = btn.innerText;
                btn.innerText = 'Copied!';
                btn.style.background = '#059669';
                btn.style.color = '#ffffff';
                setTimeout(() => {
                    btn.innerText = orig;
                    btn.style.background = '';
                    btn.style.color = '';
                }, 1800);
            });
        }

        // ==========================================
        // TECHNICAL GLOSSARY TOOLTIPS
        // ==========================================
        const GLOSSARY_TERMS = ${JSON.stringify(glossaryTerms, null, 2)};

        function enhanceGlossaryElements() {
            const area = document.getElementById("slideContentArea");
            if (!area) return;

            const candidates = area.querySelectorAll('strong, code:not(pre code), b, span.term-tip, [data-title]');
            candidates.forEach(el => {
                if (el.closest('pre') || el.closest('table.dense-table')) return;

                if (el.getAttribute('data-title')) {
                    el.classList.add('term-tip');
                    return;
                }

                const rawText = el.textContent.trim().toLowerCase();
                const cleanKey = rawText.replace(/[()]/g, '').replace(/[:."']/g, '').replace(/[\\[\\]]/g, '').trim();

                for (const key in GLOSSARY_TERMS) {
                    if (cleanKey === key || cleanKey === key + 's' || cleanKey.startsWith(key + ' ') || cleanKey.endsWith(' ' + key)) {
                        el.classList.add('term-tip');
                        el.setAttribute('data-glossary', key);
                        break;
                    }
                }
            });
        }

        function findGlossaryData(target) {
            const termEl = target.closest('.term-tip, [data-glossary], [data-title]');
            if (!termEl) return null;

            const title = termEl.getAttribute('data-title');
            const desc = termEl.getAttribute('data-desc');
            const diff = termEl.getAttribute('data-diff');
            if (title && desc) {
                return { title, desc, diff, el: termEl };
            }

            const glossKey = termEl.getAttribute('data-glossary');
            if (glossKey && GLOSSARY_TERMS[glossKey]) {
                return { ...GLOSSARY_TERMS[glossKey], el: termEl };
            }

            const rawText = termEl.textContent.trim().toLowerCase();
            const cleanKey = rawText.replace(/[()]/g, '').replace(/[:."']/g, '').replace(/[\\[\\]]/g, '').trim();
            for (const key in GLOSSARY_TERMS) {
                if (cleanKey === key || cleanKey === key + 's' || cleanKey.startsWith(key + ' ') || cleanKey.includes(key)) {
                    return { ...GLOSSARY_TERMS[key], el: termEl };
                }
            }

            return null;
        }

        (function initGlossaryTooltips() {
            let tipEl = document.getElementById('glossaryTooltip');
            if (!tipEl) {
                tipEl = document.createElement('div');
                tipEl.id = 'glossaryTooltip';
                tipEl.className = 'glossary-tooltip';
                tipEl.innerHTML = '<div class="tip-title" id="gtTitle"></div><div class="tip-body" id="gtDesc"></div><div class="tip-diff" id="gtDiff"></div>';
                document.body.appendChild(tipEl);
            }

            let activeEl = null;

            function showTip(data) {
                activeEl = data.el;
                document.getElementById('gtTitle').textContent = data.title || '';
                document.getElementById('gtDesc').textContent = data.desc || '';
                const diffEl = document.getElementById('gtDiff');
                if (data.diff) {
                    diffEl.innerHTML = data.diff;
                    diffEl.style.display = 'block';
                } else {
                    diffEl.style.display = 'none';
                }

                tipEl.style.display = 'block';
                tipEl.classList.add('visible');
                positionTip(data.el);
            }

            function hideTip() {
                activeEl = null;
                tipEl.classList.remove('visible');
                tipEl.style.top = '-9999px';
                tipEl.style.left = '-9999px';
            }

            function positionTip(targetEl) {
                if (!targetEl) return;
                const rect = targetEl.getBoundingClientRect();
                const tipRect = tipEl.getBoundingClientRect();

                let top = rect.top - tipRect.height - 10;
                let left = rect.left + (rect.width / 2) - (tipRect.width / 2);

                if (top < 12) top = rect.bottom + 10;
                if (left < 12) left = 12;
                if (left + tipRect.width > window.innerWidth - 12) {
                    left = window.innerWidth - tipRect.width - 12;
                }

                tipEl.style.top = top + 'px';
                tipEl.style.left = left + 'px';
            }

            document.addEventListener('mouseover', (e) => {
                const data = findGlossaryData(e.target);
                if (data) showTip(data);
                else hideTip();
            });

            document.addEventListener('mouseout', (e) => {
                const termEl = e.target.closest('.term-tip, [data-glossary], [data-title]');
                if (termEl && termEl === activeEl) hideTip();
            });
        })();

${simulatorJs}

        window.onload = init;
    </script>
</body>
</html>
`;

// Write to files
const outPath = path.resolve('presentation_basics3/presentation_unity6_basics3.html');
const indexPath = path.resolve('presentation_basics3/index.html');
const docsOutPath = path.resolve('docs/presentation_basics3/presentation_unity6_basics3.html');
const docsIndexPath = path.resolve('docs/presentation_basics3/index.html');

fs.writeFileSync(outPath, fullHtml, 'utf8');
fs.writeFileSync(indexPath, fullHtml, 'utf8');

if (fs.existsSync(path.resolve('docs/presentation_basics3'))) {
    fs.writeFileSync(docsOutPath, fullHtml, 'utf8');
    fs.writeFileSync(docsIndexPath, fullHtml, 'utf8');
}

console.log('Successfully generated:');
console.log(' - ' + outPath + ' (' + fs.statSync(outPath).size + ' bytes)');
console.log(' - ' + indexPath + ' (' + fs.statSync(indexPath).size + ' bytes)');
if (fs.existsSync(docsIndexPath)) {
    console.log(' - ' + docsOutPath + ' (' + fs.statSync(docsOutPath).size + ' bytes)');
    console.log(' - ' + docsIndexPath + ' (' + fs.statSync(docsIndexPath).size + ' bytes)');
}

module.exports = [
  {
    "isInverted": true,
    "title": "Part 1: Breaking Down Mechanics & The Sandbox Scene",
    "subtitle": "Decompose 3D Mechanics and Test in an Isolated Dev Scene",
    "origImg": "",
    "notes": "Section 1: How to build features safely by breaking them into 4 clear steps and testing them in an isolated sandbox scene.",
    "topics": [
      "The Isolated Sandbox Scene",
      "The 4 Mechanic Steps",
      "SphereCast for Generous Aiming",
      "Drawing Live Scene Gizmos"
    ],
    "content": `
    <div class="content-stack">
        <div class="content-card primary">
            <div class="card-title primary">Decompose and Isolate</div>
            <div class="card-body">
                Build your gameplay in an isolated test scene and break every mechanic into four clean, testable steps.
            </div>
        </div>
    </div>
    `
  },
  {
    "title": "Never Prototype in Main_Level.unity: The Sandbox Scene",
    "origImg": "",
    "notes": "The Sandbox Scene: Explain to students why prototyping in the main production level destroys team momentum. Git merge conflicts on binary scene files are nearly impossible to resolve. Always create your own dev scene.",
    "content": `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card danger">
                <div class="card-title danger">Why Main_Level.unity Breaks Teams</div>
                <div class="card-body">
                    <ul style="padding-left: 18px; margin: 0; line-height: 1.45; font-weight: 600;">
                        <li>15 people saving the same .unity scene causes Git merge conflicts.</li>
                        <li>500 decorative meshes make Play Mode painfully slow.</li>
                        <li>Level designers moving platforms breaks your test setup mid-sprint.</li>
                    </ul>
                </div>
            </div>

            <div class="content-card success" style="margin-top: 6px;">
                <div class="card-title success">The Solution: Your Dev Sandbox</div>
                <div class="card-body">
                    <div class="punchy-point"><span class="punchy-tag" style="background:#0284c7; color:#ffffff;">PATH</span> <code>Assets/Scenes/Dev/_Sandbox_[Name].unity</code></div>
                    <div class="punchy-point"><span class="punchy-tag" style="background:#059669; color:#ffffff;">SETUP</span> 1 ground plane, 1 player capsule, 3 dummy cubes.</div>
                    <div class="punchy-point"><span class="punchy-tag" style="background:#7c3aed; color:#ffffff;">GIT SAFE</span> Dedicated dev scene; 0 merge conflicts with teammates.</div>
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="content-card primary">
                <div class="card-title primary">Sandbox vs. Main Level Comparison</div>
                <div class="card-body">
                    <table class="dense-table" style="width: 100%; margin-top: 4px; border-collapse: separate; border-spacing: 0 5px;">
                        <thead>
                            <tr>
                                <th style="font-weight: 700; color: #0f172a; padding: 6px 10px;">Metric</th>
                                <th style="background: #fee2e2; color: #991b1b !important; font-weight: 800; padding: 6px 10px; border-radius: 4px 0 0 4px;">Main Level</th>
                                <th style="background: #dcfce7; color: #166534 !important; font-weight: 800; padding: 6px 10px; border-radius: 0 4px 4px 0;">Dev Sandbox</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="font-weight: 600; padding: 6px 10px;"><strong>Load Time</strong></td>
                                <td style="background: #fef2f2; color: #991b1b !important; font-weight: 700; padding: 6px 10px; border-bottom: 1px solid #fee2e2;">45-60 sec</td>
                                <td style="background: #f0fdf4; color: #166534 !important; font-weight: 700; padding: 6px 10px; border-bottom: 1px solid #dcfce7;">&lt; 2 sec</td>
                            </tr>
                            <tr>
                                <td style="font-weight: 600; padding: 6px 10px;"><strong>Git Conflicts</strong></td>
                                <td style="background: #fef2f2; color: #991b1b !important; font-weight: 700; padding: 6px 10px; border-bottom: 1px solid #fee2e2;">High (15 devs on 1 file)</td>
                                <td style="background: #f0fdf4; color: #166534 !important; font-weight: 700; padding: 6px 10px; border-bottom: 1px solid #dcfce7;">0 conflicts (isolated scene)</td>
                            </tr>
                            <tr>
                                <td style="font-weight: 600; padding: 6px 10px;"><strong>Lighting Rebuilds</strong></td>
                                <td style="background: #fef2f2; color: #991b1b !important; font-weight: 700; padding: 6px 10px; border-bottom: 1px solid #fee2e2;">Long baking delays &amp; frame drops</td>
                                <td style="background: #f0fdf4; color: #166534 !important; font-weight: 700; padding: 6px 10px; border-bottom: 1px solid #dcfce7;">Instant realtime lighting</td>
                            </tr>
                            <tr>
                                <td style="font-weight: 600; padding: 6px 10px;"><strong>Designer Disruption</strong></td>
                                <td style="background: #fef2f2; color: #991b1b !important; font-weight: 700; padding: 6px 10px; border-bottom: 1px solid #fee2e2;">Blocks teammates during tests</td>
                                <td style="background: #f0fdf4; color: #166534 !important; font-weight: 700; padding: 6px 10px; border-bottom: 1px solid #dcfce7;">0 disruption to teammates</td>
                            </tr>
                            <tr>
                                <td style="font-weight: 600; padding: 6px 10px;"><strong>Scene Clutter</strong></td>
                                <td style="background: #fef2f2; color: #991b1b !important; font-weight: 700; padding: 6px 10px; border-bottom: 1px solid #fee2e2;">Heavy meshes, audio, VFX</td>
                                <td style="background: #f0fdf4; color: #166534 !important; font-weight: 700; padding: 6px 10px; border-bottom: 1px solid #dcfce7;">1 plane, 3 cubes</td>
                            </tr>
                            <tr>
                                <td style="font-weight: 600; padding: 6px 10px;"><strong>Iteration Loop</strong></td>
                                <td style="background: #fef2f2; color: #991b1b !important; font-weight: 700; padding: 6px 10px; border-bottom: 1px solid #fee2e2;">Walk 2 min each test</td>
                                <td style="background: #f0fdf4; color: #166534 !important; font-weight: 700; padding: 6px 10px; border-bottom: 1px solid #dcfce7;">Instant 3-sec test</td>
                            </tr>
                        </tbody>
                    </table>
                    <div style="margin-top: 10px; font-size: 0.74rem; color: #475569; line-height: 1.45;">
                        <strong style="color: #166534;">Dev Rule:</strong> Build and tune all mechanics in <code>_Sandbox_[Name].unity</code> before converting to a prefab for the team staging scene.
                    </div>
                </div>
            </div>
        </div>
    </div>

    <details class="slide-accordion tier-accordion">
        <summary class="accordion-header">
            <span>[Git Hygiene] Managing Dev Scenes in Team Repositories</span>
            <span class="accordion-expand">Expand</span>
        </summary>
        <div class="accordion-body">
            Place all test scenes in an <code>Assets/Scenes/Dev/</code> folder. When multiple programmers build features in their own personal sandboxes, nobody blocks each other. Once a mechanic works completely, turn the GameObject into a prefab and drop that prefab into the team's shared staging scene.
        </div>
    </details>

    <div class="lab-deep-dive">
        <div class="lab-deep-dive-header">
            <div class="lab-deep-dive-title">
                <span>LAB MODE STUDY GUIDE: SANDBOX SCENE SPECIFICATION</span>
            </div>
            <span class="lab-deep-dive-badge">WORKFLOW BEST PRACTICE</span>
        </div>
        <div class="lab-mental-model">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model: The Clean Workbench</div>
            Before assembling a complex watch, a watchmaker clears their desk completely. Your sandbox scene is a clean workbench with no distractions and no risk of breaking teammates' work.
        </div>
        <div class="lab-grid-2col">
            <div class="lab-box-neutral">
                <strong>Sandbox Requirements:</strong><br>
                A simple 20m x 20m floor plane, standard directional lighting, and 3 dummy targets placed at test distances.
            </div>
            <div class="lab-box-neutral">
                <strong>Prefab Integration:</strong><br>
                Iterate on your mechanic script on a test prefab in the sandbox. When verified, apply prefab changes to update all instances.
            </div>
        </div>
        <div class="lab-box-trap">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">The Trap: Testing in Production Scenes</div>
            Testing jump physics in the art-heavy castle scene. When lighting rebuilds or an artist updates an FBX model, your test is ruined.
        </div>
        <div class="lab-box-rule">
            <strong>The Rule:</strong> Never prototype mechanics in shared team scenes. Always work in your personal sandbox first.
        </div>
    </div>
    `
  },
  {
    "title": "Every 3D Mechanic Is 4 Simple Steps",
    "origImg": "",
    "notes": "Mechanic Steps: Walk through the 4 steps. Every mechanic in games, from a simple jump to a complex grappling hook, breaks down into these exact 4 steps.",
    "content": `
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 8px; width: 100%;">
        <div style="background: rgba(2, 132, 199, 0.12); border: 1.5px solid #0284c7; border-radius: 6px; padding: 6px 8px; display: flex; flex-direction: column; gap: 2px;">
            <div style="font-size: 0.70rem; font-weight: 800; color: #0369a1;">1. INPUT</div>
            <div style="font-size: 0.63rem; color: #0f172a; font-weight: 600; line-height: 1.25;">Button + cooldown check</div>
            <div style="background: #0b0f19; padding: 2px 5px; border-radius: 3px; font-family: monospace; font-size: 0.58rem; color: #7dd3fc; margin-top: auto;">wasPressedThisFrame</div>
        </div>
        <div style="background: rgba(5, 150, 105, 0.12); border: 1.5px solid #059669; border-radius: 6px; padding: 6px 8px; display: flex; flex-direction: column; gap: 2px;">
            <div style="font-size: 0.70rem; font-weight: 800; color: #166534;">2. 3D CHECK</div>
            <div style="font-size: 0.63rem; color: #0f172a; font-weight: 600; line-height: 1.25;">Raycast, SphereCast, dot</div>
            <div style="background: #0b0f19; padding: 2px 5px; border-radius: 3px; font-family: monospace; font-size: 0.58rem; color: #6ee7b7; margin-top: auto;">Physics.SphereCast(...)</div>
        </div>
        <div style="background: rgba(217, 119, 6, 0.12); border: 1.5px solid #d97706; border-radius: 6px; padding: 6px 8px; display: flex; flex-direction: column; gap: 2px;">
            <div style="font-size: 0.70rem; font-weight: 800; color: #92400e;">3. MOVE / STATE</div>
            <div style="font-size: 0.63rem; color: #0f172a; font-weight: 600; line-height: 1.25;">Translate or change state</div>
            <div style="background: #0b0f19; padding: 2px 5px; border-radius: 3px; font-family: monospace; font-size: 0.58rem; color: #fde047; margin-top: auto;">StartCoroutine(Pull(...))</div>
        </div>
        <div style="background: rgba(124, 58, 237, 0.12); border: 1.5px solid #7c3aed; border-radius: 6px; padding: 6px 8px; display: flex; flex-direction: column; gap: 2px;">
            <div style="font-size: 0.70rem; font-weight: 800; color: #6b21a8;">4. FEEDBACK</div>
            <div style="font-size: 0.63rem; color: #0f172a; font-weight: 600; line-height: 1.25;">Decoupled sound &amp; VFX</div>
            <div style="background: #0b0f19; padding: 2px 5px; border-radius: 3px; font-family: monospace; font-size: 0.58rem; color: #d8b4fe; margin-top: auto;">onFired?.Invoke()</div>
        </div>
    </div>

    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title primary">The 4-Step Pipeline</div>
                <div class="card-body">
                    <div class="punchy-point"><span class="punchy-tag" style="background:#0284c7; color:#ffffff;">1. INPUT</span> Button pressed and cooldown ready?</div>
                    <div class="punchy-point"><span class="punchy-tag" style="background:#059669; color:#ffffff;">2. 3D CHECK</span> Raycast, SphereCast, or angle check.</div>
                    <div class="punchy-point"><span class="punchy-tag" style="background:#d97706; color:#ffffff;">3. MOVE / STATE</span> Move player or change state over time.</div>
                    <div class="punchy-point"><span class="punchy-tag" style="background:#7c3aed; color:#ffffff;">4. FEEDBACK</span> Fire event for sound, VFX, and UI.</div>
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="media-panel-card" style="padding: 10px; gap: 6px;">
                <div style="font-weight: 800; color: #0369a1; text-transform: uppercase; width: 100%; font-size: 0.75rem;">
                    MECHANIC EXAMPLES MAPPED TO 4 STEPS
                </div>
                <table class="dense-table" style="width: 100%;">
                    <thead>
                        <tr>
                            <th>Mechanic</th>
                            <th>2. 3D Check</th>
                            <th>3. Move / State</th>
                            <th>4. Feedback</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Grapple</strong></td>
                            <td>SphereCast to ring</td>
                            <td>Move towards point</td>
                            <td>Rope line + sound</td>
                        </tr>
                        <tr>
                            <td><strong>Dash</strong></td>
                            <td>Cone check for target</td>
                            <td>Speed boost curve</td>
                            <td>Trail VFX + whoosh</td>
                        </tr>
                        <tr>
                            <td><strong>Ground-Pound</strong></td>
                            <td>Down ray to floor</td>
                            <td>Freeze then plunge</td>
                            <td>Dust ring + screen shake</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <details class="slide-accordion tier-accordion">
        <summary class="accordion-header">
            <span>[Architecture] Why Separating Steps Saves Time</span>
            <span class="accordion-expand">Expand</span>
        </summary>
        <div class="accordion-body">
            When these four steps are kept separate, audio and VFX artists can hook up sounds and particle effects without touching your movement code. If a designer wants to change dash distance, you only edit step 3 without risking input or raycast bugs.
        </div>
    </details>

    <div class="lab-deep-dive">
        <div class="lab-deep-dive-header">
            <div class="lab-deep-dive-title">
                <span>LAB MODE STUDY GUIDE: THE 4-STEP MECHANIC PIPELINE</span>
            </div>
            <span class="lab-deep-dive-badge">ARCHITECTURE</span>
        </div>
        <div class="lab-mental-model">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model: The Assembly Line</div>
            Input starts the action, the 3D check finds valid targets, movement math handles motion, and feedback triggers audio and particles.
        </div>
        <div class="lab-grid-2col">
            <div class="lab-box-neutral">
                <strong>Clean Separation:</strong><br>
                Keep physics checks and movement math independent so each can be tested and tuned on its own.
            </div>
            <div class="lab-box-neutral">
                <strong>Easy Team Integration:</strong><br>
                Audio and particle hooks use Unity events, allowing teammates to add polish without modifying scripts.
            </div>
        </div>
        <div class="lab-box-trap">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">The Trap: The 100-Line Update() Method</div>
            Writing input checks, raycasts, position updates, and audio calls in one single giant function makes bugs hard to isolate.
        </div>
        <div class="lab-box-rule">
            <strong>The Rule:</strong> Break every mechanic into these 4 steps before writing code.
        </div>
    </div>
    `
  },
  {
    "title": "Example: 3D Grappling Hook in 4 Steps",
    "origImg": "",
    "notes": "Grapple Example: Show how clean the code is when the 4 steps are clearly structured. Input triggers the method, SphereCast queries the world, coroutine pulls the character, and an event fires feedback.",
    "content": `
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 8px; width: 100%;">
        <div style="background: rgba(2, 132, 199, 0.12); border: 1.5px solid #0284c7; border-radius: 6px; padding: 6px 8px; display: flex; flex-direction: column; gap: 2px;">
            <div style="font-size: 0.70rem; font-weight: 800; color: #0369a1;">1. INPUT</div>
            <div style="font-size: 0.63rem; color: #0f172a; font-weight: 600; line-height: 1.25;">eKey &amp; !_isGrappling</div>
            <div style="background: #0b0f19; padding: 2px 5px; border-radius: 3px; font-family: monospace; font-size: 0.58rem; color: #7dd3fc; margin-top: auto;">wasPressedThisFrame</div>
        </div>
        <div style="background: rgba(5, 150, 105, 0.12); border: 1.5px solid #059669; border-radius: 6px; padding: 6px 8px; display: flex; flex-direction: column; gap: 2px;">
            <div style="font-size: 0.70rem; font-weight: 800; color: #166534;">2. 3D CHECK</div>
            <div style="font-size: 0.63rem; color: #0f172a; font-weight: 600; line-height: 1.25;">0.4m radius SphereCast</div>
            <div style="background: #0b0f19; padding: 2px 5px; border-radius: 3px; font-family: monospace; font-size: 0.58rem; color: #6ee7b7; margin-top: auto;">SphereCast(origin, 0.4f, ...)</div>
        </div>
        <div style="background: rgba(217, 119, 6, 0.12); border: 1.5px solid #d97706; border-radius: 6px; padding: 6px 8px; display: flex; flex-direction: column; gap: 2px;">
            <div style="font-size: 0.70rem; font-weight: 800; color: #92400e;">3. MOVE / STATE</div>
            <div style="font-size: 0.63rem; color: #0f172a; font-weight: 600; line-height: 1.25;">Pull coroutine translation</div>
            <div style="background: #0b0f19; padding: 2px 5px; border-radius: 3px; font-family: monospace; font-size: 0.58rem; color: #fde047; margin-top: auto;">StartCoroutine(PullRoutine)</div>
        </div>
        <div style="background: rgba(124, 58, 237, 0.12); border: 1.5px solid #7c3aed; border-radius: 6px; padding: 6px 8px; display: flex; flex-direction: column; gap: 2px;">
            <div style="font-size: 0.70rem; font-weight: 800; color: #6b21a8;">4. FEEDBACK</div>
            <div style="font-size: 0.63rem; color: #0f172a; font-weight: 600; line-height: 1.25;">Audio &amp; rope VFX event</div>
            <div style="background: #0b0f19; padding: 2px 5px; border-radius: 3px; font-family: monospace; font-size: 0.58rem; color: #d8b4fe; margin-top: auto;">onGrappleFired?.Invoke()</div>
        </div>
    </div>

    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title primary">4 Steps in GrappleHook.cs</div>
                <div class="card-body">
                    <ul style="padding-left: 18px; margin: 0; line-height: 1.5; font-weight: 600;">
                        <li><strong>1. Input:</strong> checks if E was pressed and player is not grappling.</li>
                        <li><strong>2. 3D Check:</strong> SphereCast sweeps 0.4m radius forward.</li>
                        <li><strong>3. Move:</strong> coroutine moves player toward hit point.</li>
                        <li><strong>4. Feedback:</strong> UnityEvent fires rope line and sound.</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="code-box">
                <div class="jb-editor-header">
                    <div class="jb-editor-tab">
                        <span class="jb-csharp-icon">C#</span>
                        <span class="jb-filename">GrappleHook.cs</span>
                    </div>
                    <button class="code-copy-btn" onclick="copyCode(this)">Copy</button>
                </div>
                <pre><code><span class="jb-keyword">public</span> <span class="jb-keyword">class</span> <span class="jb-type">GrappleHook</span> : <span class="jb-type">MonoBehaviour</span> {
    <span class="jb-attr">[SerializeField]</span> <span class="jb-keyword">private</span> <span class="jb-type">float</span> <span class="jb-plain">radius</span> = <span class="jb-number">0.4f</span>, <span class="jb-plain">maxDist</span> = <span class="jb-number">25f</span>, <span class="jb-plain">pullSpeed</span> = <span class="jb-number">18f</span>;
    <span class="jb-attr">[SerializeField]</span> <span class="jb-keyword">private</span> <span class="jb-type">LayerMask</span> <span class="jb-plain">grappleMask</span>;
    <span class="jb-attr">[SerializeField]</span> <span class="jb-keyword">private</span> <span class="jb-type">UnityEvent</span> <span class="jb-plain">onGrappleFired</span>;
    <span class="jb-keyword">private</span> <span class="jb-type">bool</span> <span class="jb-plain">_isGrappling</span>;

    <span class="jb-keyword">void</span> <span class="jb-method">Update</span>() {
        <span class="jb-comment">// 1. Input</span>
        <span class="jb-keyword">if</span> (<span class="jb-type">Keyboard</span>.<span class="jb-plain">current</span>.<span class="jb-plain">eKey</span>.<span class="jb-plain">wasPressedThisFrame</span> &amp;&amp; !<span class="jb-plain">_isGrappling</span>) {
            <span class="jb-comment">// 2. 3D Check</span>
            <span class="jb-keyword">if</span> (<span class="jb-type">Physics</span>.<span class="jb-method">SphereCast</span>(<span class="jb-plain">transform</span>.<span class="jb-plain">position</span>, <span class="jb-plain">radius</span>, <span class="jb-plain">transform</span>.<span class="jb-plain">forward</span>,
                <span class="jb-keyword">out</span> <span class="jb-type">RaycastHit</span> <span class="jb-plain">hit</span>, <span class="jb-plain">maxDist</span>, <span class="jb-plain">grappleMask</span>, <span class="jb-type">QueryTriggerInteraction</span>.<span class="jb-plain">Ignore</span>)) {
                <span class="jb-comment">// 3. Move</span>
                <span class="jb-method">StartCoroutine</span>(<span class="jb-method">PullRoutine</span>(<span class="jb-plain">hit</span>.<span class="jb-plain">point</span>));
                <span class="jb-comment">// 4. Feedback</span>
                <span class="jb-plain">onGrappleFired</span>?.<span class="jb-method">Invoke</span>();
            }
        }
    }

    <span class="jb-keyword">private</span> <span class="jb-type">IEnumerator</span> <span class="jb-method">PullRoutine</span>(<span class="jb-type">Vector3</span> <span class="jb-plain">target</span>) {
        <span class="jb-plain">_isGrappling</span> = <span class="jb-keyword">true</span>;
        <span class="jb-keyword">while</span> (<span class="jb-type">Vector3</span>.<span class="jb-method">Distance</span>(<span class="jb-plain">transform</span>.<span class="jb-plain">position</span>, <span class="jb-plain">target</span>) &gt; <span class="jb-number">1.2f</span>) {
            <span class="jb-plain">transform</span>.<span class="jb-plain">position</span> = <span class="jb-type">Vector3</span>.<span class="jb-method">MoveTowards</span>(
                <span class="jb-plain">transform</span>.<span class="jb-plain">position</span>, <span class="jb-plain">target</span>, <span class="jb-plain">pullSpeed</span> * <span class="jb-type">Time</span>.<span class="jb-plain">deltaTime</span>);
            <span class="jb-keyword">yield</span> <span class="jb-keyword">return</span> <span class="jb-keyword">null</span>;
        }
        <span class="jb-plain">_isGrappling</span> = <span class="jb-keyword">false</span>;
    }
}</code></pre>
            </div>
        </div>
    </div>

    <details class="slide-accordion tier-accordion">
        <summary class="accordion-header">
            <span>[Coroutine Mechanics] Why Coroutines for Motion?</span>
            <span class="accordion-expand">Expand</span>
        </summary>
        <div class="accordion-body">
            Coroutines allow state-driven movements over time without cluttering your <code>Update()</code> loop with boolean flags and timer counters. When the distance threshold is reached, the loop exits naturally and resets the state flag.
        </div>
    </details>

    <div class="lab-deep-dive">
        <div class="lab-deep-dive-header">
            <div class="lab-deep-dive-title">
                <span>LAB MODE STUDY GUIDE: 4-STEP GRAPPLE PATTERN</span>
            </div>
            <span class="lab-deep-dive-badge">CODE WALKTHROUGH</span>
        </div>
        <div class="lab-mental-model">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model: Linear Execution</div>
            Each frame has one responsibility: verify input condition, test the world geometry, begin the movement state, and trigger decoupled events.
        </div>
        <div class="lab-grid-2col">
            <div class="lab-box-neutral">
                <strong>State Guard:</strong><br>
                The boolean <code>_isGrappling</code> prevents re-triggering the grapple while the player is already moving.
            </div>
            <div class="lab-box-neutral">
                <strong>Event Decoupling:</strong><br>
                Using <code>UnityEvent</code> or ScriptableObject events allows sound and line renderers to respond without direct references.
            </div>
        </div>
        <div class="lab-box-trap">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">The Trap: Direct AudioSource Calls in Movement Logic</div>
            Writing <code>audioSource.PlayOneShot(sound)</code> directly inside your physics movement script couples code and breaks if audio components change.
        </div>
        <div class="lab-box-rule">
            <strong>The Rule:</strong> Always fire feedback events so artists can tune visuals without modifying physics code.
        </div>
    </div>
    `
  },
  {
    "title": "Raycast vs. SphereCast: Forgiving Player Aim",
    "origImg": "",
    "notes": "SphereCast vs Raycast: Explain why 1-pixel raycasts feel terrible in fast 3D games. Players think they are aiming at a hook, but miss by 2 pixels. A SphereCast sweeps a 3D sphere to create a generous cylinder.",
    "content": `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title primary">Why 1-Pixel Raycasts Miss</div>
                <div class="card-body">
                    <ul style="padding-left: 18px; margin: 0; line-height: 1.45; font-weight: 600;">
                        <li><code>Physics.Raycast</code> is infinitely thin: 1 single pixel.</li>
                        <li>Hitting a 0.5m ring during combat requires pinpoint accuracy.</li>
                        <li>Players feel cheated when their crosshair is slightly off.</li>
                        <li><code>SphereCast</code> sweeps a thick 0.4m cylinder forward.</li>
                    </ul>
                </div>
            </div>

            <div class="standalone-img-card borderless" style="margin-top: 6px;">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 4px;">
                    <div class="img-title" style="margin-bottom: 0;">
                        3D SPHERECAST VS RAYCAST VISUALIZATION
                    </div>
                    <a href="https://www.youtube.com/watch?v=fJyi7l2tWKo" target="_blank" rel="noopener noreferrer" style="font-size: 0.65rem; font-weight: 700; color: #b91c1c; text-decoration: none; display: inline-flex; align-items: center; gap: 3px; background: #fee2e2; padding: 2px 7px; border-radius: 4px; border: 1px solid #fecaca;">
                        Watch on YouTube
                    </a>
                </div>
                <a href="https://www.youtube.com/watch?v=fJyi7l2tWKo" target="_blank" rel="noopener noreferrer" class="img-frame" style="position: relative; width: 100%; flex: 1 1 auto; overflow: hidden; display: flex; align-items: center; justify-content: center; cursor: pointer; border-radius: 6px; text-decoration: none;">
                    <img src="assets/unity_spherecast_raycast.jpg" alt="Unity 3D SphereCast Swept Cylinder vs Thin Raycast (LlamAcademy)" />
                    <div style="position: absolute; display: flex; align-items: center; gap: 6px; background: rgba(15, 23, 42, 0.85); color: #ffffff; padding: 5px 12px; border-radius: 20px; font-size: 0.68rem; font-weight: 700; border: 1px solid rgba(255,255,255,0.25); pointer-events: none; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
                        <span style="color: #ef4444; font-size: 0.85rem;">▶</span> Watch video on YouTube (opens in new tab)
                    </div>
                </a>
            </div>
        </div>

        <div class="right-column">
            <div class="code-box">
                <div class="jb-editor-header">
                    <div class="jb-editor-tab">
                        <span class="jb-csharp-icon">C#</span>
                        <span class="jb-filename">RaycastVsSphereCast.cs</span>
                    </div>
                    <button class="code-copy-btn" onclick="copyCode(this)">Copy</button>
                </div>
                <pre><code><span class="jb-comment">// 1. Raycast: 1-pixel ray (hard to hit in fast combat)</span>
<span class="jb-keyword">bool</span> <span class="jb-plain">hitRay</span> = <span class="jb-type">Physics</span>.<span class="jb-method">Raycast</span>(
    <span class="jb-plain">origin</span>, <span class="jb-plain">dir</span>, <span class="jb-keyword">out</span> <span class="jb-type">RaycastHit</span> <span class="jb-plain">rayHit</span>, <span class="jb-plain">maxDist</span>, <span class="jb-plain">mask</span>);

<span class="jb-comment">// 2. SphereCast: 0.4m swept cylinder (generous aim)</span>
<span class="jb-keyword">bool</span> <span class="jb-plain">hitSphere</span> = <span class="jb-type">Physics</span>.<span class="jb-method">SphereCast</span>(
    <span class="jb-plain">origin</span>, <span class="jb-number">0.4f</span>, <span class="jb-plain">dir</span>, <span class="jb-keyword">out</span> <span class="jb-type">RaycastHit</span> <span class="jb-plain">sphereHit</span>, 
    <span class="jb-plain">maxDist</span>, <span class="jb-plain">mask</span>, <span class="jb-type">QueryTriggerInteraction</span>.<span class="jb-plain">Ignore</span>);</code></pre>
            </div>
            <div class="media-panel-card" style="padding: 8px; gap: 4px; margin-top: 6px;">
                <table class="dense-table" style="width: 100%;">
                    <thead>
                        <tr>
                            <th>Property</th>
                            <th>Physics.Raycast</th>
                            <th>Physics.SphereCast</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Geometry</strong></td>
                            <td>Infinitely thin line (0m)</td>
                            <td>Swept sphere (0.4m radius)</td>
                        </tr>
                        <tr>
                            <td><strong>Player Feel</strong></td>
                            <td>Frustrating on small targets</td>
                            <td>Forgiving, snappy hits</td>
                        </tr>
                        <tr>
                            <td><strong>Trigger Guard</strong></td>
                            <td>Optional parameter</td>
                            <td>Always pass <code>Ignore</code> triggers</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <details class="slide-accordion tier-accordion">
        <summary class="accordion-header">
            <span>[Physics Mechanics] How SphereCast Evaluates Collisions</span>
            <span class="accordion-expand">Expand</span>
        </summary>
        <div class="accordion-body">
            <code>Physics.SphereCast</code> does not place a sphere at the end of the line: it sweeps a sphere from the origin along the direction vector. <code>hit.point</code> gives the exact surface impact point on the swept sphere, and <code>hit.normal</code> returns the perpendicular surface angle.
        </div>
    </details>

    <div class="lab-deep-dive">
        <div class="lab-deep-dive-header">
            <div class="lab-deep-dive-title">
                <span>LAB MODE STUDY GUIDE: SPHERECAST CALIBRATION</span>
            </div>
            <span class="lab-deep-dive-badge">SPATIAL QUERY SPEC</span>
        </div>
        <div class="lab-mental-model">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model: Forgiveness Cylinder</div>
            Good action games give players invisible assistance. Sweeping a 0.3m to 0.5m sphere matches what the player expects to hit without feeling clumsy.
        </div>
        <div class="lab-grid-2col">
            <div class="lab-box-neutral">
                <strong>Radius Calibration:</strong><br>
                0.2m for precision darts and arrows, 0.4m for grappling hooks and dashes, 0.8m for heavy hammer strikes.
            </div>
            <div class="lab-box-neutral">
                <strong>Self-Intersection Trap:</strong><br>
                Never start the cast inside the player collider. Offset origin forward by <code>0.5f</code> to avoid hitting yourself.
            </div>
        </div>
        <div class="lab-box-trap">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">The Trap: Omitting QueryTriggerInteraction</div>
            Leaving out <code>QueryTriggerInteraction.Ignore</code>. If an invisible ambient sound trigger sits between the player and the wall, your grapple hits the empty air!
        </div>
        <div class="lab-box-rule">
            <strong>The Rule:</strong> Always pass <code>QueryTriggerInteraction.Ignore</code> so invisible triggers do not block player actions.
        </div>
    </div>
    `
  },
  {
    "title": "Aim Cones with Vector3.Dot",
    "origImg": "",
    "notes": "Aim Cones: Teach students how Vector3.Dot lets them filter targets in front of the player without using expensive trigonometry functions. Cosine of 30 degrees is 0.866.",
    "content": `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title primary">Fast Angle Checks: Vector3.Dot</div>
                <div class="card-body">
                    <ul style="padding-left: 18px; margin: 0; line-height: 1.45; font-weight: 600;">
                        <li><code>Vector3.Dot</code> compares two normalized directions.</li>
                        <li>Returns <code>1.0</code> for dead-center, <code>0.0</code> for 90 degrees.</li>
                        <li><code>dot &gt; 0.866f</code> means target is inside a 30° cone.</li>
                    </ul>
                </div>
            </div>

            <div class="standalone-img-card borderless" style="margin-top: 6px;">
                <div class="img-title">UNITY MANUAL: VECTOR3.DOT FORMULA</div>
                <div class="img-frame">
                    <img src="assets/unity_dot_product.png" alt="Unity Manual Dot Product Formula" />
                </div>
            </div>

            <div class="standalone-img-card borderless" style="margin-top: 6px;">
                <div class="img-title">UNITY MANUAL: COSINE VALUES TABLE</div>
                <div class="img-frame">
                    <img src="assets/unity_cosine_values.png" alt="Unity Manual Cosine Angle Values" />
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="code-box">
                <div class="jb-editor-header">
                    <div class="jb-editor-tab">
                        <span class="jb-csharp-icon">C#</span>
                        <span class="jb-filename">AimConeScanner.cs</span>
                    </div>
                    <button class="code-copy-btn" onclick="copyCode(this)">Copy</button>
                </div>
                <pre><code><span class="jb-keyword">public</span> <span class="jb-type">Transform</span> <span class="jb-method">FindTargetInCone</span>(<span class="jb-type">Transform</span> <span class="jb-plain">cam</span>, <span class="jb-type">float</span> <span class="jb-plain">range</span>, <span class="jb-type">LayerMask</span> <span class="jb-plain">mask</span>) {
    <span class="jb-type">Collider</span>[] <span class="jb-plain">hits</span> = <span class="jb-type">Physics</span>.<span class="jb-method">OverlapSphere</span>(<span class="jb-plain">cam</span>.<span class="jb-plain">position</span>, <span class="jb-plain">range</span>, <span class="jb-plain">mask</span>);
    <span class="jb-type">Transform</span> <span class="jb-plain">bestTarget</span> = <span class="jb-keyword">null</span>;
    <span class="jb-type">float</span> <span class="jb-plain">bestDot</span> = <span class="jb-number">0.866f</span>; <span class="jb-comment">// 30 degree cone threshold</span>

    <span class="jb-keyword">foreach</span> (<span class="jb-keyword">var</span> <span class="jb-plain">col</span> <span class="jb-keyword">in</span> <span class="jb-plain">hits</span>) {
        <span class="jb-type">Vector3</span> <span class="jb-plain">dirToTarget</span> = (<span class="jb-plain">col</span>.<span class="jb-plain">transform</span>.<span class="jb-plain">position</span> - <span class="jb-plain">cam</span>.<span class="jb-plain">position</span>).<span class="jb-plain">normalized</span>;
        <span class="jb-type">float</span> <span class="jb-plain">dot</span> = <span class="jb-type">Vector3</span>.<span class="jb-method">Dot</span>(<span class="jb-plain">cam</span>.<span class="jb-plain">forward</span>, <span class="jb-plain">dirToTarget</span>);

        <span class="jb-keyword">if</span> (<span class="jb-plain">dot</span> &gt; <span class="jb-plain">bestDot</span>) {
            <span class="jb-plain">bestDot</span> = <span class="jb-plain">dot</span>;
            <span class="jb-plain">bestTarget</span> = <span class="jb-plain">col</span>.<span class="jb-plain">transform</span>;
        }
    }
    <span class="jb-keyword">return</span> <span class="jb-plain">bestTarget</span>;
}</code></pre>
            </div>
        </div>
    </div>

    <details class="slide-accordion tier-accordion">
        <summary class="accordion-header">
            <span>[Math Reference] Cosine Values for Common Angles</span>
            <span class="accordion-expand">Expand</span>
        </summary>
        <div class="accordion-body">
            <code>Mathf.Cos(angle * Mathf.Deg2Rad)</code> gives threshold values: 0 degrees is <code>1.00</code>, 30 degrees is <code>0.866</code>, 45 degrees is <code>0.707</code>, and 60 degrees is <code>0.500</code>. Comparing dot products against these values is fast and requires no trigonometry at runtime.
        </div>
    </details>

    <div class="lab-deep-dive">
        <div class="lab-deep-dive-header">
            <div class="lab-deep-dive-title">
                <span>LAB MODE STUDY GUIDE: AIM CONE MATH</span>
            </div>
            <span class="lab-deep-dive-badge">GEOMETRY SPEC</span>
        </div>
        <div class="lab-mental-model">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model: The Flashlight Beam</div>
            Think of an aim cone like a flashlight beam projecting forward. Objects inside the beam return dot values above your threshold.
        </div>
        <div class="lab-grid-2col">
            <div class="lab-box-neutral">
                <strong>Normalize Vectors:</strong><br>
                Always ensure the direction to the target is normalized. If a vector has length 10, the dot product will be 10x too large.
            </div>
            <div class="lab-box-neutral">
                <strong>Performance Advantage:</strong><br>
                <code>Vector3.Dot</code> takes 3 multiplies and 2 adds, making it hundreds of times faster than <code>Vector3.Angle</code>.
            </div>
        </div>
        <div class="lab-box-trap">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">The Trap: Forgetting .normalized</div>
            Writing <code>target.position - cam.position</code> without <code>.normalized</code>. The distance multiplies the result and ruins your threshold check.
        </div>
        <div class="lab-box-rule">
            <strong>The Rule:</strong> Both vectors in a dot product must be normalized unit vectors.
        </div>
    </div>
    `
  },
  {
    "title": "Let AI Explain the Function, You Pick the Approach",
    "origImg": "",
    "notes": "Explain & Compare: Don't spend time digging through old documentation. Ask your agent to explain functions, list the trade-offs, and clarify parameters so you can pick the cleanest option for your game.",
    "content": `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title primary">Ask for Trade-Offs, Not Syntax</div>
                <div class="card-body">
                    <ul style="padding-left: 18px; margin: 0; line-height: 1.5; font-weight: 600;">
                        <li>Don't waste time digging through old Unity docs.</li>
                        <li>Ask: <em>"What Unity functions check for targets ahead, and what are the trade-offs?"</em></li>
                        <li>Have the agent explain unfamiliar parameters (like <code>radius</code> and <code>QueryTriggerInteraction.Ignore</code>).</li>
                        <li>Make sure you understand every argument before accepting.</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="content-card primary">
                <div class="card-title primary">Comparing 3 Approaches Before Coding</div>
                <div class="card-body" style="display: flex; flex-direction: column; gap: 8px;">
                    <div class="compare-option-box" style="background: #f0f9ff; border: 1.5px solid #0284c7; border-radius: 6px; padding: 6px 8px; line-height: 1.4; color: #0c4a6e;">
                        <strong style="color: #0369a1;">Option A (Raycast):</strong> Thin 1-pixel ray. Good for snipers, frustrating for grapples.
                    </div>
                    <div class="compare-option-box" style="background: #f0fdf4; border: 1.5px solid #059669; border-radius: 6px; padding: 6px 8px; line-height: 1.4; color: #064e3b;">
                        <strong style="color: #166534;">Option B (SphereCast):</strong> Sweeps a 0.4m sphere. Forgiving aim, clean hit point and normal.
                    </div>
                    <div class="compare-option-box" style="background: #fffbeb; border: 1.5px solid #d97706; border-radius: 6px; padding: 6px 8px; line-height: 1.4; color: #78350f;">
                        <strong style="color: #92400e;">Option C (OverlapSphere + Dot):</strong> Checks an area within an angle. Best for auto-targeting enemies.
                    </div>
                </div>
            </div>
        </div>
    </div>

    <details class="slide-accordion tier-accordion">
        <summary class="accordion-header">
            <span>[Prompting Strategy] Understanding Function Arguments</span>
            <span class="accordion-expand">Expand</span>
        </summary>
        <div class="accordion-body">
            Never let an agent insert parameters you don't understand. If code uses <code>QueryTriggerInteraction.Ignore</code> or <code>LayerMask</code> bitmasks, ask the agent: <em>"What does this parameter do and what happens if I omit it?"</em> Understanding the arguments gives you confidence when tuning the script.
        </div>
    </details>

    <div class="lab-deep-dive">
        <div class="lab-deep-dive-header">
            <div class="lab-deep-dive-title">
                <span>LAB MODE STUDY GUIDE: COMPARING OPTIONS BEFORE CODING</span>
            </div>
            <span class="lab-deep-dive-badge">DEV WORKFLOW</span>
        </div>
        <div class="lab-mental-model">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model: The Menu of Solutions</div>
            For every problem, Unity offers multiple built-in functions. Asking for trade-offs helps you choose the cleanest option for your game mechanics.
        </div>
        <div class="lab-grid-2col">
            <div class="lab-box-neutral">
                <strong>Parameter Clarity:</strong><br>
                Always ask what each parameter does before copying code. Know why <code>maxDistance</code> or <code>radius</code> is set to a specific number.
            </div>
            <div class="lab-box-neutral">
                <strong>You Make the Call:</strong><br>
                The agent lists options and pros/cons, but you choose what fits your player experience and team requirements.
            </div>
        </div>
        <div class="lab-box-trap">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">The Trap: Digging Through Pages of Outdated Docs</div>
            Spending 30 minutes reading legacy forums or outdated documentation when an agent can summarize function signatures and trade-offs in 10 seconds.
        </div>
        <div class="lab-box-rule">
            <strong>The Rule:</strong> Ask the agent to compare approaches and explain parameters, then choose the cleanest fit.
        </div>
    </div>
    `
  },
  {
    "title": "Drawing Invisible Math: OnDrawGizmosSelected()",
    "origImg": "",
    "notes": "Gizmos: Explain to students that 3D math and raycasts are invisible in Game view. Drawing Gizmos gives visual proof of what is happening. Green for hit, red for miss, yellow for surface normal.",
    "content": `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title primary">Visual Proof of 3D Math</div>
                <div class="card-body">
                    <ul style="padding-left: 18px; margin: 0; line-height: 1.45; font-weight: 600;">
                        <li>Raycasts and math are invisible in Game view.</li>
                        <li>Green = hit, Red = miss, Yellow = surface normal.</li>
                        <li><code>OnDrawGizmosSelected()</code> keeps Scene view clean.</li>
                    </ul>
                </div>
            </div>

            <div class="content-card info" style="margin-top: 6px;">
                <div class="card-title info">Studio Gizmo Color Standards</div>
                <div class="card-body">
                    <div class="punchy-point"><span class="punchy-tag" style="background:#dc2626; color:#ffffff;">RED</span> Raycast miss (aim ray with no target detected)</div>
                    <div class="punchy-point"><span class="punchy-tag" style="background:#16a34a; color:#ffffff;">GREEN</span> Raycast hit (target acquired within range)</div>
                    <div class="punchy-point"><span class="punchy-tag" style="background:#06b6d4; color:#ffffff;">CYAN</span> Impact sphere (exact contact point on surface)</div>
                    <div class="punchy-point"><span class="punchy-tag" style="background:#eab308; color:#000000;">YELLOW</span> Surface normal ray (perpendicular bounce angle)</div>
                </div>
            </div>

            <div class="standalone-img-card borderless" style="margin-top: 6px;">
                <div class="img-title">UNITY MANUAL: SCENE VIEW LIVE GIZMOS</div>
                <div class="img-frame">
                    <img src="assets/unity_scene_gizmos.png" alt="Unity Scene View Live Gizmos" />
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="code-box">
                <div class="jb-editor-header">
                    <div class="jb-editor-tab">
                        <span class="jb-csharp-icon">C#</span>
                        <span class="jb-filename">AimGizmoVisualizer.cs</span>
                    </div>
                    <button class="code-copy-btn" onclick="copyCode(this)">Copy</button>
                </div>
                <pre><code><span class="jb-keyword">void</span> <span class="jb-method">OnDrawGizmosSelected</span>() {
    <span class="jb-type">Vector3</span> <span class="jb-plain">origin</span> = <span class="jb-plain">transform</span>.<span class="jb-plain">position</span> + <span class="jb-type">Vector3</span>.<span class="jb-plain">up</span> * <span class="jb-number">1.5f</span>;
    <span class="jb-type">Vector3</span> <span class="jb-plain">dir</span> = <span class="jb-plain">transform</span>.<span class="jb-plain">forward</span> * <span class="jb-plain">maxDistance</span>;

    <span class="jb-comment">// Green on hit, red on miss</span>
    <span class="jb-type">Gizmos</span>.<span class="jb-plain">color</span> = <span class="jb-plain">_hasHit</span> ? <span class="jb-type">Color</span>.<span class="jb-plain">green</span> : <span class="jb-type">Color</span>.<span class="jb-plain">red</span>;
    <span class="jb-type">Gizmos</span>.<span class="jb-method">DrawRay</span>(<span class="jb-plain">origin</span>, <span class="jb-plain">dir</span>);

    <span class="jb-keyword">if</span> (<span class="jb-plain">_hasHit</span>) {
        <span class="jb-type">Gizmos</span>.<span class="jb-plain">color</span> = <span class="jb-type">Color</span>.<span class="jb-plain">cyan</span>;
        <span class="jb-type">Gizmos</span>.<span class="jb-method">DrawSphere</span>(<span class="jb-plain">_hitPoint</span>, <span class="jb-number">0.2f</span>);

        <span class="jb-comment">// Yellow ray along surface normal</span>
        <span class="jb-type">Gizmos</span>.<span class="jb-plain">color</span> = <span class="jb-type">Color</span>.<span class="jb-plain">yellow</span>;
        <span class="jb-type">Gizmos</span>.<span class="jb-method">DrawRay</span>(<span class="jb-plain">_hitPoint</span>, <span class="jb-plain">_hitNormal</span> * <span class="jb-number">1.5f</span>);
    }
}</code></pre>
            </div>
        </div>
    </div>

    <details class="slide-accordion tier-accordion">
        <summary class="accordion-header">
            <span>[Gizmo Conventions] Standard Debug Colors</span>
            <span class="accordion-expand">Expand</span>
        </summary>
        <div class="accordion-body">
            Stick to team-wide color standards: Red for no hit / blocked, Green for target acquired, Cyan for contact position, and Yellow for surface normals. This lets anyone on your team inspect what your code is seeing at a glance.
        </div>
    </details>

    <div class="lab-deep-dive">
        <div class="lab-deep-dive-header">
            <div class="lab-deep-dive-title">
                <span>LAB MODE STUDY GUIDE: SCENE GIZMO PIPELINE</span>
            </div>
            <span class="lab-deep-dive-badge">GIZMOS SPEC</span>
        </div>
        <div class="lab-mental-model">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model: The Visual Multimeter</div>
            Do not print coordinates with <code>Debug.Log</code> to see if a ray hits. Render the ray and contact sphere in 3D space so you see reality instantly.
        </div>
        <div class="lab-grid-2col">
            <div class="lab-box-neutral">
                <strong>Selected Mode:</strong><br>
                <code>OnDrawGizmosSelected()</code> renders only when you click the GameObject, preventing Scene view clutter.
            </div>
            <div class="lab-box-neutral">
                <strong>Surface Normals:</strong><br>
                Drawing <code>hit.normal</code> shows whether a surface is perpendicular or angled, proving if wall-runs or slopes are valid.
            </div>
        </div>
        <div class="lab-box-trap">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">The Trap: Forgetting Ray Length</div>
            Writing <code>Gizmos.DrawRay(origin, transform.forward)</code> without multiplying by <code>maxDistance</code>. A 1m ray looks invisible when checking 25m.
        </div>
        <div class="lab-box-rule">
            <strong>The Rule:</strong> Always multiply forward vectors by range in <code>DrawRay</code>.
        </div>
    </div>
    `
  },
  {
    "title": "Milestone 1: Sandbox Scene & 3D Check (20 Min)",
    "origImg": "",
    "notes": "Milestone 1: 20 minutes for students to set up their own dev sandbox scene, write a 3D check with SphereCast or aim cone, and draw Gizmos showing aim ray and surface normal.",
    "content": `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card info">
                <div class="card-title info">20-Minute Challenge: Clean Test Scene &amp; 3D Check</div>
                <div class="card-body">
                    <ol style="padding-left: 18px; margin: 0; line-height: 1.5; font-weight: 600;">
                        <li>Create <code>Assets/Scenes/Dev/_Sandbox_[Name].unity</code>.</li>
                        <li>Pick 1 mechanic: grapple, dash, or ground-pound.</li>
                        <li>Write a SphereCast or cone check in a small script.</li>
                        <li>Draw Gizmos for aim ray and yellow surface normal.</li>
                    </ol>
                </div>
            </div>

            <div class="content-card primary" style="margin-top: 8px;">
                <div class="card-title primary">Checklist</div>
                <div class="card-body">
                    <ul style="padding-left: 18px; margin: 0; line-height: 1.45; font-weight: 600;">
                        <li>Test scene has a floor and 3 target cubes.</li>
                        <li>Gizmo ray turns green on hit and red on miss.</li>
                        <li>Surface normal projects out from hit wall.</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="media-panel-card" style="padding: 12px; gap: 8px;">
                <div style="font-weight: 800; color: #0369a1; text-transform: uppercase; width: 100%; font-size: 0.75rem;">
                    MILESTONE TIMEBOX: 20 MINUTES
                </div>
                <div style="width: 100%; padding: 12px; background: #070b14; border: 1px solid #1e293b; border-radius: 8px; text-align: center;">
                    <div id="cTimer1" style="font-size: 2.4rem; font-weight: 900; font-family: monospace; color: #38bdf8; letter-spacing: 2px;">
                        20:00
                    </div>
                    <div class="lecturer-timer-controls" id="controls_cTimer1" style="display: flex; gap: 8px; justify-content: center; margin-top: 8px;">
                        <button class="interactive-action-btn" onclick="lecturerStartTimer('cTimer1', 1200)">Start 20:00</button>
                        <button class="interactive-action-btn secondary" onclick="lecturerPauseTimer('cTimer1')">Pause</button>
                        <button class="interactive-action-btn secondary" onclick="lecturerResetTimer('cTimer1', 1200)">Reset</button>
                    </div>
                </div>
            </div>

            <div class="content-card primary" style="padding: 10px; margin-top: 8px;">
                <div class="card-title primary" style="font-size: 0.75rem; margin-bottom: 6px;">
                    QUICK REFERENCE
                </div>
                <div style="display: grid; grid-template-columns: auto 1fr; gap: 4px 10px; align-items: center; font-size: 0.70rem;">
                    <span style="background: #0f172a; color: #38bdf8; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-weight: 700; text-align: center; border: 1px solid #1e293b;">Dev Scene</span>
                    <span style="color: #0f172a; font-weight: 600; font-family: monospace; font-size: 0.68rem;">Assets/Scenes/Dev/_Sandbox_[Name].unity</span>

                    <span style="background: #0f172a; color: #4ade80; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-weight: 700; text-align: center; border: 1px solid #1e293b;">SphereCast</span>
                    <span style="color: #0f172a; font-weight: 600; font-family: monospace; font-size: 0.68rem;">Physics.SphereCast(origin, radius, dir, out hit)</span>

                    <span style="background: #0f172a; color: #facc15; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-weight: 700; text-align: center; border: 1px solid #1e293b;">Gizmo Normal</span>
                    <span style="color: #0f172a; font-weight: 600; font-family: monospace; font-size: 0.68rem;">Gizmos.DrawRay(hit.point, hit.normal * 1.5f)</span>

                    <span style="background: #0f172a; color: #c084fc; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-weight: 700; text-align: center; border: 1px solid #1e293b;">Aim Cone</span>
                    <span style="color: #0f172a; font-weight: 600; font-family: monospace; font-size: 0.68rem;">Vector3.Dot(cam.forward, dirToTarget) &gt; 0.866f</span>
                </div>
            </div>
        </div>
    </div>
    `
  }
];

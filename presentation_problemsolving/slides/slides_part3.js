module.exports = [
  {
    "isInverted": true,
    "title": "Part 2: Fast In-Game Dev Tools",
    "subtitle": "Cut 90-Second Walk Tests Down to 3 Seconds",
    "origImg": "",
    "content": `
        <div class="content-card primary" style="text-align: center; max-width: 820px; margin: 0 auto;">
            <div class="card-body" style="color: #ffffff !important; font-size: 1.15rem; line-height: 1.6; font-weight: 600;">
                Stop walking for 2 minutes to test a 2-second jump—build teleport, [ContextMenu], and time-scale hotkeys first.
            </div>
        </div>
    `,
    "notes": "Section 2 (2 min): Frame dev tooling. Never spend minutes walking across a level to test a jump or trigger. Build quick dev hotkeys and inspector tools so you can test any encounter in 3 seconds.",
    "topics": [
      "1-Click Inspector Testing & OnValidate",
      "Instant Checkpoint Teleportation",
      "CharacterController Teleport Trap",
      "Slow-Motion Time Scrubbing",
      "On-Screen Live Values HUD"
    ]
  },
  {
    "title": "1-Click Inspector Testing & Silent Bug Guard: [ContextMenu] & OnValidate()",
    "origImg": "",
    "notes": "Inspector Testing: Walking across a level to test an endgame door or boss phase wastes massive dev time. [ContextMenu] lets you right-click the component header in the Inspector and trigger methods instantly in Edit or Play mode. Combine with OnValidate to catch silent bugs like speed <= 0 or empty LayerMasks.",
    "content": `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card danger">
                <div class="card-title danger">What Fails Silently in Unity</div>
                <div class="card-body">
                    <ul style="padding-left: 18px; margin: 0; line-height: 1.45; font-weight: 600;">
                        <li>Designer sets <code>speed = 0.0f</code>, <code>radius = -5</code>, or leaves <code>LayerMask</code> on <code>Nothing</code>.</li>
                        <li><strong>No red Console error!</strong> Raycasts silently miss and gameplay freezes.</li>
                        <li><code>[Min(0.1f)]</code> and <code>[Range(1f, 50f)]</code> clamp inspector inputs.</li>
                        <li><code>OnValidate()</code> logs an actionable warning if a bitmask is empty.</li>
                    </ul>
                </div>
            </div>

            <div class="content-card success" style="margin-top: 6px;">
                <div class="card-title success">1-Click Testing: [ContextMenu]</div>
                <div class="card-body">
                    <ul style="padding-left: 18px; margin: 0; line-height: 1.45; font-weight: 600;">
                        <li>Testing an endgame door or boss phase usually takes 5 minutes of walking.</li>
                        <li>Add <code>[ContextMenu("Test Open Door")]</code> above any method.</li>
                        <li>Right-click the component header in the Inspector to trigger instantly!</li>
                    </ul>
                </div>
            </div>

            <div class="standalone-img-card borderless" style="margin-top: 6px;">
                <div class="img-title">UNITY INSPECTOR: [CONTEXTMENU] BUTTONS</div>
                <div class="img-frame">
                    <img src="assets/unity_context_menu.png" alt="Unity Inspector Component Context Menu Buttons" />
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="code-box">
                <div class="jb-editor-header">
                    <div class="jb-editor-tab">
                        <span class="jb-csharp-icon">C#</span>
                        <span class="jb-filename">DoorController.cs</span>
                    </div>
                    <button class="code-copy-btn" onclick="copyCode(this)">Copy</button>
                </div>
                <pre><code><span class="jb-keyword">public</span> <span class="jb-keyword">class</span> <span class="jb-type">DoorController</span> : <span class="jb-type">MonoBehaviour</span> {
    <span class="jb-attr">[SerializeField, Min(0.1f)]</span> <span class="jb-keyword">private</span> <span class="jb-type">float</span> <span class="jb-plain">openSpeed</span> = <span class="jb-number">2.5f</span>;
    <span class="jb-attr">[SerializeField]</span> <span class="jb-keyword">private</span> <span class="jb-type">LayerMask</span> <span class="jb-plain">playerLayer</span>;

    <span class="jb-comment">// 1. Edit-time silent bug guard</span>
    <span class="jb-keyword">private</span> <span class="jb-keyword">void</span> <span class="jb-method">OnValidate</span>() {
        <span class="jb-keyword">if</span> (<span class="jb-plain">playerLayer</span>.<span class="jb-plain">value</span> == <span class="jb-number">0</span>) {
            <span class="jb-type">Debug</span>.<span class="jb-method">LogWarning</span>(<span class="jb-string">$"[DoorController] {name}: playerLayer is Nothing! Raycasts will fail."</span>, <span class="jb-keyword">this</span>);
        }
    }

    <span class="jb-comment">// 2. Right-click component header in Inspector</span>
    <span class="jb-attr">[ContextMenu(<span class="jb-string">"Test Open Door"</span>)]</span>
    <span class="jb-keyword">public</span> <span class="jb-keyword">void</span> <span class="jb-method">TestOpenDoor</span>() {
        <span class="jb-method">OpenDoor</span>();
    }

    <span class="jb-keyword">public</span> <span class="jb-keyword">void</span> <span class="jb-method">OpenDoor</span>() {
        <span class="jb-comment">// Instant test without 2-minute walk!</span>
        <span class="jb-type">Debug</span>.<span class="jb-method">Log</span>(<span class="jb-string">"Door opened successfully!"</span>);
    }
}</code></pre>
            </div>
        </div>
    </div>

    <details class="slide-accordion tier-accordion">
        <summary class="accordion-header">
            <span>[Workflow Efficiency] Why ContextMenu Beats Manual Traversal</span>
            <span class="accordion-expand">Expand</span>
        </summary>
        <div class="accordion-body">
            Writing <code>[ContextMenu("Test Action")]</code> takes 5 seconds and gives the entire team a 1-click test button right in the Inspector. You can trigger doors, grant inventory items, take damage, or test ability cooldowns without writing custom editor windows or UI canvases.
        </div>
    </details>

    <div class="lab-deep-dive">
        <div class="lab-deep-dive-header">
            <div class="lab-deep-dive-title">
                <span>LAB MODE STUDY GUIDE: DEFENSIVE INSPECTOR WORKFLOWS</span>
            </div>
            <span class="lab-deep-dive-badge">DEFENSIVE SPEC</span>
        </div>
        <div class="lab-mental-model">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model: The Edit-Time Shield</div>
            Prevent silent failures before Play Mode starts. When serialized fields clamp invalid numbers and warn on unassigned layers, team iteration runs smoothly.
        </div>
        <div class="lab-grid-2col">
            <div class="lab-box-neutral">
                <strong>LayerMask Bitmask Check:</strong><br>
                A LayerMask with <code>value == 0</code> is set to Nothing. A raycast will hit no colliders on that mask.
            </div>
            <div class="lab-box-neutral">
                <strong>Instant Triggering:</strong><br>
                <code>[ContextMenu]</code> works during Play Mode and Edit Mode, enabling rapid parameter verification.
            </div>
        </div>
        <div class="lab-box-trap">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">The Trap: Silent Failures Without Exceptions</div>
            A layer mask set to Nothing throws no exception. The ability simply stops working and developers waste 30 minutes debugging functional C# code.
        </div>
        <div class="lab-box-rule">
            <strong>The Rule:</strong> Check LayerMask values in <code>OnValidate()</code> and expose test actions via <code>[ContextMenu]</code>.
        </div>
    </div>
    `
  },
  {
    "title": "Checkpoint Teleport Hotkeys (F1–F3) & The CharacterController Trap",
    "origImg": "",
    "notes": "Teleport Cheats (6 min): Walking across the greybox level wastes hours every week. Show the CharacterController trap: disabling it before modifying transform.position, or PhysX snaps the player right back.",
    "content": `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title primary">Instant Checkpoint Warping</div>
                <div class="card-body">
                    <div class="punchy-point">
                        <span class="punchy-tag" style="background: #0284c7 !important; color: #ffffff !important; font-weight: 800;">F1–F3 WARP</span>
                        <span>Teleport straight to checkpoints across your test greybox.</span>
                    </div>
                    <div class="punchy-point">
                        <span class="punchy-tag" style="background: #b91c1c !important; color: #ffffff !important; font-weight: 800;">TRAP</span>
                        <span>Disable CharacterController before moving or PhysX snaps back!</span>
                    </div>
                    <div class="punchy-point">
                        <span class="punchy-tag" style="background: #059669 !important; color: #ffffff !important; font-weight: 800;">FAST LOOP</span>
                        <span>Cuts 90-second traversal down to a 3-second test loop.</span>
                    </div>
                </div>
            </div>

            <div class="content-card danger" style="margin-top: 6px;">
                <div class="card-title danger">The CharacterController Trap</div>
                <div class="card-body">
                    <ul style="padding-left: 18px; margin: 0; line-height: 1.45; font-weight: 600;">
                        <li>If you set <code>transform.position</code> directly, <strong>PhysX snaps you back!</strong></li>
                        <li>CharacterController caches internal transform state.</li>
                        <li><strong>The Fix:</strong> <code>controller.enabled = false;</code></li>
                        <li>Update <code>transform.position = target.position;</code></li>
                        <li>Immediately restore <code>controller.enabled = true;</code></li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="code-box">
                <div class="jb-editor-header">
                    <div class="jb-editor-tab">
                        <span class="jb-csharp-icon">C#</span>
                        <span class="jb-filename">DevWarpController.cs</span>
                    </div>
                    <button class="code-copy-btn" onclick="copyCode(this)">Copy</button>
                </div>
                <pre><code><span class="jb-keyword">using</span> <span class="jb-type">UnityEngine</span>;
<span class="jb-keyword">using</span> <span class="jb-type">UnityEngine.InputSystem</span>;

<span class="jb-keyword">public</span> <span class="jb-keyword">class</span> <span class="jb-type">DevWarpController</span> : <span class="jb-type">MonoBehaviour</span> {
    <span class="jb-attr">[SerializeField]</span> <span class="jb-keyword">private</span> <span class="jb-type">CharacterController</span> <span class="jb-plain">controller</span>;
    <span class="jb-attr">[SerializeField]</span> <span class="jb-keyword">private</span> <span class="jb-type">Transform</span>[] <span class="jb-plain">checkpoints</span>;

    <span class="jb-keyword">void</span> <span class="jb-method">Update</span>() {
        <span class="jb-keyword">var</span> <span class="jb-plain">kb</span> = <span class="jb-type">Keyboard</span>.<span class="jb-plain">current</span>;
        <span class="jb-keyword">if</span> (<span class="jb-plain">kb</span> == <span class="jb-keyword">null</span>) <span class="jb-keyword">return</span>;
        <span class="jb-keyword">if</span> (<span class="jb-plain">kb</span>.<span class="jb-plain">f1Key</span>.<span class="jb-plain">wasPressedThisFrame</span>) <span class="jb-method">WarpTo</span>(<span class="jb-number">0</span>);
        <span class="jb-keyword">if</span> (<span class="jb-plain">kb</span>.<span class="jb-plain">f2Key</span>.<span class="jb-plain">wasPressedThisFrame</span>) <span class="jb-method">WarpTo</span>(<span class="jb-number">1</span>);
    }

    <span class="jb-keyword">private</span> <span class="jb-keyword">void</span> <span class="jb-method">WarpTo</span>(<span class="jb-type">int</span> <span class="jb-plain">i</span>) {
        <span class="jb-keyword">if</span> (<span class="jb-plain">i</span> &gt;= <span class="jb-plain">checkpoints</span>.<span class="jb-plain">Length</span> || <span class="jb-plain">checkpoints</span>[<span class="jb-plain">i</span>] == <span class="jb-keyword">null</span>) <span class="jb-keyword">return</span>;
        <span class="jb-plain">controller</span>.<span class="jb-plain">enabled</span> = <span class="jb-keyword">false</span>;
        <span class="jb-plain">transform</span>.<span class="jb-plain">position</span> = <span class="jb-plain">checkpoints</span>[<span class="jb-plain">i</span>].<span class="jb-plain">position</span>;
        <span class="jb-plain">controller</span>.<span class="jb-plain">enabled</span> = <span class="jb-keyword">true</span>;
    }
}</code></pre>
            </div>
        </div>
    </div>

    <details class="slide-accordion tier-accordion">
        <summary class="accordion-header">
            <span>[Unity 6 Input] Direct Hardware Polling via Keyboard.current</span>
            <span class="accordion-expand">Expand</span>
        </summary>
        <div class="accordion-body">
            Using <code>Keyboard.current.f1Key.wasPressedThisFrame</code> reads the hardware keyboard directly without creating an Input Action asset. Always guard with <code>if (Keyboard.current == null) return;</code> at the top of <code>Update()</code> to prevent null errors on device initialization.
        </div>
    </details>

    <div class="lab-deep-dive">
        <div class="lab-deep-dive-header">
            <div class="lab-deep-dive-title">
                <span>LAB MODE STUDY GUIDE: CHECKPOINT WARPING ARCHITECTURE</span>
            </div>
            <span class="lab-deep-dive-badge">DEV TOOLING SPEC</span>
        </div>
        <div class="lab-mental-model">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model: Fast Feedback Loops</div>
            Every minute spent walking through empty corridors is a minute lost from gameplay tuning. Hotkeys give immediate access to any test location.
        </div>
        <div class="lab-grid-2col">
            <div class="lab-box-neutral">
                <strong>Physics Sync:</strong><br>
                Disabling the component stops internal PhysX interpolation from snapping the player back to their pre-warp coordinates.
            </div>
            <div class="lab-box-neutral">
                <strong>Array Indexing:</strong><br>
                Always check <code>index &lt; checkpoints.Length</code> to prevent index out of bounds exceptions when testing newly added scenes.
            </div>
        </div>
        <div class="lab-box-trap">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">The Trap: Forgetting to Re-Enable the Controller</div>
            Leaving <code>controller.enabled = false</code> permanently freezes input and gravity. Always toggle back to true in the next line.
        </div>
        <div class="lab-box-rule">
            <strong>The Rule:</strong> Disable CharacterController before updating transform.position, and re-enable immediately after.
        </div>
    </div>
    `
  },
  {
    "title": "Slow-Motion & Fast-Forward Hotkeys (Time.timeScale)",
    "origImg": "",
    "notes": "Time Scale Cheats (5 min): Explain how Time.timeScale lets students inspect fast 3D physics (like wall jumps or grapples) at 0.1x speed. Remind them: Time.fixedDeltaTime must scale too, or physics stutters.",
    "content": `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title primary">Inspect Fast Physics in Slow-Mo</div>
                <div class="card-body">
                    <ul style="padding-left: 18px; margin: 0; line-height: 1.5; font-weight: 600;">
                        <li>Wall jumps happen in 0.15s: impossible to see bugs in real-time.</li>
                        <li><code>Time.timeScale = 0.1f</code> slows gameplay to 10% speed.</li>
                        <li>Scale <code>fixedDeltaTime</code> so physics steps smoothly!</li>
                        <li>Fast-forward (<code>3.0f</code>) skips long elevator rides.</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="code-box">
                <div class="jb-editor-header">
                    <div class="jb-editor-tab">
                        <span class="jb-csharp-icon">C#</span>
                        <span class="jb-filename">DevTimeController.cs</span>
                    </div>
                    <button class="code-copy-btn" onclick="copyCode(this)">Copy</button>
                </div>
                <pre><code><span class="jb-keyword">public</span> <span class="jb-keyword">class</span> <span class="jb-type">DevTimeController</span> : <span class="jb-type">MonoBehaviour</span> {
    <span class="jb-keyword">private</span> <span class="jb-type">float</span> <span class="jb-plain">_defaultFixedDelta</span>;

    <span class="jb-keyword">void</span> <span class="jb-method">Awake</span>() =&gt; <span class="jb-plain">_defaultFixedDelta</span> = <span class="jb-type">Time</span>.<span class="jb-plain">fixedDeltaTime</span>;

    <span class="jb-keyword">void</span> <span class="jb-method">Update</span>() {
        <span class="jb-keyword">var</span> <span class="jb-plain">kb</span> = <span class="jb-type">Keyboard</span>.<span class="jb-plain">current</span>;
        <span class="jb-keyword">if</span> (<span class="jb-plain">kb</span> == <span class="jb-keyword">null</span>) <span class="jb-keyword">return</span>;
        <span class="jb-keyword">if</span> (<span class="jb-plain">kb</span>.<span class="jb-plain">leftBracketKey</span>.<span class="jb-plain">wasPressedThisFrame</span>) <span class="jb-method">SetScale</span>(<span class="jb-number">0.1f</span>); <span class="jb-comment">// Slow</span>
        <span class="jb-keyword">if</span> (<span class="jb-plain">kb</span>.<span class="jb-plain">rightBracketKey</span>.<span class="jb-plain">wasPressedThisFrame</span>) <span class="jb-method">SetScale</span>(<span class="jb-number">3.0f</span>); <span class="jb-comment">// Fast</span>
        <span class="jb-keyword">if</span> (<span class="jb-plain">kb</span>.<span class="jb-plain">backslashKey</span>.<span class="jb-plain">wasPressedThisFrame</span>) <span class="jb-method">SetScale</span>(<span class="jb-number">1.0f</span>);   <span class="jb-comment">// Normal</span>
    }

    <span class="jb-keyword">private</span> <span class="jb-keyword">void</span> <span class="jb-method">SetScale</span>(<span class="jb-type">float</span> <span class="jb-plain">s</span>) {
        <span class="jb-type">Time</span>.<span class="jb-plain">timeScale</span> = <span class="jb-plain">s</span>;
        <span class="jb-type">Time</span>.<span class="jb-plain">fixedDeltaTime</span> = <span class="jb-plain">_defaultFixedDelta</span> * <span class="jb-plain">s</span>;
    }
}</code></pre>
            </div>
        </div>
    </div>

    <details class="slide-accordion tier-accordion">
        <summary class="accordion-header">
            <span>[Physics Engine] Why fixedDeltaTime Must Scale with timeScale</span>
            <span class="accordion-expand">Expand</span>
        </summary>
        <div class="accordion-body">
            If you change <code>Time.timeScale</code> to <code>0.1f</code> without adjusting <code>fixedDeltaTime</code>, PhysX still ticks at 0.02s intervals. This causes character movement to jitter and stutter noticeably. Multiplying fixedDeltaTime by timeScale preserves smooth physics simulation.
        </div>
    </details>

    <div class="lab-deep-dive">
        <div class="lab-deep-dive-header">
            <div class="lab-deep-dive-title">
                <span>LAB MODE STUDY GUIDE: TIME SCALING &amp; PHYSICS STEPPING</span>
            </div>
            <span class="lab-deep-dive-badge">TIME ARCHITECTURE</span>
        </div>
        <div class="lab-mental-model">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model: The High-Speed Camera</div>
            Slow motion lets you observe collision contacts, normal vector alignments, and animation transitions frame by frame.
        </div>
        <div class="lab-grid-2col">
            <div class="lab-box-neutral">
                <strong>Default Fixed Step:</strong><br>
                Cache <code>Time.fixedDeltaTime</code> on startup so you can restore exact 50Hz physics when resetting to 1.0x speed.
            </div>
            <div class="lab-box-neutral">
                <strong>Unscaled Time:</strong><br>
                UI animations and dev cheats should read <code>Time.unscaledDeltaTime</code> so they continue working when the game is paused.
            </div>
        </div>
        <div class="lab-box-trap">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">The Trap: Changing timeScale Inside FixedUpdate()</div>
            Modifying <code>timeScale</code> inside <code>FixedUpdate()</code> disrupts the physics step currently being calculated. Always update time scales from <code>Update()</code>.
        </div>
        <div class="lab-box-rule">
            <strong>The Rule:</strong> Whenever modifying <code>Time.timeScale</code>, scale <code>Time.fixedDeltaTime</code> by the same factor.
        </div>
    </div>
    `
  },
  {
    "title": "Stop Spamming Debug.Log: Live On-Screen Watch (DevWatch / F12)",
    "origImg": "",
    "notes": "Debug HUD (6 min): Explain why 500 Debug.Log calls in Update() creates GC stutter and clutters the console. DevWatch writes to a static dictionary and renders on-screen with OnGUI or UI Toolkit.",
    "content": `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title primary">Live On-Screen Telemetry</div>
                <div class="card-body">
                    <ul style="padding-left: 18px; margin: 0; line-height: 1.5; font-weight: 600;">
                        <li>Spamming <code>Debug.Log</code> in Update creates Garbage Collection stutter.</li>
                        <li><code>DevWatch.Set("Speed", speed)</code> overwrites 1 line on screen.</li>
                        <li>Press <code>F12</code> to show or hide the overlay anytime.</li>
                        <li>Watch velocity, grounded state, and aim distance live!</li>
                    </ul>
                </div>
            </div>

            <div class="standalone-img-card img-edit-card borderless" style="margin-top: 6px;">
                <div class="img-title">UNITY GAME VIEW: LIVE DEBUG &amp; STATS OVERLAY</div>
                <div class="img-frame" style="width: 100%; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                    <img src="assets/unity_debug_hud.png" alt="Unity Game View Live Debug HUD Overlay" />
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="code-box">
                <div class="jb-editor-header">
                    <div class="jb-editor-tab">
                        <span class="jb-csharp-icon">C#</span>
                        <span class="jb-filename">DevWatchHUD.cs</span>
                    </div>
                    <button class="code-copy-btn" onclick="copyCode(this)">Copy</button>
                </div>
                <pre><code><span class="jb-keyword">using</span> <span class="jb-type">System.Collections.Generic</span>;
<span class="jb-keyword">using</span> <span class="jb-type">UnityEngine</span>;
<span class="jb-keyword">using</span> <span class="jb-type">UnityEngine.InputSystem</span>;

<span class="jb-keyword">public</span> <span class="jb-keyword">static</span> <span class="jb-keyword">class</span> <span class="jb-type">DevWatch</span> {
    <span class="jb-keyword">public</span> <span class="jb-keyword">static</span> <span class="jb-keyword">readonly</span> <span class="jb-type">Dictionary</span>&lt;<span class="jb-type">string</span>, <span class="jb-type">string</span>&gt; <span class="jb-plain">Data</span> = <span class="jb-keyword">new</span>();
    <span class="jb-keyword">public</span> <span class="jb-keyword">static</span> <span class="jb-keyword">void</span> <span class="jb-method">Set</span>(<span class="jb-type">string</span> <span class="jb-plain">k</span>, <span class="jb-type">object</span> <span class="jb-plain">v</span>) =&gt; <span class="jb-plain">Data</span>[<span class="jb-plain">k</span>] = <span class="jb-plain">v</span>?.<span class="jb-method">ToString</span>() ?? <span class="jb-string">"null"</span>;
}

<span class="jb-keyword">public</span> <span class="jb-keyword">class</span> <span class="jb-type">RuntimeDebugHUD</span> : <span class="jb-type">MonoBehaviour</span> {
    <span class="jb-keyword">private</span> <span class="jb-type">bool</span> <span class="jb-plain">_show</span> = <span class="jb-keyword">true</span>;
    <span class="jb-keyword">void</span> <span class="jb-method">Update</span>() {
        <span class="jb-keyword">if</span> (<span class="jb-type">Keyboard</span>.<span class="jb-plain">current</span>?.<span class="jb-plain">f12Key</span>.<span class="jb-plain">wasPressedThisFrame</span> == <span class="jb-keyword">true</span>) <span class="jb-plain">_show</span> = !<span class="jb-plain">_show</span>;
    }
    <span class="jb-keyword">void</span> <span class="jb-method">OnGUI</span>() {
        <span class="jb-keyword">if</span> (!<span class="jb-plain">_show</span>) <span class="jb-keyword">return</span>;
        <span class="jb-type">int</span> <span class="jb-plain">y</span> = <span class="jb-number">10</span>;
        <span class="jb-keyword">foreach</span> (<span class="jb-keyword">var</span> <span class="jb-plain">kv</span> <span class="jb-keyword">in</span> <span class="jb-type">DevWatch</span>.<span class="jb-plain">Data</span>) {
            <span class="jb-type">GUI</span>.<span class="jb-method">Label</span>(<span class="jb-keyword">new</span> <span class="jb-type">Rect</span>(<span class="jb-number">10</span>, <span class="jb-plain">y</span>, <span class="jb-number">300</span>, <span class="jb-number">20</span>), <span class="jb-string">$"[{kv.Key}]: {kv.Value}"</span>);
            <span class="jb-plain">y</span> += <span class="jb-number">22</span>;
        }
    }
}</code></pre>
            </div>
        </div>
    </div>

    <details class="slide-accordion tier-accordion">
        <summary class="accordion-header">
            <span>[Memory Hygiene] Why On-Screen Watches Beat Console Logs</span>
            <span class="accordion-expand">Expand</span>
        </summary>
        <div class="accordion-body">
            Calling <code>Debug.Log</code> in <code>Update()</code> generates thousands of string allocations that force the Garbage Collector to run frequently, causing frame drops. <code>DevWatch</code> writes to a single dictionary entry that overwrites each frame, keeping memory allocations to a minimum.
        </div>
    </details>

    <div class="lab-deep-dive">
        <div class="lab-deep-dive-header">
            <div class="lab-deep-dive-title">
                <span>LAB MODE STUDY GUIDE: ON-SCREEN DEBUG OVERLAYS</span>
            </div>
            <span class="lab-deep-dive-badge">RUNTIME HUD SPEC</span>
        </div>
        <div class="lab-mental-model">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model: Eyes on the Screen</div>
            Looking back and forth between the Game view and a scrolling Console window causes eye fatigue. Displaying values on screen keeps your focus on gameplay.
        </div>
        <div class="lab-grid-2col">
            <div class="lab-box-neutral">
                <strong>Static Access Pattern:</strong><br>
                Because <code>DevWatch</code> is static, any script can call <code>DevWatch.Set("Speed", speed)</code> without finding singletons or assigning references.
            </div>
            <div class="lab-box-neutral">
                <strong>Category Keys:</strong><br>
                Use prefixes like <code>"Player/State"</code> or <code>"Combat/Damage"</code> to group related variables together in the overlay list.
            </div>
        </div>
        <div class="lab-box-trap">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">The Trap: Recreating GUIStyle Every Frame in OnGUI</div>
            Creating <code>new GUIStyle()</code> inside <code>OnGUI()</code> without caching it allocates new style objects multiple times per frame.
        </div>
        <div class="lab-box-rule">
            <strong>The Rule:</strong> Never spam <code>Debug.Log</code> inside <code>Update()</code>. Use <code>DevWatch.Set()</code> for continuous variable tracking.
        </div>
    </div>
    `
  },
  {
    "title": "Milestone 2: Add Teleport, Slow-Mo, [ContextMenu] & Watch Overlay (20 Min)",
    "origImg": "",
    "notes": "Milestone 2 (20 min): Give students 20 minutes to add DevCheatController and RuntimeDebugHUD to their project. Wire checkpoints, test slow-mo, add [ContextMenu] testing, and replace Update Debug.Logs with DevWatch.Set.",
    "content": `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card info">
                <div class="card-title info">20-Minute Challenge: Build Cheats, [ContextMenu] &amp; HUD</div>
                <div class="card-body">
                    <ol style="padding-left: 16px; margin: 0 0 10px 0; line-height: 1.5; font-size: 0.74rem; font-weight: 600;">
                        <li>Create <code>DevCheatController.cs</code> on a dev manager object.</li>
                        <li>Place 3 checkpoint transforms in your scene (wire to <code>F1–F3</code>).</li>
                        <li>Add time-scale keys: slow-mo (<code>[</code>), fast (<code>]</code>), and reset (<code>\\</code>).</li>
                        <li>Add <code>[ContextMenu("Test ...")]</code> to trigger your mechanic from the Inspector header.</li>
                        <li>Create <code>RuntimeDebugHUD.cs</code> and display 3 live variables with <code>DevWatch.Set</code>.</li>
                    </ol>
                    <div style="font-weight: 700; color: #0369a1; font-size: 0.72rem; margin-bottom: 4px;">CHECKLIST:</div>
                    <ul style="padding-left: 16px; margin: 0; line-height: 1.45; font-size: 0.72rem; font-weight: 600;">
                        <li><strong>Instant Warp:</strong> <code>F1–F3</code> teleport without physics snap-back.</li>
                        <li><strong>Time Scale:</strong> <code>[</code> slows to 0.1x for physics inspection.</li>
                        <li><strong>1-Click Testing:</strong> <code>[ContextMenu]</code> triggers methods directly from Inspector.</li>
                        <li><strong>Live Values:</strong> <code>F12</code> toggles HUD; no console spam in Update.</li>
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
                    <div id="cTimer2" style="font-size: 2.4rem; font-weight: 900; font-family: monospace; color: #38bdf8; letter-spacing: 2px;">
                        20:00
                    </div>
                    <div class="lecturer-timer-controls" id="controls_cTimer2" style="display: flex; gap: 8px; justify-content: center; margin-top: 8px;">
                        <button class="interactive-action-btn" onclick="lecturerStartTimer('cTimer2', 1200)">Start 20:00</button>
                        <button class="interactive-action-btn secondary" onclick="lecturerPauseTimer('cTimer2')">Pause</button>
                        <button class="interactive-action-btn secondary" onclick="lecturerResetTimer('cTimer2', 1200)">Reset</button>
                    </div>
                </div>
            </div>

            <div class="content-card primary" style="padding: 10px; margin-top: 8px;">
                <div class="card-title primary" style="font-size: 0.75rem; margin-bottom: 6px;">
                    HOTKEY &amp; DEV SUMMARY
                </div>
                <div style="display: grid; grid-template-columns: auto 1fr; gap: 4px 10px; align-items: center; font-size: 0.70rem;">
                    <kbd style="background: #0f172a; color: #38bdf8; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-weight: 700; text-align: center; border: 1px solid #1e293b;">F1–F3</kbd>
                    <span style="color: #0f172a; font-weight: 600;">Warp to Checkpoint 1, 2, or 3</span>

                    <kbd style="background: #0f172a; color: #a78bfa; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-weight: 700; text-align: center; border: 1px solid #1e293b;">[ContextMenu]</kbd>
                    <span style="color: #0f172a; font-weight: 600;">Right-click component header</span>

                    <kbd style="background: #0f172a; color: #facc15; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-weight: 700; text-align: center; border: 1px solid #1e293b;">[</kbd>
                    <span style="color: #0f172a; font-weight: 600;">0.1x Slow-Mo Time Scale</span>

                    <kbd style="background: #0f172a; color: #facc15; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-weight: 700; text-align: center; border: 1px solid #1e293b;">]</kbd>
                    <span style="color: #0f172a; font-weight: 600;">3.0x Fast-Forward Time Scale</span>

                    <kbd style="background: #0f172a; color: #facc15; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-weight: 700; text-align: center; border: 1px solid #1e293b;">&#92;</kbd>
                    <span style="color: #0f172a; font-weight: 600;">1.0x Normal Time Scale</span>

                    <kbd style="background: #0f172a; color: #4ade80; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-weight: 700; text-align: center; border: 1px solid #1e293b;">F12</kbd>
                    <span style="color: #0f172a; font-weight: 600;">Toggle Runtime Debug HUD Overlay</span>
                </div>
            </div>
        </div>
    </div>
    `
  }
];

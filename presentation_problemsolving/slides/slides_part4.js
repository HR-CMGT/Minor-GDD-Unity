module.exports = [
  {
    "isInverted": true,
    "title": "Part 3: The Rider / VS Debugger",
    "subtitle": "Pause the Engine & Inspect Live Memory",
    "origImg": "",
    "content": `
        <div class="content-card primary" style="text-align: center; max-width: 820px; margin: 0 auto;">
            <div class="card-body" style="color: #ffffff !important; font-size: 1.15rem; line-height: 1.6; font-weight: 600;">
                When a bug happens in Play Mode, pause the game on the exact line instead of guessing.
            </div>
        </div>
    `,
    "notes": "Section 3 (2 min): Move from guessing to inspecting. Attaching Rider or Visual Studio pauses the game right when a bug occurs so you can inspect variables line by line.",
    "topics": [
      "Attach IDE to Unity",
      "Conditional Breakpoints (F9)",
      "Step-by-Step Execution (F10)",
      "Trace Callers with Call Stack"
    ]
  },
  {
    "title": "Attaching the Debugger & Stepping Line-by-Line (F9 & F10)",
    "origImg": "",
    "notes": "IDE Debugger (6 min): Walk through attaching Rider/VS to Unity. Show placing a breakpoint with F9, pausing the game, stepping over lines with F10, and hovering variables to see live values.",
    "content": `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title primary">4 Steps to Debug in Play Mode</div>
                <div class="card-body">
                    <div class="punchy-point">
                        <span class="punchy-tag" style="background: #0284c7 !important; color: #ffffff !important; font-weight: 800;">1. ATTACH</span>
                        <span>Click 'Attach to Unity' in Rider or Visual Studio.</span>
                    </div>
                    <div class="punchy-point">
                        <span class="punchy-tag" style="background: #d97706 !important; color: #ffffff !important; font-weight: 800;">2. BREAKPOINT</span>
                        <span>Click the left gutter or press F9 on a line.</span>
                    </div>
                    <div class="punchy-point">
                        <span class="punchy-tag" style="background: #b91c1c !important; color: #ffffff !important; font-weight: 800;">3. PAUSE</span>
                        <span>Trigger the code in Play Mode—Unity pauses immediately.</span>
                    </div>
                    <div class="punchy-point">
                        <span class="punchy-tag" style="background: #059669 !important; color: #ffffff !important; font-weight: 800;">4. STEP</span>
                        <span>Press F10 to step line-by-line and hover variables.</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="standalone-img-card img-edit-card borderless" style="margin-top: 6px;">
                <div class="img-title">JETBRAINS RIDER: ATTACH TO UNITY</div>
                <div class="img-frame" style="width: 100%; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                    <img src="assets/rider_attach_unity.png" alt="Rider Attach to Unity Debug Session" />
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px; width: 100%; font-size: 0.68rem;">
                    <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 4px; padding: 4px 8px; color: #e2e8f0; display: flex; justify-content: space-between;">
                        <strong style="color: #38bdf8; font-family: monospace;">F9</strong>
                        <span>Toggle Breakpoint</span>
                    </div>
                    <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 4px; padding: 4px 8px; color: #e2e8f0; display: flex; justify-content: space-between;">
                        <strong style="color: #4ade80; font-family: monospace;">F10</strong>
                        <span>Step Over Next Line</span>
                    </div>
                    <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 4px; padding: 4px 8px; color: #e2e8f0; display: flex; justify-content: space-between;">
                        <strong style="color: #c084fc; font-family: monospace;">F5</strong>
                        <span>Resume Play Mode</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <details class="slide-accordion tier-accordion">
        <summary class="accordion-header">
            <span>[Debugger Connection] How the IDE Attaches to Unity</span>
            <span class="accordion-expand">Expand</span>
        </summary>
        <div class="accordion-body">
            Unity includes an embedded debugging server. When you click "Attach to Unity", your IDE connects over a local network socket. When a breakpoint is reached, the runtime pauses execution and transmits local variable states, thread data, and stack frames straight to your code editor.
        </div>
    </details>

    <div class="lab-deep-dive">
        <div class="lab-deep-dive-header">
            <div class="lab-deep-dive-title">
                <span>LAB MODE STUDY GUIDE: STEPPING &amp; VARIABLE INSPECTION</span>
            </div>
            <span class="lab-deep-dive-badge">IDE DEBUGGER SPEC</span>
        </div>
        <div class="lab-mental-model">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model: The Engine Freeze</div>
            Instead of adding print statements and guessing how values changed, the debugger freezes the engine in place so you can read exact memory values.
        </div>
        <div class="lab-grid-2col">
            <div class="lab-box-neutral">
                <strong>Hover Inspection:</strong><br>
                Hover over any property, local variable, or parameter to see its value at that precise moment in time.
            </div>
            <div class="lab-box-neutral">
                <strong>Watches Window:</strong><br>
                Pin critical expressions (like <code>velocity.magnitude</code> or <code>target == null</code>) in the Watches pane to track them as you step.
            </div>
        </div>
        <div class="lab-box-trap">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">The Trap: Restarting Play Mode to Place Breakpoints</div>
            Stopping Play Mode to add or move breakpoints is unnecessary. You can place, remove, and edit breakpoints while Play Mode is actively running.
        </div>
        <div class="lab-box-rule">
            <strong>The Rule:</strong> Attach your debugger at the start of your work session so you can pause on any bug in seconds.
        </div>
    </div>
    `
  },
  {
    "title": "Pausing Only on the Bug Frame: Conditional Breakpoints",
    "origImg": "",
    "notes": "Conditional Breakpoints (5 min): Normal breakpoints inside Update freeze 60 times a second. Setting a boolean condition pauses execution only when the exact bug condition triggers.",
    "content": `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title primary">4 Steps to Set a Conditional Breakpoint</div>
                <div class="card-body">
                    <div class="punchy-point">
                        <span class="punchy-tag" style="background:#0284c7; color:#ffffff;">1. PLACE DOT</span>
                        <span>Left-click gutter or <code>F9</code> to place red dot.</span>
                    </div>
                    <div class="punchy-point">
                        <span class="punchy-tag" style="background:#d97706; color:#ffffff;">2. RIGHT-CLICK DOT</span>
                        <span>Open breakpoint settings popup.</span>
                    </div>
                    <div class="punchy-point">
                        <span class="punchy-tag" style="background:#7c3aed; color:#ffffff;">3. TYPE CONDITION</span>
                        <span>Enter C# condition e.g. <code>other.CompareTag("Boss")</code> &amp; press Enter.</span>
                    </div>
                    <div class="punchy-point">
                        <span class="punchy-tag" style="background:#059669; color:#ffffff;">4. PLAY IN UNITY</span>
                        <span>Unity runs at 60 FPS and pauses automatically when condition is true.</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="standalone-img-card img-edit-card borderless" style="margin-top: 6px;">
                <div class="img-title">CONDITIONAL BREAKPOINT POPUP (RIDER)</div>
                <div class="img-frame" style="width: 100%; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                    <img src="assets/rider_conditional_breakpoint.png" alt="Rider Conditional Breakpoint Gutter and Popup" />
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px; width: 100%; font-size: 0.68rem;">
                    <div style="background: #070b14; border: 1px solid #1e293b; border-radius: 4px; padding: 3px 8px;">
                        <span style="color: #94a3b8;">Tag Match: </span><code style="color: #4ade80;">other.CompareTag("Boss")</code>
                    </div>
                    <div style="background: #070b14; border: 1px solid #1e293b; border-radius: 4px; padding: 3px 8px;">
                        <span style="color: #94a3b8;">Threshold: </span><code style="color: #facc15;">damage &gt; 50f</code>
                    </div>
                    <div style="background: #070b14; border: 1px solid #1e293b; border-radius: 4px; padding: 3px 8px;">
                        <span style="color: #94a3b8;">Underflow: </span><code style="color: #f87171;">currentAmmo &lt; 0</code>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <details class="slide-accordion tier-accordion">
        <summary class="accordion-header">
            <span>[Condition Syntax] What Expressions Are Supported?</span>
            <span class="accordion-expand">Expand</span>
        </summary>
        <div class="accordion-body">
            You can write standard C# expressions in the Condition field: null checks (<code>target == null</code>), boolean states (<code>!isGrounded &amp;&amp; velocity.y &gt; 0</code>), or frame boundaries (<code>Time.frameCount &gt; 200</code>). If the expression evaluates to true, the game pauses; otherwise it continues at full speed.
        </div>
    </details>

    <div class="lab-deep-dive">
        <div class="lab-deep-dive-header">
            <div class="lab-deep-dive-title">
                <span>LAB MODE STUDY GUIDE: CONDITIONAL BREAKPOINT SETUP</span>
            </div>
            <span class="lab-deep-dive-badge">BREAKPOINT SPEC</span>
        </div>
        <div class="lab-mental-model">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model: The Smart Trap</div>
            A regular breakpoint stops every visitor at the front door. A conditional breakpoint only rings the bell when someone arrives with an unexpected key.
        </div>
        <div class="lab-grid-2col">
            <div class="lab-box-neutral">
                <strong>Smooth Performance:</strong><br>
                The condition runs natively in the debugger. Unmatched frames continue running without stutter in the Editor.
            </div>
            <div class="lab-box-neutral">
                <strong>Hit Count Filters:</strong><br>
                You can also configure breakpoints to pause only after they have been hit a specific number of times (e.g. hit count &gt;= 10).
            </div>
        </div>
        <div class="lab-box-trap">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">The Trap: State Mutation Inside Breakpoint Conditions</div>
            Calling methods that alter state inside conditions (e.g. <code>TakeDamage()</code>). Keep breakpoint conditions strictly read-only.
        </div>
        <div class="lab-box-rule">
            <strong>The Rule:</strong> Use conditional breakpoints whenever debugging code that runs every frame.
        </div>
    </div>
    `
  },
  {
    "title": "\"Who Opened My Door?\" — Reading the Call Stack",
    "origImg": "",
    "notes": "Call Stack (5 min): Explain why guessing across script boundaries wastes hours. When a door opens unexpectedly, putting a breakpoint inside OpenDoor() shows the entire chain of callers.",
    "content": `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title primary">Trace Who Called Your Method</div>
                <div class="card-body">
                    <ul style="padding-left: 18px; margin: 0; line-height: 1.5; font-weight: 600;">
                        <li>"Why did the door open?" — 3 different scripts can call it.</li>
                        <li>Place a breakpoint inside <code>OpenDoor()</code>.</li>
                        <li>The <strong>Call Stack</strong> shows the exact chain of callers.</li>
                        <li>Double-click any line in the stack to jump to that caller!</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="standalone-img-card borderless" style="margin-top: 6px;">
                <div class="img-title">VISUAL STUDIO / RIDER: CALL STACK WINDOW</div>
                <div class="img-frame">
                    <img src="assets/vs_call_stack.png" alt="Visual Studio Call Stack Window Screenshot" />
                </div>
                <div style="font-size: 0.68rem; color: #475569; font-weight: 600; margin-top: 4px;">
                    Double-click any line in the Call Stack to jump directly to that caller.
                </div>
            </div>
        </div>
    </div>

    <details class="slide-accordion tier-accordion">
        <summary class="accordion-header">
            <span>[Stack Anatomy] Understanding Stack Frames and Locals</span>
            <span class="accordion-expand">Expand</span>
        </summary>
        <div class="accordion-body">
            Each line in the Call Stack represents a stack frame: an active method call waiting for lower methods to finish. Double-clicking a frame updates your IDE's Locals window to display the variables and parameters of that specific calling function, letting you inspect earlier state.
        </div>
    </details>

    <div class="lab-deep-dive">
        <div class="lab-deep-dive-header">
            <div class="lab-deep-dive-title">
                <span>LAB MODE STUDY GUIDE: CALL STACK FORENSICS</span>
            </div>
            <span class="lab-deep-dive-badge">TRACE SPEC</span>
        </div>
        <div class="lab-mental-model">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model: The Breadcrumb Trail</div>
            The Call Stack is an inverted breadcrumb trail showing how execution arrived at the current line of code.
        </div>
        <div class="lab-grid-2col">
            <div class="lab-box-neutral">
                <strong>Frame Navigation:</strong><br>
                Double-clicking previous frames lets you inspect arguments passed by caller methods without restarting.
            </div>
            <div class="lab-box-neutral">
                <strong>Clear Answers:</strong><br>
                Instead of arguing over who broke an interaction, the stack trace shows the exact line and argument responsible.
            </div>
        </div>
        <div class="lab-box-trap">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">The Trap: Guessing Across Script Boundaries</div>
            Searching through 10 teammate scripts looking for method calls. Placing one breakpoint in the receiver shows the caller immediately.
        </div>
        <div class="lab-box-rule">
            <strong>The Rule:</strong> When a method runs unexpectedly, place a breakpoint inside it and read the Call Stack.
        </div>
    </div>
    `
  },
  {
    "title": "Milestone 3: Attach Debugger & Trace Call Stack (15 Min)",
    "origImg": "",
    "notes": "Milestone 3 (15 min): Attach the debugger to Unity, trigger a conditional breakpoint, step with F10, explain every line to your peer, and check off the 3 milestone boxes.",
    "content": `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card info">
                <div class="card-title info">15-Minute Challenge: Step &amp; Inspect</div>
                <div class="card-body">
                    <ol style="padding-left: 16px; margin: 0 0 10px 0; line-height: 1.5; font-size: 0.74rem; font-weight: 600;">
                        <li>Attach your debugger (Rider / Visual Studio) to Unity.</li>
                        <li>Set a conditional breakpoint inside your mechanic.</li>
                        <li>Trigger the condition in Play Mode to pause execution.</li>
                        <li>Step with <code>F10</code> and explain each line to your teammate.</li>
                    </ol>
                    <div style="font-weight: 700; color: #0369a1; font-size: 0.72rem; margin-bottom: 4px;">3-MILESTONE RECAP:</div>
                    <ul style="padding-left: 16px; margin: 0; line-height: 1.45; font-size: 0.72rem; font-weight: 600;">
                        <li>[x] <strong>1. Decomposition:</strong> 4 primitives mapped &amp; gizmos drawn in <code>_Sandbox</code></li>
                        <li>[x] <strong>2. Fast Dev Tools:</strong> <code>F1–F3</code> warp, slow-mo, <code>[ContextMenu]</code> &amp; <code>F12</code> debug HUD</li>
                        <li>[x] <strong>3. Debugger:</strong> Conditional breakpoints &amp; Call Stack verified</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="media-panel-card" style="padding: 12px; gap: 8px;">
                <div style="font-weight: 800; color: #0369a1; text-transform: uppercase; width: 100%; font-size: 0.75rem;">
                    MILESTONE TIMEBOX: 15 MINUTES
                </div>
                <div style="width: 100%; padding: 12px; background: #070b14; border: 1px solid #1e293b; border-radius: 8px; text-align: center;">
                    <div id="cTimer3" style="font-size: 2.4rem; font-weight: 900; font-family: monospace; color: #38bdf8; letter-spacing: 2px;">
                        15:00
                    </div>
                    <div class="lecturer-timer-controls" id="controls_cTimer3" style="display: flex; gap: 8px; justify-content: center; margin-top: 8px;">
                        <button class="interactive-action-btn" onclick="lecturerStartTimer('cTimer3', 900)">Start 15:00</button>
                        <button class="interactive-action-btn secondary" onclick="lecturerPauseTimer('cTimer3')">Pause</button>
                        <button class="interactive-action-btn secondary" onclick="lecturerResetTimer('cTimer3', 900)">Reset</button>
                    </div>
                </div>
            </div>

            <div class="content-card primary" style="padding: 10px; margin-top: 8px;">
                <div class="card-title primary" style="font-size: 0.75rem; margin-bottom: 6px;">
                    DEBUGGER HOTKEYS
                </div>
                <div style="display: grid; grid-template-columns: auto 1fr; gap: 4px 10px; align-items: center; font-size: 0.70rem;">
                    <kbd style="background: #0f172a; color: #38bdf8; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-weight: 700; text-align: center; border: 1px solid #1e293b;">F9</kbd>
                    <span style="color: #0f172a; font-weight: 600;">Toggle Breakpoint (Pause on line)</span>

                    <kbd style="background: #0f172a; color: #4ade80; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-weight: 700; text-align: center; border: 1px solid #1e293b;">F10</kbd>
                    <span style="color: #0f172a; font-weight: 600;">Step Over (Execute next line)</span>

                    <kbd style="background: #0f172a; color: #c084fc; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-weight: 700; text-align: center; border: 1px solid #1e293b;">F11</kbd>
                    <span style="color: #0f172a; font-weight: 600;">Step Into (Enter called function)</span>

                    <kbd style="background: #0f172a; color: #c084fc; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-weight: 700; text-align: center; border: 1px solid #1e293b;">Shift + F11</kbd>
                    <span style="color: #0f172a; font-weight: 600;">Step Out (Return to caller)</span>

                    <kbd style="background: #0f172a; color: #38bdf8; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-weight: 700; text-align: center; border: 1px solid #1e293b;">F5</kbd>
                    <span style="color: #0f172a; font-weight: 600;">Resume (Continue execution at 60 FPS)</span>

                    <span style="background: #0f172a; color: #facc15; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-weight: 700; text-align: center; border: 1px solid #1e293b;">Call Stack</span>
                    <span style="color: #0f172a; font-weight: 600;">Double-click stack frame to inspect caller</span>
                </div>
            </div>
        </div>
    </div>
    `
  }
];

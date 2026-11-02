module.exports = [
  {
    "isHero": true,
    "title": "Dev - Lesson 08: Problem Solving & Dev Tooling",
    "subtitle": "Minor Game Design & Development • Hogeschool Rotterdam",
    "topics": [
      "1. Working with Coding Agents (Diagnosis + Options First)",
      "2. Breaking Down 3D Mechanics in a Sandbox + Gizmos",
      "3. Fast Dev Tools (Teleport, Slow-Mo, [ContextMenu] & On-Screen Watch)",
      "4. Rider / VS Debugger, Conditional Breakpoints & Call Stack"
    ],
    "origImg": "",
    "notes": "Welcome to Lesson 08. In a 15-person team, 2 to 4 programmers build the systems that 11 to 13 teammates use every day. Today is about taking full control of your codebase: breaking mechanics down before asking AI to code, building clean test scenes with live Gizmos, making prefabs unbreakable, and building cheats so you never waste time walking across a level to test a jump.",
    "content": ""
  },
  {
    "title": "Working in a 15-Person Team: Where Dev Time Goes",
    "origImg": "",
    "notes": "Team Dynamics: In a studio team, most bugs are in the Scene, Inspector, or Physics settings, not in C# syntax. If you don't build defensive scripts and fast test tools, you will spend your sprints fixing broken Inspector fields and walking through empty levels.",
    "content": `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card danger">
                <div class="card-title danger">Why Devs Get Stuck in 15-Person Teams</div>
                <div class="card-body">
                    <ul style="padding-left: 18px; margin: 0; line-height: 1.6; font-weight: 600;">
                        <li><strong>Team Imbalance:</strong> 2-4 programmers vs 11-13 non-coders in 1 shared project.</li>
                        <li><strong>Walking Across Levels:</strong> Spending 2 minutes walking just to test a 2-second mechanic.</li>
                        <li><strong>Scene Locking &amp; Merge Conflicts:</strong> Multiple people saving the main scene file at once.</li>
                        <li><strong>Inspector Fragility:</strong> Designers accidentally typing bad numbers or breaking prefab references.</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="content-card primary">
                <div class="card-title primary">Where Dev Time Goes (And How to Fix It)</div>
                <div class="card-body" style="display: flex; flex-direction: column; gap: 8px;">
                    <div class="punchy-point"><span class="punchy-tag" style="background:#0284c7; color:#ffffff;">1. TEAM RATIO</span> 2-4 devs vs 11-13 non-coders &rarr; Write clear error messages so teammates don't block you with vague bug reports.</div>
                    <div class="punchy-point"><span class="punchy-tag" style="background:#b91c1c; color:#ffffff;">2. WALKING VS CHEATS</span> Walking 2 min to test a trigger &rarr; Build 1-key instant teleports, god mode, and <code>[ContextMenu]</code> resets.</div>
                    <div class="punchy-point"><span class="punchy-tag" style="background:#ea580c; color:#ffffff;">3. SCENE LOCKS VS SANDBOX</span> 15 devs saving main scene = merge conflicts &rarr; Build mechanics in your private sandbox scene first.</div>
                    <div class="punchy-point"><span class="punchy-tag" style="background:#059669; color:#ffffff;">4. INSPECTOR VS CHECKS</span> Unhandled missing references &rarr; Validate ranges in <code>OnValidate()</code> and guard code defensively.</div>
                </div>
            </div>
        </div>
    </div>

    <details class="slide-accordion tier-accordion">
        <summary class="accordion-header">
            <span>[Team Workflow] The Hidden Cost of Walking and Guessing</span>
            <span class="accordion-expand">Expand</span>
        </summary>
        <div class="accordion-body">
            If you test a jump 30 times a day and spend 60 seconds walking across a level each time, that is 30 minutes lost every single day. When a trigger fails, asking an AI to rewrite working C# scripts without diagnosing the root cause wastes entire afternoons. Dev cheats and defensive checks save hours of debugging time every sprint.
        </div>
    </details>

    <div class="lab-deep-dive">
        <div class="lab-deep-dive-header">
            <div class="lab-deep-dive-title">
                <span>LAB MODE STUDY GUIDE: TEAM DEBUGGING HABITS</span>
            </div>
            <span class="lab-deep-dive-badge">STUDIO WORKSHOP</span>
        </div>
        <div class="lab-mental-model">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model: Build Tools for Your Teammates</div>
            In a game studio, your job is making systems that your designers and artists can tune safely. Write code that warns them before things break and gives them immediate feedback.
        </div>
        <div class="lab-grid-2col">
            <div class="lab-box-neutral">
                <strong>Common Pain Points:</strong><br>
                Teammates pull broken prefabs from Git, enter negative speeds, or misplace trigger colliders in the Scene.
            </div>
            <div class="lab-box-neutral">
                <strong>Dev Countermeasures:</strong><br>
                Build clean sandbox scenes, clamp numbers in <code>OnValidate()</code>, and test with <code>[ContextMenu]</code>.
            </div>
        </div>
        <div class="lab-box-trap">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">The Trap: Blaming Non-Coders for Crashes</div>
            If a designer enters 0 into your speed field and your game crashes with a division by 0 error, that is a code bug that your script should prevent.
        </div>
        <div class="lab-box-rule">
            <strong>The Rule:</strong> Guard every Inspector field with minimum limits so bad input cannot break gameplay.
        </div>
    </div>
    `
  },
  {
    "title": "Prototyping with Coding Agents: The Wins vs. The Losses",
    "origImg": "",
    "notes": "Coding Agents in Practice: Modern AI tools write C# quickly and it compiles on the first try. That is great for quick tests, but dangerous in a team project if you don't read the code or understand what it does.",
    "content": `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card success">
                <div class="card-title success">Why It Worked in Week 1</div>
                <div class="card-body">
                    <ul style="padding-left: 18px; margin: 0; line-height: 1.5; font-weight: 600;">
                        <li>Agent edits .cs files and compiles right away.</li>
                        <li>You click Accept All and see movement in 2 minutes.</li>
                        <li>Great for quick throwaway prototypes.</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="content-card danger">
                <div class="card-title danger">What Breaks in Week 3</div>
                <div class="card-body">
                    <ul style="padding-left: 18px; margin: 0; line-height: 1.5; font-weight: 600;">
                        <li>Clicking Accept All without reading diffs leaves you clueless.</li>
                        <li>After 3 days, you don't know your own code.</li>
                        <li>Big prompts make the agent edit 5 shared files at once.</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <details class="slide-accordion tier-accordion">
        <summary class="accordion-header">
            <span>[Code Ownership] 3 Questions to Ask Before Accepting an AI Edit</span>
            <span class="accordion-expand">Expand</span>
        </summary>
        <div class="accordion-body">
            Before accepting any code into Git, make sure you can answer three simple questions: Which line moves the character? What happens if an Inspector reference is missing? And does this edit touch files that other teammates are working on? If you cannot answer these, do not commit the change.
        </div>
    </details>

    <div class="lab-deep-dive">
        <div class="lab-deep-dive-header">
            <div class="lab-deep-dive-title">
                <span>LAB MODE STUDY GUIDE: STAYING IN CONTROL OF AI CODE</span>
            </div>
            <span class="lab-deep-dive-badge">CODE OWNERSHIP</span>
        </div>
        <div class="lab-mental-model">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model: You Are the Author, AI Is the Keyboard</div>
            AI generates syntax at lightning speed, but you decide how the system works. Understand every method before it lands in your team repository.
        </div>
        <div class="lab-grid-2col">
            <div class="lab-box-neutral">
                <strong>The Blind Accept Habit:</strong><br>
                Giving big vague prompts and accepting whole files. When a designer asks for a tweak tomorrow, you do not know where to look.
            </div>
            <div class="lab-box-neutral">
                <strong>The Senior Dev Habit:</strong><br>
                Breaking the feature into small steps first, giving tight prompts for one method, and reading every line before saving.
            </div>
        </div>
        <div class="lab-box-trap">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">The Trap: Out-of-Control Edits</div>
            Letting an AI rewrite entire files when only one method needed an update. Small, focused prompts prevent unexpected regressions.
        </div>
        <div class="lab-box-rule">
            <strong>The Rule:</strong> If you cannot explain what a line does with your laptop screen turned off, do not commit it to Git.
        </div>
    </div>
    `
  },
  {
    "title": "Why \"Fix It\" Fails: The Band-Aid Trap",
    "origImg": "",
    "notes": "The Fix-It Trap: When you just say 'fix it', the agent will eventually make it work—but almost always in a hacky way with 150 lines of band-aid code. Always ask for a diagnosis and 2-3 options before letting it edit anything.",
    "content": `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card danger">
                <div class="card-title danger">What "Fix It" Actually Does</div>
                <div class="card-body">
                    <ul style="padding-left: 18px; margin: 0; line-height: 1.5; font-weight: 600;">
                        <li>Telling an agent "fix it" eventually gets it working.</li>
                        <li><strong>The catch:</strong> it uses hacky band-aid workarounds.</li>
                        <li>It adds 150 lines of extra booleans and flags.</li>
                        <li>After 3 prompts, your script is bloated and fragile.</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="content-card primary">
                <div class="card-title primary">Studio AI Protocol: Do vs. Don't</div>
                <div class="card-body">
                    <table class="dense-table" style="width: 100%; border-collapse: separate; border-spacing: 0 4px;">
                        <thead>
                            <tr>
                                <th style="background: #fee2e2; color: #991b1b !important; font-weight: 800; padding: 6px 10px; border-radius: 4px 0 0 4px;">Don't (The Trap)</th>
                                <th style="background: #dcfce7; color: #166534 !important; font-weight: 800; padding: 6px 10px; border-radius: 0 4px 4px 0;">Do (Senior Dev Habit)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="background: #fef2f2; color: #991b1b !important; font-weight: 700; padding: 6px 10px; border-bottom: 1px solid #fee2e2;">Prompting <em>"Fix it"</em> or <em>"Make it work"</em></td>
                                <td style="background: #f0fdf4; color: #166534 !important; font-weight: 700; padding: 6px 10px; border-bottom: 1px solid #dcfce7;"><em>"Explain root cause &amp; give 2-3 options first"</em></td>
                            </tr>
                            <tr>
                                <td style="background: #fef2f2; color: #991b1b !important; font-weight: 700; padding: 6px 10px; border-bottom: 1px solid #fee2e2;">Clicking <strong>Accept All</strong> blindly without reading diffs</td>
                                <td style="background: #f0fdf4; color: #166534 !important; font-weight: 700; padding: 6px 10px; border-bottom: 1px solid #dcfce7;">Read diff line-by-line; reject untouched files</td>
                            </tr>
                            <tr>
                                <td style="background: #fef2f2; color: #991b1b !important; font-weight: 700; padding: 6px 10px; border-bottom: 1px solid #fee2e2;">Letting agent edit 5 shared team scripts</td>
                                <td style="background: #f0fdf4; color: #166534 !important; font-weight: 700; padding: 6px 10px; border-bottom: 1px solid #dcfce7;">Scope prompts to 1 method or pure math helper</td>
                            </tr>
                            <tr>
                                <td style="background: #fef2f2; color: #991b1b !important; font-weight: 700; padding: 6px 10px; border-bottom: 1px solid #fee2e2;">Accepting parameters you don't understand</td>
                                <td style="background: #f0fdf4; color: #166534 !important; font-weight: 700; padding: 6px 10px; border-bottom: 1px solid #dcfce7;"><em>"Prompt: Explain what this LayerMask does &amp; provide 2 options"</em></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <details class="slide-accordion tier-accordion">
        <summary class="accordion-header">
            <span>[Workflow] Why Diagnosis &amp; Options Save You Hours</span>
            <span class="accordion-expand">Expand</span>
        </summary>
        <div class="accordion-body">
            When you ask for options before code changes, you force the agent to explain its reasoning. You see whether the issue is a math mistake, an Inspector reference, or an edge case. You understand the fix, you choose the cleanest option, and your script stays lean.
        </div>
    </details>

    <div class="lab-deep-dive">
        <div class="lab-deep-dive-header">
            <div class="lab-deep-dive-title">
                <span>LAB MODE STUDY GUIDE: DIAGNOSIS-FIRST PROTOCOL</span>
            </div>
            <span class="lab-deep-dive-badge">DEV WORKFLOW</span>
        </div>
        <div class="lab-mental-model">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model: The Doctor Before the Surgeon</div>
            A good doctor doesn't operate the moment you walk into the room. They diagnose the issue, explain the choices, and pick the cleanest treatment.
        </div>
        <div class="lab-grid-2col">
            <div class="lab-box-neutral">
                <strong>Ask for Explanation:</strong><br>
                If the agent suggests a function or vector formula you don't know, ask: <em>"Explain what this function does and what each parameter means."</em>
            </div>
            <div class="lab-box-neutral">
                <strong>Pick the Cleanest Option:</strong><br>
                Always select the solution with the fewest moving parts and fewest added fields to keep your codebase maintainable.
            </div>
        </div>
        <div class="lab-box-trap">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">The Trap: Accepting 150 Lines of Workaround Code</div>
            Letting the agent add nested boolean checks and fallback timers to force a feature to work instead of fixing the root cause.
        </div>
        <div class="lab-box-rule">
            <strong>The Rule:</strong> Never prompt "fix it". Ask for diagnosis and 2 to 3 options, then pick the cleanest approach.
        </div>
    </div>
    `
  },
  {
    "title": "How to Stay in Control of Your Code",
    "origImg": "",
    "notes": "Control Strategy: Give students 4 golden rules before jumping into Part 1. Break mechanics into 4 steps, ask for options, pick the cleanest solution, and verify in a sandbox scene.",
    "content": `
    <div class="split-media-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title primary">4 Rules Before Writing Code</div>
                <div class="card-body">
                    <div class="punchy-point"><span class="punchy-tag" style="background:#0284c7; color:#ffffff;">1. DECOMPOSE</span> Break mechanics into 4 simple steps first.</div>
                    <div class="punchy-point"><span class="punchy-tag" style="background:#059669; color:#ffffff;">2. ASK OPTIONS</span> Ask for 2-3 options before changing any code.</div>
                    <div class="punchy-point"><span class="punchy-tag" style="background:#d97706; color:#ffffff;">3. PICK CLEAN</span> Have AI explain new math, then pick the best fit.</div>
                    <div class="punchy-point"><span class="punchy-tag" style="background:#7c3aed; color:#ffffff;">4. SANDBOX</span> Test in an isolated scene and check your Inspector.</div>
                </div>
            </div>
        </div>

        <div class="right-column">
            <div class="content-card info">
                <div class="card-title info">Our Plan for Today</div>
                <div class="card-body">
                    <ul style="padding-left: 18px; margin: 0; line-height: 1.5; font-weight: 600;">
                        <li><strong>Part 1:</strong> 4 steps, Sandbox scene, SphereCast &amp; Gizmos.</li>
                        <li><strong>Part 2:</strong> Fast dev tools, teleporting, [ContextMenu] &amp; on-screen watch.</li>
                        <li><strong>Part 3:</strong> Rider debugger breakpoints, stepping &amp; Call Stack.</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <details class="slide-accordion tier-accordion">
        <summary class="accordion-header">
            <span>[Workflow Contract] The 4 Rules for Clean Code</span>
            <span class="accordion-expand">Expand</span>
        </summary>
        <div class="accordion-body">
            By decomposing mechanics into 4 steps and testing them in a clean sandbox scene, you keep full ownership of your systems. Prompts stay focused on understanding options, and you use Gizmos and breakpoints to verify how the code behaves in Unity.
        </div>
    </details>

    <div class="lab-deep-dive">
        <div class="lab-deep-dive-header">
            <div class="lab-deep-dive-title">
                <span>LAB MODE STUDY GUIDE: CODE CONTROL FRAMEWORK</span>
            </div>
            <span class="lab-deep-dive-badge">DEV BEST PRACTICE</span>
        </div>
        <div class="lab-mental-model">
            <div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model: Structure First, Syntax Second</div>
            Good programming is about clear structure. When you define the steps and understand the options yourself, writing or generating the code becomes fast, simple, and safe.
        </div>
        <div class="lab-grid-2col">
            <div class="lab-box-neutral">
                <strong>Step Isolation:</strong><br>
                Keeping input, physics checks, movement, and feedback in separate methods makes debugging fast and straightforward.
            </div>
            <div class="lab-box-neutral">
                <strong>Verification Tools:</strong><br>
                Drawing Gizmos and setting Rider breakpoints gives you real visual proof of what your math is doing.
            </div>
        </div>
        <div class="lab-box-trap">
            <div style="font-weight: 800; color: #991b1b; margin-bottom: 4px;">The Trap: Writing Mechanics Inside Monolithic Scripts</div>
            Writing everything inside a 300-line PlayerController script without decomposing first guarantees merge conflicts with teammates.
        </div>
        <div class="lab-box-rule">
            <strong>The Rule:</strong> Decompose into 4 steps, test in a sandbox scene, and read every line before committing to Git.
        </div>
    </div>
    `
  }
];

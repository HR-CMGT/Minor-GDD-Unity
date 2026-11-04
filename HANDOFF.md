# Agent Handoff Guide: HR-CMGT Unity 6 Curriculum Engineering

This handoff document is written for any incoming AI agent or software engineer working in **any agent harness** (Antigravity, Cursor, Claude Code, Cline, Copilot Agent, Windsurf, or plain CLI). It contains the complete operating manual for designing, coding, testing, tweaking, and deploying lesson decks and study guides for the **Minor Game Design & Development** at **Hogeschool Rotterdam**.

---

## 1. Project Overview & Student Context

- **Institution:** Hogeschool Rotterdam (HR) — Creative Media & Game Technologies (CMGT).
- **Course:** Minor Game Design & Development (Minor GDD).
- **Target Engine:** **Unity 6 LTS** (Unity 6000.x) with C# 12 / .NET Standard 2.1.
- **Student Persona:**
  - Multi-disciplinary studio teams of ~15 students (2–4 Programmers/Devs, 5–6 Designers, 5–6 Artists).
  - Programmers are responsible for building clean, modular, designer-proof systems, fast testing loops, and robust runtime code for their team's 3D game.
  - Time format: 120-minute studio dev workshops featuring timed milestone exercises (15–20 minutes each).

---

## 2. Git Remotes & Production Pipeline

The repository uses two Git remotes:
- **`cmgt` (Public Upstream):** `git@github.com:HR-CMGT/Minor-GDD-Unity.git`
  - Serves the live curriculum via **GitHub Pages** from the root and `/docs` directory.
  - Live URL: `https://hr-cmgt.github.io/Minor-GDD-Unity/`
- **`origin` / `personal` (Private Backup):** `git@github.com:studiohichambendriss-create/Minor-GDD-Unity-Private.git`
  - Used for personal multi-machine syncing and experimental backups.

### The Golden Rule of GitHub Pages Deployments
> [!IMPORTANT]
> **No Edit Mode in Public Releases:**
> Files inside `docs/` (`docs/index.html`, `docs/presentation_*/index.html`) MUST NEVER contain active Edit Mode buttons, edit toolbars, or editor script loaders. They must remain pristine, lightweight, and student-facing.
> Local files (`presentation_*/index.html`, `index.html`) keep the local WYSIWYG Deck Editor enabled so the lecturer can live-edit on their own machine.

---

## 3. Curriculum Progression Map (What Has Been Taught)

When designing new lessons (e.g., Lesson 09, Lesson 10), **NEVER** re-teach concepts that students have already mastered. Always build forward.

| Lesson | Code / Slug | Core Topics Taught | Status |
|---|---|---|---|
| **01** | `01_basics1` | Unity 6 Editor anatomy, GameObjects, Transform math, Vectors, `Translate` vs Rigidbody physics (`rb.linearVelocity`), Input System basics. | Complete |
| **02** | `02_basics2` | Scripting foundations, Coroutines (`IEnumerator`), timing loops, ScriptableObject data containers. | Complete |
| **03** | `03_UI` | Mobile Canvas Scaler (`Match Height 1.0`), `SafeAreaFitter.cs` (notches/Dynamic Island), anchors/pivots, event-driven UI (`Action<T>`), JSON save system (`JsonUtility` + `persistentDataPath`), `OnApplicationPause`. | Complete |
| **04** | `04_architecture` | Modular decoupled architecture, ScriptableObject Event Channels (no singletons), Black-Box Prefabs, Additive Scene Loading. | Complete |
| **05** | `05_release_polish` | Release candidate polish, Screen faders, `AnimationCurve` micro-animations, audio randomization, online leaderboards, playtest telemetry. | Complete |
| **06 / 07** | `07_blockprototyping` | 3D Greyboxing with ProBuilder (1m grid, vertex snapping), modular greybox kits, 3D `CharacterController` (camera-relative vector math), Cinemachine 3 (`CinemachineCamera`), NavMesh agent NPCs, 3D interactable loop. | Complete |
| **08** | `08_problemsolving` | Escaping "Passenger Mode" with coding agents, breaking 3D mechanics into the 4 Primitives (`Input` -> `Spatial Query` -> `State & Math` -> `Feedback`), reading Unity 6 API overloads (`F12`), `Physics.SphereCast` vs `Raycast`, `Vector3.Dot` aim cones, `OnDrawGizmosSelected`, `[ContextMenu]` right-click testing, `OnValidate` layer/range guards, checkpoint teleportation (`F1-F3`), `Time.timeScale` scrubbing, `DevWatch` live HUD, IDE Debugger attachment, conditional breakpoints, Call Stack forensics. | Complete |
| **09** | `09_gamejam2` | Midterm Playtest Demo & Game Jam Sprint. | Upcoming |
| **10** | `10_architecture2` | Advanced Architecture: Finite State Machines (FSM), Hierarchical State Machines, Object Pooling, Refactoring team codebases. | Upcoming |

---

## 4. Presentation Deck Architecture & Libraries

Every presentation deck lives in `presentation_<slug>/` and is compiled using a Node.js generator script (`node presentation_<slug>/generate.js`).

### File Organization of a Lesson Deck
```
presentation_<slug>/
├── generate.js                  # Compiles slides into 6 HTML output files
├── index.html                   # Local presentation entrypoint (with Edit Mode)
├── presentation_unity6_<slug>.html # Local presentation mirror
├── assets/                      # Deck images, diagrams, screenshots
│   ├── HR_Logo.jpg
│   └── ...
└── slides/                      # Modular slide data array files
    ├── index.js                 # Exports combined slides array [...part1, ...part2, ...]
    ├── slides_intro_ai.js       # Hero slide + Context slides (Slides 1–5)
    ├── slides_part1.js          # Part 1 + Milestone 1 (Slides 6–14)
    ├── slides_part2.js          # Part 2 + Milestone 2 (Slides 15–20)
    └── slides_part3.js          # Part 3 + Milestone 3 (Slides 21–25)
```

### The 6 Target Output Files
When `node presentation_<slug>/generate.js` executes, it generates and synchronizes exactly 6 files:
1. `presentation_<slug>/index.html` (Local with Edit Mode)
2. `presentation_<slug>/presentation_unity6_<slug>.html` (Local with Edit Mode)
3. `presentation_unity6_<slug>.html` (Local root mirror with Edit Mode)
4. `docs/presentation_<slug>/index.html` (Docs clean public release)
5. `docs/presentation_<slug>/presentation_unity6_<slug>.html` (Docs clean public release)
6. `docs/presentation_unity6_<slug>.html` (Docs root mirror clean public release)

### Dual-Target Compilation Engine
Inside `generate.js`:
```javascript
// docsHtml is 100% clean presentation HTML for GitHub Pages
const docsHtml = fullHtml;

// localHtml injects Edit Mode button, edit CSS, and editor script loader
let localHtml = fullHtml;
localHtml = localHtml.replace('</style>', editCss + '\n    </style>');
localHtml = localHtml.replace('<a href="../index.html" class="portal-nav-btn"', editBtnHtml + '\n            <a href="../index.html" class="portal-nav-btn"');
localHtml = localHtml.replace('</body>', editScript + '\n</body>');

// Write local targets
fs.writeFileSync(outPath, localHtml, 'utf8');
fs.writeFileSync(indexPath, localHtml, 'utf8');
fs.writeFileSync(rootOutPath, localHtml, 'utf8');

// Write docs targets (clean for GitHub Pages)
fs.writeFileSync(docsOutPath, docsHtml, 'utf8');
fs.writeFileSync(docsIndexPath, docsHtml, 'utf8');
fs.writeFileSync(docsRootOutPath, docsHtml, 'utf8');
```

---

## 5. Built-in Presentation Libraries & Features

Every compiled deck includes the following built-in systems (no external npm dependencies required in the browser):

1. **Dual Mode Presentation:**
   - **Lecture Mode (`[P]` or toggle button):** Clean, uncluttered slides designed for front-of-class projection. Compact bullet points and syntax-highlighted code blocks.
   - **Lab Mode (`[L]` or toggle button):** Automatically expands `.lab-deep-dive` study guides (`Mental Model`, `The Trap`, `The Rule`) and tier accordions for self-paced student lab work.
2. **Keyboard Navigation:**
   - Next Slide: `Right Arrow`, `Space`, `PageDown`
   - Previous Slide: `Left Arrow`, `PageUp`
   - Toggle Fullscreen: `[F]`
   - Slide Overview Drawer: `[ESC]` or Click Drawer Icon
   - Speaker Notes: `[N]`
   - Teacher PIN Mode: `[T]` (PIN: `7331`)
   - Shortcuts Help Modal: `[?]`
3. **Timed Milestone Timers (`cTimerX`):**
   - Self-contained countdown timers embedded inside Milestone slides (`data-duration="1200"` for 20 min, `data-duration="900"` for 15 min).
   - Features Start/Pause/Reset buttons and visual urgency color transitions (Green -> Amber -> Red).
4. **JetBrains Rider C# Syntax Highlighter:**
   - Syntax classes: `.jb-keyword`, `.jb-type`, `.jb-method`, `.jb-attr`, `.jb-string`, `.jb-number`, `.jb-comment`, `.jb-plain`.
   - Dark theme matching Rider/Visual Studio with 1-click `Copy` button.
5. **Container Query Typography:**
   - Uses CSS Container Queries (`cqw`, `cqh`) on the 16:9 `.slide-viewport` so text and cards scale perfectly across any projector or laptop resolution without clipping.

---

## 6. The Local WYSIWYG Deck Editor (`scripts/hr_deck_editor.js`)

In local environments, lecturers can edit slide content, resize cards, swap columns, and update image URLs directly in the browser:
- **Toggle Shortcut:** **`Option+E`** (macOS) or **`Alt+E`** (Windows).
  - *Note:* Bare key `E` was intentionally removed to avoid accidental triggering while typing text or taking notes.
  - Also toggled via the header button: `Edit [⌥E]`.
- **Card Drag & Drop:** Grab the handle (`.deck-card-drag-handle`) to rearrange cards or move them between left and right columns.
- **Card Resizing:** Grab the bottom-right corner grip (`.glr-resize-grip`) to dynamically resize cards.
- **Image Controls Bar:**
  - In Edit Mode, all image cards reveal a flex bar with:
    - Text input (`.img-url-input`) pre-filled with the current image URL or path.
    - File upload button (`.img-upload-btn`) to load local PNG/JPG images via `FileReader`.
- **Clean Snapshot Auto-Save:**
  - Edits are saved to browser `localStorage`.
  - When saving, `history.getCleanSlideSnapshot()` strips transient editor markup (`.deck-card-action-bar`, `.glr-resize-grip`, `.img-controls-bar`) so the saved HTML remains completely clean.

---

## 7. How to Design & Build a New Lesson (Step-by-Step)

Follow this 5-step blueprint whenever building a new lesson:

### Step 1: Slide Breakdown Planning (20–25 Slides)
Structure the lesson around **3 clear parts** and **3 timed milestones**:
- **Slide 1 (Hero Slide, `isHero: true`):**
  - `title`: `"Dev - Lesson XX: [Topic Name]"`
  - `subtitle`: `"Minor Game Design & Development • Hogeschool Rotterdam"`
  - `content: ""` (MUST be an empty string `""`—Hero uses `topics` array for the 4-5 bullet cards).
- **Slide 2:** The 15-Person Team Reality / Core Problem (Why devs get stuck).
- **Slide 3–5:** Conceptual Framework & Mental Model.
- **Slide 6 (Divider, `isInverted: true`):** Part 1 Divider (1-sentence card, max 18 words, no accordions).
- **Slides 7–13:** Part 1 Core Concepts, C# code blocks, Visual diagrams.
- **Slide 14:** **Workshop Milestone 1** (20-min countdown timer `cTimer1`, 4 concrete steps, 3 verification checklist bullets).
- **Slide 15 (Divider, `isInverted: true`):** Part 2 Divider.
- **Slides 16–19:** Part 2 Practical Dev Tooling / Inspector testing.
- **Slide 20:** **Workshop Milestone 2** (20-min countdown timer `cTimer2`).
- **Slide 21 (Divider, `isInverted: true`):** Part 3 Divider.
- **Slides 22–24:** Part 3 Advanced Debugging / IDE Forensics.
- **Slide 25:** **Workshop Milestone 3** (15-min countdown timer `cTimer3` & Final Team Audit).

### Step 2: Slide Authoring Rules (Strict Word Limits)
- **STRICT WORD LIMIT:** Max 45–60 words of Lecture text per slide. Presentation slides are NOT essays!
- **Never stack full-width cards on top of 2-column layouts.** Start directly with:
  ```html
  <div class="split-media-layout">
      <div class="left-column">
          <!-- Max 1 card with 3-4 punchy bullets -->
      </div>
      <div class="right-column">
          <!-- Code box, image card, or comparison table -->
      </div>
  </div>
  ```
- **Punchy Points:** Use `<div class="punchy-point"><span class="punchy-tag" style="background:#0284c7; color:#ffffff;">TAG</span> Short sentence.</div>`.
  - Always use solid, high-contrast tag backgrounds (`#0284c7`, `#059669`, `#d97706`, `#b91c1c`, `#7c3aed`) with pure white text (`#ffffff !important`). Never use pale pastel backgrounds with white text.

### Step 3: Image Card Standards
All slide images must be clean, borderless, and un-clipped:
```html
<div class="standalone-img-card borderless" style="margin-top: 6px;">
    <div class="img-title">TITLE IN ALL CAPS</div>
    <div class="img-frame">
        <img src="assets/image_name.png" alt="Descriptive Alt Text" />
    </div>
</div>
```
CSS handles dimensions automatically:
```css
.standalone-img-card img {
    width: 100% !important;
    height: auto !important;
    max-height: 48cqh !important;
    object-fit: contain !important;
    display: block !important;
    border-radius: 6px;
}
```

### Step 4: Companion Student Markdown Guide (`classes/XX_<slug>.md`)
Write a complete, copy-paste-ready handbook matching the lesson slides:
- Fully written C# scripts with complete `using` declarations and namespace imports.
- Explicit step-by-step instructions for setting up scenes, prefabs, and IDE debugging.
- Checklists matching the 3 Milestone exercises in the presentation.

### Step 5: Landing Page & README Synchronization
1. In `index.html` (Local portal) and `docs/index.html` (Public portal):
   - Add the new active deck card under `.grid-decks`.
   - Add the guide link in `<footer>`.
2. In `README.md`:
   - Update the course schedule table row with links to both the handbook (`classes/XX_<slug>.md`) and slide deck (`presentation_<slug>/index.html`).

---

## 8. Strict Anti-Slop & Quality Rules (Non-Negotiable Standards)

Every file in the curriculum must adhere to these non-negotiable standards:

1. **STRICTLY 0 EMOJIS:**
   - No emojis anywhere in slides, handbooks, HTML files, or documentation. Emojis look unprofessional in university computer science curricula.
2. **STRICTLY NEVER USE THE WORD `"zero"` IN PROSE:**
   - Do not write `"zero singletons"`, `"zero merge conflicts"`, or `"zero latency"`.
   - Write `"0 singletons"`, `"no merge conflicts"`, `"no latency"`, or rephrase.
3. **STRICTLY MODERN UNITY 6 LTS APIS ONLY:**
   - Rigidbody velocity: Always `rb.linearVelocity` (NEVER `rb.velocity`).
   - Angular velocity: Always `rb.angularVelocity`.
   - Input System: Always `UnityEngine.InputSystem.Keyboard.current` or `PlayerInput` events (NEVER legacy `Input.GetKeyDown` or `Input.GetAxis`).
   - Cinemachine: Always Cinemachine 3.x (`CinemachineCamera`, NOT legacy `CinemachineVirtualCamera`).
   - Spatial queries: Use `Physics.SphereCast` or `Physics.OverlapSphereNonAlloc` with pre-allocated static `Collider[]` buffers (never `FindObjectsByType` in `Update()`).
   - Debugging: Always pass `this` as context (`Debug.LogWarning(msg, this)` or `Debug.Assert(cond, msg, this)`) so clicking the Console error instantly pings the offending GameObject in the Hierarchy.
4. **100% DEVELOPER ENGLISH:**
   - All slide prose, code comments, and documentation must be written in professional game developer English. No Dutch terms in slide content.

---

## 9. Verification Checklist Before Committing or Pushing

Before pushing changes to GitHub:
- [ ] Run `node presentation_<slug>/generate.js` to ensure clean compilation of all 6 target files.
- [ ] Verify image parity: Ensure all assets in `presentation_<slug>/assets/` are mirrored to `docs/presentation_<slug>/assets/`, `assets/`, and `docs/assets/`.
- [ ] Verify 0 emojis using Python regex: `python3 -c 'import re; ...'`
- [ ] Verify 0 prose occurrences of `"zero"`: `grep -i "\bzero\b" ...`
- [ ] Verify `docs/` is 100% clean of Edit Mode: `grep -n "btnEditToggle" docs/index.html docs/presentation_<slug>/index.html` must return 0 results.
- [ ] Check Git status: `git status` should only show the intended modified and new files.
- [ ] Push to `cmgt` remote: `git push cmgt master`.
- [ ] Verify live site: `https://hr-cmgt.github.io/Minor-GDD-Unity/`.

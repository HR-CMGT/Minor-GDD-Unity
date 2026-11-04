# Project Context: HR-CMGT Minor Game Design & Development (Unity 6)

This document contains the complete context, architectural history, current state, and operational guide for the curriculum overhaul project. It is saved in the repository to enable seamless context handoff between PCs, developers, and AI assistants.

---

## 1. Repository & Remotes Architecture

- **School Upstream Repository (`origin`)**:
  - URL: `https://github.com/HR-CMGT/Minor-GDD-Unity.git`
  - Purpose: Public curriculum repository hosted on GitHub Pages.
  - Policy: Changes are thoroughly developed and verified locally first before any push to upstream.
- **Personal Private Repository (`personal`)**:
  - URL: `https://github.com/studiohichambendriss-create/Minor-GDD-Unity-Private.git`
  - Purpose: Private backup and multi-machine synchronization repository.
  - Target Branch: `master`

### How to Synchronize on Another PC
```bash
# Option A: Fresh clone of private repository
git clone https://github.com/studiohichambendriss-create/Minor-GDD-Unity-Private.git HR
cd HR

# Option B: Existing clone connected to HR-CMGT
git remote add personal https://github.com/studiohichambendriss-create/Minor-GDD-Unity-Private.git
git fetch personal
git checkout master
git pull personal master
```

---

## 2. Curriculum Overhaul Status

| Lesson | Code / Slug | Topic | Presentation Deck | Guide Document | Status |
|---|---|---|---|---|---|
| **01** | `01_basics1` | Basics 1: Getting Started & C# Foundations | `presentation_basics1/` | `classes/01_basics1.md` | Complete & Active |
| **02** | `02_basics2` | Basics 2: Scripting & Coroutines | `presentation_basics2/` | `classes/02_basics2.md` | Complete & Active |
| **03** | `03_UI` | Basics 3: UI Layouting & Data Persistence | `presentation_basics3/` | `classes/03_UI.md` | Complete & Active |
| **04** | `04_architecture` | Architecture 1: ScriptableObject Event Channels & Scenes | `presentation_basics4/` | `classes/04_architecture.md` | Complete & Active |
| **05** | `05_release_polish` | Release Candidate: Polish, Lifecycle & Telemetry | `presentation_basics5/` | `classes/05_release_polish.md` | Complete & Active |
| **06 / 07** | `07_blockprototyping` | 3D Block Prototyping & Greyboxing (Workshop) | `presentation_blockprototyping/` | `classes/07_blockprototyping.md` | Complete & Active |
| **08** | `08_problemsolving` | Problem Solving, Controlling AI & Dev Tooling (Workshop) | `presentation_problemsolving/` | `classes/08_problemsolving.md` | Complete & Active |
| **09** | `09_gamejam2` | Blocktober Demo & Midterm Milestone Playtests | In Planning | `classes/09_gamejam2.md` | Next Up |
| **10** | `10_architecture2` | Game Architecture 2: Finite State Machines & Refactoring | In Planning | `classes/10_architecture2.md` | Upcoming |

---

## 3. Class 3 Deep-Dive: UI Layouting & Data Persistence

### Core Objective & Target Game Genre
Students are building a **Mobile Game** (iOS & Android) in Unity 6 (6000.x). The lesson was specifically engineered to address mobile-first realities: diverse screen ratios (19.5:9, 20:9, 4:3), hardware cutouts (notches, Dynamic Islands, camera punch holes), touch ergonomics, and mobile app lifecycle auto-saving.

### Key Innovations in Class 3 Deck

1. **Dual-View Comparison Mode (`[C]` Key)**:
   - Extracted all 15 original Apple Keynote slides from git commit `4f74a2e` (`docs/presentation_uisaving/assets/`) and converted them to 2000x1125 HD PNGs in `presentation_basics3/original_slides/`.
   - Built a header toggle switch and keyboard shortcut (`[C]`) to toggle between the original Apple Keynote HD slides and the modern interactive Unity 6 deck on every slide.
2. **Mobile Screen Scalability & Canvas Scaler (Slide 7)**:
   - **Landscape Mobile Rule**: Set `UI Scale Mode = Scale With Screen Size`, Reference `1920 x 1080`, **`Match Height = 1.0`** (or `0.5`). Prevents vertical HUD shrinkage across 19.5:9 phones and 4:3 tablets.
   - **Portrait Mobile Rule**: Reference `1080 x 1920`, **`Match Width = 0.0`**. Keeps navigation bars glued edge-to-edge.
   - **Unity Device Simulator**: Directs students to `Window > General > Device Simulator` to preview hardware profiles (iPhone 15, iPad, Galaxy S24) with actual cutouts inside the Editor.
3. **Hardware Cutouts & Mobile Safe Area (Slide 8)**:
   - The Cutout Trap: Anchoring directly to Canvas corners on modern phones places buttons underneath camera cutouts or Dynamic Islands.
   - The Solution: Wrap all HUD elements in a full-stretch `SafeAreaPanel` with the production `SafeAreaFitter.cs` script:
     ```csharp
     [RequireComponent(typeof(RectTransform))]
     public class SafeAreaFitter : MonoBehaviour {
         private RectTransform _rectTransform;
         private Rect _lastSafeArea = Rect.zero;
         private Vector2Int _lastScreenSize = Vector2Int.zero;
         private ScreenOrientation _lastOrientation = ScreenOrientation.AutoRotation;

         void Awake() {
             _rectTransform = GetComponent<RectTransform>();
             ApplySafeArea();
         }
         void Update() {
             if (Screen.safeArea != _lastSafeArea || Screen.width != _lastScreenSize.x || Screen.height != _lastScreenSize.y || Screen.orientation != _lastOrientation) {
                 ApplySafeArea();
             }
         }
         void ApplySafeArea() {
             _lastSafeArea = Screen.safeArea;
             _lastScreenSize = new Vector2Int(Screen.width, Screen.height);
             _lastOrientation = Screen.orientation;
             Vector2 anchorMin = _lastSafeArea.position;
             Vector2 anchorMax = anchorMin + _lastSafeArea.size;
             anchorMin.x /= Screen.width;  anchorMin.y /= Screen.height;
             anchorMax.x /= Screen.width;  anchorMax.y /= Screen.height;
             _rectTransform.anchorMin = anchorMin;
             _rectTransform.anchorMax = anchorMax;
         }
     }
     ```
   - **Interactive Notch & Safe Area Simulator**: Live on Slide 8. Lets users select device aspect (iPhone 15, Galaxy S24, iPad, Classic 16:9), toggle `[x] Enable SafeAreaFitter`, and see real-time visual collision vs safe insetting past the camera notch!
   - **No Black Bars / No Letterboxing Rule**: The 2D mobile UI must fluidly adapt across all aspect ratios (16:9, 19.5:9, 20:9, 4:3). Never hardcode aspect ratios or force black bars.
4. **Universal Anchor Playbook & Live Distortion Simulator (Slide 9)**:
   - 4 UI Anchor Recipes: Corner Pinned (`Min == Max`), Banners (`Horizontal Stretch`), Center Popups (`Middle-Center`), and 1:1 Squares (`AspectRatioFitter`).
   - 9-Sliced 2D Sprites: Sprite Editor 4-way borders + `Image Type = Sliced` prevents distorted borders.
   - TextMeshPro Auto-Size: Min 16, Max 32 avoids clipping.
   - Interactive Live Simulator toggling good vs bad anchors across 20:9, 19.5:9, 16:9, and 4:3 screens.
5. **Mobile Touch Ergonomics & Optimization (Slide 10)**:
   - New Input System `OnScreenStick` and `OnScreenButton` for 2D mobile touch.
   - Minimum Touch Target: $\ge 88\times 88\text{ px}$ (44pt) with 12px finger padding.
   - Raycast Target Optimization: Uncheck on decorative backgrounds to eliminate mobile touch CPU lag.
   - High-DPI Drag Threshold: `EventSystem.current.pixelDragThreshold = Mathf.RoundToInt(Screen.dpi / 160f * 6);`.
   - 2D Sprite Atlas: Pack HUD sprites to reduce draw calls from 40+ to 1-2 on mobile GPUs.
6. **Sub-Canvas Architecture & Rebatching Isolation (Slide 5)**:
   - Separate into `Static_HUD` and `Dynamic_HUD` sub-canvases so moving healthbars never rebatch static backgrounds.
7. **2D World Space UI Sorting & Flip Fix (Slide 6 & Milestone 2)**:
   - `canvas.overrideSorting = true`, `sortingLayerName = "UI"`, `sortingOrder = 100` so bars render above 2D sprites/tilemaps.
   - Upright scale fix prevents health bars mirroring backwards when 2D characters flip horizontal (`transform.localScale.x = -1`).
8. **Mobile 60 FPS Lock**:
   - `Application.targetFrameRate = 60;` in `Awake()` prevents Unity mobile defaulting to 30 FPS.
9. **Decoupled UI Architecture (Slide 11)**:
   - Event-driven UI: Gameplay scripts expose C# `Action<int, int>` events. UI components subscribe in `OnEnable()` and unsubscribe in `OnDisable()`.
10. **Cross-Platform JSON Persistence (Slides 14-19)**:
    - Replace PlayerPrefs with `JsonUtility` + `Application.persistentDataPath`.
    - Mobile Lifecycle Auto-Save: `void OnApplicationPause(bool pause) { if (pause) SaveSystem.Save(data); }`.
    - Live JSON Persistence Sandbox & Storage Benchmark simulator.
11. **5-Minute Challenges with Strict 1-Minute Solution Locks (Slides 12 & 19)**:
    - 300-second classroom countdown timers with MQTT broadcast sync.
    - Strict unlock at $\le 60$ seconds.
12. **In-Engine Project Setup (No Package Required)**:
    - Students work directly inside ongoing mobile game project.
13. **Teacher Mode & Speaker Notes**:
    - Press `[T]` for PIN (`7331`). Press `[N]` for speaker notes. Press `[L]` for Lecture/Lab mode.

---

## 4. File Structure of Class 3

```
HR/
├── presentation_basics3/
│   ├── presentation_unity6_basics3.html   # Main 20-slide presentation deck (241 KB)
│   ├── index.html                         # Presentation entrypoint mirror
│   ├── generate.js                        # Generator script
│   ├── test_deck.js                       # 57-test automated validation suite
│   ├── assets/
│   │   ├── mario.png
│   │   └── goomba.png
│   └── original_slides/                   # 15 HD 2000x1125 PNG slides from Keynote
│       ├── slide_01.png
│       └── ... (slide_02 to slide_15.png)
├── docs/presentation_basics3/             # Exact mirror for GitHub Pages serving
│   ├── presentation_unity6_basics3.html
│   ├── index.html
│   ├── generate.js
│   ├── assets/
│   └── original_slides/
├── classes/
│   └── 03_UI.md                           # Comprehensive curriculum markdown guide
├── index.html                             # Root course portal (Lesson 03 unlocked)
├── docs/index.html                        # Docs portal mirror (Lesson 03 unlocked)
├── README.md                              # Main course readme with schedule links
├── setup_laptop.ps1                       # Automated Windows dev machine setup script
└── PROJECT_CONTEXT.md                     # This context documentation
```

---

## 5. Verification & Testing

### Automated Test Suite
Run the test suite from the repository root:
```powershell
node presentation_basics3/test_deck.js
```
The suite verifies **56 assertions**:
- File existence (`presentation_unity6_basics3.html`, `index.html`, `classes/03_UI.md`)
- Comparison mode DOM elements, toggle functions, and `[C]` shortcut
- Extraction of all 19 slides and existence of all 15 original PNG images
- Lecture/Lab toggle and `[L]` shortcut
- Tier filtering buttons (All, Core, Adv, Exp)
- Teacher PIN modal (`7331`, `[T]` shortcut) and Speaker notes (`[N]` shortcut)
- Challenge timers, solution boxes, and strict 1-minute lock logic
- Interactive simulators: `runAnchorSimulator()`, `setCanvasMode()`, `simulateJsonSave()`, `simulateJsonLoad()`, `simulateStorageBenchmark()`
- Rider C# syntax highlighter and clipboard copy
- Technical glossary tooltips
- Student MQTT pace feedback buttons
- Root and docs portal links with Lesson 03 unlocked
- Mobile scalable UI assertions: `SafeAreaFitter`, `Screen.safeArea`, `Device Simulator`, `simSafeAreaCheck`, `simNotchOverlay`, `Raycast Target`, minimum touch targets, and absence of `basics3.unitypackage`.

### Running Locally
```powershell
# Start local HTTP server
python -m http.server 8080

# Endpoints:
# Course Portal: http://localhost:8080/index.html
# Class 3 Deck:  http://localhost:8080/presentation_basics3/presentation_unity6_basics3.html
```

---

## 6. Author & Git History
- **Author**: `studiohichambendriss-create` (`studiohichambendriss@gmail.com`)
- **Git State**:
  - `cmgt/master`: Tracks `HR-CMGT/Minor-GDD-Unity` (upstream school repository serving GitHub Pages).
  - `origin/master`: Tracks `studiohichambendriss-create/Minor-GDD-Unity-Private` (private multi-machine backup).

---

## 7. Curriculum Expansion (Lessons 04 - 08 Summary)

### Lesson 04: Architecture 1 (ScriptableObject Event Channels & Prefabs)
- Decoupled C# architecture eliminating singletons.
- ScriptableObject Event Channels (`VoidEventChannelSO`, `IntEventChannelSO`).
- Black-Box Prefabs with serialized references and strict encapsulation.
- Multi-scene additive workflows (`Bootstrapper.unity`, `Gameplay.unity`, `UI.unity`).

### Lesson 05: Release Candidate (Polish, Lifecycle & Telemetry)
- Mobile release polish and screen fade transitions.
- Application lifecycle handling (`OnApplicationPause`) for rock-solid save state protection.
- Micro-animations using procedural `AnimationCurve` evaluations and audio pitch randomization.
- Online leaderboards and playtest telemetry tracking.

### Lesson 07: 3D Block Prototyping & Greyboxing (Workshop)
- ProBuilder 1m metric grid snapping and modular blockout kits.
- 3D `CharacterController` camera-relative vector math.
- Cinemachine 3 (`CinemachineCamera`) orbit setups.
- Core 3D gameplay loop (Spawn -> Trigger -> Goal) and NavMesh NPC agents.

### Lesson 08: Problem Solving, Controlling AI & Dev Tooling (Workshop)
- Escaping "Passenger Mode" when working with Agentic AI: decomposing mechanics into the 4 Primitives (`Input` -> `3D Spatial Query` -> `State & Math` -> `Feedback`).
- Verifying Unity 6 API overloads with `F12` and generous aim queries (`Physics.SphereCast` vs 1-pixel `Raycast`, `Vector3.Dot` aim cones).
- Visualizing invisible 3D queries with live `OnDrawGizmosSelected()`.
- Designer-proofing prefabs: 1-click Inspector testing (`[ContextMenu]`) and silent bug guards (`OnValidate`).
- In-game dev tooling: Checkpoint teleportation (`F1-F3`) with `CharacterController.enabled` safety, slow-mo/fast-forward time scrubbing, and `DevWatch` runtime telemetry overlay.
- IDE debugger workflows: Attaching Rider/VS, conditional breakpoints, and Call Stack forensics.

---

## 8. Development Architecture & Engineering Standards

For complete instructions on authoring, styling, testing, and deploying new lessons in any AI agent harness (Antigravity, Cursor, Claude Code, Cline, Copilot), consult:
- **`HANDOFF.md`** (Root repository handoff guide for incoming agents and engineers).
- **`.agent/skills/cmgt-class-builder/SKILL.md`** (Standardized class scaffolding and slide schema specifications).


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

| Lesson | Topic | Presentation Deck | Guide Document | Status |
|---|---|---|---|---|
| **01** | Basics 1: Getting Started & C# Foundations | `presentation_basics1/` | `classes/01_basics.md` | Complete & Active |
| **02** | Basics 2: Scripting & Coroutines | `presentation_basics2/` | `classes/02_scripting.md` | Complete & Active |
| **03** | Basics 3: UI Layouting & Data Persistence | `presentation_basics3/` | `classes/03_UI.md` | Complete & Active |
| **04** | Architecture 1: ScriptableObject Channels | In Planning | `classes/04_architecture.md` | Next Up |
| **05** | Architecture 2: State Machines & Pooling | In Planning | `classes/05_statemachines.md` | Backlog |

---

## 3. Class 3 Deep-Dive: UI Layouting & Data Persistence

### Core Objective & Target Game Genre
Students are building a **Mobile Game** (iOS & Android) in Unity 6 (6000.x). The lesson was specifically engineered to address mobile-first realities: diverse screen ratios (19.5:9, 20:9, 4:3), hardware cutouts (notches, Dynamic Islands, camera punch holes), touch ergonomics, and mobile app lifecycle auto-saving.

### Key Innovations in Class 3 Deck

1. **Dual-View Comparison Mode (`[C]` Key)**:
   - Extracted all 15 original Apple Keynote slides from git commit `4f74a2e` (`docs/presentation_uisaving/assets/`) and converted them to 2000x1125 HD PNGs in `presentation_basics3/original_slides/`.
   - Built a header toggle switch and keyboard shortcut (`[C]`) to seamlessly toggle between the original Apple Keynote HD slides and the modern interactive Unity 6 deck on every slide.
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
         void Awake() {
             _rectTransform = GetComponent<RectTransform>();
             ApplySafeArea();
         }
         void ApplySafeArea() {
             Rect safeArea = Screen.safeArea;
             Vector2 anchorMin = safeArea.position;
             Vector2 anchorMax = anchorMin + safeArea.size;
             anchorMin.x /= Screen.width;
             anchorMin.y /= Screen.height;
             anchorMax.x /= Screen.width;
             anchorMax.y /= Screen.height;
             _rectTransform.anchorMin = anchorMin;
             _rectTransform.anchorMax = anchorMax;
         }
     }
     ```
   - **Interactive Notch & Safe Area Simulator**: Live on Slide 8. Lets users select device aspect (iPhone 15, Galaxy S24, iPad, Classic 16:9), toggle `[x] Enable SafeAreaFitter`, and see real-time visual collision vs safe insetting past the camera notch!
4. **Touch Ergonomics & Performance (Slide 9)**:
   - **Minimum Touch Target**: 44x44pt (Apple HIG) / 48x48dp (Google Material) $\ge 88\times 88\text{ px}$ at 1080p. 12px finger padding between buttons.
   - **Thumb Arc Layout**: Primary controls in bottom corners; secondary controls in top corners inside Safe Area.
   - **Raycast Target Optimization**: Uncheck `Raycast Target` on background panels, decorative icons, and static labels to eliminate mobile touch raycasting frame drops.
   - **TextMeshPro SDF & Zero-GC**: Always use `TextMeshProUGUI`. Use `scoreText.SetText("Score: {0}", val)` instead of string concatenation `+` to eliminate mobile garbage collection stutter.
5. **Decoupled UI Architecture (Slide 10)**:
   - Event-driven UI: Gameplay scripts expose C# `Action<int, int>` events. UI components subscribe via `+=` in `OnEnable()` and unsubscribe via `-=` in `OnDisable()`.
6. **Cross-Platform JSON Persistence (Slides 13-18)**:
   - Why `PlayerPrefs` is dangerous for savegames (unencrypted registry storage, primitive types only, easy corruption).
   - Robust JSON serialization using `[System.Serializable]` classes + `JsonUtility` + `Application.persistentDataPath`.
   - **Mobile Lifecycle Auto-Save**: Mobile players don't click "Quit Game" &mdash; they switch apps or receive phone calls. Implement `void OnApplicationPause(bool pause) { if (pause) SaveSystem.Save(data); }`.
   - **Interactive Simulators**:
     - *Live JSON Persistence Sandbox (Slide 17)*: Editable character sheet with Save, Restart Session, and Load from simulated disk.
     - *Storage Benchmark (Slide 15)*: Real-time simulation of `PlayerPrefs` vs `System.IO` JSON write performance.
7. **5-Minute Challenges with Strict 1-Minute Solution Locks (Slides 11 & 18)**:
   - 300-second classroom countdown timers with MQTT broadcast sync.
   - Solutions remain strictly locked until $\le 60$ seconds remain (or unlocked via Teacher Mode).
   - Challenge 1: Mobile HUD with `SafeAreaFitter` and 4 responsive corners.
   - Challenge 2: Complete `SaveSystem.cs` static service.
8. **In-Engine Project Setup (No Package Required)**:
   - Removed all references to `basics3.unitypackage`. Students work directly inside their ongoing mobile game project (or in `Assets/Class3/Class3_MobileUI.unity`).
9. **Teacher Mode & Speaker Notes**:
   - Press **`[T]`** to open the Teacher Access modal. PIN is `7331`.
   - Press **`[N]`** to view per-slide lecturer speaker notes, pedagogical timing, and talking points.
   - Press **`[L]`** to toggle Lecture Mode (presentation view) vs Lab Mode (deep-dive study notes).

---

## 4. File Structure of Class 3

```
HR/
├── presentation_basics3/
│   ├── presentation_unity6_basics3.html   # Main 19-slide presentation deck (222 KB)
│   ├── index.html                         # Presentation entrypoint mirror
│   ├── generate.js                        # Generator script
│   ├── test_deck.js                       # 56-test automated validation suite
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
  - `origin/master`: Tracks `HR-CMGT/Minor-GDD-Unity` (upstream).
  - `personal/master`: Tracks `studiohichambendriss-create/Minor-GDD-Unity-Private` (private backup).

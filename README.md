# Minor GDD - Unity Development Curriculum

Welcome to the repository for **Minor Game Design & Development - Unity Development** (Rotterdam University of Applied Sciences - CMGT).

This curriculum guides students from foundational 2D game prototyping to advanced 3D game architecture, visual effects, shader development, and performance optimization using the **Universal Render Pipeline (URP)** in Unity.

---

## Quick Links & Reference Guides

- [Unity Tips & Complete Reference Manual](classes/00_unity.md)
- [C# Unity Code Snippets Library](classes/00_codesnippets.md)
- [GDD Resources & Asset Catalog](classes/00_resources.md)
- [Curated Video Tutorials & Documentation](classes/00_tutorials.md)
- [Git & Team Collaboration Guide](classes/99_git_collaboration.md)
- [Project Starter Files & Packages](projectfiles/readme.md)

---

## Software Requirements & Standards

- **Target Engine:** Unity 6 (6000.x) with Universal Render Pipeline (URP)
- **Primary IDE:** JetBrains Rider / Visual Studio 2022
- **Language:** C# (.NET Standard)
- **Version Control:** Git + Git LFS (Large File Storage)

---

## Schedule & Weekly Lessons

### BLOCK 1: 2D PROTOTYPING & CORE ARCHITECTURE

| Week | Lesson Code | Topic & Content | Material & Assignment |
| :--- | :--- | :--- | :--- |
| **1.1** | `01_basics1` | **Introduction Unity 2D (Workshop)**<br>• GameObjects, Components, Prefabs<br>• Script Lifecycle (`Awake`, `Start`, `Update`, `FixedUpdate`)<br>• 2D Physics (`Rigidbody2D`, `Collider2D`, Physics Materials)<br>• New Input System & Cinemachine 2D Camera Follow | [Lesson 1.1 Material](classes/01_basics1.md) |
| **1.2** | `02_basics2` | **Object Communication & Data Structures** | *Coming Soon* |
| **1.3** | `03_UI` | **UI Layouting & Data Persistence** | *Coming Soon* |
| **1.4** | `04_architecture1` | **Game Architecture 1: Decoupling & Prefab API** | *Coming Soon* |
| **1.5** | `05_gamejam` | **Rapid Prototyping & Game Feel (Juice)** | *Coming Soon* |
| **1.6** | `--` | *Concept Presentations 2D Project & Feedback* | `--` |
| **1.7** | `07_blockprototyping` | **3D Block Prototyping & Greyboxing** | *Coming Soon* |
| **1.8** | `08_gamejam2` | *Blocktober Demo & Midterm Milestone Playtests* | *Coming Soon* |
| **1.9** | `09_problemsolving` | **Debugging, Profiling & Problem Solving** | *Coming Soon* |
| **1.10**| `10_architecture2` | **Game Architecture 2: Finite State Machines & Refactoring** | *Coming Soon* |

---

### BLOCK 2: 3D PROJECT, SHADERS, VFX & POLISH

| Week | Lesson Code | Topic & Content | Material & Assignment |
| :--- | :--- | :--- | :--- |
| **2.1** | `21_optimization` | **Performance Optimization & Rendering** | *Coming Soon* |
| **2.2** | `22_materialsandshaders` | **URP Materials & Shader Graph** | *Coming Soon* |
| **2.3** | `--` | *Concept Presentations 3D Project & Review* | `--` |
| **2.4** | `24_3Danimation` | **3D Character Animation & Rigging** | *Coming Soon* |
| **2.5** | `--` | *Milestone Playtesting & Polishing* | `--` |
| **2.6** | `26_VFX` | **Visual Effects & Post-Processing (URP)** | *Coming Soon* |
| **2.7** | `27_audio` | **Audio Systems & Dynamic Sound** | *Coming Soon* |
| **2.8** | `--` | *Final Project Polish & Profiling* | `--` |
| **2.9** | `--` | *Final Presentations & Expo 3D Project* | `--` |

---

## Code & Project Quality Standards

1. **Zero Compilation Warnings:** Code must compile cleanly without unassigned variables or deprecated API warnings.
2. **Separation of Concerns:**
   - Visuals (Renderers, Animators) on child object.
   - Physics (`Rigidbody`, `Collider`) on root object.
   - Logic in modular, decoupled C# scripts.
3. **Framerate Independence:**
   - Movement in `Update()` must multiply by `Time.deltaTime`.
   - Physics mutations must occur in `FixedUpdate()`.
4. **No GC Allocation in Loops:** Avoid `new`, string concatenation, and LINQ queries inside `Update()` and `FixedUpdate()`.
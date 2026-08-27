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

- **Unity Version:** Unity 2022.3 LTS
- **Render Pipeline:** Universal Render Pipeline (URP)
- **Code Editor:** Visual Studio 2022 / Visual Studio Code / JetBrains Rider
- **Version Control:** Git + Git LFS (Large File Storage)

---

## Schedule & Weekly Lessons

### BLOCK 1: 2D PROTOTYPING & CORE ARCHITECTURE

| Week | Lesson Code | Topic & Content | Material & Assignment |
| :--- | :--- | :--- | :--- |
| **1.1** | `01_basics1` | **Introduction Unity 2D (Workshop)**<br>• GameObjects, Components, Prefabs<br>• Script Lifecycle (`Awake`, `Start`, `Update`, `FixedUpdate`)<br>• 2D Physics (`Rigidbody2D`, `Collider2D`, Physics Materials)<br>• New Input System & Cinemachine 2D Camera Follow | [Lesson 1.1 Material](classes/01_basics1.md) |
| **1.2** | `02_basics2` | **Object Communication & Data Structures**<br>• `GetComponent` vs direct serialized references<br>• C# Events & `UnityEvent`<br>• Collections (`List<T>`, `Dictionary<TKey, TValue>`)<br>• `ScriptableObject` Data Containers & Coroutines | [Lesson 1.2 Material](classes/02_basics2.md) |
| **1.3** | `03_UI` | **UI Layouting & Data Persistence**<br>• Canvas Scaler, Anchors, Pivots & Responsive UI<br>• EventSystem & Button bindings<br>• Data Persistence with `JsonUtility` & `Application.persistentDataPath` | [Lesson 1.3 Material](classes/03_UI.md) |
| **1.4** | `04_architecture1` | **Game Architecture 1: Decoupling & Prefab API**<br>• Prefab as an API pattern<br>• ScriptableObject Event Channels (Decoupling)<br>• Singleton pattern: do's & don'ts<br>• Multi-Scene Additive Loading (`DontDestroyOnLoad`) | [Lesson 1.4 Material](classes/04_architecture1.md) |
| **1.5** | `05_gamejam` | **Rapid Prototyping & Game Feel (Juice)**<br>• DOTween (Tweening for visuals and UI)<br>• Game Feel: Screenshake, Hitstop/Freeze frames, Squash & Stretch<br>• Fast Debugging with `[ContextMenu]` & `Debug.DrawRay`<br>• WebGL build & Itch.io deployment | [Lesson 1.5 Material](classes/05_gamejam.md) |
| **1.6** | `--` | *Concept Presentations 2D Project & Feedback* | `--` |
| **1.7** | `07_blockprototyping` | **3D Block Prototyping & Greyboxing**<br>• ProBuilder level greyboxing & vertex editing<br>• Grid & Vertex Snapping workflows<br>• 3D Movement: `CharacterController` vs `Rigidbody 3D`<br>• NavMesh AI pathfinding basics | [Lesson 1.7 Material](classes/07_blockprototyping.md) |
| **1.8** | `08_gamejam2` | *Blocktober Demo & Midterm Milestone Playtests* | [Lesson 1.8 Material](classes/08_gamejam2.md) |
| **1.9** | `09_problemsolving` | **Debugging, Profiling & Problem Solving**<br>• Analyzing Stacktraces and Console errors<br>• Visual Studio Breakpoints & Watchers<br>• Unity Profiler: CPU Bottlenecks & Reducing GC Allocations<br>• Structured troubleshooting protocol | [Lesson 1.9 Material](classes/09_problemsolving.md) |
| **1.10**| `10_architecture2` | **Game Architecture 2: Finite State Machines & Refactoring**<br>• Generic C# Finite State Machine (FSM) pattern<br>• Game States (Menu, Play, Pause, GameOver)<br>• Enemy State logic (Patrol, Chase, Attack)<br>• Refactoring monolithic 'God Classes' | [Lesson 1.10 Material](classes/10_architecture2.md) |

---

### BLOCK 2: 3D PROJECT, SHADERS, VFX & POLISH

| Week | Lesson Code | Topic & Content | Material & Assignment |
| :--- | :--- | :--- | :--- |
| **2.1** | `21_optimization` | **Performance Optimization & Rendering**<br>• Draw Calls, SetPass Calls & Batching (SRP Batcher, Static/Dynamic)<br>• Overdraw and Fillrate reduction<br>• Level of Detail (LOD) & Occlusion Culling | [Lesson 2.1 Material](classes/21_optimization.md) |
| **2.2** | `22_materialsandshaders` | **URP Materials & Shader Graph**<br>• Physically Based Rendering (PBR) texture maps<br>• Shader Graph introduction (Nodes, Master Stack)<br>• Custom Shaders: Fresnel Shield, Dissolve effect, UV scrolling | [Lesson 2.2 Material](classes/22_materialsandshaders.md) |
| **2.3** | `--` | *Concept Presentations 3D Project & Review* | `--` |
| **2.4** | `24_3Danimation` | **3D Character Animation & Rigging**<br>• Humanoid Rigs & Mixamo workflow<br>• Animator Controller: BlendTrees (1D/2D walk/run)<br>• Responsive Transitions (zero input lag setup)<br>• Animation Events & Inverse Kinematics (IK) | [Lesson 2.4 Material](classes/24_3Danimation.md) |
| **2.5** | `--` | *Milestone Playtesting & Polishing* | `--` |
| **2.6** | `26_VFX` | **Visual Effects & Post-Processing (URP)**<br>• URP Particle System (Emission Bursts, Curves, Noise, Sub-emitters)<br>• Global & Local Post-Processing Volumes<br>• ACES Tonemapping, Bloom, Vignette, Decals | [Lesson 2.6 Material](classes/26_VFX.md) |
| **2.7** | `27_audio` | **Audio Systems & Dynamic Sound**<br>• AudioMixer routing (Master, Music, SFX)<br>• Exposed Parameters & logarithmic decibel sliders<br>• 3D Spatial Sound Settings & Pitch Randomization helpers | [Lesson 2.7 Material](classes/27_audio.md) |
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
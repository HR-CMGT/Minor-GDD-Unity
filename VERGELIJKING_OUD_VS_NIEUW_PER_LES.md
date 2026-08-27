# Lesson-by-Lesson Comparison Report: Original vs Revised

This document shows for **every file and lesson**:
1. **What was in the original GitHub repository?**
2. **What was broken or incorrect?**
3. **What was revised or newly added?**

---

## 📑 Master Summary Table

| Lesson / File | Original State | What Was Broken? | What Was Added / Revised? |
| :--- | :--- | :--- | :--- |
| **`README.md`** | 52-line table | Broken hyperlinks (Week 1.5 & 2.1); no version requirements | Fixed links, LTS/URP standards, quality rubric |
| **`00_codesnippets.md`** | 2 snippets + find warning | Coroutine timer was a performance anti-pattern (`while` with `deltaTime`) | 6 production-ready snippets (Input, Timers, Raycast, Pooling, Scene) |
| **`00_resources.md`** | 42-line link list | Empty link `[Noun Project]()`; no URP/PBR assets | Working links, PBR/HDRIs (PolyHaven), tools & URP resources |
| **`00_tutorials.md`** | 96-line link list | Outdated 2018 Built-in Pipeline / old Input Manager links | Modern URP Shader Graph, Input System, and Mecanim tutorials |
| **`00_unity.md`** | 473-line notes/gifs | Compilation errors `RigidBody` & `Vector`, incorrect claim on `const` | Corrected C# code, lifecycle diagram, GC/memory rules |
| **`01_basics1.md` (W1.1)** | 58-line Mario assignment | Package friction; cognitive overload without architecture | Separation of Concerns layout, tested `PlayerController2D` code |
| **`02_basics2.md` (W1.2)** | 39-line Goomba assignment | No explanation of C# Events vs UnityEvents; abrupt leap | Decision tree for communication, `EnemyStatsSO`, safe `EnemySpawner` |
| **`03_UI.md` (W1.3)** | 20 lines (abrupt cutoff) | **100% Empty** after header; no assignment, no text | Canvas Scaler (1920x1080), Anchors, JSON Save/Load system |
| **`04_architecture1.md` (W1.4)**| 115-line rough draft | Empty links `[]()`, missing screenshots, empty bulletpoints | Prefab as API code, `ScriptableObject Event Channels`, Singleton fix |
| **`05_gamejam.md` (W1.5)** | 56-line raw tips | Truncated sentences ("If you want to have..."), no code | DOTween methods, complete `FeedbackJuice` class, WebGL export |
| **`07_blockprototyping.md` (W1.7)**| 86-line meme text | "Camera go whoosh", "Terrain. Terrain.", empty tutorial placeholders | ProBuilder guide, Snapping rules, 3D `CharacterController` |
| **`08_gamejam2.md` (W1.8)**| 56-line duplicate | Exact verbatim duplicate of `05_gamejam.md` | Converted to Blocktober Demo & Playtest Review checklist |
| **`09_problemsolving.md` (W1.9)**| 30-line headers | Only 6 empty sub-headers under "HTRTFM" (0 lines of content) | Stacktrace parsing, Debugger breakpoints, Unity Profiler guide |
| **`10_architecture2.md` (W1.10)**| 33-line headers | Only empty sub-headers; duplicate of lesson 04 | Generic C# Finite State Machine (FSM) pattern + Enemy AI states |
| **`21_optimization.md` (W2.1)**| 32-line headers | 8 empty headers; no practical guidance | Draw calls, SRP Batcher, GPU Instancing, LODs, Frame Debugger |
| **`22_materialsandshaders.md` (W2.2)**| 27-line headers | Empty; crossed-out links; README linked to wrong file | PBR textures, Dissolve & Fresnel Shader Graphs, `MaterialPropertyBlock` |
| **`24_3Danimation.md` (W2.4)**| 39-line one-liners | No code, no setups, no assignments | Mixamo Humanoid workflow, BlendTrees, zero-latency transitions |
| **`26_VFX.md` (W2.6)** | 36-line headers | Broken image path (`img/vfx/img/vfx/...`), no explanation | URP Particle System modules, ACES Tonemapping, Bloom, Decals |
| **`27_audio.md` (W2.7)** | 26-line headers | Single line: `### AudioMixer` (100% empty) | AudioMixer routing, logarithmic decibel math, 3D spatial sound |
| **`99_git_collaboration.md`** | *New document* | Completely missing in original repository | Git LFS setup, `.gitignore`, `.gitattributes`, prefab team workflow |

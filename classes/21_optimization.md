# Lesson 2.1: Performance Optimization & Rendering in URP

In this lesson, you learn how to optimize 3D games to maintain a rock-solid 60+ FPS. We examine Draw Calls, the SRP Batcher, GPU Instancing, LODs, Occlusion Culling, and the **Frame Debugger**.

---

## 🎯 Learning Objectives
1. Understand **Draw Calls**, **SetPass Calls**, and **Batches** and their CPU/GPU cost.
2. Correctly configure and leverage the **Universal Render Pipeline (URP) SRP Batcher**.
3. Set up **LOD (Level of Detail)** groups and **Occlusion Culling** for large 3D environments.
4. Diagnose rendering bottlenecks with the **Frame Debugger**.

---

## 🏎️ 1. The Rendering Pipeline: Why Does Your Game Lag?

When the GPU renders 3D objects, the communication overhead between CPU and GPU is often the primary bottleneck.
- **Draw Call:** An instruction sent from CPU to GPU: *"Render this buffer of 500 triangles"*.
- **SetPass Call:** The most expensive operation; occurs when the GPU must switch **Shader** or **Render State**.
- **Batching:** Combining multiple draw operations into a single command to minimize CPU overhead.

```
[WITHOUT BATCHING: 1,000 Trees]
  └── CPU issues 1,000 individual Draw Calls -> Severe CPU Bottleneck (Low FPS)

[WITH SRP BATCHER / GPU INSTANCING: 1,000 Trees]
  └── CPU issues 1 batched instruction -> High, steady framerates
```

---

## ⚙️ 2. Batching Techniques in URP

### A. The SRP Batcher (Modern URP Standard)
In URP, the **SRP Batcher** is the default method to accelerate draw calls.
- **How does it work?** Constant buffer data persists in GPU memory between draw calls, saving CPU cycles.
- **Requirement:** Objects must use the same Shader variant (colors and material parameters can differ!).
- **Verification:** Select your URP Asset in Project View and confirm `SRP Batcher` is **enabled**.

### B. GPU Instancing
Ideal for hundreds of identical objects (foliage, rocks, bullets):
- Check `Enable GPU Instancing` on the Material Inspector.
- All meshes sharing this material render in a single GPU pass.

### C. Static Batching
For non-moving level architecture:
- Check `Batching Static` in the GameObject Inspector header.
- Unity merges static vertices into a shared memory buffer at runtime.

---

## 🌲 3. Level of Detail (LOD) & Occlusion Culling

### LOD (Level of Detail) Groups:
Why render a 10,000 polygon tree when it is 100 meters away occupying 10 pixels?
1. Create 3 mesh variations: `Model_LOD0` (High poly), `Model_LOD1` (Medium poly), `Model_LOD2` (Low poly).
2. Attach the `LOD Group` component to the parent object.
3. Assign mesh renderers to the distance threshold sliders. Unity automatically swaps geometry based on camera distance!

### Occlusion Culling (Don't Draw What's Hidden):
By default, Unity uses Frustum Culling (discards what's outside camera view). **Occlusion Culling** discards objects hidden behind solid walls.

```
[Baking Occlusion Culling]:
1. Mark solid walls and terrain as "Occluder Static" and "Occludee Static".
2. Open Window > Rendering > Occlusion Culling.
3. Click "Bake".
4. Use the Visualization tab in Scene View to inspect objects disappearing behind walls!
```

---

## 🔬 4. The Frame Debugger

Open the Frame Debugger: `Window > Analysis > Frame Debugger`.

Click **Enable**. You can step through each draw call sequentially to observe frame construction.

```
[Frame Debugger Diagnostic Checklist]:
1. See "Draw Dynamic"? -> Check why batching failed (often unique materials/textures).
2. See "SRP Batch"? -> Excellent! Objects share constant buffer layout.
3. Fullscreen draw calls from UI? -> Disable "Raycast Target" on non-clickable images and text!
```

---

## 🛠️ Hands-on Assignment (20 minutes)

1. Duplicate 200 identical cubes or trees in a 3D test scene.
2. Open **Rendering Statistics** in the Game View (`Stats` overlay). Note the *Batches* count and *Saved by batching*.
3. Enable **GPU Instancing** on the shared material or verify the **SRP Batcher** is running.
4. Observe the batch reduction and inspect the command flow in the **Frame Debugger**!
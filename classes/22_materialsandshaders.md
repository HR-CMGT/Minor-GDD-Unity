# Lesson 2.2: URP Materials & Shader Graph Masterclass

In this lesson, you dive into graphics and visual styling. You learn how **Physically Based Rendering (PBR)** materials operate in the Universal Render Pipeline (URP) and how to build visual shaders using **Shader Graph** without writing low-level HLSL code.

---

## 🎯 Learning Objectives
1. Understand how **PBR texture maps** (Albedo, Normal, Metallic, Smoothness, Occlusion, Emission) interact.
2. Build custom shaders visually in **Unity Shader Graph**.
3. Create a **Dissolve disintegration effect** and a **Fresnel Forcefield effect**.
4. Animate shader parameters from C# efficiently using `MaterialPropertyBlock`.

---

## 🎨 1. Anatomy of a PBR Material

In URP, a *Lit Material* replicates physical light interaction:

| Texture Map | Role | Value / Color Channel |
| :--- | :--- | :--- |
| **Base Map (Albedo)** | Pure base color without lighting or specular baked in | RGB Color |
| **Metallic** | Distinguishes conductive metals from dielectrics (wood, plastic) | Greyscale ($0 = \text{Non-metal}, 1 = \text{Pure metal}$) |
| **Smoothness** | Governs reflection sharpness (mirror-like vs matte) | Greyscale ($0 = \text{Rough}, 1 = \text{Smooth}$) |
| **Normal Map** | Simulates surface micro-geometry without extra polygons | Vector normals (Tangent Space) |
| **Ambient Occlusion (AO)** | Adds soft contact shadows in crevices and corners | Greyscale ($0 = \text{Full shadow}, 1 = \text{Full light}$) |
| **Emission** | Causes the surface to emit self-illuminating light | HDR Color (combines with Bloom!) |

---

## ⚡ 2. Shader Graph: 2 Essential Production Recipes

Create a new graph: `Create > Shader Graph > URP > Lit Shader Graph`.

---

### Recipe 1: Dissolve (Disintegration) Shader

Causes 3D models to dissolve into burning ember particles on death.

```
[Simple Noise Node] (Scale: 30) ───┐
                                    ├───> [Step Node] (In) ───> Master Stack: [Alpha Clip Threshold]
[Float Property: _DissolveAmount] ──┘
```

#### Step-by-Step Graph Setup:
1. Open the Blackboard (`+` button) and create a Float property: `_DissolveAmount` (Slider 0 to 1).
2. Create node: `Simple Noise` (Frequency: 25).
3. Create node: `Step`. Connect `Simple Noise` into **In**, and drag `_DissolveAmount` into **Edge**.
4. Connect the output of `Step` into **Alpha Clip Threshold** in Master Stack (Fragment).
5. In Graph Settings, check: `Alpha Clipping: On`.

---

### Recipe 2: Fresnel Shield Forcefield (Glow Rim)

Produces an edge glow that intensifies as viewing angles sharpen (ideal for energy shields or ghosts).

```
[Fresnel Effect Node] (Power: 3) ───┐
                                     ├───> [Multiply Node] ───> Master Stack: [Emission]
[Color Property: _ShieldColor (HDR)] ┘
```

#### Step-by-Step Graph Setup:
1. Create a `Color` property on the Blackboard: `_ShieldColor` (Mode: **HDR**).
2. Create node: `Fresnel Effect` (Power: `3.0`).
3. Create node: `Multiply`. Multiply `Fresnel Effect` output by `_ShieldColor`.
4. Connect result into **Emission** in Master Stack.

---

## 💻 3. Driving Shaders from C# (Zero Memory Allocations)

Calling `renderer.material.color = Color.red;` creates a runtime clone of the material in RAM and breaks SRP Batching!

### The Proper Way: `MaterialPropertyBlock`
```csharp
using UnityEngine;

public class DissolveController : MonoBehaviour
{
    [SerializeField] private Renderer targetRenderer;
    [SerializeField] private float dissolveDuration = 1.5f;

    private MaterialPropertyBlock propBlock;
    private static readonly int DissolvePropertyID = Shader.PropertyToID("_DissolveAmount");

    private void Awake()
    {
        propBlock = new MaterialPropertyBlock();
    }

    public void StartDissolve()
    {
        StartCoroutine(DissolveRoutine());
    }

    private System.Collections.IEnumerator DissolveRoutine()
    {
        float elapsed = 0f;
        while (elapsed < dissolveDuration)
        {
            elapsed += Time.deltaTime;
            float dissolveValue = Mathf.Clamp01(elapsed / dissolveDuration);

            // Update shader uniform without cloning the material!
            targetRenderer.GetPropertyBlock(propBlock);
            propBlock.SetFloat(DissolvePropertyID, dissolveValue);
            targetRenderer.SetPropertyBlock(propBlock);

            yield return null;
        }
    }
}
```

---

## 🛠️ Hands-on Assignment (30 minutes)

1. Create a `Lit Shader Graph` and build the **Dissolve Effect**.
2. Create a Material from this shader and assign it to a 3D character or cube.
3. Attach `DissolveController.cs` and trigger `StartDissolve()` on spacebar.
4. Watch the 3D model disintegrate smoothly!

# Lesson 2.6: Visual Effects (VFX) & Post-Processing in URP

In this lesson, you learn how to transform raw blockouts into visually polished scenes using the **Unity Particle System**, **Post-Processing Volumes**, and **Decals**.

---

## 🎯 Learning Objectives
1. Design particle effects using core **Particle System** modules (Bursts, Curves, Noise, Sub-Emitters).
2. Set up a **URP Global Volume** with cinematic **Post-Processing** (Bloom, ACES Tonemapping, Color Grading).
3. Utilize **Decal Projectors** for bullet holes, cracks, and ground splatters.
4. Enhance impact feel through dynamic volume animations.

---

## ✨ 1. Particle System Masterclass: Core Modules

High-quality particle effects consist of layered modules:

```
[Particle System Architecture]:
├── Main Module           -> Start Lifetime (0.4 - 0.8s), Start Speed, Start Size, Simulation Space (World)
├── Emission Module       -> Rate over Time (0) + Burst (e.g., 30 particles at t=0 for explosion)
├── Shape Module          -> Cone (sparks) or Sphere (explosion)
├── Velocity over Lifetime-> Drag to smoothly decelerate particles
├── Color over Lifetime   -> Gradient: Start bright orange -> End transparent (Alpha: 0)
├── Size over Lifetime    -> Curve: Start large (1.0) -> Shrink to zero (0.0)
└── Renderer Module       -> Render Mode: Billboard, Material: URP Particle Unlit (with HDR Emission!)
```

### Impact Sparks Recipe:
1. **Main Module:** *Start Lifetime* `0.2 to 0.5s`. *Start Speed* `8 to 15`. *Simulation Space* `World` (sparks trail in world space).
2. **Emission:** *Rate over Time* `0`. Add 1 **Burst** of `20` particles.
3. **Shape:** *Cone* with *Angle* `15` and *Radius* `0.05`.
4. **Limit Velocity over Lifetime:** Enable, set *Dampen* to `0.5` (simulates air friction).
5. **Color over Lifetime:** Fade Alpha to `0%` at end of lifetime.

---

## 🎬 2. URP Post-Processing: Cinematic Visuals

Post-processing manipulates camera render targets before presenting them to the screen.

### Global Volume Setup:
1. In Hierarchy: `GameObject > Volume > Global Volume`.
2. Click `New` next to **Profile**.
3. Select your **Main Camera** and ensure **Post Processing** is checked in the Camera Inspector.

```
┌────────────────────────────────────────────────────────────────────────┐
│ 4 ESSENTIAL POST-PROCESSING OVERRIDES (URP)                           │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Tonemapping:                                                        │
│    - Mode: ACES (Produces cinematic contrast and highlights)          │
│ 2. Bloom:                                                              │
│    - Threshold: 1.0 (Only surfaces with HDR emission > 1 glow)         │
│    - Intensity: 1.25                                                   │
│    - Scatter: 0.7 (Soft diffusion around bright light sources)        │
│ 3. Color Adjustments:                                                  │
│    - Post Exposure: +0.2                                               │
│    - Contrast: +15                                                     │
│    - Saturation: +10                                                   │
│ 4. Vignette:                                                           │
│    - Intensity: 0.25 (Subtly darkens screen edges)                    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🩹 3. URP Decal Projectors (Bullet Holes & Splatters)

Decals project textures onto geometry seamlessly regardless of mesh complexity:
1. Ensure the **URP Decal Renderer Feature** is active in your URP Renderer Data asset.
2. In Hierarchy: `GameObject > Rendering > URP Decal Projector`.
3. Create a Decal Material (`Create > Material`, Shader: `Universal Render Pipeline/Decal`).
4. Assign a transparent texture (e.g., bullet hole) and aim the projector at a wall.

---

## 💻 4. VFX Controller Script (Spawn & Auto-Destroy)

```csharp
using UnityEngine;

public class ImpactEffect : MonoBehaviour
{
    [SerializeField] private ParticleSystem impactParticles;
    [SerializeField] private AudioSource impactAudio;
    [SerializeField] private float lifetime = 2.0f;

    private void Start()
    {
        if (impactParticles != null) impactParticles.Play();
        if (impactAudio != null) impactAudio.Play();

        // Automatically clean up after particles finish
        Destroy(gameObject, lifetime);
    }

    public static void SpawnImpact(GameObject effectPrefab, Vector3 position, Vector3 normal)
    {
        if (effectPrefab == null) return;
        
        // Orient effect away from the impacted surface
        Quaternion rotation = Quaternion.LookRotation(normal);
        Instantiate(effectPrefab, position, rotation);
    }
}
```

---

## 🛠️ Hands-on Assignment (30 minutes)

1. Configure a **Global Volume** with *ACES Tonemapping*, *Bloom*, and *Vignette*.
2. Build an impact sparks effect using the **Particle System** with an **HDR Color** (Intensity > +1.5) to trigger Bloom glow.
3. Spawn the effect at raycast hit points via `ImpactEffect.SpawnImpact`.
4. Observe the dramatic visual upgrade in your 3D scene!
# Lesson 1.8: Problem Solving, Mechanic Decomposition & Dev Tooling

[Presentation](https://hr-cmgt.github.io/Minor-GDD-Unity/presentation_problemsolving) -
[Resources](00_resources.md) -
[Tutorials](00_tutorials.md) -
[Assignment](#assignment)

## Presentation
This week's [presentation can be found here](https://hr-cmgt.github.io/Minor-GDD-Unity/presentation_problemsolving)

## Resources
- Our own [tips, tricks and best practices](00_unity.md) for working with Unity 6
- [3D Prototyping Code Snippets](00_codesnippets.md) for quick reference on CharacterController, Spatial Queries, and Input System
- [Git & Team Collaboration Guide](99_git_collaboration.md) for branch hygiene and merge conflict prevention

---

## Studio Reality & Overview
In a commercial studio or a 15-person multidisciplinary team (programmers, level designers, 3D artists, technical artists, sound designers), shipping a verified game prototype within sprint deadlines fails if bugs take hours to reproduce, if prefabs break silently when edited by non-programmers, or if mechanics are written as 800-line monolithic scripts that nobody can debug.

This 120-minute studio workshop equips you with three production disciplines used in professional game studios:
1. **The `_Sandbox_Dev` Method & 4 Primitives:** Isolating new mechanics into dedicated scenes and breaking every mechanic into clean building blocks (`Input` -> `3D Spatial Query` -> `State & Math` -> `Event & Feedback`).
2. **Fast In-Game Dev Tools & The 3-Second Testing Loop:** Eliminating repetitive manual playtesting with hotkey checkpoint teleportation, slow-motion physics inspection, `[ContextMenu]` testing, `OnValidate()` checks, and runtime debug watches without garbage collection.
3. **The Rider / VS Debugger & Reading the Call Stack:** Attaching JetBrains Rider and Visual Studio to Unity, diagnosing cross-team bugs using conditional breakpoints, and tracing failure points through the Call Stack.

---

## The "Vibe Coding" Trap vs. Keeping Your Codebase in Hand

### Why Agentic Vibe Coding Is Seductive (The Wins)
Today's game development students do not type prompts into chatbot windows and manually copy-paste snippets. They work with **agentic AI coding tools** (Cursor, Claude Code, GitHub Copilot Agent, Windsurf, Antigravity) where the AI agent reads project context, inspects existing files, looks up current Unity 6 documentation, and directly writes and edits `.cs` files on disk.

In the opening sprint of a prototype, this feels extraordinary:
- You sit back, describe a feature in natural language, and let the agent create and modify the scripts directly in your repository.
- You click **"Accept All"**, hit Play in Unity, and the script often **compiles and works on the first try**.
- You achieve playable 3D movement, interactions, or basic combat prototypes in 30 minutes without writing boilerplate.

### The 3 Real Studio Losses of Clicking "Accept All" Without Reading in a 15-Person Team
When you accept generated code without reading it, you encounter three major breakdowns by Week 3 or 4 of a studio project:

1. **Losing Your Mental Model (Accepting Without Reading):**
   Because an assistant wrote and edited the files directly and the code worked on the first try, you never built a mental model of how the state transitions, physics queries, and vector math actually function.
   When edge-case bugs appear in Week 4—or when a game designer asks you during a live studio milestone playtest: *"Why does the character lose momentum when sliding off ramps?"*—you are completely paralyzed. You do not know your own codebase well enough to answer, debug, or tweak it on the spot.
2. **The "Fix It" Trap: Band-Aid Workarounds and Bloated Code:**
   When you encounter an issue and simply prompt an assistant *"fix it"* or *"make this work"*, the agent will eventually get a working version—**but almost always in a hacky way with way too much code**.
   Instead of addressing the true cause (which in Unity is frequently an unassigned Inspector slot, an empty `LayerMask`, or an unexpected Trigger collider), it adds extra booleans, edge-case workarounds, and 150 lines of band-aid code just to force the outcome.
   After two or three rounds of *"fix it"*, your script still compiles and runs, but it has become a bloated, convoluted mess that you don't understand and cannot easily modify when your 15-person team needs changes.

   **The Right Way to Work with an Agent (Diagnosis & Options First):**
   - **Never prompt 'Fix it' directly.**
   - **Ask for Diagnosis + Options:** Prompt the agent: *"Explain what is causing this bug and give me 2 or 3 options to fix it (from simplest to cleanest) before changing any code."*
   - **Analyze & Choose:** Read the options, make sure you understand what is happening, ask the agent to explain any function or vector math you don't recognize, and **you pick the cleanest option** for the agent to implement.
3. **Uncontrolled Multi-File Coupling in a Team Repo:**
   When you prompt an assistant at a high-level feature scope (*"implement the grapple ability and make it unlock the level gate"*), it will make it work by any means necessary. It frequently edits 4 or 5 shared files at once, directly coupling your player controller to UI elements, sound sources, and scene gate triggers. In a 15-person team, this uncontrolled blast radius causes devastating Git merge conflicts that disrupt your fellow programmers and level designers.

---

### Comparison: Clicking "Accept All" vs. Staying in Control of Your Code

| Production Aspect | Clicking "Accept All" Without Reading | Staying in Control of Your Code |
| :--- | :--- | :--- |
| **Architecture & Scoping** | Gives broad whole-feature prompts across multiple shared files. | Decomposes mechanics into the 4 Primitives in `_Sandbox_Dev`; scopes code strictly to single methods or pure math helpers. |
| **Diff Accountability** | Clicks "Accept All" without reading diffs because the code compiles. | Reviews every diff line-by-line before accepting; rejects changes outside the intended primitive. |
| **Scene & Inspector Reality** | Asks an AI to blindly "fix it" when a mechanic fails in the scene. | Uses `OnValidate()` to catch Inspector and LayerMask errors instantly; asks for diagnosis and options first. |
| **3D Spatial Math Verification** | Assumes 3D vector math is correct because the player moves. | Renders visual proof in Scene view with `OnDrawGizmosSelected()`. |
| **Live State Visibility** | Guesses internal state or relies on cluttered console logs. | Uses `DevWatch.Set(...)` and `DevCheatController` to monitor numbers and state transitions live in 3 seconds. |
| **Bug Investigation** | Re-prompts in a loop hoping an AI fixes mysterious gameplay glitches. | Attaches Rider/VS debugger, sets Conditional Breakpoints (`F9`), steps through code (`F10`), and inspects the Call Stack. |
| **Team Accountability** | Cannot explain how the feature works during studio reviews. | Defends and tunes every line of code during peer playtests and milestone reviews. |

---

## Assignment (120-Minute Studio Workshop)
Complete the **3 Milestones** below in order. Work directly in your team's Unity 6 project repository or in a clean staging project.

---

## Part 1: Mechanic Decomposition & The `_Sandbox_Dev` Method

### The Rule of Isolated Development
Prototyping gameplay mechanics inside the primary level scene (`Level_01.unity`) is one of the most common causes of studio project corruption. It causes:
- Broken Git history and merge conflicts when level designers and programmers modify the same `.unity` scene asset simultaneously.
- 30-to-60-second iteration loops caused by loading high-resolution environment assets, baked lightmaps, and audio banks just to test a single jump formula.
- Uncontrolled variables: you cannot tell whether an ability failed because of your math or because a designer placed an unbaked static collider in the way.

**The Studio Rule:**
Every new ability, weapon, puzzle interaction, or mobility feature is developed in an isolated scene: `Assets/_Sandbox_Dev/Scenes/Dev_<MechanicName>.unity`.
The sandbox scene contains only:
1. Flat ProBuilder test geometry (walls, steps, target dummies on dedicated layers).
2. A player prototype rig.
3. The isolated mechanic component under test.

Only when the mechanic passes all unit checks is it saved into `Assets/Prefabs/Mechanics/` as a clean prefab and brought into production levels.

---

### The 4 Primitives of Any 3D Mechanic
Every 3D gameplay interaction, regardless of apparent complexity, decomposes into four sequential, decoupled primitives:

```
[1. Input] -> [2. 3D Spatial Query] -> [3. State & Math] -> [4. Event & Feedback]
```

1. **Input:** Captures player intent via the Unity 6 New Input System (`InputAction`, `wasPressedThisFrame`, `ReadValue<Vector2>()`). Contains no game logic and executes no physics queries.
2. **3D Spatial Query:** Asks the physics world for spatial context (`Physics.Raycast`, `Physics.SphereCast`, `Physics.OverlapSphereNonAlloc`, line-of-sight checks). It ignores triggers and queries only specified `LayerMask` layers.
3. **State & Math:** Evaluates cooldowns, resource costs, range thresholds, and directional alignment using linear algebra (dot products, vector projections, distance falloff).
4. **Event & Feedback:** Emits decoupled notifications (`UnityEvent`, C# events) to trigger particles, audio, screen shakes, animations, and UI counters without hardcoding references to specific subsystems.

---

### Decomposition Table for Common 3D Mechanics

| Mechanic | 1. Input | 2. 3D Spatial Query | 3. State & Math | 4. Event & Feedback |
| :--- | :--- | :--- | :--- | :--- |
| **Grappling Hook** | Button `OnGrapple` pressed (`wasPressedThisFrame`). | `Physics.SphereCast` along camera look vector against `AnchorLayer`. | Check `distance <= maxRange`. Compute tension vector: `dir = (hitPoint - playerPos).normalized * pullSpeed`. | Emit `OnGrappleAttached(hitPoint)`. Render line renderer rope, play reel audio, trigger Cinemachine FOV pulse. |
| **Shotgun Spread** | Button `OnFire` pressed. | Multi-ray query: 8 `Physics.Raycast` lines distributed randomly within an aim cone. | For each hit: calculate damage falloff `dmg = baseDmg * (1 - dist / range)`. Apply impulse along ray direction. | Emit `OnShotgunFired()`. Spawn muzzle flash VFX, shell casing ejection, screen shake, surface impact decals. |
| **Whirlwind AOE** | Button `OnAbility` pressed with cooldown check. | `Physics.OverlapSphereNonAlloc` querying `EnemyLayer` using a preallocated static buffer. | For each enemy: verify line-of-sight with `Raycast`. Calculate radial knockback: `force = maxForce * (1 - dist / radius)`. | Emit `OnWhirlwindTriggered()`. Play radial shockwave particle effect, ground dust ring, camera impulse. |
| **Ledge Vault / Mantle** | `OnJump` pressed while airborne and moving forward. | Wall query: forward `Raycast` detects obstacle face. Ledge query: downward `Raycast` detects top flat surface. | Verify `ledgeHeight` is within `[minHeight, maxHeight]`. Check surface normal `normal.y >= 0.7f`. Transition to Vault state. | Disable `CharacterController`. Lerp player root to top ledge. Play mantle sound effect, camera tilt. |
| **Stealth Takedown** | `OnInteract` pressed within proximity of target. | `Physics.OverlapSphereNonAlloc` for targets; `Physics.Raycast` to ensure clear line of sight. | Alignment dot product: `dot = Vector3.Dot(player.forward, enemy.forward) >= 0.7f` (both facing same direction). Player is behind target. | Lock player & enemy input. Play synchronized animation clip. Emit `OnTakedownExecuted()`. Camera orbit zoom. |

---

### Scoping the Agent: Decompose by Primitive, Never by Feature

When you use an AI coding agent as a professional engineer, you never ask it to architect entire gameplay features across multiple files. You design the decoupled architecture yourself using the 4 Primitives, and you only delegate isolated mathematical micro-problems or algorithmic helpers where you can immediately audit the output.

#### The Bad Broad Prompt (Accepting Without Reading)
> "In our project, implement a complete 3D grappling hook system with swinging physics, rope rendering, audio, and door triggers."

**Why this fails:**
The agent directly modifies 4 or 5 shared files across your project directory. It creates its own internal movement formulas that clash with your `CharacterController`, hardcodes `AudioSource` calls that bypass your audio mixer, instantiates `LineRenderer` components at arbitrary hierarchy roots, and couples player movement to level triggers. Even though the code compiles, you cannot tune or debug it, and it creates massive Git merge conflicts for your teammates.

#### The Focused, Scoped Prompt (Staying in Control)
You architect the 4 Primitives yourself in your technical notes:
1. **Input:** Handled via your player's Input Action Asset or `Keyboard.current`.
2. **Spatial Query:** You specify `Physics.SphereCast` on layer `AnchorLayer` with `QueryTriggerInteraction.Ignore`.
3. **State & Math:** You need a specific mathematical formula for pull velocity with distance-based ease-in.
4. **Event & Feedback:** Handled via your decoupled `UnityEvent<Vector3>`.

Now, you scope the agent strictly to a single method in a single isolated file:
> "In `Assets/_Sandbox_Dev/Scripts/SpatialAbilityPrototype.cs`, implement only the static math helper with this exact signature:
> `public static Vector3 CalculatePullVelocity(Vector3 playerPos, Vector3 anchorPos, float maxSpeed, float minDistance)`
> It must calculate a pull velocity vector towards the anchor. If distance is greater than minDistance, clamp speed to maxSpeed with a smooth quadratic falloff as distance approaches minDistance.
> Do not modify any other methods or files. Do not use MonoBehaviour, and do not allocate heap memory."

**Why this succeeds:**
The agent modifies exactly 12 lines in one file. You read every line of the diff in 15 seconds before clicking Accept, test it with live debug watches, and maintain 100% comprehension and control over your codebase.

#### Rule: Read Every Line of the Diff Before Accepting
Never click **"Accept All"** blindly. Before accepting an agent's proposed file edits:
1. Inspect the diff in your editor (Rider, Visual Studio, or Cursor).
2. Verify that the agent did not touch any files outside the scoped primitive.
3. Verify that the agent did not alter shared interfaces or add hidden dependencies.

---

### Spatial Query Best Practices & Using AI to Compare Options

#### 1. Using AI to Explain Functions & Compare Options Before Writing Code
Reading through pages of outdated Unity documentation or decompiled metadata is no longer needed. A coding agent can explain functions, parameter contracts, and trade-offs much better and faster than manual searching:

- **Compare Approaches:** Before writing code, ask your agent: *"What Unity functions can check for targets in front of the player, and what are the trade-offs?"*
- **Evaluate the Choices:** The agent will present options like:
  - `Physics.Raycast`: Thin 1-pixel ray. Good for precision sniper fire, but unforgiving for player abilities.
  - `Physics.SphereCast`: Sweeps a sphere forward (e.g., $0.4\text{m}$ radius). Forgiving aim with exact hit point and surface normal.
  - `Physics.OverlapSphere` + `Vector3.Dot`: Checks targets within a radius and angle cone. Best for auto-targeting and melee cleaves.
- **Explain Every Parameter:** Ask the agent to explain any argument you don't recognize (such as `QueryTriggerInteraction.Ignore` or `LayerMask` bitmasks). Never accept a line of code until you know what every parameter does.
- **You Make the Decision:** Choose the cleanest approach with the fewest moving parts before generating the implementation.

#### 2. QueryTriggerInteraction.Ignore
By default, spatial queries (`Raycast`, `SphereCast`, `OverlapSphere`) hit trigger colliders (checkpoints, audio zones, coin pickups). This causes weapons and abilities to hit invisible volumes instead of solid targets.
Always supply `QueryTriggerInteraction.Ignore`:

```csharp
Physics.SphereCast(origin, radius, direction, out RaycastHit hit, maxDistance, targetLayers, QueryTriggerInteraction.Ignore);
```

#### 3. Aim Cone Math with Vector3.Dot
To detect whether a target lies within an aim cone (e.g., a $90^\circ$ field-of-view cone), use the dot product of two normalized vectors:

$$\vec{a} \cdot \vec{b} = \cos(\theta)$$

For normalized vectors:
- `Vector3.Dot(aimForward, toTarget) == 1.0`: Directly centered ($0^\circ$).
- `Vector3.Dot(aimForward, toTarget) >= 0.707f`: Inside a $90^\circ$ total cone ($45^\circ$ half-angle).
- `Vector3.Dot(aimForward, toTarget) >= 0.5f`: Inside a $120^\circ$ total cone ($60^\circ$ half-angle).
- `Vector3.Dot(aimForward, toTarget) <= 0.0f`: Target is behind the origin ($> 90^\circ$).

#### 4. Memory-Friendly Spatial Queries (OverlapSphereNonAlloc)
`Physics.OverlapSphere` allocates a new `Collider[]` array on the managed heap every time it executes, triggering the C# Garbage Collector and causing micro-stutter during combat.
Use `Physics.OverlapSphereNonAlloc` with a preallocated static buffer:

```csharp
private static readonly Collider[] s_HitBuffer = new Collider[16];

int hitCount = Physics.OverlapSphereNonAlloc(origin, radius, s_HitBuffer, targetLayers, QueryTriggerInteraction.Ignore);
for (int i = 0; i < hitCount; i++)
{
    Collider hitCollider = s_HitBuffer[i];
    // Process target without generating GC allocations
}
```

#### 5. OnDrawGizmosSelected() as Visual Proof in 3D Space
Physics rays, spherecasts, and aim cones are invisible in the Game view during play. Never test 3D queries by guessing why an interaction hit or missed.
Always implement `OnDrawGizmosSelected()`. When you select your GameObject in the Scene view, Unity renders the exact spherecast sweep path, query distance, cone boundary angles, and surface normal reflections in colored wireframe. You visually verify the 3D math with your own eyes in one second.

---

### Complete C# Reference Implementation: SpatialAbilityPrototype.cs
Create `Assets/_Sandbox_Dev/Scripts/SpatialAbilityPrototype.cs` and attach it to your player or test dummy in your dev sandbox:

```csharp
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.InputSystem;

/// <summary>
/// Implements a complete 3D spatial ability using the 4 Primitives:
/// 1. Input -> 2. Spatial Query -> 3. State & Math -> 4. Event & Feedback.
/// Features live Gizmo visualizers for the cast path and aim cone.
/// </summary>
public class SpatialAbilityPrototype : MonoBehaviour
{
    [Header("Spatial Query Settings")]
    [Tooltip("Radius of the sweep sphere in meters.")]
    [SerializeField] private float sphereRadius = 0.5f;

    [Tooltip("Maximum range of the ability sweep in meters.")]
    [SerializeField] private float maxRange = 12.0f;

    [Tooltip("Maximum allowed cone angle from aim direction in degrees (half-angle).")]
    [Range(5f, 90f)]
    [SerializeField] private float maxConeAngle = 45f;

    [Tooltip("LayerMask containing valid interactable/hittable targets.")]
    [SerializeField] private LayerMask targetLayers;

    [Header("State Settings")]
    [SerializeField] private float cooldownDuration = 1.0f;
    private float nextAllowedFireTime = 0f;

    [Header("Aim Reference")]
    [Tooltip("Transform representing aim origin and direction. Defaults to main camera.")]
    [SerializeField] private Transform aimOrigin;

    [Header("Feedback Events")]
    [SerializeField] private UnityEvent<Vector3, GameObject> onTargetHit;
    [SerializeField] private UnityEvent onAbilityMissed;

    // Cached debug variables for Gizmos
    private Vector3 lastCastOrigin;
    private Vector3 lastCastDirection;
    private bool hasLastHit;
    private RaycastHit lastHitInfo;

    private void Awake()
    {
        if (aimOrigin == null && Camera.main != null)
        {
            aimOrigin = Camera.main.transform;
        }

        if (aimOrigin == null)
        {
            Debug.LogError($"[{name}] Aim Origin is unassigned and Camera.main is not found in the scene!", this);
        }
    }

    private void Update()
    {
        // 1. Primitive: Input
        if (Keyboard.current != null && Keyboard.current.eKey.wasPressedThisFrame)
        {
            ExecuteAbility();
        }
    }

    /// <summary>
    /// Executes the spatial query and state math.
    /// </summary>
    public void ExecuteAbility()
    {
        // 3. Primitive: State & Math (Cooldown Check)
        if (Time.time < nextAllowedFireTime)
        {
            return;
        }
        nextAllowedFireTime = Time.time + cooldownDuration;

        Vector3 origin = aimOrigin != null ? aimOrigin.position : transform.position;
        Vector3 direction = aimOrigin != null ? aimOrigin.forward : transform.forward;

        lastCastOrigin = origin;
        lastCastDirection = direction;

        // 2. Primitive: 3D Spatial Query (SphereCast ignoring trigger colliders)
        hasLastHit = Physics.SphereCast(
            origin,
            sphereRadius,
            direction,
            out lastHitInfo,
            maxRange,
            targetLayers,
            QueryTriggerInteraction.Ignore
        );

        if (hasLastHit)
        {
            // 3. Primitive: State & Math (Aim Cone Angle Check via Vector3.Dot)
            Vector3 toTarget = (lastHitInfo.point - origin).normalized;
            float dotProduct = Vector3.Dot(direction, toTarget);
            float thresholdDot = Mathf.Cos(maxConeAngle * Mathf.Deg2Rad);

            if (dotProduct >= thresholdDot)
            {
                // 4. Primitive: Event & Feedback (Target Confirmed)
                onTargetHit?.Invoke(lastHitInfo.point, lastHitInfo.collider.gameObject);
                Debug.Log($"[SpatialAbility] Target hit: {lastHitInfo.collider.name} at {lastHitInfo.point} (Dot: {dotProduct:F2})", this);
                return;
            }
        }

        // 4. Primitive: Event & Feedback (Missed)
        onAbilityMissed?.Invoke();
    }

    private void OnDrawGizmosSelected()
    {
        Transform originTransform = aimOrigin != null ? aimOrigin : transform;
        Vector3 origin = originTransform.position;
        Vector3 direction = originTransform.forward;

        // Draw query range ray
        Gizmos.color = Color.cyan;
        Gizmos.DrawRay(origin, direction * maxRange);

        // Draw sphere origin wireframe
        Gizmos.DrawWireSphere(origin, sphereRadius);

        // Draw aim cone boundary rays
        float coneRad = maxConeAngle * Mathf.Deg2Rad;
        Vector3 rightBoundary = Quaternion.AngleAxis(maxConeAngle, originTransform.up) * direction;
        Vector3 leftBoundary = Quaternion.AngleAxis(-maxConeAngle, originTransform.up) * direction;
        Vector3 upBoundary = Quaternion.AngleAxis(maxConeAngle, originTransform.right) * direction;
        Vector3 downBoundary = Quaternion.AngleAxis(-maxConeAngle, originTransform.right) * direction;

        Gizmos.color = new Color(1f, 0.92f, 0.016f, 0.4f);
        Gizmos.DrawRay(origin, rightBoundary * maxRange);
        Gizmos.DrawRay(origin, leftBoundary * maxRange);
        Gizmos.DrawRay(origin, upBoundary * maxRange);
        Gizmos.DrawRay(origin, downBoundary * maxRange);

        // Draw last hit visualization if active in play mode
        if (Application.isPlaying && hasLastHit)
        {
            Gizmos.color = Color.green;
            Gizmos.DrawSphere(lastHitInfo.point, sphereRadius * 0.5f);
            Gizmos.DrawLine(lastHitInfo.point, lastHitInfo.point + lastHitInfo.normal * 1.5f);
        }
    }
}
```

---

### Milestone 1: The Dev Sandbox & Spatial Query Gym (20 min)
- [ ] Create a new scene `Assets/_Sandbox_Dev/Scenes/Dev_SpatialQuery.unity`.
- [ ] Build a test gym using ProBuilder:
  - Floor ($12 \times 12\text{ m}$).
  - 3 target dummy cubes placed at $3\text{ m}$, $7\text{ m}$, and $15\text{ m}$ away.
  - Set the dummy cubes' Layer to a dedicated `Target` layer.
- [ ] Place a player capsule with `CharacterController` and `SpatialAbilityPrototype.cs`.
- [ ] Configure `targetLayers` to select only the `Target` layer.
- [ ] Enter Play Mode. Press `E` to fire the sweep. Inspect the Scene view: verify the sphere wireframe, cone boundaries, and hit normal lines.
- [ ] Turn $60^\circ$ away from a target. Verify that `Vector3.Dot` rejects targets outside the cone even if the sphere touches them.
- [ ] **Vibe Code Audit:** If your team's prototype currently contains a bloated or vibe-coded mechanic script that nobody fully understands, do not copy it into production. Isolate it inside `Assets/_Sandbox_Dev/Scenes/Dev_<MechanicName>.unity`, break it down into the 4 Primitives, and rewrite it cleanly.

---

## Part 2: Fast In-Game Dev Tools

### The Cost of the 2-Minute Testing Loop
Consider a typical playtest cycle for an endgame puzzle or late-level combat encounter:
1. Hit Play in Unity.
2. Wait for UI fades and title screens.
3. Walk 90 seconds through completed level geometry.
4. Reach the encounter, make a slight input timing error, die, and restart.

Total iteration time: **120 seconds per bug test**.
If an engineer tests a jump timing tweak 30 times an afternoon, **60 minutes of developer time is wasted walking through hallways**.

**The Studio Rule:**
Ship dev tooling directly in the gameplay build. Any team member must be able to:
- Test abilities instantly via Inspector right-click without walking (`[ContextMenu]`).
- Catch unconfigured `LayerMask` bugs before running the game (`OnValidate`).
- Instantly teleport to any checkpoint using `F1`–`F3`.
- Slow down time to $0.1\times$ to inspect split-second physics glitches.
- Fast-forward time to $3.0\times$ to skip dialogue and travel segments.
- Inspect live internal state on-screen without garbage collection allocations.

All dev tooling code must be wrapped in `#if UNITY_EDITOR || DEVELOPMENT_BUILD` so it is automatically stripped from consumer release builds.

---

### 1-Click Inspector Testing: [ContextMenu]
Waiting for a character to traverse a level or set up external triggers just to test a single function wastes valuable sprint time.
Using the `[ContextMenu("...")]` attribute on any public or private method exposes that method in the Unity Inspector:

- Right-click the component's header (or click the three dots icon) in the Inspector.
- Click the context menu item to invoke the method immediately in Play Mode.

```csharp
[ContextMenu("Test Fire Ability")]
public void TestFireAbility()
{
    ExecuteAbility();
}

[ContextMenu("Reset Cooldowns")]
public void ResetCooldowns()
{
    nextAllowedFireTime = 0f;
    Debug.Log($"[{name}] Cooldown reset via ContextMenu.", this);
}
```

This gives programmers and designers a 1-click test button right in the Inspector to trigger abilities, spawn items, or reset cooldowns on demand.

---

### Edit-Time Inspector Guarding: OnValidate()
Level designers and technical artists edit prefab instances and scenes dozens of times per day. AI-generated code never accounts for this reality: it assumes serialized fields will always be configured properly.

A common bug in Unity 3D spatial queries is an unconfigured `LayerMask` field left as `Nothing`. Because `layerMask.value == 0`, every `Raycast`, `SphereCast`, and `OverlapSphere` query fails silently, hitting no colliders. The developer wastes hours debugging vector math when the physics query was never checking any layer.

`OnValidate()` is called automatically by the Unity Editor whenever a script compiles or when a designer changes any value in the Inspector:

```csharp
private void OnValidate()
{
    // Clamp numeric parameters to safe operational bounds
    sphereRadius = Mathf.Max(0.05f, sphereRadius);
    maxRange = Mathf.Clamp(maxRange, 1.0f, 100.0f);
    maxConeAngle = Mathf.Clamp(maxConeAngle, 5.0f, 89.0f);
    cooldownDuration = Mathf.Max(0.01f, cooldownDuration);

    // Catch silent layerMask == 0 (Nothing) configuration errors
    if (targetLayers.value == 0)
    {
        Debug.LogWarning(
            $"[{name}] Target Layers mask on {GetType().Name} is set to 'Nothing' (layerMask == 0). Spatial queries will hit no colliders!",
            this
        );
    }
}
```

---

### Copy-Paste C# Script: DevCheatController.cs
Create `Assets/_Sandbox_Dev/Scripts/DevCheatController.cs` and attach it to your player GameObject:

```csharp
using UnityEngine;
using UnityEngine.InputSystem;

/// <summary>
/// Provides hotkey-driven developer cheats for rapid playtesting:
/// - F1-F3: Checkpoint teleportation (with CharacterController safety handling)
/// - Left Bracket [ : 0.1x Slow Motion
/// - Right Bracket ] : 3.0x Fast Forward
/// - Backslash \ : 1.0x Normal Speed
/// Stripped from release builds via preprocessor directives.
/// </summary>
public class DevCheatController : MonoBehaviour
{
#if UNITY_EDITOR || DEVELOPMENT_BUILD
    [Header("Teleport Checkpoints")]
    [Tooltip("Transforms representing checkpoint teleport positions in the level.")]
    [SerializeField] private Transform[] checkpoints;

    private CharacterController characterController;

    private void Awake()
    {
        characterController = GetComponent<CharacterController>();
    }

    private void Update()
    {
        if (Keyboard.current == null) return;

        // Checkpoint Teleportation (F1 - F3)
        if (Keyboard.current.f1Key.wasPressedThisFrame) TeleportToCheckpoint(0);
        if (Keyboard.current.f2Key.wasPressedThisFrame) TeleportToCheckpoint(1);
        if (Keyboard.current.f3Key.wasPressedThisFrame) TeleportToCheckpoint(2);

        // Time Manipulation
        if (Keyboard.current.leftBracketKey.wasPressedThisFrame)
        {
            SetTimeScale(0.1f); // Slow-mo for inspecting physics collisions and animation blends
        }
        else if (Keyboard.current.rightBracketKey.wasPressedThisFrame)
        {
            SetTimeScale(3.0f); // Fast-forward for skipping long traversals
        }
        else if (Keyboard.current.backslashKey.wasPressedThisFrame)
        {
            SetTimeScale(1.0f); // Reset to standard speed
        }
    }

    /// <summary>
    /// Teleports the player to a target checkpoint index.
    /// Safely disables CharacterController to prevent physics cache snaps.
    /// </summary>
    public void TeleportToCheckpoint(int index)
    {
        if (checkpoints == null || index < 0 || index >= checkpoints.Length || checkpoints[index] == null)
        {
            Debug.LogWarning($"[DevCheat] Checkpoint {index + 1} is unassigned or out of range.", this);
            return;
        }

        Transform target = checkpoints[index];

        // CRITICAL: CharacterController caches internal position state.
        // Directly assigning transform.position while enabled causes the controller
        // to snap right back to its previous position on the next physics step.
        if (characterController != null)
        {
            characterController.enabled = false;
        }

        transform.position = target.position;
        transform.rotation = target.rotation;

        if (characterController != null)
        {
            characterController.enabled = true;
        }

        Debug.Log($"[DevCheat] Teleported to Checkpoint {index + 1} at {target.position}", this);
    }

    private void SetTimeScale(float scale)
    {
        Time.timeScale = scale;
        // Adjust fixedDeltaTime proportionally to keep FixedUpdate physics smooth
        Time.fixedDeltaTime = 0.02f * Time.timeScale;
        Debug.Log($"[DevCheat] TimeScale adjusted to {scale:F1}x (fixedDeltaTime: {Time.fixedDeltaTime:F4}s)");
    }
#endif
}
```

---

### On-Screen Debug Values: DevWatch
When an ability or controller behaves unexpectedly, developers often stare at the screen or add chaotic `Debug.Log` statements hoping to spot what went wrong.
By registering internal values with `DevWatch.Set(key, value)`, you project live numbers (grounded state, dot product alignment, current velocity, cooldown counters) directly onto your screen every frame without generating Garbage Collection allocations. This eliminates guesswork and keeps your gameplay state transparent.

---

### Copy-Paste C# Script: RuntimeDebugHUD.cs & DevWatch
Create `Assets/_Sandbox_Dev/Scripts/RuntimeDebugHUD.cs`:

```csharp
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.InputSystem;

/// <summary>
/// Static dictionary service for registering live runtime debug values.
/// Replaces temporary Debug.Log floods with on-screen watches without garbage collection.
/// </summary>
public static class DevWatch
{
    private static readonly Dictionary<string, string> s_WatchedValues = new Dictionary<string, string>(32);

    /// <summary>
    /// Registers or updates a watched key-value pair.
    /// </summary>
    public static void Set(string key, object value)
    {
#if UNITY_EDITOR || DEVELOPMENT_BUILD
        s_WatchedValues[key] = value != null ? value.ToString() : "null";
#endif
    }

    public static Dictionary<string, string>.Enumerator GetEnumerator()
    {
        return s_WatchedValues.GetEnumerator();
    }
}

/// <summary>
/// Renders an in-game debug overlay using IMGUI.
/// Toggled with F12. Completely stripped from release builds.
/// </summary>
[DefaultExecutionOrder(1000)]
public class RuntimeDebugHUD : MonoBehaviour
{
#if UNITY_EDITOR || DEVELOPMENT_BUILD
    private bool isVisible = true;
    private GUIStyle boxStyle;
    private GUIStyle headerStyle;
    private GUIStyle labelStyle;
    private float fps = 0f;
    private float fpsTimer = 0f;
    private int frameCount = 0;

    private void Update()
    {
        // Toggle visibility with F12
        if (Keyboard.current != null && Keyboard.current.f12Key.wasPressedThisFrame)
        {
            isVisible = !isVisible;
        }

        // Calculate smooth FPS without GC allocations
        frameCount++;
        fpsTimer += Time.unscaledDeltaTime;
        if (fpsTimer >= 0.5f)
        {
            fps = frameCount / fpsTimer;
            frameCount = 0;
            fpsTimer = 0f;
        }
    }

    private void OnGUI()
    {
        if (!isVisible) return;

        InitializeStyles();

        const float panelWidth = 280f;
        const float panelPadding = 12f;
        float currentY = panelPadding;

        // Count items to size background box
        int itemCount = 3; // FPS, TimeScale, FrameCount
        var enumerator = DevWatch.GetEnumerator();
        while (enumerator.MoveNext()) itemCount++;

        float boxHeight = itemCount * 22f + 36f;
        GUI.Box(new Rect(panelPadding, panelPadding, panelWidth, boxHeight), GUIContent.none, boxStyle);

        currentY += 8f;
        GUI.Label(new Rect(panelPadding + 10f, currentY, panelWidth - 20f, 20f), "RUNTIME DEV WATCH (F12)", headerStyle);
        currentY += 24f;

        GUI.Label(new Rect(panelPadding + 10f, currentY, panelWidth - 20f, 18f), $"FPS: {fps:F1} ({Time.unscaledDeltaTime * 1000f:F1} ms)", labelStyle);
        currentY += 20f;

        GUI.Label(new Rect(panelPadding + 10f, currentY, panelWidth - 20f, 18f), $"TimeScale: {Time.timeScale:F2}x", labelStyle);
        currentY += 20f;

        // Render custom watched variables
        enumerator = DevWatch.GetEnumerator();
        while (enumerator.MoveNext())
        {
            GUI.Label(
                new Rect(panelPadding + 10f, currentY, panelWidth - 20f, 18f),
                $"{enumerator.Current.Key}: {enumerator.Current.Value}",
                labelStyle
            );
            currentY += 20f;
        }
    }

    private void InitializeStyles()
    {
        if (boxStyle != null) return;

        // Dark translucent background box
        Texture2D bgTexture = new Texture2D(1, 1);
        bgTexture.SetPixel(0, 0, new Color(0.08f, 0.11f, 0.16f, 0.88f));
        bgTexture.Apply();

        boxStyle = new GUIStyle(GUI.skin.box);
        boxStyle.normal.background = bgTexture;

        headerStyle = new GUIStyle(GUI.skin.label)
        {
            fontSize = 11,
            fontStyle = FontStyle.Bold,
            alignment = TextAnchor.MiddleLeft
        };
        headerStyle.normal.textColor = new Color(1f, 0.3f, 0.47f);

        labelStyle = new GUIStyle(GUI.skin.label)
        {
            fontSize = 12,
            fontStyle = FontStyle.Normal,
            alignment = TextAnchor.MiddleLeft
        };
        labelStyle.normal.textColor = new Color(0.88f, 0.92f, 0.96f);
    }
#endif
}
```

---

### Milestone 2: Fast In-Game Dev Tools & Inspector Guards (20 min)
- [ ] In `SpatialAbilityPrototype.cs` (or your player component), add `[ContextMenu("Test Fire Ability")]` and `[ContextMenu("Reset Cooldowns")]`.
  - Right-click the component in the Inspector to verify 1-click execution without keyboard inputs.
- [ ] Add `OnValidate()` to `SpatialAbilityPrototype.cs` to guard against silent `layerMask == 0` bugs:
  - In the Inspector, deliberately set `targetLayers` to `Nothing`.
  - Verify that `OnValidate()` immediately logs an actionable warning identifying the unconfigured LayerMask.
  - Reset `targetLayers` to `Target`.
- [ ] Create 3 empty GameObjects in your dev scene at different positions: `Checkpoint_01`, `Checkpoint_02`, `Checkpoint_03`.
- [ ] Attach `DevCheatController.cs` to your player capsule. Assign the 3 checkpoint transforms to its `checkpoints` array.
- [ ] Attach `RuntimeDebugHUD.cs` to any persistent GameObject in the scene.
- [ ] In your player or ability script's `Update()` method, add two live watch values:
  ```csharp
  DevWatch.Set("IsGrounded", controller.isGrounded);
  DevWatch.Set("HorizontalSpeed", new Vector2(controller.velocity.x, controller.velocity.z).magnitude.ToString("F2"));
  ```
- [ ] Enter Play Mode:
  - Press `F1`, `F2`, `F3`: Verify instantaneous teleportation without physics snapping.
  - Press `[`: Verify smooth $0.1\times$ slow-motion.
  - Press `]`: Verify $3.0\times$ fast-forward.
  - Press `\`: Verify reset to $1.0\times$.
  - Press `F12`: Verify HUD toggles visibility on demand.

---

## Part 3: The Rider / VS Debugger

### Debugging by Code Inspection Instead of Guessing
The biggest trap when debugging complex bugs in Play Mode is guessing: changing random lines of code, adding scattered log statements, and hoping the issue disappears.

In a 15-person Unity studio, guessing fails for two critical reasons:
1. **Complex Scene and Runtime State:** At least half of all Unity bugs involve active physics steps, scene hierarchy overrides, missing layer masks, or unexpected collider triggers. Guessing at C# code without inspecting live values leads to unnecessary code rewrites while the real culprit in the Scene or Call Stack goes unnoticed.
2. **Losing Control of Your Code:** If you do not understand the exact path execution took through your scripts, you cannot answer a teammate during a playtest when an interaction breaks.

**The Professional Studio Rule:**
Never guess at a runtime failure. Attach Rider or Visual Studio, place a Conditional Breakpoint (`F9`), reproduce the issue in 3 seconds, step line-by-line (`F10`), and inspect the live variables and Call Stack yourself. Once you see the exact values and caller chain, you can fix the root cause in seconds with complete confidence.

---

### The Limitations of Printf Debugging
Relying exclusively on `Debug.Log` to solve complex studio bugs suffers from four major flaws:
1. **Floods the Console:** In an `Update()` loop running at 60 FPS, logging generates 3,600 lines per minute, causing GC stutter and obscuring other messages.
2. **Cannot Pause Time:** `Debug.Log` logs what *already happened*, but does not freeze memory or physics state at the exact moment of failure.
3. **Cannot Inspect Local Stack Variables:** Temporary variables created inside nested loops or private scopes cannot be examined without modifying and recompiling the script.
4. **Leaves Codebase Pollution:** Developers frequently forget to remove test logs, causing performance degradation in team builds.

Professional developers use the **IDE Debugger**.

---

### Step-by-Step: Attaching the IDE Debugger

#### In JetBrains Rider:
1. Open the project via Unity: **Assets -> Open C# Project**.
2. In the top-right toolbar, locate the configuration dropdown next to the green play button.
3. Select **Attach to Unity Process** (represented by a bug icon with the Unity logo).
4. Click the **Debug** button (or press `Shift + F9`).
5. Rider displays a connected state in the bottom status bar: `Connected to Unity Editor`.

#### In Visual Studio 2022:
1. Open the project via Unity.
2. In the main toolbar, locate the **Attach to Unity** button with the play symbol.
3. Click **Attach to Unity**.
4. Visual Studio switches to debugging layout and binds to the active Unity Editor process.

---

### Conditional Breakpoints: Clean Inspection
Placing an unconditional breakpoint (`F9`) inside an `Update()` or `FixedUpdate()` method freezes Unity on the very next frame, making it impossible to wait for a specific bug condition.

**The 4 Steps for Conditional Breakpoints:**
1. **Left-click gutter (F9):** Place a red breakpoint dot on the target line.
2. **Right-click red dot:** Open the breakpoint settings popup.
3. **Type condition:** Enter a C# boolean condition (e.g. `other.CompareTag("Boss")` or `damage > 50f`) and press Enter.
4. **Play in Unity:** Unity runs at 60 FPS and pauses automatically the instant the condition evaluates to `true`.

---

### Stepping Controls Quick Reference

| Action | Rider Shortcut | VS Shortcut | Description |
| :--- | :--- | :--- | :--- |
| **Toggle Breakpoint** | `F9` | `F9` | Sets or clears a breakpoint on current line. |
| **Continue** | `F5` | `F5` | Resumes game execution until next breakpoint. |
| **Step Over** | `F10` | `F10` | Executes current line and pauses at next line in same method. |
| **Step Into** | `F11` | `F11` | Jumps inside the called method to inspect its execution. |
| **Step Out** | `Shift + F11` | `Shift + F11` | Finishes current method and pauses at caller method. |
| **Evaluate Expression**| `Alt + F8` | `QuickWatch` | Evaluates any live C# expression against paused memory state. |

---

### Reading the Call Stack: Tracing Cross-Team Bugs
When an unexpected exception occurs, the **Call Stack** window reveals the exact inverted chain of execution that led to the failure.

```
[Top of Stack - Point of Failure]
  at HealthSystem.TakeDamage (Single damageAmount) [HealthSystem.cs:42]
  at ProjectileHitbox.OnTriggerEnter (Collider other) [ProjectileHitbox.cs:28]
  at UnityEngine.Physics.ProcessEvents ()
[Bottom of Stack - Origin Trigger]
```

#### How to Read the Call Stack:
1. **Bottom to Top:** Read from the bottom frame to see which event initiated the chain (e.g., an Input event or Physics trigger).
2. **Cross-Team Boundaries:** Notice when execution transitions across system boundaries (e.g., from `PlayerController` written by Programmer A into `QuestDialogueTrigger` written by Designer B).
3. **Double-Click Navigation:** Double-click any frame in the stack to jump directly to that line of code and inspect the values of its local variables at that precise moment.

---

### Milestone 3: Debugger & Call Stack Studio Dev Audit (15 min)
- [ ] Open your project in Rider or Visual Studio and attach the debugger to Unity.
- [ ] In `SpatialAbilityPrototype.cs`, place a conditional breakpoint on the line inside `ExecuteAbility()`:
  - Follow the 4 UI steps: left-click gutter (`F9`), right-click the red dot, type condition `hasLastHit == true`, and press Enter.
- [ ] Return to Unity and enter Play Mode. Aim at empty air and press `E`: verify that execution does not pause.
- [ ] Aim directly at a target dummy and press `E`: verify that the IDE instantly catches the breakpoint and pauses Unity.
- [ ] Use `F10` (Step Over) to advance one line. Hover your mouse over `lastHitInfo.point` and `dotProduct` to inspect their values in the tooltip.
- [ ] Open the **Variables / Locals** pane to view all in-scope data.
- [ ] Step through your ability script line-by-line with `F10` in the debugger and verify you can explain every single line's execution and data flow to a teammate.
- [ ] Press `F5` to resume game execution.

---

## Troubleshooting Checklist

| Issue | Root Cause | Production Solution |
| :--- | :--- | :--- |
| **Player snaps back to original spot after teleportation** | `CharacterController` internal physics cache overriding transform | Always disable `CharacterController` before modifying `transform.position`, then re-enable it immediately after. |
| **Spatial queries hit invisible trigger volumes** | Missing `QueryTriggerInteraction.Ignore` parameter | Pass `QueryTriggerInteraction.Ignore` to all `Raycast`, `SphereCast`, and `OverlapSphere` calls. |
| **Garbage Collector spikes during combat abilities** | Calling allocating query methods like `Physics.OverlapSphere` | Switch to `Physics.OverlapSphereNonAlloc` with a preallocated static buffer `Collider[]` of size 16 or 32. |
| **OnValidate triggers endless recursive loops** | Mutating scene hierarchy or calling `DestroyImmediate` in `OnValidate` | Keep `OnValidate` strictly focused on clamping local numerical variables and logging warnings. |
| **Debugger fails to hit breakpoints** | IDE attached to wrong process or script pdb symbols out of date | In Unity, verify **Preferences -> External Tools -> External Script Editor** is set to Rider or Visual Studio. Ensure IDE status indicates `Connected to Unity Editor`. |
| **Unity freezes permanently when stepping** | Stepping into infinite `while` loop or deadlock | Use conditional breakpoints with strict escape conditions; step over (`F10`) external library calls. |
| **Cheats still active in final release build** | Missing preprocessor guards | Wrap all cheat inputs and debug overlay in `#if UNITY_EDITOR || DEVELOPMENT_BUILD` directives. |

# Unity Complete Reference Manual & Best Practices

This document is the core technical reference manual for the Minor GDD. It covers the inner workings of the Unity Editor, C# architecture, physics simulation, camera systems, and optimization best practices.

---

## Table of Contents
1. [The Unity Editor & Windows](#1-the-unity-editor--windows)
2. [Script Lifecycle & Execution Order](#2-script-lifecycle--execution-order)
3. [C# in Unity: Types, References & Communication](#3-c-in-unity-types-references--communication)
4. [Physics: 2D Movement, Collisions & Triggers](#4-physics-2d-movement-collisions--triggers)
5. [Cinemachine 3 Smart Camera Systems](#5-cinemachine-3-smart-camera-systems)
6. [Modern Input System (Action-Based)](#6-modern-input-system-action-based)
7. [Editor Attributes & Fast Debugging](#7-editor-attributes--fast-debugging)
8. [Performance & Memory Management (Garbage Collection)](#8-performance--memory-management-garbage-collection)
9. [Best Practices Checklist](#9-best-practices-checklist)

---

## 1. The Unity Editor & Windows

### Primary Windows
- **Project View:** Contains all physical asset files on your hard drive (scripts, textures, audio, prefabs).
  > **Golden Rule:** *Never* drag a script file from the Project View into an inspector reference slot if you intend to reference an active scene object!
- **Hierarchy:** Displays all active GameObjects and Prefab instances in currently open scenes.
- **Scene View:** The 3D/2D spatial workspace where you position, rotate, and scale GameObjects.
- **Game View:** The view rendered by active cameras. Always set this to a fixed aspect ratio (e.g., `1920x1080 Full HD`) instead of `Free Aspect` to prevent UI distortions.
- **Inspector:** Displays all `Components` on the selected GameObject and exposes fields that are `public` or `[SerializeField]`.
- **Console:** Logs runtime information (`Debug.Log`), warnings (yellow), and compilation/runtime exceptions (red). Double-click a red error to jump directly to that exact line of code in your IDE.

### Play Mode Safety Rule
Changes made in the Inspector while the game is running (Play Mode) are **discarded** as soon as you stop!
- **Pro Tip (Playmode Tint):** Go to `Edit > Preferences > Colors > Playmode tint` and choose a distinct color overlay so you always know when the game is running.
- **Saving Values:** If you balance variables in Play Mode: Right-click the component &rarr; `Copy Component` &rarr; Exit Play Mode &rarr; Right-click component &rarr; `Paste Component Values`.

---

## 2. Script Lifecycle & Execution Order

Every script inheriting from `MonoBehaviour` follows a deterministic lifecycle:

```
[INITIALIZATION]
  ├── Awake()         -> Called once when GameObject is loaded (even if component is disabled). Setup internal variables.
  ├── OnEnable()      -> Called whenever the GameObject or component becomes active. Subscribe to C# events here!
  └── Start()         -> Called once before the first frame update, only if component is enabled. Setup references to other objects.

[GAME LOOP / FRAMES]
  ├── FixedUpdate()   -> Runs at fixed time intervals (default 50Hz / 0.02s). USE FOR RIGIDBODY & PHYSICS CALCULATIONS!
  ├── Update()        -> Runs once per frame (variable time delta). USE FOR INPUT POLLING & GAME LOGIC!
  └── LateUpdate()    -> Runs immediately after all Update() calls. USE FOR MANUAL CAMERA FOLLOWS & POST-LOGIC!

[DESTRUCTION]
  ├── OnDisable()     -> Called whenever the GameObject or component is disabled. Unsubscribe from C# events here!
  └── OnDestroy()     -> Called when the GameObject is permanently destroyed. Clean up unmanaged resources.
```

---

## 3. C# in Unity: Types, References & Communication

### Type Declarations
```csharp
// Primitive types
int score = 10;
float speed = 5.5f;           // Always terminate float literals with 'f'
string playerName = "Alex";
bool isGrounded = true;
const float GRAVITY = -9.81f; // Constants exist in C#!

// Unity Vectors & References
Vector2 direction2D = new Vector2(1f, 0f);
Vector3 position3D = new Vector3(0f, 2f, -5f);
[SerializeField] private Rigidbody rb;      // 3D Rigidbody
[SerializeField] private Rigidbody2D rb2d;  // 2D Rigidbody
```

### Encapsulation: `[SerializeField]` vs `public`
Avoid making fields `public` by default. Use `[SerializeField] private`:
```csharp
// GOOD: Visible in Inspector, but protected from unwanted external mutation
[SerializeField] private int maxHealth = 100;

// Read-only Property for external access:
public int MaxHealth => maxHealth;
```

### Safe Component Retrieval (`TryGetComponent`)
Avoid `GetComponent` when a component might not be present. `TryGetComponent` avoids memory allocations and prevents null reference exceptions:
```csharp
if (collision.gameObject.TryGetComponent<IDamageable>(out var damageable))
{
    damageable.TakeDamage(10);
}
```

---

## 4. Physics: 2D Movement, Collisions & Triggers

### 3 Methods to Move a Rigidbody:

```csharp
// 1. Direct Linear Velocity (Unity 6 Standard) - Best for arcade platformers, running, and jumping
rb2d.linearVelocity = new Vector2(inputX * speed, rb2d.linearVelocity.y);

// 2. MovePosition (Kinematic / Physics-Interpolated) - Moves object with collision detection
Vector2 targetPosition = rb2d.position + movementVector * Time.fixedDeltaTime;
rb2d.MovePosition(targetPosition);

// 3. AddForce - Realistic Newtonian physics (explosions, knockbacks)
rb2d.AddForce(Vector2.up * jumpImpulse, ForceMode2D.Impulse);
```

### Rigidbody2D Best Practice Settings
- **Body Type:** `Dynamic` (moves with physics forces and gravity).
- **Collision Detection:** `Continuous` (prevents fast-moving characters from tunneling through thin floor colliders).
- **Interpolation:** `Interpolate` (smooths movement rendering between fixed physics steps on 144Hz+ monitors).
- **Constraints:** Check `Freeze Rotation Z` so characters never accidentally tip over when walking against walls.

### Collision vs Trigger Callbacks

| Type | When Triggered? | Component Requirements | 2D Methods |
| :--- | :--- | :--- | :--- |
| **Collision** | Solid physical impact (objects bounce/block) | Both objects have Colliders, at least one has `Rigidbody2D` (`isTrigger = false`) | `OnCollisionEnter2D(Collision2D col)`<br>`OnCollisionStay2D(...)`<br>`OnCollisionExit2D(...)` |
| **Trigger** | Objects pass through each other (coins, damage zones) | At least one Collider has `isTrigger = true`, at least one has `Rigidbody2D` | `OnTriggerEnter2D(Collider2D col)`<br>`OnTriggerStay2D(...)`<br>`OnTriggerExit2D(...)` |

### Coin Pickup & Sound Pattern
When collecting items that self-destruct, use `AudioSource.PlayClipAtPoint` so the sound completes playing even after `Destroy(gameObject)` is called:
```csharp
private void OnTriggerEnter2D(Collider2D other)
{
    if (other.CompareTag("Player"))
    {
        if (pickupSound != null)
        {
            AudioSource.PlayClipAtPoint(pickupSound, transform.position, 1.0f);
        }
        Destroy(gameObject);
    }
}
```

---

## 5. Cinemachine 3 Smart Camera Systems

Cinemachine is Unity's procedural camera suite that follows targets automatically without manual tracking code.

### 4-Step 2D Camera Follow Setup:
1. In top menu: `GameObject > Cinemachine > Cinemachine Camera`.
2. Drag your player into the **Tracking Target** slot.
3. Set **Body** to `Framing Transposer`.
4. Adjust **Dead Zone** and **Damping** to create smooth tracking without jitter.

### Key Cinemachine Concepts:
- **Damping:** Adds smooth motion delay so the camera glides instead of rigidly locking to the character.
- **Dead Zone:** Center viewport box where the player moves freely without moving the camera.
- **Lookahead:** Sets camera lead ahead in player's movement direction.
- **Cinemachine Impulse:** Procedural screen shake without hardcoded camera animations:
  ```csharp
  // Attach CinemachineImpulseSource to player and trigger on impact:
  GetComponent<CinemachineImpulseSource>().GenerateImpulse();
  ```

---

## 6. Modern Input System (Action-Based)

Unity's new Input System decouples hardware input (Keyboard, Gamepad, Touch) from gameplay code using Input Action Assets.

### Option A: PlayerInput Component with Callbacks
Add a `PlayerInput` component to your character and configure **Behavior: Send Messages**:
```csharp
using UnityEngine;
using UnityEngine.InputSystem;

public class PlayerController : MonoBehaviour
{
    private Vector2 moveInput;

    // Called automatically by PlayerInput when "Move" action triggers
    public void OnMove(InputValue value)
    {
        moveInput = value.Get<Vector2>();
    }

    // Called automatically when "Jump" button is pressed
    public void OnJump(InputValue value)
    {
        if (value.isPressed)
        {
            Jump();
        }
    }
}
```

### Option B: C# Direct Action Subscriptions (Maximum Performance)
```csharp
private PlayerControls controls;

private void Awake() => controls = new PlayerControls();
private void OnEnable()
{
    controls.Player.Enable();
    controls.Player.Jump.performed += ctx => OnJump();
    controls.Player.Move.performed += ctx => moveInput = ctx.ReadValue<Vector2>();
    controls.Player.Move.canceled += ctx => moveInput = Vector2.zero;
}
private void OnDisable() => controls.Player.Disable();
```

---

## 7. Editor Attributes & Fast Debugging

Use built-in C# attributes to make components robust and self-documenting:

```csharp
using UnityEngine;

// 1. Automatically attaches required components to prevent NullReferenceExceptions
[RequireComponent(typeof(Rigidbody2D))]
[RequireComponent(typeof(Collider2D))]

// 2. Selects parent GameObject in Hierarchy when clicking child art in Scene View
[SelectionBase]
public class CharacterEntity : MonoBehaviour
{
    [Header("Movement Settings")]
    [Tooltip("Top horizontal running speed in meters per second.")]
    [SerializeField] private float runSpeed = 8f;

    [Range(0f, 1f)]
    [SerializeField] private float airControlMultiplier = 0.5f;

    // 3. Adds clickable testing action to component right-click menu in Inspector
    [ContextMenu("Reset Health to Full")]
    public void ResetHealth()
    {
        Debug.Log("Health reset to full via ContextMenu!");
    }

    // 4. Draw rays and debug visualizers in Scene View
    private void Update()
    {
        Debug.DrawRay(transform.position, Vector2.down * 1.5f, Color.green);
    }
}
```

---

## 8. Performance & Memory Management (Garbage Collection)

The Garbage Collector (GC) frees unused heap allocations. When GC runs, the game experiences stutter and frame drops.

### Preventing GC Allocations in `Update()`:

1. **Avoid `new` allocations in loops:**
   ```csharp
   // BAD: Allocates heap memory every frame
   void Update() {
       List<Enemy> enemies = new List<Enemy>(); 
   }

   // GOOD: Reuse collection on class level
   private List<Enemy> enemies = new List<Enemy>();
   void Update() {
       enemies.Clear();
   }
   ```
2. **Avoid String Concatenation in `Update()`: ```csharp
   // BAD: Creates new string allocations every frame
   scoreText.text = "Score: " + score.ToString();

   // GOOD: Only update UI when score actually changes via an event callback!
   ```
3. **Use NonAlloc Physics Queries:**
   ```csharp
   // GOOD: Fills pre-allocated array with zero garbage
   private Collider2D[] hitResults = new Collider2D[10];
   void CheckArea() {
       int hitCount = Physics2D.OverlapCircleNonAlloc(transform.position, 3f, hitResults);
   }
   ```

---

## 9. Best Practices Checklist

- [x] **Separation of Concerns:** Visuals (Renderers, Animators) on a Child GameObject; Physics (`Rigidbody`, `Collider`) on the Root.
- [x] **Uniform Scale:** Ensure parent GameObjects maintain a uniform scale of `(1, 1, 1)` to prevent distorted physics calculations.
- [x] **Never `GameObject.Find` in Update:** Use serialized direct references (`[SerializeField]`), Events, or ScriptableObjects.
- [x] **Physics in `FixedUpdate` Only:** Apply velocity, forces, and position changes inside `FixedUpdate`.
- [x] **Input in `Update` or Callbacks Only:** Poll input buttons in `Update()` or Input System callbacks to avoid missed keypresses.
- [x] **Always Terminate Floats with `f`:** Write `5.0f` instead of `5.0` to avoid implicit double precision conversions.

# Unity Complete Reference Manual & Best Practices

This document is the core technical reference manual for the Minor GDD. It covers the inner workings of the Unity Editor, C# architecture, physics simulation, and optimization best practices.

---

## Table of Contents
1. [The Unity Editor & Windows](#1-the-unity-editor--windows)
2. [Script Lifecycle & Execution Order](#2-script-lifecycle--execution-order)
3. [C# in Unity: Types, References & Communication](#3-c-in-unity-types-references--communication)
4. [Physics: 2D & 3D Movement and Collisions](#4-physics-2d--3d-movement-and-collisions)
5. [Performance & Memory Management (Garbage Collection)](#5-performance--memory-management-garbage-collection)
6. [Best Practices Checklist](#6-best-practices-checklist)

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

---

## 2. Script Lifecycle & Execution Order

Every script inheriting from `MonoBehaviour` follows a deterministic lifecycle:

```
[INITIALIZATION]
  ├── Awake()         -> Called once when GameObject is loaded (even if component is disabled).
  ├── OnEnable()      -> Called whenever the GameObject or component becomes active.
  └── Start()         -> Called once before the first frame update, only if component is enabled.

[GAME LOOP / FRAMES]
  ├── FixedUpdate()   -> Runs at fixed time intervals (default 50Hz / 0.02s). USE FOR PHYSICS!
  ├── Update()        -> Runs once per frame (variable time delta). USE FOR INPUT & GAME LOGIC!
  └── LateUpdate()    -> Runs immediately after all Update() calls. USE FOR CAMERA FOLLOWS!

[DESTRUCTION]
  ├── OnDisable()     -> Called whenever the GameObject or component is disabled.
  └── OnDestroy()     -> Called when the GameObject is permanently destroyed.
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
[SerializeField] private Rigidbody rb;      // 3D Rigidbody (lowercase 'b'!)
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
Avoid `GetComponent` when a component might not be present:
```csharp
// Allocates no garbage on failure and runs faster:
if (collision.gameObject.TryGetComponent<IDamageable>(out var damageable))
{
    damageable.TakeDamage(10);
}
```

---

## 4. Physics: 2D & 3D Movement and Collisions

### 3 Methods to Move a Rigidbody:

```csharp
// 1. Direct Velocity - Best for arcade platformers, running, and jumping
rb.velocity = new Vector3(inputX * speed, rb.velocity.y, inputZ * speed);

// 2. MovePosition (Kinematic / Physics-Interpolated) - Moves object with collision detection
Vector3 targetPosition = rb.position + movementVector * Time.fixedDeltaTime;
rb.MovePosition(targetPosition);

// 3. AddForce - Realistic Newtonian physics (rockets, explosions)
rb.AddForce(Vector3.up * jumpImpulse, ForceMode.Impulse);
```

### Collision vs Trigger Callbacks

| Type | When Triggered? | Component Requirements | Methods |
| :--- | :--- | :--- | :--- |
| **Collision** | Solid physical impact (objects bounce/block) | Both objects have Colliders, at least one has `Rigidbody` (`isTrigger = false`) | `OnCollisionEnter(Collision col)`<br>`OnCollisionStay(...)`<br>`OnCollisionExit(...)` |
| **Trigger** | Objects pass through each other (volume zones) | At least one Collider has `isTrigger = true`, at least one has `Rigidbody` | `OnTriggerEnter(Collider other)`<br>`OnTriggerStay(...)`<br>`OnTriggerExit(...)` |

> **Note for 2D:** Use 2D variants: `OnCollisionEnter2D(Collision2D col)` and `OnTriggerEnter2D(Collider2D col)`.

---

## 5. Performance & Memory Management (Garbage Collection)

The Garbage Collector (GC) frees unused heap allocations. When GC runs, the game experiences stutter and framedrops.

### Preventing GC Allocations in `Update()`:

1. **Avoid `new` in loops:**
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
2. **Avoid String Concatenation in `Update()`:**
   ```csharp
   // BAD: Creates new string allocations every frame
   scoreText.text = "Score: " + score.ToString();

   // GOOD: Only update UI when the score actually changes via an event!
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

## 6. Best Practices Checklist

- [x] **Separation of Concerns:** Visuals (Renderers, Animators) on a Child GameObject; Physics (`Rigidbody`, `Collider`) on the Root.
- [x] **Uniform Scale:** Ensure parent GameObjects maintain a uniform scale of `(1, 1, 1)` to prevent distorted physics math.
- [x] **Never `GameObject.Find` in Update:** Use serialized direct references (`[SerializeField]`), Events, or ScriptableObjects.
- [x] **Physics in `FixedUpdate` Only:** Use `Time.fixedDeltaTime` or let the physics engine step time.
- [x] **Input in `Update` or Callbacks Only:** Prevents missed keypresses.
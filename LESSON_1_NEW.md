# Lesson 1.1: Introduction to Unity 2D (Platformer Workshop)

Welcome to Lesson 1 of the Minor GDD Unity track. In this workshop, you build a clean, responsive 2D platformer base while learning core Unity component architecture and script execution order in **Unity 6 (6000.x)**.

> **WHY THIS WAS CHANGED (vs Old Way):**
> - **Old way:** Had no explicit learning objectives. Relied on unguided code completion in a broken file.
> - **New way:** Clear engineering targets stated up front in Unity 6 (6000.x).

---

## Learning Objectives
1. Master the GameObject-Component-Prefab relationship in Unity.
2. Correctly apply the script lifecycle (`Awake`, `Start`, `Update`, `FixedUpdate`).
3. Build a physics-based 2D character using `Rigidbody2D`, `Collider2D`, and the Unity Input System.
4. Set up a smooth follow camera using Cinemachine 3.

---

## Project Architecture & Setup

### 1. Requirements & Package Installation
- Unity Editor: **Unity 6 (6000.x)** with **2D (URP)** Template.
- **Input System:** Pre-installed and enabled by default in Unity 6.
- **Cinemachine 3:** Install via Package Manager:
  1. Open `Window > Package Manager`.
  2. In dropdown at top, select **Packages: Unity Registry**.
  3. Search **Cinemachine** -> Click **Install**.
- Starter Package: [`basics1.unitypackage`](projectfiles/basics1.unitypackage).

> **WHY THIS WAS CHANGED (vs Old Way):**
> - **Old way:** Relied on deprecated Built-in Pipeline with no package instructions.
> - **New way:** Built on Unity 6 with Universal Render Pipeline (URP) and modern Cinemachine 3.

### 2. Scene Hierarchy Standard (Separation of Concerns)
Always construct player prefabs with clear separation between physics, graphics, and detection:

```
[Player] (Root Object) -> Contains: Rigidbody2D, BoxCollider2D, PlayerController2D.cs, PlayerInput
  └── [Graphics] (Child Object) -> Contains: SpriteRenderer, Animator
  └── [GroundCheck] (Child Object) -> Empty GameObject positioned at foot level
```

> **WHY THIS WAS CHANGED (vs Old Way):**
> - **Old way:** Placed SpriteRenderers, Colliders, Animators, and Scripts all on one single GameObject. When students animated scale or flipped sprites, the Collider flipped or deformed with it, breaking collisions.
> - **New way:** Implements standard game industry **Separation of Concerns**: Root handles physics and translation; Child handles rendering and animation.

---

## Complete Production Code: PlayerController2D.cs

Create a new C# script named `PlayerController2D.cs` and paste the following code:

```csharp
using UnityEngine;
using UnityEngine.InputSystem;

[RequireComponent(typeof(Rigidbody2D))]
[RequireComponent(typeof(Collider2D))]
public class PlayerController2D : MonoBehaviour
{
    [Header("Movement Settings")]
    [SerializeField] private float moveSpeed = 8.5f;
    [SerializeField] private float jumpForce = 13f;

    [Header("Ground Detection")]
    [SerializeField] private Transform groundCheckPoint;
    [SerializeField] private float groundCheckRadius = 0.25f;
    [SerializeField] private LayerMask groundLayer;

    [Header("Visual Reference")]
    [SerializeField] private SpriteRenderer spriteRenderer;

    private Rigidbody2D rb;
    private Vector2 moveInput;
    private bool isGrounded;
    private bool jumpRequested;

    private void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
        
        // Prevent character from tipping over by locking Z rotation
        rb.freezeRotation = true;
    }

    // Triggered automatically by PlayerInput component (Send Messages)
    public void OnMove(InputValue value)
    {
        moveInput = value.Get<Vector2>();

        // Flip sprite visually without affecting root physics
        if (spriteRenderer != null && moveInput.x != 0)
        {
            spriteRenderer.flipX = moveInput.x < 0;
        }
    }

    public void OnJump(InputValue value)
    {
        if (value.isPressed && isGrounded)
        {
            jumpRequested = true;
        }
    }

    private void Update()
    {
        // 1. Ground detection evaluated in Update for instant response
        if (groundCheckPoint != null)
        {
            isGrounded = Physics2D.OverlapCircle(groundCheckPoint.position, groundCheckRadius, groundLayer);
        }
    }

    private void FixedUpdate()
    {
        // 2. Horizontal velocity applied in physics step with framerate independence (Unity 6 linearVelocity)
        rb.linearVelocity = new Vector2(moveInput.x * moveSpeed, rb.linearVelocity.y);

        // 3. Jump impulse applied in physics step
        if (jumpRequested)
        {
            rb.linearVelocity = new Vector2(rb.linearVelocity.x, jumpForce);
            jumpRequested = false;
        }
    }

    private void OnDrawGizmosSelected()
    {
        // Live visual ground check indicator in Scene View
        if (groundCheckPoint != null)
        {
            Gizmos.color = isGrounded ? Color.green : Color.red;
            Gizmos.DrawWireSphere(groundCheckPoint.position, groundCheckRadius);
        }
    }
}
```

> **WHY THIS WAS CHANGED (vs Old Way):**
> - **Old way:** Provided zero code in the lesson document. The starter file `PlayerStart.cs` had empty methods (`Move()`, `Jump()`, `ResetPlayer()`), forcing beginners to guess how to read Input, manage velocities, or write raycasts without reference.
> - **New way:** Provides complete, tested, production-grade C# code in Unity 6. Demonstrates:
>   1. `[RequireComponent]` attributes to prevent missing component errors.
>   2. Proper separation: Input registered in `Update()`, Physics velocity applied in `FixedUpdate()`.
>   3. `rb.linearVelocity` (Unity 6 modern standard property).
>   4. `rb.freezeRotation = true` to prevent character tipping over.
>   5. `OnDrawGizmosSelected` so students can visually see and debug their ground detection circle in the editor.

---

## Step-by-Step Assignment (4 Focused Steps)

### Step 1: Install Packages & Import Asset Package
1. In Unity Hub, create a new project with **Unity 6 (6000.x)** using the **2D (URP)** template.
2. Open `Window > Package Manager`, switch dropdown to **Packages: Unity Registry**.
3. Install **Cinemachine** (Input System is pre-installed in Unity 6).
4. Import [`basics1.unitypackage`](projectfiles/basics1.unitypackage) (`Assets > Import Package > Custom Package`).
5. Open `Class1/0_STARTSCENE/0_startscene.unity`.

### Step 2: Configure Player
1. Drag the `Player_Start` prefab into the scene Hierarchy.
2. Attach `PlayerController2D.cs` to the `Player_Start` root.
3. Attach `PlayerInput` component (set Behavior to `Send Messages`).
4. Create an empty child GameObject named `GroundCheck`, position it at foot level, and drag it into the `Ground Check Point` field in the Inspector.
5. Set `Ground Layer` to `Default` or `Ground`.
6. Drag the child `Graphics` object into the `Sprite Renderer` field.

### Step 3: Cinemachine 3 Follow Camera
1. In menu: `GameObject > Cinemachine > Cinemachine Camera`.
2. In Inspector, drag `Player_Start` into the **Tracking Target** slot.
3. Enter Play Mode: the camera follows the player with smooth dead zones.

### Step 4: Coins & Collectibles
1. Create a `Coin` script and attach a `CircleCollider2D` (`isTrigger = true`) to the coin prefab:
```csharp
using UnityEngine;

public class Coin : MonoBehaviour
{
    private void OnTriggerEnter2D(Collider2D other)
    {
        if (other.CompareTag("Player"))
        {
            Destroy(gameObject);
        }
    }
}
```

> **WHY THIS WAS CHANGED (vs Old Way):**
> - **Old way:** Vague list of 10 disparate tasks (Jump sprite slicing, 2D Joints, Sprite Shape, Tilemaps, Platform Effectors) all thrown into week 1. Overloaded students with too many unrelated mechanics.
> - **New way:** Streamlined into 4 clear, sequential milestones that build a working core loop first before moving on.

---

## Troubleshooting Checklist

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **Character falls through floor** | Missing collider or wrong layer mask | Ensure floor has a `BoxCollider2D` and `groundLayer` matches floor Layer. |
| **Character flips/tips over** | Physics torque rotating Z axis | Verify `rb.freezeRotation = true` or check `Constraints > Freeze Rotation Z`. |
| **Input keys don't respond** | Missing PlayerInput component | Ensure `PlayerInput` is on the root GameObject and set to `Behavior: Send Messages`. |
| **Ground detection circle invisible** | Gizmos disabled or unselected | Select the Player in Hierarchy and toggle `Gizmos` on top-right of Scene View. |

> **WHY THIS WAS CHANGED (vs Old Way):**
> - **Old way:** Contained zero troubleshooting tips. When beginners encountered falling or rotating characters, they got stuck.
> - **New way:** Explicit table with top 4 failure modes and immediate one-click solutions.

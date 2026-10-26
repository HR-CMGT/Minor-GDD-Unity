# Lesson 1.7: 3D Block Prototyping & Greyboxing

[Presentation](https://hr-cmgt.github.io/Minor-GDD-Unity/presentation_blockprototyping) -
[Project Files](../projectfiles/readme.md) -
[Resources](00_resources.md) -
[Tutorials](00_tutorials.md) -
[Assignment](#assignment)

## Presentation
This week's [presentation can be found here](https://hr-cmgt.github.io/Minor-GDD-Unity/presentation_blockprototyping)

## Resources
- Our own [tips, tricks and best practices](00_unity.md) for working with Unity 6
- [3D Prototyping Code Snippets](00_codesnippets.md) for quick reference on CharacterController, Cinemachine 3, and NavMesh

---

## Project Files & Setup
> **Note:** You can build and test your 3D blockout directly inside your team's ongoing 3D project (or in a fresh scene `Assets/Class7/Class7_Blockout.unity`). All required tools (ProBuilder, Cinemachine, Input System, and AI Navigation) are pre-installed or available via the Unity Registry in Unity 6 (6000.x).
>
> If you want pre-configured player controllers (First/Third-Person with foot IK), Alt+Drag duplicate, and ProBuilder meter snapping tools ready out of the box, you can optionally download and import [BlockoutToolkit.unitypackage](../projectfiles/BlockoutToolkit.unitypackage).

---

## Assignment (2-Hour In-Class Workshop)
In this 2-hour hands-on session, you will learn the core disciplines of 3D level greyboxing ("Blocktober" methodology). You will build a modular greybox kit with ProBuilder, implement a responsive camera-relative character controller (First-Person or Third-Person), establish an interactive gameplay loop (Start -> Interaction -> Goal), add a simple NavMesh NPC, and conclude with a live blind peer playtest.

Complete the **4 Milestones** below before the end of the session:

---

### Standard Design Metrics (1 Unity Unit = 1 Meter)
Before placing any geometry, lock these spatial measurements in mind:
- **Player Character:** $1.8\text{ m}$ height, $0.6\text{ m}$ diameter (`CharacterController` capsule).
- **Doorways:** Min. $1.2\text{ m}$ wide, $2.2\text{ m}$ high.
- **Corridors:** Min. $3.0\text{ m}$ wide (essential for third-person camera clearance).
- **Jump Height:** $1.5\text{ m} - 2.0\text{ m}$.
- **Stair Riser:** $0.2\text{ m}$ ($20\text{ cm}$) height per step.

---

### Milestone 1: ProBuilder & The Modular Greybox Kit (30 min)

Instead of sculpting an entire level out of one fragile mega-mesh, professional level designers build a **modular kit of reusable prefabs** and snap them together.

1. **Open ProBuilder:**
   - In Unity menu: **Tools -> ProBuilder -> ProBuilder Window**.
   - ProBuilder meshes automatically feature the built-in 1-meter grid material.
2. **Master the 4 Editing Modes:**
   - **Object Mode:** Move, rotate, or duplicate entire geometric blocks.
   - **Vertex Mode:** Manipulate corner points (ideal for creating ramps and wedges).
   - **Edge Mode:** Split or bevel edges (ideal for door frames and chamfers).
   - **Face Mode:** Select surfaces to **Extrude** (`Shift + Drag` the gizmo) to pull out walls or corridors.
3. **Flawless Snapping Shortcuts:**
   - `Ctrl + Drag`: **Grid Snapping** (moves in strict $1.0\text{ m}$ or $0.5\text{ m}$ increments).
   - `V + Drag`: **Vertex Snapping** (grabs any vertex and snaps it magnetically to an adjacent vertex, eliminating cracks and seam gaps).
4. **Construct Your 4 Modular Prefabs:**
   - Create a folder `Assets/Prefabs/Greybox/`.
   - Build each piece with ProBuilder, reset its Pivot (`Set Pivot` in ProBuilder toolbar), and drag it into the folder as an original prefab:
     - `Floor_4x4m`: Scale $X: 4, Y: 0.2, Z: 4$.
     - `Wall_4x3m`: Scale $X: 4, Y: 3, Z: 0.4$.
     - `Doorway_4x3m`: Wall with a centered opening ($1.2\text{ m}$ wide, $2.2\text{ m}$ high).
     - `Stairs_2m`: Stair shape with a total rise of $2.0\text{ m}$ and $10$ steps ($0.2\text{ m}$ step height).
5. **Assemble Your First Test Room:**
   - Using `Ctrl + D` (duplicate) and Vertex Snapping (`V`), snap your prefabs together into a $12 \times 12\text{ m}$ arena with an elevated platform accessible via your stairs.

---

### Milestone 2: Player Controller & Camera Choice (30 min)

#### Why CharacterController instead of Rigidbody?
A `Rigidbody 3D` frequently snags or bounces when sliding across the seams between modular floor tiles. Unity's `CharacterController` component provides butter-smooth stair climbing (`Step Offset: 0.3`) and slope traversal (`Slope Limit: 45°`).

1. **Player Setup:**
   - Create a Capsule GameObject named `Player_3D`.
   - Add a `CharacterController` component (Height: `1.8`, Radius: `0.3`, Center: `0, 0.9, 0`).
   - Add `PlayerInput` (Input Action Asset: *DefaultInputActions*, Behavior: *Send Messages*).
   - Create and attach `PlayerController3D.cs`:

```csharp
using UnityEngine;
using UnityEngine.InputSystem;

[RequireComponent(typeof(CharacterController))]
public class PlayerController3D : MonoBehaviour
{
    [Header("Movement Settings")]
    [SerializeField] private float moveSpeed = 6.0f;
    [SerializeField] private float jumpHeight = 1.6f;
    [SerializeField] private float gravity = -19.62f;

    [Header("Camera Reference")]
    [SerializeField] private Transform cameraTransform;

    private CharacterController controller;
    private Vector2 inputVector;
    private float verticalVelocity;

    private void Awake()
    {
        controller = GetComponent<CharacterController>();
        if (cameraTransform == null && Camera.main != null)
        {
            cameraTransform = Camera.main.transform;
        }
    }

    public void OnMove(InputValue value) => inputVector = value.Get<Vector2>();

    public void OnJump(InputValue value)
    {
        if (value.isPressed && controller.isGrounded)
        {
            // Exact upward velocity formula: v = sqrt(2 * g * h)
            verticalVelocity = Mathf.Sqrt(jumpHeight * -2f * gravity);
        }
    }

    private void Update()
    {
        // 1. Calculate direction relative to camera
        Vector3 forward = cameraTransform != null ? cameraTransform.forward : Vector3.forward;
        Vector3 right = cameraTransform != null ? cameraTransform.right : Vector3.right;
        forward.y = 0f;
        right.y = 0f;
        forward.Normalize();
        right.Normalize();

        Vector3 moveDirection = (forward * inputVector.y + right * inputVector.x) * moveSpeed;

        // 2. Gravity handling
        if (controller.isGrounded && verticalVelocity < 0f)
        {
            verticalVelocity = -2f; // Slight downward force to maintain stable grounding
        }
        else
        {
            verticalVelocity += gravity * Time.deltaTime;
        }

        moveDirection.y = verticalVelocity;
        controller.Move(moveDirection * Time.deltaTime);

        // 3. Rotate character model towards movement direction
        Vector3 horizontalMove = new Vector3(moveDirection.x, 0, moveDirection.z);
        if (horizontalMove.sqrMagnitude > 0.1f)
        {
            Quaternion targetRotation = Quaternion.LookRotation(horizontalMove);
            transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, Time.deltaTime * 12f);
        }
    }
}
```

2. **Select Your Camera Perspective (Choose 1):**

   * **Option A: First-Person (Cinemachine POV)**
     - Ideal for puzzle, exploration, or shooter mechanics.
     - Create a `Cinemachine Camera` as a child of `Player_3D` at eye level ($Y = 1.6\text{m}$).
     - In the Cinemachine Camera settings, set Tracking/Aim to **POV**.
     - Connect mouse delta input to drive Pitch and Yaw.
     - *Advantage:* Zero risk of walls obstructing the camera view!

   * **Option B: Third-Person (Cinemachine 3 Orbit Follow)**
     - Ideal for platformers and action games where player silhouette and jumping arcs are critical.
     - Create a `Cinemachine Camera` in the scene. Drag `Player_3D` into both **Follow** and **LookAt**.
     - Set offset to $X: 0, Y: 2.0, Z: -4.5$.
     - **Essential Step:** Add the **Cinemachine De-occlude** (or *Cinemachine Collider*) component. Set its Layer Mask to include your ProBuilder wall layer. This automatically pulls the camera forward when entering tight spaces, preventing it from clipping through walls!

---

### Milestone 3: Gameplay Loop & Level Interaction (25 min)

A blockout test is only valid when it has a complete playable loop: **Spawn Point -> World Interaction -> Goal Trigger**.

1. **Level Interaction Component (`LevelInteractable.cs`):**
   - Create a reusable trigger script driven by `UnityEvent`. This allows you to wire up switches, buttons, pressure plates, or keys directly in the Inspector without writing custom code for every object:

```csharp
using UnityEngine;
using UnityEngine.Events;

public class LevelInteractable : MonoBehaviour
{
    [Header("Event Triggers")]
    [SerializeField] private UnityEvent onTriggered;
    [SerializeField] private bool singleUse = true;

    private bool isActivated = false;

    private void OnTriggerEnter(Collider other)
    {
        if (isActivated && singleUse) return;

        if (other.CompareTag("Player"))
        {
            isActivated = true;
            onTriggered?.Invoke();
            Debug.Log($"[Interaction] Activated by player: {gameObject.name}");
        }
    }
}
```

2. **Configure Your Interactive Beat:**
   - Create a switch/button object using ProBuilder with a `BoxCollider` (`Is Trigger: true`).
   - Add `LevelInteractable.cs`.
   - In the `On Triggered ()` event list, link a gate or doorway: set `GameObject.SetActive(false)` to open a path, or activate a bridge!
3. **Establish Goal Trigger:**
   - Create a visible goal marker at the end of the route.
   - Attach `LevelInteractable.cs` with an event that logs victory or triggers a UI message.
4. **Add the Killzone Safety Net:**
   - Missed jumps must never send the player falling infinitely into $Y = -500$.
   - Place a large, flat ProBuilder cube under your entire level at $Y = -10$.
   - Check `Is Trigger: true` on its collider.
   - Attach a trigger script that resets `controller.enabled = false`, repositions `transform.position` back to the Spawn Point, and re-enables `controller.enabled = true`.

---

### Milestone 4: Simple NavMesh NPC & Blind Peer Playtest (35 min)

#### 1. Simple AI Navigation (10 min)
Add life to your greybox with a patrolling or following NPC using Unity's AI Navigation package:
1. Select your static floor prefabs.
2. In the Inspector, add the **NavMeshSurface** component.
3. Click **Bake**. The walkable floor geometry highlights in cyan.
4. Create an NPC capsule, add a `NavMeshAgent` component, and attach `SimpleNPC.cs`:

```csharp
using UnityEngine;
using UnityEngine.AI;

[RequireComponent(typeof(NavMeshAgent))]
public class SimpleNPC : MonoBehaviour
{
    [SerializeField] private Transform targetPlayer;
    private NavMeshAgent agent;

    private void Awake() => agent = GetComponent<NavMeshAgent>();

    private void Update()
    {
        if (targetPlayer != null)
        {
            agent.SetDestination(targetPlayer.position);
        }
    }
}
```

#### 2. The 10-Minute Blind Peer Playtest (15 min)
At the 100-minute mark of class, turn your laptop 90 degrees to your peer:
- **Rules for the Creator:**
  - **Do not speak, explain, or give hints.**
  - Silently observe where the tester hesitates, gets lost, or tries to jump over geometry that is too high.
- **Verification Checklist for the Tester:**
  - [ ] Was the initial direction clear from the spawn point?
  - [ ] Did doorways ($>1.2\text{m}$) and stairways feel comfortable to navigate?
  - [ ] Did the camera remain clean without jittering or clipping through walls?
  - [ ] Did you successfully trigger the level interaction to reach the goal?

---

## Troubleshooting Checklist

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **Player snags on floor tiles** | Using Rigidbody on seams | Use `CharacterController` with `Step Offset: 0.3`. |
| **Camera clips through walls** | Missing occlusion solver | In Cinemachine, add **Cinemachine De-occlude** / **Collider** with your wall layer selected. |
| **Cracks / seams between walls** | Freehand placement | Hold `V` to use **Vertex Snapping** directly on vertices. |
| **NPC stands still** | Unbaked NavMesh | Ensure floors are static/active and re-click **Bake** on `NavMeshSurface`. |
| **Infinite falling into the void** | Missing killzone | Place a trigger cube spanning the entire level at $Y = -10$ to reset player position. |

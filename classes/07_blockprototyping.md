# Lesson 1.7: 3D Block Prototyping & Greyboxing

In this lesson, you transition from 2D to 3D. You learn how to rapidly prototype levels using **ProBuilder**, work accurately with snapping, and implement a camera-relative 3D character controller.

---

## 🎯 Learning Objectives
1. Rapidly greybox and iterate 3D levels using **ProBuilder**.
2. Master **Snapping techniques** (Grid Snap & Vertex Snap) for modular assembly.
3. Implement a 3D character controller using the `CharacterController` component.
4. Set up AI navigation using **NavMesh**.

---

## 🧱 1. Level Greyboxing with ProBuilder

ProBuilder provides direct in-editor 3D modeling inside Unity.

### Opening ProBuilder:
1. Go to: `Tools > ProBuilder > ProBuilder Window`.
2. Right-click the window to toggle between icon and text modes.

### 4 Editing Modes of ProBuilder:
- **Object Mode:** Move, rotate, or scale the entire ProBuilder shape.
- **Vertex Mode:** Manipulate individual vertices (useful for ramps and slopes).
- **Edge Mode:** Manipulate or split edges (useful for chamfers and bevels).
- **Face Mode:** Select faces to **Extrude** (`Shift + Drag`), delete, or apply materials.

### Essential ProBuilder Shortcuts:
- **Extrude Face:** Hold `Shift` while dragging the Move Gizmo on a selected face to create corridors, rooms, or pillars instantly.
- **Merge Objects:** Select multiple shapes and click `Merge Objects` in the toolbar.

---

## 📏 2. Level Design Metrics & Snapping

### Standard Design Metrics (1 Unity Unit = 1 Meter):
- **Doorways:** $1.2\text{ m}$ wide, $2.2\text{ m}$ high.
- **Corridors:** Minimum $3.0\text{ m}$ wide for clean third-person camera clearance.
- **Character Jump Height:** $1.5\text{ m}$ to $2.0\text{ m}$.
- **Stair Riser:** $0.2\text{ m}$ step height.

### Snapping Shortcuts:
- **Grid Snapping:** Hold `Ctrl` while moving to snap to grid intervals (default $1.0\text{ m}$ or $0.5\text{ m}$).
- **Vertex Snapping:** Hold `V`, hover over a source vertex, and drag it directly to snap onto another object's vertex without seam gaps.

---

## 🏃 3. 3D Character Controller Script

For prototyping, prefer `CharacterController` over `Rigidbody 3D` to avoid unwanted bouncing or clipping on seams.

```csharp
using UnityEngine;
using UnityEngine.InputSystem;

[RequireComponent(typeof(CharacterController))]
public class PlayerController3D : MonoBehaviour
{
    [Header("Movement")]
    [SerializeField] private float moveSpeed = 7f;
    [SerializeField] private float sprintMultiplier = 1.5f;
    [SerializeField] private float jumpHeight = 1.8f;
    [SerializeField] private float gravity = -20f;

    [Header("Camera Reference")]
    [SerializeField] private Transform cameraTransform;

    private CharacterController controller;
    private Vector2 inputVector;
    private float verticalVelocity;
    private bool isSprinting;

    private void Awake()
    {
        controller = GetComponent<CharacterController>();
    }

    public void OnMove(InputValue value) => inputVector = value.Get<Vector2>();
    public void OnSprint(InputValue value) => isSprinting = value.isPressed;

    public void OnJump(InputValue value)
    {
        if (value.isPressed && controller.isGrounded)
        {
            // Exact upward velocity formula for desired jump height: v = sqrt(2 * g * h)
            verticalVelocity = Mathf.Sqrt(jumpHeight * -2f * gravity);
        }
    }

    private void Update()
    {
        // 1. Calculate direction relative to camera
        Vector3 forward = cameraTransform.forward;
        Vector3 right = cameraTransform.right;
        forward.y = 0f;
        right.y = 0f;
        forward.Normalize();
        right.Normalize();

        float currentSpeed = isSprinting ? moveSpeed * sprintMultiplier : moveSpeed;
        Vector3 moveDirection = (forward * inputVector.y + right * inputVector.x) * currentSpeed;

        // 2. Gravity handling
        if (controller.isGrounded && verticalVelocity < 0f)
        {
            verticalVelocity = -2f; // Slight downward force to keep grounded
        }
        else
        {
            verticalVelocity += gravity * Time.deltaTime;
        }

        moveDirection.y = verticalVelocity;

        // 3. Move controller
        controller.Move(moveDirection * Time.deltaTime);

        // 4. Rotate character towards movement direction
        Vector3 horizontalMove = new Vector3(moveDirection.x, 0, moveDirection.z);
        if (horizontalMove.sqrMagnitude > 0.1f)
        {
            Quaternion targetRotation = Quaternion.LookRotation(horizontalMove);
            transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, Time.deltaTime * 12f);
        }
    }
}
```

---

## 🤖 4. AI NavMesh Pathfinding Setup

1. Mark all static floor and wall geometry as **Static** (or add `NavMeshSurface`).
2. Open `Window > AI > Navigation` and click **Bake**.
3. Create an enemy GameObject with a `NavMeshAgent` component.
4. Attach a target follower script:

```csharp
using UnityEngine;
using UnityEngine.AI;

[RequireComponent(typeof(NavMeshAgent))]
public class EnemyAI : MonoBehaviour
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

---

## 🛠️ Hands-on Assignment (30 minutes)

1. Open ProBuilder and spawn a `New Shape` (e.g., a 10x1x10 meter floor).
2. Using Face Extrude and Vertex Snapping, build a greybox arena containing:
   - An elevated platform with a ramp or stairs.
   - A narrow walkway bridge.
   - At least 2 cover pillars.
3. Attach `PlayerController3D.cs` and test jump distances and traversal flow.
4. Bake a NavMesh and have an enemy chase the player!
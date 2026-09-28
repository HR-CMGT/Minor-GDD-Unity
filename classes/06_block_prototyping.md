# Lesson 06: 3D Block Prototyping & Greyboxing

[Presentation](https://hr-cmgt.github.io/Minor-GDD-Unity/presentation_basics6) -
[Project Files](../projectfiles/readme.md) -
[Resources](00_resources.md) -
[Tutorials](00_tutorials.md) -
[Assignment](#assignment)

## Presentation
This week's [presentation can be found here](https://hr-cmgt.github.io/Minor-GDD-Unity/presentation_basics6)

## Resources
- Our own [tips, tricks and best practices](00_unity.md) for working with Unity 6
- [Basics Code Snippets](00_codesnippets.md) for quick reference
- Unity Manual: [ProBuilder Documentation](https://docs.unity3d.com/Packages/com.unity.probuilder@latest)
- Unity Manual: [Unity AI Navigation Package](https://docs.unity3d.com/Packages/com.unity.ai.navigation@latest)
- Unity Manual: [Cinemachine 3.x Documentation](https://docs.unity3d.com/Packages/com.unity.cinemachine@latest)
- Unity Manual: [CharacterController Component](https://docs.unity3d.com/ScriptReference/CharacterController.html)

---

## Project Files & Setup

This lesson establishes the technical foundation for 3D spatial prototyping, kinematic character movement, dynamic camera rigging, and NavMesh navigation in Unity 6 (6000.x).

### Required Packages
Verify that the following packages are installed via **Window -> Package Manager**:

1. **ProBuilder** (`com.unity.probuilder`): In-engine 3D mesh modeling and level greyboxing.
2. **Input System** (`com.unity.inputsystem`): Event-driven input processing.
3. **Cinemachine** (`com.unity.cinemachine` version 3.x): Procedural camera control and collision avoidance.
4. **AI Navigation** (`com.unity.ai.navigation`): Modern runtime surface-based NavMesh generation.

---

## Learning Objectives

By the end of this class, you will be able to:
1. Apply standard spatial metrics (1 Unit = 1 Meter) to construct functional 3D greybox levels.
2. Construct modular architectural geometry inside Unity using ProBuilder editing modes, extrusions, edge loops, and grid/vertex snapping.
3. Architect a deterministic 3D `CharacterController` with camera-relative movement vectors, ballistic jump math ($v = \sqrt{-2gh}$), and grounded SphereCast validation.
4. Configure a third-person Cinemachine 3.x camera rig with input binding and de-occlusion raycasting.
5. Bake and update runtime navigation meshes using `NavMeshSurface`, `NavMeshAgent`, and dynamic carving `NavMeshObstacle` components.

---

## Module 1: World Space & Level Design Metrics

Greyboxing (or whiteboxing) is the practice of building playable spaces with primitive geometry before committing art resources. Consistent scale metrics are mandatory to prevent character clipping, camera stutter, and navigation failures.

### Standard Metric Reference: 1 Unity Unit = 1.0 Meter

Unity's physics engine (PhysX), NavMesh query system, and lighting models are calibrated around 1 unit equaling 1 meter. Deviating from this scale causes unnatural gravity acceleration, incorrect lighting falloff, and agent clipping.

```
+-----------------------------------------------------------------------+
| LEVEL DESIGN METRIC REFERENCE SHEET (1 UNIT = 1 METER)               |
+-----------------------------------------------------------------------+
| Entity / Feature      | Width / Depth    | Height       | Notes       |
+-----------------------+------------------+--------------+-------------+
| Standard Player Model | 0.6m - 0.8m dia  | 1.8m         | Eye @ 1.65m |
| Single Doorway        | 1.2m - 1.4m      | 2.2m - 2.4m  | Clearance   |
| Double Doorway        | 2.4m - 2.8m      | 2.8m - 3.2m  | High-traffic|
| Tight Corridor        | 1.8m - 2.0m      | 2.8m - 3.0m  | Stealth/1P  |
| Combat Corridor (3P)  | 3.0m - 4.5m      | 3.5m - 4.0m  | Camera room |
| Low Cover (Crouch)    | Variable         | 1.0m         | Vaultable   |
| High Cover (Standing) | Variable         | 2.0m - 2.2m  | Sight block |
| Stair Step            | 0.3m tread       | 0.18m - 0.2m | Use ramps   |
| Max Ramp Incline      | --               | --           | <= 45 deg   |
| Vertical Jump Reach   | --               | 1.2m - 1.5m  | Standard    |
| Horizontal Jump Gap   | 2.5m - 3.5m      | --           | @ 6.0 m/s   |
+-----------------------------------------------------------------------+
```

### Spatial Clearance Rationale

- **Doorways (1.2m min width):** While a character mesh is 0.6m wide, third-person cameras require extra lateral clearance. Narrower apertures cause the Cinemachine de-occluder to rapidly snap forward, inducing motion sickness.
- **Ceiling Heights (3.5m min in Third-Person):** Low ceilings force third-person orbit cameras down into the player model. Keep interior ceilings at least 3.5m high unless building dedicated crawlspaces.
- **Ramps vs Stairs:** Always place invisible 30-to-45 degree collision ramps over decorative stairs. Stepped geometry causes discrete vertical bumps in `CharacterController.Move()` unless step offset is tuned precisely.

### Greybox Material Palette

Assign high-contrast, flat colors to communicate gameplay function immediately:

- **Neutral Floor (RGB 0.75, 0.75, 0.75):** Standard walkable terrain.
- **Structural Wall (RGB 0.35, 0.35, 0.35):** Non-traversable boundaries.
- **Low Cover (RGB 0.20, 0.55, 0.85):** Vaultable barricades.
- **High Cover (RGB 0.15, 0.35, 0.65):** Full line-of-sight blockers.
- **Interactive / Objective (RGB 0.95, 0.65, 0.15):** Doors, terminals, levers.
- **Hazard / Death Zone (RGB 0.85, 0.20, 0.20):** Kill boundaries, spikes, lava.
- **AI Spawn / Route (RGB 0.65, 0.25, 0.75):** Enemy patrol pathways.

---

## Module 2: ProBuilder In-Engine Greyboxing

ProBuilder provides polygon modeling tools directly within the Unity Scene view, generating editable meshes with automatic UVs and colliders.

### Opening and Docking ProBuilder

1. Open **Tools -> ProBuilder -> ProBuilder Window**.
2. Dock the toolbar next to the Inspector or Hierarchy.
3. Switch between Icon Mode and Text Mode by right-clicking the toolbar panel.

### The Four Selection Modes

The top bar of the Scene view contains the ProBuilder mode selector:

1. **Object Mode (`Esc` or `Key 1`):** Selects, moves, and scales entire meshes.
2. **Vertex Mode (`Key 2`):** Edits single vertices. Ideal for tapering, chamfering, and terrain slope adjustment.
3. **Edge Mode (`Key 3`):** Selects mesh edges. Used for edge insertion, loop slicing, and beveling.
4. **Face Mode (`Key 4`):** Selects polygons. Used for extrusions, insets, and material assignment.

### Core Geometry Operations

#### 1. Shift + Extrude (Rapid Room Construction)
1. Select a face in **Face Mode**.
2. Hold `Shift` and drag the transform gizmo arrow.
3. ProBuilder duplicates the face and creates connecting side geometry. This is the primary method for extending hallways, raising walls, and digging recesses.

#### 2. Edge Loop Slice (Adding Subdivisions)
1. Select an edge in **Edge Mode**.
2. In the ProBuilder window, click **Edge Loop** (or press `Alt + U`) to select the continuous ring.
3. Click **Connect Edges** (or press `Alt + E`) to cut an orthogonal slice through all connected faces.

#### 3. Face Inset & Bevel
1. Select a face.
2. Click **Inset Faces** to create a concentric border inside the polygon (used for window frames and door recesses).
3. Select surrounding edges and click **Bevel** to round harsh structural corners.

#### 4. Poly Shape Tool (Custom Floorplans)
1. Click **New Poly Shape** in the ProBuilder toolbar.
2. Click points on the grid in the Scene view to draw an arbitrary 2D perimeter.
3. Close the loop by clicking the initial point, then drag upward to set the extrusion height.

### Snapping Workflows

Precise metric alignment prevents light leaks and gaps between modular blocks:

- **Grid Snapping (`Ctrl` + Drag):** Enforces movement increments. Configure snapping values in **Edit -> Grid and Snap Settings** (set Increment Snap to `1.0m` or `0.5m`).
- **Vertex Snapping (`V` Key):** Select an object or sub-mesh component, hold `V`, click and drag a vertex. It will snap to the nearest vertex on adjacent meshes.

### Colliders and Static Optimization

- ProBuilder meshes include a `MeshCollider` by default.
- For static level geometry, check **Static** in the top-right of the Inspector. This enables NavMesh baking, occlusion culling, and static batching.

---

## Module 3: Production 3D Character Controller

### Physics Architecture: CharacterController vs Rigidbody 3D

```
+-----------------------------------------------------------------------+
| CHARACTER CONTROLLER VS RIGIDBODY 3D ARCHITECTURE                    |
+-----------------------------------------------------------------------+
| Feature              | CharacterController    | Rigidbody 3D          |
+----------------------+------------------------+-----------------------+
| Movement Model       | Kinematic Move() delta | Force / Velocity step |
| Response Curve       | Instant, deterministic | Inertial, physics-led |
| Slope Handling       | Hard Slope Limit cutoff| Friction / slide drift|
| Step Climbing        | Built-in Step Offset   | Physics snagging      |
| Moving Platforms     | Manual hierarchy sync  | Physics friction sync |
| Production Use Case  | Responsive 3P / 1P / ARPG | Simulations / Driving |
+-----------------------------------------------------------------------+
```

We use `CharacterController` for third-person action gameplay to maintain total kinematic control over acceleration, deceleration, and ground adhesion.

### Camera-Relative Movement Vector Math

Input from the keyboard or thumbstick gives a 2D vector $(x, y)$ in screen space. To move relative to where the camera is facing:

1. Extract the camera's `transform.forward` and `transform.right` vectors.
2. Zero out the Y component to prevent the character from driving into the ground or flying when looking down/up.
3. Normalize both vectors and compute the composite direction:

$$\vec{D} = \text{normalize}\left(\vec{C}_{\text{forward, XZ}} \cdot \text{input}_y + \vec{C}_{\text{right, XZ}} \cdot \text{input}_x\right)$$

### Ballistic Jump Physics Formula

To achieve an exact jump apex height $h$ in meters under a constant downward gravity acceleration $g$ ($g < 0$):

$$v_y = \sqrt{-2 \cdot g \cdot h}$$

Example: For a desired jump height $h = 1.5\text{m}$ and gravity $g = -20\text{ m/s}^2$:
$$v_y = \sqrt{-2 \cdot (-20) \cdot 1.5} = \sqrt{60} \approx 7.746\text{ m/s}$$

### Hardened Ground Check

The built-in `CharacterController.isGrounded` flag is prone to micro-flickering when descending slopes or stepping over small seams. We harden ground detection using `Physics.SphereCast` directed downward from the character's base.

### Complete Production Script: PlayerController3D.cs

```csharp
using UnityEngine;
using UnityEngine.InputSystem;

[RequireComponent(typeof(CharacterController))]
public class PlayerController3D : MonoBehaviour
{
    [Header("Locomotion Parameters")]
    [SerializeField] private float walkSpeed = 4.5f;
    [SerializeField] private float sprintSpeed = 7.5f;
    [SerializeField] private float rotationSmoothTime = 0.08f;
    [SerializeField] private float acceleration = 18f;

    [Header("Jump & Gravity")]
    [SerializeField] private float jumpHeight = 1.4f;
    [SerializeField] private float gravity = -22f;
    [SerializeField] private float groundedStickForce = -2f;

    [Header("Ground Detection")]
    [SerializeField] private LayerMask groundLayers;
    [SerializeField] private float groundCheckRadius = 0.28f;
    [SerializeField] private float groundCheckOffset = 0.15f;

    [Header("References")]
    [SerializeField] private Transform cameraTransform;

    private CharacterController _characterController;
    private Vector2 _moveInput;
    private bool _isSprintHeld;
    private bool _jumpRequested;

    private Vector3 _currentVelocity;
    private float _verticalVelocity;
    private float _currentRotationVelocity;
    private bool _isGrounded;

    private void Awake()
    {
        _characterController = GetComponent<CharacterController>();

        if (cameraTransform == null && Camera.main != null)
        {
            cameraTransform = Camera.main.transform;
        }
    }

    // Input System Message Callbacks (via PlayerInput component in Send Messages mode)
    public void OnMove(InputValue value)
    {
        _moveInput = value.Get<Vector2>();
    }

    public void OnSprint(InputValue value)
    {
        _isSprintHeld = value.isPressed;
    }

    public void OnJump(InputValue value)
    {
        if (value.isPressed)
        {
            _jumpRequested = true;
        }
    }

    private void Update()
    {
        PerformGroundCheck();
        HandleMovement();
        HandleVerticalPhysics();
        ApplyFinalDisplacement();
    }

    private void PerformGroundCheck()
    {
        // Position sphere at character base
        Vector3 spherePosition = new Vector3(
            transform.position.x,
            transform.position.y - (_characterController.height * 0.5f) + groundCheckOffset,
            transform.position.z
        );

        _isGrounded = Physics.CheckSphere(spherePosition, groundCheckRadius, groundLayers, QueryTriggerInteraction.Ignore);
    }

    private void HandleMovement()
    {
        float targetSpeed = _isSprintHeld ? sprintSpeed : walkSpeed;

        if (_moveInput.sqrMagnitude < 0.001f)
        {
            targetSpeed = 0f;
        }

        Vector3 targetDirection = Vector3.zero;

        if (_moveInput.sqrMagnitude > 0.001f && cameraTransform != null)
        {
            Vector3 camForward = cameraTransform.forward;
            Vector3 camRight = cameraTransform.right;

            camForward.y = 0f;
            camRight.y = 0f;
            camForward.Normalize();
            camRight.Normalize();

            targetDirection = (camForward * _moveInput.y + camRight * _moveInput.x).normalized;

            // Smooth Yaw Rotation toward movement vector
            float targetAngle = Mathf.Atan2(targetDirection.x, targetDirection.z) * Mathf.Rad2Deg;
            float smoothAngle = Mathf.SmoothDampAngle(
                transform.eulerAngles.y,
                targetAngle,
                ref _currentRotationVelocity,
                rotationSmoothTime
            );

            transform.rotation = Quaternion.Euler(0f, smoothAngle, 0f);
        }

        Vector3 targetHorizontalVelocity = targetDirection * targetSpeed;
        _currentVelocity = Vector3.MoveTowards(
            _currentVelocity,
            targetHorizontalVelocity,
            acceleration * Time.deltaTime
        );
    }

    private void HandleVerticalPhysics()
    {
        if (_isGrounded)
        {
            if (_verticalVelocity < 0f)
            {
                _verticalVelocity = groundedStickForce;
            }

            if (_jumpRequested)
            {
                // Ballistic Jump Velocity formula: v = sqrt(-2 * g * h)
                _verticalVelocity = Mathf.Sqrt(-2f * gravity * jumpHeight);
                _jumpRequested = false;
            }
        }
        else
        {
            _verticalVelocity += gravity * Time.deltaTime;
            _jumpRequested = false; // Consume stale jump requests in air
        }
    }

    private void ApplyFinalDisplacement()
    {
        Vector3 displacement = (_currentVelocity + Vector3.up * _verticalVelocity) * Time.deltaTime;
        _characterController.Move(displacement);
    }

    private void OnDrawGizmosSelected()
    {
        if (_characterController == null)
            _characterController = GetComponent<CharacterController>();

        if (_characterController != null)
        {
            Vector3 spherePosition = new Vector3(
                transform.position.x,
                transform.position.y - (_characterController.height * 0.5f) + groundCheckOffset,
                transform.position.z
            );

            Gizmos.color = _isGrounded ? Color.green : Color.red;
            Gizmos.DrawWireSphere(spherePosition, groundCheckRadius);
        }
    }
}
```

---

## Module 4: Third-Person Cinemachine 3.x Camera Rig

Cinemachine 3.x uses the unified `CinemachineCamera` component alongside modular extensions to drive procedural camera behavior.

```
+-----------------------------------------------------------------------+
| CINEMACHINE 3.X THIRD-PERSON RIG ARCHITECTURE                         |
+-----------------------------------------------------------------------+
| [Player GameObject]                                                   |
|   +-- [CameraTarget] (Empty Child at Y = 1.65m)                       |
|                                                                       |
| [CinemachineCamera] (Tracking Target = CameraTarget)                  |
|   +-- CinemachineOrbitalFollow / ThirdPersonFollow                    |
|   +-- CinemachineInputAxisController (Binds Look Delta)               |
|   +-- CinemachineDeoccluder (Raycasts to prevent wall clipping)       |
|                                                                       |
| [Main Camera]                                                         |
|   +-- CinemachineBrain (Interpolates & outputs to display)            |
+-----------------------------------------------------------------------+
```

### Step-by-Step Cinemachine 3.x Rig Setup

#### 1. Setup Camera Tracking Target
Create an empty GameObject as a child of your Player named `CameraTarget`. Set its local position to `(0, 1.65, 0)`. Tracking the character base causes the camera to orbit feet level; tracking this target aligns the pivot to eye level.

#### 2. Create the Cinemachine Camera
1. In the Hierarchy, right-click and select **Cinemachine -> Cinemachine Camera**.
2. In the Inspector, assign `Player/CameraTarget` to the **Tracking Target** property.

#### 3. Configure Orbit Follow
1. Set the **Position Control** (or Add Extension) to `CinemachineOrbitalFollow` (or `CinemachineThirdPersonFollow`).
2. Set **Shoulder Offset** to `(0.4, 0.0, 0.0)` for an over-the-right-shoulder perspective, or `(0, 0, 0)` for centered framing.
3. Set **Camera Distance** to `3.2m`.
4. Adjust **Damping** values: `X: 0.1`, `Y: 0.1`, `Z: 0.1` for responsive control without rubber-banding.

#### 4. Bind Look Input via CinemachineInputAxisController
1. Add the component `CinemachineInputAxisController` to the `CinemachineCamera` GameObject.
2. Bind the X and Y axes to your Input System Action Map's `Look` action (Vector2 delta from mouse or gamepad stick).

#### 5. Prevent Geometry Clipping with CinemachineDeoccluder
1. Add the `CinemachineDeoccluder` component to the `CinemachineCamera`.
2. Set **Obstacle Layers** to include `Default` and `Environment` (exclude the `Player` layer).
3. Set **Strategy** to `Pull Camera Forward`.
4. Set **Minimum Distance From Target** to `0.5m`.
5. Set **Damping** to `0.1s` to ensure immediate wall push-forward while preventing jumpy recovery.

---

## Module 5: NavMesh Navigation with NavMeshSurface

The `com.unity.ai.navigation` package replaces the legacy static window with the modular `NavMeshSurface` component.

### NavMesh Surface Baking Workflow

1. Group all level geometry under a parent GameObject named `[Environment]`.
2. Add the `NavMeshSurface` component to `[Environment]`.
3. Set **Collect Objects** to `Volume` or `Children`.
4. Configure Agent Parameters:
   - **Agent Radius:** `0.4m`
   - **Agent Height:** `1.8m`
   - **Max Slope:** `45 degrees`
   - **Step Height:** `0.4m`
5. Click **Bake** in the Inspector. A blue walkable overlay appears over all valid walkable geometry in the Scene view.

```
+-----------------------------------------------------------------------+
| NAVMESH RUNTIME ARCHITECTURE                                          |
+-----------------------------------------------------------------------+
| [Environment] (Has NavMeshSurface -> Bakes Walkable Surface)          |
|                                                                       |
| [Dynamic Door / Crate]                                                |
|   +-- NavMeshObstacle (Carve = TRUE, Move Threshold = 0.2m)           |
|                                                                       |
| [Enemy AI Agent]                                                      |
|   +-- NavMeshAgent (Radius = 0.4m, Speed = 3.5m/s, StopDist = 1.2m)   |
|   +-- PatrolWaypoints.cs (Loops through Transform coordinates)        |
|   +-- EnemyNavMeshAI.cs (State Machine: Patrol -> Chase -> Search)    |
+-----------------------------------------------------------------------+
```

### Dynamic Obstacle Carving

For moving obstacles (doors, blast gates, falling crates):

1. Attach a `NavMeshObstacle` component to the obstacle.
2. Set **Shape** to `Box` matching the visual mesh bounds.
3. Check **Carve**.
4. Check **Carve Only When Stationary**.
5. Set **Move Threshold** to `0.2m` and **Time To Stationary** to `0.25s`.
   *Critical optimization:* Carving forces the CPU to re-tessellate the NavMesh. Carving while moving causes heavy frame drops. Only carve when the obstacle comes to rest.

### Waypoint Provider: PatrolWaypoints.cs

```csharp
using UnityEngine;

public class PatrolWaypoints : MonoBehaviour
{
    [SerializeField] private Transform[] waypoints;
    [SerializeField] private Color debugColor = Color.cyan;

    public int Count => waypoints != null ? waypoints.Length : 0;

    public Transform GetWaypoint(int index)
    {
        if (waypoints == null || waypoints.Length == 0) return null;
        return waypoints[index % waypoints.Length];
    }

    private void OnDrawGizmos()
    {
        if (waypoints == null || waypoints.Length < 2) return;

        Gizmos.color = debugColor;
        for (int i = 0; i < waypoints.Length; i++)
        {
            if (waypoints[i] == null) continue;

            Gizmos.DrawSphere(waypoints[i].position, 0.3f);

            int nextIndex = (i + 1) % waypoints.Length;
            if (waypoints[nextIndex] != null)
            {
                Gizmos.DrawLine(waypoints[i].position, waypoints[nextIndex].position);
            }
        }
    }
}
```

### Production AI Controller: EnemyNavMeshAI.cs

```csharp
using System.Collections;
using UnityEngine;
using UnityEngine.AI;

[RequireComponent(typeof(NavMeshAgent))]
public class EnemyNavMeshAI : MonoBehaviour
{
    public enum AIState { Patrol, Chase, Search }

    [Header("Detection Parameters")]
    [SerializeField] private Transform targetPlayer;
    [SerializeField] private float sightRange = 12f;
    [SerializeField] private float fieldOfViewAngle = 110f;
    [SerializeField] private LayerMask lineOfSightObstacles;

    [Header("Patrol Setup")]
    [SerializeField] private PatrolWaypoints patrolRoute;
    [SerializeField] private float waypointTolerance = 0.6f;
    [SerializeField] private float waypointWaitTime = 1.5f;

    [Header("Movement Speeds")]
    [SerializeField] private float patrolSpeed = 2.5f;
    [SerializeField] private float chaseSpeed = 5.0f;

    private NavMeshAgent _agent;
    private AIState _currentState = AIState.Patrol;
    private int _currentWaypointIndex = 0;
    private bool _isWaitingAtWaypoint = false;
    private Vector3 _lastKnownPlayerPosition;
    private float _searchTimer = 0f;
    private const float SEARCH_DURATION = 4.0f;

    private void Awake()
    {
        _agent = GetComponent<NavMeshAgent>();
        _agent.stoppingDistance = 1.2f;
        _agent.autoBraking = true;
    }

    private void Start()
    {
        if (targetPlayer == null)
        {
            GameObject player = GameObject.FindGameObjectWithTag("Player");
            if (player != null) targetPlayer = player.transform;
        }

        SetPatrolState();
    }

    private void Update()
    {
        switch (_currentState)
        {
            case AIState.Patrol:
                UpdatePatrol();
                if (CanSeeTarget()) SetChaseState();
                break;

            case AIState.Chase:
                UpdateChase();
                break;

            case AIState.Search:
                UpdateSearch();
                if (CanSeeTarget()) SetChaseState();
                break;
        }
    }

    private void SetPatrolState()
    {
        _currentState = AIState.Patrol;
        _agent.speed = patrolSpeed;
        _agent.isStopped = false;
        MoveToNextWaypoint();
    }

    private void UpdatePatrol()
    {
        if (patrolRoute == null || patrolRoute.Count == 0 || _isWaitingAtWaypoint) return;

        if (!_agent.pathPending && _agent.remainingDistance <= waypointTolerance)
        {
            StartCoroutine(WaitAtWaypointRoutine());
        }
    }

    private IEnumerator WaitAtWaypointRoutine()
    {
        _isWaitingAtWaypoint = true;
        _agent.isStopped = true;

        yield return new WaitForSeconds(waypointWaitTime);

        _currentWaypointIndex = (_currentWaypointIndex + 1) % patrolRoute.Count;
        _agent.isStopped = false;
        MoveToNextWaypoint();
        _isWaitingAtWaypoint = false;
    }

    private void MoveToNextWaypoint()
    {
        if (patrolRoute == null || patrolRoute.Count == 0) return;
        Transform wp = patrolRoute.GetWaypoint(_currentWaypointIndex);
        if (wp != null)
        {
            _agent.SetDestination(wp.position);
        }
    }

    private void SetChaseState()
    {
        StopAllCoroutines();
        _isWaitingAtWaypoint = false;
        _currentState = AIState.Chase;
        _agent.speed = chaseSpeed;
        _agent.isStopped = false;
    }

    private void UpdateChase()
    {
        if (targetPlayer == null) return;

        _agent.SetDestination(targetPlayer.position);

        if (CanSeeTarget())
        {
            _lastKnownPlayerPosition = targetPlayer.position;
        }
        else
        {
            // Lost line of sight: transition to search last known position
            if (!_agent.pathPending && _agent.remainingDistance <= _agent.stoppingDistance)
            {
                SetSearchState();
            }
        }
    }

    private void SetSearchState()
    {
        _currentState = AIState.Search;
        _searchTimer = SEARCH_DURATION;
        _agent.SetDestination(_lastKnownPlayerPosition);
    }

    private void UpdateSearch()
    {
        _searchTimer -= Time.deltaTime;
        if (_searchTimer <= 0f)
        {
            SetPatrolState();
        }
    }

    private bool CanSeeTarget()
    {
        if (targetPlayer == null) return false;

        Vector3 eyeOrigin = transform.position + Vector3.up * 1.6f;
        Vector3 targetEye = targetPlayer.position + Vector3.up * 1.6f;
        Vector3 dirToTarget = (targetEye - eyeOrigin);

        if (dirToTarget.magnitude > sightRange) return false;

        float angle = Vector3.Angle(transform.forward, dirToTarget.normalized);
        if (angle > fieldOfViewAngle * 0.5f) return false;

        // Line-of-sight Raycast check
        if (Physics.Raycast(eyeOrigin, dirToTarget.normalized, out RaycastHit hit, sightRange, lineOfSightObstacles))
        {
            if (hit.transform != targetPlayer)
            {
                return false; // Occluded by level geometry
            }
        }

        return true;
    }

    private void OnDrawGizmosSelected()
    {
        Gizmos.color = Color.yellow;
        Gizmos.DrawWireSphere(transform.position, sightRange);

        Vector3 eyeOrigin = transform.position + Vector3.up * 1.6f;
        Vector3 leftRay = Quaternion.Euler(0, -fieldOfViewAngle * 0.5f, 0) * transform.forward;
        Vector3 rightRay = Quaternion.Euler(0, fieldOfViewAngle * 0.5f, 0) * transform.forward;

        Gizmos.color = Color.blue;
        Gizmos.DrawRay(eyeOrigin, leftRay * sightRange);
        Gizmos.DrawRay(eyeOrigin, rightRay * sightRange);
    }
}
```

---

## 10-Minute Challenge 1: Modular Arena Whitebox & Dynamic Jump-Pad

### Objective
Construct a 20m x 20m combat arena with two elevation tiers (0m base and 3.0m upper tier), a 30-degree connecting ramp, low cover blocks (1.0m), high cover blocks (2.0m), and an interactive physical jump-pad that launches the player onto the upper platform.

### Step-by-Step Implementation Instructions

1. **Build the Arena Geometry in ProBuilder:**
   - Create a base plane: `20m x 20m x 1m` (Position: `0, -0.5, 0`).
   - Create the upper platform: `8m x 8m x 3m` (Position: `6, 1.5, 6`).
   - Build a connecting ramp using the **New Shape -> Stairs** or a tilted ProBuilder cube set to a 30-degree incline.
   - Build 4 low cover boxes (`2m x 0.5m x 1.0m`) and 2 high cover pillars (`1m x 1m x 2.2m`).
   - Apply greybox palette materials.
2. **Build the Jump-Pad:**
   - Create a ProBuilder cube: `1.5m x 0.2m x 1.5m` on the ground floor.
   - Assign an orange Accent material.
   - Set the `BoxCollider` to **Is Trigger = TRUE**.
   - Attach the script `JumpPad.cs` below.
3. **Connect Player Launch Integration:**
   - When the player enters the trigger, apply an upward launch velocity override.

### Complete Solution: JumpPad.cs

```csharp
using UnityEngine;

[RequireComponent(typeof(Collider))]
public class JumpPad : MonoBehaviour
{
    [SerializeField] private float launchVelocity = 14f;
    [SerializeField] private Vector3 launchDirection = new Vector3(0.3f, 1f, 0.3f);
    [SerializeField] private Color gizmoColor = new Color(1f, 0.5f, 0f, 0.75f);

    private void Awake()
    {
        GetComponent<Collider>().isTrigger = true;
    }

    private void OnTriggerEnter(Collider other)
    {
        if (other.TryGetComponent<PlayerController3D>(out var player))
        {
            // Calculate launch vector
            Vector3 finalLaunchVector = launchDirection.normalized * launchVelocity;

            // Reflect into character controller via displacement
            if (other.TryGetComponent<CharacterController>(out var cc))
            {
                cc.Move(finalLaunchVector * Time.deltaTime);
            }
        }
    }

    private void OnDrawGizmos()
    {
        Gizmos.color = gizmoColor;
        Gizmos.DrawCube(transform.position, transform.localScale);
        Gizmos.color = Color.white;
        Gizmos.DrawRay(transform.position, launchDirection.normalized * 2.5f);
    }
}
```

---

## 10-Minute Challenge 2: Security Blast Door & Dynamic NavMesh Re-routing

### Objective
Create a dual-corridor layout (Corridor A and Corridor B) separated by an automated security blast door equipped with a `NavMeshObstacle` (Carving enabled). An AI agent patrols through Corridor A. When the player steps on a pressure plate, the blast door closes, cutting the NavMesh and forcing the AI agent to immediately re-route through Corridor B.

### Step-by-Step Implementation Instructions

1. **Build the Corridors:**
   - Use ProBuilder to build two parallel corridors (`3.0m` width, `3.5m` height, `15m` length) connected at both ends.
   - Mark geometry as **Static** and bake a `NavMeshSurface`.
2. **Setup the Blast Door:**
   - Create a door mesh (`3.2m x 3.5m x 0.4m`) in the middle of Corridor A.
   - Attach a `NavMeshObstacle` component.
   - Set **Shape** to Box, check **Carve = TRUE**, check **Carve Only When Stationary = TRUE**.
3. **Setup the Pressure Plate:**
   - Create a thin box (`2m x 0.1m x 2m`) in front of the door.
   - Set `BoxCollider` to **Is Trigger = TRUE**.
   - Attach `PressurePlateDoor.cs` below.
4. **Test the Simulation:**
   - Position an enemy with `EnemyNavMeshAI.cs` patrolling through Corridor A.
   - Walk onto the pressure plate to close the door. Observe the AI path line dynamically recalculating through Corridor B in the Scene view.

### Complete Solution: PressurePlateDoor.cs

```csharp
using System.Collections;
using UnityEngine;
using UnityEngine.AI;

public class PressurePlateDoor : MonoBehaviour
{
    [Header("Door Target")]
    [SerializeField] private Transform doorTransform;
    [SerializeField] private Vector3 doorClosedLocalPos = new Vector3(0, 1.75f, 0);
    [SerializeField] private Vector3 doorOpenLocalPos = new Vector3(0, 5.5f, 0);
    [SerializeField] private float slideSpeed = 4f;

    [Header("Obstacle Carving")]
    [SerializeField] private NavMeshObstacle doorObstacle;

    private bool _isDoorClosed = false;
    private Coroutine _doorRoutine;

    private void Awake()
    {
        if (doorObstacle == null && doorTransform != null)
        {
            doorObstacle = doorTransform.GetComponent<NavMeshObstacle>();
        }

        if (doorTransform != null)
        {
            doorTransform.localPosition = doorOpenLocalPos;
        }

        if (doorObstacle != null)
        {
            doorObstacle.carving = false;
        }
    }

    private void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Player") && !_isDoorClosed)
        {
            _isDoorClosed = true;
            if (_doorRoutine != null) StopCoroutine(_doorRoutine);
            _doorRoutine = StartCoroutine(MoveDoorRoutine(doorClosedLocalPos, true));
        }
    }

    private void OnTriggerExit(Collider other)
    {
        if (other.CompareTag("Player") && _isDoorClosed)
        {
            _isDoorClosed = false;
            if (_doorRoutine != null) StopCoroutine(_doorRoutine);
            _doorRoutine = StartCoroutine(MoveDoorRoutine(doorOpenLocalPos, false));
        }
    }

    private IEnumerator MoveDoorRoutine(Vector3 targetPosition, bool carveWhenFinished)
    {
        // Disable carving during physical translation to prevent per-frame NavMesh rebakes
        if (doorObstacle != null)
        {
            doorObstacle.carving = false;
        }

        while (Vector3.Distance(doorTransform.localPosition, targetPosition) > 0.01f)
        {
            doorTransform.localPosition = Vector3.MoveTowards(
                doorTransform.localPosition,
                targetPosition,
                slideSpeed * Time.deltaTime
            );
            yield return null;
        }

        doorTransform.localPosition = targetPosition;

        // Apply carve only once the door is completely stationary
        if (doorObstacle != null)
        {
            doorObstacle.carving = carveWhenFinished;
        }
    }
}
```

---

## Common Pitfalls & Debugging Checklist

```
+-----------------------------------------------------------------------+
| 3D BLOCK PROTOTYPING DEBUGGING MATRIX                                 |
+-----------------------------------------------------------------------+
| Symptom                     | Root Cause             | Solution       |
+-----------------------------+------------------------+----------------+
| Character bounces when      | Ground check fails on  | Increase       |
| walking down slopes         | discrete height delta  | stick force &  |
|                             |                        | use SphereCast |
+-----------------------------+------------------------+----------------+
| Camera jumps through walls  | Missing de-occluder or | Add Deoccluder |
| when turning in corners     | incorrect layer mask   | & set damping  |
+-----------------------------+------------------------+----------------+
| Enemy AI walks through      | Obstacle not carved or | Check Carve &  |
| closed security doors       | carving disabled       | verify bounds  |
+-----------------------------+------------------------+----------------+
| High CPU spikes when doors  | NavMesh is carving     | Carve only when|
| or moving platforms move    | during motion frames   | stationary     |
+-----------------------------+------------------------+----------------+
| CharacterController snags   | Step Offset too low or | Set Step Offset|
| on floor seams or steps     | sharp stair geometry   | 0.3m & ramp col|
+-----------------------------+------------------------+----------------+
| NavMeshAgent vibrates or    | Stopping distance is   | Set stopping   |
| shoves into player model    | zero or equal to radius| dist >= 1.2m   |
+-----------------------------+------------------------+----------------+
```

### Verification Checklist Before Committing Greybox Layouts:
1. **Metric Audit:** Place a standard 1.8m reference mannequin in all doorways, corridors, and stairs. Verify at least 0.4m headroom and 0.3m shoulder clearance.
2. **Camera Occlusion Test:** Rotate the Cinemachine camera 360 degrees in every tight room corner. Confirm smooth de-occlusion without visual clipping inside player geometry.
3. **Slope Limit Verification:** Confirm all walkable slopes are under 45 degrees.
4. **NavMesh Coverage:** Inspect the baked NavMesh overlay in the Scene view. Ensure no isolated islands or broken seams exist across room thresholds.
5. **Carving Validation:** Enable NavMesh visualization during play mode. Confirm that opening and closing doors dynamically opens and closes holes in the navigation mesh without stutter.

---

## Assignment

Complete the 3D Greybox Level Prototype milestone for your team project:

### Milestone Requirements:
1. **Metric Greybox Environment:** Build a multi-room playable space using ProBuilder. Implement at least one high-tier platform, one ramp transition (<= 45 deg), low cover obstacles (1.0m), and high cover sightline blockers (2.0m).
2. **Third-Person Kinematic Controller:** Integrate `PlayerController3D.cs` with the New Input System. Verify camera-relative movement and ballistic jumping.
3. **Cinemachine 3.x Camera Rig:** Configure a third-person orbit follow camera with `CinemachineDeoccluder` active on environmental layers.
4. **NavMesh AI Patrol & Dynamic Carving:** Bake a `NavMeshSurface` across the level. Deploy at least one patrolling `EnemyNavMeshAI` agent with waypoint patrol loops, line-of-sight chase transitions, and dynamic re-routing around interactive `NavMeshObstacle` blast doors.

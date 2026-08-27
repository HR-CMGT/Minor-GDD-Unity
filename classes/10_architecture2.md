# Lesson 1.10: Game Architecture 2 – Finite State Machines & Refactoring

In this lesson, you learn how to structure complex game flow and enemy AI using the **Finite State Machine (FSM)** design pattern, and how to refactor monolithic 'God Classes' into clean, single-responsibility modules.

---

## 🎯 Learning Objectives
1. Master the **State Pattern** and implement a generic C# **Finite State Machine (FSM)**.
2. Manage Game Flow (Menu, Playing, Paused, GameOver) without brittle boolean flags.
3. Architect Enemy AI (Patrol, Chase, Attack) in decoupled state classes.
4. Refactor large 'God Classes' adhering to the **Single Responsibility Principle (SRP)**.

---

## 🤖 1. Why Finite State Machines?

Beginner code frequently devolves into boolean soup:
```csharp
// ❌ BAD PRACTICE: Boolean Soup
if (isGrounded && !isAttacking && !isDead && isRunning && canJump)
{
    // Hard to reason about, fragile to debug, impossible to extend!
}
```

With an **FSM**, an entity is in **exactly one state** at any given moment. State transitions are explicit, isolated, and safe.

---

## 💻 2. Generic C# State Machine Framework

This framework is lightweight, requires no `MonoBehaviour` allocation overhead, and is reusable for players, AI, and game managers alike:

```csharp
// 1. State Interface
public interface IState
{
    void Enter();       // Called once when entering the state
    void Update();      // Called every frame while state is active
    void FixedUpdate(); // Called for physics routines
    void Exit();        // Called once when exiting the state
}

// 2. State Machine Controller
public class StateMachine
{
    public IState CurrentState { get; private set; }

    public void Initialize(IState startingState)
    {
        CurrentState = startingState;
        CurrentState.Enter();
    }

    public void ChangeState(IState newState)
    {
        if (newState == null || newState == CurrentState) return;

        CurrentState?.Exit();
        CurrentState = newState;
        CurrentState.Enter();
    }

    public void Update() => CurrentState?.Update();
    public void FixedUpdate() => CurrentState?.FixedUpdate();
}
```

---

## ⚔️ 3. Production Example: Enemy AI State Machine

Complete implementation for an enemy with **Patrol** and **Chase** states:

```csharp
using UnityEngine;

public class EnemyController : MonoBehaviour
{
    [Header("Settings")]
    [SerializeField] private float patrolSpeed = 3f;
    [SerializeField] private float chaseSpeed = 6f;
    [SerializeField] private float detectionRadius = 5f;
    [SerializeField] private Transform[] waypoints;

    public Transform PlayerTransform { get; private set; }
    public StateMachine StateMachine { get; private set; }

    // State Instances
    public EnemyPatrolState PatrolState { get; private set; }
    public EnemyChaseState ChaseState { get; private set; }

    private void Awake()
    {
        PlayerTransform = GameObject.FindWithTag("Player")?.transform;
        StateMachine = new StateMachine();

        // Initialize states
        PatrolState = new EnemyPatrolState(this, waypoints, patrolSpeed);
        ChaseState = new EnemyChaseState(this, chaseSpeed, detectionRadius);
    }

    private void Start()
    {
        StateMachine.Initialize(PatrolState);
    }

    private void Update() => StateMachine.Update();

    private void OnDrawGizmosSelected()
    {
        Gizmos.color = Color.red;
        Gizmos.DrawWireSphere(transform.position, detectionRadius);
    }
}
```

### The Patrol State:
```csharp
using UnityEngine;

public class EnemyPatrolState : IState
{
    private readonly EnemyController enemy;
    private readonly Transform[] waypoints;
    private readonly float speed;
    private int currentWaypointIndex = 0;

    public EnemyPatrolState(EnemyController enemy, Transform[] waypoints, float speed)
    {
        this.enemy = enemy;
        this.waypoints = waypoints;
        this.speed = speed;
    }

    public void Enter() => Debug.Log("[Enemy] Entering Patrol State");

    public void Update()
    {
        if (waypoints == null || waypoints.Length == 0) return;

        // 1. Move towards waypoint
        Transform targetWaypoint = waypoints[currentWaypointIndex];
        enemy.transform.position = Vector3.MoveTowards(enemy.transform.position, targetWaypoint.position, speed * Time.deltaTime);

        if (Vector3.Distance(enemy.transform.position, targetWaypoint.position) < 0.2f)
        {
            currentWaypointIndex = (currentWaypointIndex + 1) % waypoints.Length;
        }

        // 2. Check for player proximity -> Transition to Chase!
        if (enemy.PlayerTransform != null && Vector3.Distance(enemy.transform.position, enemy.PlayerTransform.position) < 5f)
        {
            enemy.StateMachine.ChangeState(enemy.ChaseState);
        }
    }

    public void FixedUpdate() { }
    public void Exit() => Debug.Log("[Enemy] Exiting Patrol State");
}
```

### The Chase State:
```csharp
using UnityEngine;

public class EnemyChaseState : IState
{
    private readonly EnemyController enemy;
    private readonly float speed;
    private readonly float loseDistance;

    public EnemyChaseState(EnemyController enemy, float speed, float loseDistance)
    {
        this.enemy = enemy;
        this.speed = speed;
        this.loseDistance = loseDistance;
    }

    public void Enter() => Debug.Log("[Enemy] TARGET SIGHTED! Entering Chase State");

    public void Update()
    {
        if (enemy.PlayerTransform == null) return;

        // Chase player
        enemy.transform.position = Vector3.MoveTowards(enemy.transform.position, enemy.PlayerTransform.position, speed * Time.deltaTime);

        // Player escaped distance -> Return to Patrol
        if (Vector3.Distance(enemy.transform.position, enemy.PlayerTransform.position) > loseDistance * 1.5f)
        {
            enemy.StateMachine.ChangeState(enemy.PatrolState);
        }
    }

    public void FixedUpdate() { }
    public void Exit() => Debug.Log("[Enemy] Target lost.");
}
```

---

## 🧹 4. Refactoring God Classes: Checklist

If a manager exceeds 500 lines, decompose it immediately according to core responsibilities:

```
[MONOLITHIC GOD CLASS (Bad)]
  └── GameManager.cs (Handles: Scores, Audio, UI, Spawners, Scene Transitions, Input)

[DECOUPLED ARCHITECTURE (Good)]
  ├── GameStateManager.cs   -> Manages Game Flow: Play, Pause, GameOver (FSM)
  ├── ScoreService.cs       -> Manages score values and fires events
  ├── AudioService.cs       -> Listens to events and triggers audio clips
  └── SceneController.cs    -> Handles loading and scene transitions
```

---

## 🛠️ Hands-on Assignment (30 minutes)

1. Create `IState.cs` and `StateMachine.cs` in your project.
2. Build a `GameStateManager` controlling 2 states: `GameplayState` (`Time.timeScale = 1`) and `PauseState` (`Time.timeScale = 0`).
3. Toggle states with the **Escape** key via the state machine.
4. Add a "PAUSED" UI text overlay that automatically activates on `PauseState.Enter()` and deactivates on `PauseState.Exit()`.
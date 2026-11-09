# Lesson 1.10: Game Architecture 2: State Machines, Commands & Safe Refactoring

[Presentation](https://hr-cmgt.github.io/Minor-GDD-Unity/presentation_architecture2) -
[Resources](#resources) -
[What you will learn](#what-you-will-learn-and-why) -
[Working sessions](#working-sessions) -
[Takeaways](#takeaways) -
[Troubleshooting](#troubleshooting)

## Presentation
This week's [presentation can be found here](https://hr-cmgt.github.io/Minor-GDD-Unity/presentation_architecture2)

This is a theory class for programmers (about 4 per team). There is no starter package and no assignment, but there are four short timed working sessions. Every team has a different 3D project in Unity 6000.x (URP), so every example and every session is generic: pick one class in your own project (Unity 6000.x, URP) and try the block on it.

## Resources
- Unity e-book: *Level up your code with game programming patterns*
- Book: *Game Programming Patterns* by Robert Nystrom (State, Command, Service Locator chapters)
- Unity Manual: Assembly definitions
- Unity Test Framework (Test Runner, NUnit, EditMode tests)
- Our own [tips, tricks and best practices](00_unity.md) for working with Unity 6
- Previous lessons: [Architecture 1](04_architecture.md) (prefab API, event channels, PersistentSingleton) and [Problem Solving](08_problemsolving.md) (4 primitives, DevWatch, debugger, read every diff)

---

## What You Will Learn and Why
Architecture 1 was about who talks to whom. Architecture 2 is about how one thing is built inside, and how to change it without breaking it.

**In plain words:** Arch 1 wired the rooms together. Arch 2 builds the furniture inside one room. We follow two examples all lesson: the NavMesh enemy (Idle, Patrol, Chase, Combat) and the grappling `PlayerController3D`. Every block fixes one pain in one of them. Learn the symptom first, then the tool.

| Block | What | Why you need it |
| :--- | :--- | :--- |
| 0. Recap | The simple NavMesh enemy (`SimpleNPC`), the player controller with a grappling hook, bool soup, Arch 1 channel API | See the problem first: flags pile up when the enemy must patrol, attack and flee. |
| 1. State machines, level up | `IState` + `StateMachine`, guards, logging, hierarchy (how the brain calls the machine), the whole NPC put together, behavior tree and utility AI as comparison | If you already have a state machine, you learn what to do when it grows into spaghetti. |
| 2. Interfaces and composition | `IDamageable`, `IInteractable`, a GameObject as a box of components, what a `MonoBehaviour` is, a thin root script, the enemy put together | A bullet can hurt a player, a crate or a boss without knowing which. |
| 3. Command pattern | Commands, input buffer, undo, replay, the player input script put together | Input code leaves the player class, and a jump pressed just before landing still counts. |
| 4. Services instead of singletons | Problems of `PersistentSingleton<T>`, a small service locator, dependency injection named only, the bootstrap and a caller put together | Dependencies become visible and a test can swap in a fake. |
| 5. Refactoring toolkit and safety net | Extract method, extract class, strangler, one NUnit test, assembly definitions, leaks, working with an AI agent | You can improve your worst class without losing a working game. |

The closing slide is a which tool when table. Look for your own needs while you read.

---

## Lesson Timing (120 minutes)

The teacher talks fast, so the talk is short and the time goes into the working sessions.

| Part | Talk (min) | Working session (min) |
| :--- | :--- | :--- |
| Welcome, recap and bool soup | 5 | none |
| 1. State machines (incl. States Inside States 2 and Putting It Together: The Whole NPC 2) | 13 | Session 1: 15 |
| 2. Interfaces and composition (Interfaces 4, GameObject box 2, MonoBehaviour 2, Parts 3, Putting It Together: The Enemy 2) | 13 | Session 2: 10 |
| 3. Commands (Commands 5, buffer 5, Putting It Together: The Player 2) | 12 | Session 3: 15 |
| 4. Services (Singletons 3, locator 4, Putting It Together: The Services 2) | 9 | Session 4: 12 |
| 5. Refactoring and safety net | 10 | none (take-home instead) |
| Wrap-up table | 5 | none |
| **Total** | **67** | **52** |

67 talk + 52 sessions = 119 minutes, about 1 minute buffer, so it fits in 120 minutes. The Animator was removed from this class: animation (including state machines in the Animator) is the next class. The deck has 30 slides: the 4 session slides each carry a countdown timer (`cTimer1` to `cTimer4`) and a cheat sheet, and the notes of every slide carry its minutes. Each part ends with a Putting It Together slide that shows the parent `MonoBehaviour` script that calls all the separate classes.

--- | :--- | :--- |
| Welcome, recap and bool soup | 5 | none |
| 1. State machines | 12 | Session 1: 15 |
| 2. Interfaces and composition | 8 | Session 2: 10 |
| 3. Commands (buffer, undo, replay) | 10 | Session 3: 15 |
| 4. Services | 7 | Session 4: 12 |
| 5. Refactoring and safety net | 10 | none (take-home instead) |
| Wrap-up table | 5 | none |
| **Total** | **57** | **52** |

57 talk + 52 sessions = 109 minutes. About 10 minutes buffer brings the class to 119, so it fits in 120 minutes. The deck has 25 slides: the 4 session slides each carry a countdown timer (`cTimer1` to `cTimer4`), and the notes of every slide carry its minutes.

---

## Working Sessions

Each session has a visible timer, one generic task in three tiers, a cheat sheet with the code you just saw (same names and calls as the slides), and a one-line check. Pick ONE class or place in YOUR project. There is no session after Part 5: the last slide has a take-home line instead.

### Session 1 (15 min): Give a Class States
Pick one class in your project with 3 or more flags.
- **Starter:** list the states hidden in the flags.
- **Standard:** move two states into `IState` classes.
- **Stretch:** add `TrySetState` and log each switch.

**Cheat sheet** (same names as the slides; the full `NpcBrain` is in Part 1, Putting It Together):

```csharp
public interface IState { void Enter(); void Tick(); void Exit(); }
public interface IGuardedState : IState { bool Allow(IState next); }   // may I switch?

public class StateMachine
{
    public IState Current { get; private set; }
    public bool LogTransitions;   // the owner copies its Inspector bool here

    public bool TrySetState(IState next)
    {
        if (next == null || next == Current) return false;
        if (Current is IGuardedState rules && !rules.Allow(next)) return false;
        if (LogTransitions)   // only on a switch, never in Tick
            Debug.Log($"{Current?.GetType().Name} -> {next.GetType().Name}");
        Current?.Exit();
        Current = next;
        Current.Enter();
        return true;
    }

    public void Tick() => Current?.Tick();
}

public class PatrolState : IGuardedState
{
    private readonly NpcBrain _npc;
    public PatrolState(NpcBrain npc) => _npc = npc;
    public void Enter() { }
    public void Tick() { if (_npc.CanSeePlayer) _npc.Machine.TrySetState(_npc.Chase); }
    public void Exit() { }
    public bool Allow(IState next) => next is ChaseState;
}

public class NpcBrain : MonoBehaviour
{
    [SerializeField] private bool _logTransitions = true;
    private StateMachine _machine;

    public StateMachine Machine => _machine;
    public PatrolState Patrol { get; private set; }
    public ChaseState Chase { get; private set; }
    public bool CanSeePlayer { get; private set; }

    private void Awake()
    {
        _machine = new StateMachine { LogTransitions = _logTransitions };
        Patrol = new PatrolState(this);
        Chase = new ChaseState(this);
    }

    private void Start() => _machine.TrySetState(Patrol);   // first state
    private void Update() => _machine.Tick();
}

// Hierarchy: the parent holds the shared rule, the child calls base.Tick() first.
public abstract class GroundedState : IState
{
    public virtual void Enter() { }
    public virtual void Exit() { }
    public virtual void Tick() { /* shared rule, written once */ }
}

public class WalkState : GroundedState
{
    public override void Tick() { base.Tick(); /* own walk code */ }
}
// Full NpcBrain: slide Putting It Together (state machines).
```
**Done when:** `Current` shows one state, and every switch is logged.

### Session 2 (10 min): Add One Contract
Pick one spot in your project with a type check or tag switch.
- **Starter:** name the one method all targets share.
- **Standard:** put `IDamageable` on two classes and call it.
- **Stretch:** share one `Health` component between two prefabs.

**Cheat sheet** (the full scripts are in Part 2, Putting It Together):

```csharp
public interface IDamageable { void TakeDamage(int amount); }   // the contract

public class Health : MonoBehaviour, IDamageable   // any class can sign it
{
    [SerializeField] private int _max = 100;
    private int _current;

    private void Awake() => _current = _max;
    public void TakeDamage(int amount) => _current = Mathf.Max(0, _current - amount);
}

public class Bullet : MonoBehaviour
{
    [SerializeField] private int _damage = 10;

    private void OnTriggerEnter(Collider other)
    {
        // No type check. Collider on a child? Use GetComponentInParent<IDamageable>().
        if (other.TryGetComponent<IDamageable>(out var target))
            target.TakeDamage(_damage);
    }
}
// Small components: Health, Mover, Attack on one GameObject,
// cached with GetComponent in Awake. Full scripts: Putting It Together (parts).
```
**Done when:** the caller has no type check and no tag switch.

### Session 3 (15 min): Make One Action a Command
Pick one action in your project, such as jump, shoot or interact.
- **Starter:** wrap it in a command with `Execute`.
- **Standard:** add a 0.15 s buffer for it.
- **Stretch:** add `Undo` and a history stack.

**Cheat sheet** (the full `PlayerInputReader` is in Part 3, Putting It Together):

```csharp
public interface ICommand { void Execute(); }
public interface IUndoableCommand : ICommand { void Undo(); }

public class JumpCommand : ICommand
{
    private readonly PlayerMotor _motor;
    public JumpCommand(PlayerMotor motor) => _motor = motor;
    public void Execute() => _motor.Jump();
}

public class CommandHistory   // minimal undo stack
{
    private readonly Stack<IUndoableCommand> _done = new();
    public void Run(IUndoableCommand command) { command.Execute(); _done.Push(command); }
    public void Undo() { if (_done.Count > 0) _done.Pop().Undo(); }
}

public class CommandBuffer   // keeps the newest press for a short window
{
    private readonly float _window;
    private ICommand _pending;
    private float _pressedAt;   // the stored press time

    public CommandBuffer(float window) => _window = window;
    public void Push(ICommand command) { _pending = command; _pressedAt = Time.time; }

    public bool TryExecute(bool canRun)
    {
        if (_pending == null) return false;
        if (Time.time - _pressedAt > _window) { _pending = null; return false; }
        if (!canRun) return false;
        _pending.Execute();
        _pending = null;
        return true;
    }
}


// In PlayerInputReader.Update:
//   if (Keyboard.current.spaceKey.wasPressedThisFrame) _buffer.Push(_jump);
//   _buffer.TryExecute(_motor.IsGrounded);
// Full script: Putting It Together (commands).
```
**Done when:** a press 0.1 s early still fires, and Stretch undoes a step.

### Session 4 (12 min): Replace One Instance Call
Pick one `Instance` call in your project, such as audio or save.
- **Starter:** list every class that uses it.
- **Standard:** make an interface and call `Services.Register`.
- **Stretch:** switch one caller to `Services.Get` and test it with a fake.

**Cheat sheet** (the full scripts are in Part 4, Putting It Together):

```csharp
using System;
using System.Collections.Generic;
using UnityEngine;

public static class Services
{
    private static readonly Dictionary<Type, object> s_services = new();

    public static void Register<T>(T service) where T : class => s_services[typeof(T)] = service;

    public static T Get<T>() where T : class
    {
        if (s_services.TryGetValue(typeof(T), out object service)) return (T)service;
        throw new InvalidOperationException($"Service {typeof(T).Name} is not registered.");
    }
}

public interface IAudioService { void Play(string clipName); }

[DefaultExecutionOrder(-100)]
public class CoreBootstrap : MonoBehaviour   // in _PersistentCore
{
    [SerializeField] private AudioService _audio;   // MonoBehaviour : IAudioService
    private void Awake() => Services.Register<IAudioService>(_audio);   // once
}

// Before: AudioManager.Instance.Play("spawn");
// After, in a spawner:
//   private IAudioService _audio;
//   private void Start() => _audio = Services.Get<IAudioService>();   // keep in a field
//   _audio.Play("spawn");
// PersistentSingleton<T> stays fine for true infrastructure.
// Full scripts: Putting It Together (services).
```
**Done when:** that caller asks `Services.Get` and has no `Instance` call.

### What the teacher looks for while walking around
- Session 1: states written as `MonoBehaviour` (they should be plain classes), `Current` set from outside the machine, new state objects created in `Update`.
- Session 2: an interface with many methods (keep it to one to three), `TryGetComponent` on a child collider while the script lives on the parent, inheritance used just to reuse one method.
- Session 3: commands created in `Update` every frame, input code still calling the motor directly, a buffer window above 0.2 s, a buffer that is not cleared after it fires.
- Session 4: `Services.Get` in `Update`, registering after the caller already asked, a concrete class registered instead of the interface.

Take-home (no session after Part 5): **pick one class in your project, do one small named step, commit.**

---

## Block 0: Recap and Bool Soup

**In plain words:** a bool is a yes or no flag. Too many flags in one `Update` allow situations that make no sense, like chasing and fleeing at once. Picture a traffic light with three separate switches: nothing stops red and green together. The NavMesh enemy and the grappling `PlayerController3D` both start this way.
This is the NavMesh enemy most of you have in your game. Lesson 1.7 only showed a simple version in its last slide, we did not build it in class. It chases the player every frame and has no states:

```csharp
using UnityEngine;
using UnityEngine.AI;

[RequireComponent(typeof(NavMeshAgent))]
public class SimpleNPC : MonoBehaviour
{
    [SerializeField] private Transform _target;
    private NavMeshAgent _agent;

    private void Awake() => _agent = GetComponent<NavMeshAgent>();

    private void Update()
    {
        if (_target != null) _agent.SetDestination(_target.position);
    }
}
```

Now it must also patrol, attack and flee. The usual answer is more bools: `_isPatrolling`, `_isAttacking`, `_isFleeing`. Three bools allow 8 combinations, five allow 32, and most of them are illegal. Nothing stops them. That is bool soup.

The player controller suffers the same way. Take the camera relative `PlayerController3D` (lesson 1.7, `CharacterController`) and add the grappling hook from lesson 1.8:

```csharp
using UnityEngine;

[RequireComponent(typeof(CharacterController))]
public class PlayerController3D : MonoBehaviour
{
    private CharacterController _controller;
    private bool _isGrounded, _isJumping, _isGrappling;

    private void Update()
    {
        _isGrounded = _controller.isGrounded;

        if (_isGrappling) PullToAnchor();
        else if (_isGrounded && !_isJumping) MoveCameraRelative();
        else if (_isJumping) MoveInAir();

        // Grapple released on the ground, jump flag still set?
        if (_isGrappling && _isGrounded) _isJumping = false;
    }

    // Bodies left out: only the flags matter here.
    private void PullToAnchor() { }
    private void MoveCameraRelative() { }
    private void MoveInAir() { }
}
```

Is a grapple released on the ground still jumping? Nobody decided.

Quick recap of what you already have:
- Architecture 1: prefab as an API, event channels (`RegisterListener` in `OnEnable`, `UnregisterListener` in `OnDisable`, `RaiseEvent` to broadcast), singletons only for infrastructure, additive scenes with `_PersistentCore`.
- Problem solving: 4 primitives, `DevWatch`, conditional breakpoints, the call stack, read every diff.

```csharp
using System;
using UnityEngine;

public class VoidEventChannelSO : ScriptableObject
{
    private Action _onEventRaised;

    public void RaiseEvent() => _onEventRaised?.Invoke();
    public void RegisterListener(Action listener) => _onEventRaised += listener;
    public void UnregisterListener(Action listener) => _onEventRaised -= listener;
}
```

**Don't / Do (short, as on the slide): bool flags or one state:**

**Don't:** Three flags can all be true.

```csharp
private bool _isPatrolling, _isChasing, _isAttacking;

private void Update()
{
    if (_isPatrolling) Patrol();
    if (_isChasing) Chase();
    if (_isAttacking) Attack();   // all three true?
}
```

**Do:** One field, one state at a time.

```csharp
private enum NpcState { Patrol, Chase, Combat }
private NpcState _state = NpcState.Patrol;

private void Update()
{
    switch (_state)
    {
        case NpcState.Patrol: Patrol(); break;
        case NpcState.Chase: Chase(); break;
        case NpcState.Combat: Attack(); break;
    }
}
```

**Don't / Do: bool flags or one state:**

**Don't:** Three flags can all be true.

```csharp
private bool _isPatrolling, _isChasing, _isAttacking;

private void Update()
{
    if (_isPatrolling) Patrol();
    if (_isChasing) Chase();
    if (_isAttacking) Attack();
    if (_isAttacking && _isChasing) _isPatrolling = false;
}
```

**Do:** One field, one state at a time.

```csharp
private enum NpcState { Idle, Patrol, Chase, Combat }
private NpcState _state = NpcState.Patrol;

private void Update()
{
    switch (_state)
    {
        case NpcState.Patrol: Patrol(); break;
        case NpcState.Chase: Chase(); break;
        case NpcState.Combat: Attack(); break;
    }
}
```


---

## Block 1: State Machines, Level Up

**In plain words:** a state is one mode the object is in, such as Idle, Patrol, Chase or Combat. A state machine keeps exactly one active mode, like a board game piece on one square. Each mode is a small class with `Enter`, `Tick` and `Exit`. A transition is the switch from one mode to another, and a guard is a rule that blocks switches you never allowed. Log every switch in one place so you can see why the enemy did something odd.
A finite state machine (FSM) means the object is in exactly one mode at a time. Lesson 1.2 only showed `GoombaState`, an enum with a `ChangeState` method, in an expert accordion. That version grows into one giant method. The next level is one class per state.

### Step 1: IState and StateMachine (core)

*In plain words:* `IState` is a promise that a class has three methods. `StateMachine` stores the active state and is the only place that switches it. Problem it fixes: one huge `switch` in `Update`.

The I in `IState` means interface: a contract. C# interface names start with a capital I (`IState`, `IDamageable`, `ICommand`, `IAudioService`). Arch 1 names like `IntEventChannelSO` start with Int for integer, not for interface.

**Not an event channel: events announce news, states decide what to do.** An event channel (Arch 1) is an asset any script can raise or listen to. It says something happened, and the sender does not care who reacts. A state machine lives inside one object. It decides what that object does about the news and which changes are allowed. They work together: an event like `OnPlayerSpotted` is the input, and the state machine moves from Patrol to Chase. Use an event to tell many parts, a state machine to control one object's behavior. A coroutine is a different, smaller thing: a one-off timed sequence (do A, wait, do B). A state can still start one inside itself. Coroutines were taught in lessons 1.2, 1.4 and 1.5.
```csharp
public interface IState
{
    void Enter();
    void Tick();
    void Exit();
}

public class StateMachine
{
    public IState Current { get; private set; }

    public void SetState(IState next)
    {
        if (next == null || next == Current) return;
        Current?.Exit();
        Current = next;
        Current.Enter();
    }

    public void Tick() => Current?.Tick();
}
```
- `Enter` and `Exit` hold one-time work. `Tick` holds per-frame work.
- Only the machine changes `Current`.

### Step 2: States for the NPC

*In plain words:* `NpcBrain` is the Unity component that owns the agent. The state classes are plain C# classes that ask the brain for what they need. Create them once in `Awake` so `Update` makes no garbage.
`NpcBrain` owns the agent and the machine. The states are created once in `Awake`, so `Update` allocates nothing.

```csharp
using UnityEngine;
using UnityEngine.AI;

[RequireComponent(typeof(NavMeshAgent))]
public class NpcBrain : MonoBehaviour
{
    [SerializeField] private Transform[] _waypoints;
    [SerializeField] private Transform _player;
    [SerializeField] private float _sightRange = 12f;

    public NavMeshAgent Agent { get; private set; }
    public StateMachine Machine { get; private set; }
    public PatrolState Patrol { get; private set; }
    public ChaseState Chase { get; private set; }
    public Transform[] Waypoints => _waypoints;
    public Transform Player => _player;

    public bool CanSeePlayer =>
        (_player.position - transform.position).sqrMagnitude <= _sightRange * _sightRange;

    private void Awake()
    {
        Agent = GetComponent<NavMeshAgent>();
        Machine = new StateMachine();
        Patrol = new PatrolState(this);
        Chase = new ChaseState(this);
    }

    private void Start() => Machine.SetState(Patrol);

    private void Update() => Machine.Tick();
}
```

```csharp
public class PatrolState : IState
{
    private readonly NpcBrain _npc;
    private int _index;

    public PatrolState(NpcBrain npc) => _npc = npc;

    public void Enter() => GoToWaypoint();

    public void Tick()
    {
        if (_npc.CanSeePlayer) { _npc.Machine.SetState(_npc.Chase); return; }
        if (_npc.Agent.pathPending) return;
        if (_npc.Agent.remainingDistance > _npc.Agent.stoppingDistance) return;
        _index = (_index + 1) % _npc.Waypoints.Length;
        GoToWaypoint();
    }

    public void Exit() => _npc.Agent.ResetPath();

    private void GoToWaypoint() =>
        _npc.Agent.SetDestination(_npc.Waypoints[_index].position);
}

public class ChaseState : IState
{
    private readonly NpcBrain _npc;

    public ChaseState(NpcBrain npc) => _npc = npc;

    public void Enter() { }

    public void Tick()
    {
        if (!_npc.CanSeePlayer) { _npc.Machine.SetState(_npc.Patrol); return; }
        _npc.Agent.SetDestination(_npc.Player.position);
    }

    public void Exit() => _npc.Agent.ResetPath();
}
```

### Step 3: Rules for transitions (guards)

*In plain words:* a subway map of allowed arrows. `TrySetState` refuses an arrow that is not on the map. Problem it fixes: the same rule copied into five states.
Bool soup allowed illegal combinations. Guards make illegal arrows impossible. List the legal arrows once, in one place. Final `StateMachine` with guards, logging and `Stop` for sub machines (step 4 and 5 below explain the extra lines):

```csharp
using System.Collections.Generic;
using UnityEngine;

public class StateMachine
{
    private readonly HashSet<(IState from, IState to)> _allowed = new();

    public bool LogTransitions;   // the owner script copies its Inspector bool here
    public string Name = "Machine";
    public Object Owner;          // click a log line to find this object

    public IState Current { get; private set; }

    public void Allow(IState from, IState to) => _allowed.Add((from, to));

    public bool TrySetState(IState next)
    {
        if (next == null || next == Current) return false;
        if (Current != null && !_allowed.Contains((Current, next)))
        {
            if (LogTransitions)
            Debug.LogWarning($"{Name}: blocked {Current.GetType().Name} -> {next.GetType().Name}", Owner);
            return false;
        }
        SetState(next);
        return true;
    }

    public void SetState(IState next)
    {
        if (next == null || next == Current) return;

        if (LogTransitions)
        {
            string from = Current?.GetType().Name ?? "none";
            Debug.Log($"{Name}: {from} -> {next.GetType().Name}", Owner);
            DevWatch.Set(Name + " state", next.GetType().Name);
        }

        Current?.Exit();
        Current = next;
        Current.Enter();
    }

    public void Tick() => Current?.Tick();

    public void Stop()
    {
        Current?.Exit();
        Current = null;
    }
}
```
To use the guards: in `NpcBrain.Awake` create the machine with `new StateMachine("Npc", this)` and call `Machine.Allow(Patrol, Chase)` and `Machine.Allow(Chase, Patrol)`. In the states, call `TrySetState` instead of `SetState`. For an "any state to Dead" rule, call `SetState` directly. `DevWatch` is the static class from lesson 1.8. If your project does not have it yet, delete that one line.

**Link to Architecture 1.** An event channel can send a request, and the machine accepts or rejects it. The listener never changes state directly:

```csharp
[SerializeField] private VoidEventChannelSO _onPlayerSpotted;

private void OnEnable() => _onPlayerSpotted.RegisterListener(HandleSpotted);
private void OnDisable() => _onPlayerSpotted.UnregisterListener(HandleSpotted);

private void HandleSpotted() => Machine.TrySetState(Chase);
```

**Don't / Do (short, as on the slide): transitions:**

**Don't:** States poke each other's variables.

```csharp
// In PatrolState.Tick
if (_npc.CanSeePlayer)
    _npc.IsChasing = true;

// In DeadState.Tick: nobody checks this
_npc.IsChasing = true;
```

**Do:** One guarded method owns every switch.

```csharp
private readonly HashSet<(IState from, IState to)> _allowed = new();

public bool TrySetState(IState next)
{
    if (next == null || next == Current) return false;
    if (Current != null && !_allowed.Contains((Current, next))) return false;
    SetState(next);
    return true;
}
```

**Don't / Do: transitions:**

**Don't:** States poke each other's variables.

```csharp
// In PatrolState.Tick
if (_npc.CanSeePlayer)
{
    _npc.IsPatrolling = false;
    _npc.IsChasing = true;
}

// In DeadState.Tick: nobody checks this
_npc.IsChasing = true;
```

**Do:** One guarded method owns every switch.

```csharp
// Once, in NpcBrain.Awake
Machine.Allow(Patrol, Chase);
Machine.Allow(Chase, Patrol);

// In PatrolState.Tick
if (_npc.CanSeePlayer)
    _npc.Machine.TrySetState(_npc.Chase);

// Dead has no Allow line, so it stays Dead.
```


### Step 4: Log every transition

*In plain words:* all switches go through `SetState`, so one log line, one `DevWatch` value and one breakpoint see everything. Like a black box recorder.
All state changes go through one method, so one log line, one `DevWatch` key and one breakpoint see everything.
- Put a breakpoint on `Current?.Exit()` in `SetState`. Make it conditional, for example `next.GetType().Name == "ChaseState"`.
- Read the call stack to see who asked for the change.
- `StateMachine` is not a MonoBehaviour, so the owner script holds the Inspector bool and passes it in:

```csharp
// In NpcBrain: the Inspector bool, passed into the machine.
[SerializeField] private bool _logTransitions = true;

private void Awake()
{
    Machine = new StateMachine { LogTransitions = _logTransitions, Name = name, Owner = this };
    // ...rest of Awake as before
}
```

- The `LogTransitions` bool is a tick box in the Inspector of the owner script. Switch logging off there without editing code, and keep it off in the final build so no log strings are built. The log only runs when a switch happens, never in `Tick`. Passing the owner object makes the Console line clickable.

**Don't / Do (short, as on the slide): logging switches:**

**Don't:** Assignments everywhere, nothing logged.

```csharp
// PatrolState
_npc.State = StateId.Chase;
// ChaseState
_npc.State = StateId.Patrol;
// HitReaction
_npc.State = StateId.Stunned;
// Who changed it? No log, no one place.
```

**Do:** One door in, one log line.

```csharp
public bool LogTransitions;   // the owner script copies its Inspector bool here
public string Name = "Machine";
public Object Owner;          // click a log line to find this object

public void SetState(IState next)
{
    if (next == null || next == Current) return;
    if (LogTransitions)
        Debug.Log($"{Name}: {Current?.GetType().Name} -> {next.GetType().Name}", Owner);
    Current?.Exit();
    Current = next;
    Current.Enter();
}
```

**Don't / Do: logging switches:**

**Don't:** Assignments everywhere, nothing logged.

```csharp
// PatrolState
_npc.State = StateId.Chase;
// ChaseState
_npc.State = StateId.Patrol;
// HitReaction
_npc.State = StateId.Stunned;
// Who changed it? No log, no one place.
```

**Do:** One door in, one log line.

```csharp
public bool LogTransitions;   // the owner script copies its Inspector bool here
public string Name = "Machine";
public Object Owner;          // click a log line to find this object

public void SetState(IState next)
{
    if (next == null || next == Current) return;
    if (LogTransitions)
    {
        Debug.Log($"{Name}: {Current?.GetType().Name} -> {next.GetType().Name}", Owner);
        DevWatch.Set(Name + " state", next.GetType().Name);
    }
    Current?.Exit();
    Current = next;
    Current.Enter();
}
```


### Step 5: States inside states (hierarchical)

*In plain words:* Idle and Walk both allow jumping. Write the jump rule once, in Grounded, the parent state. The children only add their own part. Like a shared file in a parent folder. The brain never calls a child by name: it only calls the machine, and the machine calls whichever state is `Current`.

**Who calls whom, every frame:**
1. `NpcBrain.Update` calls `_machine.Tick()`.
2. The machine calls `Current.Tick()`, here `WalkState.Tick`.
3. `WalkState.Tick` calls `base.Tick()` first: `GroundedState` runs the shared jump rule.
4. Then `WalkState` runs its own walk code.

**Start:** the brain calls `_machine.TrySetState(Idle)` once in `Start`. **Change:** a state asks `Npc.Machine.TrySetState(Npc.Walk)`.

The brain (short):

```csharp
public class NpcBrain : MonoBehaviour
{
    [SerializeField] private PlayerMotor _motor;
    [SerializeField] private Transform _player;
    [SerializeField] private float _sightRange = 12f;

    private StateMachine _machine;

    public StateMachine Machine => _machine;
    public PlayerMotor Motor => _motor;
    public IdleState Idle { get; private set; }
    public WalkState Walk { get; private set; }
    public bool CanSeePlayer =>
        (_player.position - transform.position).sqrMagnitude <= _sightRange * _sightRange;

    private void Awake()
    {
        _machine = new StateMachine();
        Idle = new IdleState(this);   // states are made once
        Walk = new WalkState(this);
        _machine.Allow(Idle, Walk);
        _machine.Allow(Walk, Idle);
    }

    private void Start() => _machine.TrySetState(Idle);   // the brain starts the first state

    private void Update() => _machine.Tick();             // the brain calls the machine
}
```

The parent and the two children:

```csharp
using UnityEngine;
using UnityEngine.InputSystem;

public abstract class GroundedState : IState
{
    protected readonly NpcBrain Npc;
    protected GroundedState(NpcBrain npc) => Npc = npc;

    public virtual void Enter() { }
    public virtual void Exit() { }
    public virtual void Tick()   // the jump rule, written once
    {
        if (Keyboard.current.spaceKey.wasPressedThisFrame) Npc.Motor.Jump();
    }
}

public class IdleState : GroundedState
{
    public IdleState(NpcBrain npc) : base(npc) { }

    public override void Tick()
    {
        base.Tick();   // 1. the parent's jump rule
        if (Npc.CanSeePlayer) Npc.Machine.TrySetState(Npc.Walk);   // 2. its own part
    }
}

public class WalkState : GroundedState
{
    public WalkState(NpcBrain npc) : base(npc) { }

    public override void Tick()
    {
        base.Tick();   // 1. the parent's jump rule
        Npc.Motor.Move(Vector3.forward);   // 2. its own walk code
        if (!Npc.CanSeePlayer) Npc.Machine.TrySetState(Npc.Idle);
    }
}
```

**One frame, step by step.** Awake builds the machine and both states, and lists the arrows with `Allow`. Start runs `TrySetState(Idle)`: no `Current` yet, so `Idle.Enter` runs. Every frame `NpcBrain.Update` calls `_machine.Tick()`. The machine calls `IdleState.Tick`, which calls `base.Tick()` (the jump rule) and then its own part: if `CanSeePlayer`, ask `TrySetState(Walk)`. Allow says yes, so `Idle.Exit` and `Walk.Enter` run. Next frame `WalkState.Tick` runs: `base.Tick()` first, then `Motor.Move`.

**Two ways to nest states.**

| | Way 1: inheritance | Way 2: a child machine |
| :--- | :--- | :--- |
| Idea | A parent class holds the shared code. Children call `base.Tick()`. | A big state owns a small `StateMachine` and forwards `Tick` to it. |
| Brain sees | Idle and Walk, as normal states. | Combat, as one normal state. |
| Use it when | Several states share a rule (jump, gravity). | One state has its own sub-modes (Approach, Attack). |

Way 2: a big state can own a small machine of its own. Combat is one state that owns a machine with Approach and Attack. A rule such as Stunned is written once on Combat. The parent calls the child machine `Tick`, the same way the brain calls its machine.

```csharp
public class CombatState : IState
{
    private readonly StateMachine _sub;
    private readonly IState _approach;
    private readonly IState _attack;

    public CombatState(NpcBrain npc)
    {
        _sub = new StateMachine();
        _approach = new ApproachState(npc);
        _attack = new AttackState(npc);
        _sub.Allow(_approach, _attack);
        _sub.Allow(_attack, _approach);
    }

    public void Enter() => _sub.SetState(_approach);
    public void Tick() => _sub.Tick();
    public void Exit() => _sub.Stop();
}
```
`ApproachState` and `AttackState` are two more `IState` classes, written like `ChaseState`.

**Common mistake:** forgetting `base.Tick()` in a child. The child overrides `Tick`, writes only its own code, and the shared rule silently stops working in that one state. Make `base.Tick()` the first line of every child `Tick`. Also: forgetting to stop a child machine when its parent exits.

### Step 6: Putting it together: the whole NPC

*In plain words:* one script, `NpcBrain`, is attached to the GameObject. It creates the plain classes and calls them. Everything else is a plain C# class.

```text
Assets/Scripts/Npc/
  NpcBrain.cs       MonoBehaviour: attach this one
  IState.cs         plain C# class
  StateMachine.cs   plain C# class
  PatrolState.cs    plain C# class
  ChaseState.cs     plain C# class
```

```text
Unity -> NpcBrain.Update -> StateMachine.Tick -> Current.Tick -> NpcBrain / Agent
Event channel -> NpcBrain.HandleSpotted -> machine.TrySetState
```

```csharp
using UnityEngine;
using UnityEngine.AI;

[RequireComponent(typeof(NavMeshAgent))]
public class NpcBrain : MonoBehaviour
{
    [SerializeField] private Transform[] _waypoints;
    [SerializeField] private Transform _player;
    [SerializeField] private float _sightRange = 12f;
    [SerializeField] private bool _logTransitions = true;
    [SerializeField] private VoidEventChannelSO _onPlayerSpotted;   // Arch 1 asset, optional

    private StateMachine _machine;

    // The states only use these: the brain is their one door to Unity.
    public NavMeshAgent Agent { get; private set; }
    public StateMachine Machine => _machine;
    public PatrolState Patrol { get; private set; }
    public ChaseState Chase { get; private set; }
    public Transform[] Waypoints => _waypoints;
    public Transform Player => _player;
    public bool CanSeePlayer =>
        (_player.position - transform.position).sqrMagnitude <= _sightRange * _sightRange;

    private void Awake()
    {
        Agent = GetComponent<NavMeshAgent>();
        _machine = new StateMachine { LogTransitions = _logTransitions, Name = name, Owner = this };
        Patrol = new PatrolState(this);   // the brain goes into each state's constructor
        Chase = new ChaseState(this);
        _machine.Allow(Patrol, Chase);
        _machine.Allow(Chase, Patrol);
    }

    private void OnEnable()
    {
        if (_onPlayerSpotted != null) _onPlayerSpotted.RegisterListener(HandleSpotted);
    }

    private void OnDisable()
    {
        if (_onPlayerSpotted != null) _onPlayerSpotted.UnregisterListener(HandleSpotted);
    }

    private void Start() => _machine.TrySetState(Patrol);   // first state

    private void Update() => _machine.Tick();               // the only per-frame call

    private void HandleSpotted() => _machine.TrySetState(Chase);   // the channel asks, the machine decides
}
```

This is the `NpcBrain` from Step 2 plus the parts from the next steps: the guard list (`Allow`), the log bool and the Arch 1 channel. Each state gets the brain in its constructor, so it reaches `Agent`, `Waypoints`, `Player`, `CanSeePlayer` and `Machine`. Subscribe to the channel in `OnEnable`, unsubscribe in `OnDisable` with the same method. **Common mistake:** attaching a state class to the GameObject (a plain class cannot be attached), or giving every state its own `Update`.

### Step 7: When an FSM stops fitting (comparison only)

*In plain words:* a behavior tree is a checklist read from the top every frame. Utility AI gives each action a score and picks the highest. Stay with an FSM until the arrows hurt.
Signs: more than about 8 states, arrows everywhere, the same transition pasted into many states.
- **Behavior tree:** a tree of tasks checked from the top every tick. Good for ordered priorities and fallbacks (flee if health is low, else attack if the target is near, else patrol).
- **Utility AI:** score every action, pick the best. Good when many wants compete smoothly, such as hunger versus danger.

We build neither today. Stay with a clean FSM until the arrows hurt. Animator state machines (boxes and arrows for animation clips) are next class.

---

## Block 2: Interfaces and Composition

**In plain words:** an interface is a short list of methods a class promises to have, like a wall socket that any plug fits. A bullet that asks for `IDamageable` can hurt a player, a crate or a boss without a type check. Composition means building an object from small components (Health, Mover, DropLoot) instead of a long class family tree. Has-a beats is-a.

**Not the same as an event channel:** an interface is a direct call to one known target. An event is a broadcast, and the sender does not know who hears it. Use an interface to hit one thing and get a reaction, an event when many parts react. They fit together: `Health` implements `IDamageable` and also raises an event channel so the UI can react. Events were taught in lessons 1.2, 1.3 and 1.4, event channel assets in 1.4.
An interface is a contract: a list of methods that someone promises to have. It says what you can do, not what you are.

```csharp
public interface IDamageable
{
    void TakeDamage(int amount);
}

public class Bullet : MonoBehaviour
{
    [SerializeField] private int _damage = 10;

    private void OnTriggerEnter(Collider other)
    {
        if (other.TryGetComponent(out IDamageable target))
            target.TakeDamage(_damage);
        Destroy(gameObject);
    }
}
```
Player, Crate and Boss implement `IDamageable`. The bullet never learns their types. `IInteractable` works the same way for doors and levers. Keep a contract to one job and one to three methods.

### A GameObject is a box of components

*In plain words:* a GameObject is an empty box. Each component you put in the box gives it one job.

```text
Hierarchy              Inspector: Enemy
  SampleScene            Transform   Position 0, 0, 0   Scale 1, 1, 1
    Main Camera          Health      (script)  Max 100
    Ground               Mover       (script)  Speed 3   Flies [ ]
    Enemy  <- selected   Attack      (script)  Damage 10
                         [ Add Component ]
```

- A script is a file in `Assets/Scripts`.
- The file name must match the class name: `Health.cs` holds `class Health`.
- Attach it: drag the file onto the GameObject, or press Add Component.
- One GameObject holds many scripts. Each does one job.

**Problem:** one `Enemy.cs` with health, movement, attack, loot and sound grows to hundreds of lines, and a crate that only needs health cannot reuse any of it. **Common mistake:** a file name that differs from the class name (`Health.cs` holding `class Hp`): Unity cannot attach it. A script that is not on a GameObject does nothing.

### What is a MonoBehaviour?

*In plain words:* a `MonoBehaviour` is the Unity base class that lets your script sit on a GameObject. Unity wrote it, so it comes from Unity and not from you.

```text
UnityEngine.Object   name, Destroy, Instantiate
  -> Component       transform, gameObject, GetComponent
    -> Behaviour     the enabled tick box
      -> MonoBehaviour   Awake, Start, Update, StartCoroutine
        -> Health (your script)   your fields and your methods
```

Unity looks for methods named `Awake`, `Start` and `Update` on your class and calls them. They are names Unity knows, not methods you must override.

| | On a GameObject? | What it is |
| :--- | :--- | :--- |
| MonoBehaviour | Yes | Unity's base class. You inherit it. |
| Plain C# class | No | A normal class, made with `new`: `StateMachine`, `PatrolState`. |
| Interface | No | A contract any class can sign: `IDamageable`. |

```csharp
// A plain C# class: no base class, cannot be attached.
public class PatrolState : IState
{
    public void Enter() { }
    public void Tick() { }
    public void Exit() { }
}

// A MonoBehaviour: Unity's base class, attach it to a GameObject.
public class Health : MonoBehaviour, IDamageable   // one base class, any number of interfaces
{
    public void TakeDamage(int amount) { }
}
```

A class has one base class, so only one `MonoBehaviour`, and it can sign many interfaces. **Common mistake:** `new Health()` for a `MonoBehaviour` (Unity warns and the object is on no GameObject), or making every class a `MonoBehaviour` by habit. A state or a command needs no `Update`.

### Parts that work together

*In plain words:* make the root script thin: it owns the parts and only coordinates them. `[RequireComponent]` adds the parts, and `GetComponent` in `Awake` keeps them in fields. In our enemy the root is `NpcBrain`, the script from the state machine part.

```csharp
[RequireComponent(typeof(Health), typeof(Mover), typeof(Attack))]
public class NpcBrain : MonoBehaviour   // thin root: owns the parts, coordinates them
{
    private Health _health;
    private Mover _mover;
    private Attack _attack;

    private void Awake()
    {
        _health = GetComponent<Health>();   // once, kept in a field
        _mover = GetComponent<Mover>();
        _attack = GetComponent<Attack>();
    }
}
```

- Use `TryGetComponent(out _attack)` for an optional part: it returns true or false and logs no error.
- `Health : MonoBehaviour, IDamageable` links back to the Interfaces step: a bullet finds it through the contract.
- `Mover` with a bool `_flies` is okay because it is config, not state. A bool that changes at run time, like `_isChasing`, belongs in a state.
- Has-a beats is-a. Share behaviour by adding a component, share a type by implementing an interface.

**Common mistake:** a fat root that does the work itself and becomes the `Enemy` class again. The root decides who does what, the parts do it.

**Don't / Do (short, as on the slide): class tree or components:**

**Don't:** Every new mix needs a new subclass.

```csharp
public class Enemy : MonoBehaviour { public int Health = 100; }

public class FlyingEnemy : Enemy { public void Fly() { } }

public class ArmoredFlyingEnemy : FlyingEnemy { public int Armor; }
```

**Do:** Mix parts on one object.

```csharp
[RequireComponent(typeof(Health), typeof(Mover), typeof(Attack))]
public class NpcBrain : MonoBehaviour   // thin root: owns the parts, coordinates them
{
    private Health _health;
    private Mover _mover;
    private Attack _attack;

    private void Awake()
    {
        _health = GetComponent<Health>();   // once, kept in a field
        _mover = GetComponent<Mover>();
        _attack = GetComponent<Attack>();
    }
}
```

**Don't / Do: class tree or components:**

**Don't:** Every new mix needs a new subclass.

```csharp
public class Enemy : MonoBehaviour
{
    public int Health = 100;
    public void Move() { }
}

public class FlyingEnemy : Enemy { public void Fly() { } }

public class ArmoredFlyingEnemy : FlyingEnemy { public int Armor; }
```

**Do:** Mix parts on one object.

```csharp
public class Health : MonoBehaviour
{
    [SerializeField] private int _max = 100;
}

public class Mover : MonoBehaviour
{
    [SerializeField] private float _speed = 3f;
    [SerializeField] private bool _flies;
}
// Attack: same idea. Armored flyer = Health 200 + Mover (flies) + Attack.
```



### Putting it together: the enemy

*In plain words:* the root script `NpcBrain` calls the parts. A bullet reaches `Health` through the contract. `Health` tells the world with a channel.

```text
Enemy GameObject
  NpcBrain  (script)  Player, Attack Range 2
  Health    (script)  Max 100, On Died: OnEnemyDied
  Mover     (script)  Speed 3, Flies [ ]
  Attack    (script)  Damage 10
```

```text
Unity -> NpcBrain.Update -> Mover.MoveTo / Attack.Fire
Bullet.OnTriggerEnter -> GetComponentInParent<IDamageable> -> Health.TakeDamage -> OnDied channel
```

```csharp
using UnityEngine;

[RequireComponent(typeof(Health), typeof(Mover), typeof(Attack))]
public class NpcBrain : MonoBehaviour   // thin root: owns the parts, only coordinates
{
    [SerializeField] private Transform _player;
    [SerializeField] private float _attackRange = 2f;

    private Health _health;
    private Mover _mover;
    private Attack _attack;

    private void Awake()
    {
        _health = GetComponent<Health>();   // once, kept in fields
        _mover = GetComponent<Mover>();
        _attack = GetComponent<Attack>();
    }

    private void Update()
    {
        if (_health.IsDead || _player == null) return;

        float distance = Vector3.Distance(transform.position, _player.position);
        if (distance > _attackRange) _mover.MoveTo(_player.position);
        else _attack.Fire(_player);
    }
}
```

```csharp
using UnityEngine;

public class Health : MonoBehaviour, IDamageable
{
    [SerializeField] private int _max = 100;
    [SerializeField] private VoidEventChannelSO _onDied;   // Arch 1 channel, optional
    private int _current;

    public bool IsDead => _current <= 0;

    private void Awake() => _current = _max;

    public void TakeDamage(int amount)
    {
        if (IsDead) return;
        _current = Mathf.Max(0, _current - amount);
        if (IsDead && _onDied != null) _onDied.RaiseEvent();   // news for the UI and loot
    }
}
```

```csharp
using UnityEngine;

public class Mover : MonoBehaviour
{
    [SerializeField] private float _speed = 3f;
    [SerializeField] private bool _flies;   // config, not state: it never changes at run time

    public void MoveTo(Vector3 target)
    {
        if (!_flies) target.y = transform.position.y;
        transform.position = Vector3.MoveTowards(transform.position, target, _speed * Time.deltaTime);
    }
}

public class Attack : MonoBehaviour
{
    [SerializeField] private int _damage = 10;
    [SerializeField] private float _cooldown = 1f;
    private float _nextTime;

    public void Fire(Transform target)
    {
        if (Time.time < _nextTime) return;
        _nextTime = Time.time + _cooldown;
        if (target.TryGetComponent<IDamageable>(out var damageable))
            damageable.TakeDamage(_damage);
    }
}
```

```csharp
using UnityEngine;

public class Bullet : MonoBehaviour
{
    [SerializeField] private int _damage = 10;

    private void OnTriggerEnter(Collider other)
    {
        // The collider may sit on a child, so look upwards too.
        IDamageable target = other.GetComponentInParent<IDamageable>();
        if (target != null) target.TakeDamage(_damage);
        Destroy(gameObject);
    }
}
```

`RequireComponent` makes sure the parts exist. Update only chooses: far away, `MoveTo`; close, `Fire`. `GetComponentInParent` also looks upwards, because the collider may sit on a child while `Health` sits on the parent. `Health` raises the channel once, because `IsDead` stops a second call. **Common mistake:** `GetComponent` in `Update` every frame, or parts that find each other with `FindObjectOfType`.

---

## Block 3: Command Pattern

**In plain words:** a command is a small object that holds one action, like a restaurant order slip. Input code makes the slip, the player runs it. Because it is an object you can delay it (input buffer), keep it on a stack (undo) or store it with a time (replay). A buffer saves a jump pressed 0.1 s before landing.

**Not the same as an event channel (Arch 1):** an event says something happened, and anyone listening reacts. A command says do this, and it is an object you can store, queue, undo and replay. Use an event channel to notify many parts. Use a command when you need to queue, undo or replay an action.
A command is an action as a small object. Input code only creates commands. The player only runs them. Keyboard, AI and replay share one path.

```csharp
public interface ICommand
{
    void Execute();
}

public class JumpCommand : ICommand
{
    private readonly PlayerMotor _motor;

    public JumpCommand(PlayerMotor motor) => _motor = motor;

    public void Execute() => _motor.Jump();
}
```
Allocate on input, never per frame. Stateless commands like `JumpCommand` are created once and reused. Commands with data, such as undo steps, are allocated per press, which is fine at human speed.

**Don't / Do (short, as on the slide): input and commands:**

**Don't:** Input is welded to the motor.

```csharp
private void Update()
{
    if (Keyboard.current.spaceKey.wasPressedThisFrame)
        _motor.Jump();
    if (Keyboard.current.fKey.wasPressedThisFrame)
        _motor.Dash();
}
```

**Do:** Input makes commands, others run them.

```csharp
public interface ICommand { void Execute(); }

public class JumpCommand : ICommand
{
    private readonly PlayerMotor _motor;
    public JumpCommand(PlayerMotor motor) => _motor = motor;
    public void Execute() => _motor.Jump();
}
```

**Don't / Do: input and commands:**

**Don't:** Input is welded to the motor.

```csharp
private void Update()
{
    if (Keyboard.current.spaceKey.wasPressedThisFrame)
        _motor.Jump();
    if (Keyboard.current.fKey.wasPressedThisFrame)
        _motor.Dash();
}
```

**Do:** Input makes commands, the loop runs them.

```csharp
private readonly Queue<ICommand> _queue = new();

private void Update()
{
    if (Keyboard.current.spaceKey.wasPressedThisFrame)
        _queue.Enqueue(new JumpCommand(_motor));

    while (_queue.Count > 0)
        _queue.Dequeue().Execute();
}
```


### Input buffering

*In plain words:* the game remembers a press for 0.15 s and runs it when the player can. Without it the controls feel sticky.

**Not the same as a coroutine timer:** a coroutine that waits for a jump press is hard to cancel and hard to inspect. A stored timestamp is one float you can read, print and reset. Use a timestamp for input windows.
If the player presses jump 0.1 seconds before landing and the press is lost, the game feels broken. Keep the newest command for a short window and run it when the player can.

```csharp
using UnityEngine;

public class CommandBuffer
{
    private readonly float _window;
    private ICommand _pending;
    private float _pressedAt;

    public CommandBuffer(float window) => _window = window;

    public void Push(ICommand command)
    {
        _pending = command;
        _pressedAt = Time.time;
    }

    public bool TryExecute(bool canRun)
    {
        if (_pending == null) return false;
        if (Time.time - _pressedAt > _window) { _pending = null; return false; }
        if (!canRun) return false;
        _pending.Execute();
        _pending = null;
        return true;
    }
}
```
Use a window between 0.1 and 0.2 seconds. A huge window fires old actions the player forgot about.

A minimal motor and the input reader that builds the commands:

```csharp
using UnityEngine;

[RequireComponent(typeof(CharacterController))]
public class PlayerMotor : MonoBehaviour
{
    [SerializeField] private float _jumpHeight = 1.2f;
    private CharacterController _controller;
    private float _verticalSpeed;

    public bool IsGrounded => _controller.isGrounded;

    private void Awake() => _controller = GetComponent<CharacterController>();

    public void Jump() => _verticalSpeed = Mathf.Sqrt(2f * _jumpHeight * -Physics.gravity.y);
    public void Move(Vector3 direction) => _controller.Move(direction * Time.deltaTime);

    private void Update()
    {
        if (_controller.isGrounded && _verticalSpeed < 0f) _verticalSpeed = -1f;
        _verticalSpeed += Physics.gravity.y * Time.deltaTime;
        _controller.Move(Vector3.up * (_verticalSpeed * Time.deltaTime));
    }
}
```

```csharp
using UnityEngine;
using UnityEngine.InputSystem;

public class PlayerInputReader : MonoBehaviour
{
    [SerializeField] private PlayerMotor _motor;
    [SerializeField] private float _bufferWindow = 0.15f;

    private CommandBuffer _buffer;
    private ICommand _jump;
    private readonly CommandHistory _history = new();

    private void Awake()
    {
        _buffer = new CommandBuffer(_bufferWindow);
        _jump = new JumpCommand(_motor);   // made once, reused
    }

    private void Update()
    {
        if (Keyboard.current.spaceKey.wasPressedThisFrame)
            _buffer.Push(_jump);            // the buffer stores the press time
        _buffer.TryExecute(_motor.IsGrounded);   // runs it when allowed and young enough

        if (Keyboard.current.rightArrowKey.wasPressedThisFrame)
            _history.Run(new MoveStepCommand(transform, Vector3.right));
        if (Keyboard.current.zKey.wasPressedThisFrame)
            _history.Undo();
    }
}
```
Coyote time (allowing a jump a few frames after leaving a ledge) follows the same idea: make the game forgive human timing.

**Don't / Do (short, as on the slide): the lost jump:**

**Don't:** An early press is thrown away.

```csharp
private void Update()
{
    if (_jumpPressed && _motor.IsGrounded)
        _motor.Jump();

    _jumpPressed = false;   // pressed 0.1 s early: lost
}
```

**Do:** Keep the newest press for 0.15 s.

```csharp
private ICommand _pending;
private float _pressedAt;

public void Push(ICommand command) { _pending = command; _pressedAt = Time.time; }

public bool TryExecute(bool canRun)
{
    if (_pending == null || !canRun) return false;
    if (Time.time - _pressedAt > 0.15f) return false;
    _pending.Execute();
    _pending = null;
    return true;
}
```

**Don't / Do: the lost jump:**

**Don't:** An early press is thrown away.

```csharp
private void Update()
{
    if (_jumpPressed && _motor.IsGrounded)
        _motor.Jump();

    _jumpPressed = false;   // pressed 0.1 s early: lost
}
```

**Do:** Keep the press time for 0.15 s.

```csharp
private const float JumpWindow = 0.15f;
private float _jumpPressedAt = float.NegativeInfinity;

private void Update()
{
    if (Keyboard.current.spaceKey.wasPressedThisFrame) _jumpPressedAt = Time.time;

    if (Time.time - _jumpPressedAt > JumpWindow || !_motor.IsGrounded) return;
    _jumpPressedAt = float.NegativeInfinity;
    _motor.Jump();
}
```


### Undo and replay

*In plain words:* keep finished commands on a stack. Undo pops the top and reverses it. Replay stores the time with each command and runs them again from the same start. Commands must carry their own data.
Undo needs the command to remember what it changed. A stack of finished commands gives you Ctrl+Z.

```csharp
using System.Collections.Generic;
using UnityEngine;

public interface IUndoableCommand : ICommand
{
    void Undo();
}

public class CommandHistory
{
    private readonly Stack<IUndoableCommand> _done = new();

    public void Run(IUndoableCommand command)
    {
        command.Execute();
        _done.Push(command);
    }

    public void Undo()
    {
        if (_done.Count > 0) _done.Pop().Undo();
    }
}

public class MoveStepCommand : IUndoableCommand
{
    private readonly Transform _target;
    private readonly Vector3 _step;

    public MoveStepCommand(Transform target, Vector3 step)
    {
        _target = target;
        _step = step;
    }

    public void Execute() => _target.position += _step;
    public void Undo() => _target.position -= _step;
}
```
**Replay:** record the clock time and the command on every `Run`. To play back, reset to the same start state and run each command when the clock reaches its time. It only works when commands use their own data, not live input. Undo fits puzzle, grid and tactics games best. In a shooter you rarely need it, but buffering and replay still apply. Start with one of the three.

### Putting it together: the player

*In plain words:* two scripts sit on the Player. `PlayerInputReader` reads the keys and makes commands. `PlayerMotor` does the moving. `ICommand`, `JumpCommand`, `CommandBuffer` and `CommandHistory` are plain classes, made by the reader.

```text
Player GameObject
  Character Controller
  PlayerMotor        (script)  Jump Height 1.2
  PlayerInputReader  (script)  Motor, Buffer Window 0.15
```

```text
Unity -> PlayerInputReader.Update -> wasPressedThisFrame -> _buffer.Push(_jump)
_buffer.TryExecute(IsGrounded) -> JumpCommand.Execute -> PlayerMotor.Jump
Right arrow -> _history.Run -> Execute + stack     Z -> _history.Undo
```

The complete script is the `PlayerInputReader` above. In `Awake` it makes the buffer and one `JumpCommand`, once. In `Update`: step 1, if space was pressed this frame, `Push` the command (the buffer stores the press time). Step 2, `TryExecute` with `IsGrounded`: if the player is on the ground and the press is younger than the window, the buffer runs `JumpCommand.Execute`, which calls `PlayerMotor.Jump`. The right arrow runs a `MoveStepCommand` through `CommandHistory.Run`, and Z pops the top and calls `Undo`. **Common mistake:** a new `JumpCommand` every frame, or calling the motor straight from the key check and skipping the buffer.

---

## Block 4: Services Instead of Singletons

**In plain words:** a dependency is something a class needs, like audio. `PersistentSingleton<T>` lets anyone grab it with `Instance`, but the class header does not show what it needs. A service locator is a phone book: you ask for a role (`IAudioService`), the bootstrap in `_PersistentCore` registered who fills it, and a test can register a fake. Dependency injection (passing the need in through the constructor) is only named.

**Not the same as a singleton or an event channel:** a locator is give me the thing I need (pull). An event is tell whoever cares (push). A singleton is one global class anyone grabs with `Instance`, while a locator hands out an interface that can be swapped for a fake. Use a locator for one shared service, an event channel for news.
Architecture 1 taught `PersistentSingleton<T>` for infrastructure. The cost shows up later:
- **Hidden dependencies:** the class header does not show that it needs `AudioManager`.
- **Start-up order:** `Instance` can run before its setup is done.
- **Hard to test:** you cannot swap in a fake.

```csharp
public class EnemySpawner : MonoBehaviour
{
    private void Start()
    {
        // Nothing in the class header says it needs these two.
        AudioManager.Instance.Play("spawn");
        int best = SaveSystem.Instance.BestScore;
    }
}
```
A small service locator is the next step. The interface says what, the bootstrap decides who.

```csharp
using System;
using System.Collections.Generic;
using UnityEngine;

public static class Services
{
    private static readonly Dictionary<Type, object> s_services = new();

    public static void Register<T>(T service) where T : class
        => s_services[typeof(T)] = service;

    public static T Get<T>() where T : class
    {
        if (s_services.TryGetValue(typeof(T), out object service)) return (T)service;
        throw new InvalidOperationException($"Service {typeof(T).Name} is not registered.");
    }

    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
    private static void Reset() => s_services.Clear();
}
```

```csharp
using UnityEngine;

public interface IAudioService
{
    void Play(string clipName);
}

[DefaultExecutionOrder(-100)]
public class CoreBootstrap : MonoBehaviour
{
    [SerializeField] private AudioService _audio;   // a MonoBehaviour that implements IAudioService

    private void Awake() => Services.Register<IAudioService>(_audio);
}
```
Put `CoreBootstrap` in `_PersistentCore`. A spawner asks for the interface once and caches it:

```csharp
private IAudioService _audio;
private void Start() => _audio = Services.Get<IAudioService>();
```
- Tests register a fake instead of the real service.
- A missing service fails at start, not later with a null reference.
- `Reset` clears the dictionary on every Play Mode start, which matters if you turn off domain reload.
- It is still a global, just an explicit and replaceable one. Do not sprinkle `Services.Get` everywhere.

**Dependency injection** goes one step further: services are passed in through the constructor, so nothing calls a global lookup. VContainer is one Unity library for it. We only name it here, nobody installs a framework in this class.

**Don't / Do (short, as on the slide): global Instance or service lookup:**

**Don't:** Hidden need, hard-wired class.

```csharp
private void Start()
{
    // Nothing in the class header says it needs audio.
    AudioManager.Instance.Play("spawn");
}
```

**Do:** The need is visible and swappable.

```csharp
private IAudioService _audio;   // registered in _PersistentCore

private void Start()
{
    _audio = Services.Get<IAudioService>();
    _audio.Play("spawn");
}
```

**Don't / Do: global Instance or service lookup:**

**Don't:** Hidden need, hard-wired class.

```csharp
public class EnemySpawner : MonoBehaviour
{
    private void Start()
    {
        // Nothing in the class header says it needs audio.
        AudioManager.Instance.Play("spawn");
    }
}
```

**Do:** The need is visible and swappable.

```csharp
public class EnemySpawner : MonoBehaviour
{
    private IAudioService _audio;   // registered in _PersistentCore

    private void Start()
    {
        _audio = Services.Get<IAudioService>();
        _audio.Play("spawn");
    }
}
```


### Putting it together: the services

*In plain words:* a bootstrap script in `_PersistentCore` registers the service first. Any script asks for it later.

```text
Assets/Scripts/
  Core/
    IAudioService.cs    plain interface
    Services.cs         plain static class
    AudioService.cs     MonoBehaviour: on _PersistentCore
    CoreBootstrap.cs    MonoBehaviour: on _PersistentCore
  Enemy/
    EnemySpawner.cs     MonoBehaviour: on a spawner
```

Order of execution: 1 `_PersistentCore` loads, 2 `CoreBootstrap.Awake` (order -100), 3 `Services.Register`, 4 other Awakes, 5 `EnemySpawner.Start`, 6 `Services.Get`, 7 `_audio.Play`.

```csharp
using UnityEngine;

[DefaultExecutionOrder(-100)]   // runs before other scripts
public class CoreBootstrap : MonoBehaviour
{
    [SerializeField] private AudioService _audio;   // MonoBehaviour : IAudioService

    private void Awake() => Services.Register<IAudioService>(_audio);
}
```

```csharp
using UnityEngine;

public class EnemySpawner : MonoBehaviour
{
    [SerializeField] private GameObject _enemyPrefab;
    private IAudioService _audio;

    private void Start() => _audio = Services.Get<IAudioService>();   // asked once, kept in a field

    public void Spawn(Vector3 position)
    {
        Instantiate(_enemyPrefab, position, Quaternion.identity);
        _audio.Play("spawn");
    }
}
```

```csharp
using UnityEngine;

public interface IAudioService
{
    void Play(string clipName);
}

public class AudioService : MonoBehaviour, IAudioService
{
    [SerializeField] private AudioSource _source;
    [SerializeField] private AudioClip[] _clips;

    public void Play(string clipName)
    {
        foreach (AudioClip clip in _clips)
            if (clip.name == clipName) { _source.PlayOneShot(clip); return; }
    }
}
```

`[DefaultExecutionOrder(-100)]` makes `CoreBootstrap.Awake` run before scripts with the default order 0, and `Start` runs after all `Awake` calls of the loaded scene. Load `_PersistentCore` first (scene 0 in Build Settings, or before the game scene). **Common mistake:** calling `Services.Get` in `Awake` and hoping the bootstrap ran first. Ask in `Start`, keep the result in a field, never ask in `Update`.

---

## Block 5: Refactoring Toolkit and Safety Net

**In plain words:** refactoring means changing how code is built without changing what the game does, in small named steps (extract method, extract class, strangler). A regression test is a tiny test that goes red if you break old behaviour. An assembly definition makes a folder its own compile unit, so a forbidden reference becomes a compiler error. Commit after each green step. With an AI agent: name the step, limit the files, read every diff.
Refactoring means changing structure, not behaviour. After each step the game plays exactly like before.

| Step | Meaning |
| :--- | :--- |
| Extract method | Give a block of code a name. |
| Extract class | Move related fields and methods out into their own class. |
| Strangler | Grow the new code next to the old, switch, delete the old path when stable. |
| Commit per step | Git is your undo button. |

Order for a monster class: extract methods, extract a class for one responsibility, then move it behind an interface.

```csharp
[SerializeField] private bool _useNewBrain;
[SerializeField] private NpcBrain _brain;

private void Update()
{
    if (_useNewBrain)
    {
        _brain.Machine.Tick();
        return;
    }
    LegacyUpdate();   // old code stays until the new path works
}
```

**On the slide:** Refactoring means changing how code is built without changing what the game does. One real step, before and after:

```csharp
private void Update()
{
    if (_isPatrolling) { MoveToNextPoint(); }
    // chase and attack code also lives here
}
```

```csharp
public class PatrolState : IState
{
    private readonly NpcBrain _npc;
    public PatrolState(NpcBrain npc) => _npc = npc;

    public void Enter() { }
    public void Tick() => MoveToNextPoint();   // same code, moved here
    public void Exit() { }

    private void MoveToNextPoint() { /* same body as before */ }
}
```

Commit message: `Extract PatrolState from Update (no behavior change)`. Same behavior before and after, or revert.

The ladder, every time: 1. run the game, 2. make one move (one named step), 3. run the game again and commit. If it plays differently, revert and try a smaller step.

Extract method, a tiny example:

```csharp
// Before: Update held the patrol lines itself.
// After: the same lines, now with a name.
private void Update() => UpdatePatrol();

private void UpdatePatrol()
{
    if (_isPatrolling) { MoveToNextPoint(); }
}
```

**Don't / Do: one commit:**

**Don't:** One huge commit. When it breaks, where?

```text
refactor: rewrite NpcBrain as a state machine
 14 files changed, 612 insertions(+), 488 deletions(-)
```

**Do:** One named step. Run the game, commit.

```text
refactor: extract PatrolState from NpcBrain
 2 files changed, 41 insertions(+), 23 deletions(-)
```


### Safety net: one test and compiler walls

*In plain words:* Before you change old code, set up three things that tell you if you broke it.

| Tool | What it does | Tiny example | Use it when |
| :--- | :--- | :--- | :--- |
| Test | Goes red if the behavior breaks. | After Chase, the state is Combat. | Before moving risky code. |
| Walls (assembly definition) | The compiler refuses code reaching across parts. | UI code calling combat code. | During any refactor. |
| Commit | Saves the last working version. | One commit per step. | After each green step. |

The test on the slide:

```csharp
using NUnit.Framework;

public class EnemyTests
{
    [Test]
    public void AfterChase_StateIsCombat()
    {
        var machine = new StateMachine();
        machine.SetState(new ChaseState(null));
        machine.SetState(new CombatState(null));
        Assert.IsInstanceOf<CombatState>(machine.Current);
    }
}
```

A second test with a fake state checks the order of calls:

```csharp
using NUnit.Framework;

public class StateMachineTests
{
    private sealed class FakeState : IState
    {
        public int Entered;
        public int Exited;
        public void Enter() => Entered++;
        public void Tick() { }
        public void Exit() => Exited++;
    }

    [Test]
    public void SetState_ExitsOldStateAndEntersNewState()
    {
        var machine = new StateMachine();
        var a = new FakeState();
        var b = new FakeState();

        machine.SetState(a);
        machine.SetState(b);

        Assert.AreEqual(1, a.Exited);
        Assert.AreEqual(1, b.Entered);
    }
}
```
Where to run it: Window > General > Test Runner, EditMode tab, Run All. No need to press Play. Create the test folder with Create > Testing > Test Assembly Folder and add a reference from the test assembly to your game assembly.

Where to click for the walls: in the Project window, right click a folder, Create > Assembly Definition, and name it, for example `Game.Combat`. Select the `.asmdef` file, and in the Inspector under Assembly Definition References press the plus button, pick the assembly you may use (for example `Game.Core`) and press Apply. Leave `Game.UI` out of the list on purpose: that is the wall.

Commit: one small commit per step, so you can go back to the last working version.

Assembly definitions also act as compiler walls. If `Game.Core` does not reference `Game.UI`, then a forbidden reference becomes a compiler error, and compile times drop because each part compiles on its own.

### Leaks to look for
A static event survives scene loads and keeps dead listeners alive. A lambda cannot be removed with `-=`, so use a named method:

```csharp
// Leak: this lambda can never be unsubscribed.
private void Start() => _channel.RegisterListener(() => Debug.Log("raised"));

// Fix: a named method, removed in OnDisable.
private void OnEnable() => _channel.RegisterListener(OnRaised);
private void OnDisable() => _channel.UnregisterListener(OnRaised);
private void OnRaised() => Debug.Log("raised");
```

### Refactoring with an AI agent

*In plain words:* the agent is a fast junior. Small named steps keep every diff readable.
This links to lesson 1.8: read every diff, ask for a diagnosis and options first. For refactoring, add one rule: never let an agent rewrite a whole class at once. Give it one small step from the toolkit.
- Too big: "Rewrite NpcBrain as a state machine."
- Right size: "Move the patrol code from NpcBrain.Update into PatrolState. Keep behaviour. Touch two files."
- Run the test, then commit. If the diff is longer than you can read in two minutes, revert and split the step.

**Don't / Do (short, as on the slide): prompts to an AI agent:**

**Don't:** Vague. The agent decides everything.

```text
Refactor this class.
```

**Do:** One step, a visible diff, a hard limit.

```text
Move the patrol code from NpcBrain.Update into PatrolState.
Keep behaviour. Touch two files.
Show me the diff. Change nothing else.
```

**Don't / Do: prompts to an AI agent:**

**Don't:** Vague. The agent decides everything.

```text
Refactor this class.
```

**Do:** One step, a visible diff, a hard limit.

```text
Extract only the Patrol state into its own class.
Show me the diff.
Do not change anything else.
```


---

## Closing Table: Which Tool When

**In plain words:** start from the need in your code, then pick the tool. One need, one tool, one small step.

| Need | Tool |
| :--- | :--- |
| Tell many that something happened | Event channel (Arch 1) |
| Call one specific thing | Interface |
| Queue, undo or replay an action | Command |
| A timed one-off sequence | Coroutine |
| Know which mode you are in and what is allowed | State machine |
| One shared service | Service locator |

### Not the same as: when to use which

| Tool | What it is | Not the same as |
| :--- | :--- | :--- |
| State machine | Which mode you are in now, and what may happen next | Event channel: news that something happened. Coroutine: a timed sequence |
| Coroutine | A one-off timed sequence: do A, wait, do B | State machine |
| Command | An action as an object you can store, queue, undo and replay | Event channel: says what happened |
| Event channel (Arch 1) | Tells many listeners that something happened | Command or interface |
| Interface | A direct call to one known target | Event: a broadcast |
| Service locator | Pull one shared service when you need it | Event (push) or singleton |
| Timestamp buffer | Remember a press for a short window | Coroutine timer |

### Symptom to tool

| Symptom in your code | Tool |
| :--- | :--- |
| Flags pile up | Class-based FSM with guards |
| You cannot tell why a state changed | Transition log, `DevWatch`, breakpoint in `SetState` |
| Too many states and arrows | Hierarchical states, or a behavior tree or utility AI |
| Type check or tag switch per target | Interface such as `IDamageable` |
| Deep class tree | Small components |
| Lost or sticky jump press | Command plus input buffer |
| `Instance` everywhere, cannot test | Service locator, registered in a bootstrap |
| Class too big to touch safely | Small named steps, one test, assembly definitions, one commit per step |

**Take home:** pick one class in your project, do one small named step, commit.

Next class (preview): animation, including state machines in the Animator. Bring a project that builds and a committed git state.

---

## Takeaways
- A state is a small class with `Enter`, `Tick` and `Exit`. Only the machine switches state.
- Guard your transitions and log every one of them in a single place.
- Use an interface for what an object can do, and small components for what it is made of.
- Turn actions into command objects when you need a buffer, undo or replay.
- Singletons are for infrastructure. Ask for everything else through an interface.
- Change code in small named steps with a test and a commit after each one.
- With an AI agent: read every diff and hand over one small step at a time.
- Take home: pick one class in your project, do one small named step, commit.

## Troubleshooting
- **State never changes:** with guards, a missing `Allow` call blocks the arrow. Look for the "blocked" warning in the Console.
- **`Enter` runs twice or not at all:** `SetState` returns early when the next state is the current one. Check who calls it with the call stack.
- **NullReferenceException in a state:** states are created in `NpcBrain.Awake`. Make sure nothing calls `Machine.SetState` earlier than `Start`.
- **Jump never fires from the buffer:** `TryExecute` must run every frame, and `canRun` must be true within the window.
- **`Services.Get` throws "not registered":** the bootstrap runs too late. Check `[DefaultExecutionOrder(-100)]` and that `_PersistentCore` loads first.
- **Test assembly cannot see your classes:** your game code must live in an assembly definition that the test assembly references.
- **Compile error after adding an assembly definition:** a class now references a part it may not see. Fix the dependency or add the reference on purpose.

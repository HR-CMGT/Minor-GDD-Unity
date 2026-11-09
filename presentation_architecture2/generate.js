const fs = require('fs');
const path = require('path');

console.log('Generating Class 10 (Architecture 2) presentation...');

// ---------- small helpers that build the slide HTML ----------
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const KEYWORDS = new Set(['using', 'public', 'private', 'protected', 'internal', 'static', 'readonly', 'const', 'class', 'struct', 'interface', 'enum', 'sealed', 'abstract', 'void', 'int', 'float', 'bool', 'string', 'object', 'var', 'new', 'return', 'if', 'else', 'for', 'foreach', 'while', 'switch', 'case', 'break', 'null', 'true', 'false', 'this', 'where', 'out', 'in', 'is', 'throw', 'get', 'set', 'namespace', 'override', 'virtual']);

const UNITY_EVENTS = new Set(['Awake', 'Start', 'Update', 'FixedUpdate', 'LateUpdate', 'OnEnable', 'OnDisable', 'OnDestroy', 'OnTriggerEnter', 'OnTriggerExit', 'OnTriggerStay', 'OnCollisionEnter', 'OnCollisionExit', 'OnDrawGizmos', 'OnDrawGizmosSelected', 'OnValidate', 'OnApplicationPause', 'OnApplicationQuit', 'OnGUI', 'Reset']);
['async', 'await', 'params', 'ref', 'partial', 'event', 'delegate', 'yield', 'try', 'catch', 'finally', 'do', 'continue', 'as', 'base', 'long', 'double', 'byte', 'char', 'short', 'uint', 'typeof', 'default', 'lock', 'checked', 'goto', 'nameof', 'record', 'init', 'value', 'add', 'remove'].forEach((k) => { if (k !== 'value' && k !== 'add' && k !== 'remove') KEYWORDS.add(k); });
// Rider Darcula C# tokenizer. Comments/strings/preprocessor match first so keywords inside them stay plain.
function hl(src) {
    const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(\$@"(?:[^"]|"")*"|@\$"(?:[^"]|"")*"|@"(?:[^"]|"")*"|\$"(?:[^"\\\n]|\\.)*"|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)+')|((?<=^[ \t]*)#[a-z]+[^\n]*)|((?<=^[ \t]*)\[[A-Za-z_][^\]\n]*\])|(\b\d[\d_]*\.?\d*(?:[fFdDmMuUlL]|[eE][+-]?\d+)?\b)|([A-Za-z_]\w*)|([\s\S])/gm;
    let out = '';
    let m;
    const span = (c, t) => '<span class="' + c + '">' + esc(t) + '</span>';
    while ((m = re.exec(src)) !== null) {
        if (m[1]) out += span('jb-comment', m[1]);
        else if (m[2]) out += span('jb-string', m[2]);
        else if (m[3] || m[4]) out += span('jb-attr', m[3] || m[4]);
        else if (m[5]) out += span('jb-number', m[5]);
        else if (m[6]) {
            const w = m[6];
            const rest = src.slice(re.lastIndex);
            const prev = src.slice(0, re.lastIndex - w.length).trimEnd().slice(-1);
            if (KEYWORDS.has(w) && prev !== '.') out += '<span class="jb-keyword">' + w + '</span>';
            else if (UNITY_EVENTS.has(w) && /^\s*\(/.test(rest)) out += '<span class="jb-method jb-event">' + w + '</span>';
            else if (/^(?:<[\w,<>\[\]? ]*>)?\(/.test(rest) && !/\bnew\s*$/.test(src.slice(0, re.lastIndex - w.length))) out += '<span class="jb-method">' + w + '</span>';
            else out += w;
        } else out += esc(m[7]);
    }
    return out;
}

function codeBox(file, src) {
    return '<div class="code-box">\n<div class="jb-editor-header"><div class="jb-editor-tab"><span class="jb-csharp-icon">C#</span><span class="jb-filename">' + file + '</span></div><button class="code-copy-btn" onclick="copyCode(this)">Copy</button></div>\n<pre><code>' + hl(src.replace(/^\n/, '').replace(/\s+$/, '')) + '</code></pre></div>';
}
const codeCard = (kind, title, file, src) =>
    '<div class="content-card ' + kind + '"><div class="card-title ' + kind + '">' + title + '</div><div class="card-body" style="padding: 0;">' + codeBox(file, src) + '</div></div>';
const card = (kind, title, body, style) =>
    '<div class="content-card ' + kind + '"' + (style ? ' style="' + style + '"' : '') + '><div class="card-title ' + kind + '">' + title + '</div><div class="card-body">' + body + '</div></div>';
const ul = (items) =>
    '<ul style="padding-left: 18px; margin: 0; line-height: 1.55; font-weight: 600;">' + items.map((i) => '<li>' + i + '</li>').join('') + '</ul>';
const COLORS = { blue: '#0284c7', green: '#059669', amber: '#d97706', red: '#b91c1c', purple: '#7c3aed' };
const pp = (color, tag, text) =>
    '<div class="punchy-point"><span class="punchy-tag" style="background:' + COLORS[color] + '; color:#ffffff;">' + tag + '</span> ' + text + '</div>';
const split = (left, right) =>
    '<div class="split-media-layout"><div class="left-column">' + left + '</div><div class="right-column">' + right + '</div></div>';
const acc = (summary, body) =>
    '<details class="slide-accordion tier-accordion"><summary class="accordion-header"><span>' + summary + '</span><span class="accordion-expand">Expand</span></summary><div class="accordion-body">' + body + '</div></details>';
const table = (head, rows) =>
    '<table class="dense-table" style="width: 100%;"><thead><tr>' + head.map((h) => '<th>' + h + '</th>').join('') + '</tr></thead><tbody>' +
    rows.map((r) => '<tr>' + r.map((c, i) => '<td>' + (i === 0 ? '<strong>' + c + '</strong>' : c) + '</td>').join('') + '</tr>').join('') + '</tbody></table>';
const lab = (title, badge, model, trap, rule, extra) =>
    '<div class="lab-deep-dive"><div class="lab-deep-dive-header"><div class="lab-deep-dive-title"><span>LAB MODE STUDY GUIDE: ' + title + '</span></div><span class="lab-deep-dive-badge">' + badge + '</span></div>\n' +
    '<div class="lab-mental-model"><div style="font-weight: 800; color: #166534; margin-bottom: 4px;">Mental Model</div>' + model + '</div>\n' +
    '<div class="lab-grid-2col"><div class="lab-box-neutral"><strong>The Trap:</strong><br>' + trap + '</div><div class="lab-box-neutral"><strong>The Rule:</strong><br>' + rule + '</div></div>\n' +
    (extra ? '<div class="lab-box-neutral" style="margin-bottom: 8px;"><strong>More:</strong><br>' + extra + '</div>' : '') +
    '</div>';
const panel = (title, lines) =>
    '<div class="media-panel-card" style="padding: 12px; gap: 8px;"><div style="font-weight: 800; color: #38bdf8; text-transform: uppercase; width: 100%;">' + title + '</div>' +
    '<div style="width: 100%; background: #070b14; border: 1px solid #1e293b; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px; font-family: monospace; color: #cbd5e1;">' +
    lines.map(([c, t]) => '<div style="border-left: 3px solid ' + c + '; padding-left: 8px;">' + t + '</div>').join('') + '</div></div>';
const divider = (title, subtitle, sentence, topics, notes) => ({
    origImg: '', isInverted: true, title, subtitle,
    content: '<div class="content-stack"><div class="content-card primary"><div class="card-title primary">Focus</div><div class="card-body">' + sentence + '</div></div></div>',
    topics, notes,
});
const slide = (title, content, notes) => ({ origImg: '', title, content, notes });

// ---------- C# listings ----------
const SIMPLE_NPC = `
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
}`;

const PLAYER_SOUP = `
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
}`;

const CHANNEL_API = `
using System;
using UnityEngine;

public class VoidEventChannelSO : ScriptableObject
{
    private Action _onEventRaised;

    public void RaiseEvent() => _onEventRaised?.Invoke();
    public void RegisterListener(Action listener) => _onEventRaised += listener;
    public void UnregisterListener(Action listener) => _onEventRaised -= listener;
}`;

const STATE_CORE = `
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
}`;

const PATROL_STATE = `
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
}`;

const CHASE_STATE = `
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
}`;

const NPC_BRAIN = `
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
}`;

const GUARD_CODE = `
private readonly HashSet<(IState from, IState to)> _allowed = new();

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
}`;

const GUARD_STATES = `
public interface IGuardedState : IState
{
    bool Allow(IState next);   // may I switch to this state?
}

public class IdleState : IState
{
    public void Enter() { } public void Tick() { } public void Exit() { }
}

public class PatrolState : IGuardedState
{
    public void Enter() { } public void Tick() { } public void Exit() { }
    public bool Allow(IState next) => next is ChaseState || next is IdleState;
}

public class ChaseState : IGuardedState
{
    public void Enter() { } public void Tick() { } public void Exit() { }
    public bool Allow(IState next) => next is CombatState || next is PatrolState;
}

public class CombatState : IGuardedState
{
    public void Enter() { } public void Tick() { } public void Exit() { }
    public bool Allow(IState next) => next is ChaseState || next is IdleState;
}`;

const GUARD_TRY = `
public bool TrySetState(IState next)
{
    if (next == null || next == Current) return false;
    if (Current is IGuardedState rules && !rules.Allow(next)) return false;
    SetState(next);
    return true;
}`;

const CHANNEL_REQUEST = `
// In NpcBrain: a channel asset carries the request, the machine decides.
[SerializeField] private VoidEventChannelSO _onPlayerSpotted;

private void OnEnable() => _onPlayerSpotted.RegisterListener(HandleSpotted);
private void OnDisable() => _onPlayerSpotted.UnregisterListener(HandleSpotted);

private void HandleSpotted() => Machine.TrySetState(Chase);`;

const LOG_OWNER = `
// In NpcBrain: the Inspector bool, passed into the machine.
[SerializeField] private bool _logTransitions = true;

private void Awake()
{
    Machine = new StateMachine { LogTransitions = _logTransitions, Name = name, Owner = this };
    // ...rest of Awake as before
}`;

const SETSTATE_LOG = `
public bool LogTransitions;   // the owner script copies its Inspector bool here
public string Name = "Machine";
public Object Owner;          // click a log line to find this object

public void SetState(IState next)
{
    if (next == null || next == Current) return;

    if (LogTransitions)
    {
        string from = Current?.GetType().Name ?? "none";
        Debug.Log($"{Name}: {from} -> {next.GetType().Name}", Owner);
        DevWatch.Set(Name + " state", next.GetType().Name);
    }

    Current?.Exit();      // breakpoint here: who called?
    Current = next;
    Current.Enter();
}`;

const COMBAT_STATE = `
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
}`;

const IDAMAGEABLE = `
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
}`;

const ICOMMAND = `
public interface ICommand
{
    void Execute();
}

public class JumpCommand : ICommand
{
    private readonly PlayerMotor _motor;

    public JumpCommand(PlayerMotor motor) => _motor = motor;

    public void Execute() => _motor.Jump();
}`;

const CMD_BUFFER = `
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
}`;

const UNDO_CODE = `
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
}`;

const MOVE_STEP = `
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
}`;

const SINGLETON_PROBLEM = `
public class EnemySpawner : MonoBehaviour
{
    private void Start()
    {
        // Nothing in the class header says it needs these two.
        AudioManager.Instance.Play("spawn");
        int best = SaveSystem.Instance.BestScore;
    }
}`;

const SERVICES = `
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
}`;

const BOOTSTRAP = `
using UnityEngine;

public interface IAudioService
{
    void Play(string clipName);
}

[DefaultExecutionOrder(-100)]
public class CoreBootstrap : MonoBehaviour
{
    [SerializeField] private AudioService _audio;   // MonoBehaviour : IAudioService

    private void Awake() => Services.Register<IAudioService>(_audio);
}

// In a spawner:
// private IAudioService _audio;
// private void Start() => _audio = Services.Get<IAudioService>();`;

const STRANGLER = `
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
}`;

const REFACTOR_BEFORE = `
private void Update()
{
    if (_isPatrolling) { MoveToNextPoint(); }
    // chase and attack code also lives here
}`;

const REFACTOR_AFTER = `
public class PatrolState : IState
{
    private readonly NpcBrain _npc;
    public PatrolState(NpcBrain npc) => _npc = npc;

    public void Enter() { }
    public void Tick() => MoveToNextPoint();   // same code, moved here
    public void Exit() { }

    private void MoveToNextPoint() { /* same body as before */ }
}`;

const EXTRACT_METHOD = `
// Before: Update held the patrol lines itself.
// After: the same lines, now with a name.
private void Update() => UpdatePatrol();

private void UpdatePatrol()
{
    if (_isPatrolling) { MoveToNextPoint(); }
}`;

const NUNIT_MAIN = `
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
}`;

const NUNIT = `
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
}`;

const LEAKS = `
// Leak: this lambda can never be unsubscribed.
private void Start() => _channel.RegisterListener(() => Debug.Log("raised"));

// Fix: a named method, removed in OnDisable.
private void OnEnable() => _channel.RegisterListener(OnRaised);
private void OnDisable() => _channel.UnregisterListener(OnRaised);
private void OnRaised() => Debug.Log("raised");`;

const GROUNDED_STATE = `
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
}`;

const GROUNDED_BRAIN = `
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
}`;

const NPC_FULL = `
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
}`;

const HEALTH_FULL = `
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
}`;

const MOVER_ATTACK = `
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
}`;

const BULLET_PARENT = `
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
}`;

const ENEMY_ROOT = `
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
}`;

const ROOT_PARTS = `
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
}`;

const CLASS_TREE = `
public class Enemy : MonoBehaviour { public int Health = 100; }

public class FlyingEnemy : Enemy { public void Fly() { } }

public class ArmoredFlyingEnemy : FlyingEnemy { public int Armor; }`;

const PLAIN_VS_MONO = `
// A plain C# class: no base class, cannot be attached.
public class PatrolState : IState { /* ... */ }

// A MonoBehaviour: Unity's base class, attach it to a GameObject.
public class Health : MonoBehaviour, IDamageable { /* ... */ }
//                    ^ one base class      ^ any number of interfaces`;

const INPUT_READER = `
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
}`;

const CORE_BOOT = `
using UnityEngine;

[DefaultExecutionOrder(-100)]   // runs before other scripts
public class CoreBootstrap : MonoBehaviour
{
    [SerializeField] private AudioService _audio;   // MonoBehaviour : IAudioService

    private void Awake() => Services.Register<IAudioService>(_audio);
}`;

const AUDIO_SERVICE = `
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
}`;

const ENEMY_SPAWNER = `
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
}`;

// ---------- working session cheat sheets (same names and calls as the slides) ----------
const SESS1_CODE = `
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

// Parent state: the child calls base.Tick() first.
public abstract class GroundedState : IState
{
    public virtual void Enter() { }
    public virtual void Tick() { /* shared rule */ }
    public virtual void Exit() { }
}

public class WalkState : GroundedState
{
    public override void Tick() { base.Tick(); /* own walk code */ }
}
// Full NpcBrain: slide Putting It Together (state machines).`;

const SESS2_CODE = `
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
// cached with GetComponent in Awake. Full scripts: Putting It Together (parts).`;

const SESS3_CODE = `
public interface ICommand { void Execute(); }
public interface IUndoableCommand : ICommand { void Undo(); }

public class JumpCommand : ICommand
{
    private readonly PlayerMotor _motor;
    public JumpCommand(PlayerMotor motor) => _motor = motor;
    public void Execute() => _motor.Jump();
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

public class CommandHistory   // minimal undo stack
{
    private readonly Stack<IUndoableCommand> _done = new();
    public void Run(IUndoableCommand command) { command.Execute(); _done.Push(command); }
    public void Undo() { if (_done.Count > 0) _done.Pop().Undo(); }
}
// In PlayerInputReader.Update:
//   if (Keyboard.current.spaceKey.wasPressedThisFrame) _buffer.Push(_jump);
//   _buffer.TryExecute(_motor.IsGrounded);
// Full script: Putting It Together (commands).`;

const SESS4_CODE = `
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
// Full scripts: Putting It Together (services).`;

const PLAYER_MOTOR = `
using UnityEngine;

[RequireComponent(typeof(CharacterController))]
public class PlayerMotor : MonoBehaviour
{
    [SerializeField] private float _jumpSpeed = 6f;
    [SerializeField] private float _gravity = -20f;
    private CharacterController _controller;
    private float _verticalSpeed;

    public bool IsGrounded => _controller.isGrounded;

    private void Awake() => _controller = GetComponent<CharacterController>();

    public void Jump() => _verticalSpeed = _jumpSpeed;
    public void Move(Vector3 direction) => _controller.Move(direction * Time.deltaTime);

    private void Update()
    {
        if (_controller.isGrounded && _verticalSpeed < 0f) _verticalSpeed = -1f;
        _verticalSpeed += _gravity * Time.deltaTime;
        _controller.Move(Vector3.up * _verticalSpeed * Time.deltaTime);
    }
}`;

// ---------- visual helpers: Inspector mock, file tree, call flow, class chain ----------
const MONO = "font-family: ui-monospace, Menlo, Consolas, monospace;";
// Hierarchy + Inspector mock (HTML/CSS only). hier: [[text, selected, indent]], comps: [{ name, script, fields: [[label, value]] }]
const inspector = (hier, objName, comps) =>
    '<div style="display: flex; gap: 8px; font-family: system-ui, sans-serif; font-size: 0.8em; line-height: 1.35;">' +
    '<div style="flex: 0 0 34%; background: #2b2b2b; color: #d4d4d4; border: 1px solid #1a1a1a; border-radius: 6px; padding: 8px;"><div style="font-weight: 800; color: #9ca3af; margin-bottom: 4px;">Hierarchy</div>' +
    hier.map(([t, sel, ind]) => '<div style="padding: 1px 6px; margin-left: ' + (ind * 12) + 'px;' + (sel ? ' background: #2c5d87; color: #ffffff; border-radius: 3px;' : '') + '">' + t + '</div>').join('') + '</div>' +
    '<div style="flex: 1; background: #383838; color: #e5e7eb; border: 1px solid #1a1a1a; border-radius: 6px; padding: 8px;"><div style="font-weight: 800; color: #9ca3af; margin-bottom: 4px;">Inspector</div>' +
    '<div style="font-weight: 800; font-size: 1.1em; padding-bottom: 4px; border-bottom: 1px solid #555;">&#9745; ' + objName + '</div>' +
    comps.map((c) => '<div style="margin-top: 6px; background: #444444; border-radius: 4px; padding: 4px 8px;"><div style="font-weight: 800;">&#9660; ' + c.name +
        (c.script ? ' <span style="font-weight: 700; font-size: 0.8em; background: #0284c7; color: #ffffff; border-radius: 3px; padding: 0 5px;">script</span>' : '') + '</div>' +
        c.fields.map(([l, v]) => '<div style="display: flex; justify-content: space-between; gap: 8px; color: #cbd5e1;"><span>' + l + '</span><span style="background: #2b2b2b; padding: 0 8px; border-radius: 3px; min-width: 38%; text-align: right;">' + v + '</span></div>').join('') + '</div>').join('') +
    '<div style="margin-top: 8px; text-align: center; background: #555555; border-radius: 4px; padding: 3px; font-weight: 700;">Add Component</div></div></div>';
// File tree. rows: [indent, name, tag, kind] where kind is 'mono' (attach to the GameObject), 'plain' (plain C# class) or '' (folder)
const treeBox = (title, rows) =>
    '<div style="background: #1e1f22; color: #bcbec4; border-radius: 6px; padding: 8px 10px; ' + MONO + ' font-size: 0.82em; line-height: 1.5;"><div style="color: #38bdf8; font-weight: 800; margin-bottom: 2px;">' + title + '</div>' +
    rows.map(([ind, name, tag, kind]) => '<div style="padding-left: ' + (ind * 16) + 'px;">' + name +
        (kind === 'mono' ? ' <span style="background: #059669; color: #ffffff; border-radius: 3px; padding: 0 6px; font-size: 0.85em;">' + tag + '</span>' : kind === 'plain' ? ' <span style="color: #9ca3af;">' + tag + '</span>' : '') + '</div>').join('') + '</div>';
// Call flow. rows: arrays of [label, color]; each row is one chain with arrows.
const flow = (title, rows) =>
    '<div style="background: #0f172a; border-radius: 6px; padding: 8px 10px;"><div style="color: #38bdf8; font-weight: 800; font-size: 0.82em; text-transform: uppercase; margin-bottom: 4px;">' + title + '</div>' +
    rows.map((r) => '<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 4px; margin-bottom: 5px;">' +
        r.map(([t, c], i) => (i ? '<span style="color: #38bdf8; font-weight: 800;">&rarr;</span>' : '') +
            '<span style="background: #1e293b; color: #e2e8f0; border-left: 4px solid ' + COLORS[c || 'blue'] + '; border-radius: 4px; padding: 2px 8px; ' + MONO + ' font-size: 0.82em;">' + t + '</span>').join('') + '</div>').join('') + '</div>';
// Class chain. rows: [name, what it adds]
const chain = (rows) =>
    '<div style="display: flex; flex-direction: column; gap: 2px;">' + rows.map(([n, add], i) =>
        (i ? '<div style="text-align: center; color: #0284c7; font-weight: 800; line-height: 1;">&darr; inherits</div>' : '') +
        '<div style="display: flex; align-items: center; gap: 10px; background: ' + (i === rows.length - 1 ? '#ecfdf5' : '#f1f5f9') + '; border: 2px solid ' + (i === rows.length - 1 ? '#059669' : '#94a3b8') + '; border-radius: 6px; padding: 4px 10px;"><strong style="flex: 0 0 36%; ' + MONO + ' color: #0f172a;">' + n + '</strong><span style="color: #334155; font-weight: 600;">' + add + '</span></div>').join('') + '</div>';
const olist = (items) =>
    '<ol style="padding-left: 22px; margin: 0; line-height: 1.5; font-weight: 600;">' + items.map((i) => '<li>' + i + '</li>').join('') + '</ol>';
const code = (t) => '<code>' + t + '</code>';

// ---------- deep dive helpers ----------
const leadLine = (t) => '<p style="margin: 0 0 8px 0; font-weight: 800; font-size: 1.08em; color: #0f172a;">' + t + '</p>';
const H = (t) => '<div style="font-weight: 800; margin: 2px 0 4px 0;">' + t + '</div>';
const P = (...a) => a.map((t) => '<p style="margin: 0 0 6px 0; line-height: 1.5;">' + t + '</p>').join('');
const bl = (items) => '<ul style="margin: 0 0 6px 0; padding-left: 18px; line-height: 1.5;">' + items.map((i) => '<li>' + i + '</li>').join('') + '</ul>';
const deep = (title, badge, d) =>
    '<div class="lab-deep-dive"><div class="lab-deep-dive-header"><div class="lab-deep-dive-title"><span>DEEP DIVE: ' + title + '</span></div><span class="lab-deep-dive-badge">' + badge + '</span></div>\n' +
    '<div class="lab-mental-model">' + H('In plain words') + d.plain + H('Everyday picture') + d.picture + '</div>\n' +
    '<div class="lab-box-neutral" style="margin-bottom: 8px;">' + H('The problem first') + d.problem + '</div>\n' +
    '<div class="lab-box-neutral" style="margin-bottom: 8px;">' + H(d.walkLabel || 'Walkthrough') + d.walk + '</div>\n' +
    '<div class="lab-grid-2col"><div class="lab-box-neutral">' + H('Why you need it') + d.why + '</div><div class="lab-box-trap">' + H('Common mistake') + d.mistake + '</div></div>' +
    (d.dd ? '<div class="lab-box-trap" style="margin-top: 8px;">' + H("Common mistake: Don't vs Do") + d.dd + '</div>' : '') +
    (d.more || '') +
    (d.diff ? '<div class="lab-box-rule" style="margin-top: 8px;">' + H('Difference and when to use which') + d.diff + '</div>' : '') +
    (d.rule ? '<div class="lab-box-rule" style="margin-top: 8px;">' + H('The rule') + d.rule + '</div>' : '') +
    '</div>';

// Second slide folded into this deep dive: same sections, one compact box.
const deepSub = (title, d) =>
    '<div class="lab-box-neutral" style="margin-top: 8px;">' + H(title) + H('In plain words') + d.plain + H('Everyday picture') + d.picture + H('The problem first') + d.problem +
    H(d.walkLabel || 'Walkthrough') + d.walk + H('Why you need it') + d.why + H('Common mistake') + d.mistake + (d.rule ? H('The rule') + d.rule : '') + '</div>';

// ---------- timed working sessions ----------
const sessionTimer = (n, minutes) => {
    const id = 'cTimer' + n, secs = minutes * 60, label = String(minutes).padStart(2, '0') + ':00';
    return '<div class="media-panel-card" style="padding: 12px; gap: 8px;"><div style="font-weight: 800; color: #38bdf8; text-transform: uppercase; width: 100%;">Working session: ' + minutes + ' minutes</div>' +
        '<div style="width: 100%; padding: 12px; background: #070b14; border: 1px solid #1e293b; border-radius: 8px; text-align: center;">' +
        '<div id="' + id + '" style="font-size: 2.6rem; font-weight: 900; font-family: monospace; color: #38bdf8; letter-spacing: 2px;">' + label + '</div>' +
        '<div class="lecturer-timer-controls" id="controls_' + id + '" style="display: flex; gap: 8px; justify-content: center; margin-top: 10px;">' +
        '<button class="interactive-action-btn" onclick="lecturerStartTimer(\'' + id + '\', ' + secs + ')">Start ' + label + '</button>' +
        '<button class="interactive-action-btn secondary" onclick="lecturerPauseTimer(\'' + id + '\')">Pause</button>' +
        '<button class="interactive-action-btn secondary" onclick="lecturerResetTimer(\'' + id + '\', ' + secs + ')">Reset</button></div>' +
        '<div class="student-timer-status" id="status_' + id + '" style="display: none; margin-top: 10px; font-size: 0.76rem; font-weight: 700; color: #94a3b8;">Synced with Classroom Timer</div></div></div>';
};
// No accordion and no deep dive on a session slide (keeps it compact for the projector).
const session = (n, title, minutes, pick, tiers, done, file, code, notes) =>
    slide('Working Session ' + n + ': ' + title,
        split(
            card('primary', 'Try this', '<p style="margin: 0 0 6px 0; font-weight: 800;">' + pick + '</p>' + pp('green', 'Starter', tiers[0]) + pp('amber', 'Standard', tiers[1]) + pp('purple', 'Stretch', tiers[2])) +
            card('success', 'Done when', '<p style="margin: 0; font-weight: 800;">' + done + '</p>', 'margin-top: 8px;') +
            '<div style="margin-top: 8px;">' + sessionTimer(n, minutes) + '</div>',
            codeCard('info', 'Cheat sheet', file, code)
        ), notes);

// ---------- Don't / Do comparison ----------
const textBox = (file, src) =>
    '<div class="code-box">\n<div class="jb-editor-header"><div class="jb-editor-tab"><span class="jb-csharp-icon">TXT</span><span class="jb-filename">' + file + '</span></div><button class="code-copy-btn" onclick="copyCode(this)">Copy</button></div>\n<pre><code>' + esc(src.replace(/^\n/, '').replace(/\s+$/, '')) + '</code></pre></div>';
const ddSide = (kind, label, box, note) =>
    '<div class="dd-side">' + '<div class="dd-label ' + kind + '">' + label + '</div>' + box + '<div class="dd-note ' + kind + '">' + note + '</div></div>';
// Same example twice: messy on the left, corrected on the right. Stacks on narrow screens.
const dontDo = (bad, good, badNote, goodNote, o = {}) => {
    const box = o.plain ? textBox : codeBox;
    return '<div class="lab-grid-2col dd-grid">' + ddSide('bad', "Don't", box(o.badFile || 'Messy.cs', bad), badNote) + ddSide('good', 'Do', box(o.goodFile || 'Clean.cs', good), goodNote) + '</div>';
};
// Main-slide version: plain-words sentence, then a short Don't / Do pair (full pair stays in the deep dive).
const mainPair = (lead, bad, good, badNote, goodNote, o = {}) =>
    leadLine(lead) + (o.line ? '<p class="dd-line">' + o.line + '</p>' : '') + '<div class="dd-main">' + dontDo(bad, good, badNote, goodNote, o) + '</div>';
// ---------- slides ----------
const slidesData = [
  // 1 Hero
  {
    origImg: '',
    isHero: true,
    title: 'Dev - Lesson 10: Game Architecture 2: State Machines, Commands & Safe Refactoring',
    subtitle: 'Minor Game Design & Development • Hogeschool Rotterdam',
    topics: [
      '1. State machines, level up',
      '2. Interfaces and composition',
      '3. Command pattern: buffer, undo, replay',
      '4. Services instead of singletons',
      '5. Refactoring toolkit and safety net',
    ],
    notes: 'Welcome (1 min). Theory class for programmers: about 55 minutes of talk, four working sessions in your own project (15, 10, 15 and 12 minutes) and about 10 minutes buffer, 120 minutes in total. Keep your own project in mind and your laptop open for notes. Architecture 1 was about who talks to whom. Today is about how one thing is built inside, and how to change it without breaking it. Every team has a different 3D project, so every example is small and you decide where it fits. Timing so far: 1 min.',
    content: '',
  },

  // 2 Theme and recap (merged)
  slide('Arch 1 vs Arch 2: What You Already Have',
    leadLine('Arch 1 wired the rooms together. Arch 2 builds the furniture inside one room.') +
    split(
      card('primary', 'Arch 1: you have it', ul(['Prefab as an API.', 'Channels: Register, Unregister, Raise.', 'Additive scenes.'])) +
      card('success', 'Problem solving (1.8)', ul(['4 primitives.', 'DevWatch and breakpoints.', 'Read every diff.']), 'margin-top: 8px;') +
      card('info', 'Arch 2: built inside', '<p style="margin: 0; font-weight: 700;">State machines, interfaces, commands, services, safe refactoring.</p>', 'margin-top: 8px;'),
      codeCard('info', 'The channel API, once', 'VoidEventChannelSO.cs', CHANNEL_API)
    ) + deep('WHAT YOU WILL LEARN AND WHY', 'SIX BLOCKS', {
      more: deepSub('Recap: what you already have', {
      plain: P('An event channel is a small asset that carries a message. One script calls RaiseEvent when something happens. Any other script that called RegisterListener gets told. The sender and the listener never need to know each other.'),
      picture: P('A school bell. The bell does not know who is in which classroom. It rings, and everyone who is listening reacts. Teachers who left the school (UnregisterListener) are removed from the list so they are not called at home.'),
      problem: P('Without a channel, the enemy would hold a direct reference to the UI, the sound system and the score board, and call them one by one. Delete the UI and the enemy breaks.')
        + codeBox('Without channel', `
// The enemy knows too many others.
[SerializeField] private HealthBar _bar;
[SerializeField] private ScoreBoard _score;
private void Die() { _bar.Hide(); _score.Add(10); }`),
      walk: bl([
        '<strong>private Action _onEventRaised:</strong> a list of methods to call. It starts empty.',
        '<strong>RaiseEvent():</strong> calls every method on the list. The question mark means: do nothing if the list is empty.',
        '<strong>RegisterListener(listener):</strong> the plus equals adds your method. Do this in OnEnable.',
        '<strong>UnregisterListener(listener):</strong> the minus equals removes it again. Do this in OnDisable, with the exact same method.',
        '<strong>Our reuse today:</strong> a state machine can listen to a channel such as player spotted. DevWatch and conditional breakpoints from 1.8 help us see which state the enemy is in.',
      ]),
      why: P('Without Unregister, a destroyed object stays on the list and Unity throws errors the next time the event is raised. Today the state machines add more listeners, so this habit matters even more.'),
      mistake: P('Registering in Start but never unregistering, or registering a lambda that you cannot remove later. Always pair OnEnable with OnDisable and use a named method.'),
    }),
      plain: P('Architecture is how you split your code into parts and how those parts fit together. Arch 1 answered one question: how do separate parts talk to each other without knowing each other? Arch 2 answers a different one: how is one part built inside, and how do you change it later without breaking the game?'),
      picture: P('Think of a house. Arch 1 is the wiring and plumbing between rooms: which cable goes where. Arch 2 is the furniture inside one room: how the shelves are built so you can move them. Today you only rearrange furniture, you do not touch the wiring.'),
      problem: P('Every team has the same story. The first version of the enemy or the player works. Then the team adds patrol, attack, jump buffering, a grappling hook. Two weeks later one class has 600 lines, nobody dares to touch it, and a fix in one place breaks another.')
        + codeBox('Symptoms.txt', `
Enemy class:   8 bools, nobody knows which combinations are legal
Bullet class:  switch on the tag of every enemy type
Player class:  input, movement, camera and audio in one Update
Everywhere:    AudioManager.Instance.Play(...)`),
      walkLabel: 'Step by step: the five blocks',
      walk: bl([
        '<strong>Block 1, state machines:</strong> give every mode of the enemy its own small class, so flags stop piling up.',
        '<strong>Block 2, interfaces and composition:</strong> let a bullet hurt a crate, a player or a boss without knowing which one it hit.',
        '<strong>Block 3, commands:</strong> turn an action such as Jump into an object, so you can delay it, undo it or replay it.',
        '<strong>Block 4, services:</strong> make it visible what a class needs, instead of hiding it behind Instance.',
        '<strong>Block 5, refactoring and tests:</strong> change messy code in small steps with a safety net.',
        '<strong>Working sessions:</strong> after each of the first four blocks you get a short timed session to try the block on one class in your own project.',
      ]) + P('We follow two examples all lesson: the NavMesh enemy (Idle, Patrol, Chase, Attack) and the grappling player controller (PlayerController3D with CharacterController). Each block fixes one pain in one of them.'),
      why: P('Without a name for the symptom you reach for the wrong tool. Teams then add a pattern because it sounds professional, and the code gets heavier but not better. Knowing the symptom first means you only use a tool when it pays off.'),
      mistake: P('Treating every problem as a missing pattern. A pattern only helps when you can point at the exact symptom in your code that it fixes. If you cannot, leave the code alone.'),
      rule: P('Learn the symptom first, then the tool. The last slide is a table from need to tool.'),
    }),
    'Theme and recap (2 min). Do not re-teach. Arch 1 was who talks to whom, Arch 2 is how one thing is built inside and how to change it without breaking it. Point at the channel API once: Register in OnEnable, Unregister in OnDisable, RaiseEvent to broadcast. We reuse it today, and the DevWatch HUD and breakpoints from 1.8 are our debugging tools for state machines. Tell them there are four short working sessions in their own project, and the closing slide is a which tool when table. How to read the deck (teacher): each main slide is the short version, say it in one breath. The deep dive underneath is for when students look lost, it always goes plain words, everyday picture, the problem, the code walkthrough, why you need it, the common mistake. If students look blank, use the school bell picture. Timing so far: 3 min.'),

  // 3 Bool soup
  slide('Bool Soup: The NavMesh Enemy Must Do More',
    mainPair('A bool is a yes or no flag, and too many flags in one Update make a mess.', `
private bool _isPatrolling, _isChasing, _isAttacking;

private void Update()
{
    if (_isPatrolling) Patrol();
    if (_isChasing) Chase();
    if (_isAttacking) Attack();   // all three true?
}`, `
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
}`, 'Three flags can all be true.', 'One field, one state at a time.', { badFile: 'SimpleNPC.cs', goodFile: 'SimpleNPC.cs' }) + acc('[Code] Same problem: the player controller plus a grappling hook', codeBox('PlayerController3D.cs', PLAYER_SOUP)) + deep('BOOL SOUP', 'WHY IT BREAKS', {
      plain: P('A bool is a variable that is either true or false. If you use one bool per thing the object might be doing, every extra bool doubles the number of situations your code must handle. Most of those situations make no sense, but the computer does not know that.'),
      picture: P('Picture a traffic light with three separate switches: red, yellow, green. Nothing stops you from switching on red and green together. A real traffic light has one dial with three positions, so red and green can never be on together.'),
      problem: P('Our NavMesh enemy starts simple: it walks to the player every frame. Now the designer asks for patrol, attack and flee. The quick fix is one bool each. Three more bools are 8 combinations, most of them illegal, and nothing stops them.')
        + codeBox('SimpleNPC.cs (today)', SIMPLE_NPC) + codeBox('SimpleNPC.cs (grown)', `
private bool _isPatrolling, _isChasing, _isAttacking, _isFleeing;

private void Update()
{
    if (_isFleeing) { RunAway(); }
    if (_isChasing) { MoveToPlayer(); }
    if (_isAttacking) { Swing(); }   // and if _isChasing is also true?
}`) + P('Four bools are 16 situations. Which one wins if _isChasing and _isAttacking are both true? Nobody decided, so the bug depends on the order of lines.'),
      walk: bl([
        '<strong>The enemy:</strong> SimpleNPC calls SetDestination every frame. It has exactly one behaviour, so it is fine today.',
        '<strong>The player:</strong> PlayerController3D copies isGrounded from the CharacterController, then checks _isGrappling, _isJumping in an if chain.',
        '<strong>The last if:</strong> when the grapple is released on the ground, the jump flag may still be set. Is the player jumping or standing? The code has no answer.',
        '<strong>The pattern:</strong> every new feature adds a flag and an else-if. The chain gets longer and the order of lines starts to matter.',
      ]),
      why: P('In a team project four people edit the same Update. One adds a flag for a new feature, and the old branches do not know about it. The result is the bug that only appears when you grapple, jump and land in the same frame, and no one can reproduce it twice.'),
      mistake: P('Adding bool number four because the first three almost work. Each new flag multiplies the cases nobody tested. If two flags can never be true together, they are one variable with two values, not two bools.'),
      dd: dontDo(`
private bool _isPatrolling, _isChasing, _isAttacking;

private void Update()
{
    if (_isPatrolling) Patrol();
    if (_isChasing) Chase();
    if (_isAttacking) Attack();
    if (_isAttacking && _isChasing) _isPatrolling = false;
}`, `
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
}`, 'Three flags can all be true.', 'One field, one state at a time.', { badFile: 'SimpleNPC.cs', goodFile: 'SimpleNPC.cs' }),
      rule: P('If two flags can never be true together, replace them with one state.'),
    }),
    'Recap and poll (2 min): Show the simple NavMesh enemy most of you already have in your game. Lesson 1.7 only showed a simple version in its last slide, we did not build it in class. It calls SetDestination every frame and has no states. Ask: what happens when it must also patrol, attack and flee? Collect answers: flags pile up. Second example, same disease: the PlayerController3D with CharacterController, plus the grappling hook from lesson 1.8. Open the accordion: isGrounded, isJumping and isGrappling tangle in Update. Run the poll with hands: no state machine, enum plus switch, a class per state, Animator. Keep it quick, the fix starts in block 1. Timing so far: 5 min.'),

  // 4 Divider
  divider('1. State Machines, Level Up', 'From enum and switch to one class per state',
    'Give every mode its own class, then control how the machine switches between them.',
    ['IState and StateMachine', 'Guarded transitions', 'Logging and hierarchy', 'FSM, tree or utility'],
    'Block 1 (about 12 min of talk), then Working Session 1 (15 min). Lesson 1.2 showed GoombaState, an enum with a ChangeState method, in an expert accordion only. Today we go further, with the NavMesh enemy as the running example.'),

  // 5 One class per state (merged)
  slide('One Class Per State',
    leadLine('A state is one mode of the enemy, and each mode becomes a small class.') +
    '<p class="dd-line">The I in IState means interface: a contract.</p>' +
    '<p class="dd-line">Not an event channel: events announce news, states decide what to do.</p>' +
    split(
      card('primary', 'Leave the enum', ul(['Replace the big switch.', 'Each state owns Enter, Tick, Exit.', 'Only the machine changes state.'])),
      codeCard('info', 'The whole core', 'StateMachine.cs', STATE_CORE)
    ) + acc('[Code] PatrolState: one state in full', codeBox('PatrolState.cs', PATROL_STATE)) + acc('[Code] NpcBrain and ChaseState, so you can compile it', codeBox('NpcBrain.cs', NPC_BRAIN) + '<div style="height:8px"></div>' + codeBox('ChaseState.cs', CHASE_STATE)) + deep('STATE CLASSES', 'FSM CORE', {
      more: '<div class="lab-box-neutral" style="margin-top: 8px;">' + H('Naming note') + P('C# interface names start with a capital I: IState, IDamageable, ICommand, IAudioService. The I means interface, a contract. Arch 1 names like IntEventChannelSO start with Int for integer, not for interface.') + '</div>' + deepSub('A state is a small class: PatrolState', {
      plain: P('A state class is just a normal C# class, not a MonoBehaviour. It gets a reference to the NpcBrain, which is the Unity component that owns the NavMeshAgent. The state uses the brain to move the enemy and to ask questions such as: can I see the player?'),
      picture: P('Think of a guard with a clipboard for each job. The Patrol clipboard says: walk to waypoint 1, then 2, then 3. If you see the player, put this clipboard down and pick up the Chase clipboard. The guard never reads two clipboards at once.'),
      problem: P('In the old SimpleNPC the patrol code would sit in Update next to chase and attack. Entering patrol, walking and leaving all mix together.')
        + codeBox('Mixed in Update', `
if (_patrolling && !_chasing)
{
    if (!_agent.pathPending && _agent.remainingDistance < 0.5f)
        NextWaypoint();
}
if (_chasing) _agent.SetDestination(_player.position);`),
      walk: bl([
        '<strong>Constructor:</strong> PatrolState(NpcBrain npc) stores the brain once. States are made one time in Awake, so Update creates no garbage.',
        '<strong>Enter:</strong> pick the current waypoint and send the agent there. This runs once when Patrol becomes active.',
        '<strong>Tick, line 1:</strong> if the player is visible, switch to Chase and return. The state decides when to leave, the machine does the switching.',
        '<strong>Tick, next lines:</strong> if the path is still being calculated, or the agent is far from the waypoint, do nothing. When it arrives, move to the next waypoint with modulo, so the last one wraps to the first.',
        '<strong>Exit:</strong> ResetPath stops the agent. The next state starts from a clean agent.',
      ]) + P('The accordion on the slide has NpcBrain and ChaseState, so you can paste all three files into Unity and it compiles.'),
      why: P('The brain is the only class with Unity references (agent, waypoints, player). The states are plain classes, so a change to the waypoint logic never touches chase code. A teammate can add FleeState without reading PatrolState.'),
      mistake: P('Creating new state objects with new inside Update or inside Tick when switching. That allocates garbage every switch. Build all states once in Awake and reuse them.'),
    }),
      diff: P('<strong>State machine versus event channel (Arch 1).</strong> An event channel is an asset any script can raise or listen to. It says something happened, and the sender does not care who reacts. A state machine lives inside one object. It decides what that object does about the news and which changes are allowed.') + P('They work together. An event like OnPlayerSpotted is the input, and the state machine moves from Patrol to Chase. Use an event to tell many parts. Use a state machine to control one object\'s behavior.') + P('<strong>State machine versus coroutine.</strong> A coroutine is a one-off timed sequence: do A, wait, do B. A state can still start one inside itself. Coroutines were taught in lessons 1.2, 1.4 and 1.5.'),
      plain: P('A finite state machine (FSM) means the object is in exactly one mode at a time. A mode is called a state. Instead of flags, we keep one variable, Current, that points at the active state. Each state is a tiny class that knows what to do when it starts (Enter), every frame (Tick) and when it ends (Exit).'),
      picture: P('A board game piece stands on exactly one square. Each square is a class that knows what the piece does there and which squares it may reach next. The piece cannot stand on two squares at once, so there is no bool soup.'),
      problem: P('Before, the enemy was one Update with a growing if chain and one enum. Look at how the switch grows when you add Combat.')
        + codeBox('Before: enum and switch', `
private void Update()
{
    switch (_state)
    {
        case NpcState.Idle:   /* 15 lines */ break;
        case NpcState.Patrol: /* 25 lines */ break;
        case NpcState.Chase:  /* 20 lines */ break;
        case NpcState.Combat: /* 40 lines */ break;
    }
}`) + P('Four states already fill a screen. Entering and leaving code (set speed, reset path) ends up scattered through the cases.'),
      walk: bl([
        '<strong>IState:</strong> the contract of three methods. Every state class promises to have Enter, Tick and Exit.',
        '<strong>Current { get; private set; }:</strong> anyone can read the active state, only the machine can write it. This is the key rule.',
        '<strong>SetState(next):</strong> ignore null and ignore the same state. Then call Exit on the old state, store the new one, call Enter on it. Always in that order.',
        '<strong>Tick():</strong> the question mark means: if there is a state, run its Tick. Your MonoBehaviour calls this from Update.',
        '<strong>For our enemy:</strong> Idle, Patrol, Chase and Combat each become one file with about 20 lines.',
      ]),
      why: P('In a team, one person owns PatrolState and another owns ChaseState. They work in different files, so merges stay clean. Each file fits on one screen, so a new teammate can read the whole Chase behaviour in a minute.'),
      mistake: P('Letting states call each other directly, or reaching into the machine to poke Current. Then the switching rules are spread over many files and you are back to bool soup, just with more files.'),
      rule: P('Enter and Exit hold one-time work, Tick holds per-frame work, and the machine is the only place that changes Current.'),
    }),
    'State classes (4 min). Say what an FSM is in plain words: the object is in exactly one mode at a time, and each mode is a small class. Show IState and the short machine. Say the I line: the I in IState means interface, a contract. Say the not an event channel line: events announce news, states decide what to do; a coroutine is only a one-off timed sequence. Open the PatrolState accordion: Enter picks the waypoint, Tick checks the exit condition first, Exit cleans up the agent path. States are created once in Awake, so Update allocates nothing. Ask: where does the NPC from the last slide put its patrol code now? Use the board game square and guard clipboard pictures if students are stuck. Timing so far: 9 min.'),

  // 6 Guards
  slide('Rules for Transitions',
    mainPair('A transition is a switch from one state to another. A guard is a rule that blocks switches you never allowed. Each state answers one question: Allow(next), may I switch to this state? It returns true or false. The StateMachine asks it inside TrySetState before changing, and refuses the change on false.', `
// In any state
public bool Allow(IState next) => true;   // nothing is ever blocked`, `
// In PatrolState
public bool Allow(IState next) =>
    next is ChaseState || next is IdleState;`, 'Always true: nothing is checked.', 'Patrol may go to Chase or Idle, nothing else.', { badFile: 'AnyState.cs', goodFile: 'PatrolState.cs' }) +
    table(['From', 'May go to'], [['Patrol', 'Chase, Idle'], ['Chase', 'Combat, Patrol'], ['Combat', 'Chase, Idle']]) +
    '<p class="dd-line">Example: Patrol asks to go to Combat. Allow returns false, so the state stays Patrol.</p>' + acc('[Link] Arch 1 channels send requests, the machine accepts or rejects', codeBox('NpcBrain.cs', CHANNEL_REQUEST) + '<p style="margin: 8px 0 0 0;">A channel only says something happened or someone wants something. The state machine owns the decision. Spotted while Dead? The request is rejected and logged.</p>') +
    deep('GUARDS', 'TRANSITION DESIGN', {
      plain: P('A transition is the arrow from one state to another, for example Patrol to Chase. A guard is a check that says: this arrow is allowed, or it is not. Allow(next) is that check, written as a question each state answers: may I switch to this next state? It returns true for yes and false for no. TrySetState asks it before it changes anything.'),
      picture: P('A subway map. You can only ride the lines that are drawn on it. If someone asks for a ride from Patrol to Combat and there is no line, the ticket machine says no.'),
      problem: P('Without guards, every state decides alone where it may go. After a month the same rule lives in five places with slightly different conditions.')
        + codeBox('Rules copied into states', `
// In ChaseState:
if (_npc.IsDead) return;
// In PatrolState:
if (_npc.IsDead || _npc.IsStunned) return;
// In CombatState: forgot the stunned check, bug.`),
      walk: H('Way 1: each state answers Allow') + bl([
        '<strong>IGuardedState:</strong> a small extra contract on top of IState. A state that has rules also promises one more method, Allow(next).',
        '<strong>Allow(next):</strong> next is the state we want to go to. The state returns true if that arrow is allowed and false if not. The "is" pattern asks: is next a ChaseState? Anything not listed falls through to false.',
        '<strong>Filled in correctly:</strong> Patrol allows Chase and Idle and nothing else. Chase allows Combat and Patrol. Combat allows Chase and Idle, but not Patrol directly.' + codeBox('GuardedStates.cs', GUARD_STATES),
        '<strong>TrySetState:</strong> asks the current state first. If Allow says false, TrySetState returns false and nothing changes. If it says true, it calls the normal SetState.' + codeBox('StateMachine.cs', GUARD_TRY),
        '<strong>Trace:</strong> the state is Patrol and something asks for Combat. TrySetState calls Patrol.Allow(Combat). Patrol only lists Chase and Idle, so it returns false. TrySetState returns false and the state stays Patrol. Now ask for Chase: Allow returns true, SetState runs, and Chase.Enter is called.',
      ]) + H('Way 2: one central table in the StateMachine') + bl([
        '<strong>_allowed:</strong> a set of pairs (from, to), filled once in NpcBrain.Awake. Allow(from, to) adds one arrow, and TrySetState looks the pair up. This Allow has two parameters and registers an arrow. The one in Way 1 has one parameter and answers a question.' + codeBox('StateMachine.cs', GUARD_CODE),
        '<strong>The channel link:</strong> a player spotted channel calls HandleSpotted, which calls TrySetState(Chase). If the enemy is Dead the request is refused and logged. The listener never changes state directly.',
        '<strong>Which one:</strong> use Way 1 when each state has its own rules or needs a check such as health. Use Way 2 when you want every arrow on one list you can read at a glance.',
      ]) + P('Some arrows, such as any state to Dead, are always legal. Those call SetState on purpose.'),
      why: P('When a teammate adds Stunned, they add two Allow lines and the machine does the rest. Without guards, a stun that arrives during Attack is handled differently in every state, and the enemy ends up stunned and attacking at once.'),
      mistake: P('Writing Allow that always returns true "to get it working". Nothing is checked, and the bool soup is back. Also: using TrySetState everywhere and then wondering why Dead never happens. Dead is not on the list. Death should call SetState directly because every state may reach it.'),
      dd: dontDo(`
// In PatrolState
public bool Allow(IState next) => true;   // nothing is ever blocked`, `
// In PatrolState
public bool Allow(IState next) =>
    next is ChaseState || next is IdleState;`, 'Always true: Patrol may go anywhere, even Dead.', 'A short list: everything else is refused.', { badFile: 'PatrolState.cs', goodFile: 'PatrolState.cs' }),
      more: '<div class="lab-box-trap" style="margin-top: 8px;">' + H("Another mistake: states poke each other's flags") + dontDo(`
// In PatrolState.Tick
if (_npc.CanSeePlayer)
{
    _npc.IsPatrolling = false;
    _npc.IsChasing = true;
}

// In DeadState.Tick: nobody checks this
_npc.IsChasing = true;`, `
// Once, in NpcBrain.Awake
Machine.Allow(Patrol, Chase);
Machine.Allow(Chase, Patrol);

// In PatrolState.Tick
if (_npc.CanSeePlayer)
    _npc.Machine.TrySetState(_npc.Chase);

// Dead has no Allow line, so it stays Dead.`, 'States poke each other\'s variables.', 'One guarded method owns every switch.', { badFile: 'States.cs', goodFile: 'NpcBrain.cs' }) + '</div>',
      rule: P('A guard is a yes or no question. Allow(next) answers it, and TrySetState refuses on no. States ask, the machine decides.'),
    }),
    'Transition rules (3 min): Bool soup allowed illegal combinations. Guards make illegal arrows impossible. Say what Allow is: a question each state answers, may I switch to this state, true or false. TrySetState asks it before changing and refuses on false. Show the Don\'t: always true checks nothing. Show the Do: Patrol allows Chase and Idle. Trace one call: Patrol asks for Combat, Allow returns false, state stays Patrol. Mention the two ways to fill it in: per-state Allow, or one central table. Then the short link to Arch 1: an event channel can carry a request such as player spotted, and the machine accepts or rejects it. If students look lost, use the subway map picture. Timing so far: 12 min.'),

  // 7 Logging
  slide('Log Every Transition',
    mainPair('When the enemy does something strange, a log of its last switches tells you why. A tick box in the Inspector switches the log on or off, and the log only runs when a switch happens, never in Tick.', `
// PatrolState
_npc.State = StateId.Chase;
// ChaseState
_npc.State = StateId.Patrol;
// HitReaction
_npc.State = StateId.Stunned;
// Who changed it? No log, no one place.`, `
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
}`, 'Assignments everywhere, nothing logged.', 'One door in, one log line.', { badFile: 'Scattered.cs', goodFile: 'StateMachine.cs' }) + deep('DEBUGGING FSMS', 'REUSE 1.8', {
      plain: P('Because every state change goes through one method, SetState, you can put your debugging in that one method. One log line, one DevWatch value and one breakpoint then see every change of every state.'),
      picture: P('A black box recorder on a plane. When something odd happens, you do not guess. You read the last things the plane did, in order.'),
      problem: P('The enemy stands still in the middle of the room. Is it in Patrol with a broken path, or in Idle forever? Without a log you add Debug.Log to every state and delete them again.')
        + codeBox('Logging in every state', `
// PatrolState.Enter:  Debug.Log("patrol");
// ChaseState.Enter:   Debug.Log("chase");
// CombatState.Enter:  Debug.Log("combat");
// ...and you forget one. Then the log lies.`),
      walk: bl([
        '<strong>LogTransitions:</strong> a public bool on the StateMachine. The StateMachine is not a MonoBehaviour, so it has no Inspector of its own. The owner script, NpcBrain, has a serialized bool _logTransitions and copies it in Awake:' + codeBox('NpcBrain.cs', LOG_OWNER) + 'You switch logging on and off with a tick box, without editing code. Keep it off in the final build: building a log string on every switch allocates memory.',
        '<strong>The four tools:</strong> LOG one line per switch, WATCH with DevWatch, BREAK with a breakpoint inside SetState, STACK with the call stack that shows who asked. The full method:' + codeBox('StateMachine.cs', SETSTATE_LOG),
        '<strong>from:</strong> the name of the old state, or none for the very first state. The question marks protect against null.',
        '<strong>Debug.Log with Owner:</strong> the second argument makes the Console line clickable. One click highlights the enemy in the Hierarchy.',
        '<strong>DevWatch.Set:</strong> the DevWatch HUD from lesson 1.8 shows the current state name on screen while you play.',
        '<strong>The breakpoint on Exit:</strong> make it conditional, for example next.GetType().Name == "ChaseState". When it stops, open the call stack to see which line asked for the switch.',
      ]),
      why: P('Your teammate says the enemy does not chase. You do not argue. You open the Console and read: Patrol -> Chase, then Chase -> Patrol one frame later. Now you know the bug is the sight check, not the chase code.'),
      mistake: P('Logging inside every state. You miss one, and the log lies. Log once in SetState so every transition is covered.'),
      dd: dontDo(`
// PatrolState
_npc.State = StateId.Chase;
// ChaseState
_npc.State = StateId.Patrol;
// HitReaction
_npc.State = StateId.Stunned;
// Who changed it? No log, no one place.`, `
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
}`, 'Assignments everywhere, nothing logged.', 'One door in, one log line.', { badFile: 'Scattered.cs', goodFile: 'StateMachine.cs' }),
      rule: P('All state changes go through one method, so one breakpoint, one log line and one DevWatch key see everything.'),
    }),
    'Logging (2 min): Show the final SetState. The LogTransitions bool is an Inspector tick box, so logging is switched off without editing code, and it stays off in the final build. The owner object makes the Console line clickable. Log only when a switch happens, never in Tick. Demo in words: breakpoint on Exit, conditional on the next state, call stack shows the caller. This is the lesson 1.8 workflow applied to a state machine. Timing so far: 14 min.'),

  // 8 Hierarchical
  slide('States Inside States',
    leadLine('Idle and Walk both allow jumping. Write the jump rule once, in Grounded, and let the brain call it all.') +
    split(
      card('primary', 'Who calls whom, every frame', olist([
        code('NpcBrain.Update') + ' calls ' + code('_machine.Tick()') + '.',
        'The machine calls ' + code('Current.Tick()') + ', here ' + code('WalkState.Tick') + '.',
        code('WalkState.Tick') + ' calls ' + code('base.Tick()') + ' first: GroundedState runs the shared jump rule.',
        'Then WalkState runs its own walk code.',
      ]) + '<p style="margin: 8px 0 0 0; font-weight: 700;">Start: the brain calls ' + code('_machine.TrySetState(Idle)') + ' once. Change: a state asks ' + code('Npc.Machine.TrySetState(Npc.Walk)') + '.</p>') +
      codeCard('info', 'The brain starts it', 'NpcBrain.cs', GROUNDED_BRAIN),
      codeCard('info', 'One parent, two children', 'GroundedState.cs', GROUNDED_STATE)
    ) + deep('HIERARCHICAL STATES', 'GROUPING', {
      plain: P('Hierarchical means in layers. A parent state holds the behavior that several states share. The children inherit it and only write what is different. The brain never calls a child by name. It only calls the machine, and the machine calls whichever state is Current.'),
      picture: P('Folders on your computer. The shared file lives in the parent folder once, and the sub folders only hold their own files.'),
      problem: P('Without a parent, Idle and Walk each carry their own copy of the jump rule. Add Crouch and you copy it a third time. Change the jump key and you must find every copy.')
        + codeBox('Rule copied to each state', `
// IdleState.Tick:  if (jump pressed) Motor.Jump();
// WalkState.Tick:  if (jump pressed) Motor.Jump();
// CrouchState.Tick: forgot it, bug.`),
      walkLabel: 'One frame, step by step',
      walk: bl([
        '<strong>Awake, once:</strong> the brain builds the machine and makes both states with new IdleState(this) and new WalkState(this). It lists the allowed arrows with Allow.',
        '<strong>Start, once:</strong> _machine.TrySetState(Idle). The machine has no Current yet, so it just runs Idle.Enter and stores Idle.',
        '<strong>Update, every frame:</strong> NpcBrain.Update calls _machine.Tick(). That is the only line the brain needs.',
        '<strong>The machine:</strong> Tick is Current?.Tick(). Current is IdleState, so IdleState.Tick runs.',
        '<strong>IdleState.Tick, line 1:</strong> base.Tick() runs GroundedState.Tick, the shared jump rule. Space pressed this frame? Then Motor.Jump().',
        '<strong>IdleState.Tick, line 2:</strong> its own part. If the brain says CanSeePlayer, ask Npc.Machine.TrySetState(Npc.Walk). Allow says yes, so Idle.Exit runs, then Walk.Enter.',
        '<strong>Next frame:</strong> Current is WalkState. The machine calls WalkState.Tick: base.Tick() first (the same jump rule, not copied), then Motor.Move(Vector3.forward).',
        '<strong>The parent class:</strong> abstract means you never make a GroundedState itself. It keeps the IState contract, so the machine accepts every child. The constructor stores the brain once, and Enter, Exit and Tick are virtual so a child can override them.',
      ]),
      more: '<div class="lab-box-neutral" style="margin-top: 8px;">' + H('Two ways to nest states') + table(['', 'Way 1: inheritance', 'Way 2: a child machine'], [['Idea', 'A parent class holds the shared code. Children call base.Tick().', 'A big state owns a small StateMachine and forwards Tick to it.'], ['Brain sees', 'Idle and Walk, as normal states.', 'Combat, as one normal state.'], ['Use it when', 'Several states share a rule (jump, gravity).', 'One state has its own sub-modes (Approach, Attack).']]) + H('Way 2 in full: Combat with its own machine') + P('Combat is one state for the outer machine. Inside it, a small machine switches between Approach and Attack. The parent calls the child machine Tick, the same way the brain calls its machine.') + codeBox('CombatState.cs', COMBAT_STATE) + bl([
        '<strong>Constructor:</strong> CombatState builds its own StateMachine and two child states, ApproachState and AttackState. They are made once.',
        '<strong>Allow lines:</strong> inside Combat, Approach and Attack may switch to each other. The outer machine knows nothing about this.',
        '<strong>Enter:</strong> when Combat starts, the child machine starts in Approach.',
        '<strong>Tick:</strong> the parent just forwards. Combat.Tick calls the child machine Tick.',
        '<strong>Exit:</strong> the parent stops its child. For this add Stop() to StateMachine: it calls Current.Exit() and sets Current to null, so the child shuts down cleanly.',
      ]) + P('Now the Stunned rule is written once on Combat. The children never hear about it.') + '</div>' +
      deepSub('When an FSM stops fitting', {
      plain: P('A behavior tree is a list of tasks that is checked from the top every frame: do the first one that can run. Utility AI gives every possible action a score and picks the highest. Both are other ways to decide what an NPC does next. We only compare them today and write no code.'),
      picture: P('An FSM is a map with fixed roads. A behavior tree is a checklist you read from the top every morning: if sick, stay home; else if meeting, go; else study. Utility AI is a person weighing wants: hunger 70, tired 40, homework 55. The biggest number wins.'),
      problem: P('The designer wants the enemy to flee when health is low, from any mode, and to attack when the player is near, but not while fleeing. In an FSM the number of arrows grows fast.')
        + codeBox('Arrow count', `
4 states   ->  up to 12 arrows
8 states   ->  up to 56 arrows
12 states  ->  up to 132 arrows   (nobody can draw this)`),
      walkLabel: 'Step by step: how to decide',
      walk: bl([
        '<strong>Step 1:</strong> keep the FSM. Most game objects need three to six states, and a clean FSM is enough.',
        '<strong>Step 2:</strong> notice the pain. Is the same transition pasted in many states? Do you keep adding arrows to Dead or Stunned? Those are the signs (more than about 8 states is another one).',
        '<strong>Step 3, ordered priorities:</strong> if the pain is a list like flee, then attack, then patrol, use a behavior tree. It is checked top down: Selector, 1. Flee if health is low, 2. Attack if the target is near, 3. Patrol. Unity has a Behavior package, and many teams write a tiny tree of their own.',
        '<strong>Step 4, competing wants:</strong> if the enemy must weigh many things smoothly, such as hunger against danger, use utility AI: score every action, take the highest.',
        '<strong>Step 5:</strong> switch one enemy first, not the whole game.',
      ]),
      why: P('A sound choice saves weeks. If a team builds a full behavior tree for a crate that opens and closes, they waste a sprint. If they stack twelve states into one flat FSM for a boss, they lose a sprint in debugging.'),
      mistake: P('Switching technique because FSM feels old. A state machine is not outdated. It is the simplest tool and works for most things.'),
      rule: P('Move only when the arrows hurt. Animator state machines (the boxes and arrows for animation clips) are next class.'),
    }),
      why: P('As the enemy grows to ten behaviours, a flat machine has arrows and copied rules everywhere. With layers, a teammate who works on Attack only edits the Combat folder and cannot break Patrol. The brain stays tiny, because it only starts the machine and ticks it.'),
      mistake: P('Forgetting base.Tick() in a child. The child overrides Tick, writes only its own code, and the shared rule silently stops working in that one state: jumping works in Idle but not in Walk. Make base.Tick() the first line of every child Tick. A second mistake: forgetting to stop a child machine when its parent exits. The child keeps its last state, and next time you enter Combat it starts in Attack instead of Approach.'),
      rule: P('Write a shared rule once, in the parent. The parent handles the rule, the children handle the details. The brain only starts the machine and calls Tick.'),
    }),
    'Hierarchy (2 min): Read the lead line. Walk the numbered trace on the left, pointing at the code: the brain calls _machine.Tick, the machine calls Current.Tick which is WalkState.Tick, WalkState calls base.Tick first for the shared jump rule, then runs its own walk code. Show where the brain starts it: Start calls TrySetState(Idle) once. Show how a state asks for a change: Npc.Machine.TrySetState. Common mistake: forgetting base.Tick(). Open the deep dive only for the second way to nest (a state that owns a child machine) and the one line on behavior trees and utility AI. Animator state machines come next class. Timing so far: 16 min.'),

  // 9 Putting it together: the whole NPC
  slide('Putting It Together: The Whole NPC',
    leadLine('One script, NpcBrain, is attached to the GameObject. It creates the plain classes and calls them.') +
    split(
      treeBox('Assets/Scripts/Npc/', [[0, 'NpcBrain.cs', 'MonoBehaviour: attach this one', 'mono'], [0, 'IState.cs', 'plain C# class', 'plain'], [0, 'StateMachine.cs', 'plain C# class', 'plain'], [0, 'PatrolState.cs', 'plain C# class', 'plain'], [0, 'ChaseState.cs', 'plain C# class', 'plain']]) +
      '<div style="height: 8px;"></div>' +
      flow('Who calls whom', [
        [['Unity', 'purple'], ['NpcBrain.Update', 'green'], ['StateMachine.Tick', 'blue'], ['Current.Tick', 'blue'], ['NpcBrain / Agent', 'green']],
        [['Event channel', 'amber'], ['NpcBrain.HandleSpotted', 'green'], ['machine.TrySetState', 'blue']],
      ]),
      codeCard('info', 'The star: the complete brain', 'NpcBrain.cs', NPC_FULL)
    ) + deep('PUTTING IT TOGETHER', 'NPC ASSEMBLY', {
      plain: P('Until now you saw one class at a time. A real enemy needs one place where Unity meets all of them. That place is NpcBrain, the only MonoBehaviour. Unity calls its Awake, Start and Update. NpcBrain makes the state classes with new, passes itself into each one, and calls the machine. Everything else is a plain C# class.'),
      picture: P('A conductor in front of an orchestra. The conductor makes no sound, but every musician follows the conductor. NpcBrain makes no decisions, but it starts the machine and gives every state a way to reach the agent.'),
      problem: P('A student writes IState, StateMachine, PatrolState and ChaseState, drags PatrolState.cs onto the enemy, and nothing happens. A plain class cannot be attached, and nothing calls Tick.')
        + codeBox('Nobody calls the machine', `
// All four classes compile. The enemy stands still:
// no MonoBehaviour creates the machine, and nobody calls Tick.`),
      walkLabel: 'From scene start to the first chase',
      walk: bl([
        '<strong>Awake:</strong> grab the NavMeshAgent, build the machine (the Inspector bool _logTransitions goes in), make PatrolState and ChaseState with new and pass this, then list the allowed arrows: Patrol to Chase and back.',
        '<strong>Why this:</strong> each state gets the brain in its constructor. That is how a state reaches Agent, Waypoints, Player, CanSeePlayer and Machine, as on the One Class Per State slide.',
        '<strong>OnEnable and OnDisable:</strong> the Arch 1 channel _onPlayerSpotted calls HandleSpotted. Subscribe in OnEnable, unsubscribe in OnDisable, with the same method.',
        '<strong>Start:</strong> TrySetState(Patrol) starts the first state. PatrolState.Enter sends the agent to a waypoint.',
        '<strong>Update:</strong> _machine.Tick() runs Current.Tick(). This is the only line that runs every frame in the brain.',
        '<strong>A change, way 1:</strong> PatrolState.Tick sees the player and asks the machine to switch to Chase. Exit and Enter run in order, and the log prints one line.',
        '<strong>A change, way 2:</strong> the channel is raised, HandleSpotted runs, and it calls _machine.TrySetState(Chase). The guard decides: Patrol to Chase is on the list, so it goes through.',
        '<strong>Note:</strong> this is the NpcBrain from the One Class Per State slide plus the parts from the next slides: guards, the log bool and the channel.',
      ]),
      why: P('Because the brain is the only MonoBehaviour, there is one place to read, one place to put a breakpoint and one script to drag onto a prefab. A teammate can add FleeState without touching Unity components.'),
      mistake: P('Attaching state classes to the GameObject, or giving every state its own Update. States are plain classes. They get Tick from the machine, and the machine gets Tick from the brain. Also: forgetting OnDisable, so a destroyed enemy still hears the channel.'),
      rule: P('One MonoBehaviour owns the machine and the states. States are plain classes that reach Unity only through the brain.'),
    }),
    'Putting it together, state machines (2 min): Say the lead line. Point at the tree: only NpcBrain is attached, the other four files are plain C# classes. Walk the flow: Unity calls Update, the brain calls the machine Tick, the machine calls the Current state Tick, and the state uses the brain to reach the agent. Second row: the Arch 1 channel calls HandleSpotted, which asks the machine to switch. Read the brain top to bottom: fields, Awake builds, OnEnable and OnDisable subscribe, Start sets the first state, Update ticks. Timing so far: 18 min.'),

  // 10 Working Session 1
  session(1, 'Give a Class States', 15,
    'Pick one class in your project with 3 or more flags.',
    ['List the states hidden in the flags.', 'Move two states into IState classes.', 'Add TrySetState and log each switch.'],
    'Current shows one state, and every switch is logged.',
    'StateMachine.cs', SESS1_CODE,
    'Working Session 1 (15 min). Start the timer and say: pick ONE class in YOUR project with 3 or more bool flags. Starter: write down the states the flags hide, and which combinations should never happen. Standard: write IState, a small StateMachine and two state classes. Stretch: add an allowed list with TrySetState and one log line in SetState. Walking around, look for: states written as MonoBehaviours (they should be plain classes), Current set from outside the machine, new state objects created in Update, a class whose flags never combine (then it needs no machine). Last 2 minutes: ask one table to show the Console with the logged switches. Timing so far: 33 min.'),

  // 11 Divider
  divider('2. Contracts and Commands', 'Small contracts, small components, actions as objects',
    'Build things from small parts that agree on a contract, and turn input into objects.',
    ['IDamageable and IInteractable', 'Composition over class trees', 'Commands and input buffer', 'Undo and replay'],
    'Block 2 (about 13 min), Working Session 2 (10 min), block 3 (about 12 min), Working Session 3 (15 min).'),

  // 12 Interfaces
  slide('Interfaces: A Small Contract',
    mainPair('An interface is a short list of methods that a class promises to have, so others can use it without knowing its type.', `
private void OnTriggerEnter(Collider other)
{
    var target = other.GetComponent<MonoBehaviour>();
    if (target is Player player) player.LoseHealth(_damage);
    else if (target is Crate crate) crate.Break();
    else if (target is Boss boss) boss.ReduceArmor(_damage);
    Destroy(gameObject);
}`, `
public interface IDamageable { void TakeDamage(int amount); }

public class Bullet : MonoBehaviour
{
    [SerializeField] private int _damage = 10;

    private void OnTriggerEnter(Collider other)
    {
        if (other.TryGetComponent(out IDamageable target))
            target.TakeDamage(_damage);
        Destroy(gameObject);
    }
}`, 'Every new target edits the bullet.', 'The bullet only knows TakeDamage.', { badFile: 'Bullet.cs', goodFile: 'Bullet.cs', line: 'Not the same as an event channel: an interface calls one known target.' }) + deep('INTERFACES', 'CONTRACTS', {
      diff: P('<strong>Interface versus event channel.</strong> An interface is a direct call to one known target. An event is a broadcast, and the sender does not know who hears it.') + P('Use an interface to hit one thing and get a reaction from it. Use an event when many parts react. They fit together: Health implements IDamageable and also raises an event channel, so the UI can react without knowing the owner. Events were taught in lessons 1.2, 1.3 and 1.4, event channel assets in 1.4.'),
      plain: P('An interface lists methods without any code inside. A class that writes colon IDamageable promises to provide those methods. Code that holds an IDamageable can call TakeDamage and does not care if the object is a player, a crate or a boss.'),
      picture: P('A wall socket. The lamp does not care what is behind the wall: a power plant or a battery. It only needs the plug to fit.'),
      problem: P('Our bullet hits the NavMesh enemy, the player, a crate and the boss. Without a contract the bullet checks the type of everything it hits.')
        + codeBox('Bullet with type checks', `
private void OnTriggerEnter(Collider other)
{
    switch (other.tag)
    {
        case "Enemy":  other.GetComponent<EnemyHealth>().Hit(_damage); break;
        case "Player": other.GetComponent<PlayerHealth>().Lose(_damage); break;
        case "Crate":  other.GetComponent<Crate>().Break(); break;
    }
}`) + P('Add a Boss and a Turret and you must edit the bullet again. Every new target touches the bullet.'),
      walk: bl([
        '<strong>interface IDamageable:</strong> one method, TakeDamage(int amount). No body, only the promise. Player, Crate and Boss implement it, and the bullet never learns their types. The full listing:' + codeBox('Bullet.cs', IDAMAGEABLE),
        '<strong>class Health : IDamageable:</strong> the class writes the real body. The Player, the crate and the boss can all have a Health component.',
        '<strong>Bullet.OnTriggerEnter:</strong> TryGetComponent asks the object: do you have something that is an IDamageable? If yes, it gives it to us in target.',
        '<strong>target.TakeDamage(_damage):</strong> the call works the same for any target.',
        '<strong>Destroy(gameObject):</strong> the bullet disappears after the hit, whether it found a target or not.',
      ]) + P('IInteractable follows the same idea for doors, levers and pickups: one method such as Interact().'),
      why: P('In a team, one person builds the bullet and another builds the new Boss. They do not need to talk. The boss implements IDamageable and bullets just work. No one edits the bullet file, so there is no merge conflict.'),
      mistake: P('One giant interface with twelve methods. Every class must fake the ones it does not need. Keep a contract to one job and one to three methods.'),
      dd: dontDo(`
private void OnTriggerEnter(Collider other)
{
    var target = other.GetComponent<MonoBehaviour>();
    if (target is Player player) player.LoseHealth(_damage);
    else if (target is Crate crate) crate.Break();
    else if (target is Boss boss) boss.ReduceArmor(_damage);
    Destroy(gameObject);
}`, `
private void OnTriggerEnter(Collider other)
{
    if (other.TryGetComponent(out IDamageable target))
        target.TakeDamage(_damage);
    Destroy(gameObject);
}`, 'Every new target edits the bullet.', 'The bullet only knows TakeDamage.', { badFile: 'Bullet.cs', goodFile: 'Bullet.cs' }),
      rule: P('Name an interface after the ability: IDamageable, IInteractable. If your bullet has a switch on tag, that is the symptom this fixes.'),
    }),
    'Interfaces (4 min): Start with plain words. A contract is a list of methods someone promises to have. The bullet asks: can you take damage? and does not care who answers. Ask: what is in your project with a type check or tag switch? Likely candidates: damage, pickups, interactions. Link to the Arch 1 black box prefab: the root script is the public face. Use the wall socket picture. Say the not the same as line: an interface is a direct call to one target, an event is a broadcast. Timing so far: 37 min.'),

  // 14 Component 1: a box of components
  slide('A GameObject Is a Box of Components',
    leadLine('A GameObject is an empty box. Each component you put in the box gives it one job.') +
    split(
      inspector([['SampleScene', 0, 0], ['Main Camera', 0, 1], ['Ground', 0, 1], ['Enemy', 1, 1]], 'Enemy', [
        { name: 'Transform', fields: [['Position', '0, 0, 0'], ['Scale', '1, 1, 1']] },
        { name: 'Health', script: true, fields: [['Max', '100']] },
        { name: 'Mover', script: true, fields: [['Speed', '3'], ['Flies', '&#9744;']] },
        { name: 'Attack', script: true, fields: [['Damage', '10']] },
      ]),
      card('primary', 'Where do scripts go?', ul([
        'A script is a file in Assets/Scripts.',
        'The file name must match the class name: Health.cs holds class Health.',
        'Attach it: drag the file onto the GameObject, or press Add Component.',
        'One GameObject holds many scripts. Each does one job.',
      ]))
    ) + deep('GAMEOBJECT AND COMPONENTS', 'THE BOX', {
      plain: P('Everything in your scene is a GameObject. On its own it only has a Transform: a position, a rotation and a size. Everything else is a component you add. Health, Mover and Attack are components you write yourself, as scripts. The Inspector shows them as boxes with the public and [SerializeField] fields you can edit.'),
      picture: P('A lunch box with compartments. The box is the GameObject. Each compartment is a component with one job. You add or remove a compartment without rebuilding the box.'),
      problem: P('A beginner writes one script, Enemy.cs, that holds health, movement, attack, loot and sound. It grows to hundreds of lines, and a crate that only needs health cannot reuse any of it.')
        + codeBox('One script that does everything', `
public class Enemy : MonoBehaviour
{
    public int Health = 100;
    public float Speed = 3f;
    public int Damage = 10;
    private void Update() { /* walk, attack, drop loot, play sound... */ }
}`),
      walk: bl([
        '<strong>Make the script:</strong> in the Project window open Assets/Scripts, right click, Create, Scripting, MonoBehaviour Script (the menu name differs a little per Unity version). Type the name Health.',
        '<strong>File name equals class name:</strong> Health.cs must contain public class Health. Unity uses the file name to find the class.',
        '<strong>Attach it:</strong> drag Health.cs from the Project window onto the Enemy in the Hierarchy, or select Enemy, press Add Component in the Inspector and type Health.',
        '<strong>Many scripts, one job each:</strong> the mock shows Health, Mover and Attack on the same Enemy. Each file stays short, and each can be reused on another prefab.',
        '<strong>Fields in the Inspector:</strong> a [SerializeField] private field shows up as a box. A designer changes Max or Speed per prefab without touching the code.',
      ]),
      why: P('A team of four works in four files instead of one. The crate takes Health only. The boss takes Health, Mover and Attack. Nobody waits for a merge in Enemy.cs.'),
      mistake: P('A file name that differs from the class name (Health.cs holding class Hp). Unity cannot attach it. Also: writing a script and forgetting to attach it. A script that is not on a GameObject does nothing.'),
      rule: P('One script, one job. Attach as many scripts as the object needs.'),
    }),
    'Components 1 (2 min): Read the lead line. Point at the mock: Hierarchy on the left, Inspector on the right, and the Enemy GameObject with Transform plus three scripts. Say where scripts go: a file in Assets/Scripts, the file name matches the class name, drag it on or press Add Component, many scripts per object. Ask: how many scripts sit on your player? Timing so far: 39 min.'),

  // 15 Component 2: MonoBehaviour
  slide('What Is a MonoBehaviour?',
    leadLine('A MonoBehaviour is the Unity base class that lets your script sit on a GameObject.') +
    split(
      chain([['UnityEngine.Object', 'name, Destroy, Instantiate'], ['Component', 'transform, gameObject, GetComponent'], ['Behaviour', 'the enabled tick box'], ['MonoBehaviour', 'Awake, Start, Update, StartCoroutine'], ['Health (your script)', 'your fields and your methods']]),
      table(['', 'On a GameObject?', 'What it is'], [['MonoBehaviour', 'Yes', 'Unity\'s base class. You inherit it.'], ['Plain C# class', 'No', 'A normal class, made with new: StateMachine, PatrolState.'], ['Interface', 'No', 'A contract any class can sign: IDamageable.']]) +
      '<div style="height: 8px;"></div>' + codeBox('Health.cs', PLAIN_VS_MONO)
    ) + deep('MONOBEHAVIOUR', 'THE BASE CLASS', {
      plain: P('When you write class Health : MonoBehaviour, you say: my class is built on top of Unity\'s MonoBehaviour. Unity wrote that class, so it comes from Unity and not from you. Because of it, the Inspector accepts your file as something to attach.'),
      picture: P('A car chassis. Unity builds the chassis: wheels, engine mount, key slot. You build the body on top. Without the chassis your body cannot be driven. A plain class is a body without a chassis, and an interface is a list of features the body promises to have.'),
      problem: P('A student writes Health as a plain class and drags the file onto the Enemy. Unity refuses and says the script needs to derive from MonoBehaviour.')
        + codeBox('A plain class cannot be attached', `
public class Health            // no : MonoBehaviour
{
    public int Max = 100;
}`),
      walk: bl([
        '<strong>UnityEngine.Object:</strong> the base of everything Unity can hold. It gives you name and the Destroy and Instantiate methods.',
        '<strong>Component:</strong> something that sits on a GameObject. It gives you transform, gameObject and GetComponent.',
        '<strong>Behaviour:</strong> a component that can be switched on and off. It gives you the enabled tick box in the Inspector.',
        '<strong>MonoBehaviour:</strong> a component with a script. It gives you StartCoroutine and Invoke. Unity also looks for methods named Awake, Start and Update on your class and calls them. They are not methods you must override, you just write them with those names.',
        '<strong>Your script:</strong> Health adds your own fields and methods at the bottom of the chain.',
        '<strong>MonoBehaviour versus plain class:</strong> a plain class has no transform and no Update, and it cannot be attached. That is why PatrolState and StateMachine are plain classes: the brain makes them with new and calls them.',
        '<strong>MonoBehaviour versus interface:</strong> a class has one base class, so only one MonoBehaviour. It can sign many interfaces: Health : MonoBehaviour, IDamageable. An interface carries no code. It is a contract.',
      ]),
      why: P('You need to know what comes free and what does not. If the class is on a GameObject, you may use transform and GetComponent. If it is a plain class, you must pass in what it needs, as the states do with the brain.'),
      mistake: P('Writing new Health() for a MonoBehaviour. Unity warns, and the object is not on any GameObject. Use Add Component, or AddComponent in code. Also: making every class a MonoBehaviour by habit. A state or a command has no need for Update.'),
      rule: P('Attach a MonoBehaviour. Create a plain class with new. Sign an interface to make a promise.'),
    }),
    'Components 2 (2 min): Read the lead line. Walk the chain from the top: Object, Component, Behaviour, MonoBehaviour, your script, and what each level adds. Awake, Start and Update are names Unity looks for. Compare the table: only a MonoBehaviour sits on a GameObject, a plain class is made with new, an interface is a contract. Point at the code card: one base class, any number of interfaces. Timing so far: 41 min.'),

  // 16 Component 3: parts that work together
  slide('Parts That Work Together',
    mainPair('Make the root script thin: it owns the parts and only coordinates them. RequireComponent adds the parts, and GetComponent in Awake keeps them in fields.', CLASS_TREE, ROOT_PARTS, 'Every new mix needs a new subclass.', 'Mix parts on one object.', { badFile: 'EnemyTree.cs', goodFile: 'NpcBrain.cs', line: 'Mover with a bool _flies is okay because it is config, not state.' }) +
    acc('[Code] Health : MonoBehaviour, IDamageable', codeBox('Health.cs', HEALTH_FULL)) +
    deep('PARTS AND ROOT', 'COMPOSITION', {
      plain: P('Composition means building something from small parts. The parts are components: Health, Mover, Attack. They need one thing to put them to work together: a thin root script on the same GameObject. In our enemy this is NpcBrain, the script from the state machine slides. The root does not do the work. It asks each part to do its job.'),
      picture: P('A kitchen. The head chef does not chop, fry or wash up. The head chef tells each cook what to do. A crate has only a washer, a boss has the full crew. The parts stay the same.'),
      problem: P('The first enemy inherits from Entity. Then a flying enemy, then a flying boss. The boss needs Health, so it inherits from Enemy, and drags along patrol code it never uses.')
        + codeBox('The class tree', `
public class Entity : MonoBehaviour { }
public class Enemy : Entity { }          // health, loot, patrol
public class FlyingEnemy : Enemy { }     // plus flying
public class FlyingBoss : FlyingEnemy { } // plus boss, but not patrol`),
      walk: bl([
        '<strong>[RequireComponent(typeof(Health), typeof(Mover), typeof(Attack))]:</strong> when you add NpcBrain, Unity adds the three parts too. Nobody can forget one, and the script cannot be removed while NpcBrain needs it.',
        '<strong>Private fields:</strong> _health, _mover and _attack keep the parts. The root does not make them public, so no other script reaches in.',
        '<strong>Awake with GetComponent:</strong> ask once for each part and keep it in the field. Never call GetComponent in Update every frame.',
        '<strong>TryGetComponent for optional parts:</strong> if a prefab may or may not have an Attack, write TryGetComponent(out _attack) and check for null later. It gives true or false and does not log an error.' + codeBox('Optional part', `
private Attack _attack;   // optional: some prefabs have no Attack

private void Awake()
{
    TryGetComponent(out _attack);   // _attack stays null when there is none
}`),
        '<strong>Health : MonoBehaviour, IDamageable:</strong> the same Health the Interfaces slide used. A bullet finds it through the IDamageable contract and never needs the root.',
        '<strong>Has-a beats is-a:</strong> the boss has a Health, a Mover and an Attack. It is not a child of the enemy.',
        '<strong>Config versus state:</strong> a Mover with a bool _flies is okay. The bool is config, set once in the Inspector. Health and Attack are different parts, not flags inside one class. A bool that changes at run time, like _isChasing, belongs in a state.',
      ]),
      why: P('When the lead says all enemies need a shield, a class tree forces a change at the top that touches 20 prefabs. With components someone adds a Shield component only to the prefabs that need it. The root changes by one line.'),
      mistake: P('A fat root that does the work itself, so it becomes the Enemy class again. The root decides who does what and the parts do it. Also: using inheritance just to reuse one method. You get the whole parent along with it, including its bugs.'),
      dd: dontDo(CLASS_TREE, ROOT_PARTS, 'Every new mix needs a new subclass.', 'Mix parts on one object.', { badFile: 'EnemyTree.cs', goodFile: 'NpcBrain.cs' }),
      rule: P('Reuse behaviour by adding a component. Share a type by implementing an interface. Let a thin root coordinate.'),
    }),
    'Components 3 (3 min): Read the lead line and the Don\'t. A class tree needs a new subclass for every mix. The Do: NpcBrain is a thin root. RequireComponent adds the parts, Awake caches them with GetComponent. Open the Health accordion and show it links back to the Interfaces slide. Say the mover line: Mover with a bool _flies is okay because it is config, not state. Ask: which class in your project inherits from something just for one method? Timing so far: 44 min.'),

  // 17 Putting it together: the enemy
  slide('Putting It Together: The Enemy',
    leadLine('The root script NpcBrain calls the parts. A bullet reaches Health through the contract. Health tells the world with a channel.') +
    split(
      inspector([['SampleScene', 0, 0], ['Player', 0, 1], ['Enemy', 1, 1]], 'Enemy', [
        { name: 'NpcBrain', script: true, fields: [['Player', 'Player'], ['Attack Range', '2']] },
        { name: 'Health', script: true, fields: [['Max', '100'], ['On Died', 'OnEnemyDied']] },
        { name: 'Mover', script: true, fields: [['Speed', '3'], ['Flies', '&#9744;']] },
        { name: 'Attack', script: true, fields: [['Damage', '10']] },
      ]) + '<div style="height: 8px;"></div>' +
      flow('Who calls whom', [
        [['Unity', 'purple'], ['NpcBrain.Update', 'green'], ['Mover.MoveTo / Attack.Fire', 'blue']],
        [['Bullet.OnTriggerEnter', 'amber'], ['GetComponentInParent&lt;IDamageable&gt;', 'blue'], ['Health.TakeDamage', 'green'], ['OnDied channel', 'amber']],
      ]),
      codeCard('info', 'The star: the thin root', 'NpcBrain.cs', ENEMY_ROOT)
    ) + acc('[Code] Health, Mover, Attack and Bullet, so you can compile it', codeBox('Health.cs', HEALTH_FULL) + '<div style="height:8px"></div>' + codeBox('Mover.cs and Attack.cs', MOVER_ATTACK) + '<div style="height:8px"></div>' + codeBox('Bullet.cs', BULLET_PARENT)) +
    deep('PUTTING IT TOGETHER', 'ENEMY ASSEMBLY', {
      plain: P('Four scripts sit on one Enemy GameObject. Only NpcBrain makes decisions about who does what. Health, Mover and Attack each do one job. The bullet is a fifth script, on another object, and it knows only the IDamageable contract.'),
      picture: P('A film crew. The director (NpcBrain) says walk, say the line, fight. The actors (the parts) do it. The audience (UI, loot) reacts to news from the set without ever talking to the director.'),
      problem: P('Without a root, the parts reach for each other. Health turns the Mover off when it dies, Mover asks Attack whether it may move, and nobody can read the order of events.')
        + codeBox('Parts that poke each other', `
// In Health.TakeDamage when dead:
GetComponent<Mover>().enabled = false;
GetComponent<Attack>().enabled = false;
// Add a Shield part: now edit Health again.`),
      walkLabel: 'One fight, step by step',
      walk: bl([
        '<strong>Awake:</strong> NpcBrain grabs Health, Mover and Attack once. RequireComponent made sure they exist.',
        '<strong>Update, every frame:</strong> if the enemy is dead or has no player, stop. Otherwise measure the distance. Far away: _mover.MoveTo(player). Close: _attack.Fire(player). The root only chooses.',
        '<strong>Mover.MoveTo:</strong> moves toward the target. A ground enemy keeps its own height because _flies is off.',
        '<strong>Attack.Fire:</strong> waits for its cooldown, then asks the target for an IDamageable and calls TakeDamage. The same contract works for the player.',
        '<strong>The bullet:</strong> OnTriggerEnter asks the thing it hit for an IDamageable. GetComponentInParent also looks upwards, because the collider may sit on a child while Health sits on the parent.',
        '<strong>Health.TakeDamage:</strong> lowers the number. When it reaches 0 it raises the OnDied channel once, because IsDead stops a second call.',
        '<strong>The channel:</strong> the UI and loot scripts listen to OnEnemyDied. Health never knows who they are. NpcBrain sees IsDead on the next Update and stops.',
      ]),
      why: P('Every part is a small file that fits on one screen, and each can be reused: the crate takes Health only. The only script that knows all the parts is the root, so a change in the plan touches one file.'),
      mistake: P('Calling GetComponent in Update every frame, or letting the parts find each other with FindObjectOfType. Ask once in Awake in the root, and let the root pass the information on.'),
      rule: P('The root coordinates, the parts work, the contract connects, the channel announces.'),
    }),
    'Putting it together, enemy (2 min): Show the mock: NpcBrain, Health, Mover, Attack on the Enemy. Read NpcBrain: RequireComponent, Awake caches, Update chooses between MoveTo and Fire. Open the code accordion for Health, Mover, Attack and the bullet. Trace the bullet: GetComponentInParent finds IDamageable, Health.TakeDamage, the OnDied channel announces. Say again: the root coordinates, the parts work. Timing so far: 46 min.'),

  // 14 Working Session 2
  session(2, 'Add One Contract', 10,
    'Pick one spot in your project with a type check or tag switch.',
    ['Name the one method all targets share.', 'Put IDamageable on two classes and call it.', 'Share one Health component between two prefabs.'],
    'The caller has no type check and no tag switch.',
    'IDamageable.cs', SESS2_CODE,
    'Working Session 2 (10 min). Start the timer and say: pick ONE place in YOUR project where code checks a type or a tag before acting (damage, pickup, interact). Starter: name the single method every target shares. Standard: write the interface, put it on two classes and call it with TryGetComponent. Stretch: move the shared logic into one component, such as Health, that two prefabs use. Walking around, look for: an interface with many methods (keep it to one to three), TryGetComponent on a collider that sits on a child object while the script lives on the parent (use GetComponentInParent or the attached rigidbody), and inheritance used just to reuse one method. Last minute: one student shows the caller with the switch deleted. Timing so far: 56 min.'),

  // 15 Commands and undo (merged)
  slide('Commands: An Action as an Object',
    mainPair('A command is a small object that holds one action, so the code that asks for it and the code that does it are separate.', `
private void Update()
{
    if (Keyboard.current.spaceKey.wasPressedThisFrame)
        _motor.Jump();
    if (Keyboard.current.fKey.wasPressedThisFrame)
        _motor.Dash();
}`, `
public interface ICommand { void Execute(); }

public class JumpCommand : ICommand
{
    private readonly PlayerMotor _motor;
    public JumpCommand(PlayerMotor motor) => _motor = motor;
    public void Execute() => _motor.Jump();
}`, 'Input is welded to the motor.', 'Input makes commands, others run them.', { badFile: 'PlayerInput.cs', goodFile: 'JumpCommand.cs', line: 'Not the same as an event channel: a command says do this.' }) + acc('[Code] Undo and replay: same objects, more uses', codeBox('CommandHistory.cs', UNDO_CODE) + '<div style="height:8px"></div>' + codeBox('MoveStepCommand.cs', MOVE_STEP) + '<p style="margin: 8px 0 0 0;">Replay: record the clock time and the command on every Run. To play back, reset to the same start state and run each command when the clock reaches its time. It only works when commands use their own data, not live input.</p>') + deep('COMMANDS', 'ACTION OBJECTS', {
      more: deepSub('Undo and replay', {
      plain: P('Undo means: the last thing you did is taken back. We do this by keeping every finished command on a stack. A stack is a pile where you only add and remove at the top. Undo takes the top command and calls its Undo method. Replay records each command with the time, then runs them again later in the same order.'),
      picture: P('A text editor. Every edit is a small object, so Ctrl+Z just pops the top of the pile.'),
      problem: P('A puzzle game moves a block by one step. The designer asks for undo. If movement is written inside the player, there is nothing to undo.')
        + codeBox('No history', `
private void MoveRight() => transform.position += Vector3.right;
// What was the position before? Nobody wrote it down.`),
      walk: bl([
        '<strong>IUndoableCommand : ICommand:</strong> a command that also has Undo(). Execute and Undo are opposites.',
        '<strong>MoveStepCommand:</strong> stores the target and the step when it is created. Execute adds the step, Undo subtracts it.',
        '<strong>CommandHistory.Run(command):</strong> execute the command and push it on the stack.',
        '<strong>CommandHistory.Undo():</strong> if the stack is not empty, pop the top and call Undo.',
        '<strong>Replay:</strong> on every Run also store (time, command). To replay, reset the world to the start and run each command when the clock reaches its stored time.',
      ]),
      why: P('Undo is trivial if you planned for it and painful if you did not. In a puzzle game it is a core feature. In a shooter it is rarely needed, but the same record-and-run idea gives you a replay or a kill-cam.'),
      mistake: P('Commands that read live state when they run, such as the current mouse position. A replay then does something else. Store what you need inside the command when you create it.'),
      rule: P('Execute and Undo use only the data stored in the command. Start with one of undo, replay or buffer. Do not build all three.'),
    }),
      diff: P('<strong>Command versus event channel (Arch 1).</strong> An event says something happened, and anyone listening reacts. A command says do this, and it is an object you can store, queue, undo and replay.') + P('Use an event channel to notify many parts. Use a command when you need to queue, undo or replay an action. They fit together: a command can run and then raise an event channel to tell the UI.'),
      plain: P('Normally a key press calls a method right now: jump. With a command we first make an object that means jump, and hand it to whoever should run it. The object can be run now, later, twice or never. It can also be stored.'),
      picture: P('A restaurant order slip. The waiter writes it, the kitchen cooks it when ready, and you can keep a copy of every slip for the bill.'),
      problem: P('In the grappling PlayerController3D the same Update reads input, checks the ground and moves. It grows until it holds everything.')
        + codeBox('Input and movement tangled', `
private void Update()
{
    if (Input.GetKeyDown(KeyCode.Space) && _controller.isGrounded) Jump();
    if (Input.GetKeyDown(KeyCode.E)) FireGrapple();
    // 600 lines later: gamepad, rebinding, AI, replay...
}`),
      walk: bl([
        '<strong>interface ICommand:</strong> one method, Execute. Everything that can be done is an ICommand. Keyboard, AI and replay share one path, and it opens buffer, undo and replay. The full listing:' + codeBox('JumpCommand.cs', ICOMMAND),
        '<strong>JumpCommand:</strong> a small class that stores a PlayerMotor, which is the class that moves the player.',
        '<strong>Execute:</strong> calls motor.Jump(). The command does not know which key or which AI created it.',
        '<strong>Who creates it:</strong> an input class that reads the keyboard or gamepad. It builds the command and hands it over.',
        '<strong>Who runs it:</strong> the motor, or a buffer, or an AI script. All use the same path.',
      ]) + P('Allocation: JumpCommand holds no data that changes, so create it once and reuse it. Commands with data, such as undo steps, are made per press, which is fine at human speed. Never create commands in a loop every frame.'),
      why: P('When the team adds a gamepad, the AI sidekick and a replay system, three people can work at once. They only need to create commands, and the player never changes.'),
      mistake: P('Creating a new command object every frame in Update. Create on input events, or reuse stateless ones.'),
      dd: dontDo(`
private void Update()
{
    if (Keyboard.current.spaceKey.wasPressedThisFrame)
        _motor.Jump();
    if (Keyboard.current.fKey.wasPressedThisFrame)
        _motor.Dash();
}`, `
private readonly Queue<ICommand> _queue = new();

private void Update()
{
    if (Keyboard.current.spaceKey.wasPressedThisFrame)
        _queue.Enqueue(new JumpCommand(_motor));

    while (_queue.Count > 0)
        _queue.Dequeue().Execute();
}`, 'Input is welded to the motor.', 'Input makes commands, the loop runs them.', { badFile: 'PlayerInput.cs', goodFile: 'PlayerInputReader.cs' }),
    }),
    'Commands (5 min). Plain words: instead of calling Jump directly on key press, we create a small object that knows how to jump and hand it to whoever runs it. Input code leaves the player class, and an object can be stored, delayed, undone or recorded. Use the order slip picture. Cache the stateless ones. Say the not the same as line: an event says what happened, a command says do this. Open the undo accordion: each command keeps what it needs to reverse itself, a stack gives Ctrl+Z, and replay needs a fixed start state and commands that carry their own data. Ask: does your game need undo? Many do not, and that is fine. Timing so far: 61 min.'),

  // 16 Input buffering
  slide('Input Buffering',
    mainPair('A buffer remembers a button press for a moment, so a jump pressed just before landing still happens.', `
private void Update()
{
    if (_jumpPressed && _motor.IsGrounded)
        _motor.Jump();

    _jumpPressed = false;   // pressed 0.1 s early: lost
}`, `
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
}`, 'An early press is thrown away.', 'Keep the newest press for 0.15 s.', { badFile: 'PlayerInputReader.cs', goodFile: 'CommandBuffer.cs', line: 'Not the same as a coroutine timer: a stored timestamp is easier to cancel.' }) + acc('[Code] PlayerInputReader and a minimal PlayerMotor', codeBox('PlayerInputReader.cs', INPUT_READER) + '<div style="height:8px"></div>' + codeBox('PlayerMotor.cs', PLAYER_MOTOR)) +
    deep('INPUT BUFFER', 'GAME FEEL', {
      diff: P('<strong>Input buffer versus coroutine timer.</strong> A coroutine that waits for a jump press is hard to cancel and hard to inspect. A stored timestamp is one float you can read, print and reset.') + P('Use a timestamp for input windows. Use a coroutine for a one-off timed sequence, such as a flash, a delay, then a sound.'),
      plain: P('A human presses the button a little too early. The game says not grounded yet, and throws the press away. The player feels the controls are sticky. A buffer keeps the press for a short time and runs it as soon as the move is possible.'),
      picture: P('A waiter who writes down your order while the kitchen is busy. He drops the slip only if it waits too long.'),
      problem: P('The grappling player lands and jumps again. If the press comes 0.1 seconds early, this code ignores it.')
        + codeBox('The lost press', `
private void Update()
{
    if (Input.GetKeyDown(KeyCode.Space) && _controller.isGrounded)
        Jump();   // pressed 1 frame too early: nothing happens
}`),
      walk: bl([
        '<strong>_window and _pending:</strong> how long a press lives, and the stored command. Only one is kept, the newest. The full class:' + codeBox('CommandBuffer.cs', CMD_BUFFER),
        '<strong>Push(command):</strong> store the command and the time. A new press replaces the old.',
        '<strong>TryExecute(canRun):</strong> called every frame. No command: nothing to do. Older than the window: forget it.',
        '<strong>canRun:</strong> if the player cannot jump yet, keep waiting. If they can, call Execute, clear the slot, return true.',
        '<strong>PlayerInputReader (accordion):</strong> Update reads wasPressedThisFrame and calls Push, then calls TryExecute with motor.IsGrounded. The whole script is on the Putting It Together slide for the player.',
      ]) + P('Nothing allocates in Update: the command was created once in Awake.'),
      why: P('The best mechanics feel bad if inputs are lost. Playtesters say jumping feels heavy and nobody knows why. The buffer fixes that in 20 lines, and it works for every action, including the grapple.'),
      mistake: P('Making the window huge. A 1 second buffer fires old actions the player forgot about. Use 0.1 to 0.2 seconds.'),
      dd: dontDo(`
private void Update()
{
    if (_jumpPressed && _motor.IsGrounded)
        _motor.Jump();

    _jumpPressed = false;   // pressed 0.1 s early: lost
}`, `
private const float JumpWindow = 0.15f;
private float _jumpPressedAt = float.NegativeInfinity;

private void Update()
{
    if (Keyboard.current.spaceKey.wasPressedThisFrame) _jumpPressedAt = Time.time;

    if (Time.time - _jumpPressedAt > JumpWindow || !_motor.IsGrounded) return;
    _jumpPressedAt = float.NegativeInfinity;
    _motor.Jump();
}`, 'An early press is thrown away.', 'Keep the press time for 0.15 s.', { badFile: 'PlayerInputReader.cs', goodFile: 'PlayerInputReader.cs' }),
      rule: P('Coyote time is the mirror idea: allow a jump a few frames after leaving a ledge. Both forgive human timing.'),
    }),
    'Input buffering (5 min): Ask who has played a platformer where the jump feels sticky. That is a missing buffer. Walk the short listing: Push stores the command and time, TryExecute runs it when canRun is true and the window is still open. The reader builds the command, the motor stays clean. Use the waiter picture. Say the not the same as line: a coroutine waiting for a jump is hard to cancel, a stored timestamp is simple. End of block 3. Timing so far: 66 min.'),

  // 18 Putting it together: the player input
  slide('Putting It Together: The Player',
    leadLine('Two scripts sit on the Player. PlayerInputReader reads the keys and makes commands. PlayerMotor does the moving.') +
    split(
      inspector([['SampleScene', 0, 0], ['Player', 1, 1], ['Main Camera', 0, 1]], 'Player', [
        { name: 'Character Controller', fields: [['Height', '2']] },
        { name: 'PlayerMotor', script: true, fields: [['Jump Speed', '6']] },
        { name: 'PlayerInputReader', script: true, fields: [['Motor', 'Player'], ['Buffer Window', '0.15']] },
      ]) + '<div style="height: 8px;"></div>' +
      flow('Who calls whom, each frame', [
        [['Unity', 'purple'], ['PlayerInputReader.Update', 'green'], ['wasPressedThisFrame', 'amber'], ['_buffer.Push(_jump)', 'blue']],
        [['_buffer.TryExecute(IsGrounded)', 'blue'], ['JumpCommand.Execute', 'blue'], ['PlayerMotor.Jump', 'green']],
        [['Right arrow', 'amber'], ['_history.Run', 'blue'], ['Execute + stack'], ['Z', 'amber'], ['_history.Undo', 'blue']],
      ]),
      codeCard('info', 'The star: the input script', 'PlayerInputReader.cs', INPUT_READER)
    ) + acc('[Code] PlayerMotor, CommandBuffer, CommandHistory', codeBox('PlayerMotor.cs', PLAYER_MOTOR) + '<div style="height:8px"></div>' + codeBox('CommandBuffer.cs', CMD_BUFFER) + '<div style="height:8px"></div>' + codeBox('CommandHistory.cs', UNDO_CODE)) +
    deep('PUTTING IT TOGETHER', 'PLAYER ASSEMBLY', {
      plain: P('Only two scripts are MonoBehaviours: PlayerInputReader and PlayerMotor. Everything else, ICommand, JumpCommand, CommandBuffer and CommandHistory, is a plain C# class. PlayerInputReader makes them with new and calls them. The reader decides what the player wants. The motor decides how the body moves.'),
      picture: P('A restaurant. The waiter (the reader) writes the order slip, holds it for a moment if the kitchen is busy, and hands it over. The cook (the motor) cooks. A copy of every slip is kept in a pile, so the last order can be taken back.'),
      problem: P('Without the split, Update reads keys, checks the ground, jumps, dashes and undoes in one place. A jump pressed 0.1 s before landing is lost, and nothing can be taken back.')
        + codeBox('Everything in Update', `
private void Update()
{
    if (Keyboard.current.spaceKey.wasPressedThisFrame && _controller.isGrounded) Jump();
    // dash, undo, gamepad, replay... all in the same method
}`),
      walkLabel: 'Who calls whom in one frame',
      walk: bl([
        '<strong>Awake:</strong> the reader makes the buffer with its window, and one JumpCommand, once. Both are reused, so Update allocates nothing for jump.',
        '<strong>Update, step 1:</strong> if space was pressed this frame, Push the jump command. The buffer stores the command and the press time.',
        '<strong>Update, step 2:</strong> TryExecute with the motor IsGrounded. If the player is on the ground and the press is younger than 0.15 s, the buffer runs JumpCommand.Execute, which calls PlayerMotor.Jump. An early press still works. An old one is dropped.',
        '<strong>Undo stack:</strong> the right arrow runs a MoveStepCommand through CommandHistory.Run, which executes it and pushes it on a stack. Z pops the top and calls Undo.',
        '<strong>PlayerMotor:</strong> a MonoBehaviour next to the reader on the Player. It owns the CharacterController and exposes Jump, Move and IsGrounded. It knows nothing about keys.',
        '<strong>Which one is attached:</strong> both MonoBehaviours go on the Player. The commands, the buffer and the history are plain classes created inside the reader.',
      ]),
      why: P('Add a gamepad, an AI sidekick or a replay and you add another script that makes commands. The motor and the buffer do not change. The key reading lives in one script.'),
      mistake: P('Creating a new JumpCommand every frame in Update, or calling the motor straight from the key check and bypassing the buffer. Make stateless commands once in Awake.'),
      rule: P('The reader makes commands, the buffer holds them, the motor runs them, the history can take them back.'),
    }),
    'Putting it together, player (2 min): Show the Player mock: PlayerMotor and PlayerInputReader. Read PlayerInputReader: Awake makes the buffer and the jump command once, Update reads wasPressedThisFrame, pushes, and calls TryExecute with IsGrounded. Follow the flow rows: key press, buffer, command, motor. Second flow: the undo stack with the arrow key and Z. Everything else is a plain class. Timing so far: 68 min.'),

  // 17 Working Session 3
  session(3, 'Make One Action a Command', 15,
    'Pick one action in your project, such as jump, shoot or interact.',
    ['Wrap it in a command with Execute.', 'Add a 0.15 s buffer for it.', 'Add Undo and a history stack.'],
    'A press 0.1 s early still fires, and Stretch undoes a step.',
    'Commands.cs', SESS3_CODE,
    'Working Session 3 (15 min). Start the timer and say: pick ONE action in YOUR project. Starter: a command class with Execute, created once and reused. Standard: add a buffer that stores the press time and runs the command when the action is possible and the press is younger than 0.15 s. Stretch: an undoable version with a history stack, only if your game can use it. Walking around, look for: commands created inside Update every frame, the input class still calling the motor directly, a buffer window above 0.2 s, a buffer that is not cleared after it fired. Last 2 minutes: test the early press together on one laptop. Timing so far: 83 min.'),

  // 18 Divider
  divider('3. Services and Safe Change', 'Make dependencies visible, then change code in small steps',
    'Make dependencies visible, then change your code in steps small enough to undo.',
    ['Singleton problems', 'A small service locator', 'Refactoring steps', 'Tests and assembly walls'],
    'Block 4 (about 9 min), Working Session 4 (12 min), block 5 (about 10 min), wrap-up (about 5 min).'),

  // 19 Singletons
  slide('What Is Wrong With Singletons',
    mainPair('A singleton is one global object anyone can reach, which is easy but hides what each class needs.', `
private void Start()
{
    // Nothing in the class header says it needs audio.
    AudioManager.Instance.Play("spawn");
}`, `
private IAudioService _audio;   // registered in _PersistentCore

private void Start()
{
    _audio = Services.Get<IAudioService>();
    _audio.Play("spawn");
}`, 'Hidden need, hard-wired class.', 'The need is visible and swappable.', { badFile: 'EnemySpawner.cs', goodFile: 'EnemySpawner.cs' }) + deep('SINGLETON LIMITS', 'ARCH 1 FOLLOW-UP', {
      plain: P('A dependency is something a class needs to do its job, such as the audio system or the save file. A singleton lets any class grab it with Instance. That is short to write, but nothing at the top of the class says what it needs. You must read every line to find out.'),
      picture: P('A shared kitchen where anyone can reach in and grab a pan. Nobody can tell which dish needs which pan. When the pan is missing, dinner stops and no one knows why.'),
      problem: P('In Arch 1 we made PersistentSingleton<T> for infrastructure, and the _PersistentCore scene holds them. It is easy to use it everywhere.')
        + codeBox('Spread over the project', `
// Enemy, UI, Player, Bullet, Door: all say
AudioManager.Instance.Play("hit");
SaveSystem.Instance.Save();
// Move Enemy to another project? It drags 5 managers with it.`),
      walk: bl([
        '<strong>EnemySpawner.Start:</strong> two calls to Instance. The class header and fields say nothing about them.' + codeBox('EnemySpawner.cs', SINGLETON_PROBLEM),
        '<strong>Problem 1, hidden:</strong> a teammate who reads the class thinks it is standalone. It is not.',
        '<strong>Problem 2, order:</strong> if AudioManager sets itself up in Awake and the spawner runs earlier, Instance is null. The error appears only on some machines.',
        '<strong>Problem 3, tests:</strong> a test cannot replace the AudioManager with a quiet fake, so every test plays sound.',
        '<strong>Still fine:</strong> true infrastructure, such as one audio system for the whole game, is what PersistentSingleton<T> is for.',
      ]),
      why: P('In a big team a year later, someone moves a class to another scene and it breaks, because it quietly needed three managers. A visible list of needs prevents this.'),
      mistake: P('Using Instance in every class because it is one short line. The convenience is real, and so is the bill that arrives later.'),
      dd: dontDo(`
public class EnemySpawner : MonoBehaviour
{
    private void Start()
    {
        // Nothing in the class header says it needs audio.
        AudioManager.Instance.Play("spawn");
    }
}`, `
public class EnemySpawner : MonoBehaviour
{
    private IAudioService _audio;   // registered in _PersistentCore

    private void Start()
    {
        _audio = Services.Get<IAudioService>();
        _audio.Play("spawn");
    }
}`, 'Hidden need, hard-wired class.', 'The need is visible and swappable.', { badFile: 'EnemySpawner.cs', goodFile: 'EnemySpawner.cs' }),
      rule: P('Use a singleton for true infrastructure. Reach everything else through something you can replace.'),
    }),
    'Singletons (3 min): Arch 1 taught PersistentSingleton<T> and said when it is fine. Now the cost. Three problems: hidden dependencies (you must read the body to learn what a class needs), start-up order bugs, and tests that cannot replace the AudioManager. Ask: how many classes in your project say AudioManager.Instance? Timing so far: 86 min.'),

  // 20 Service locator
  slide('A Small Service Locator',
    leadLine('A service locator is a phone book: you ask for a role like IAudioService, not an object.') +
    '<p class="dd-line">Not the same as an event: a locator is pulled, an event is pushed.</p>' +
    split(
      card('primary', 'Interface says what', ul(['Register once in _PersistentCore.', 'Callers ask for an interface.', 'Tests register a fake.', 'Missing service fails at start.'])),
      codeCard('info', 'About 20 lines', 'Services.cs', SERVICES)
    ) + acc('[Expert] Bootstrap, and a note on dependency injection', codeBox('CoreBootstrap.cs', BOOTSTRAP) + '<p style="margin: 8px 0 0 0;">Dependency injection goes one step further: the services are passed in through the constructor, so nothing calls a global lookup. VContainer is one Unity library for it. We only name it today, nobody installs a framework.</p>') +
    deep('SERVICE LOCATOR', 'SINGLETON ALTERNATIVE', {
      diff: P('<strong>Service locator versus singleton and event channel.</strong> A locator is give me the thing I need: you pull it. An event is tell whoever cares: you push news. A singleton is one global class anyone grabs with Instance. A locator hands out an interface, so the real object can be swapped for a fake.') + P('Use a locator for one shared service, such as audio or saves. Use an event channel for news, such as the player died.'),
      plain: P('A service is something shared by many classes, such as audio. A service locator is one static class with a dictionary. At start-up you register each service. Later a class asks for it by interface. The locator hands back whatever was registered.'),
      picture: P('A phone book. You look up a role, not a person. When the person leaves, the book is updated and everyone still finds the role.'),
      problem: P('The spawner needs audio. With a singleton it says AudioManager.Instance. A test of the spawner would play real sound, and a new teammate cannot see the need.')
        + codeBox('Today', `
AudioManager.Instance.Play("spawn");   // concrete class, hidden need`),
      walk: bl([
        '<strong>IAudioService:</strong> the interface. It says what audio can do: Play(string clipName).',
        '<strong>s_services:</strong> a dictionary from a type to an object. It lives in the static class Services.',
        '<strong>Register&lt;T&gt;(service):</strong> store the object under typeof(T). The bootstrap calls this in Awake.',
        '<strong>Get&lt;T&gt;():</strong> look up the object. If it is not registered, throw a clear error right away, so a missing service fails at start and not ten minutes later.',
        '<strong>Reset:</strong> the RuntimeInitializeOnLoadMethod clears the dictionary every time Play Mode starts, which matters when domain reload is off.',
        '<strong>CoreBootstrap (accordion):</strong> an early script in _PersistentCore with DefaultExecutionOrder(-100) that registers AudioService. Spawners then ask in Start and cache the result in a field.',
      ]),
      why: P('A test registers a fake IAudioService that records calls. The spawner test now runs without sound. The need is visible in one line of Start, and the order is decided in one bootstrap, not by luck.'),
      mistake: P('Sprinkling Services.Get everywhere, even in Update. It is still a global, just a replaceable one. Ask once in Start and keep the result in a field.'),
    }),
    'Service locator (4 min): Show the short listing. Callers ask for IAudioService. The bootstrap in _PersistentCore decides which implementation to register. A test registers a fake. Honest note: it is still a global, but it is explicit and replaceable. Short mention of dependency injection and VContainer only. End of block 4. Say the not the same as line: a locator is give me the thing, an event is tell whoever cares. Timing so far: 90 min.'),

  // 22 Putting it together: services
  slide('Putting It Together: The Services',
    leadLine('A bootstrap script in _PersistentCore registers the service first. Any script asks for it later.') +
    split(
      treeBox('Assets/Scripts/', [[0, 'Core/', '', ''], [1, 'IAudioService.cs', 'plain interface', 'plain'], [1, 'Services.cs', 'plain static class', 'plain'], [1, 'AudioService.cs', 'MonoBehaviour: _PersistentCore', 'mono'], [1, 'CoreBootstrap.cs', 'MonoBehaviour: _PersistentCore', 'mono'], [0, 'Enemy/', '', ''], [1, 'EnemySpawner.cs', 'MonoBehaviour: a spawner', 'mono']]) +
      '<div style="height: 8px;"></div>' +
      flow('Order of execution', [
        [['1 _PersistentCore loads', 'purple'], ['2 CoreBootstrap.Awake (-100)', 'green'], ['3 Services.Register', 'blue']],
        [['4 other Awakes', 'purple'], ['5 EnemySpawner.Start', 'green'], ['6 Services.Get', 'blue'], ['7 _audio.Play', 'amber']],
      ]),
      codeCard('info', 'The star: the bootstrap', 'CoreBootstrap.cs', CORE_BOOT) +
      '<div style="height: 8px;"></div>' + codeCard('info', 'A caller', 'EnemySpawner.cs', ENEMY_SPAWNER)
    ) + acc('[Code] IAudioService and AudioService, so you can compile it', codeBox('AudioService.cs', AUDIO_SERVICE)) +
    deep('PUTTING IT TOGETHER', 'SERVICES ASSEMBLY', {
      plain: P('Three MonoBehaviours take part: AudioService does the sound, CoreBootstrap registers it, and any caller, such as EnemySpawner, asks for it. The glue is Services, a plain static class. The caller asks for the interface IAudioService and never names AudioService.'),
      picture: P('A phone book that someone fills in on the first day. The receptionist (CoreBootstrap) writes down who answers for audio. After that, everyone looks up a role and never needs the name of the person.'),
      problem: P('The spawner runs before audio is registered, and Services.Get throws. Or it works on your laptop and breaks on another machine, because the order was luck.')
        + codeBox('Asked too early', `
// Spawner.Awake runs first:
_audio = Services.Get<IAudioService>();
// InvalidOperationException: Service IAudioService is not registered.`),
      walkLabel: 'Order of execution, step by step',
      walk: bl([
        '<strong>1 and 2, the core scene:</strong> _PersistentCore holds AudioService and CoreBootstrap. Load it first (scene 0 in Build Settings, or load it before the game scene).',
        '<strong>CoreBootstrap.Awake:</strong> [DefaultExecutionOrder(-100)] makes it run before scripts with the default order 0. It registers the AudioService object under the interface type: Services.Register&lt;IAudioService&gt;(_audio).',
        '<strong>4, other Awakes:</strong> everything else in the scene wakes up. Do not call Services.Get here unless you are sure the bootstrap ran.',
        '<strong>EnemySpawner.Start:</strong> Start runs after all Awake calls of the loaded scene. It asks Services.Get&lt;IAudioService&gt;() once and keeps the answer in the _audio field.',
        '<strong>Spawn:</strong> the spawner makes the enemy and calls _audio.Play("spawn"). It never says AudioManager.Instance, and a test can register a fake IAudioService instead.',
        '<strong>The file tree:</strong> IAudioService and Services are plain files with nothing to attach. AudioService and CoreBootstrap are attached to _PersistentCore. EnemySpawner is attached to a spawner object.',
      ]),
      why: P('The order is decided in one place, the bootstrap, and written down in one attribute. A new teammate can read the start-up order in a minute, and a test swaps the audio for a quiet fake.'),
      mistake: P('Calling Services.Get in Awake or in a field initializer of another script and hoping the bootstrap ran first. Ask in Start, keep the result in a field, and never ask in Update.'),
      rule: P('Register once, early, in one bootstrap. Ask once, late, in Start. Keep the answer in a field.'),
    }),
    'Putting it together, services (2 min): Show the tree: AudioService and CoreBootstrap are attached to _PersistentCore, EnemySpawner to a spawner, Services and IAudioService are plain files. Walk the order: the core scene loads, the bootstrap Awake runs early because of DefaultExecutionOrder, it registers the service, the other Awakes run, the spawner Start asks once and keeps the result. Say the rule: register early, ask in Start. Timing so far: 92 min.'),

  // 21 Working Session 4
  session(4, 'Replace One Instance Call', 12,
    'Pick one Instance call in your project, such as audio or save.',
    ['List every class that uses it.', 'Make an interface and call Services.Register.', 'Switch one caller to Services.Get and test it with a fake.'],
    'That caller asks Services.Get and has no Instance call.',
    'Services.cs', SESS4_CODE,
    'Working Session 4 (12 min). Start the timer and say: pick ONE singleton call in YOUR project, for example audio or saves. Starter: list every class that uses it and what each one needs from it. Standard: write a small interface, register the real object in one bootstrap and switch one caller to Services.Get. Stretch: add a fake that implements the same interface and use it in a test. Walking around, look for: Services.Get in Update (ask once in Start and keep it in a field), registering after the caller already asked (execution order), a concrete class registered instead of the interface, a service that has far more methods than the caller needs. Last minute: one student shows the caller before and after. Timing so far: 104 min.'),

  // 22 Refactoring
  slide('Refactoring: Small Named Steps',
    leadLine('Refactoring means changing how code is built without changing what the game does.') +
    '<div class="dd-main"><div class="lab-grid-2col dd-grid">' +
    ddSide('bad', 'Before', codeBox('NpcBrain.cs', REFACTOR_BEFORE), 'Patrol sits inside Update.') +
    ddSide('good', 'After', codeBox('PatrolState.cs', REFACTOR_AFTER), 'Patrol is its own class.') +
    '</div></div>' +
    '<p class="dd-line">Commit message: Extract PatrolState from Update (no behavior change)</p>' +
    '<p class="dd-line">Same behavior before and after, or revert.</p>' + deep('REFACTORING', 'NAMED STEPS', {
      plain: P('Refactoring is cleaning up the inside of your code while the game plays exactly the same. Each step has a name, so teammates can say extract method instead of clean it up a bit. After every step you press Play and nothing has changed on screen.'),
      picture: P('Renovating a house room by room while you keep living in it. You never knock down all walls on one day.'),
      problem: P('The NavMesh enemy brain today is one 400 line class. Everyone is afraid to touch it. The temptation is a full rewrite as a state machine over the weekend.')
        + codeBox('The rewrite trap', `
// Friday: delete NpcBrain.
// Monday: new NpcBrain with 6 state classes, 800 new lines.
// Enemy no longer chases. Which of the 800 lines is wrong?`),
      walk: H('The ladder: three steps, every time') + bl([
        '<strong>1. Run the game.</strong> Check that the enemy patrols. This is your baseline.',
        '<strong>2. Make one move.</strong> One named step only, from the list below.',
        '<strong>3. Run the game again and commit.</strong> Same behavior? Commit. Different? Revert and try a smaller step.',
      ]) + H('The named steps') + bl([
        '<strong>Extract method:</strong> take lines out of Update and give them a name. Same code, easier to read:' + codeBox('ExtractMethod.cs', EXTRACT_METHOD),
        '<strong>Extract class:</strong> move the patrol fields and methods into PatrolState, as in the After box on the slide. NpcBrain gets shorter.',
        '<strong>Strangler:</strong> grow the new code next to the old code. A bool in the Inspector chooses which one runs. In the code, _useNewBrain calls the new machine and returns, otherwise LegacyUpdate runs:' + codeBox('NpcSwitch.cs', STRANGLER),
        '<strong>Switch over:</strong> when the new path works, flip the bool. If it misbehaves, flip it back. Delete the old path later.',
        '<strong>Commit per step:</strong> git is your undo button. A broken step is one revert away.',
      ]),
      why: P('A team of four cannot stop the game for a week. Small steps let one person refactor on Tuesday while the others still ship features and merge cleanly.'),
      mistake: P('Rewriting the whole class in one go. When it breaks you cannot tell which change did it.'),
      dd: dontDo(`
refactor: rewrite NpcBrain as a state machine
 14 files changed, 612 insertions(+), 488 deletions(-)`, `
refactor: extract PatrolState from NpcBrain
 2 files changed, 41 insertions(+), 23 deletions(-)`, 'One huge commit. When it breaks, where?', 'One named step. Run the game, commit.', { plain: true, badFile: 'git log (one commit)', goodFile: 'git log (small step)' }),
      rule: P('Change structure, not behaviour. After each step the game plays exactly like before.'),
    }),
    'Refactoring toolkit (4 min): Say the line: refactoring changes how code is built, not what the game does. Show Before and After: the patrol branch from Update becomes PatrolState. Walk the ladder: run the game, one move, run again and commit. Name the steps so people can talk about them. Extract method, extract class, strangler. Strangler: keep the old code, add the new path next to it, switch with a bool, delete the old path when stable. Commit per step so git is your undo button. Use the house renovation picture. Timing so far: 108 min.'),

  // 23 Safety net
  slide('Safety Net: Test, Walls, Commits',
    leadLine('Before you change old code, set up three things that tell you if you broke it.') +
    split(
      table(['Tool', 'What it does', 'Use it when'], [
        ['Test', 'Goes red if the behavior breaks.', 'Before moving risky code.'],
        ['Walls', 'Compiler refuses UI calling combat code.', 'During any refactor.'],
        ['Commit', 'Saves the last working version.', 'After each green step.'],
      ]),
      codeCard('info', 'The test, EditMode', 'EnemyTests.cs', NUNIT_MAIN)
    ) + acc('[Expert] Leaks to look for: static events and lambdas', codeBox('Leaks.cs', LEAKS) + '<p style="margin: 8px 0 0 0;">A static event survives scene loads and keeps dead listeners alive. A lambda cannot be removed with -=, so use a named method.</p>') +
    deep('SAFETY NET', 'TESTS AND WALLS', {
      plain: P('A regression test is a small piece of code that checks one behaviour and tells you if it stops working. An assembly definition is a file that makes a folder its own compile unit, so a forbidden reference becomes a compiler error. A commit saves a safe point you can return to.'),
      picture: P('Climbing gear. You still climb the same wall, but a slip costs a metre and not the whole fall.'),
      problem: P('You extract a class from NpcBrain. It compiles. In Play the enemy stands still. When did it break? Nobody knows, because nothing checked the old behaviour.')
        + codeBox('No net', `
// Refactor 1: ok? Refactor 2: ok? Refactor 3: ???
// You find out three days later, in front of the teacher.`),
      walk: H('Tool 1: the test') + bl([
        '<strong>What it does:</strong> runs one check and shows green or red. The slide test builds a machine, goes to Chase, then to Combat, and checks that Current is a CombatState.',
        '<strong>Where it runs:</strong> Window, General, Test Runner, EditMode tab, Run All. No need to press Play.',
        '<strong>When:</strong> before you move a risky behavior. Green first, then refactor, then green again.',
      ]) + H('A worked example with a fake state') + P('A second test checks the order of calls. FakeState is a tiny IState that only counts how often Enter and Exit were called.') + codeBox('StateMachineTests.cs', NUNIT) + bl([
        '<strong>FakeState:</strong> exists only for the test.',
        '<strong>[Test]:</strong> NUnit runs this method. The name says what is checked.',
        '<strong>Arrange, Act, Assert:</strong> make a machine and two fakes, call SetState(a) then SetState(b), then check a.Exited is 1 and b.Entered is 1. If a later change breaks the order, the test goes red.',
      ]) + H('Tool 2: assembly definition walls') + bl([
        '<strong>What it does:</strong> an assembly definition makes a folder its own compile unit. A reference you did not add becomes a compiler error, so UI code cannot call combat code by accident. A refactor cannot create a new tangle.',
        '<strong>Where to click:</strong> in the Project window, right click the folder, Create, Assembly Definition. Name it, for example Game.Combat.',
        '<strong>Add references:</strong> select the new .asmdef file. In the Inspector, under Assembly Definition References, press the plus button and drag in the assembly you may use, for example Game.Core. Press Apply. Leave UI out of the Combat references on purpose: that is the wall.',
        '<strong>For the test folder:</strong> Create, Testing, Test Assembly Folder. In its Inspector add a reference to your game assembly, so the test can see your code.',
        '<strong>Bonus:</strong> small assemblies also compile faster.',
      ]) + H('Tool 3: commit per step') + bl([
        '<strong>What it does:</strong> one small commit after each green step saves a safe point.',
        '<strong>Example:</strong> Extract PatrolState from Update (no behavior change).',
        '<strong>When something breaks:</strong> go back to the last working version with git revert or by discarding the change.',
      ]),
      why: P('With a green test and a commit after each step, a student can say: this step is safe. Without them every change is a leap of faith, and the team stops refactoring.'),
      mistake: P('Trying to write 200 tests before touching anything. One test on the behaviour you are about to move is enough to start.'),
      rule: P('One test per risky behaviour. Static events and lambdas keep dead listeners alive: use named methods and unsubscribe.'),
    }),
    'Safety net (3 min): Read the lead line, then the three rows: test, walls, commit. One test is enough to start. The test shown here checks that after Chase the state is Combat and runs in EditMode without pressing Play. Assembly definitions: they split the code, give compile errors for forbidden references and are needed so the test assembly can see your code. Mention the leak accordion as the one line on static and lambda event leaks. Use the climbing gear picture. Timing so far: 111 min.'),

  // 24 AI agents
  slide('Refactoring With an AI Agent',
    mainPair('An AI agent can refactor fast, but you must still read what it changed.', `
Refactor this class.`, `
Move the patrol code from NpcBrain.Update into PatrolState.
Keep behaviour. Touch two files.
Show me the diff. Change nothing else.`, 'Vague. The agent decides everything.', 'One step, a visible diff, a hard limit.', { plain: true, badFile: 'Prompt', goodFile: 'Prompt', line: 'Rules from 1.8: read every diff, ask for options first, one small step, test, commit.' }) + deep('AGENT REFACTORING', 'ONE STEP AT A TIME', {
      plain: P('An AI agent is a tool that reads your project and edits files for you. It is quick, and it does what you ask, even when what you ask is too big. You stay responsible for every line it writes.'),
      picture: P('A fast junior who never gets tired and never says no. You are the reviewer. A reviewer who skips the review ships the mistakes.'),
      problem: P('A student pastes the whole NpcBrain and writes: make this a state machine. The agent rewrites 600 lines. It compiles. The enemy no longer chases, and the diff is too long to read.')
        + codeBox('Prompt too big', `
"Rewrite NpcBrain as a state machine."
-> 12 files changed, 900 lines. Nobody reads it. Nobody trusts it.`),
      walkLabel: 'Step by step: a safe agent step',
      walk: bl([
        '<strong>Step 1, name the step:</strong> pick from the toolkit. Today: extract class, move patrol code into PatrolState. Right-sized prompt: Move the patrol code from NpcBrain.Update into PatrolState. Keep behaviour. Touch two files.',
        '<strong>Step 2, limit the files:</strong> say which files may change. Two is a good number.',
        '<strong>Step 3, ask first:</strong> request a diagnosis and two options before any edit. You choose.',
        '<strong>Step 4, read the diff:</strong> every line, as lesson 1.8 says. If it takes longer than two minutes, the step was too big.',
        '<strong>Step 5, run and commit:</strong> press Play, run the test, then commit. If it is wrong, revert and split the step.',
      ]),
      why: P('An agent can invent a name, move a line out of an if, or delete a null check. These look fine in a quick glance and break the game two days later. Small steps make mistakes visible while they are cheap.'),
      mistake: P('Letting the agent rewrite a whole class. It changes names, logic and structure at once, and you cannot review any of it.'),
      dd: dontDo(`
Refactor this class.`, `
Extract only the Patrol state into its own class.
Show me the diff.
Do not change anything else.`, 'Vague. The agent decides everything.', 'One step, a visible diff, a hard limit.', { plain: true, badFile: 'Prompt', goodFile: 'Prompt' }),
      rule: P('Name the step, limit the files, read the diff, commit. If the diff is too long to read, revert and split.'),
    }),
    'AI agents (3 min): Link to lesson 1.8: read every diff, ask for diagnosis plus options. New rule for refactoring: never let an agent rewrite a whole class at once. Use the named steps as the prompt. Ask one student for an example prompt. Timing so far: 114 min.'),

  // 25 Summary
  slide('Which Block Fixes Which Problem',
    leadLine('Pick the tool by your need.') +
    '<div class="content-stack">' + card('primary', 'Which tool when', table(['Need', 'Tool'], [['Tell many it happened', 'Event channel (Arch 1)'], ['Call one thing', 'Interface'], ['Queue, undo, replay', 'Command'], ['Timed one-off sequence', 'Coroutine'], ['Know the mode', 'State machine'], ['One shared service', 'Service locator']])) + '<p class="dd-line" style="margin-top: 8px;">Take home: pick one class in your project, do one small named step, commit.</p></div>' + acc('[Preview] Next class', 'The next class covers animation, including state machines in the Animator. Bring a project that builds and a committed git state.') +
    deep('SYMPTOM TO TOOL', 'WRAP UP', {
      more: '<div class="lab-box-neutral" style="margin-top: 8px;">' + H('Symptom to tool') + table(['Symptom in your code', 'Tool'], [['Flags pile up', 'FSM with guards'], ['Unknown state change', 'Transition log'], ['Too many arrows', 'Hierarchy or tree'], ['Type checks', 'Interface'], ['Deep class tree', 'Small components'], ['Lost jump press', 'Command buffer'], ['Instance everywhere', 'Service locator'], ['Class too big', 'Small steps, one test']]) + '</div><div class="lab-box-neutral" style="margin-top: 8px;">' + H('Not the same as: what each tool is, and what it is not') + table(['Tool', 'What it is', 'Not the same as'], [['State machine', 'Which mode you are in now, and what may happen next', 'Event channel: news that something happened. Coroutine: a timed sequence'], ['Coroutine', 'A one-off timed sequence: do A, wait, do B', 'State machine'], ['Command', 'An action as an object: store, queue, undo, replay', 'Event channel: says what happened'], ['Event channel (Arch 1)', 'Tells many listeners that something happened', 'Command or interface'], ['Interface', 'A direct call to one known target', 'Event: a broadcast'], ['Service locator', 'Pull one shared service when you need it', 'Event (push) or singleton'], ['Timestamp buffer', 'Remember a press for a short window', 'Coroutine timer']]) + '</div>',
      plain: P('This table turns the lesson around. You do not start with a pattern name. You start with the pain in your code, then pick the tool that matches. If you cannot find your pain in the left column, you probably do not need a new tool.'),
      picture: P('A doctor with a list of symptoms and treatments. Nobody takes every medicine in the cabinet. You take the one for what hurts.'),
      problem: P('After a lesson like this, teams often add everything at once: state machine, commands, services, tests. The code gets bigger, and the game does not improve.')
        + codeBox('Pattern overload', `
// Crate that opens: StateMachine + CommandBuffer + Service + 4 interfaces
// Needed: one bool.`),
      walkLabel: 'Step by step: use the table',
      walk: bl([
        '<strong>Step 1:</strong> pick one symptom from your own project, for example flags piling up in the enemy or the grappling controller.',
        '<strong>Step 2:</strong> find it in the left column. Read the tool on the right: here an FSM with guards.',
        '<strong>Step 3:</strong> go back to that block. The enemy needs IState and StateMachine. The player controller needs states for grounded, airborne and grappling.',
        '<strong>Step 4:</strong> apply it in a small named step, with one test, in one commit.',
        '<strong>Step 5:</strong> only then look for the next symptom.',
      ]),
      why: P('A team that fixes one symptom at a time keeps a playable game all the time. A team that adopts five patterns at once spends a sprint on structure and ships no gameplay.'),
      mistake: P('Using the table as a shopping list. The table points from pain to tool. It does not say you need every tool.'),
      rule: P('One symptom, one tool, one small step.'),
    }),
    'Closing (5 min). Read the which tool when table out loud once, then ask each table to name one need in their own project and the tool they would try first. Say the take-home line: pick one class in your project, do one small named step, commit. The deep dive has the full symptom to tool table and the not the same as table. Preview only: the next class covers animation, including state machines in the Animator. Remaining time is buffer for questions. Timing so far: 119 min, about 1 min buffer, 120 min in total.'),
];



// Read template from basics2
const basics2Path = path.resolve('presentation_basics2/presentation_unity6_basics2.html');
const basics2Content = fs.readFileSync(basics2Path, 'utf8');

// Extract CSS up to </style>
const styleMatch = basics2Content.match(/<style>([\s\S]*?)<\/style>/);
let cssStyles = styleMatch ? styleMatch[1] : '';

// Sanitize cssStyles so that card dimensions and flex can be overridden by user resizing / edit mode
cssStyles = cssStyles
    .replace(/flex:\s*0\s+0\s+auto\s*!important;/g, 'flex: 0 0 auto;')
    .replace(/height:\s*auto\s*!important;/g, 'height: auto;')
    .replace(/min-height:\s*auto\s*!important;/g, 'min-height: auto;')
    .replace(/\.tier-selector\s*\{[\s\S]*?\.tier-btn\.active-exp\s*\{[^}]*\}\s*/g, '');

// Build the full HTML document
const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <link rel="icon" type="image/jpeg" href="../HR_Logo.jpg">
    <title>Lesson 10: Game Architecture 2: State Machines, Commands &amp; Safe Refactoring (Unity 6) &bull; HR Minor GDD</title>
    <script src="https://unpkg.com/mqtt/dist/mqtt.min.js"></script>
    <style>
${cssStyles}
        :root {
            --font-scale: 1;
            --slide-font-scale: 1;
            --card-font-scale: 1;
            --effective-font-scale: calc(var(--slide-font-scale, 1) * var(--card-font-scale, 1) * var(--font-scale, 1));
        }

        .slide-viewport,
        .slide-content-area,
        .content-card,
        .media-panel-card {
            --effective-font-scale: calc(var(--slide-font-scale, 1) * var(--card-font-scale, 1) * var(--font-scale, 1));
        }

        .content-card,
        .media-panel-card {
            position: relative;
        }

        /* Responsive Container-Query Typography Calibrated for 16:9 Viewport */
        .slide-content-area {
            font-size: calc(clamp(0.72rem, 1.65cqh, 0.95rem) * var(--effective-font-scale, 1));
        }

        .slide-content-area .card-title,
        .card-title {
            font-size: calc(clamp(0.85rem, 2.0cqh, 1.15rem) * var(--effective-font-scale, 1));
        }

        .slide-content-area .card-body,
        .card-body {
            font-size: calc(clamp(0.70rem, 1.55cqh, 0.90rem) * var(--effective-font-scale, 1));
            line-height: 1.45;
        }

        .slide-content-area .card-body ul,
        .slide-content-area .card-body ol,
        .slide-content-area .card-body li {
            font-size: inherit !important;
            line-height: 1.45 !important;
        }

        .slide-content-area .dense-table th,
        .slide-content-area .dense-table td,
        .dense-table th,
        .dense-table td {
            font-size: calc(clamp(0.68rem, 1.45cqh, 0.85rem) * var(--effective-font-scale, 1));
            padding: 0.35cqh 0.8cqw !important;
        }

        .content-card,
        .media-panel-card {
            padding: 1.0cqh 1.2cqw !important;
        }

        .media-panel-card {
            font-size: calc(clamp(0.68rem, 1.45cqh, 0.82rem) * var(--effective-font-scale, 1));
        }

        .slide-content-area h1 { font-size: calc(clamp(1.2rem, 2.8cqh, 1.8rem) * var(--effective-font-scale, 1)); }
        .slide-content-area h2 { font-size: calc(clamp(1.05rem, 2.3cqh, 1.4rem) * var(--effective-font-scale, 1)); }
        .slide-content-area h3 { font-size: calc(clamp(0.92rem, 1.9cqh, 1.15rem) * var(--effective-font-scale, 1)); }
        .slide-content-area h4 { font-size: calc(clamp(0.82rem, 1.7cqh, 1.0rem) * var(--effective-font-scale, 1)); }

        /* ==========================================================================
           JetBrains Rider / Unity C# Syntax Highlighting Theme
           ========================================================================== */
        .code-box,
        .code-container {
            background: #1e1f22 !important;
            border: 1px solid #393b40 !important;
            border-radius: 8px !important;
            overflow: hidden !important;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45);
            margin: 6px 0 !important;
            position: relative;
        }

        .slide-content-area .code-box pre,
        .slide-content-area .code-container pre,
        .code-box pre,
        .code-container pre {
            background: #1e1f22 !important;
            color: #a9b7c6 !important;
            font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace !important;
            font-size: calc(clamp(0.54rem, 1.08cqh, 0.65rem) * var(--effective-font-scale, 1));
            line-height: 1.20 !important;
            padding: 0.6cqh 0.8cqw !important;
            margin: 0 !important;
            max-height: 75cqh !important;
            overflow-y: auto !important;
            overflow-x: auto !important;
            white-space: pre !important;
            word-break: normal !important;
            word-wrap: normal !important;
        }

        .code-box pre code,
        .code-container pre code {
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
            color: inherit !important;
            font-family: inherit !important;
            font-size: inherit !important;
            white-space: pre !important;
        }

        .jb-editor-header,
        .code-box .code-header,
        .code-container .code-header {
            background: #2b2d30 !important;
            border-bottom: 1px solid #393b40 !important;
            padding: 4px 10px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            user-select: none;
            min-height: 28px;
            box-sizing: border-box;
        }

        .jb-editor-tab {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #1e1f22;
            padding: 3px 10px;
            border-radius: 5px 5px 0 0;
            border: 1px solid #393b40;
            border-bottom: 1px solid #1e1f22;
            margin-bottom: -5px;
            color: #dfe1e5;
            font-size: 0.73rem;
            font-family: 'JetBrains Mono', Consolas, monospace;
            font-weight: 600;
        }

        .jb-csharp-icon {
            background: linear-gradient(135deg, #178600 0%, #239120 100%);
            color: #ffffff;
            font-size: 0.60rem;
            font-weight: 900;
            padding: 1px 4px;
            border-radius: 3px;
            line-height: 1.1;
            display: inline-block;
            letter-spacing: -0.2px;
        }

        .jb-filename {
            color: #dfe1e5;
            font-family: 'JetBrains Mono', Consolas, monospace;
        }

        .code-copy-btn {
            font-size: 0.68rem !important;
            padding: 2px 8px !important;
            border-radius: 4px !important;
            background: #393b40 !important;
            color: #bcbec4 !important;
            border: 1px solid #4e5157 !important;
            cursor: pointer !important;
            transition: all 0.12s ease !important;
        }
        .code-copy-btn:hover {
            background: #4e5157 !important;
            color: #ffffff !important;
            border-color: #6897bb !important;
        }

        /* JetBrains Rider Syntax Classes */
        .jb-keyword { color: #cc7832 !important; }
        .jb-type { color: #a9b7c6 !important; }
        .jb-method { color: #ffc66d !important; }
        .jb-event { font-weight: 600; }
        .jb-number { color: #6897bb !important; }
        .jb-string { color: #6a8759 !important; }
        .jb-attr { color: #bbb529 !important; }
        .jb-comment { color: #808080 !important; font-style: italic !important; }
        .jb-plain { color: #a9b7c6 !important; }

        .slide-content-area .punchy-point {
            font-size: calc(clamp(0.68rem, 1.45cqh, 0.82rem) * var(--effective-font-scale, 1));
            margin-bottom: 0.3cqh !important;
        }

        .split-media-layout {
            display: grid !important;
            grid-template-columns: 1.05fr 0.95fr !important;
            gap: 1.6cqw !important;
            align-items: start !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            flex: 0 0 auto !important;
            overflow: visible !important;
        }

        .split-media-layout .left-column,
        .split-media-layout .right-column {
            display: flex !important;
            flex-direction: column !important;
            gap: 1cqh !important;
            justify-content: flex-start !important;
            min-height: 0 !important;
            height: auto !important;
            width: 100% !important;
            overflow: visible !important;
        }

        .split-media-layout .left-column .content-card,
        .split-media-layout .right-column .content-card {
            flex: 0 0 auto;
            height: auto;
            min-height: 0;
            padding: 1.4cqh 1.8cqw !important;
        }

        /* Semantic Card Theme Variations */
        .content-card.primary {
            border-left: 6px solid #059669 !important;
            background: #ffffff;
        }
        .content-card.primary .card-title,
        .card-title.primary,
        .card-title.core {
            color: #059669 !important;
        }

        .content-card.danger,
        .content-card.warning-card {
            border-left: 6px solid #ef4444 !important;
            background: #fff5f5;
        }
        .content-card.danger .card-title,
        .card-title.danger {
            color: #b91c1c !important;
        }

        .content-card.info,
        .content-card.adv-card {
            border-left: 6px solid #0284c7 !important;
            background: #f0f9ff;
        }
        .content-card.info .card-title,
        .card-title.info,
        .card-title.adv {
            color: #0369a1 !important;
        }

        .content-card.exp-card {
            border-left: 6px solid #7c3aed !important;
            background: #faf5ff;
        }
        .card-title.exp {
            color: #6d28d9 !important;
        }

        .content-card.success {
            border-left: 6px solid #10b981 !important;
            background: #f0fdf4;
        }
        .card-title.success {
            color: #047857 !important;
        }

        .content-stack {
            display: flex !important;
            flex-direction: column !important;
            gap: 1.2cqh !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            flex: 0 0 auto !important;
        }

        /* High-contrast WCAG 2.1 AA legibility guarantees */
        .punchy-tag {
            color: #ffffff !important;
            border: none !important;
        }

        code:not(pre code) {
            background: #f1f5f9;
            color: #0f172a;
            padding: 1px 5px;
            border-radius: 4px;
            font-family: Consolas, Monaco, "Courier New", Courier, monospace;
            font-size: 0.88em;
            border: 1px solid #cbd5e1;
        }

        .media-panel-card code:not(pre code) {
            background: rgba(255, 255, 255, 0.12);
            color: #38bdf8;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .view-interactive.hr-inverted-slide code:not(pre code) {
            background: rgba(255, 255, 255, 0.2);
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.35);
        }

        .slide-footer .footer-brand-text {
            color: #475569 !important;
            font-weight: 700;
        }

        .view-interactive.hr-inverted-slide .slide-footer .footer-brand-text {
            color: #ffffff !important;
        }

        .view-interactive.hr-inverted-slide {
            background: #d80041 !important;
            color: #ffffff !important;
        }

        .view-interactive.hr-inverted-slide .content-card {
            background: #b50036 !important;
            border: 1.5px solid rgba(255, 255, 255, 0.4) !important;
            border-left: 6px solid #ffffff !important;
            color: #ffffff !important;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        .view-interactive.hr-inverted-slide .card-title,
        .view-interactive.hr-inverted-slide .card-body,
        .view-interactive.hr-inverted-slide .card-body strong,
        .view-interactive.hr-inverted-slide .card-body li {
            color: #ffffff !important;
        }

        .brand-title {
            font-size: 0.9rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .brand-logo,
        .brand-title img {
            width: 28px !important;
            height: 28px !important;
            min-width: 28px !important;
            max-width: 28px !important;
            min-height: 28px !important;
            max-height: 28px !important;
            border-radius: 50% !important;
            object-fit: cover !important;
            border: 1.5px solid var(--hr-red) !important;
            flex-shrink: 0 !important;
            display: inline-block !important;
        }

        /* ==========================================================================
           LECTURE MODE VIEWPORT CONTAINMENT & PROGRESSIVE DISCLOSURE
           ========================================================================== */
        body.lecture-mode .slide-viewport {
            container-type: size !important;
            overflow: hidden !important;
        }

        body.lecture-mode .view-interactive {
            overflow-y: auto !important;
            overflow-x: hidden !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            box-sizing: border-box !important;
            height: 100% !important;
            max-height: 100% !important;
        }

        /* Sleek unobtrusive custom scrollbar in Lecture Mode */
        body.lecture-mode .view-interactive::-webkit-scrollbar {
            width: 6px;
        }
        body.lecture-mode .view-interactive::-webkit-scrollbar-track {
            background: transparent;
        }
        body.lecture-mode .view-interactive::-webkit-scrollbar-thumb {
            background: rgba(148, 163, 184, 0.35);
            border-radius: 4px;
        }
        body.lecture-mode .view-interactive::-webkit-scrollbar-thumb:hover {
            background: rgba(100, 116, 139, 0.65);
        }

        body.lecture-mode .slide-content-area {
            max-height: calc(100% - 70px) !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
            flex: 1 1 auto !important;
            min-height: 0 !important;
        }

        body.lecture-mode .lab-deep-dive,
        body.lecture-mode .lab-only,
        body.lecture-mode details.slide-accordion,
        body.lecture-mode details.tier-accordion {
            display: none !important;
        }

        body.lecture-mode .lecture-only {
            display: block !important;
        }

        body.lab-mode .lecture-only {
            display: none !important;
        }

        body.lab-mode .slide-viewport {
            overflow: hidden !important;
        }

        body.lab-mode .view-interactive {
            overflow-y: auto !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
            gap: 12px !important;
            padding: 16px 24px !important;
            box-sizing: border-box !important;
        }

        /* Clean Scrollbar in Lab Mode */
        body.lab-mode .view-interactive::-webkit-scrollbar {
            width: 8px;
        }
        body.lab-mode .view-interactive::-webkit-scrollbar-track {
            background: #0f172a;
        }
        body.lab-mode .view-interactive::-webkit-scrollbar-thumb {
            background: #334155;
            border-radius: 4px;
        }
        body.lab-mode .view-interactive::-webkit-scrollbar-thumb:hover {
            background: #475569;
        }

        body.lab-mode .slide-content-area {
            overflow: visible !important;
            height: auto !important;
            min-height: auto !important;
            max-height: none !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
        }

        body.lab-mode .content-stack {
            overflow: visible !important;
            height: auto !important;
        }

        body.lab-mode .split-media-layout {
            overflow: visible !important;
            height: auto !important;
            min-height: auto !important;
        }

        /* Lab Mode Deep-Dive Study Guide Card */
        .lab-deep-dive {
            margin-top: 10px;
            padding: 12px 16px;
            background: #ffffff;
            border: 2px solid #0284c7;
            border-left: 6px solid #0284c7;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
            color: #0f172a;
            text-align: left;
            box-sizing: border-box;
            width: 100%;
            display: none;
        }

        body.lab-mode .lab-deep-dive {
            display: block !important;
        }

        .lab-deep-dive-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1.5px solid #e2e8f0;
            padding-bottom: 6px;
            margin-bottom: 8px;
            flex-wrap: wrap;
            gap: 6px;
        }

        .lab-deep-dive-title {
            font-size: 0.88rem;
            font-weight: 900;
            color: #0369a1;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .lab-deep-dive-badge {
            background: #e0f2fe;
            color: #0284c7;
            font-size: 0.68rem;
            font-weight: 800;
            padding: 2px 8px;
            border-radius: 12px;
            border: 1px solid #bae6fd;
            text-transform: uppercase;
        }

        .lab-mental-model {
            background: #f0fdf4;
            border: 1.5px solid #86efac;
            border-radius: 8px;
            padding: 8px 12px;
            margin-bottom: 8px;
            color: #14532d;
            font-size: 0.80rem;
            line-height: 1.45;
        }

        .lab-grid-2col {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 8px;
            margin-bottom: 8px;
        }

        .dd-grid { grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); margin-bottom: 0; }
        .dd-side { min-width: 0; }
        .dd-label { display: inline-block; font-weight: 800; font-size: 0.78rem; padding: 1px 10px; border-radius: 999px; margin-bottom: 4px; color: #ffffff; }
        .dd-label.bad { background: #b91c1c; }
        .dd-label.good { background: #059669; }
        .dd-note { font-size: 0.76rem; font-weight: 700; margin-top: 4px; }
        .dd-note.bad { color: #991b1b; }
        .dd-note.good { color: #166534; }
        .dd-main .dd-grid { grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 6px; }
        .dd-main .dd-label { font-size: calc(clamp(1rem, 2.3cqh, 1.3rem) * var(--effective-font-scale, 1)); }
        .dd-main .dd-note { font-size: calc(clamp(0.95rem, 2.1cqh, 1.2rem) * var(--effective-font-scale, 1)); }
        .dd-main .code-box pre { font-size: calc(0.95rem * var(--effective-font-scale, 1)) !important; line-height: 1.35 !important; max-height: none !important; }
        .dd-main .jb-editor-tab { font-size: 0.85rem; }
        .dd-line { margin: 0 0 4px 0; font-weight: 700; }

        .lab-box-neutral {
            background: #f8fafc;
            border: 1.5px solid #e2e8f0;
            border-radius: 8px;
            padding: 8px 10px;
            font-size: 0.78rem;
            line-height: 1.45;
            color: #334155;
        }

        .lab-box-trap {
            background: #fef2f2;
            border: 1.5px solid #fca5a5;
            border-radius: 8px;
            padding: 8px 12px;
            margin-bottom: 8px;
            color: #7f1d1d;
            font-size: 0.78rem;
            line-height: 1.45;
        }

        .lab-box-rule {
            background: #eff6ff;
            border: 1.5px solid #bfdbfe;
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 0.80rem;
            color: #1e40af;
            line-height: 1.45;
        }

        /* Accordion Styling (Standardized) */
        details.slide-accordion,
        details.tier-accordion {
            border-radius: 8px;
            overflow: hidden;
            margin-top: 8px;
            border: 1.5px solid #cbd5e1;
            border-left: 5px solid #0284c7;
            background: #f0f9ff;
            box-shadow: 0 2px 6px rgba(0,0,0,0.03);
            width: 100%;
            box-sizing: border-box;
            transition: all 0.15s ease;
        }

        body.lecture-mode details.slide-accordion,
        body.lecture-mode details.tier-accordion {
            display: none !important;
        }

        body.lab-mode details.slide-accordion,
        body.lab-mode details.tier-accordion {
            display: block !important;
        }

        summary.accordion-header {
            font-weight: 800;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 12px;
            font-size: 0.82rem;
            color: #0369a1;
            user-select: none;
            -webkit-user-select: none;
        }

        summary.accordion-header::-webkit-details-marker {
            display: none;
        }

        summary.accordion-header .accordion-expand,
        summary.accordion-header span:last-child {
            font-size: 0.75rem;
        }

        .accordion-body {
            padding: 8px 14px;
            border-top: 1px solid #e2e8f0;
            font-size: 0.80rem;
            line-height: 1.45;
            color: #334155;
            background: #ffffff;
        }
    </style>
</head>
<body class="lecture-mode">
    <!-- Top University Brand Bar -->
    <header class="top-bar">
        <div class="brand-title">
            <img class="brand-logo" src="assets/HR_Logo.jpg" onerror="this.onerror=null; this.src='../HR_Logo.jpg';" style="width: 28px; height: 28px; min-width: 28px; max-width: 28px; min-height: 28px; max-height: 28px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--hr-red); flex-shrink: 0;" alt="HR Logo">
            <span>HR CMGT &bull; Lesson 10: Game Architecture 2 &bull; <strong>Modern Unity 6</strong></span>
        </div>

    </header>

    <!-- Main Workspace -->
    <div class="main-workspace">
        <!-- Slide Drawer -->
        <nav class="slide-drawer" id="slideDrawer"></nav>

        <!-- Stage Area -->
        <main class="stage-area" id="stageArea">
            <div class="slide-viewport" id="viewport" style="position: relative;">
                <!-- Modern Slide View -->
                <div id="interactiveSlide" class="view-interactive" style="display: flex; width: 100%; height: 100%;">
                    <div class="slide-header" id="slideHeader">
                        <div class="slide-title-banner" id="slideTitle"></div>
                    </div>
                    <div class="slide-content-area" id="slideContentArea"></div>
                    <div class="slide-footer">
                        <span class="footer-brand-text" style="font-size: 0.65rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">Hogeschool Rotterdam &bull; Minor Game Design &amp; Development &bull; Lesson 10</span>
                    </div>
                </div>

                <!-- Pace Speed Bubble -->
                <div id="paceSpeedBubble" class="pace-speed-bubble" onclick="clearAllPaceFlags()" title="Student flags: click to clear">0</div>
            </div>
        </main>
    </div>

    <!-- Bottom Navigation Bar -->
    <footer class="bottom-bar">
        <div style="display: flex; align-items: center; gap: 8px;">
            <button class="nav-btn" id="prevBtn" onclick="changeSlide(-1)">&larr; Previous</button>
            <button class="nav-btn" id="btnFullscreen" onclick="toggleFullscreen()" title="Toggle Fullscreen [F]">Fullscreen [F]</button>
            <button class="nav-btn" id="btnHelp" onclick="toggleHelpModal(true)" title="View Keyboard Shortcuts [?]">[?] Shortcuts</button>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
            <div class="viewmode-toggle" title="Switch View Mode">
                <button class="viewmode-btn active" id="btnViewLecture" onclick="setViewMode('lecture')">Lecture Mode</button>
                <button class="viewmode-btn" id="btnViewLab" onclick="setViewMode('lab')">Lab Mode</button>
            </div>
            <div class="font-slider-wrap" title="Adjust text font size">
                <span class="font-slider-label">Font:</span>
                <input type="range" id="fontScaleSlider" class="font-slider-ctrl" min="70" max="140" value="100" step="5" oninput="setFontScale(this.value)">
                <span id="fontScaleValue" class="font-slider-val">100%</span>
            </div>
            <span class="mode-indicator new" id="modeBadge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid #10b981; padding: 3px 8px; border-radius: 4px; font-size: 0.72rem; font-weight: 800; text-transform: uppercase;">Unity 6 Blockout</span>
        </div>

        <div style="display: flex; align-items: center; gap: 14px;">
            <span class="slide-counter" id="slideCounter">Slide 1 / ${slidesData.length}</span>
            <button class="nav-btn" id="nextBtn" onclick="changeSlide(1)">Next &rarr;</button>
        </div>
    </footer>

    <!-- Keyboard Shortcut Help Modal [?] -->
    <div id="helpModal" class="help-modal" style="display: none;" onclick="if(event.target===this) toggleHelpModal(false)">
        <div class="help-modal-content">
            <div class="help-modal-header">
                <h3>Keyboard Shortcuts</h3>
                <button class="help-close-btn" onclick="toggleHelpModal(false)">&times;</button>
            </div>
            <div class="shortcut-list">
                <div class="shortcut-row"><span class="shortcut-key">&rarr; / Space</span><span>Next Slide</span></div>
                <div class="shortcut-row"><span class="shortcut-key">&larr;</span><span>Previous Slide</span></div>
                <div class="shortcut-row"><span class="shortcut-key">F</span><span>Toggle Fullscreen</span></div>
                <div class="shortcut-row"><span class="shortcut-key">L</span><span>Toggle Lecture / Lab Mode</span></div>
                <div class="shortcut-row"><span class="shortcut-key">N</span><span>Speaker Notes</span></div>
                <div class="shortcut-row"><span class="shortcut-key">?</span><span>Show / Hide this Help</span></div>
                <div class="shortcut-row"><span class="shortcut-key">Esc</span><span>Close Dialogs</span></div>
            </div>
        </div>
    </div>

    <!-- Presenter Speaker Notes Modal [N] -->
    <div id="notesModal" class="help-modal" style="display: none;" onclick="if(event.target===this) toggleSpeakerNotes(false)">
        <div class="help-modal-content" style="max-width: 620px; border-left: 5px solid #38bdf8;">
            <div class="help-modal-header">
                <h3 style="color: #38bdf8; font-weight: 800;">Speaker Notes [N]</h3>
                <button class="help-close-btn" onclick="toggleSpeakerNotes(false)">&times;</button>
            </div>
            <div id="speakerNotesBody" style="font-size: 0.92rem; line-height: 1.6; color: #f1f5f9; padding: 10px 0;"></div>
        </div>
    </div>

    <!-- Script Block -->
    <script>
        var slidesData = ${JSON.stringify(slidesData, null, 2)};
        var currentSlide = 0;
        window.slidesData = slidesData;
        window.currentSlide = currentSlide;
        let viewMode = 'lecture';
        let challengeTimers = {};
        let challengeRemaining = {};

        function init() {
            try {
                // One-time migration/purge of corrupted duplicate keys from previous edit-mode bug
                const corruptCheck = localStorage.getItem('hr_edit_v1_presentation_architecture2_s4_title') ||
                                     localStorage.getItem('hr_deck_v2_presentation_architecture2_s4_title');
                if (corruptCheck && corruptCheck.includes('Universal 3D Spatial Metrics')) {
                    for (let i = localStorage.length - 1; i >= 0; i--) {
                        const k = localStorage.key(i);
                        if (k && (k.includes('presentation_architecture2') || k.includes('hr_edit_v1_') || k.includes('hr_deck_v2_'))) {
                            localStorage.removeItem(k);
                        }
                    }
                }
            } catch(e) {}
            let savedMode = 'lecture';
            try { savedMode = localStorage.getItem('hr_gdd_viewmode') || 'lecture'; } catch (e) {}
            let savedFontScale = 100;
            try { savedFontScale = localStorage.getItem('gdd_font_scale') || 100; } catch (e) {}
            setFontScale(savedFontScale);
            buildDrawer();
            setupKeyboard();
            setViewMode(savedMode);
            renderSlide();
        }

        function buildDrawer() {
            const drawer = document.getElementById('slideDrawer');
            if (!drawer) return;
            drawer.innerHTML = '';
            slidesData.forEach((s, i) => {
                const item = document.createElement('div');
                item.className = 'drawer-item' + (i === currentSlide ? ' active' : '');
                item.onclick = () => selectSlide(i);
                let title = s.title || "Slide " + (i + 1);
                if (s.isHero) title = "Overview & Topics";
                item.innerHTML = \`
                    <span class="drawer-num">\${(i + 1).toString().padStart(2, '0')}</span>
                    <span class="drawer-title">\${title}</span>
                \`;
                drawer.appendChild(item);
            });
        }

        function updateDrawerActive() {
            const items = document.querySelectorAll('.drawer-item');
            items.forEach((it, idx) => {
                it.classList.toggle('active', idx === currentSlide);
            });
            if (items[currentSlide]) {
                items[currentSlide].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }

        function renderSlide() {
            const s = slidesData[currentSlide];
            const interactive = document.getElementById('interactiveSlide');
            const header = document.getElementById('slideHeader');
            const titleEl = document.getElementById('slideTitle');
            const contentEl = document.getElementById('slideContentArea');

            if (!s || !contentEl || !interactive) return;

            interactive.scrollTop = 0;
            interactive.classList.remove('hr-inverted-slide');

            document.getElementById('slideCounter').textContent = \`Slide \${currentSlide + 1} / \${slidesData.length}\`;
            updateDrawerActive();

            if (s.isHero) {
                header.style.display = 'none';
                contentEl.innerHTML = \`
                    <div class="hero-wrapper" style="display: flex; flex-direction: column; justify-content: center; height: 100%; max-width: 900px; margin: 0 auto; padding: 20px;">
                        <span style="color: var(--hr-red); font-size: 0.90rem; font-weight: 900; letter-spacing: 1px; text-transform: uppercase;">Workshop &bull; 2-Hour Intensive</span>
                        <h1 style="font-size: 2.2rem; font-weight: 900; color: #0f172a; margin: 8px 0 6px 0; line-height: 1.2;">\${s.title}</h1>
                        <p style="font-size: 1.1rem; color: #334155; font-weight: 600; margin-bottom: 24px;">\${s.subtitle}</p>
                        
                        <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                            <div style="font-size: 0.85rem; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px;">Today's 6 Interactive Milestones:</div>
                            <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px;">
                                \${s.topics.map(t => \`<li style="display: flex; align-items: center; gap: 10px; font-size: 0.92rem; font-weight: 600; color: #1e293b;"><span style="color: var(--hr-red); font-weight: 900;">&bull;</span>\${t}</li>\`).join('')}
                            </ul>
                        </div>
                    </div>
                \`;
                return;
            }

            if (s.isInverted) {
                interactive.classList.add('hr-inverted-slide');
                header.style.display = 'none';
                let topicsHtml = '';
                if (s.topics && s.topics.length > 0) {
                    topicsHtml = \`
                        <div style="margin-top: 16px; background: rgba(0, 0, 0, 0.25); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 8px; padding: 12px 18px; text-align: left;">
                            <div style="font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: rgba(255, 255, 255, 0.9); margin-bottom: 8px;">Key Topics Covered:</div>
                            <ul style="list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                                \${s.topics.map(t => \`<li style="font-size: 0.88rem; font-weight: 600; color: #ffffff; display: flex; align-items: center; gap: 8px;"><span style="color: #ffffff; font-weight: 900;">&bull;</span>\${t}</li>\`).join('')}
                            </ul>
                        </div>
                    \`;
                }
                contentEl.innerHTML = \`
                    <div style="display: flex; flex-direction: column; justify-content: center; height: 100%; max-width: 860px; margin: 0 auto; padding: 24px; text-align: center;">
                        <span style="background: #ffffff; color: var(--hr-red); padding: 4px 14px; border-radius: 9999px; font-size: 0.85rem; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; display: inline-block; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); align-self: center;">Section Milestone</span>
                        <h1 style="font-size: 2.2rem; font-weight: 900; color: #ffffff; margin-bottom: 8px;">\${s.title}</h1>
                        <p style="font-size: 1.05rem; color: #ffffff; font-weight: 600; margin-bottom: 16px;">\${s.subtitle}</p>
                        \${s.content || ''}
                        \${topicsHtml}
                    </div>
                \`;
                return;
            }

            header.style.display = 'flex';
            titleEl.textContent = s.title;
            contentEl.innerHTML = s.content || '';
        }

        function changeSlide(direction) {
            selectSlide(currentSlide + direction);
        }

        function selectSlide(idx) {
            if (idx < 0 || idx >= slidesData.length) return;
            currentSlide = idx;
            window.currentSlide = idx;
            renderSlide();
        }

        function setViewMode(mode) {
            viewMode = mode;
            if (mode === 'lecture') {
                document.body.classList.remove('lab-mode');
                document.body.classList.add('lecture-mode');
            } else {
                document.body.classList.remove('lecture-mode');
                document.body.classList.add('lab-mode');
            }
            const btnLecture = document.getElementById('btnViewLecture');
            const btnLab = document.getElementById('btnViewLab');
            if (btnLecture) btnLecture.classList.toggle('active', mode === 'lecture');
            if (btnLab) btnLab.classList.toggle('active', mode === 'lab');
            try { localStorage.setItem('hr_gdd_viewmode', mode); } catch (e) {}
        }

        function toggleLectureLabMode() {
            setViewMode(viewMode === 'lecture' ? 'lab' : 'lecture');
        }

        function setFontScale(val) {
            const scale = parseFloat(val) / 100;
            document.documentElement.style.setProperty('--font-scale', scale);
            document.documentElement.style.setProperty('--lecture-font-scale', scale);
            const disp = document.getElementById('fontScaleValue');
            if (disp) disp.textContent = val + '%';
            const slider = document.getElementById('fontScaleSlider');
            if (slider && slider.value !== String(val)) slider.value = val;
            try { localStorage.setItem('gdd_font_scale', val); } catch (e) {}
        }

        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
            } else {
                document.exitFullscreen().catch(() => {});
            }
        }

        function toggleHelpModal(show) {
            const m = document.getElementById('helpModal');
            if (m) m.style.display = (show ?? m.style.display === 'none') ? 'flex' : 'none';
        }

        function toggleSpeakerNotes(show) {
            const m = document.getElementById('notesModal');
            if (!m) return;
            const open = (show ?? m.style.display === 'none');
            m.style.display = open ? 'flex' : 'none';
            if (open) {
                document.getElementById('speakerNotesBody').textContent = slidesData[currentSlide].notes || "No notes for this slide.";
            }
        }

        function formatTime(s) {
            const m = Math.floor(s / 60).toString().padStart(2, '0');
            const sec = (s % 60).toString().padStart(2, '0');
            return \`\${m}:\${sec}\`;
        }

        function lecturerStartTimer(timerId, totalSeconds) {
            if (challengeTimers[timerId]) clearInterval(challengeTimers[timerId]);
            challengeRemaining[timerId] = challengeRemaining[timerId] || totalSeconds;
            const disp = document.getElementById(timerId);

            challengeTimers[timerId] = setInterval(() => {
                challengeRemaining[timerId]--;
                if (disp) disp.textContent = formatTime(challengeRemaining[timerId]);
                if (challengeRemaining[timerId] <= 0) {
                    clearInterval(challengeTimers[timerId]);
                    if (disp) {
                        disp.textContent = "TIME UP!";
                        disp.style.color = "#ef4444";
                    }
                }
            }, 1000);
        }

        function lecturerPauseTimer(timerId) {
            if (challengeTimers[timerId]) {
                clearInterval(challengeTimers[timerId]);
                challengeTimers[timerId] = null;
            }
        }

        function lecturerResetTimer(timerId, totalSeconds) {
            lecturerPauseTimer(timerId);
            challengeRemaining[timerId] = totalSeconds;
            const disp = document.getElementById(timerId);
            if (disp) {
                disp.textContent = formatTime(totalSeconds);
                disp.style.color = "#38bdf8";
            }
        }

        function copyCode(btn) {
            if (window.DeckEditor && typeof window.DeckEditor.copyCode === 'function') {
                window.DeckEditor.copyCode(btn);
                return;
            }
            const pre = btn.closest('.code-box, .code-container, .content-card')?.querySelector('pre');
            if (!pre) return;
            const textToCopy = pre.innerText || pre.textContent;
            navigator.clipboard.writeText(textToCopy).then(() => {
                const orig = btn.textContent;
                btn.textContent = 'Gekopieerd!';
                btn.style.background = '#10b981';
                btn.style.color = '#ffffff';
                setTimeout(() => {
                    btn.textContent = orig;
                    btn.style.background = '';
                    btn.style.color = '';
                }, 1800);
            }).catch(() => {
                const ta = document.createElement('textarea');
                ta.value = textToCopy;
                document.body.appendChild(ta);
                ta.select();
                try {
                    document.execCommand('copy');
                    const orig = btn.textContent;
                    btn.textContent = 'Gekopieerd!';
                    btn.style.background = '#10b981';
                    btn.style.color = '#ffffff';
                    setTimeout(() => {
                        btn.textContent = orig;
                        btn.style.background = '';
                        btn.style.color = '';
                    }, 1800);
                } catch(e) {}
                document.body.removeChild(ta);
            });
        }
        window.copyCode = copyCode;
        if (typeof window.DeckEditor === 'undefined') {
            window.DeckEditor = { copyCode: copyCode };
        }

        function setupKeyboard() {
            document.addEventListener('keydown', (e) => {
                const active = document.activeElement;
                const isTyping = (e.target && (
                    e.target.tagName === 'INPUT' ||
                    e.target.tagName === 'TEXTAREA' ||
                    e.target.isContentEditable ||
                    (e.target.closest && e.target.closest('[contenteditable="true"]'))
                )) || (active && (
                    active.tagName === 'INPUT' ||
                    active.tagName === 'TEXTAREA' ||
                    active.isContentEditable ||
                    (active.closest && active.closest('[contenteditable="true"]'))
                ));
                if (isTyping) return;
                if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
                    e.preventDefault();
                    changeSlide(1);
                } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                    e.preventDefault();
                    changeSlide(-1);
                } else if (e.key === 'f' || e.key === 'F') {
                    e.preventDefault();
                    toggleFullscreen();
                } else if (e.key === 'l' || e.key === 'L') {
                    e.preventDefault();
                    toggleLectureLabMode();
                } else if (e.key === 'p' || e.key === 'P') {
                    e.preventDefault();
                    setViewMode('lecture');
                } else if (e.key === 'n' || e.key === 'N') {
                    e.preventDefault();
                    toggleSpeakerNotes();
                } else if (e.key === '?') {
                    e.preventDefault();
                    toggleHelpModal();
                } else if (e.key === 'Escape') {
                    toggleHelpModal(false);
                    toggleSpeakerNotes(false);
                } else if (e.key === 'Home') {
                    selectSlide(0);
                } else if (e.key === 'End') {
                    selectSlide(slidesData.length - 1);
                }
            });
        }

        window.onload = init;
    </script>
    <!-- Local Edit Mode Loader (Runs strictly in local development environments) -->
    <script>
        (function() {
            try {
                var isLocal = window.location.protocol === 'file:' || 
                              window.location.hostname === 'localhost' || 
                              window.location.hostname === '127.0.0.1' ||
                              window.location.hostname.startsWith('192.168.') ||
                              window.location.hostname.startsWith('10.');
                if (!isLocal) return;
                var scriptPaths = [
                    '../scripts/hr_deck_editor.js',
                    '../scripts/hr_edit_mode.js',
                    '../../scripts/hr_deck_editor.js',
                    '/scripts/hr_deck_editor.js',
                    'scripts/hr_deck_editor.js'
                ];
                var loaded = false;
                function tryLoad(idx) {
                    if (idx >= scriptPaths.length || loaded) return;
                    var s = document.createElement('script');
                    s.src = scriptPaths[idx];
                    s.onload = function() { loaded = true; };
                    s.onerror = function() { tryLoad(idx + 1); };
                    document.head.appendChild(s);
                }
                tryLoad(0);
            } catch(e) {}
        })();
    </script>
</body>
</html>
`;

// Output paths
const outPath = path.resolve('presentation_architecture2/presentation_unity6_architecture2.html');
const indexPath = path.resolve('presentation_architecture2/index.html');
const docsOutPath = path.resolve('docs/presentation_architecture2/presentation_unity6_architecture2.html');
const docsIndexPath = path.resolve('docs/presentation_architecture2/index.html');

fs.writeFileSync(outPath, fullHtml, 'utf8');
fs.writeFileSync(indexPath, fullHtml, 'utf8');

if (fs.existsSync(path.resolve('docs/presentation_architecture2'))) {
    fs.writeFileSync(docsOutPath, fullHtml, 'utf8');
    fs.writeFileSync(docsIndexPath, fullHtml, 'utf8');
}

console.log('Successfully generated Class 10 presentation:');
console.log(' - ' + outPath + ' (' + fs.statSync(outPath).size + ' bytes)');
console.log(' - ' + indexPath + ' (' + fs.statSync(indexPath).size + ' bytes)');
if (fs.existsSync(docsIndexPath)) {
    console.log(' - ' + docsOutPath + ' (' + fs.statSync(docsOutPath).size + ' bytes)');
    console.log(' - ' + docsIndexPath + ' (' + fs.statSync(docsIndexPath).size + ' bytes)');
}

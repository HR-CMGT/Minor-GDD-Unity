const fs = require('fs');
const path = require('path');

console.log('Generating Class 4 presentation: Game Architecture 1...');

const slidesData = [
  // Slide 1: Hero
  {
    isHero: true,
    title: "Dev - Basics 4: Game Architecture 1 – Decoupling & ScriptableObject Architecture",
    subtitle: "Minor Game Design & Development - Hogeschool Rotterdam",
    topics: [
      "1. Prefab as an API (The Black Box Encapsulation Pattern)",
      "2. The Spaghetti Code Trap (Why Direct Coupling Kills Scalability)",
      "3. ScriptableObject Event Channels (True Decoupling & Clean Architecture)",
      "4. Broadcasters & Listeners (Type Safety & Leak-Free Memory Lifecycle)",
      "5. The Singleton Pattern: Anti-Pattern vs Robust PersistentSingleton<T>",
      "6. Multi-Scene Architecture (Additive Scene Loading for Git Teams)"
    ],
    notes: "Lesson Overview (10 min): Welcome students to Class 4. Frame today around Game Architecture. In Classes 1-3 we built mechanics, inputs, UI, and data persistence. Now as projects grow, direct script references turn into unmaintainable spaghetti. Today we master Prefab Encapsulation, ScriptableObject Event Channels, clean Singletons, and Additive Scene Loading."
  },

  // Slide 2: Roadmap & 4 Milestones
  {
    title: "Course Roadmap & 4 Architecture Milestones",
    content: `
    <div class="content-stack">
        <div class="content-card primary" style="border-left-color: #0284c7; background: #f0f9ff; margin-bottom: 8px;">
            <div class="card-title core" style="color: #0369a1; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <span>Mobile Game Project Workflow &bull; Architecture Lab</span>
                <span style="background: #0284c7; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-size: 0.72rem; font-weight: 800;">No Package Required</span>
            </div>
            <div class="card-body" style="font-size: 0.84rem; color: #0c4a6e; line-height: 1.45; margin-top: 4px;">
                There is <strong>no starter package to download</strong> for Class 4. You will apply these decoupling patterns directly inside your team's ongoing <strong>mobile game project</strong> (or test them safely in a new scene <code>Assets/Class4/Class4_ArchitectureTest.unity</code>). All architecture patterns use native C# features and standard Unity 6 APIs.
            </div>
        </div>

        <div class="content-card primary">
            <div class="card-title core">4 Core Architecture Milestones</div>
            <div class="card-body">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px; margin-top: 6px;">
                    <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 10px 14px;">
                        <span style="font-weight: 800; color: #059669; font-size: 0.95rem;">1. Prefab as an API</span>
                        <p style="font-size: 0.88rem; color: #475569; margin-top: 4px;">Shield child components behind a clean root controller contract with <code>[SelectionBase]</code>.</p>
                    </div>
                    <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 10px 14px;">
                        <span style="font-weight: 800; color: #0284c7; font-size: 0.95rem;">2. SO Event Channels</span>
                        <p style="font-size: 0.88rem; color: #475569; margin-top: 4px;">Create ScriptableObject messaging assets (<code>IntEventChannelSO</code>, <code>VoidEventChannelSO</code>).</p>
                    </div>
                    <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 10px 14px;">
                        <span style="font-weight: 800; color: #d97706; font-size: 0.95rem;">3. Decoupled Listeners</span>
                        <p style="font-size: 0.88rem; color: #475569; margin-top: 4px;">Subscribe in <code>OnEnable</code> and unsubscribe in <code>OnDisable</code> for zero memory leaks.</p>
                    </div>
                    <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 10px 14px;">
                        <span style="font-weight: 800; color: #7c3aed; font-size: 0.95rem;">4. Additive Multi-Scene</span>
                        <p style="font-size: 0.88rem; color: #475569; margin-top: 4px;">Separate <code>_PersistentCore</code> from transient level scenes to prevent Git merge conflicts.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <details class="tier-accordion adv">
        <summary class="accordion-header">
            <span>[Advanced] Why Architecture Matters Now in Block 1</span>
            <span class="tier-badge adv">ADVANCED</span>
        </summary>
        <div class="accordion-body">
            In week 1-3, quick hacks work because you are building isolated features. In weeks 4-10, multiple team members commit simultaneously. Without clean event channels and prefab encapsulation, one teammate renaming a child GameObject breaks everyone else's code!
        </div>
    </details>
    `,
    notes: "Walk students through the 4 milestones. Emphasize that clean architecture is what separates student prototypes from commercial games that ship smoothly without bug regressions."
  },

  // Slide 3: The Architecture Problem: The Spaghetti Trap
  {
    title: "The Architecture Problem: The Spaghetti Trap",
    content: `
    <div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">How Prototypes Devolve into Chaos</div>
                <div class="card-body">
                    <p>When you start a prototype, it feels natural for the <code>Player</code> script to reference everything it needs:</p>
                    <div class="code-box" style="margin: 8px 0;">
                        <pre><code>// ❌ THE SPAGHETTI TRAP: 1 Script coupled to 6 Systems!
public class Player : MonoBehaviour {
    public HealthBarUI healthBar;
    public SoundManager soundManager;
    public ScreenFlasher screenFlasher;
    public ScoreManager scoreManager;
    public CameraShake cameraShake;
    public QuestTracker questTracker;
}</code></pre>
                    </div>
                    <p style="margin-top: 6px; font-size: 0.86rem; color: #dc2626; font-weight: 700;">
                        ⚠ What happens when you test the Player in a blank test scene? 6 NullReferenceExceptions on frame 1!
                    </p>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card">
                <div class="card-title core">Visualizing Direct Coupling</div>
                <div class="card-body">
                    <div style="background: #0f172a; border-radius: 8px; padding: 14px; text-align: center; color: #f8fafc; font-size: 0.85rem;">
                        <div style="display: inline-block; background: #dc2626; color: #fff; padding: 6px 14px; border-radius: 6px; font-weight: 900; margin-bottom: 12px;">
                            PLAYER SCRIPT (Broadcaster)
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.76rem;">
                            <div style="background: #1e293b; border: 1px dashed #f87171; padding: 6px; border-radius: 4px;">Tightly Bound to UI</div>
                            <div style="background: #1e293b; border: 1px dashed #f87171; padding: 6px; border-radius: 4px;">Tightly Bound to Audio</div>
                            <div style="background: #1e293b; border: 1px dashed #f87171; padding: 6px; border-radius: 4px;">Tightly Bound to VFX</div>
                            <div style="background: #1e293b; border: 1px dashed #f87171; padding: 6px; border-radius: 4px;">Tightly Bound to Quests</div>
                        </div>
                        <p style="margin-top: 10px; font-size: 0.78rem; color: #94a3b8;">
                            Any change in UI or Audio requires modifying the Player script!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <details class="tier-accordion core">
        <summary class="accordion-header">
            <span>Symptoms of Tight Coupling in Game Projects</span>
            <span class="tier-badge core">CORE</span>
        </summary>
        <div class="accordion-body">
            1. You cannot test your character in a lightweight gym scene without dragging in the whole Canvas and Game Managers.<br>
            2. Renaming or disabling a UI element causes physics or combat scripts to crash with MissingReferenceException.<br>
            3. Git merge conflicts spike because 4 team members are constantly editing <code>Player.cs</code>.
        </div>
    </details>
    `,
    notes: "Ask students: How many of you have opened a test scene to check a jump mechanic, and had Unity throw 10 red errors because GameManager or HealthBar wasn't in that scene? This slide shows why that happens."
  },

  // Slide 4: The 3 Core Architectural Principles
  {
    title: "The 3 Core Architectural Principles",
    content: `
    <div class="content-stack">
        <div class="content-card primary">
            <div class="card-title core">Foundations for Scalable Game Engineering</div>
            <div class="card-body">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 6px;">
                    <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-top: 4px solid #059669; border-radius: 8px; padding: 12px;">
                        <div style="font-weight: 900; color: #059669; font-size: 0.96rem;">1. Low Coupling</div>
                        <p style="font-size: 0.84rem; color: #334155; margin-top: 6px; line-height: 1.4;">
                            Classes know as little as possible about other classes. The <code>Player</code> should not know that a <code>HealthBarUI</code> even exists.
                        </p>
                    </div>
                    <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-top: 4px solid #0284c7; border-radius: 8px; padding: 12px;">
                        <div style="font-weight: 900; color: #0284c7; font-size: 0.96rem;">2. Prefab as Black Box</div>
                        <p style="font-size: 0.84rem; color: #334155; margin-top: 6px; line-height: 1.4;">
                            External systems only interact with the <strong>root script</strong>. They never reach into child sprites, hitboxes, or audio sources.
                        </p>
                    </div>
                    <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-top: 4px solid #d97706; border-radius: 8px; padding: 12px;">
                        <div style="font-weight: 900; color: #d97706; font-size: 0.96rem;">3. Events Up, Calls Down</div>
                        <p style="font-size: 0.84rem; color: #334155; margin-top: 6px; line-height: 1.4;">
                            Controllers call downward into components directly (<code>animator.Play()</code>), but notify the wider world <strong>upward via events</strong>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <details class="tier-accordion adv">
        <summary class="accordion-header">
            <span>[Industry Best Practice] The Law of Demeter</span>
            <span class="tier-badge adv">ADVANCED</span>
        </summary>
        <div class="accordion-body">
            Also known as the 'Principle of Least Knowledge': A method of an object may only call methods of itself, its fields, or parameters passed to it. Writing <code>player.weapon.bullet.trailRenderer.color = red;</code> violates this law and makes your code fragile.
        </div>
    </details>
    `,
    notes: "Break down 'Events Up, Calls Down'. When the player takes damage, the health component directly tells its own Animator to play the hurt clip (calls down), but broadcasts an event upward that it took damage. It does NOT command the UI to update."
  },

  // Slide 5: Prefab as an API: The Black Box Pattern
  {
    title: "Prefab as an API: The Black Box Pattern",
    content: `
    <div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">Encapsulation &amp; The Public Contract</div>
                <div class="card-body">
                    <p>A Prefab is not just a collection of sprites and colliders; it is a <strong>self-contained module</strong>.</p>
                    <ul style="font-size: 0.86rem; color: #334155; margin-top: 8px; line-height: 1.5; padding-left: 18px;">
                        <li><strong>Root Script = The Public API:</strong> Contains public methods like <code>TakeDamage()</code>, <code>Initialize()</code>, <code>Die()</code>.</li>
                        <li><strong>Child Hierarchy = Private Implementation:</strong> Sprites, Animators, AudioSources, and Hitboxes are hidden inside.</li>
                        <li><strong>Rule:</strong> Outside scripts NEVER call <code>GetComponentInChildren</code> or <code>transform.Find</code> on a prefab!</li>
                    </ul>
                    <div style="margin-top: 10px; background: #e0f2fe; border: 1px solid #bae6fd; border-radius: 6px; padding: 8px 12px; font-size: 0.82rem; color: #0369a1;">
                        💡 <strong>Pro-Tip:</strong> Add <code>[SelectionBase]</code> above your root MonoBehaviour class. Clicking any child sprite in the Scene View will always select the Root GameObject!
                    </div>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card">
                <div class="card-title core">Prefab Structure Anatomy</div>
                <div class="card-body">
                    <div class="hierarchy-box-tree">
                        <div class="hierarchy-node root-node">
                            <div class="hierarchy-node-header">
                                <span class="hierarchy-tag root">ROOT</span>
                                <span class="hierarchy-node-title">Enemy_Goblin (Root GameObject)</span>
                            </div>
                            <div class="hierarchy-node-desc">Contains <code>GoblinController.cs</code> (THE PUBLIC API)</div>
                        </div>
                        <div style="margin-left: 16px;" class="hierarchy-node child-node">
                            <div class="hierarchy-node-header">
                                <span class="hierarchy-tag child">CHILD</span>
                                <span class="hierarchy-node-title">Visuals (SpriteRenderer, Animator)</span>
                            </div>
                            <div class="hierarchy-node-desc">Private internal visual presentation</div>
                        </div>
                        <div style="margin-left: 16px;" class="hierarchy-node child-node">
                            <div class="hierarchy-node-header">
                                <span class="hierarchy-tag child">CHILD</span>
                                <span class="hierarchy-node-title">Hitboxes (Collider2D)</span>
                            </div>
                            <div class="hierarchy-node-desc">Private internal physics bounds</div>
                        </div>
                        <div style="margin-left: 16px;" class="hierarchy-node child-node">
                            <div class="hierarchy-node-header">
                                <span class="hierarchy-tag child">CHILD</span>
                                <span class="hierarchy-node-title">Audio (AudioSource)</span>
                            </div>
                            <div class="hierarchy-node-desc">Private internal sound playback</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <details class="tier-accordion core">
        <summary class="accordion-header">
            <span>Why [SelectionBase] Saves Hours of Level Design Frustration</span>
            <span class="tier-badge core">CORE</span>
        </summary>
        <div class="accordion-body">
            By default in Unity, clicking a character in Scene View selects whatever child sprite or collider your mouse hit. Adding <code>[SelectionBase]</code> forces Unity to select the prefab root, preventing accidental transformation offsets and broken hierarchies!
        </div>
    </details>
    `,
    notes: "Demonstrate [SelectionBase]. Mention that without it, level designers accidentally move the 'Visuals' child instead of the root, leaving the collider behind!"
  },

  // Slide 6: Prefab as an API: Production Implementation
  {
    title: "Prefab as an API: Production Implementation",
    content: `
    <div class="content-stack">
        <div class="content-card primary">
            <div class="card-title core">GoblinController.cs &bull; Root Public Interface</div>
            <div class="card-body">
                <div class="code-box">
                    <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                    <pre><code>using UnityEngine;

[SelectionBase]
public class GoblinController : MonoBehaviour
{
    [Header("Internal Components (Hidden from outside)")]
    [SerializeField] private Animator animator;
    [SerializeField] private AudioSource audioSource;
    [SerializeField] private AudioClip hitSound;

    public int CurrentHealth { get; private set; } = 50;
    public bool IsDead => CurrentHealth &lt;= 0;

    // THE PUBLIC API: External scripts call ONLY these methods
    public void TakeDamage(int damage)
    {
        if (IsDead) return;
        CurrentHealth = Mathf.Max(0, CurrentHealth - damage);

        if (animator != null) animator.SetTrigger("Hit");
        if (audioSource != null &amp;&amp; hitSound != null) audioSource.PlayOneShot(hitSound);

        if (IsDead) Die();
    }

    private void Die()
    {
        if (animator != null) animator.SetTrigger("Die");
        Destroy(gameObject, 1.2f);
    }
}</code></pre>
                </div>
                <p style="margin-top: 6px; font-size: 0.86rem; color: #475569;">
                    Calling script: <code>if (hit.TryGetComponent&lt;GoblinController&gt;(out var enemy)) enemy.TakeDamage(20);</code>
                </p>
            </div>
        </div>
    </div>
    <details class="tier-accordion adv">
        <summary class="accordion-header">
            <span>[Design Pattern] Facade Pattern in Unity</span>
            <span class="tier-badge adv">ADVANCED</span>
        </summary>
        <div class="accordion-body">
            This is the classic Gang of Four 'Facade Pattern'. The root script provides a unified, simplified interface to a subsystem of child components (animators, audio sources, colliders). If the internal implementation changes (e.g. replacing Animator with SpriteRenderer color flash), external scripts never need to change!
        </div>
    </details>
    `,
    notes: "Review this code carefully. Notice how all child references are [SerializeField] private. External scripts cannot touch the Animator, cannot touch the AudioSource, and cannot set CurrentHealth directly."
  },

  // Slide 7: Interactive Tool: Prefab Encapsulation Inspector
  {
    title: "Interactive Inspector: Encapsulation Violations",
    content: `
    <div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">Test Code Patterns for Architectural Safety</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; margin-bottom: 8px;">
                        Click each common Unity code pattern below to inspect its architecture safety rating:
                    </p>
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <button class="nav-btn" style="text-align: left; font-size: 0.80rem; font-family: monospace;" onclick="inspectPattern(1)">
                            Pattern A: enemy.transform.Find("Sprite").GetComponent...
                        </button>
                        <button class="nav-btn" style="text-align: left; font-size: 0.80rem; font-family: monospace;" onclick="inspectPattern(2)">
                            Pattern B: enemy.GetComponentInChildren&lt;AudioSource&gt;().Play()
                        </button>
                        <button class="nav-btn" style="text-align: left; font-size: 0.80rem; font-family: monospace;" onclick="inspectPattern(3)">
                            Pattern C: enemy.TakeDamage(25)
                        </button>
                        <button class="nav-btn" style="text-align: left; font-size: 0.80rem; font-family: monospace;" onclick="inspectPattern(4)">
                            Pattern D: spawner.SpawnWave(enemyPrefab)
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card">
                <div class="card-title core">Architecture Diagnosis</div>
                <div class="card-body">
                    <div id="inspectorDiagnosis" style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 14px; min-height: 180px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
                        <span style="font-size: 1.8rem; margin-bottom: 6px;">🔍</span>
                        <div style="font-weight: 800; color: #475569; font-size: 0.95rem;">Select a pattern on the left to inspect</div>
                        <p style="font-size: 0.82rem; color: #64748b; margin-top: 4px;">Evaluate hierarchy fragility, string dependencies, and encapsulation leaks.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    notes: "Interact with this tool on the projector. Have students guess whether each pattern is safe or dangerous before clicking."
  },

  // Slide 8: The Direct Reference Nightmare
  {
    title: "The Direct Reference Nightmare",
    content: `
    <div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">Why Direct References Break Scalability</div>
                <div class="card-body">
                    <p>Imagine your combat programmer creates an enemy:</p>
                    <div class="code-box" style="margin: 8px 0;">
                        <pre><code>public class BossCombat : MonoBehaviour {
    // ❌ Tight coupling across scene hierarchies
    [SerializeField] private PlayerHealth player;
    [SerializeField] private HealthBarUI bossHealthBar;
    [SerializeField] private AudioSource combatMusic;
    [SerializeField] private ParticleSystem victoryVFX;
    [SerializeField] private SceneLoader nextLevelLoader;
}</code></pre>
                    </div>
                    <ul style="font-size: 0.84rem; color: #475569; margin-top: 6px; line-height: 1.4; padding-left: 16px;">
                        <li>If any of these 5 references is unassigned in Inspector, runtime errors occur.</li>
                        <li>You cannot instantiate the Boss dynamically into a level.</li>
                        <li>The Boss cannot be prefabbed cleanly without broken dangling links!</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card">
                <div class="card-title core">The Missing Link Problem</div>
                <div class="card-body">
                    <div style="background: #fff1f2; border: 1.5px solid #fecdd3; border-radius: 8px; padding: 14px;">
                        <div style="color: #9f1239; font-weight: 800; font-size: 0.92rem;">The Prefab Inspector Warning:</div>
                        <p style="font-size: 0.84rem; color: #881337; margin-top: 6px; line-height: 1.45;">
                            Unity <strong>does not allow</strong> a Prefab asset in your Project folder to directly reference GameObjects inside a specific Scene.
                        </p>
                        <div style="background: #ffffff; border: 1px dashed #e11d48; border-radius: 6px; padding: 8px 12px; margin-top: 10px; font-family: monospace; font-size: 0.78rem; color: #be123c;">
                            MissingReferenceException: The object of type 'HealthBarUI' has been destroyed but you are still trying to access it.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <details class="tier-accordion core">
        <summary class="accordion-header">
            <span>Why GameObject.Find() is Not the Answer</span>
            <span class="tier-badge core">CORE</span>
        </summary>
        <div class="accordion-body">
            Some students try to solve this with <code>GameObject.Find("HealthBar").GetComponent&lt;HealthBarUI&gt;()</code>. This is even worse! It searches the entire scene graph by string comparison (O(N) performance hit), breaks the instant someone renames an object, and fails if the object is disabled.
        </div>
    </details>
    `,
    notes: "Explain why prefabs cannot reference scene objects. Prefabs live on disk (Project window); scene objects live in RAM (Hierarchy window). You cannot point a disk asset to a temporary memory address."
  },

  // Slide 9: ScriptableObject Event Channels: The Core Idea
  {
    title: "ScriptableObject Event Channels: The Solution",
    content: `
    <div class="content-stack">
        <div class="content-card primary">
            <div class="card-title core">What is a ScriptableObject Event Channel?</div>
            <div class="card-body">
                <p>A ScriptableObject lives in your <strong>Project folder</strong> (<code>Assets/Events/</code>), not in any scene. It acts as a neutral communication bridge:</p>
                <div style="display: grid; grid-template-columns: 1fr 1.2fr 1fr; gap: 12px; align-items: center; margin-top: 12px; text-align: center;">
                    <div style="background: #dbeafe; border: 2px solid #3b82f6; border-radius: 8px; padding: 12px;">
                        <span style="font-weight: 900; color: #1d4ed8; font-size: 0.95rem;">BROADCASTER</span>
                        <div style="font-size: 0.82rem; color: #1e3a8a; margin-top: 4px;">PlayerHealth.cs</div>
                        <p style="font-size: 0.76rem; color: #3b82f6; margin-top: 6px;">Raises event on channel: <code>channel.RaiseEvent(hp)</code></p>
                    </div>
                    <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 14px;">
                        <span style="font-weight: 900; color: #b45309; font-size: 1.05rem;">EVENT CHANNEL (Asset)</span>
                        <div style="font-size: 0.84rem; color: #78350f; font-weight: 700; margin-top: 4px;">PlayerHealthChannel.asset</div>
                        <p style="font-size: 0.78rem; color: #92400e; margin-top: 6px;">Neutral ScriptableObject Asset in Project Window</p>
                    </div>
                    <div style="background: #dcfce7; border: 2px solid #22c55e; border-radius: 8px; padding: 12px;">
                        <span style="font-weight: 900; color: #15803d; font-size: 0.95rem;">LISTENERS</span>
                        <div style="font-size: 0.82rem; color: #14532d; margin-top: 4px;">UI, SFX, Camera Shake</div>
                        <p style="font-size: 0.76rem; color: #16a34a; margin-top: 6px;">Subscribed to same asset in <code>OnEnable()</code></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <details class="tier-accordion adv">
        <summary class="accordion-header">
            <span>The Radio Broadcast Metaphor</span>
            <span class="tier-badge adv">ADVANCED</span>
        </summary>
        <div class="accordion-body">
            Think of the Event Channel as a radio frequency (e.g. 101.5 FM). The radio tower transmits audio into the air. If 0 cars are tuned in, it still broadcasts without crashing. If 1,000 cars are tuned in, all 1,000 play the music. The radio tower doesn't need to know the phone number of every car driver in the city!
        </div>
    </details>
    `,
    notes: "Use the radio broadcast metaphor. The broadcaster transmits on a frequency. Listeners tune their radios to that frequency. Zero coupling."
  },

  // Slide 10: Building Event Channels in C#
  {
    title: "Building Event Channels in C#",
    content: `
    <div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">IntEventChannelSO.cs (With Payload)</div>
                <div class="card-body">
                    <div class="code-box">
                        <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                        <pre><code>using System;
using UnityEngine;

[CreateAssetMenu(fileName = "IntEventChannel", 
    menuName = "Architecture/Events/Int Event Channel")]
public class IntEventChannelSO : ScriptableObject
{
    private Action&lt;int&gt; _onEventRaised;

    public void RaiseEvent(int value)
    {
        _onEventRaised?.Invoke(value);
    }

    public void RegisterListener(Action&lt;int&gt; listener)
    {
        _onEventRaised += listener;
    }

    public void UnregisterListener(Action&lt;int&gt; listener)
    {
        _onEventRaised -= listener;
    }
}</code></pre>
                    </div>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card">
                <div class="card-title core">VoidEventChannelSO.cs (No Payload)</div>
                <div class="card-body">
                    <div class="code-box">
                        <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                        <pre><code>using System;
using UnityEngine;

[CreateAssetMenu(fileName = "VoidEventChannel", 
    menuName = "Architecture/Events/Void Event Channel")]
public class VoidEventChannelSO : ScriptableObject
{
    private Action _onEventRaised;

    public void RaiseEvent() 
    {
        _onEventRaised?.Invoke();
    }

    public void RegisterListener(Action listener) 
    {
        _onEventRaised += listener;
    }

    public void UnregisterListener(Action listener) 
    {
        _onEventRaised -= listener;
    }
}</code></pre>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <details class="tier-accordion core">
        <summary class="accordion-header">
            <span>Why C# Action Over UnityEvent for Channels?</span>
            <span class="tier-badge core">CORE</span>
        </summary>
        <div class="accordion-body">
            Standard C# <code>System.Action</code> delegates have zero garbage collection allocations when invoked and execute orders of magnitude faster than <code>UnityEngine.Events.UnityEvent</code>, which relies on reflection and method pointer caching.
        </div>
    </details>
    `,
    notes: "Point out the CreateAssetMenu attribute. Right-clicking in Project View -> Create -> Architecture -> Events -> Int Event Channel creates an actual .asset file."
  },

  // Slide 11: The Broadcaster: Zero-Dependency Firing
  {
    title: "The Broadcaster: Zero-Dependency Firing",
    content: `
    <div class="content-stack">
        <div class="content-card primary">
            <div class="card-title core">PlayerHealth.cs &bull; Pure Broadcaster</div>
            <div class="card-body">
                <div class="code-box">
                    <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                    <pre><code>using UnityEngine;

public class PlayerHealth : MonoBehaviour
{
    [Header("Event Channels")]
    [SerializeField] private IntEventChannelSO onHealthChangedChannel;
    [SerializeField] private VoidEventChannelSO onPlayerDiedChannel;

    [SerializeField] private int maxHealth = 100;
    private int _currentHealth;

    private void Awake() => _currentHealth = maxHealth;

    public void TakeDamage(int damage)
    {
        if (_currentHealth &lt;= 0) return;
        _currentHealth = Mathf.Max(0, _currentHealth - damage);

        // Fire to whatever listeners are tuned into this channel
        if (onHealthChangedChannel != null)
        {
            onHealthChangedChannel.RaiseEvent(_currentHealth);
        }

        if (_currentHealth == 0 &amp;&amp; onPlayerDiedChannel != null)
        {
            onPlayerDiedChannel.RaiseEvent();
        }
    }
}</code></pre>
                </div>
                <p style="margin-top: 8px; font-size: 0.86rem; color: #047857; font-weight: 700;">
                    ✓ Zero references to Canvas, Slider, AudioSource, TextMeshPro, or ParticleSystem!
                </p>
            </div>
        </div>
    </div>
    <details class="tier-accordion core">
        <summary class="accordion-header">
            <span>How This Enables Rapid Automated &amp; Gym Testing</span>
            <span class="tier-badge core">CORE</span>
        </summary>
        <div class="accordion-body">
            You can drop this Player into a test gym scene with NO UI Canvas, NO Audio, and NO Camera script. When you take damage, <code>onHealthChangedChannel.RaiseEvent()</code> fires into the asset; nobody is registered, so nothing happens, and NOT A SINGLE error is thrown!
        </div>
    </details>
    `,
    notes: "Stress the testability benefit. You can test Player mechanics in complete isolation without loading UI, audio, or game managers."
  },

  // Slide 12: The Listeners: Memory Safety & Lifecycle
  {
    title: "The Listeners: Memory Safety & Lifecycle",
    content: `
    <div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">HealthBarUI.cs (Listener)</div>
                <div class="card-body">
                    <div class="code-box">
                        <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                        <pre><code>using UnityEngine;
using UnityEngine.UI;

public class HealthBarUI : MonoBehaviour
{
    [SerializeField] private IntEventChannelSO onHealthChangedChannel;
    [SerializeField] private Slider healthSlider;

    private void OnEnable()
    {
        if (onHealthChangedChannel != null)
            onHealthChangedChannel.RegisterListener(UpdateBar);
    }

    private void OnDisable()
    {
        // ⚠ MANDATORY: Prevent memory leaks!
        if (onHealthChangedChannel != null)
            onHealthChangedChannel.UnregisterListener(UpdateBar);
    }

    private void UpdateBar(int currentHealth)
    {
        if (healthSlider != null) 
            healthSlider.value = currentHealth;
    }
}</code></pre>
                    </div>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card">
                <div class="card-title core">The Golden Rule of C# Events</div>
                <div class="card-body">
                    <div style="background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 8px; padding: 12px;">
                        <span style="font-weight: 900; color: #dc2626; font-size: 0.90rem;">⚠ Always Unsubscribe in OnDisable()!</span>
                        <p style="font-size: 0.82rem; color: #7f1d1d; margin-top: 6px; line-height: 1.45;">
                            In C#, delegates hold a <strong>strong reference</strong> to the subscriber object. If you forget to unsubscribe in <code>OnDisable</code>:
                        </p>
                        <ul style="font-size: 0.78rem; color: #991b1b; margin-top: 6px; padding-left: 14px; line-height: 1.4;">
                            <li>The destroyed GameObject stays trapped in RAM (Garbage Collector cannot free it).</li>
                            <li>When the channel next raises an event, Unity crashes with <code>MissingReferenceException</code>!</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    notes: "Emphasize OnEnable / OnDisable pairing. Tell students: 'Every time you write RegisterListener, immediately write UnregisterListener in OnDisable before doing anything else!'"
  },

  // Slide 13: Interactive ScriptableObject Event Channel Bus Simulator
  {
    title: "Live Interactive Tool: SO Event Channel Bus",
    content: `
    <div style="background: #090d16; border: 1.5px solid #1e293b; border-radius: 10px; padding: 14px; color: #f8fafc;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 8px; margin-bottom: 12px;">
            <div style="font-weight: 900; color: #38bdf8; font-size: 0.96rem;">Decoupled Event Channel Architecture Simulator</div>
            <div style="font-size: 0.76rem; color: #94a3b8;">Click Broadcaster actions and observe independent listener responses</div>
        </div>
        
        <div style="display: grid; grid-template-columns: 220px 1fr 280px; gap: 14px; align-items: start;">
            <!-- Left: Broadcaster -->
            <div style="background: #111827; border: 1px solid #374151; border-radius: 8px; padding: 10px;">
                <div style="font-weight: 800; color: #60a5fa; font-size: 0.84rem; margin-bottom: 8px;">BROADCASTER (Player)</div>
                <div style="font-size: 0.76rem; color: #9ca3af; margin-bottom: 10px;">Player HP: <strong id="simHpText" style="color: #4ade80;">100</strong> / 100</div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <button class="nav-btn" style="background: #7f1d1d; border-color: #ef4444; color: #fff; font-size: 0.76rem; padding: 6px;" onclick="simDamage(25)">
                        💥 Take 25 Damage
                    </button>
                    <button class="nav-btn" style="background: #065f46; border-color: #10b981; color: #fff; font-size: 0.76rem; padding: 6px;" onclick="simHeal(25)">
                        💚 Heal 25 HP
                    </button>
                    <button class="nav-btn" style="background: #78350f; border-color: #f59e0b; color: #fff; font-size: 0.76rem; padding: 6px;" onclick="simCollectCoin(10)">
                        🪙 Collect 10 Coins
                    </button>
                    <button class="nav-btn" style="background: #374151; border-color: #6b7280; color: #fff; font-size: 0.76rem; padding: 6px;" onclick="simResetPlayer()">
                        🔄 Reset All
                    </button>
                </div>
            </div>

            <!-- Center: Event Channels -->
            <div style="background: #111827; border: 1px solid #374151; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 8px;">
                <div style="font-weight: 800; color: #f59e0b; font-size: 0.84rem;">EVENT CHANNELS (Project Assets)</div>
                
                <div id="busHealth" style="background: #1e293b; border: 1.5px solid #475569; border-radius: 6px; padding: 8px; transition: all 0.25s ease;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.78rem;">
                        <span style="font-weight: 700; color: #f8fafc;">OnHealthChangedSO</span>
                        <span id="subCountHealth" style="color: #38bdf8; font-size: 0.70rem; font-weight: 800;">3 Listeners</span>
                    </div>
                    <div id="pulseHealth" style="height: 3px; background: #475569; border-radius: 2px; margin-top: 6px; transition: background 0.3s ease;"></div>
                </div>

                <div id="busCoin" style="background: #1e293b; border: 1.5px solid #475569; border-radius: 6px; padding: 8px; transition: all 0.25s ease;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.78rem;">
                        <span style="font-weight: 700; color: #f8fafc;">OnScoreChangedSO</span>
                        <span id="subCountCoin" style="color: #38bdf8; font-size: 0.70rem; font-weight: 800;">2 Listeners</span>
                    </div>
                    <div id="pulseCoin" style="height: 3px; background: #475569; border-radius: 2px; margin-top: 6px; transition: background 0.3s ease;"></div>
                </div>

                <div id="simLog" style="background: #030712; border: 1px solid #1f2937; border-radius: 6px; padding: 6px 10px; font-family: monospace; font-size: 0.72rem; color: #10b981; min-height: 48px;">
                    [Ready] Broadcaster initialized. Zero direct dependencies.
                </div>
            </div>

            <!-- Right: Listeners -->
            <div style="background: #111827; border: 1px solid #374151; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 8px;">
                <div style="font-weight: 800; color: #4ade80; font-size: 0.84rem;">DECOUPLED LISTENERS</div>
                
                <!-- Listener 1: Health Bar -->
                <div style="background: #1f2937; border-radius: 6px; padding: 6px 8px; font-size: 0.76rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 700; color: #e5e7eb;">HealthBar UI</span>
                        <label style="font-size: 0.68rem; color: #9ca3af; display: flex; align-items: center; gap: 4px; cursor: pointer;">
                            <input type="checkbox" id="chkHealthUI" checked onchange="updateSubs()"> Subscribed
                        </label>
                    </div>
                    <div style="background: #374151; height: 8px; border-radius: 4px; margin-top: 4px; overflow: hidden;">
                        <div id="simHpBar" style="background: #22c55e; height: 100%; width: 100%; transition: width 0.3s ease;"></div>
                    </div>
                </div>

                <!-- Listener 2: Audio Manager -->
                <div style="background: #1f2937; border-radius: 6px; padding: 6px 8px; font-size: 0.76rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 700; color: #e5e7eb;">SFX Manager</span>
                        <label style="font-size: 0.68rem; color: #9ca3af; display: flex; align-items: center; gap: 4px; cursor: pointer;">
                            <input type="checkbox" id="chkAudio" checked onchange="updateSubs()"> Subscribed
                        </label>
                    </div>
                    <div id="simAudioWave" style="font-size: 0.70rem; color: #94a3b8; margin-top: 2px;">
                        🔊 Idle
                    </div>
                </div>

                <!-- Listener 3: Score Tracker -->
                <div style="background: #1f2937; border-radius: 6px; padding: 6px 8px; font-size: 0.76rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 700; color: #e5e7eb;">Score Counter</span>
                        <label style="font-size: 0.68rem; color: #9ca3af; display: flex; align-items: center; gap: 4px; cursor: pointer;">
                            <input type="checkbox" id="chkScore" checked onchange="updateSubs()"> Subscribed
                        </label>
                    </div>
                    <div id="simScoreText" style="font-weight: 800; color: #fbbf24; margin-top: 2px;">
                        Score: 0 pts
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    notes: "Demonstrate live on screen: Uncheck 'HealthBar UI' to simulate a disabled or missing UI. Click Take 25 Damage. Point out to the students that the Player script runs smoothly with ZERO NullReferenceExceptions!"
  },

  // Slide 14: Singletons: The Good, The Bad & The Ugly
  {
    title: "Singletons: The Good, The Bad & The Ugly",
    content: `
    <div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">Why Beginners Overuse GameManager.Instance</div>
                <div class="card-body">
                    <p>Every beginner tutorial says: <em>"Just make a static Instance so you can call it from anywhere!"</em></p>
                    <div class="code-box" style="margin: 8px 0;">
                        <pre><code>// ❌ THE NAIVE SINGLETON TRAP
public class GameManager : MonoBehaviour {
    public static GameManager Instance;
    void Awake() => Instance = this;
}</code></pre>
                    </div>
                    <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 6px; padding: 8px; font-size: 0.82rem; color: #9f1239;">
                        <strong>The Hidden Costs:</strong> Global mutable state (any script can overwrite data), impossible unit testing, and hidden spaghetti dependencies invisible in the Inspector.
                    </div>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card">
                <div class="card-title core">When is a Singleton Genuine &amp; Acceptable?</div>
                <div class="card-body">
                    <p style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                        Singletons should be reserved strictly for <strong>true global platform infrastructure</strong>:
                    </p>
                    <ul style="font-size: 0.82rem; color: #475569; margin-top: 6px; line-height: 1.4; padding-left: 16px;">
                        <li><strong>Persistent Audio Routing</strong> (hardware mixer buses).</li>
                        <li><strong>Platform Bridge</strong> (Steamworks API, Apple Game Center).</li>
                        <li><strong>Application Lifecycle</strong> (Save file disk I/O, pause management).</li>
                    </ul>
                    <p style="font-size: 0.82rem; color: #dc2626; font-weight: 700; margin-top: 8px;">
                        NEVER use Singletons for gameplay variables (player health, score, enemies)!
                    </p>
                </div>
            </div>
        </div>
    </div>
    <details class="tier-accordion adv">
        <summary class="accordion-header">
            <span>[Architecture Comparison] Singleton vs ScriptableObject Channel</span>
            <span class="tier-badge adv">ADVANCED</span>
        </summary>
        <div class="accordion-body">
            Singletons create <strong>pull dependencies</strong> (listeners constantly reach into GameManager to pull data). Event Channels create <strong>push broadcasts</strong> (broadcasters push data without knowing who receives it). Prefer push channels over global singletons!
        </div>
    </details>
    `,
    notes: "Contrast pull vs push architecture. With Singletons, everyone reaches in. With Event Channels, broadcasters push notifications out."
  },

  // Slide 15: The Multi-Scene Singleton Traps
  {
    title: "The Multi-Scene Singleton Traps",
    content: `
    <div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">Hazard 1: The Duplicate Clone Bug</div>
                <div class="card-body">
                    <p style="font-size: 0.85rem; color: #334155;">
                        You put <code>DontDestroyOnLoad(gameObject)</code> on your AudioManager. You play Level 1, then reload Level 1:
                    </p>
                    <div class="hierarchy-box-tree" style="margin: 8px 0;">
                        <div class="hierarchy-node root-node">
                            <div class="hierarchy-node-title">AudioManager (DontDestroyOnLoad) - Instance 1</div>
                        </div>
                        <div class="hierarchy-node root-node" style="border-left-color: #ef4444; background: #3b0764;">
                            <div class="hierarchy-node-title">AudioManager (Awake from reloaded scene) - Instance 2!</div>
                        </div>
                    </div>
                    <p style="font-size: 0.80rem; color: #dc2626; font-weight: 700;">
                        Now two AudioManagers fight for control and play double loud audio!
                    </p>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card">
                <div class="card-title core">Hazard 2: The Ghost Object on Application Quit</div>
                <div class="card-body">
                    <p style="font-size: 0.84rem; color: #334155; line-height: 1.45;">
                        When quitting Play Mode, Unity destroys GameObjects in arbitrary order. If another script's <code>OnDestroy()</code> calls <code>GameManager.Instance</code>:
                    </p>
                    <div style="background: #fffbeb; border: 1.5px solid #fde68a; border-radius: 6px; padding: 8px 12px; margin-top: 8px; font-size: 0.80rem; color: #92400e;">
                        <code>if (_instance == null) _instance = new GameObject("GameManager");</code>
                        <br>
                        👉 Unity spawns a <strong>ghost GameManager</strong> that persists in the Editor hierarchy even after Play Mode stops!
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    notes: "Explain the ghost object bug. Many students wonder why empty GameObjects stay in their scene after stopping play mode. It's caused by lazy singletons in OnDestroy!"
  },

  // Slide 16: Clean Generic PersistentSingleton<T>
  {
    title: "Clean Generic PersistentSingleton<T>",
    content: `
    <div class="content-stack">
        <div class="content-card primary">
            <div class="card-title core">Production Implementation with Quit-Safety</div>
            <div class="card-body">
                <div class="code-box">
                    <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                    <pre><code>using UnityEngine;

public abstract class PersistentSingleton&lt;T&gt; : MonoBehaviour where T : MonoBehaviour
{
    private static T _instance;
    private static bool _isQuitting = false;

    public static T Instance
    {
        get
        {
            if (_isQuitting) return null; // Avoid spawning ghost objects on exit!
            if (_instance == null)
            {
                _instance = FindFirstObjectByType&lt;T&gt;();
            }
            return _instance;
        }
    }

    protected virtual void Awake()
    {
        if (_instance == null)
        {
            _instance = this as T;
            DontDestroyOnLoad(gameObject);
        }
        else if (_instance != this)
        {
            // Destroy duplicate when reloading scenes!
            Destroy(gameObject);
        }
    }

    protected virtual void OnApplicationQuit() =&gt; _isQuitting = true;
}</code></pre>
                </div>
            </div>
        </div>
    </div>
    <details class="tier-accordion core">
        <summary class="accordion-header">
            <span>How to Inherit from PersistentSingleton</span>
            <span class="tier-badge core">CORE</span>
        </summary>
        <div class="accordion-body">
            To use this, simply declare your class as: <code>public class AudioManager : PersistentSingleton&lt;AudioManager&gt; { ... }</code>. If you override <code>Awake()</code> in your child class, remember to always call <code>base.Awake();</code>!
        </div>
    </details>
    `,
    notes: "Walk through the generic syntax where T : MonoBehaviour. This single abstract class replaces writing singleton boilerplate in 10 different scripts."
  },

  // Slide 17: Multi-Scene Architecture: Why Split Scenes?
  {
    title: "Multi-Scene Architecture: Why Split Scenes?",
    content: `
    <div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">The Git Merge Conflict Bottleneck</div>
                <div class="card-body">
                    <p style="font-size: 0.85rem; color: #334155;">
                        Unity <code>.unity</code> scene files are monolithic YAML text files. When two team members edit the same scene at the same time:
                    </p>
                    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 8px 12px; margin: 8px 0; font-size: 0.80rem; color: #991b1b; font-weight: 700;">
                        💥 Git Merge Conflict in GameScene.unity (Almost impossible to resolve manually!)
                    </div>
                    <p style="font-size: 0.84rem; color: #475569; line-height: 1.45;">
                        <strong>The Solution:</strong> Split your game into layered scenes! Level designers edit <code>Level_01.unity</code> while UI/System engineers edit <code>_PersistentCore.unity</code>.
                    </p>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card">
                <div class="card-title core">Layered Scene Hierarchy</div>
                <div class="card-body">
                    <div class="hierarchy-box-tree">
                        <div class="hierarchy-node root-node" style="border-left-color: #38bdf8;">
                            <div class="hierarchy-node-header">
                                <span class="hierarchy-tag root" style="background: #0284c7; color: #fff;">PERSISTENT</span>
                                <span class="hierarchy-node-title">_PersistentCore.unity</span>
                            </div>
                            <div class="hierarchy-node-desc">Camera, AudioListener, Canvas HUD, Global Managers</div>
                        </div>
                        <div class="hierarchy-node child-node" style="border-left-color: #10b981; margin-top: 6px;">
                            <div class="hierarchy-node-header">
                                <span class="hierarchy-tag child" style="background: #059669; color: #fff;">ADDITIVE</span>
                                <span class="hierarchy-node-title">Level_01.unity (Loaded Additively)</span>
                            </div>
                            <div class="hierarchy-node-desc">Tilemaps, Platforms, Enemy Spawners, Geometry</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <details class="tier-accordion adv">
        <summary class="accordion-header">
            <span>[Unity 6 Rule] Managing Multiple AudioListeners</span>
            <span class="tier-badge adv">ADVANCED</span>
        </summary>
        <div class="accordion-body">
            Unity throws a warning if more than 1 <code>AudioListener</code> is active simultaneously. Keep the <code>AudioListener</code> on your Main Camera inside <code>_PersistentCore</code>, and make sure any camera inside individual level scenes has its AudioListener component disabled or deleted!
        </div>
    </details>
    `,
    notes: "Explain Git merge conflicts in .unity files. If two people move a tree in the same scene file, Git cannot merge the YAML IDs cleanly. Splitting scenes eliminates this problem."
  },

  // Slide 18: Additive Scene Loading via Code
  {
    title: "Additive Scene Loading via Code",
    content: `
    <div class="content-stack">
        <div class="content-card primary">
            <div class="card-title core">SceneLoader.cs &bull; LoadSceneMode.Additive</div>
            <div class="card-body">
                <div class="code-box">
                    <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                    <pre><code>using System.Collections;
using UnityEngine;
using UnityEngine.SceneManagement;

public class SceneLoader : MonoBehaviour
{
    public static IEnumerator LoadLevelAdditive(string levelSceneName)
    {
        // 1. Load the new level additively (preserves _PersistentCore in RAM)
        AsyncOperation asyncLoad = SceneManager.LoadSceneAsync(levelSceneName, LoadSceneMode.Additive);
        while (!asyncLoad.isDone)
        {
            yield return null;
        }

        // 2. Set the newly loaded scene as active so new Instantiates spawn into it!
        Scene loadedScene = SceneManager.GetSceneByName(levelSceneName);
        if (loadedScene.IsValid())
        {
            SceneManager.SetActiveScene(loadedScene);
        }
    }

    public static IEnumerator UnloadLevel(string levelSceneName)
    {
        AsyncOperation asyncUnload = SceneManager.UnloadSceneAsync(levelSceneName);
        while (!asyncUnload.isDone) yield return null;
    }
}</code></pre>
                </div>
            </div>
        </div>
    </div>
    <details class="tier-accordion core">
        <summary class="accordion-header">
            <span>Why SetActiveScene() is Crucial</span>
            <span class="tier-badge core">CORE</span>
        </summary>
        <div class="accordion-body">
            When multiple scenes are loaded simultaneously, any <code>Instantiate()</code> call spawns the new GameObject into whatever scene is currently marked as the <strong>Active Scene</strong>. Calling <code>SceneManager.SetActiveScene(loadedScene)</code> ensures that spawned enemies or particles stay with their level and unload cleanly!
        </div>
    </details>
    `,
    notes: "Emphasize SetActiveScene(). Without it, newly spawned enemies get placed into _PersistentCore and don't get destroyed when the level unloads!"
  },

  // Slide 19: 10-Minute Architecture Live Coding Challenge
  {
    title: "10-Minute Challenge: Decoupled Score Listener",
    content: `
    <div class="split-layout">
        <div class="left-column">
            <div class="content-card primary">
                <div class="card-title core">Challenge Objective</div>
                <div class="card-body">
                    <p style="font-size: 0.88rem; color: #1e293b; font-weight: 700;">
                        Write a <code>ScoreListener.cs</code> script that:
                    </p>
                    <ol style="font-size: 0.84rem; color: #334155; margin-top: 6px; line-height: 1.5; padding-left: 18px;">
                        <li>Holds a reference to an <code>IntEventChannelSO</code> and a <code>TextMeshProUGUI</code>.</li>
                        <li>Subscribes to the channel in <code>OnEnable()</code>.</li>
                        <li>Unsubscribes from the channel in <code>OnDisable()</code>.</li>
                        <li>Updates the text display to <code>$"Score: {score}"</code> whenever the event fires.</li>
                    </ol>
                    <div style="margin-top: 12px; background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 12px; text-align: center;">
                        <div style="font-size: 0.80rem; color: #1d4ed8; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Live Classroom Timer</div>
                        <div id="challengeTimer" style="font-size: 2.2rem; font-weight: 900; color: #1e40af; font-family: monospace; margin: 4px 0;">10:00</div>
                        <div style="display: flex; gap: 8px; justify-content: center;">
                            <button class="nav-btn" style="background: #0284c7; color: #fff; font-size: 0.76rem;" onclick="startChallengeTimer()">Start</button>
                            <button class="nav-btn" style="background: #64748b; color: #fff; font-size: 0.76rem;" onclick="pauseChallengeTimer()">Pause</button>
                            <button class="nav-btn" style="background: #dc2626; color: #fff; font-size: 0.76rem;" onclick="resetChallengeTimer()">Reset</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="right-column">
            <div class="content-card">
                <div class="card-title core">Solution (Locked for 1 Minute)</div>
                <div class="card-body">
                    <div id="solutionLockBanner" style="background: #fef3c7; border: 1.5px solid #fcd34d; border-radius: 6px; padding: 10px; font-size: 0.80rem; color: #92400e; margin-bottom: 8px;">
                        🔒 Solution unlocks in: <strong id="solutionLockTimer">01:00</strong> (Write your code first!)
                    </div>
                    <details id="solutionDetails" class="tier-accordion core" style="pointer-events: none; opacity: 0.5;">
                        <summary class="accordion-header">
                            <span>ScoreListener.cs Complete Solution</span>
                            <span class="tier-badge core">SOLUTION</span>
                        </summary>
                        <div class="accordion-body">
                            <div class="code-box">
                                <button class="copy-btn" onclick="copyCode(this)">Copy</button>
                                <pre><code>using TMPro;
using UnityEngine;

public class ScoreListener : MonoBehaviour
{
    [SerializeField] private IntEventChannelSO onScoreChangedChannel;
    [SerializeField] private TextMeshProUGUI scoreText;

    private void OnEnable()
    {
        if (onScoreChangedChannel != null)
            onScoreChangedChannel.RegisterListener(UpdateScore);
    }

    private void OnDisable()
    {
        if (onScoreChangedChannel != null)
            onScoreChangedChannel.UnregisterListener(UpdateScore);
    }

    private void UpdateScore(int newScore)
    {
        if (scoreText != null)
            scoreText.text = $"Score: {newScore:N0}";
    }
}</code></pre>
                            </div>
                        </div>
                    </details>
                </div>
            </div>
        </div>
    </div>
    `,
    notes: "Give students 10 minutes to code this in their projects. Walk the classroom to check their OnEnable and OnDisable unsubscription pairing."
  },

  // Slide 20: Summary, Best Practices & Assignment Checklist
  {
    title: "Summary & Class 4 Assignment Checklist",
    content: `
    <div class="content-stack">
        <div class="content-card primary">
            <div class="card-title core">Core Takeaways for Production Architecture</div>
            <div class="card-body">
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 0.84rem;">
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
                        <span style="font-weight: 800; color: #0284c7;">✓ Prefab Encapsulation:</span>
                        <p style="color: #475569; margin-top: 4px;">Never reach into child sprites or hitboxes. The root script is the only API.</p>
                    </div>
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
                        <span style="font-weight: 800; color: #059669;">✓ ScriptableObject Channels:</span>
                        <p style="color: #475569; margin-top: 4px;">Broadcast events into neutral project assets. Zero coupling to UI or Audio.</p>
                    </div>
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
                        <span style="font-weight: 800; color: #d97706;">✓ Lifecycle Safety:</span>
                        <p style="color: #475569; margin-top: 4px;">Always pair <code>RegisterListener</code> in <code>OnEnable</code> with <code>UnregisterListener</code> in <code>OnDisable</code>.</p>
                    </div>
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
                        <span style="font-weight: 800; color: #7c3aed;">✓ Additive Multi-Scene:</span>
                        <p style="color: #475569; margin-top: 4px;">Keep persistent systems in <code>_PersistentCore</code> to avoid Git scene merge conflicts.</p>
                    </div>
                </div>

                <div style="margin-top: 12px; background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 10px 14px;">
                    <div style="font-weight: 800; color: #1e40af; font-size: 0.88rem;">Class 4 Assignment Guide:</div>
                    <p style="font-size: 0.82rem; color: #1e3a8a; margin-top: 2px;">
                        Open <a class="slide-url" href="../classes/04_architecture.md" target="_blank">classes/04_architecture.md</a> for complete milestone steps, code snippets, and team checklist!
                    </p>
                </div>
            </div>
        </div>
    </div>
    `,
    notes: "Wrap up the lecture. Direct all students to classes/04_architecture.md to start implementing their 4 milestones."
  }
];

// Read styling and base template from Basics 3
const b3Path = path.resolve('presentation_basics3/presentation_unity6_basics3.html');
const b3Html = fs.readFileSync(b3Path, 'utf8');

// Extract CSS up to </style>
const cssMatch = b3Html.match(/<style>([\s\S]*?)<\/style>/);
const baseCss = cssMatch ? cssMatch[1] : '';

// Build interactive simulator JS functions
const simulatorJs = `
        // ==========================================
        // CLASS 4 INTERACTIVE SIMULATORS & CHALLENGES
        // ==========================================

        // 1. Prefab Encapsulation Violation Inspector
        function inspectPattern(type) {
            const diag = document.getElementById('inspectorDiagnosis');
            if (!diag) return;

            if (type === 1) {
                diag.innerHTML = \`
                    <div style="color: #dc2626; font-weight: 900; font-size: 1.05rem; margin-bottom: 6px;">❌ SEVERE VIOLATION (Fragile String Lookup)</div>
                    <p style="font-size: 0.84rem; color: #7f1d1d; line-height: 1.45;">
                        <code>enemy.transform.Find("Sprite").GetComponent...</code> searches the child hierarchy by hardcoded string path. If an artist renames "Sprite" to "Body" or moves it into a pivot group, your game throws <strong>NullReferenceException</strong> at runtime!
                    </p>
                    <div style="margin-top: 8px; font-size: 0.78rem; background: #fef2f2; border: 1px dashed #ef4444; padding: 6px; border-radius: 4px; color: #991b1b;">
                        Fix: Expose <code>enemy.SetVisualColor(Color c)</code> on the root script.
                    </div>
                \`;
            } else if (type === 2) {
                diag.innerHTML = \`
                    <div style="color: #dc2626; font-weight: 900; font-size: 1.05rem; margin-bottom: 6px;">❌ MODERATE VIOLATION (Encapsulation Leak)</div>
                    <p style="font-size: 0.84rem; color: #7f1d1d; line-height: 1.45;">
                        <code>enemy.GetComponentInChildren&lt;AudioSource&gt;().Play()</code> breaks encapsulation. External weapons or triggers should not know what audio components an enemy has or control their playback directly.
                    </p>
                    <div style="margin-top: 8px; font-size: 0.78rem; background: #fef2f2; border: 1px dashed #ef4444; padding: 6px; border-radius: 4px; color: #991b1b;">
                        Fix: Call <code>enemy.TakeDamage(10)</code> and let the enemy handle its own audio internally!
                    </div>
                \`;
            } else if (type === 3) {
                diag.innerHTML = \`
                    <div style="color: #16a34a; font-weight: 900; font-size: 1.05rem; margin-bottom: 6px;">✅ CLEAN API (Black Box Contract)</div>
                    <p style="font-size: 0.84rem; color: #14532d; line-height: 1.45;">
                        <code>enemy.TakeDamage(25)</code> is the gold standard! The caller expresses <strong>intent</strong> without knowing whether the enemy has a SpriteRenderer, an Animator, or a 3D SkinnedMeshRenderer.
                    </p>
                    <div style="margin-top: 8px; font-size: 0.78rem; background: #f0fdf4; border: 1px dashed #22c55e; padding: 6px; border-radius: 4px; color: #15803d;">
                        Benefit: Artists can redesign the entire enemy hierarchy without breaking any weapon or spawner scripts!
                    </div>
                \`;
            } else if (type === 4) {
                diag.innerHTML = \`
                    <div style="color: #16a34a; font-weight: 900; font-size: 1.05rem; margin-bottom: 6px;">✅ CLEAN API (High-Level Spawner Contract)</div>
                    <p style="font-size: 0.84rem; color: #14532d; line-height: 1.45;">
                        <code>spawner.SpawnWave(enemyPrefab)</code> delegates wave management to a dedicated spawner without coupling enemies directly to wave counts or game state.
                    </p>
                    <div style="margin-top: 8px; font-size: 0.78rem; background: #f0fdf4; border: 1px dashed #22c55e; padding: 6px; border-radius: 4px; color: #15803d;">
                        Benefit: Spawner can be tested in an empty scene with dummy prefabs.
                    </div>
                \`;
            }
        }

        // 2. ScriptableObject Event Channel Bus Simulator
        let simCurrentHp = 100;
        let simCurrentScore = 0;

        function updateSubs() {
            const hUi = document.getElementById('chkHealthUI');
            const aud = document.getElementById('chkAudio');
            const sco = document.getElementById('chkScore');
            
            let hCount = (hUi && hUi.checked ? 1 : 0) + (aud && aud.checked ? 1 : 0);
            let cCount = (sco && sco.checked ? 1 : 0) + (aud && aud.checked ? 1 : 0);

            const countElH = document.getElementById('subCountHealth');
            const countElC = document.getElementById('subCountCoin');
            if (countElH) countElH.textContent = hCount + ' Listeners';
            if (countElC) countElC.textContent = cCount + ' Listeners';
        }

        function triggerChannelPulse(channelId) {
            const pulse = document.getElementById(channelId);
            if (!pulse) return;
            pulse.style.background = '#38bdf8';
            pulse.style.boxShadow = '0 0 10px #38bdf8';
            setTimeout(() => {
                pulse.style.background = '#475569';
                pulse.style.boxShadow = 'none';
            }, 350);
        }

        function simDamage(amount) {
            simCurrentHp = Math.max(0, simCurrentHp - amount);
            document.getElementById('simHpText').textContent = simCurrentHp;
            triggerChannelPulse('pulseHealth');

            const hUi = document.getElementById('chkHealthUI');
            const aud = document.getElementById('chkAudio');
            const bar = document.getElementById('simHpBar');
            const wave = document.getElementById('simAudioWave');
            const log = document.getElementById('simLog');

            if (bar && hUi && hUi.checked) {
                bar.style.width = simCurrentHp + '%';
                if (simCurrentHp <= 25) bar.style.background = '#ef4444';
                else if (simCurrentHp <= 50) bar.style.background = '#f59e0b';
                else bar.style.background = '#22c55e';
            }

            if (wave && aud && aud.checked) {
                wave.innerHTML = '🔊 <strong style="color: #ef4444;">Playing: Hurt_SFX.wav</strong>';
                setTimeout(() => { if (wave) wave.innerHTML = '🔊 Idle'; }, 1000);
            }

            if (log) {
                log.textContent = '[Event Raised] OnHealthChangedSO.RaiseEvent(' + simCurrentHp + ') -> Broadcaster fired cleanly with zero direct references!';
            }
        }

        function simHeal(amount) {
            simCurrentHp = Math.min(100, simCurrentHp + amount);
            document.getElementById('simHpText').textContent = simCurrentHp;
            triggerChannelPulse('pulseHealth');

            const hUi = document.getElementById('chkHealthUI');
            const bar = document.getElementById('simHpBar');
            const log = document.getElementById('simLog');

            if (bar && hUi && hUi.checked) {
                bar.style.width = simCurrentHp + '%';
                if (simCurrentHp > 50) bar.style.background = '#22c55e';
            }

            if (log) {
                log.textContent = '[Event Raised] OnHealthChangedSO.RaiseEvent(' + simCurrentHp + ') -> Health restored to ' + simCurrentHp + '!';
            }
        }

        function simCollectCoin(pts) {
            simCurrentScore += pts;
            triggerChannelPulse('pulseCoin');

            const sco = document.getElementById('chkScore');
            const aud = document.getElementById('chkAudio');
            const scoreText = document.getElementById('simScoreText');
            const wave = document.getElementById('simAudioWave');
            const log = document.getElementById('simLog');

            if (scoreText && sco && sco.checked) {
                scoreText.textContent = 'Score: ' + simCurrentScore + ' pts';
            }

            if (wave && aud && aud.checked) {
                wave.innerHTML = '🔊 <strong style="color: #fbbf24;">Playing: Coin_Pickup.wav</strong>';
                setTimeout(() => { if (wave) wave.innerHTML = '🔊 Idle'; }, 1000);
            }

            if (log) {
                log.textContent = '[Event Raised] OnScoreChangedSO.RaiseEvent(' + simCurrentScore + ') -> Score updated cleanly!';
            }
        }

        function simResetPlayer() {
            simCurrentHp = 100;
            simCurrentScore = 0;
            document.getElementById('simHpText').textContent = '100';
            const bar = document.getElementById('simHpBar');
            if (bar) { bar.style.width = '100%'; bar.style.background = '#22c55e'; }
            const scoreText = document.getElementById('simScoreText');
            if (scoreText) scoreText.textContent = 'Score: 0 pts';
            const log = document.getElementById('simLog');
            if (log) log.textContent = '[Reset] Player and channels reset to initial state.';
        }

        // 3. 10-Minute Challenge Countdown & Solution Unlock
        let timerSeconds = 600;
        let lockSeconds = 60;
        let timerInterval = null;
        let lockInterval = null;

        function formatTime(sec) {
            const m = Math.floor(sec / 60).toString().padStart(2, '0');
            const s = (sec % 60).toString().padStart(2, '0');
            return m + ':' + s;
        }

        function startChallengeTimer() {
            if (timerInterval) return;
            timerInterval = setInterval(() => {
                if (timerSeconds > 0) {
                    timerSeconds--;
                    const el = document.getElementById('challengeTimer');
                    if (el) el.textContent = formatTime(timerSeconds);
                } else {
                    clearInterval(timerInterval);
                    timerInterval = null;
                }
            }, 1000);

            if (!lockInterval && lockSeconds > 0) {
                lockInterval = setInterval(() => {
                    if (lockSeconds > 0) {
                        lockSeconds--;
                        const lockEl = document.getElementById('solutionLockTimer');
                        if (lockEl) lockEl.textContent = formatTime(lockSeconds);
                    } else {
                        clearInterval(lockInterval);
                        lockInterval = null;
                        unlockSolution();
                    }
                }, 1000);
            }
        }

        function pauseChallengeTimer() {
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
            if (lockInterval) {
                clearInterval(lockInterval);
                lockInterval = null;
            }
        }

        function resetChallengeTimer() {
            pauseChallengeTimer();
            timerSeconds = 600;
            lockSeconds = 60;
            const el = document.getElementById('challengeTimer');
            if (el) el.textContent = '10:00';
            const lockEl = document.getElementById('solutionLockTimer');
            if (lockEl) lockEl.textContent = '01:00';
            const banner = document.getElementById('solutionLockBanner');
            if (banner) {
                banner.style.display = 'block';
                banner.innerHTML = '🔒 Solution unlocks in: <strong id="solutionLockTimer">01:00</strong> (Write your code first!)';
            }
            const sol = document.getElementById('solutionDetails');
            if (sol) {
                sol.style.pointerEvents = 'none';
                sol.style.opacity = '0.5';
                sol.removeAttribute('open');
            }
        }

        function unlockSolution() {
            const banner = document.getElementById('solutionLockBanner');
            if (banner) {
                banner.style.background = '#dcfce7';
                banner.style.borderColor = '#86efac';
                banner.style.color = '#15803d';
                banner.innerHTML = '🔓 <strong>Solution Unlocked!</strong> Click below to verify your implementation.';
            }
            const sol = document.getElementById('solutionDetails');
            if (sol) {
                sol.style.pointerEvents = 'auto';
                sol.style.opacity = '1';
            }
        }
`;

// Build drawer items
let drawerItemsHtml = '';
slidesData.forEach((s, idx) => {
    const num = (idx + 1).toString().padStart(2, '0');
    drawerItemsHtml += `
    <div class="drawer-item ${idx === 0 ? 'active' : ''}" onclick="goToSlide(${idx})">
        <span class="drawer-num">${num}</span>
        <span class="drawer-title">${s.title.replace(/^Dev - /, '')}</span>
    </div>`;
});

// Build slides HTML
let slidesHtml = '';
slidesData.forEach((s, idx) => {
    const num = (idx + 1).toString().padStart(2, '0');
    let slideContent = '';

    if (s.isHero) {
        slideContent = `
        <div class="hero-layout">
            <div class="hero-header">
                <div class="hero-tag">UNITY 6 &bull; LESSON 04</div>
                <div class="hero-title">${s.title}</div>
                <div class="hero-subtitle">${s.subtitle}</div>
            </div>
            <div class="hero-topics">
                ${s.topics.map(t => `<div class="topic-item"><span class="topic-dot"></span><span>${t}</span></div>`).join('')}
            </div>
            <div style="margin-top: 14px; background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 10px 16px; font-size: 0.84rem; color: #94a3b8; display: flex; justify-content: space-between; align-items: center;">
                <span>Press <strong>[T]</strong> for Teacher Mode (PIN 7331) &bull; <strong>[N]</strong> for Presenter Notes &bull; <strong>[L]</strong> for Lecture Mode</span>
                <span style="color: #38bdf8; font-weight: 800;">Minor GDD &bull; Hogeschool Rotterdam</span>
            </div>
        </div>`;
    } else {
        slideContent = `
        <div class="slide-header">
            <div class="slide-num-badge">SLIDE ${num} / 20</div>
            <div class="slide-main-title">${s.title}</div>
        </div>
        <div class="slide-body-container">
            ${s.content}
        </div>`;
    }

    slidesHtml += `
    <div class="slide-card ${idx === 0 ? 'active' : ''}" id="slide-${idx}">
        ${slideContent}
    </div>`;
});

// Assemble the complete HTML
const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dev - Basics 4: Game Architecture 1 – Decoupling &amp; ScriptableObject Architecture</title>
    <link rel="icon" type="image/png" href="assets/mario.png">
    <style>
${baseCss}
    </style>
</head>
<body class="projector-mode">
    <!-- Top Bar -->
    <header class="top-bar">
        <div class="brand-title">
            <span style="background: var(--hr-red); color: #fff; padding: 2px 7px; border-radius: 4px; font-size: 0.76rem; font-weight: 900;">HR</span>
            <span>Basics 4: Game Architecture 1</span>
        </div>
        <div class="tier-selector">
            <button class="tier-btn active-all" onclick="filterTier('all')">ALL</button>
            <button class="tier-btn" onclick="filterTier('core')">CORE</button>
            <button class="tier-btn" onclick="filterTier('adv')">ADV</button>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
            <button class="nav-btn" onclick="toggleTeacherMode()" title="Teacher Mode [T]">👨‍🏫 <span id="teacherBtnText">Teacher</span></button>
            <button class="nav-btn" onclick="openNotesModal()" title="Presenter Notes [N]">📝 Notes</button>
            <button class="nav-btn" onclick="openHelpModal()" title="Shortcuts [?]">❓</button>
        </div>
    </header>

    <!-- Main Workspace -->
    <div class="main-workspace">
        <!-- Slide Drawer -->
        <aside class="slide-drawer" id="slideDrawer">
${drawerItemsHtml}
        </aside>

        <!-- Stage Area -->
        <main class="stage-area" id="stageArea">
            <div class="slide-viewport" id="slideViewport">
${slidesHtml}
            </div>
            <div class="pace-speed-bubble" id="paceBubble" onclick="teacherClearFlags()">0</div>
        </main>
    </div>

    <!-- Bottom Bar -->
    <footer class="bottom-bar">
        <div style="display: flex; align-items: center; gap: 10px;">
            <button class="nav-btn" id="prevBtn" onclick="prevSlide()">&larr; Prev</button>
            <span class="slide-counter" id="slideCounter">Slide 01 / 20</span>
            <button class="nav-btn" id="nextBtn" onclick="nextSlide()">Next &rarr;</button>
        </div>

        <div class="viewmode-toggle">
            <button class="viewmode-btn active" id="btnProjector" onclick="setViewMode('projector')">Projector</button>
            <button class="viewmode-btn" id="btnLab" onclick="setViewMode('lab')">Lab Mode</button>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
            <button class="btn-clear-flags" id="btnClearFlags" onclick="teacherClearFlags()">Clear Flags (0)</button>
            <button class="btn-flag-pace" id="btnFlagPace" onclick="togglePaceFlag()">
                <span class="dot-indicator"></span> Too Fast?
            </button>
            <button class="nav-btn" onclick="toggleFullscreen()" title="Fullscreen [F]">⛶</button>
        </div>
    </footer>

    <!-- Presenter Notes Modal -->
    <div class="modal-backdrop" id="notesModal" onclick="closeNotesModal(event)">
        <div class="modal-card" onclick="event.stopPropagation()">
            <div class="modal-header">
                <div class="modal-title">Presenter Notes - Slide <span id="notesSlideNum">01</span></div>
                <button class="help-close-btn" onclick="closeNotesModal()">&times;</button>
            </div>
            <div class="modal-body" id="notesContent"></div>
        </div>
    </div>

    <!-- Shortcuts Modal -->
    <div class="modal-backdrop" id="helpModal" onclick="closeHelpModal(event)">
        <div class="modal-card" onclick="event.stopPropagation()">
            <div class="modal-header">
                <div class="modal-title">Keyboard Shortcuts</div>
                <button class="help-close-btn" onclick="closeHelpModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="help-grid">
                    <div class="help-row"><span>Next Slide</span> <div><kbd>&rarr;</kbd> or <kbd>Space</kbd></div></div>
                    <div class="help-row"><span>Previous Slide</span> <div><kbd>&larr;</kbd> or <kbd>Backspace</kbd></div></div>
                    <div class="help-row"><span>Presenter Notes</span> <div><kbd>N</kbd></div></div>
                    <div class="help-row"><span>Teacher Mode</span> <div><kbd>T</kbd> (PIN 7331)</div></div>
                    <div class="help-row"><span>Toggle Lab Mode</span> <div><kbd>L</kbd></div></div>
                    <div class="help-row"><span>Toggle Fullscreen</span> <div><kbd>F</kbd></div></div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let slidesData = ${JSON.stringify(slidesData, null, 2)};
        let currentSlide = 0;
        let isTeacherMode = false;
        let paceFlagged = false;
        let paceCount = 0;

        function init() {
            showSlide(0);
            document.addEventListener('keydown', handleKey);
        }

        function showSlide(index) {
            if (index < 0 || index >= slidesData.length) return;
            currentSlide = index;

            document.querySelectorAll('.slide-card').forEach((card, idx) => {
                card.classList.toggle('active', idx === currentSlide);
            });

            document.querySelectorAll('.drawer-item').forEach((item, idx) => {
                item.classList.toggle('active', idx === currentSlide);
            });

            const counter = document.getElementById('slideCounter');
            if (counter) counter.textContent = 'Slide ' + (currentSlide + 1).toString().padStart(2, '0') + ' / ' + slidesData.length;

            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            if (prevBtn) prevBtn.disabled = currentSlide === 0;
            if (nextBtn) nextBtn.disabled = currentSlide === slidesData.length - 1;

            updateNotes();
        }

        function nextSlide() { showSlide(currentSlide + 1); }
        function prevSlide() { showSlide(currentSlide - 1); }
        function goToSlide(idx) { showSlide(idx); }

        function handleKey(e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
                e.preventDefault();
                nextSlide();
            } else if (e.key === 'ArrowLeft' || e.key === 'Backspace' || e.key === 'PageUp') {
                e.preventDefault();
                prevSlide();
            } else if (e.key === 'n' || e.key === 'N') {
                toggleNotesModal();
            } else if (e.key === 't' || e.key === 'T') {
                toggleTeacherMode();
            } else if (e.key === 'l' || e.key === 'L') {
                toggleLabMode();
            } else if (e.key === 'f' || e.key === 'F') {
                toggleFullscreen();
            } else if (e.key === '?') {
                openHelpModal();
            }
        }

        function setViewMode(mode) {
            const btnP = document.getElementById('btnProjector');
            const btnL = document.getElementById('btnLab');
            if (mode === 'projector') {
                document.body.classList.add('projector-mode');
                document.body.classList.remove('lab-mode');
                if (btnP) btnP.classList.add('active');
                if (btnL) btnL.classList.remove('active');
            } else {
                document.body.classList.remove('projector-mode');
                document.body.classList.add('lab-mode');
                if (btnP) btnP.classList.remove('active');
                if (btnL) btnL.classList.add('active');
            }
        }

        function toggleLabMode() {
            if (document.body.classList.contains('lab-mode')) setViewMode('projector');
            else setViewMode('lab');
        }

        function toggleTeacherMode() {
            if (isTeacherMode) {
                isTeacherMode = false;
                alert('Teacher Mode disabled.');
                document.getElementById('teacherBtnText').textContent = 'Teacher';
                document.body.classList.remove('teacher-unlocked');
            } else {
                const pin = prompt('Enter Teacher Mode PIN:');
                if (pin === '7331') {
                    isTeacherMode = true;
                    alert('Teacher Mode unlocked!');
                    document.getElementById('teacherBtnText').textContent = 'Teacher ✓';
                    document.body.classList.add('teacher-unlocked');
                } else if (pin !== null) {
                    alert('Incorrect PIN.');
                }
            }
        }

        function updateNotes() {
            const slide = slidesData[currentSlide];
            const numEl = document.getElementById('notesSlideNum');
            const contentEl = document.getElementById('notesContent');
            if (numEl) numEl.textContent = (currentSlide + 1).toString().padStart(2, '0');
            if (contentEl) contentEl.innerHTML = slide.notes ? '<p>' + slide.notes + '</p>' : '<p>No specific notes for this slide.</p>';
        }

        function openNotesModal() {
            updateNotes();
            const modal = document.getElementById('notesModal');
            if (modal) modal.classList.add('visible');
        }

        function closeNotesModal() {
            const modal = document.getElementById('notesModal');
            if (modal) modal.classList.remove('visible');
        }

        function toggleNotesModal() {
            const modal = document.getElementById('notesModal');
            if (modal && modal.classList.contains('visible')) closeNotesModal();
            else openNotesModal();
        }

        function openHelpModal() {
            const modal = document.getElementById('helpModal');
            if (modal) modal.classList.add('visible');
        }

        function closeHelpModal() {
            const modal = document.getElementById('helpModal');
            if (modal) modal.classList.remove('visible');
        }

        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
            } else {
                document.exitFullscreen().catch(() => {});
            }
        }

        function copyCode(btn) {
            const pre = btn.parentElement.querySelector('pre');
            if (!pre) return;
            navigator.clipboard.writeText(pre.innerText).then(() => {
                const orig = btn.textContent;
                btn.textContent = 'Copied!';
                setTimeout(() => btn.textContent = orig, 1500);
            });
        }

        function togglePaceFlag() {
            paceFlagged = !paceFlagged;
            const btn = document.getElementById('btnFlagPace');
            if (btn) {
                if (paceFlagged) {
                    btn.style.borderColor = '#f59e0b';
                    btn.style.color = '#f59e0b';
                    paceCount++;
                } else {
                    btn.style.borderColor = '#243049';
                    btn.style.color = '#cbd5e1';
                    paceCount = Math.max(0, paceCount - 1);
                }
            }
            updatePaceBubble();
        }

        function updatePaceBubble() {
            const bubble = document.getElementById('paceBubble');
            const clearBtn = document.getElementById('btnClearFlags');
            if (bubble) {
                bubble.textContent = paceCount;
                bubble.classList.toggle('visible', paceCount > 0);
            }
            if (clearBtn) {
                clearBtn.textContent = 'Clear Flags (' + paceCount + ')';
                clearBtn.classList.toggle('visible', paceCount > 0);
            }
        }

        function teacherClearFlags() {
            paceCount = 0;
            paceFlagged = false;
            const btn = document.getElementById('btnFlagPace');
            if (btn) {
                btn.style.borderColor = '#243049';
                btn.style.color = '#cbd5e1';
            }
            updatePaceBubble();
        }

        function filterTier(tier) {
            document.querySelectorAll('.tier-btn').forEach(btn => {
                btn.className = 'tier-btn';
            });
            if (tier === 'all') {
                event.target.classList.add('active-all');
                document.querySelectorAll('.tier-accordion').forEach(el => el.style.display = 'block');
            } else if (tier === 'core') {
                event.target.classList.add('active-core');
                document.querySelectorAll('.tier-accordion.core').forEach(el => el.style.display = 'block');
                document.querySelectorAll('.tier-accordion.adv').forEach(el => el.style.display = 'none');
            } else if (tier === 'adv') {
                event.target.classList.add('active-adv');
                document.querySelectorAll('.tier-accordion.core').forEach(el => el.style.display = 'none');
                document.querySelectorAll('.tier-accordion.adv').forEach(el => el.style.display = 'block');
            }
        }

${simulatorJs}

        window.onload = init;
    </script>
</body>
</html>
`;

// Write to files
const outPath = path.resolve('presentation_basics4/presentation_unity6_basics4.html');
const indexPath = path.resolve('presentation_basics4/index.html');
const docsOutPath = path.resolve('docs/presentation_basics4/presentation_unity6_basics4.html');
const docsIndexPath = path.resolve('docs/presentation_basics4/index.html');

fs.writeFileSync(outPath, fullHtml, 'utf8');
fs.writeFileSync(indexPath, fullHtml, 'utf8');

if (fs.existsSync(path.resolve('docs/presentation_basics4'))) {
    fs.writeFileSync(docsOutPath, fullHtml, 'utf8');
    fs.writeFileSync(docsIndexPath, fullHtml, 'utf8');
}

console.log('Successfully generated:');
console.log(' - ' + outPath + ' (' + fs.statSync(outPath).size + ' bytes)');
console.log(' - ' + indexPath + ' (' + fs.statSync(indexPath).size + ' bytes)');
if (fs.existsSync(docsIndexPath)) {
    console.log(' - ' + docsOutPath + ' (' + fs.statSync(docsOutPath).size + ' bytes)');
    console.log(' - ' + docsIndexPath + ' (' + fs.statSync(docsIndexPath).size + ' bytes)');
}
